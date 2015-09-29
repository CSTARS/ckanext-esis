import json
import os

import psycopg2
from pymongo import MongoClient
import pylons.config as config

import ckan.lib.uploader as uploader
from ckan.controllers.package import PackageController
from ecosis.controller import git, admin, organization, package, resource, spectra, user
from ecosis.controller import workspace as workspaceController
from ecosis.lib.utils import handleError


# import relative module
from ecosis import datastore as workspace

usdaApiUrl = 'http://plants.usda.gov/java/AdvancedSearchServlet?symbol=&dsp_vernacular=on&dsp_category=on&dsp_genus=on&dsp_family=on&Synonyms=all&viewby=sciname&download=on'

path = os.path.dirname(__file__)
schema = os.path.join(path, "../../../spectra-importer/core/schema.json")

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
    "usda" : db[config.get("ecosis.mongo.usda_collection")],
    "search_package" : db[config.get("ecosis.mongo.search_collection")],
    "search_spectra" : db[config.get("ecosis.mongo.spectra_collection")]
}

upload = uploader.ResourceUpload({})

workspace.init(schema, collections, pgConn, config.get("ecosis.search_url"), upload, config.get("ecosis.workspace.root"))


class EcosisController(PackageController):

    def deletePackage(self):
        try:
            return package.delete()
        except Exception as e:
            return handleError(e)

    # delete org from UI
    def deleteOrganizationUi(self, id):
        organization.delete(id)

    def setPrivate(self):
        try:
            return package.setPrivate()
        except Exception as e:
            return handleError(e)

    def deleteResouce(self):
        try:
            return resource.delete()
        except Exception as e:
            return handleError(e)

    def deleteResouces(self):
        try:
            return resource.deleteMany()
        except Exception as e:
            return handleError(e)

    def rebuildIndex(self):
        try:
            return admin.rebuildIndex(collections)
        except Exception as e:
            return handleError(e)

    def gitInfo(self):
        try:
            return git.info()
        except Exception as e:
            return handleError(e)

    def userInfo(self):
        try:
            return user.info()
        except Exception as e:
            return handleError(e)

    def createPackageRedirect(self):
        package.createPackageRedirect()

    def editPackageRedirect(self, id):
        package.editPackageRedirect(id)

    def rebuildUSDACollection(self):
        try:
            return admin.rebuildUSDACollection(collections, usdaApiUrl)
        except Exception as e:
            return handleError(e)

    def prepareWorkspace(self):
        try:
            return workspaceController.prepare()
        except Exception as e:
            return handleError(e)

    def processResource(self):
        try:
            return resource.process()
        except Exception as e:
            return handleError(e)

    def getResource(self):
        try:
            return resource.get()
        except Exception as e:
            return handleError(e)

    def setPackageOptions(self):
        try:
            return resource.get()
        except Exception as e:
            return handleError(e)

    def getSpectra(self):
        try:
            return spectra.get()
        except Exception as e:
            return handleError(e)

    def pushToSearch(self):
        try:
            return workspaceController.pushToSearch()
        except Exception as e:
            return handleError(e)