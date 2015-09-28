import psycopg2, json, os
from pymongo import MongoClient
import pylons.config as config
import ckan.lib.uploader as uploader
from ckan.controllers.package import PackageController

import package
from utils import handleError

# import relative module
import ecosisImportDatastore as workspace


path = os.path.dirname(__file__)
schema = os.path.join(path, "../../spectra-importer/core/schema.json")

pgConnStr = config.get("sqlalchemy.url")
pgConn = psycopg2.connect(pgConnStr)


with open(schema) as schema_file:
    schema = json.load(schema_file)

client = MongoClient(config.get("ecosis.mongo.url"))
db = client[config.get("ecosis.mongo.db")]

collections = {
    "spectra" : db[config.get("ecosis.mongo.workspace_spectra_collection")],
    "resource" : db[config.get("ecosis.mongo.workspace_resource_collection")],
    "package" : db[config.get("ecosis.mongo.workspace_package_collection")],
    "usda" : db[config.get("ecosis.mongo.usda_collection")]
}

upload = uploader.ResourceUpload({})

workspace.init(schema, collections, pgConn, config.get("ecosis.search_url"), upload, config.get("ecosis.workspace.root"))

class EcosisController(PackageController):

    def deletePackage(self):
        try:
            return package.delete()
        except Exception as e:
            return handleError()

    def test(self):
        return 'hello world'