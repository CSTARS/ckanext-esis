import re, dateutil, json
import ckan.package as ckanPackageQuery
import ckan.resource as ckanResourceQuery
import workspace
from vocab import usda
from vocab import controlled as controlledVocab

collections = None
host = ""

def init(co, hostUrl):
    global collections, host

    collections = co
    host = hostUrl
    workspace.init(co)

def get(packageId="", index=0):
    main = collections.get('spectra').find_one({"type": "data", "packageId": packageId}, skip=index)

    if main == None:
        raise Exception('Unabled to get spectra from package_id: %s at index %s' % (packageId, index))

    spectra = main.get('spectra')

    sheetInfo = collections.get('resource').find_one({
        "packageId": packageId,
        "resourceId": main.get("resourceId"),
        "sheetId" : main.get("sheetId")
    })

    package = ckanPackageQuery.get(packageId)

    join(packageId, spectra)
    moveWavelengths(spectra)

    config = collections.get('package').find_one({"packageId": packageId})
    if config == None:
        config = {}

    mapNames(spectra, config)

    usda.setCodes(spectra)

    controlledVocab.enforce(spectra)

    addEcosisNamespace(spectra, package, main, sheetInfo)
    setSort(spectra, package)
    setLocation(spectra)

    return spectra

def total(packageId, resourceId=None):
    query = {
        "type" : "data",
        "packageId" : packageId
    }

    if resourceId != None:
        query['resourceId'] = resourceId

    return collections.get('spectra').count(query)

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

def setSort(spectra, package):
    sort_on = package['extras'].get("sort_on")
    sort_type = package['extras'].get("sort_type")

    if sort_on != None:
        if sort_on in spectra:
            if sort_type == 'datetime':
                try:
                    spectra['ecosis']['sort'] = dateutil.parser.parse(spectra[sort_on])
                except:
                    pass
            elif sort_type == 'numeric':
                try:
                    spectra['ecosis']['sort'] = float(spectra[sort_on])
                except:
                    pass
            else:
                spectra['ecosis']['sort'] = spectra[sort_on]

def addEcosisNamespace(spectra, package, main, sheetInfo):
    resource = ckanResourceQuery.get(sheetInfo.get('resourceId'))

    ecosis = {
        'package_id': sheetInfo.get("packageId"),
        'package_title': package.get('title'),
        'resource_id' : main.get('resourceId'),
        'filename': resource.get('name'),
        'datasheet_id': main.get('sheetId'),
        'dataset_link' : '%s#result/%s' % (host, sheetInfo.get('packageId')),
        'dataset_api_link' : '%spackage/get?id=%s' % (host, sheetInfo.get('packageId'))
    }

    if package.get('organization') != None:
        ecosis['organization'] = package['organization']['title']

    spectra['ecosis'] = ecosis

def mapNames(spectra, config):
    if config.get("attributeMap") != None:
        for key, value in config["attributeMap"].iteritems():
            if value in spectra:
                spectra[key] = spectra[value]

def moveWavelengths(spectra):
    wavelengths = {}
    for name in spectra:
        if re.match(r"^-?\d+\.?\d*", name) or re.match(r"^-?\d*\.\d+", name):
            wavelengths[name] = spectra[name]

    for name in wavelengths:
        del spectra[name]

    spectra['datapoints'] = wavelengths

def join(packageId, spectra):
    joinableSheets = collections.get('resource').find({"metadata": True, "packageId": packageId})

    for sheetConfig in joinableSheets:
        joinOn = sheetConfig.get('joinOn')
        if joinOn == None:
            continue

        joinVar = spectra.get(joinOn)

        if joinVar != None:
            query = {
                "type" : "metadata",
                "packageId" : packageId,
                "resourceId" : sheetConfig["resourceId"]
            }
            query["spectra.%s" % sheetConfig.get('joinOn')] = joinVar

            joinData = collections.get('spectra').find_one(query)
            if joinData != None:
                for key in joinData.get("spectra"):
                    if spectra.get(key) == None:
                        spectra[key] = joinData.get("spectra").get(key)

