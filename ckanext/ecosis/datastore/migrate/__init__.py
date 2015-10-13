# Migrate from old setup
import time, psycopg2, json, os, hashlib
from pymongo import MongoClient
import ckan.lib.uploader as uploader
import ConfigParser

from ckanext.ecosis.datastore import init
from ckanext.ecosis.datastore.ckan import resource as resourceQuery

upload = uploader.ResourceUpload({})


def getResourceList():

    config = ConfigParser.ConfigParser()
    config.read('/etc/ckan/default/development.ini')

    t = time.time()*1000

    path = os.path.dirname(__file__)
    schema = os.path.join(path, "../../../../spectra-importer/core/schema.json")

    pgConnStr = config.get("app:main","sqlalchemy.url")

    resourceQuery.init(pgConnStr)
    pgConn = psycopg2.connect(pgConnStr)



    with open(schema) as schema_file:
        schema = json.load(schema_file)

    client = MongoClient(config.get("app:main","ecosis.mongo.url"))
    db = client["esis"]

    collections = {
        "spectra" : db["workspace_spectra"],
        "resource" : db["workspace_resources"],
        "package" : db["workspace_packages"],
        "usda" : db[config.get("app:main","ecosis.mongo.usda_collection")]
    }

    init(schema, collections, pgConnStr, config.get("app:main","ecosis.search_url"), upload, config.get("app:main","ecosis.workspace.root"))

    cur = pgConn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("select * from package")
    packages = cur.fetchall()

    infoCollection = db["info"]

    existingConfig = {}

    for package in packages:
        print "%s %s" % (package.get("id"), package.get("name"))

        resources = resourceQuery.active(package.get("id"))
        for resource in resources:
            print "  --%s" % resource.get("id")

            info = infoCollection.find_one({
                "package_id": package.get("id"),
                "file" : "/home/adminuser/workspace/%s/%s/info.json" % (package.get("name"), resource.get("id"))
            })

            if info is None:
                print "  NO INFO FOUND!"
                continue

            existingConfig[resource.get('id')] = {}

            data = json.loads(info.get('data'))

            for sheet in data.get("datasheets"):
                existingConfig[resource.get('id')][sheet.get('id')] = sheet

    t = 1
    t += 1


def _getFileId(rid, path, name):
    m = hashlib.md5()
    m.update("%s%s%s" % (rid, path, name))
    return m.hexdigest()



if __name__ == "__main__":
    getResourceList()