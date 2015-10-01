import json
import ConfigParser
import time

from pymongo import MongoClient
import psycopg2

import parser
import ckan
import vocab
import delete
import query
import workspace
import query.workspace as workspaceQuery
from utils import storage as ckanFileStorage
import mapreduce
import push
from ckan import package


def init(schema, collections, pgConn, host, resourceUtil, workspacePath):
    parser.init(collections)
    ckan.init(pgConn)
    query.init(collections, host)
    vocab.init(schema, collections)
    delete.init(collections, workspacePath)
    workspace.init(collections, resourceUtil, workspacePath)
    mapreduce.init(collections, schema)
    push.init(collections)

def test():
    t = time.time()*1000

    config = ConfigParser.ConfigParser()
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