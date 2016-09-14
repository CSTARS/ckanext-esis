# Migrate from Beta 1 setup to Beta 2 setup
# TODO: remove this.

import time, psycopg2, json, os, hashlib, re, xlrd
from pymongo import MongoClient
from ckanext.ecosis.datastore.utils import storage as ckanFileStorage
import ConfigParser

from ckanext.ecosis.datastore import init
from ckanext.ecosis.datastore.ckan import resource as resourceQuery


def getResourceList():

    config = ConfigParser.ConfigParser()
    config.read('/etc/ckan/default/development.ini')

    t = time.time()*1000

    path = os.path.dirname(__file__)
    schema = os.path.join(path, "../../../../spectra-importer/core/schema.json")

    pgConnStr = config.get("app:main","sqlalchemy.url")

    resourceQuery.init(pgConnStr)
    pgConn = psycopg2.connect(pgConnStr)

    ckanFileStorage.init(config)

    with open(schema) as schema_file:
        schema = json.load(schema_file)

    client = MongoClient(config.get("app:main","ecosis.mongo.url"))
    db = client["esis"]
    newDb = client["ecosis"]

    newResourceCollection = newDb["workspace_resources"]
    newPackageCollection = newDb["workspace_packages"]

    collections = {
        "spectra" : db["workspace_spectra"],
        "resource" : db["workspace_resources"],
        "package" : db["workspace_packages"],
        "usda" : db[config.get("app:main","ecosis.mongo.usda_collection")]
    }

    init(schema, collections, pgConnStr, config.get("app:main","ecosis.search_url"), ckanFileStorage, config.get("app:main","ecosis.workspace.root"))

    cur = pgConn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("select * from package")
    packages = cur.fetchall()

    workspaceCollection = db["workspace"]

    existingConfig = {}

    results = {
        "packages" : 0,
        "resources" : 0,
        "missingResourceConfig" : 0,
        "unhandledZipfile" : 0
    }

    for package in packages:
        print "%s %s" % (package.get("id"), package.get("name"))

        workspaceConfig = workspaceCollection.find_one({
            "package_id": package.get("id")
        })

        if workspaceConfig is None:
            continue

        results["packages"] += 1

        newResourceCollection.remove({"packageId": package.get("id")})
        newPackageCollection.remove({"packageId": package.get("id")})

        newPkgConfig = _createPackage(package.get("id"), workspaceConfig)
        newPackageCollection.insert(newPkgConfig)

        resources = resourceQuery.active(package.get("id"))

        for resource in resources:
            results["resources"] += 1

            print "  --%s" % resource.get("id")
            resourceConfig = _getResourceConfig(workspaceConfig, resource.get("id"))

            if resourceConfig is None:
                results['missingResourceConfig'] += 1
                print "  NO INFO FOUND!"
                continue

            ext = _getExt(resource.get('name'))

            if ext == 'csv' or ext == 'tsv' or ext == 'spectra':
                if len(resourceConfig.get("datasheets")) == 1:
                    newRConfig = _createResource(package.get('id'), resource.get('id'), None, resourceConfig.get("datasheets")[0])
                    newResourceCollection.insert(newRConfig)
                    print "    %s" % newRConfig
                else:
                    print "    MULTIPLE SHEETS FOR SINGLE SHEET RESOURCE: %s" % resource.get('name')
                    results['missingResourceConfig'] += 1
            elif ext == 'xls' or ext == 'xlsx':
                path = ckanFileStorage.get_path(resource.get('id'))

                workbook = xlrd.open_workbook(path)
                sheets = workbook.sheet_names()

                for i, sheet in enumerate(sheets):
                    file =  _getFile(package.get("name"), resource.get("id"))
                    id = _getFileId(resource.get('id'), file, "%s-%s" % (resource.get('name'), sheet))

                    sheetConfig = _getSheetConfig(resourceConfig.get("datasheets"), id)

                    if sheetConfig is None:
                        print "    MISSING DATASHEET CONFIG: %s %s" % (resource.get('name'), sheet)
                        results['missingResourceConfig'] += 1
                        continue

                    newRConfig = _createResource(package.get('id'), resource.get('id'), "%s-%s" % (i, sheet), sheetConfig)
                    newResourceCollection.insert(newRConfig)
                    print "    %s" % newRConfig

            elif ext == 'zip':
                results['unhandledZipfile'] += 1



    print results


def _getSheetConfig(sheets, id):
    for sheet in sheets:
        if sheet.get("id") == id:
            return sheet
    return None

def _getExt(filename):
    return re.sub(r'.*\.', '', filename)

def _getResourceConfig(workspaceConfig, resourceId):
    for resource in workspaceConfig.get('resources'):
        if resource.get("id") == resourceId:
            return resource
    return None


def _getFile(packageName, resourceId):
    #return  "/%s/%s/info.json" % (packageName, resourceId)
    return  "/%s/%s/files/" % (packageName, resourceId)

def _getFileId(rid, path, name):
    m = hashlib.md5()
    m.update("%s%s%s" % (rid, path, name))
    return m.hexdigest()

def _createResource(packageId, resourceId, sheetId, oldConfig):
    metadata = False
    ignore = False
    if oldConfig.get("metadata") == True:
        metadata = True
    if oldConfig.get("ignore") == True:
        ignore = True

    return {
        "packageId" : packageId,
        "resourceId" : resourceId,
        "sheetId" : sheetId,
        "layout" : oldConfig.get("layout"),
        "joinOn" : oldConfig.get("matchAttribute"),
        "metadata" : metadata,
        "ignore" : ignore
    }

def _createPackage(packageId, oldConfig):
    return {
        "packageId" : packageId,
        "map" : oldConfig.get("attributeMap")
    }


if __name__ == "__main__":
    getResourceList()