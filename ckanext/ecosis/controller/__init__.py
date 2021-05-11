import os, json

from ckan.common import config
import ckan.lib.uploader as uploader
# from ckan.controllers.package import PackageController
from ckanext.ecosis.controller import git, admin, organization, package, resource, spectra, user
from ckanext.ecosis.controller import workspace as workspaceController
from ckanext.ecosis.lib.utils import handleError
from ckanext.ecosis import datastore
from ckanext.ecosis.datastore.mongo import collections
from ckanext.ecosis.lib.utils import jsonStringify

from flask import make_response

usdaApiUrl = 'http://plants.usda.gov/java/AdvancedSearchServlet?symbol=&dsp_vernacular=on&dsp_category=on&dsp_genus=on&dsp_family=on&Synonyms=all&viewby=sciname&download=on'

path = os.path.dirname(__file__)
schema = os.path.join(path, "../../../spectra-importer/utils/metadata/schema.json")

pgConnStr = config.get("sqlalchemy.url")

with open(schema) as schema_file:
    schema = json.load(schema_file)

upload = uploader.ResourceUpload({})

datastore.init(schema, collections, pgConnStr, config.get("ecosis.search_url"), upload, config.get("ecosis.workspace.root"))
package.init(collections, pgConnStr)
organization.init(collections)

class EcosisController():

    def createPackage(self):
        try:
            return package.create()
        except Exception as e:
            return handleError(e)

    def deletePackage(self):
        try:
            return package.delete()
        except Exception as e:
            return handleError(e)

    def updatePackage(self):
        try:
            return package.update()
        except Exception as e:
            return handleError(e)

    def cleanTests(self):
        try:
            return admin.cleanTests()
        except Exception as e:
            return handleError(e)

    def clean(self):
        try:
            return admin.clean(collections)
        except Exception as e:
            return handleError(e)

    def setPrivate(self):
        try:
            return package.setPrivate()
        except Exception as e:
            return handleError(e)

    def updateLinkedResources(self):
        try:
            return (package.updateLinkedResources())
        except Exception as e:
            return handleError(e)

    def getTemplate(self):
        try:
            content = package.getTemplate()
            return make_response((content['body'], 200, content['headers']))
        except Exception as e:
            return handleError(e)

    def createResource(self):
        try:
            return resource.create()
        except Exception as e:
            return handleError(e)

    def deleteResource(self):
        try:
            return resource.delete()
        except Exception as e:
            return handleError(e)

    def deleteResources(self):
        try:
            return resp(resource.deleteMany())
        except Exception as e:
            return handleError(e)

    def rebuildIndex(self):
        try:
            return resp(admin.rebuildIndex(collections))
        except Exception as e:
            return handleError(e)

    def upgrade(self):
        try:
            return admin.upgrade()
        except Exception as e:
            return handleError(e)

    def fixUnits(self):
        try:
            return admin.fixUnits()
        except Exception as e:
            return handleError(e)

    def fixCitations(self):
        try:
            return admin.fixCitationText()
        except Exception as e:
            return handleError(e)

    def doiQuery(self):
        try:
            return package.doi.doiQuery()
        except Exception as e:
            return handleError(e)

    def clearDoi(self):
        try:
            return package.doi.clearDoi()
        except Exception as e:
            return handleError(e)

    # TODO: verify ok to remove
    # def doiUpdateStatus(self):
    #     try:
    #         return package.doi.doiUpdateStatus()
    #     except Exception as e:
    #         return handleError(e)

    def verifyWorkspace(self):
        try:
            return resp(admin.verifyWorkspace(collections))
        except Exception as e:
            return handleError(e)

    def gitInfo(self):
        try:
            return resp(git.info())
        except Exception as e:
            return handleError(e)

    def userInfo(self):
        try:
            return resp(user.info())
        except Exception as e:
            return handleError(e)

    def remoteLogin(self):
        try:
            return resp(user.remote_login())
        except Exception as e:
            return handleError(e)

    def setGithubInfo(self):
        try:
            return resp(user.set_github_info())
        except Exception as e:
            return handleError(e)

    def getAllGithubInfo(self):
        try:
            return user.get_all_github_info()
        except Exception as e:
            return handleError(e)

    def createPackageRedirect(self):
        return package.createPackageRedirect()

    def editPackageRedirect(self, id):

      return package.editPackageRedirect(id)

    def rebuildUSDACollection(self):
        try:
            return admin.rebuildUSDACollection(collections, usdaApiUrl)
        except Exception as e:
            return handleError(e)

    def gcmdSuggest(self):
        try:
            return resp(spectra.suggestGCMD())
        except Exception as e:
            return handleError(e)

    def topSuggest(self):
        try:
            return resp(spectra.suggestAttributeName())
        except Exception as e:
            return handleError(e)

    def topOverview(self):
        try:
            return resp(spectra.suggestOverview())
        except Exception as e:
            return handleError(e)

    def prepareWorkspace(self):
        try:
            return resp(workspaceController.prepare())
        except Exception as e:
            return handleError(e)

    def getWorkspace(self):
        try:
            return resp(workspaceController.get())
        except Exception as e:
            return handleError(e)

    def processResource(self):
        try:
            return resp(resource.process())
        except Exception as e:
            return handleError(e)

    def getResource(self):
        try:
            return resp(resource.get())
        except Exception as e:
            return handleError(e)

    def getResourceByName(self, package_id, resource_name):
        try:
            return resource.getByName(package_id, resource_name)
        except Exception as e:
            return handleError(e)

    def getSpectra(self):
        try:
            return resp(spectra.get())
        except Exception as e:
            return handleError(e)

    def getSpectraCount(self):
        try:
            return resp(resource.getSpectraCount())
        except Exception as e:
            return handleError(e)

    def getMetadataChunk(self):
        try:
            return resp(resource.getMetadataChunk())
        except Exception as e:
            return handleError(e)

    def getMetadataInfo(self):
        try:
            return resp(resource.getMetadataInfo())
        except Exception as e:
            return handleError(e)

    def pushToSearch(self):
        try:
            return workspaceController.pushToSearch()
        except Exception as e:
            return handleError(e)

def resp(msg, code=200, headers={}):
  if not isinstance(msg, str):
    msg = jsonStringify(msg)
  headers['Content-Type'] = 'application/json'
  return make_response((msg, 200, headers))