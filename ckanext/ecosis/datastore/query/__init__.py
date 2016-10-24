import re, pymongo, json, dateutil
from pylons import config

from ckanext.ecosis.datastore.ckan import package as ckanPackageQuery
from ckanext.ecosis.datastore.ckan import resource as ckanResourceQuery
from ckanext.ecosis.datastore.vocab import usda
from ckanext.ecosis.datastore.vocab import controlled as controlledVocab
from ckanext.ecosis.datastore.utils import mongo
from ckanext.ecosis.lib import utils
import workspace

'''
Query ecosis workspace collections
'''

collections = None
host = ""

# inject global dependencies
def init(co, hostUrl):
    global collections, host

    collections = co
    host = hostUrl
    workspace.init(co, getResource, isPushed)

# get a spectra at a specific index.
def get(packageId="", resourceId=None, sheetId=None, index=0, showProcessInfo=False, must_be_valid=False, clean_wavelengths=True):
    # build out query
    query = {
        "type" : "data",
        "packageId" : packageId
    }

    # you can limit by resource and sheet id if you want
    if resourceId is not None:
        query["resourceId"] = resourceId
    if sheetId is not None:
        query["sheetId"] = sheetId

    # get spectra at index
    main = collections.get('spectra').find_one(query, skip=index, sort=[("index", pymongo.ASCENDING)])

    if main == None:
        raise Exception('Unabled to get spectra from package_id: %s at index %s' % (packageId, index))

    # the collection also contains config information about the spectra, just grab to spectra attribute
    spectra = main.get('spectra')

    # this also replaces , with .
    # also moves measurement waveslength keys to 'datapoints' object
    moveWavelengths(spectra, clean_wavelengths)

    if must_be_valid:
        if 'datapoints' not in spectra:
            return {}
        if len(spectra['datapoints']) == 0:
            return {}

    # get information for the sheet this spectra came from
    sheetInfo = collections.get('resource').find_one({
        "packageId": packageId,
        "resourceId": main.get("resourceId"),
        "sheetId" : main.get("sheetId")
    })

    # get package information for the package this spectra came from
    package = ckanPackageQuery.get(packageId)

    attributeProcessInfo = []

    # join together metadata to this spectra
    join(packageId, spectra, attributeProcessInfo)

    config = collections.get('package').find_one({"packageId": packageId})
    if config == None:
        config = {}

    # set the spectra attribute aliases
    mapNames(spectra, config, attributeProcessInfo, package)

    # lookup any usda code given
    usda.setCodes(spectra, info=attributeProcessInfo)

    # strip controlled vocab fields.  Remove any values that are not part of the controlled
    # vocabulary
    controlledVocab.enforce(spectra)

    # add 'spectra.ecosis' attribute with package and sheet info
    if showProcessInfo:
        addEcosisNamespace(spectra, package, main, sheetInfo, processInfo=attributeProcessInfo)
    else:
        addEcosisNamespace(spectra, package, main, sheetInfo)

    # set the sort information.  This data needs to be of the correct type (string, number, date) for
    # proper sorting in mongodb
    setSort(spectra, config, package)

    # set the location information.  Needs to be proper geojson if it's going to be used
    setLocation(spectra)

    # set photo
    setPhoto(packageId, spectra)

    return spectra

# just like get spectra, but retrieves a row or column of metadata
def getMetadataChunk(packageId, resourceId=None, sheetId=None, index=0):
    query = {
        "type" : "metadata",
        "packageId" : packageId
    }

    # add additional query parameters
    if resourceId is not None:
        query['resourceId'] = resourceId
    if sheetId is not None:
        query['sheetId'] = sheetId

    # grab metadata chunk at given index
    chunk = collections.get('spectra').find_one(query, skip=index, sort=[("index", pymongo.ASCENDING)])
    if chunk is None:
        raise Exception('Invalid resource ids given')

    # grab the sheet information
    del query['type']
    sheetInfo = collections.get('resource').find_one(query)

    # now look up information about what spectra we are joining to
    joinedNames = []
    joinOn = sheetInfo.get("joinOn")

    if sheetInfo is not None and joinOn is not None and joinOn != "" and chunk.get('spectra') is not None:
        # now make join query
        joinQuery = {
            "type" : "data",
            "packageId" : packageId
        }

        # we are going to find all spectra that have the 'joinOn' attribute equal to this metadata
        # chunks value.
        joinQuery['spectra.%s' % sheetInfo.get("joinOn")] = chunk.get('spectra')[sheetInfo.get("joinOn")]

        # run query
        joined = collections.get('spectra').find(joinQuery)

        # for all results, append sheet information to the 'joinedNames' resources array.
        for r in joined:
            # TODO: is there a better way to get the actual 'name' of a resource?
            joinedInfo = collections.get('resource').find_one(
                {
                    'resourceId': r.get('resourceId'),
                    'sheetId': r.get('sheetId')
                },
                {"layout": 1,"name": 1})


            if joinedInfo is None: # Badness
                joinedName = {}
                joinedInfo = {}
            elif 'name' in joinedInfo:
                joinedName = joinedInfo
            else: # if no name is provided in workspace, fallback to postgres
                try:
                    joinedName = ckanResourceQuery.get(r.get('resourceId'))
                except:
                    joinedName = {}

            # add information about which spectra this chunk joins to
            if joinedName is not None:
                joinedNames.append({
                    "resourceId" : r.get('resourceId'),
                    "sheetId" : r.get('sheetId'),
                    "name" : joinedName.get('name'),
                    "layout" : joinedInfo.get('layout'),
                    "index" : r.get("index")
                })

    # set photo
    setPhoto(packageId, chunk.get('spectra'))

    # return metadata and join information
    return {
        "metadata" : chunk.get('spectra'),
        "joinedResources" : joinedNames,
        "joinKey" : sheetInfo.get("joinOn")
    }

# get all metadata information for a sheet
# get number of chunks and number of joined chunks
def getMetadataInfo(packageId, resourceId=None, sheetId=None):
    query = {
        "packageId" : packageId
    }

    # add additional query parameters
    if resourceId is not None:
        query['resourceId'] = resourceId
    if sheetId is not None:
        query['sheetId'] = sheetId

    sheetInfo = collections.get('resource').find_one(query)
    if sheetInfo is None:
        raise Exception('No resource found')

    query['type'] = "metadata"

    # get all distinct join values
    attrs = mongo.distinct(collections.get('spectra'), 'spectra.%s' % sheetInfo.get('joinOn'), query)
    # get total number of metadata rows or columns
    total = mongo.count(collections.get('spectra'), query)

    query = {
        "packageId" : packageId,
        "type" : "data"
    }
    query['spectra.%s' % sheetInfo.get('joinOn')] = {
        "$in" : attrs
    }

    # get the number of spectra that match to this sheet
    return {
        "joinCount": mongo.count(collections.get('spectra'), query),
        "total" : total
    }

# get total number of rows/cols for a sheet
def total(packageId, resourceId=None, sheetId=None):
    query = {
        "type" : "data",
        "packageId" : packageId
    }

    if resourceId is not None:
        query['resourceId'] = resourceId
    if sheetId is not None:
        query['sheetId'] = sheetId

    # need to support 2.8 drive cause pythons 3.0 seems to be a POS
    return {"total" : mongo.count(collections.get('spectra'), query)}

# if the spectra has a 'photo' attribute see if it's a name of a resource file,
# if so, set the download URL as the value
def setPhoto(packageId, spectra):
    if spectra is None:
        return

    photoKey = None
    for key in spectra:
        if utils.flatten(key) == 'photo':
            photoKey = key
            break

    if photoKey is None:
        return

    if photoKey != 'photo':
        spectra['photo'] = spectra[photoKey]
        del spectra[photoKey]

    if re.match(r'^https?', spectra['photo'], re.I):
        return

    spectra['photo'] = "%s/ecosis/resource/byname/%s/%s" % (config.get('ckan.site_url'), packageId, spectra['photo'])


# make sure location information for spectra is valid geojson
# if this is not valid, mongodb will not allow it to be inserted (geoindex)
def setLocation(spectra):
    if spectra.get('geojson') != None:
        js = json.loads(spectra['geojson'])

        # extract geometry from feature
        if js.get("type") == "Feature":
            spectra['ecosis']['geojson'] = js.get('geometry')

        # extract geometries from feature collection in geo collection
        elif js.get("type") == "FeatureCollection":
            result ={
                "type": "GeometryCollection",
                "geometries": []
            }

            for f in js.get("features"):
                result['geometries'].append(f.get("geometry"))
            spectra['ecosis']['geojson'] = result

        # else we should be good to just add the geometry
        else:
             spectra['ecosis']['geojson'] = js

        del spectra['geojson']
    elif spectra.get('Latitude') != None and spectra.get('Longitude') != None:
        try:
            spectra['ecosis']['geojson'] = {
                "type" : "Point",
                "coordinates": [
                    float(spectra.get('Longitude')),
                    float(spectra.get('Latitude'))
                ]
            }
        except:
            pass
    elif spectra.get('latitude') != None and spectra.get('longitude') != None:
        try:
            spectra['ecosis']['geojson'] = {
                "type" : "Point",
                "coordinates": [
                    float(spectra.get('longitude')),
                    float(spectra.get('latitude'))
                ]
            }
        except:
            pass

# set sort value as correct type (string, number, date)
# dates need to be ISO strings
def setSort(spectra, config, package):
    sort = None

    # backword compatibility.  But moving away from config object
    # all 'advanced data' should be stored in package
    extras = package.get('extras')
    if extras != None and extras.get('sort') != None:
        sort = json.loads(extras.get('sort'))
    elif config.get("sort") != None:
        sort = config.get("sort")

    if sort == None:
        return

    on = sort.get('on')
    type = sort.get('type')

    if on is None:
        return

    if on not in spectra:
        return

    if type == 'datetime':
        try:
            spectra['ecosis']['sort'] = dateutil.parser.parse(spectra[on])
        except:
            pass
    elif type == 'numeric':
        try:
            spectra['ecosis']['sort'] = float(spectra[on])
        except:
            pass
    else:
        spectra['ecosis']['sort'] = spectra[on]

# append the .ecosis attribute to a spectra given sheet and dataset information
def addEcosisNamespace(spectra, package, main, sheetInfo, processInfo=None):
    name = sheetInfo.get('name')

    # fall back to postgres if we don't have a name
    if name is None and sheetInfo.get('fromZip') != True:
        resource = ckanResourceQuery.get(sheetInfo.get('resourceId'))
        name = resource.get('name')

    # append sheet and package information
    ecosis = {
        'package_id': sheetInfo.get("packageId"),
        'package_title': package.get('title'),
        'resource_id' : main.get('resourceId'),
        'filename': name,
        'sheet_id': main.get('sheetId'),
        'layout' : sheetInfo.get('layout'),
        'index' : main.get('index'),
        'dataset_link' : '%s#result/%s' % (host, sheetInfo.get('packageId')),
        'dataset_api_link' : '%spackage/get?id=%s' % (host, sheetInfo.get('packageId')),
    }

    # append zip package information if from zip file
    if 'zip' in sheetInfo:
        ecosis['zip_package'] = {
            "id" : sheetInfo.get('zip').get('resourceId'),
            "name" : sheetInfo.get('zip').get('name')
        }

    # append the latest processing information (when the sheet was last parsed)
    if processInfo is not None:
        ecosis['processInfo'] = processInfo

    # append the organziation information
    if package.get('organization') != None:
        ecosis['organization'] = package['organization']['title']

    spectra['ecosis'] = ecosis

# set attribute aliases if they exists
def mapNames(spectra, config, processInfo, package):

    # backword compatibility.  But moving away from config object
    # all 'advanced data' should be stored in package
    aliases = None
    extras = package.get('extras')
    if extras != None and extras.get('aliases') != None:
        aliases = json.loads(extras.get('aliases'))
    elif config.get("map") != None:
        aliases = config.get("map")

    if aliases != None and isinstance(aliases, dict):
        for key, value in aliases.iteritems():
            if value in spectra:
                spectra[key] = spectra[value]

                processInfo.append({
                    "type" : "mapped",
                    "key" : key,
                    "from" : value
                })

# move wavelengths from first class citizen in spectra to 'datapoints' object
def moveWavelengths(spectra, clean):
    wavelengths = {}
    toRemove = []
    for name in spectra:
        if re.match(r"^-?\d+\,?\d*", name) or re.match(r"^-?\d*\,\d+", name):
            if clean:
                wavelengths[uncleanKey(name)] = spectra[name].strip()
            else:
                wavelengths[name] = spectra[name].strip()
            toRemove.append(name)

    for name in toRemove:
        del spectra[name]

    spectra['datapoints'] = wavelengths

# given a list of joinable metadata sheets, see if any of the sheets have matches
# to the 'joinOn' value.  If so merge metadata information to spectra.
def join(packageId, spectra, processInfo):
    # get all the metadata sheets
    joinableSheets = collections.get('resource').find({"metadata": True, "packageId": packageId})

    # for each sheet config
    for sheetConfig in joinableSheets:
        # grab the metadata sheets join variable
        joinOn = sheetConfig.get('joinOn')
        if joinOn == None:
            continue

        # see if we have a join variable in the spectra
        joinVar = spectra.get(joinOn)

        if joinVar != None:
            query = {
                "type" : "metadata",
                "packageId" : packageId,
                "resourceId" : sheetConfig["resourceId"]
            }
            query["spectra.%s" % sheetConfig.get('joinOn')] = joinVar

            if sheetConfig.get('sheetId') != None:
                query["sheetId"] = sheetConfig.get('sheetId')

            # query for matches to spectras value
            joinData = collections.get('spectra').find_one(query)
            if joinData != None:

                # for each match, append all attributes
                for key in joinData.get("spectra"):
                    if key not in spectra:
                        spectra[key] = joinData.get("spectra").get(key)

                        # keep track of where attribute came from, this mostly for reporting in the UI
                        # lets the user know which attributes have properly join and which sheets
                        # those attributes came from
                        processInfo.append({
                            "type" : "join",
                            "key" : key,
                            "resourceId" : joinData.get("resourceId"),
                            "sheetId" : joinData.get("sheetId"),
                        })

# switch from MongoDB version to normal (only for wavelengths)
def uncleanKey(key):
    return re.sub(r',', '.', key)

# get workspace resource
def getResource(resource_id, sheet_id=None):
    # query needs to check if is part of zip package
    query = {
        "$or" : [
            {"resourceId" : resource_id},
            {"zip.resourceId" : resource_id}
        ]
    }

    # see if a sheet id was provided, sheets of excel files are
    # considered individual resources in this context
    if sheet_id is not None:
        query['sheetId'] = sheet_id

    # grab the sheet information from the resource workspace collection
    sheets = collections.get("resource").find(query,{
        "localRange" : 0,
        "hash" : 0,
        "file" : 0,
        "_id" : 0
    })

    response = []
    for sheet in sheets:
        # only send metadata attributes
        metadata = []
        repeats = []
        units = {}
        attributeRepeatFlag = False # proly have wrong layout

        # read in all of the attribute data including attribute names,
        # units and possible repeats if they exist
        if sheet.get('attributes') is not None:
            for attr in sheet.get('attributes'):
                if attr.get("type") != "metadata":
                    continue

                if attr.get("name") in metadata:
                    if attr.get("name") not in repeats:
                        repeats.append(attr.get("name"))
                    attributeRepeatFlag = True
                    continue

                metadata.append(attr.get("name"))

                if attr.get("units") is not None:
                    units[attr.get("name")] = attr.get("units")

        sheet['attributes'] = metadata
        sheet['units'] = units
        if attributeRepeatFlag:
            sheet['repeatAttributes'] = True
            sheet['repeats'] = repeats
        response.append(sheet)

    return response

# get the dict of attribute name to units type
def allUnits(package_id):
    query = {
        "package_id" : package_id
    }

    # query workspace resources for package
    sheets = collections.get("resource").find(query,{
        "localRange" : 0,
        "hash" : 0,
        "file" : 0,
        "_id" : 0
    })

    units = {}

    # loop through all sheets, all attributes
    for sheet in sheets:
        if sheet.get('attributes') is not None:
            for attr in sheet.get('attributes'):
                if attr.get("units") is not None and attr.get("units") != "":
                    units[attr.get("name")] = attr.get("units")

    return units

# get last pushed time
def isPushed(package_id):
    result = collections.get("search_package").find_one({"value.ecosis.package_id": package_id},{"value.ecosis.pushed": 1})

    if result is None:
        return result

    ecosis = result.get("value").get("ecosis")
    if ecosis is None:
        return ecosis

    return ecosis.get("pushed")