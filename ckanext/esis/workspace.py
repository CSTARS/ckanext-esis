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
import hashlib

from ckan.controllers.package import PackageController
from multiprocessing import Process, Queue
import subprocess
import csv

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

        #if os.path.exists(dir):
        #    shutil.rmtree(dir)
        if not os.path.exists(dir):
            os.makedirs(dir)

        resources = self._processResources(ckanPackage, dir)

        attrs = {}
        arr = []
        for resource in resources:
            files = []
            for file in resource['files']:
                for attr in file['attributes']:
                    if not attr['name'] in attrs:
                        attrs[attr['name']] = {
                            "type" : attr["type"],
                            "scope" : attr["scope"],
                            "units" : attr["units"]
                        }
                files.append({
                    "name" : file["name"],
                    "layout" : file["layout"]
                })
            arr.append({
                "name" : resource["name"],
                "type" : resource["type"],
                "id"   : resource["id"],
                "files" : files
            })


        return json.dumps({
            "resources"  : arr,
            "attributes" : attrs
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
            ckanLocation = self._getLocalResourcePath(r)

            # check for changes
            if parseData != None:
                md5 = self._hashfile(ckanLocation)
                if md5 == parseData['md5']:
                    print "Found zipfile: %s but NO changes detected" % r['name']
                    return parseData
                else:
                    print "Found zipfile: %s and changes detected" % r['name']
                    shutil.rmtree(zipDir = "%s/%s/files" % (dir, r['id']))
            else:
                print "Found new zipfile: %s extracting..." % r['name']

            # init resource dir
            self._initResourceDir(r, dir)

            # create dir for zip
            zipDir = "%s/%s/files" % (dir, r['id'])

            files = []
            z = zipfile.ZipFile(ckanLocation, "r")
            for info in z.infolist():
                if self._isDataFile(info.filename):
                    parts = info.filename.split("/")

                    zipPath = ""
                    for i in range(0, len(parts)-1):
                        zipPath += parts[i]+"/"

                    z.extract(info, "%s" % zipDir)

                    file = {
                        "name" : re.sub(r".*/", "", info.filename),
                        "location" : "%s/%s" % (re.sub(self.workspaceDir, "", zipDir), zipPath)
                    }
                    self._processFile(file, None)
                    files.append(file)
            z.close()

            info = {
                "name" : r["name"],
                "id"   : r["id"],
                "files" : files,
                "type" : "zip",
                "url_type" : r["url_type"],
                "md5" : self._hashfile(ckanLocation)
            }

            # save parse info to disk
            self._saveJson("%s/%s/info.json" % (dir, r['id']), info)
            return info


        elif ext in self.dataExtension:
            ckanLocation = self._getLocalResourcePath(r)

            if parseData != None:
                md5 = self._hashfile(ckanLocation)
                if md5 == parseData['md5']:
                    print "Found data file: %s but NO changes detected" % r['name']
                    return parseData
                else:
                    print "Found data file: %s and changes detected" % r['name']
                    os.remove("%s/%s/files/%s" % (dir, r['id'], r['name']))
            else:
                print "Found new data file: %s extracting..." % r['name']


            # init resource dir
            self._initResourceDir(r, dir)

            # link in file
            os.symlink(ckanLocation, "%s/%s/files/%s" % (dir, r['id'], r['name']))

            file = {
                "name" : r['name'],
                "location" : "%s/%s/files/" % (re.sub(self.workspaceDir, "", dir), r['id'])
            }
            self._processFile(file, None)

            info = {
                "name" : r["name"],
                "id"   : r["id"],
                "files" : [file],
                "type" : "datafile",
                "url_type" : r["url_type"],
                "md5" : self._hashfile(ckanLocation)
            }
            self._saveJson("%s/%s/info.json" % (dir, r['id']), info)
            return info
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
            gitDir = "%s/files" % gitDir
            cmd = "git pull"
            process = subprocess.Popen(cmd.split(), cwd=gitDir)
            process.wait()

            # get current commit
            cmd = "git log -1"
            process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=gitDir)
            process.wait()
            commit = re.sub(r'\n.*', '', process.communicate()[0]).replace("commit ","")

            # don't need to do anything to commit is the same
            if parseData['commit'] == commit:
                print "Git Repo found, No changes detected"
                return parseData
            else:
                print "Git Repo found, changes detected"

        else:
            print "New Git Repo found"
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
            process.wait()
            parseData['commit'] = re.sub(r'\n.*', '', process.communicate()[0]).replace("commit ","")

            # set some other attributes for processed data file
            parseData['name'] = r['name']
            parseData['id'] = r['id']
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
            self._processFile(file, None)

        self._saveJson("%s/%s/info.json" % (dir, r['id']), parseData)

        return parseData

    # actually parse file information object
    # must have name and location
    def _processFile(self, f, config):
        ext = self._getFileExtension(f['name'])

        dataLayout = 'row'
        if 'layout' in f:
            dataLayout = f['layout']
        elif config != None:
            if 'layout' in config:
                dataLayout = config['layout']

        data = []
        if ext == "csv":
            data = self._processCsv(f)
        elif ext == "tsv" or ext == "spectra":
            data = self._processTsv(f)

        f['layout'] = dataLayout
        f['attributes'] = self._processFileArray(data, dataLayout)

    # given a data array [[]], process based on config
    #  - type row = attribute names are in the first row
    #  - type col = attribute names are in the first col
    def _processFileArray(self, data, layout):
        ranges = self._getDataRanges(data)

        localRange = {}
        globalRange = None
        if len(ranges) == 1:
            localRange = ranges[0]
        elif len(ranges) == 2:
            globalRange = ranges[0]
            localRange = ranges[1]

        attrTypes = []
        if layout == "row":
            for i in range(0, len(data[localRange['start']])):
                info = self._parseAttrTypes(data[localRange['start']][i], [localRange['start'], i],  "local")
                attrTypes.append(info)
        else:
            names = []
            for i in range(localRange['start'], localRange['stop']):
                info = self._parseAttrTypes(data[i][0], [i,0], "local")
                attrTypes.append(info)

        return attrTypes


    # parse out the attribute information from the attribute information
    # TODO: check for units and attribute data type
    def _parseAttrTypes(self, name, pos, attributeLocality, isData=False):
        original = name

        # clean up string
        name = name.strip()

        # parse out units
        # TODO

        type = "metadata"
        if re.match(r"^-?\d+\.?\d*", name) or re.match(r"^-?\d*\.\d+", name):
            type = "wavelength"
        elif re.match(r".*__d($|\s)", name) or isData:
            type = "data"

        attr = {
            "type" : type,
            "name" : name,
            "units" : "",
            "pos" : pos,
            "scope" : attributeLocality,
        }
        if original != name:
            attr["original"] = original
        


    # find the table ranges (is there one or two)
    def _getDataRanges(self, data):
        ranges = []
        r = {
            "start" : 0,
            "end" : 0
        }
        started = False

        i = 0
        for i in range(0, len(data)):
            if self._isEmptyRow(data[i]):
                if started:
                    r['end'] = i
                    ranges.push(r)
                    if len(ranges) == 2:
                        break
                    else:
                        r = {"start":0, "stop":0}
                else:
                    continue

            if not started:
                r['start'] = i
                started = True

        if started and len(ranges) < 2:
            r['end'] = i
            ranges.append(r)

        return ranges



    # is a row array empty
    def _isEmptyRow(self, row):
        if len(row) == 0:
            return True

        for i in range(0, len(row)):
            if row[i] != "" or row[i] != None:
                return False

        return True

    def _processCsv(self, f):
        return self._processSeperatorFile(f, ",")

    def _processTsv(self, f):
        return self._processSeperatorFile(f, "\t")

    # parse a csv or tsv file location into array
    def _processSeperatorFile(self, f, separator):
        with open("%s%s%s" % (self.workspaceDir, f['location'], f['name']), 'rb') as csvfile:
            reader = csv.reader(csvfile, delimiter=separator, quotechar='"')
            arr = []
            for row in reader:
                arr.append(row)
            csvfile.close()
            return arr


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

    def _saveJson(self, file, data):
        f = open(file, 'w')
        json.dump(data, f)
        f.close()

    # returns the md5 hash of a file, file should be a string location
    def _hashfile(self, file):
        f = open(file, 'rb')
        blocksize = 65536
        hasher = hashlib.md5()

        buf = f.read(blocksize)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(blocksize)

        md5 = hasher.hexdigest()
        f.close()
        return md5