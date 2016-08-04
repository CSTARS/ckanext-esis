import os, json, re
import datetime
from bson.code import Code
from bson.son import SON
from pylons import config
import lookup
import dateutil.parser as dateparser
from ckanext.ecosis.datastore import query

path = os.path.dirname(os.path.abspath(__file__))

# read in mapreduce strings
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

schemaMap = {
    'Keywords' : 'tags',
    'Author' : 'author',
    'Author Email' : 'author_email',
    'Maintainer' : 'maintainer',
    'Maintainer Email' : 'maintainer_email'
}

mapReduceAttribute = []

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

    collections.get("search_spectra").map_reduce(mapJs, reduceJs, finalize=finalizeJs, scope=scope, out=SON([("merge", config.get("ecosis.mongo.search_collection"))]), query={"ecosis.package_id": ckanPackage['id']})
    spectra_count = collections.get("search_spectra").find({"ecosis.package_id": ckanPackage['id']}).count()

    updateEcosisNs(ckanPackage, spectra_count, bboxInfo)

def updateEcosisNs(pkg, spectra_count, bboxInfo):
    config = collections.get("package").find_one({"packageId": pkg.get("id")})
    collection = collections.get('search_package')

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

    ecosis = {
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
            "units" : {}
        },
        "resources" : [],
        "linked_data" : [],
        "geojson" : None,
        "sort_on" : sort.get("on"),
        "sort_description" : sort.get("description")
    }

    # append the units
    #units = getPackageExtra('package_units', pkg)
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

        mrValue = item.get('value')

        # process ecosis schema
        # bubble attributes from mapreduce
        names = []
        for category, items in schema.iteritems():
            for item in items:
                name = item.get('name')
                input = item.get('input')

                if name == 'Latitude' or name == 'Longitude' or name == 'geojson':
                    continue

                processAttribute(name, input, pkg, mrValue, setValues, keywords)
                names.append(name)

                if item.get('allowOther') == True:
                    processAttribute(name+" Other", "split-text", pkg, mrValue, setValues, keywords)
                    names.append(name+" Other")

        # set the known data attributes
        for key in mrValue['tmp__schema__']['wavelengths']:
            ecosis['spectra_metadata_schema']['wavelengths'].append(re.sub(r',', '.', key))
        for key in mrValue['tmp__schema__']['metadata']:
            ecosis['spectra_metadata_schema']['metadata'].append(re.sub(r',', '.', key))

        setValues['$unset']['value.tmp__schema__'] = ''


        # finally, let's handle geojson
        geojson = processGeoJson(bboxInfo, pkg);
        if len(geojson.get('geometries')) == 0:
            setValues['$set']['value.ecosis']['geojson'] = None
        else:
            setValues['$set']['value.ecosis']['geojson'] = geojson

        collection.update(
            {'_id': pkg['id']},
            setValues
        )

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

def cleanValue(value):
    if value is None:
        return ""

    return value.lower().strip()

def processAttribute(name, input, pkg, mrValue, setValues, keywords):
    val = None
    if name == 'Keywords':
        val = keywords
    elif schemaMap.get(name) != None:
        val = pkg.get(schemaMap.get(name))
    else:
        val = getPackageExtra(name, pkg)

    if val == None or val == '':
        return

    # if type is controlled, split to multiple values
    if name == 'Keywords':
        pass
    elif input == "controlled" or input == "split-text":
        val = val.split(",")
    else:
        val = [val]

    # now we have an dataset level value, see if we have spectra level
    # join if we do
    if mrValue.get(name) != None:
        spValues = mrValue.get(name)

        for v in val:
            if not v in spValues:
                spValues.append(v)
        val = spValues

    if name != 'geojson' and name != 'Citation':
        val = map(lambda it: cleanValue(it), val)

    setValues['$set']['value.'+name] = val

def getPackageExtra(attr, pkg):
    extra = pkg.get('extras')
    if extra == None:
        return None

    for item in extra:
        if item.get('key') == attr:
            return item.get('value')
    return None