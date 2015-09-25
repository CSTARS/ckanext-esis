import re, dateutil, json
import package as ckanPackageQuery
from vocab import usda
from vocab import controlled as controlledVocab

spectraCollection = None
resourceCollection = None
packageCollection = None

def init(rCollection, spCollection, pCollection, pgConn):
    global spectraCollection, resourceCollection, packageCollection

    spectraCollection = spCollection
    resourceCollection = rCollection
    packageCollection = pCollection
    ckanPackageQuery.init(pgConn)

def get(packageId="", index=0):
    main = spectraCollection.find_one({"type": "data", "packageId": packageId}, skip=index)
    spectra = main.get('spectra')

    package = ckanPackageQuery.get(packageId)

    join(packageId, spectra)
    moveWavelengths(spectra)

    config = packageCollection.find_one({"packageId": packageId})
    if config == None:
        config = {}

    mapNames(spectra, config)

    usda.setCodes(spectra)

    controlledVocab.enforce(spectra)

    addEcosisNamespace(spectra, packageId, package, main)
    setSort(spectra, package)
    setLocation(spectra)

    return spectra

def total(packageId, resourceId=None):
    query = {
        type : "data",
        packageId : packageId
    }

    if resourceId != None:
        query['resourceId'] = resourceId

    return spectraCollection.count(query)

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
    sort_on = getPackageExtra("sort_on", package)
    sort_type = getPackageExtra("sort_type", package)
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

def addEcosisNamespace(spectra, packageId, package, main):
    ecosis = {
        'package_id': packageId,
        'package_title': package.get('title'),
        'resource_id' : main.get('resourceId'),
        'filename': main.get('resourceName'),
        'datasheet_id': main.get('sheetId'),
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
            del spectra[name]
    spectra['datapoints'] = wavelengths

def join(packageId, spectra):
    joinableSheets = resourceCollection.find({"type": "metadata", "packageId": packageId})
    for sheetConfig in joinableSheets:
        joinVar = spectra.get(sheetConfig.get('joinOn'))

        if joinVar != None:
            query = {
                "type" : "metadata",
                "packageId" : packageId,
                "resourceId" : sheetConfig["resourceId"]
            }
            query[sheetConfig.get('joinOn')] = joinVar

            joinData = spectraCollection.find_one(query)
            if joinData != None:
                for key in joinData.get("spectra"):
                    if spectra.get(key) == None:
                        spectra[key] = joinData.get("spectra").get(key)

def getPackageExtra(attr, pkg):
    extra = pkg.get('extras')
    if extra == None:
        return None

    for item in extra:
        if item.get('key') == attr:
            return item.get('value')
    return None