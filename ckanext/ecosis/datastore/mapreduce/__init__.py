import os, json, re
import datetime
from bson.code import Code
from bson.son import SON
from pylons import config
import lookup
import dateutil.parser as dateparser
from ckanext.ecosis.datastore import query
from ckanext.ecosis.lib.utils import getPackageExtra

path = os.path.dirname(os.path.abspath(__file__))

# read in mapreduce strings.  These javascript files are (obviously) stored locally
f = open('%s/../mapreduce/map.js' %  path, 'r')
mapJs = Code(f.read())
f.close()

f = open('%s/../mapreduce/reduce.js' % path, 'r')
reduceJs = Code(f.read())
f.close()

f = open('%s/../mapreduce/finalize.js' % path, 'r')
finalizeJs = Code(f.read())
f.close()

collections = None
schema = None

# map from CKAN attribute name to EcoSIS
schemaMap = {
    'Keywords' : 'tags',
    'Author' : 'author',
    'Author Email' : 'author_email',
    'Maintainer' : 'maintainer',
    'Maintainer Email' : 'maintainer_email'
}

# initialized in init()
mapReduceAttribute = []

# inject global dependencies
def init(mongoCollections, jsonSchema):
    global collections, schema, mapReduceAttribute

    collections = mongoCollections
    schema = jsonSchema
    lookup.init(collections)

    # loop schema and lookup mapreduce attributes
    for cat, arr in schema.iteritems():
        for item in arr:
            if item.get('name') == 'Latitude' or item.get('name') == 'geojson' or item.get('name') == 'Longitude':
                continue
            mapReduceAttribute.append(item.get('name'))

# pkg should be a ckan pkg
# collection should be the search collection
def mapreducePackage(ckanPackage, bboxInfo):

    # pass along attribute to mapreduce
    scope = {
        "mapReduceAttribute" : mapReduceAttribute
    }

    # run mongo db mapreduce
    collections.get("search_spectra").map_reduce(mapJs, reduceJs, finalize=finalizeJs, scope=scope, out=SON([("merge", config.get("ecosis.mongo.search_collection"))]), query={"ecosis.package_id": ckanPackage['id']})
    # get the resulting count
    spectra_count = collections.get("search_spectra").find({"ecosis.package_id": ckanPackage['id']}).count()

    # now that we have our mapreduce spectra colleciton, lets process it
    updateEcosisNs(ckanPackage, spectra_count, bboxInfo)

# process dataset after mapreduce.  add the ecosis namespace with additional ecosis/ckan information
def updateEcosisNs(pkg, spectra_count, bboxInfo):
    # get the package workspace object, contains config
    config = collections.get("package").find_one({"packageId": pkg.get("id")})
    if config is None:
        config = {}

    collection = collections.get('search_package')


    # TODO: shouldn't this be accessing the package extra for the sorting information?
    sort = config.get("sort")
    if sort is None:
        sort = {}

    # store these as dates
    created = None
    modified = None
    try:
        created = dateparser.parse(pkg.get("metadata_created"))
    except Exception as e:
        pass
    try:
        modified = dateparser.parse(pkg.get("metadata_modified"))
    except Exception as e:
        pass

    # default ecosis information we are going to add to the package
    ecosis = {
        # TODO: change to ISO string, check this doesn't break 'updated since last push check'
        "pushed" : datetime.datetime.utcnow(),
        "organization" : "",
        "organization_id" : "",
        "description" : pkg.get('notes'),
        "groups" : [],
        "package_id" : pkg.get("id"),
        "package_name" : pkg.get("name"),
        "package_title" : pkg.get("title"),
        "created" : created,
        "modified" : modified,
        "version" : pkg.get("version"),
        "license" : pkg.get("license_title"),
        "spectra_count" : spectra_count,
        "spectra_metadata_schema" : {
            "wavelengths" : [],
            "metadata" : [],
            "units" : {},
            "aliases" : None,
        },
        "resources" : [],
        "linked_data" : [],
        "geojson" : None,
        "sort_on" : sort.get("on"),
        "sort_description" : sort.get("description")
    }

    # append the units
    units = query.allUnits(pkg.get("package_id"))
    if units != None:
         ecosis["spectra_metadata_schema"]["units"] = units

    # append the linked data
    linkeddata = getPackageExtra('LinkedData', pkg)
    if linkeddata != None:
        ecosis["linked_data"] = json.loads(linkeddata)

    # append the EcoSIS DOI
    doi = getPackageExtra('EcoSIS DOI', pkg)
    if doi != None:
        ecosis["doi"] = doi

    # append the list of resources
    for item in pkg['resources']:
        if item.get("state") != "active":
            continue

        ecosis["resources"].append({
            "type" : item.get('url_type'),
            "mimetype" : item.get("mimetype"),
            "name" : item.get("name"),
            "url" : item.get("url")
        })

    # append the list of keywords
    keywords = []
    for item in pkg['tags']:
        keywords.append(item['display_name'])

    # add metadata aliases
    aliases = getPackageExtra('aliases', pkg)
    if aliases is not None:
        try:
            ecosis["spectra_metadata_schema"]["aliases"] = json.loads(aliases)
        except Exception:
            pass

    # append the data groups
    for item in pkg['groups']:
        ecosis["groups"].append(item['display_name'])

    # append the organizations
    if 'organization' in pkg:
        if pkg['organization'] != None:
            ecosis["organization"] = pkg['organization']['title']
            ecosis["organization_id"] = pkg['organization']['id']
        else:
            ecosis['organization'] = 'None'
    else:
        ecosis['organization'] = 'None'

    # make sure the map reduce did not create a null collection, if so, remove
    # This means there is no spectra
    item = collection.find_one({'_id': pkg['id']})

    # now see if we have a group by attribute...
    if item is None:
        pass
    elif item.get('value') is None:
        collection.remove({'_id': pkg['id']})
    else:
        item = collection.find_one({'_id': pkg['id']})

        setValues = {'$set' : { 'value.ecosis': ecosis }, '$unset' : {}}

        # grab the mapreduce value
        mrValue = item.get('value')

        # process ecosis schema
        # bubble attributes from mapreduce
        names = []
        for category, items in schema.iteritems():
            for item in items:
                name = item.get('name')
                input = item.get('input')

                # ignore these attributes, they should not be processed.
                # TODO: make this a global list
                if name == 'Latitude' or name == 'Longitude' or name == 'geojson' or name == 'NASA GCMD Keywords':
                    continue

                # processAttribute does all sorts-o-stuff, see function definition below
                processAttribute(name, input, pkg, mrValue, setValues, keywords)
                names.append(name)

                if item.get('allowOther') == True:
                    processAttribute(name+" Other", "split-text", pkg, mrValue, setValues, keywords)
                    names.append(name+" Other")

        # set the known data attributes
        # the mapreduce function created these objects, storing all know wavelengths and metadata attributes
        # for the function.  Here we transform those objects (dicts) into arrays, we only care about the keys
        # Finally, MongoDB does not allow '.' in attribute name, so names were stored with commas instead,
        # transpose the ',' back to '.'
        for key in mrValue['tmp__schema__']['wavelengths']:
            ecosis['spectra_metadata_schema']['wavelengths'].append(re.sub(r',', '.', key))
        for key in mrValue['tmp__schema__']['metadata']:
            ecosis['spectra_metadata_schema']['metadata'].append(re.sub(r',', '.', key))

        # tell MongoDB to remove the object storing our schema information processed above
        setValues['$unset']['value.tmp__schema__'] = ''

        # append the gcmd keywords
        gcmd = getPackageExtra('NASA GCMD Keywords', pkg)
        if gcmd is not None and gcmd != '':
            arr = json.loads(gcmd)
            setValues['$set']['value.ecosis']['nasa_gcmd_keywords'] = arr
            keywords = []

            # create unique array of all gcmd keywords to be searched on
            for item in arr:
                parts = item.get('label').split('>')
                parts =  map(unicode.strip, parts)
                for key in parts:
                    if key not in keywords:
                        keywords.append(key)

            setValues['$set']['value.NASA GCMD Keywords'] = keywords

        # finally, let's handle geojson
        geojson = processGeoJson(bboxInfo, pkg);
        if len(geojson.get('geometries')) == 0:
            setValues['$set']['value.ecosis']['geojson'] = None
        else:
            setValues['$set']['value.ecosis']['geojson'] = geojson

        # really, finally, update the collection with the 'setValues' dict we have been creating
        collection.update(
            {'_id': pkg['id']},
            setValues
        )

# handle the various ways we are given a bounding box
def processGeoJson(bboxInfo, pkg):
    result = {
        "type": "GeometryCollection",
        "geometries": []
    }

    # if we found bbox info in the spectra, add it
    if bboxInfo['use']:
        result['geometries'].append({
            "type": "Polygon",
            "coordinates" : [[
                [bboxInfo["maxlng"], bboxInfo["maxlat"]],
                [bboxInfo["minlng"], bboxInfo["maxlat"]],
                [bboxInfo["minlng"], bboxInfo["minlat"]],
                [bboxInfo["maxlng"], bboxInfo["minlat"]],
                [bboxInfo["maxlng"], bboxInfo["maxlat"]]
            ]]
        })

    geojson = getPackageExtra("geojson", pkg)
    if geojson != None:
        try:
            # TODO: add checks for valid geojson
            result['geometries'].append(json.loads(geojson))
        except Exception:
            pass

    return result

# make sure value is not none, strip string and set to lower case
def cleanValue(value):
    if value is None:
        return ""

    return value.lower().strip()

# all sorts of magics here.
def processAttribute(name, input, pkg, mrValue, setValues, keywords):
    val = None

    # first we need to get the values we are working with
    if name == 'Keywords': # this is the keywords attribute, special case
        val = keywords
    elif schemaMap.get(name) != None: # if the schemaMap has alias set, lookup value based on alias name
        val = pkg.get(schemaMap.get(name))
    else: # otherwise just use the provided attribute name
        val = getPackageExtra(name, pkg)

    # if we don't have values to process, do nothing
    if val == None or val == '':
        return

    # if attribute schema type is 'controlled', split to multiple values
    if name == 'Keywords':
        pass
    elif input == "controlled" or input == "split-text" or name == 'Author':
        val = val.split(",")
    else: # we store everything as an array, easier to handle on other end
        val = [val]

    # now we have an dataset value, see if we have spectra value and join if we do
    # what does this mean?  So spectra resource attributes were mapreduced into
    # this single 'mrValue' dict.  If the attribute name is found as a first class
    # citizen, then it was provided by the spectra and we need to include it
    if mrValue.get(name) != None:
        spValues = mrValue.get(name)

        # merge and above values with new values
        for v in val:
            if not v in spValues:
                spValues.append(v)
        val = spValues

    # finally, clean all values (strip and set to lower case)
    if name != 'geojson' and name != 'Citation':
        val = map(lambda it: cleanValue(it), val)

    setValues['$set']['value.'+name] = val