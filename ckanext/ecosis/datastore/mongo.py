from pymongo import MongoClient
from ckan.common import config

client = MongoClient(config.get("ecosis.mongo.url"))
db = client[config.get("ecosis.mongo.db")]

collections = {
    # "spectra" : db[config.get("ecosis.mongo.workspace_spectra_collection", "workspace_spectra")],
    "resource" : db[config.get("ecosis.mongo.workspace_resource_collection", "workspace_resources")],
    "package" : db[config.get("ecosis.mongo.workspace_package_collection", "workspace_packages")],
    "usda" : db[config.get("ecosis.mongo.usda_collection", "usda")],
    "top" : db[config.get("ecosis.mongo.top_collection", "top")],
    "gcmd" : db[config.get("ecosis.mongo.gcmd_collection", "gcmd")],
    "search_package" : db[config.get("ecosis.mongo.search_collection", "search")],
    "search_spectra" : db[config.get("ecosis.mongo.spectra_collection", "spectra")],
    "lookup" : db["lookup"]
}

def get_package_spectra_collection(pkgid):
    return db['workspace_spectra_%s' % pkgid];