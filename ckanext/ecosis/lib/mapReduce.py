import os, time, json, re
from bson.code import Code
from bson.son import SON
from pylons import config

searchCollectionName = config._process_configs[1]['ecosis.mongo.search_collection']
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

f = open('%s/../../../spectra-importer/core/schema.json' % path, 'r')
schema = json.loads(f.read())
f.close()
schemaMap = {
    'Keywords' : 'tags',
    'Author' : 'author',
    'Author Email' : 'author_email',
    'Maintainer' : 'maintainer',
    'Maintainer Email' : 'maintainer_email'
}

# pkg should be a ckan pkg
# collection should be the search collection
def mapreducePackage(ckanPkg, attributes, spectraCollection, searchCollection):
    # if the package is private, remove a return
    if ckanPkg['private'] == True:
        spectraCollection.remove({'_id': ckanPkg['id']})
        searchCollection.remove({'_id': ckanPkg['id']})
        return

    # TODO: remove this later on
    #finalize = Code(self.mapreduce['finalize'])
    #spectraCollection.map_reduce(map, reduce, finalize=finalizeJs, out=SON([("merge", searchCollectionName)]), query={"ecosis.package_id": pkg['id']})

    spectraCollection.map_reduce(mapJs, reduceJs, finalize=finalizeJs, out=SON([("merge", searchCollectionName)]), query={"ecosis.package_id": ckanPkg['id']})
    spectra_count = spectraCollection.find({"ecosis.package_id": ckanPkg['id']}).count()

    updateEcosisNs(ckanPkg, searchCollection, spectra_count)

def updateEcosisNs(pkg, collection, spectra_count):
    ecosis = {
        "pushed" : time.time(),
        "organization" : "",
        "organization_id" : "",
        "organization_image_url" : "",
        "description" : pkg.get('notes'),
        "groups" : [],
        "package_id" : pkg.get("id"),
        "package_name" : pkg.get("name"),
        "package_title" : pkg.get("title"),
        "created" : pkg.get("metadata_created"),
        "modified" : pkg.get("metadata_modified"),
        "version" : pkg.get("version"),
        "license" : pkg.get("license_title"),
        "spectra_count" : spectra_count,
        "spectra_schema" : {
            "data" : [],
            "metadata" : [],
            "units" : {}
        },
        "resources" : [],
        "geojson" : None,
        "sort_on" : getPackageExtra("sort_on", pkg),
        "sort_description" : getPackageExtra("sort_description", pkg),
    }

    # append the units
    units = getPackageExtra('package_units', pkg)
    if units != None:
        units = json.loads(units)
        for name, unit in units.iteritems():
            ecosis["spectra_schema"]["units"][re.sub(r'\.', '_', name)] = unit

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

            if pkg['organization']['image_url'] != "":
                ecosis["organization_image_url"] = '/uploads/group/%s' % pkg['organization']['image_url']
        else:
            ecosis['organization'] = 'None'
    else:
        ecosis['organization'] = 'None'

    # make sure the map reduce did not create a null collection, if so, remove
    # This means there is no spectra
    item = collection.find_one({'_id': pkg['id'], 'value': None})

    # now see if we have a group by attribute...
    if item != None:
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

                if name == 'Latitude' or name == 'Longitude':
                    continue

                processAttribute(name, input, pkg, mrValue, setValues, keywords)
                names.append(name)

                if item.get('allowOther') == True:
                    processAttribute(name+" Other", "text", pkg, mrValue, setValues, keywords)
                    names.append(name+" Other")

        # set the known data attributes
        for key in mrValue['data_keys__']:
            ecosis['spectra_schema']['data'].append(re.sub(r',', '.', key))
        setValues['$unset']['value.data_keys__'] = ''

        # now, lets remove any non-ecosis metadata that has more than 100 entries
        # also we will set the spectra 'schema' lets us know what wavelengths are dataset
        # as well as what fields are spectra level metadata
        for key, values in mrValue.iteritems():
            if key == 'data_keys__':
                continue

            ecosis['spectra_schema']['metadata'].append(re.sub(r',', '.', key))

            if key in names or values == None:
                continue

            if len(values) > 100:
                vkey = 'value.%s' % key
                setValues['$unset'][vkey] = "";

        # finally, let's handle geojson
        geojson = []
        if setValues['$set'].get('value.geojson') != None:
            geojson = setValues['$set'].get('value.geojson');
            del setValues['$set']['value.geojson']

        geojson = processGeoJson(geojson, pkg);
        if len(geojson.get('geometries')) == 0:
            setValues['$set']['value.ecosis']['geojson'] = None
        else:
            setValues['$set']['value.ecosis']['geojson'] = geojson

        collection.update(
            {'_id': pkg['id']},
            setValues
        )

def processGeoJson(geojson, pkg):
    result = {
        "type": "GeometryCollection",
        "geometries": []
    }

    for js in geojson:
        js = json.loads(js)

        if js.get("type") == "GeometryCollection":
            for geo in js.get("geometries"):
                result['geometries'].append(geo)
        elif js.get("type") == "Feature":
            result['geometries'].append(js.get('geometry'))
        elif js.get("type") == "FeatureCollection":
            for f in js.get("features"):
                result['geometries'].append(f.get("geometry"))
        else:
            result['geometries'].append(js)

    return result



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
    elif input == "controlled":
        val = val.split(",")
        val = map(lambda it: it.strip(), val)
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

    setValues['$set']['value.'+name] = val

def getPackageExtra(attr, pkg):
    extra = pkg.get('extras')
    if extra == None:
        return None

    for item in extra:
        if item.get('key') == attr:
            return item.get('value')
    return None