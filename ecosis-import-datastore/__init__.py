import parser, query, vocab
import json, ConfigParser
from pymongo import MongoClient
import psycopg2, psycopg2.extras

from query import package

def init(schema, spectraCollection, resourceCollection, packageCollection, usdaCollection, pgConn):
    parser.init(resourceCollection, spectraCollection)
    query.init(resourceCollection, spectraCollection, packageCollection, pgConn)
    vocab.init(schema, usdaCollection)



def test():
    config = ConfigParser.ConfigParser()
    config.read('/etc/ckan/default/development.ini')

    schema = "test/schema.json"
    file = "/home/adminuser/Desktop/ecosis-import-datastore/"
    mongoUrl = "%s%s" % (config.get("app:main", "esis.mongo.url"), config.get("app:main", "esis.mongo.db"))

    spectraName = "workspace_spectra"
    resourceName = "workspace_resources"
    packageName = "workspace_packages"
    usdaName = config.get("app:main", "esis.mongo.usda_collection")

    pgConnStr = config.get("app:main", "sqlalchemy.url")
    pgConn = psycopg2.connect(pgConnStr)


    with open(schema) as schema_file:
        schema = json.load(schema_file)

    client = MongoClient(mongoUrl)
    init(schema, client[spectraName], client[resourceName], client[packageName], client[usdaName], pgConn)

    p = package.get('05cd4761-49ff-4f0d-9a6c-0a0adb223f69')



if __name__ == "__main__":
    test()