import logging
import re
import ujson as json
from pymongo import MongoClient
from pylons import config
import urllib2


import ckan.lib.uploader as uploader
from ckan.lib.base import c, model
import ckan.logic as logic
import ckan.lib.helpers as h
from ckan.common import request, response
import inspect
from bson.code import Code
from bson.son import SON
import os, shutil

from ckanext.esis.lib.setup import WorkspaceSetup
from ckanext.esis.lib.process import ProcessWorkspace
from ckanext.esis.lib.join import SheetJoin
import ckanext.esis.lib.auth as auth
import ckanext.esis.lib.units as units
from ckanext.esis.lib.mapReduce import mapreducePackage

from ckan.controllers.package import PackageController
import subprocess


log = logging.getLogger(__name__)

# setup mongo connection
client = MongoClient(config._process_configs[1]['esis.mongo.url'])
db = client[config._process_configs[1]['esis.mongo.db']]

spectraCollection = db[config._process_configs[1]['esis.mongo.spectra_collection']]

searchCollectionName = config._process_configs[1]['esis.mongo.search_collection']
searchCollection = db[searchCollectionName]

workspaceCollectionName = config._process_configs[1]['esis.mongo.workspace_collection']
workspaceCollection = db[workspaceCollectionName]

usdaCollection = db[config._process_configs[1]['esis.mongo.usda_collection']]

joinlib = SheetJoin()
setup = WorkspaceSetup()
process = ProcessWorkspace()

setup.setCollection(workspaceCollection, None)
process.setCollection(workspaceCollection, usdaCollection)

class SpectraController(PackageController):
    mapreduce = {}
    # used for git commands
    localdir = ""
    workspaceDir = ""

    def __init__(self):
        process.setHelpers(joinlib)

        self.localdir = re.sub(r'/\w*.pyc?', '', inspect.getfile(self.__class__))

        self.workspaceDir = config._process_configs[1]['ecosis.workspace.root']
        if not os.path.exists(self.workspaceDir):
            raise NameError("Workspace %s doesn't exist" % self.workspaceDir)
            exit(-1)

        if not re.match(r".*/$", self.workspaceDir):
           self.workspaceDir += "/"
        self.workspaceDir += "workspace"


    def deletePackage(self):
        response.headers["Content-Type"] = "application/json"
        params = self._get_request_data(request)

        context = {'model': model, 'user': c.user}
        logic.get_action('package_delete')(context, params)

        searchCollection.remove({'_id':params['id']})
        spectraCollection.remove({'ecosis.package_id':params['id']})

        workspace = workspaceCollection.find_one({'package_id': params['id']})
        if workspace != None:
            workspaceCollection.remove({'package_id': params['id']})

            # remove from workspace if there
            if os.path.exists("%s/%s" % (self.workspaceDir, workspace["package_name"])):
                shutil.rmtree("%s/%s" % (self.workspaceDir, workspace["package_name"]))

        return json.dumps({'success': True})

    def verifyPrivate(self):
        response.headers["Content-Type"] = "application/json"
        package_id = request.params.get('id')
        auth.hasAccess(package_id)

        context = {'model': model, 'user': c.user}

        searchCollection.remove({'_id': package_id})
        spectraCollection.remove({'ecosis.package_id': package_id})

        return json.dumps({'success': True})

    # first we need to look up if this resource is a metadata resource
    # if it is, this complicates things, otherwise just pull from
    # spectra collection and then do normal delete
    def deleteResource(self):
        params = self._get_request_data(request)

        context = {'model': model, 'user': c.user}

        # TODO
        # auth.hasAccess(package_id)

        # remove resource from disk - normally this doesn't happen
        r = logic.get_action('resource_show')(context, params)
        if r.get('url_type') == "upload":
            upload = uploader.ResourceUpload(r)
            path = upload.get_path(r['id'])
            if os.path.exists(path):
                os.remove(path)

        logic.get_action('resource_delete')(context, params)
        id = params.get('id')

        # now remove any spectra that were related
        spectraCollection.remove({'ecosis.resource_id': id})

        # remove from workspace
        workspace = workspaceCollection.find_one({"resources.id": id})

        r = None
        if workspace != None:
            for resource in workspace['resources']:
                if resource['id'] == id:
                    r = resource
                    break

            workspace['resources'].remove(r)
            workspaceCollection.update({'package_id': workspace['package_id']}, workspace)

            # remove from workspace if there
            if os.path.exists("%s/%s/%s" % (self.workspaceDir, workspace["package_name"], r['id'])):
                shutil.rmtree("%s/%s/%s" % (self.workspaceDir, workspace["package_name"], r['id']))

            # reprocess all metadata
            (workspacePackage, ckanPackage, rootDir, fresh) = setup.init(workspace['package_id'])
            resources = setup.resources(workspacePackage, ckanPackage, rootDir)

            # remove any cached match counts
            for resource in resources:
                if resource.get('datasheets') == None:
                    continue

                for sheet in resource.get('datasheets'):
                    if sheet.get('metadata') != True:
                        continue
                    if sheet.get('matches') == None:
                        continue

                    matches = sheet.get('matches')

                    for datasheet in r.get('datasheets'):
                        if matches.get(datasheet.get('id')):
                            del matches[datasheet.get('id')]

                            # save the changes
                            resource['changes'] = True
                            resource['location'] = "%s/%s/info.json" % (rootDir, resource['id'])

            process.resources(resources, workspacePackage, ckanPackage, rootDir)

            # save the units for the package
            units.updatePackageUnits(ckanPackage, units.getAllAttributes(resources))


    # rebuild entire search index
    def rebuildIndex(self):
        context = {'model': model, 'user': c.user}

        if not c.userobj.sysadmin:
            return json.dumps({'error':True, 'message':'nope'})

        list = logic.get_action('package_list')(context,{})

        # clear the current collection
        searchCollection.remove({})

        for pkgId in list:
            context = {'model': model, 'user': c.user}
            ckanPackage = logic.get_action('package_show')(context,{id: pkgId})
            #(workspacePackage, ckanPackage, rootDir, fresh) = setup.init(pkgId)

            mapreducePackage(ckanPackage, spectraCollection, searchCollection)

        return json.dumps({'success': True, 'rebuildCount': len(list)})

    def userInfo(self):
        response.headers["Content-Type"] = "application/json"
        if len(c.user) == 0:
            return json.dumps({"loggedIn": False})

        context = {'model': model, 'user': c.user}
        # see line 604 or ckan/logic/action/get about params for this method
        orgs = logic.get_action('organization_list_for_user')(context,{"permission": "create_dataset"})

        return json.dumps({
            "loggedIn": True,
            "username": c.user,
            "organizations" : orgs
        })

    def gitInfo(self):
        response.headers["Content-Type"] = "application/json"
        resp = {}

        cmd = "git describe --tags"
        process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=self.localdir)
        resp["version"] = process.communicate()[0]

        cmd = "git branch"
        process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=self.localdir)
        resp["branch"] = process.communicate()[0].split("\n")
        for branch in resp["branch"]:
            if "*" in branch:
                resp["branch"] = branch.replace("* ","")
                break

        cmd = "git log -1"
        process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=self.localdir)
        resp["commit"] = re.sub(r'\n.*', '', process.communicate()[0]).replace("commit ","")


        return json.dumps(resp)

    def clean(self):
        response.headers["Content-Type"] = "application/json"

        context = {'model': model, 'user': c.user}

        if c.userobj == None:
            return json.dumps({'error':True, 'message':'nope'})
        if not c.userobj.sysadmin:
            return json.dumps({'error':True, 'message':'nope'})

        cmd = "git branch"
        process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=self.localdir)
        branches = process.communicate()[0].split("\n")
        for branch in branches:
            if "*" in branch:
                branch = branch.replace("* ","")
                if branch == 'master':
                    return json.dumps({'error':True, 'message':'operation can\'t be preformed on branch master'})

        packages = logic.get_action('package_list')(context, {})

        for package in packages:
            package = logic.get_action('package_show')(context, {'id': package})
            # make sure all resources are removed from disk
            if 'resources' in package:
                for r in package['resources']:
                    if r.get('url_type') == "upload":
                        upload = uploader.ResourceUpload(r)
                        path = upload.get_path(r['id'])
                        if os.path.exists(path):
                            os.remove(path)
            logic.get_action('package_delete')(context, {'id': package['id']})

        # clear mongo
        workspaceCollection.remove({})
        spectraCollection.remove({})
        searchCollection.remove({})

        return json.dumps({
            'removed': packages,
            'message' : 'Go to /ckan-admin/trash to finish cleanup'
        })

    # replicating default param parsing in ckan... really python... really...
    # TODO: see if this is really needed
    def _get_request_data(self, request):
        try:
            keys = request.POST.keys()
            # Parsing breaks if there is a = in the value, so for now
            # we will check if the data is actually all in a single key
            if keys and request.POST[keys[0]] in [u'1', u'']:
                request_data = keys[0]
            else:
                request_data = urllib2.unquote_plus(request.body)
        except Exception, inst:
            msg = "Could not find the POST data: %r : %s" % \
                  (request.POST, inst)
            raise ValueError(msg)

        try:
            request_data = h.json.loads(request_data, encoding='utf8')
        except ValueError, e:
            raise ValueError('Error decoding JSON data. '
                             'Error: %r '
                             'JSON data extracted from the request: %r' %
                              (e, request_data))
        return request_data

    def createPackageRedirect(self):
        group = request.params.get('group')
        response.status_int = 307

        if group == None:
            response.headers["Location"] = "/import/"
        else:
            response.headers["Location"] = "/import/?group=%s" % group.encode('ascii','ignore')

        return "Redirecting"

    def editPackageRedirect(self, id):
        response.status_int = 307
        response.headers["Location"] = "/import/?id=%s" % id.encode('ascii','ignore')
        return "Redirecting"