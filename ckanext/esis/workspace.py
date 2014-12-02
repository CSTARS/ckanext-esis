import logging
import re, zlib, StringIO
#import simplejson as json
import ujson as json
from pymongo import MongoClient
from pylons import config
import urllib2
import dateutil.parser
import os.path
import shutil


from ckan.lib.base import c, model, BaseController
import ckan.logic as logic
import ckan.lib.helpers as h
from ckan.common import request, response
import inspect
from bson.code import Code
from bson.son import SON

import hashlib

from ckanext.esis.lib.setup import WorkspaceSetup
from ckanext.esis.lib.process import ProcessWorkspace

from ckan.controllers.package import PackageController
from multiprocessing import Process, Queue
import subprocess


log = logging.getLogger(__name__)

# setup mongo connection
client = MongoClient(config._process_configs[1]['esis.mongo.url'])
db = client[config._process_configs[1]['esis.mongo.db']]

workspaceCollectionName = config._process_configs[1]['esis.mongo.workspace_collection']
workspaceCollection = db[workspaceCollectionName]


setup = WorkspaceSetup()
process = ProcessWorkspace()

setup.setCollection(workspaceCollection)
process.setCollection(workspaceCollection)

class WorkspaceController(PackageController):
    workspaceDir = ""


    def __init__(self):
        self.workspaceDir = config._process_configs[1]['ecosis.workspace.root']

        if not os.path.exists(self.workspaceDir):
            raise NameError("Workspace %s doesn't exist" % self.workspaceDir)
            exit(-1)

        if not re.match(r".*/$", self.workspaceDir):
           self.workspaceDir += "/"
        self.workspaceDir += "workspace"

        if not os.path.exists(self.workspaceDir):
            os.makedirs(self.workspaceDir)

    # API CALL
    # basically runs workspace setup and responds with workspace overview
    def processWorkspace(self):
        response.headers["Content-Type"] = "application/json"

        # initialize the workspace and get the package config as well as the ckan package
        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))
        # make sure all files on disk are up to date in the package
        resources = setup.resources(workspacePackage, ckanPackage, rootDir)
        # actually process the files on disk based on given configuration
        process.resources(resources, workspacePackage, ckanPackage, rootDir)

        # create response
        attrs = {}
        arr = []
        dataResources = []
        wavelengths = []
        for resource in resources:
            datasheets = []
            for datasheet in resource['datasheets']:

                if 'attributes' in datasheet:
                    for attr in datasheet['attributes']:
                        if not attr['name'] in attrs and attr['type'] != 'wavelength':
                            attrs[attr['name']] = {
                                "type" : attr["type"],
                                "scope" : attr["scope"],
                                "units" : attr["units"]
                            }
                        if attr['type'] == 'wavelength' and not attr['name'] in wavelengths:
                            wavelengths.append(attr['name'])

                f = {
                    "id" : datasheet["id"],
                    "name" : datasheet["name"],
                    "layout" : datasheet.get("layout"),
                    "spectra_count" : datasheet.get("spectra_count")
                }
                if 'metadata' in datasheet:
                    f['metadata'] = datasheet['metadata']
                if 'matches' in datasheet:
                    f['matches'] = datasheet['matches']
                if 'sheetname' in datasheet:
                    f['sheetname'] = datasheet['sheetname']
                if 'error' in datasheet:
                    f['error'] = datasheet.get('error'),
                    f['message'] = datasheet.get('message')
                datasheets.append(f)

            dataResources.append(resource["id"])
            arr.append({
                "name" : resource["name"],
                "type" : resource["type"],
                "id"   : resource["id"],
                "datasheets" : datasheets
            })

        # now add non-data resources
        for r in ckanPackage['resources']:
            if not r['id'] in dataResources:
                arr.append({
                    "name" : r["name"],
                    "type" : "generic",
                    "id"   : r["id"]
                })

        # save wire space
        del ckanPackage['resources']

        return json.dumps({
            "resources"  : arr,
            "wavelengths" : wavelengths,
            "attributes" : attrs,
            "package" : ckanPackage,
            "fresh" : fresh
        })

    # API CALL
    # set the parse information for a given resources and package
    def setParseInformation(self):
        response.headers["Content-Type"] = "application/json"

        package_id = request.params.get('package_id')
        resource = json.loads(request.params.get('resource'))

        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))

        if not 'resources' in workspacePackage:
            workspacePackage['resources'] = []

        # update the package workspace information
        # TODO: Make sure any resource that has an updated config is marked with
        # a flag for changes detected

        workspaceResource = self._getById(workspacePackage['resources'], resource['id'])

        if workspaceResource == None:
            workspaceResource = {"id": resource['id'], "datasheets" : []}

        for key, value in resource.iteritems():
            if key == "datasheets":
                continue
            workspaceResource[key] = value

        for datasheet in resource['datasheets']:
            workspaceDatasheet = self._getById(workspaceResource['datasheets'], datasheet['id'])

            if workspaceDatasheet == None:
                workspaceResource['datasheets'].append(datasheet)
            else:
                for key, value in datasheet.iteritems():
                    workspaceDatasheet[key] = value

        # save back to mongo
        workspaceCollection.update({'id': package_id}, workspacePackage)

        resources = setup.resources(workspacePackage, ckanPackage, rootDir)
        # actually process the files on disk based on given configuration

        # this will make sure the info.json file is updated
        r = self._getById(resources,  resource['id'])
        r['changes'] = True
        r['location'] = "%s/%s/info.json" % (rootDir,  resource['id'])

        # TODO: can we optomize this since only one datasheet was update?
        process.resources(resources, workspacePackage, ckanPackage, rootDir)

        return json.dumps(self._getMergedResources(resource['id'], resources, workspacePackage))


    # API CALL
    # this is kind of a helper for above, updates the metadata join information
    # for a single piece of metadata, returning it's current join state (counts)
    def updateJoin(self):
        response.headers["Content-Type"] = "application/json"

        package_id = request.params.get('package_id')
        resource_id = request.params.get('resource_id')
        metadata = json.loads(request.params.get('metadata'))

        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))

        if not 'resources' in workspacePackage:
            workspacePackage['resources'] = []

        # update the package workspace information
        workspaceResource = self._getById(workspacePackage['resources'], resource_id)
        if workspaceResource == None:
            workspaceResource = {
                "id" : resource_id,
                "datasheets" : [metadata]
            }
            workspacePackage['resources'].append(workspaceResource)
        else:
            dsConfig = self._getById(workspaceResource['datasheets'], metadata['id'])
            if dsConfig != None:
                workspaceResource['datasheets'].remove(dsConfig)
            workspaceResource['datasheets'].append(metadata)

        # think we are doing this above
        #self._updateWorkspaceConfig(resourceConfig, packageWorkspace['resources'])

        resources = setup.resources(workspacePackage, ckanPackage, rootDir)
        # actually process the files on disk based on given configuration

        # this will make sure the info.json file is updated
        r = self._getById(resources, resource_id)
        r['changes'] = True
        r['location'] = "%s/%s/info.json" % (rootDir, resource_id)

        # TODO: can we optomize this since only one datasheet was update?
        process.resources(resources, workspacePackage, ckanPackage, rootDir)

        # save back to mongo
        workspaceCollection.update({'package_id': package_id}, workspacePackage)

        ds = self._getById(r['datasheets'], metadata['id'])
        del ds['matchValues']
        del ds['location']

        return json.dumps(ds)


    # API CALL
    def processResource(self):
        response.headers["Content-Type"] = "application/json"

        rid = request.params.get('resource_id')

        # initialize the workspace and get the package config as well as the ckan package
        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))
        # make sure all files on disk are up to date in the package
        resources = setup.resources(workspacePackage, ckanPackage, rootDir)

        return json.dumps(self._getMergedResources(rid, resources, workspacePackage))


    def _getMergedResources(self, resourceId, resources, workspacePackage):
        resource = self._getById(resources, resourceId)
        if resource == None:
            return json.dumps({"error":True,"message":"resource not found"})

        workspaceResource = self._getById(workspacePackage['resources'], resourceId)
        if workspaceResource == None:
            workspaceResource = {"datasheets":[]}

        for datasheet in resource['datasheets']:
            workspaceDs = self._getById(workspaceResource['datasheets'], datasheet['id'])
            if workspaceDs != None:
                for key, value in workspaceDs.iteritems():
                    datasheet[key] = value
                if 'matchValues' in datasheet:
                    del datasheet['matchValues']

        return resource


    #
    # HELPERS
    #

    # given an array of objects that have an id attribute, get one by id
    def _getById(self, arr, id):
        if arr == None:
            return None

        for obj in arr:
            if obj.get('id') == id:
                return obj
        return None


    # is a file marked as metadata
    def _isMetadata(self, f):
        if 'metadata' in f:
            return f['metadata']
        return False

    def _saveJson(self, file, data):
        f = open(file, 'w')
        json.dump(data, f)
        f.close()