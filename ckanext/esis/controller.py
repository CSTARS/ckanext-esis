import logging
import re
import ujson as json
from pymongo import MongoClient
from pylons import config
import urllib2


import ckan.lib.uploader as uploader
from ckan.lib.base import c, model, BaseController
import ckan.logic as logic
import ckan.lib.helpers as h
from ckan.common import request, response
import inspect
from bson.code import Code
from bson.son import SON
import os, shutil

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

class SpectraController(PackageController):
    mapreduce = {}
    # used for git commands
    localdir = ""
    workspaceDir = ""

    def __init__(self):
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

    # first we need to look up if this resource is a metadata resource
    # if it is, this complicates things, otherwise just pull from
    # spectra collection and then do normal delete
    def deleteResource(self):
        params = self._get_request_data(request)

        context = {'model': model, 'user': c.user}

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

    # rebuild entire search index
    # TODO: this should be admin only!!
    def rebuildIndex(self):
        context = {'model': model, 'user': c.user}

        if not c.userobj.sysadmin:
            return json.dumps({'error':True, 'message':'nope'})

        list = logic.get_action('package_list')(context,{})

        # clear the current collection
        searchCollection.remove({})

        for pkgId in list:
            pkg = logic.get_action('package_show')(context,{'id': pkgId})
            self._update_mapReduce(pkg)

        return json.dumps({'success': True, 'rebuildCount': len(list)})

    # TODO: this needs to be called whenever an organization is updated
    def _update_mapReduce(self, pkg):
        # if the package is private, remove a return
        if pkg['private'] == True:
            searchCollection.remove({'_id': pkg['id']})
            return

        map = Code(self.mapreduce['map'])
        reduce = Code(self.mapreduce['reduce'])
        #finalize = Code(self.mapreduce['finalize'])
        #spectraCollection.map_reduce(map, reduce, finalize=finalize, out=SON([("merge", searchCollectionName)]), query={"ecosis.package_id": pkg['id']})
        spectraCollection.map_reduce(map, reduce, out=SON([("merge", searchCollectionName)]), query={"ecosis.package_id": pkg['id']})

        organization_name = ""
        organization_id = ""
        organization_image_url = ""
        keywords = []

        for item in pkg['tags']:
            keywords.append(item['display_name'])

        if 'organization' in pkg:
            if pkg['organization'] != None:
                organization_name = pkg['organization']['title']
                organization_id = pkg['organization']['id']
                organization_image_url = '/uploads/group/%s' % pkg['organization']['image_url']

        # make sure the map reduce did not create a null collection, if so, remove
        # This means there is no spectra
        item = searchCollection.find_one({'_id': pkg['id'], 'value': None})

        # now see if we have a group by attribute...

        if item != None:
            searchCollection.remove({'_id': pkg['id']})
        else:
            # TODO: what does this affect
            #item = packageCollection.find_one({'package_id': pkg['id']},{'attributes.dataset.group_by': 1})
            #if item == None:
            #    return

            # Kinda a hack .... now let's set the description in the map-reduce collection
            setValues = {'$set' :
                {
                    'value.ecosis.description': pkg['notes'],
                    'value.ecosis.keywords': keywords,
                    'value.ecosis.organization_name' : organization_name,
                    'value.ecosis.organization_id' : organization_id,
                    'value.ecosis.organization_image_url' : organization_image_url
                }
            }

            searchCollection.update(
                {'_id': pkg['id']},
                setValues
            )

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
            response.headers["Location"] = "/editor/"
        else:
            response.headers["Location"] = "/editor/?group=%s" % group.encode('ascii','ignore')

        return "Redirecting"

    def editPackageRedirect(self, id):
        response.status_int = 307
        response.headers["Location"] = "/editor/?id=%s" % id.encode('ascii','ignore')
        return "Redirecting"