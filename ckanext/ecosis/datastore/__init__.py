import json, re
# import ConfigParser
import time

from pymongo import MongoClient

from . import files, ckan, vocab, delete, query, workspace
from .query import workspace as workspaceQuery
from .utils import storage as ckanFileStorage
from . import mapreduce
from . import push
from .ckan import package
from ckanext.ecosis.datastore.mongo import db

collections = None

def init(schema, coll, pgConn, host, resourceUtil, workspacePath):
    global collections
    collections = coll;

    ensureIndexes(collections)

    files.init(collections, workspacePath)
    ckan.init(pgConn, schema)
    query.init(collections, host)
    vocab.init(schema, collections)
    delete.init(collections, workspacePath)
    workspace.init(collections, resourceUtil, workspacePath)
    mapreduce.init(collections, schema)
    push.init(collections)

def getCollections():
    return collections

def ensureIndexes(collections):
    collectionNames = db.collection_names()
    for name in collectionNames:
        if re.match(r'workspace_spectra_.*', name):
            db[name].create_index('index')

    collections.get('resource').create_index('sheetId')

    collections.get('package').create_index('packageId')
    collections.get('resource').create_index('packageId')
    collections.get('resource').create_index('resourceId')

def test():
    t = time.time()*1000

    # config = ConfigParser.ConfigParser()
    config.read('/etc/ckan/default/development.ini')

    schema = "test/schema.json"
    file = "/home/adminuser/Downloads/demodata.csv"
    metadataFile = "/home/adminuser/Downloads/demometadata.csv"


    pgConnStr = config.get("app:main", "sqlalchemy.url")

    with open(schema) as schema_file:
        schema = json.load(schema_file)

    client = MongoClient(config.get("app:main", "ecosis.mongo.url"))
    db = client[config.get("app:main", "ecosis.mongo.db")]

    collections = {
        "spectra" : db[config.get("app:main", "ecosis.mongo.workspace_spectra_collection")],
        "resource" : db[config.get("app:main", "ecosis.mongo.workspace_resource_collection")],
        "package" : db[config.get("app:main", "ecosis.mongo.workspace_package_collection")],
        "usda" : db[config.get("app:main", "ecosis.mongo.usda_collection")],

        "search_package" : db[config.get("app:main", "ecosis.mongo.search_collection")],
        "spectra" : db[config.get("app:main", "ecosis.mongo.spectra_collection")]
    }

    ckanFileStorage.init(config)
    init(schema, collections, pgConnStr, config.get("app:main", "ecosis.search_url"), ckanFileStorage, config.get("app:main", "ecosis.workspace.root"))

    workspace.clean()
    workspace.prepare('05cd4761-49ff-4f0d-9a6c-0a0adb223f69')

    result  = workspaceQuery.get('05cd4761-49ff-4f0d-9a6c-0a0adb223f69')
    foo = 1

if __name__ == "__main__":
    test()