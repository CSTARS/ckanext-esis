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
import zipfile

from ckan.lib.base import c, model, BaseController
import ckan.logic as logic
import ckan.lib.helpers as h
from ckan.common import request, response
import inspect
from bson.code import Code
from bson.son import SON
import ckan.lib.uploader as uploader

from ckan.controllers.package import PackageController
from multiprocessing import Process, Queue
import subprocess


log = logging.getLogger(__name__)

# setup mongo connection
client = MongoClient(config._process_configs[1]['esis.mongo.url'])
db = client[config._process_configs[1]['esis.mongo.db']]
usdaCollection = db[config._process_configs[1]['esis.mongo.usda_collection']]
spectraCollection = db[config._process_configs[1]['esis.mongo.spectra_collection']]
packageCollection = db[config._process_configs[1]['esis.mongo.package_collection']]
metadataCollection = db[config._process_configs[1]['esis.mongo.metadata_collection']]
searchCollectionName = config._process_configs[1]['esis.mongo.search_collection']
searchCollection = db[searchCollectionName]

class WorkspaceController(PackageController):
    workspaceDir = ""
    dataExtension = ["xlsx","xls","spectra","csv","tsv"]

    WORKSPACE_DIR = {
        "GITHUB" : "/github",
        "GOOGLE" : "/google",
        "CKAN" : "/ckan",
        "PARSED" : "/parsed"
    }

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

    # Takes a package_id and initializes workspace if it doesn't exist
    # if it does, checks md5 hash and re-parses any new or updates files
    def initWorkspace(self):
        context = {'model': model, 'user': c.user}
        ckanPackage = logic.get_action('package_show')(context, {'id': request.params.get('package_id')})

        # TODO: this will be remove and become a check
        dir = "%s/%s" % (self.workspaceDir, ckanPackage['name'])
        print dir
        if os.path.exists(dir):
            shutil.rmtree(dir)
        os.makedirs(dir)

        return json.dumps({
            "resources" : self._processResources(ckanPackage, dir)
        })

    # process all of the resources
    def _processResources(self, pkg, dir):
        resources = []
        for r in pkg['resources']:
            resp = self._processResource(pkg, r, dir)
            if resp != None:
                resources.append(resp)
        return resources

    # process and individual resource
    def _processResource(self, pkg, r, dir):

        # this is a url link
        if r['url_type'] == None:
            if re.match(r".*github.com.*", r['url']):
                return self._processGitUrl(pkg, r, dir)
            return self._resourceError(r, 'Unrecognized git url')

        ext = self._getFileExtension(r['name'])

        parseData = self._getParseFile(r, dir)

        # extract zip file
        if ext == "zip":
            print "Found Zip:"

            # init resource dir
            self._initResourceDir(r, dir)

            # create dir for zip
            zipDir = "%s/%s/files" % (dir, r['id'])

            files = []
            z = zipfile.ZipFile(self._getLocalResourcePath(r), "r")
            for info in z.infolist():
                if self._isDataFile(info.filename):
                    parts = info.filename.split("/")

                    zipPath = ""
                    for i in range(0, len(parts)-1):
                        zipPath += parts[i]+"/"

                    z.extract(info, "%s/%s" % (zipDir, zipPath))

                    files.append({
                        "name" : re.sub(r".*/", "", info.filename),
                        "location" : "%s/%s" % (re.sub(self.workspaceDir, "", zipDir), zipPath)
                    })

            return {
                "name" : r["name"],
                "id"   : r["id"],
                "files" : files,
                "type" : "zip",
                "url_type" : r["url_type"]
            }

            #with  as z:
            #    z.extractall(zipDir)
        elif ext in self.dataExtension:
            print "Found dataType: %s" % ext

            # init resource dir
            self._initResourceDir(r, dir)

            # link in file
            os.symlink(self._getLocalResourcePath(r), "%s/%s/files/%s" % (dir, r['id'], r['name']))

            return {
                "name" : r["name"],
                "id"   : r["id"],
                "files" : [{
                    "name" : r['name'],
                    "location" : "%s/%s/files/" % (re.sub(self.workspaceDir, "", dir), r['id'])
                }],
                "type" : "zip",
                "url_type" : r["url_type"]
            }
        else:
            print "Found Unknown: %s" % r.name

        return None

    def _processGitUrl(self, pkg, r, dir):
        print "Found Git Repo"

        gitDir = "%s/%s" % (dir, r['id'])
        repoName = re.sub(r"/$","", r['url'])
        repoName = re.sub(r".*/", "", repoName)
        repoName = re.sub(r".git$","",repoName)

        parseData = self._getParseFile(r, dir)

        if os.path.exists(gitDir):
            # get the parsed data file
            # TODO: should we move on?  This is badness, but should we really choke here?
            if parseData == 'None':
                raise NameError("Git Repo exists but no existing parse data found for %s" % r['id'])

            # update git repo
            gitDir = "%s/%s" % (gitDir, repoName)
            cmd = "git pull"
            process = subprocess.Popen(cmd.split(), cwd=gitDir)
            process.wait()

            # get current commit
            cmd = "git log -1"
            process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=gitDir)
            commit = re.sub(r'\n.*', '', process.communicate()[0]).replace("commit ","")

            # don't need to do anything to commit is the same
            if parseData['commit'] == commit:
                return parseData

        else:
            parseData = {}

            os.makedirs(gitDir)
            process = subprocess.Popen(["git","clone",r['url'],'files'], cwd=gitDir)
            process.wait()

            #checking for good clone
            hiddenGitDir = "%s/files/.git" % (gitDir)
            if not os.path.exists(hiddenGitDir):
                raise NameError("Failed to clone %s, dir does not exists %s" % (repoName, hiddenGitDir))

            gitDir = "%s/files" % gitDir
            cmd = "git log -1"
            process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=gitDir)
            parseData['commit'] = re.sub(r'\n.*', '', process.communicate()[0]).replace("commit ","")

            # set some other attributes for processed data file
            parseData['name'] = r['name']
            parseData['url'] = r['url']
            parseData['type'] = 'github'
            parseData['repo'] = repoName

        parseData['files'] = []

        # now walk tree and get attribute information
        for root, dirs, files in os.walk(gitDir):
            # ignore .git directory
            if re.match(r".*/\.git.*", root):
                continue

            for f in files:
                if self._isDataFile(f):
                    parseData['files'].append({
                        "name" : f,
                        "location" : re.sub(self.workspaceDir, "", root)
                    })

        # now parse information for known data files
        for file in parseData['files']:
            self._processFile(file)

        return parseData

    # actually parse file information object
    # must have name and location
    def _processFile(self, f):
        self._getFileExtension(filename)


    # is this a known data file type (based on extension)
    def _isDataFile(self, filename):
        if self._getFileExtension(filename) in self.dataExtension:
            return True
        return False

    # get the extension from a filename
    def _getFileExtension(self, filename):
         return re.sub(r".*\.", "", filename)

    # get the location of a ckan file on disk from a ckan resource object
    def _getLocalResourcePath(self, r):
        upload = uploader.ResourceUpload(r)
        return upload.get_path(r['id'])

    def _resourceError(self, r, msg):
        return {
            "error" : True,
            "message" : msg,
            "id" : r['id'],
            "name" : r["name"],
            "url" : r["url"],
            "url_type" : r["url_type"]
        }

    # get the parse data file if on exists
    def _getParseFile(self, r, dir):
        parsedFile = "%s/%s/info.json" % (dir, r['id'])

        if not os.path.exists(parsedFile):
            return None

        file = open(parsedFile, 'r')
        parseData = json.loads(file.read())
        file.close()

        return parseData

    # create a resource director if it doesn't exist
    def _initResourceDir(self, r, dir):
        if not os.path.exists("%s/%s" % (dir, r['id'])):
            os.makedirs("%s/%s/files" % (dir, r['id']))