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
from ckanext.esis.lib.join import SheetJoin
from ckanext.esis.lib.push import Push
from ckanext.esis.lib.setup import WorkspaceSetup
from ckanext.esis.lib.process import ProcessWorkspace

#from ckan.controllers.package import PackageController
from multiprocessing import Process, Queue
import subprocess

# helpers from ./lib
joinlib = SheetJoin()

log = logging.getLogger(__name__)

# setup mongo connection
client = MongoClient(config._process_configs[1]['esis.mongo.url'])
db = client[config._process_configs[1]['esis.mongo.db']]

workspaceCollectionName = config._process_configs[1]['esis.mongo.workspace_collection']
workspaceCollection = db[workspaceCollectionName]


setup = WorkspaceSetup()
process = ProcessWorkspace()
push = Push()

setup.setCollection(workspaceCollection)
process.setCollection(workspaceCollection)

class WorkspaceController(BaseController):
    workspaceDir = ""


    def __init__(self):
        push.setHelpers(self, setup, process, joinlib)
        process.setHelpers(joinlib)

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

        return json.dumps(self._createOverviewResponse(resources, workspacePackage, ckanPackage, fresh))


    # API CALL
    # TODO: updating a resource layout, ignore, etc, may influence to amount of data joined to metadata
    #       How should we reflect that fact back in this call?  IE, the UI for that piece of metadata
    #       should be told of this update as well.
    # set the parse information for a given resources and package
    def setParseInformation(self):
        response.headers["Content-Type"] = "application/json"

        package_id = request.params.get('package_id')
        resource = json.loads(request.params.get('resource'))


        # option, if a resource id and a datasheet id are passed, then the full 'merged' view will be return
        datasheet_id = request.params.get('datasheet_id')

        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))

        # update the package workspace information
        workspaceResource = self._getById(workspacePackage['resources'], resource['id'])

        if workspaceResource == None:
            workspaceResource = {"id": resource['id'], "datasheets" : []}
            workspacePackage['resources'].append(workspaceResource)

        for key, value in resource.iteritems():
            if key == "datasheets":
                continue
            workspaceResource[key] = value

        if 'datasheets' in resource:
            for datasheet in resource['datasheets']:
                workspaceDatasheet = self._getById(workspaceResource['datasheets'], datasheet['id'])

                if workspaceDatasheet == None:
                    workspaceResource['datasheets'].append(datasheet)
                else:
                    for key, value in datasheet.iteritems():
                        workspaceDatasheet[key] = value

        # save back to mongo
        workspaceCollection.update({'package_id': package_id}, workspacePackage)

        resources = setup.resources(workspacePackage, ckanPackage, rootDir)
        # actually process the files on disk based on given configuration

        # this will make sure the info.json file is updated
        r = self._getById(resources,  resource['id'])
        if r == None: # this resource is being ignored
            if workspaceResource.get('ignore') == True:
                r = {
                    "ignore" : True,
                    "changes" : True,
                    "location" : "%s/%s/info.json" % (rootDir,  resource['id'])
                }
        else:
            r['changes'] = True
            r['location'] = "%s/%s/info.json" % (rootDir,  resource['id'])

        # TODO: can we optomize this since only one datasheet was update?
        process.resources(resources, workspacePackage, ckanPackage, rootDir)

        resp = self._createOverviewResponse(resources, workspacePackage, ckanPackage, fresh)

        if resource.get('id') != None and datasheet_id != None:
            newds = self._mergeDatasheet(resources, workspacePackage, resource.get('id'), datasheet_id)
            r = self._getById(resp['resources'], resource.get('id'))
            if r != None:
                ds = self._getById(r['datasheets'], datasheet_id)
                r['datasheets'].remove(ds)
                r['datasheets'].append(newds)

        return json.dumps(resp)

    # when resources are first uploaded, use this to set the default layout information
    def setDefaultLayout(self):
        response.headers["Content-Type"] = "application/json"

        package_id = request.params.get('package_id')
        layout = request.params.get('layout')
        resourceList = json.loads(request.params.get('resources')) # list or resource id's

        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))
        resources = setup.resources(workspacePackage, ckanPackage, rootDir)

        # process data... need to expand things like excel and zip files
        process.resources(resources, workspacePackage, ckanPackage, rootDir)

        # update the package workspace information with the default layout
        for id in resourceList:
            workspaceResource = self._getById(workspacePackage['resources'], id)
            resource = self._getById(resources, id)

            # this is most likely a non-data resource included in the upload,  the client doesn't
            # know this, just ignore
            if resource == None:
                continue

            if workspaceResource == None:
                workspaceResource = {"id": id, "datasheets" : []}
                workspacePackage['resources'].append(workspaceResource)

            if 'datasheets' in resource:
                for datasheet in resource['datasheets']:
                    workspaceDatasheet = self._getById(workspaceResource['datasheets'], datasheet['id'])

                    if workspaceDatasheet == None:
                        workspaceResource['datasheets'].append({
                            "id" : datasheet['id'],
                            "layout" : layout
                        })
                    else:
                        workspaceDatasheet["layout"] = layout

            # make sure we save
            resource['changes'] = True
            resource['location'] = "%s/%s/info.json" % (rootDir,  resource['id'])

        # save back to mongo
        workspaceCollection.update({'package_id': package_id}, workspacePackage)

        # now re-process data
        process.resources(resources, workspacePackage, ckanPackage, rootDir)

        return json.dumps(self._createOverviewResponse(resources, workspacePackage, ckanPackage, fresh))


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
    def getDatasheet(self):
        response.headers["Content-Type"] = "application/json"

        rid = request.params.get('resource_id')
        sid = request.params.get('datasheet_id')

        # initialize the workspace and get the package config as well as the ckan package
        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))

        # make sure all files on disk are up to date in the package
        resources = setup.resources(workspacePackage, ckanPackage, rootDir)

        process.resources(resources, workspacePackage, ckanPackage, rootDir)

        return json.dumps(self._mergeDatasheet(resources, workspacePackage, rid, sid))

    def _mergeDatasheet(self, resources, workspacePackage, rid, sid):
        r = self._getById(resources, rid)
        if r == None:
            r = {'datasheets': []}
        rWs = self._getById(workspacePackage['resources'], rid)
        if rWs == None:
            rWs = {'datasheets': []}

        s = self._getById(r['datasheets'], sid)
        if s == None:
            s = {}
        sWs = self._getById(rWs['datasheets'], sid)
        if sWs == None:
            sWs = {}

        for key, value in sWs.iteritems():
            s[key] = value

        return s


    # API CALL
    def processResource(self):
        response.headers["Content-Type"] = "application/json"

        rid = request.params.get('resource_id')

        # initialize the workspace and get the package config as well as the ckan package
        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))

        # see if the resource is ignored before we go any further
        workspaceResource = self._getById(workspacePackage['resources'], rid)
        if workspaceResource != None and workspaceResource.get('ignore') == True:
            ckanResource = self._getById(ckanPackage['resources'], rid)
            if ckanResource == None:
                return json.dumps({"error":True,"message":"resource not found"})

            return json.dumps({
                "id" : rid,
                "name" : ckanResource["name"],
                "type" : "datafile",
                "datasheets" : [],
                "ignore" : True
            })


        # make sure all files on disk are up to date in the package
        resources = setup.resources(workspacePackage, ckanPackage, rootDir)

        return json.dumps(self._getMergedResources(rid, resources, workspacePackage))


    def setAttributeInfo(self):
        response.headers["Content-Type"] = "application/json"

        package_id = request.params.get('package_id')
        attr = json.loads(request.params.get('attribute'))

        # initialize the workspace and get the package config as well as the ckan package
        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))

        if not 'attributes' in workspacePackage:
            workspacePackage['attributes'] = {}

        name = attr['name']
        del attr['name']

        if name in workspacePackage['attributes']:
            del workspacePackage['attributes'][name]

        workspacePackage['attributes'][name] = attr
        workspaceCollection.update({'package_id': package_id}, workspacePackage)

        return json.dumps({'success': True})

    def setDatasetAttributes(self):
        response.headers["Content-Type"] = "application/json"

        package_id = request.params.get('package_id')
        info = json.loads(request.params.get('datasetAttributes'))

        # initialize the workspace and get the package config as well as the ckan package
        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))

        workspacePackage['datasetAttributes'] = info

        workspaceCollection.update({'package_id': package_id}, workspacePackage)

        return json.dumps({'success': True})

    def setAttributeMap(self):
        response.headers["Content-Type"] = "application/json"

        package_id = request.params.get('package_id')
        map = json.loads(request.params.get('map'))

        # initialize the workspace and get the package config as well as the ckan package
        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))

        workspacePackage['attributeMap'] = map

        workspaceCollection.update({'package_id': package_id}, workspacePackage)

        return json.dumps({'success': True})

    # important, this will assume all is good with the dataset
    def getSpectra(self):
        response.headers["Content-Type"] = "application/json"

        package_id = request.params.get('package_id')
        resource_id = request.params.get('resource_id')
        datasheet_id = request.params.get('datasheet_id')
        index = int(request.params.get('index'))

        # initialize the workspace and get the package config as well as the ckan package
        (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))

        # make sure all files on disk are up to date in the package
        resources = setup.resources(workspacePackage, ckanPackage, rootDir)
        process.resources(resources, workspacePackage, ckanPackage, rootDir)

        resource = self._getMergedResources(resource_id, resources, workspacePackage, removeValues=False)

        package = self._mergeWorkspace(resources, workspacePackage, ckanPackage, fresh)

        spectra = process.getSpectra(package, resource, self.workspaceDir, datasheet_id, index)
        return json.dumps(spectra)

    def pushToSearch(self):
        response.headers["Content-Type"] = "application/json"

        package_id = request.params.get('package_id')

        return json.dumps(push.pushToSearch(package_id))

    def _getMergedResources(self, resourceId, resources, workspacePackage, removeValues=True):
        resource = self._getById(resources, resourceId)
        if resource == None:
            return {"error":True,"message":"resource not found"}

        workspaceResource = self._getById(workspacePackage['resources'], resourceId)
        if workspaceResource == None:
            workspaceResource = {"datasheets":[]}

        for datasheet in resource['datasheets']:
            workspaceDs = self._getById(workspaceResource['datasheets'], datasheet['id'])
            if workspaceDs != None:
                for key, value in workspaceDs.iteritems():
                    datasheet[key] = value
                if 'matchValues' in datasheet and removeValues:
                    del datasheet['matchValues']

        return resource


    #
    # HELPERS
    #

    def _createOverviewResponse(self, resources, workspacePackage, ckanPackage, fresh):
        attrs = {}
        arr = []
        dataResources = []
        wavelengths = []
        for resource in resources:
            datasheets = []
            for datasheet in resource['datasheets']:

                if 'attributes' in datasheet and datasheet.get('ignore') != True:
                    for attr in datasheet['attributes']:
                        if not attr['name'] in attrs and attr['type'] != 'wavelength':
                            respAttr = {
                                "type" : attr["type"],
                                "scope" : attr["scope"],
                                "units" : attr.get("units")
                            }
                            if 'attributes' in workspacePackage:
                                # override with any user modifications
                                if attr['name'] in workspacePackage['attributes']:
                                    for key, value in workspacePackage['attributes'][attr['name']].iteritems():
                                        respAttr[key] = value
                            attrs[attr['name']] = respAttr

                        if attr['type'] == 'wavelength' and not attr['name'] in wavelengths:
                            wavelengths.append(attr['name'])

                f = {
                    "id" : datasheet["id"],
                    "name" : datasheet["name"],
                    "layout" : datasheet.get("layout"),
                    "spectra_count" : datasheet.get("spectra_count")
                }
                if 'ignore' in datasheet:
                    f['ignore'] = datasheet['ignore']
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

        # now add data resources that have been ignored
        if 'resources' in workspacePackage:
            for workspaceResource in workspacePackage['resources']:
                if workspaceResource.get('ignore') == True:
                    r = self._getById(ckanPackage['resources'], workspaceResource['id'])
                    arr.append({
                        "name" : r["name"],
                        "type" : "datafile",
                        "id"   : r["id"],
                        "ignore" : True
                    })
                    dataResources.append(workspaceResource["id"])

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

        return {
            "resources"  : arr,
            "wavelengths" : wavelengths,
            "attributes" : attrs,
            "datasetAttributes" : workspacePackage.get("datasetAttributes"),
            "attributeMap" : workspacePackage.get("attributeMap"),
            "package" : ckanPackage,
            "fresh" : fresh
        }

    # this is a lot like createOverviewResponse, but does a full merge... ie
    # does redact any fields in response
    def _mergeWorkspace(self, resources, workspacePackage, ckanPackage, fresh):
                # create response
        attrs = {}
        arr = []
        dataResources = []
        wavelengths = []
        for resource in resources:
            datasheets = []
            for datasheet in resource['datasheets']:

                if 'attributes' in datasheet and datasheet.get('ignore') != True:
                    for attr in datasheet['attributes']:
                        if not attr['name'] in attrs and attr['type'] != 'wavelength':
                            if 'attributes' in workspacePackage:
                                # override with any user modifications
                                if attr['name'] in workspacePackage['attributes']:
                                    for key, value in workspacePackage['attributes'][attr['name']].iteritems():
                                        attr[key] = value
                            attrs[attr['name']] = attr

                        if attr['type'] == 'wavelength' and not attr['name'] in wavelengths:
                            wavelengths.append(attr['name'])
                            if 'original' in attr: # this might be needed when we parse
                                # perhaps it should go in a different array
                                wavelengths.append(attr['original'])
                datasheets.append(datasheet)

            dataResources.append(resource["id"])
            resource["datasheets"] = datasheets
            arr.append(resource)

        # now add data resources that have been ignored
        if 'resources' in workspacePackage:
            for workspaceResource in workspacePackage['resources']:
                if workspaceResource.get('ignore') == True:
                    r = self._getById(ckanPackage['resources'], workspaceResource['id'])
                    arr.append({
                        "name" : r["name"],
                        "type" : "datafile",
                        "id"   : r["id"],
                        "ignore" : True
                    })
                    dataResources.append(workspaceResource["id"])

        # now add non-data resources
        for r in ckanPackage['resources']:
            if not r['id'] in dataResources:
                arr.append({
                    "name" : r["name"],
                    "type" : "generic",
                    "id"   : r["id"]
                })

        return {
            "resources"  : arr,
            "wavelengths" : wavelengths,
            "attributes" : attrs,
            "datasetAttributes" : workspacePackage.get("datasetAttributes"),
            "attributeMap" : workspacePackage.get("attributeMap"),
            "package" : ckanPackage,
            "fresh" : fresh
        }

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