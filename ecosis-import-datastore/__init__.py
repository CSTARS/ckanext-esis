import parser, query, vocab
import json, ConfigParser, time
from pymongo import MongoClient
import psycopg2
import parser.process as importer

from query import package

def init(schema, collections, pgConn, host):
    parser.init(collections)
    query.init(collections, pgConn, host)
    vocab.init(schema, collections)



def test():
    t = time.time()*1000

    config = ConfigParser.ConfigParser()
    config.read('/etc/ckan/default/development.ini')

    schema = "test/schema.json"
    file = "/home/adminuser/Downloads/demodata.csv"
    metadataFile = "/home/adminuser/Downloads/demometadata.csv"


    pgConnStr = config.get("app:main", "sqlalchemy.url")
    pgConn = psycopg2.connect(pgConnStr)


    with open(schema) as schema_file:
        schema = json.load(schema_file)

    client = MongoClient(config.get("app:main", "ecosis.mongo.url"))
    db = client[config.get("app:main", "ecosis.mongo.db")]

    collections = {
        "spectra" : db["workspace_spectra"],
        "resource" : db["workspace_resources"],
        "package" : db["workspace_packages"],
        "usda" : db[config.get("app:main", "ecosis.mongo.usda_collection")]
    }

    init(schema, collections, pgConn, config.get("app:main", "ecosis.search_url"))

    importer.processFile(file, '05cd4761-49ff-4f0d-9a6c-0a0adb223f69', '41d27ad5-802e-4e95-a3ee-102bc423b31b', None, {"layout":"column", "metadata": False})
    importer.processFile(metadataFile, '05cd4761-49ff-4f0d-9a6c-0a0adb223f69', '04db4e2b-8904-41a0-8f96-b4de1ac9fe0a', None, {"metadata":True,"joinOn":"spectra"})

    print "%sms" % ((time.time()*1000)-t)
    t = time.time()*1000

    total = query.total("05cd4761-49ff-4f0d-9a6c-0a0adb223f69")
    for j in range(0, 100):
        for i in range(0, total):
            sp = query.get("05cd4761-49ff-4f0d-9a6c-0a0adb223f69", i)


    print "%sms" % ((time.time()*1000)-t)


if __name__ == "__main__":
    test()