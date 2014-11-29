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
import zipfile, datetime
import xlrd

from ckan.lib.base import c, model, BaseController
import ckan.logic as logic
import ckan.lib.helpers as h
from ckan.common import request, response
import inspect
from bson.code import Code
from bson.son import SON
import ckan.lib.uploader as uploader
import hashlib

from ckanext.esis.lib.join import SheetJoin

from ckan.controllers.package import PackageController
from multiprocessing import Process, Queue
import subprocess
import csv

log = logging.getLogger(__name__)

# setup mongo connection
client = MongoClient(config._process_configs[1]['esis.mongo.url'])
db = client[config._process_configs[1]['esis.mongo.db']]

workspaceCollectionName = config._process_configs[1]['esis.mongo.workspace_collection']
workspaceCollection = db[workspaceCollectionName]

joinlib = SheetJoin()

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

    # API CALL
    # basically runs initWorkspace and responds with workspace overview
    def processWorkspace(self):
        response.headers["Content-Type"] = "application/json"

        (packageWorkspace, ckanPackage, dir, fresh) = self._initWorkspace(request.params.get('package_id'))
        resources = self._processResources(ckanPackage, dir, packageWorkspace)

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

    # set the parse information for a given resource and package
    # this should be a post
    def setParseInformation(self):
        response.headers["Content-Type"] = "application/json"

        package_id = request.params.get('package_id')
        resources = request.params.get('resources')

        (packageWorkspace, ckanPackage, dir, fresh) = self._initWorkspace(package_id)

        if not 'resources' in packageWorkspace:
            packageWorkspace['resources'] = []

        # update the package workspace information
        for r in resources:
            wResource = self._getById(r['id'])
            if wResource != None:
                packageWorkspace['resources'].append(r)

        # save back to mongo
        workspaceCollection.update({'package_id': package_id}, packageWorkspace)

        return {'success': True}


    # API CALL
    def processResource(self):
        response.headers["Content-Type"] = "application/json"

        rid = request.params.get('resource_id')
        (packageWorkspace, ckanPackage, dir, fresh) = self._initWorkspace(request.params.get('package_id'))

        resource = None
        for r in ckanPackage['resources']:
            if r["id"] == rid:
                resource = r

        if r == None:
            return json.dumps({"error":True,"message":"resource not found"})

        return json.dumps(self._processResource(ckanPackage, resource, dir, packageWorkspace))


    # Takes a package_id and initializes workspace if it doesn't exist
    # if it does, checks md5 hash and re-parses any new or updates files
    def _initWorkspace(self, package_id):
        context = {'model': model, 'user': c.user}
        ckanPackage = logic.get_action('package_show')(context, {'id': package_id})

        # TODO: this will be remove and become a check
        dir = "%s/%s" % (self.workspaceDir, ckanPackage['name'])

        fresh = False
        if not os.path.exists(dir):
            os.makedirs(dir)
            fresh = True

        # grap the current package import workspace information from mongo
        packageWorkspace = workspaceCollection.find_one({'package_id': ckanPackage['id']})
        if packageWorkspace == None:
            packageWorkspace = {'package_id': ckanPackage['id']}
        if not 'resources' in packageWorkspace:
            packageWorkspace['resources'] = []

        # clean up any resources that may have been deleted
        for rid in os.listdir(dir):
            if not self._hasResource(rid, ckanPackage):
                print "Removing deleted resource: %s" % rid
                shutil.rmtree("%s/%s" % (dir, rid))

        # save package modification info to mongo
        packageWorkspace['last_used'] = datetime.datetime.utcnow()
        workspaceCollection.update({'package_id': ckanPackage['id']}, packageWorkspace, upsert=True)

        return (packageWorkspace, ckanPackage, dir, fresh)

    # process all of the resources
    def _processResources(self, pkg, dir, pkgWorkspace):
        resources = []

        # break up into 2 groups, first is metadata, this needs to be parsed first,
        # second is data.  Pass the metadata group along with each data resource
        # so a join can be preformed
        metadataSheets = []
        metadataResources = []
        for r in pkgWorkspace['resources']:
            resp = self._processResource(pkg, r, dir, pkgWorkspace, metadataRun=True)
            if resp != None:
                metadataResources.append(resp)
                for sheet in resp['datasheets']:
                    metadataSheets.append(sheet)

        # now process non-metadata datasheets
        for r in pkg['resources']:
            resp = self._processResource(pkg, r, dir, pkgWorkspace, metadataSheets=metadataSheets)
            if resp != None:
                resources.append(resp)

        # now merge metadata sheet list back in
        for resource in metadataResources:
            r = self._getById(resources, resource['id'])
            if r == None:
                resources.append(resource)
            else:
                for sheet in resource['datasheets']:
                    r['datasheets'].append(sheet)

        return resources

    # process and individual resource
    def _processResource(self, pkg, r, dir, pkgWorkspace, metadataSheets=[], metadataRun=False):

        workspaceResource = self._getById(pkgWorkspace['resources'], r['id'])
        if workspaceResource == None:
            workspaceResource = {}

        if workspaceResource.get('ignore') == True:
            print "Ignoring resource: %s" % r['name']
            return

        # this is a url link
        if r['url_type'] == None:
            if re.match(r".*github.com.*", r['url']):
                return self._processGitUrl(pkg, r, dir, workspaceResource, metadataSheets, metadataRun)
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
                    shutil.rmtree("%s/%s/files" % (dir, r['id']))
            else:
                print "Found new zipfile: %s extracting..." % r['name']

            # init resource dir
            self._initResourceDir(r, dir)

            # create dir for zip
            zipDir = "%s/%s/files" % (dir, r['id'])

            datasheets = []
            z = zipfile.ZipFile(ckanLocation, "r")
            for info in z.infolist():
                if self._isDataFile(info.filename):
                    parts = info.filename.split("/")

                    zipPath = ""
                    for i in range(0, len(parts)-1):
                        zipPath += parts[i]+"/"

                    # create id for individual file
                    name = re.sub(r".*/", "", info.filename)
                    id = self._getFileId(r['id'], zipPath, name)

                    #extract individual file
                    z.extract(info, "%s" % zipDir)

                    datasheet = {
                        "id" : id,
                        "name" : name,
                        "location" : "%s/%s" % (re.sub(self.workspaceDir, "", zipDir), zipPath)
                    }
                    datasheets.append(datasheet)

                    self._processFile(datasheet, datasheets, r['id'], workspaceResource, metadataSheets, metadataRun)

            z.close()

            info = {
                "name" : r["name"],
                "id"   : r["id"],
                "datasheets" : datasheets,
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
            else:
                print "Found new data file: %s extracting..." % r['name']

            # TODO: we shouldn't always have to remove the symlink...
            if os.path.exists("%s/%s/files/%s" % (dir, r['id'], r['name'])):
                os.remove("%s/%s/files/%s" % (dir, r['id'], r['name']))

            # get the resource file id
            id = self._getFileId(r['id'], "", r['name'])

            # init resource dir
            self._initResourceDir(r, dir)

            # link in file
            os.symlink(ckanLocation, "%s/%s/files/%s" % (dir, r['id'], r['name']))

            datasheet = {
                "id" : id,
                "name" : r['name'],
                "location" : "%s/%s/files/" % (re.sub(self.workspaceDir, "", dir), r['id'])
            }
            datasheets = [datasheet]

            self._processFile(datasheet, datasheets, r['id'], workspaceResource, metadataSheets, metadataRun)

            info = {
                "name" : r["name"],
                "id"   : r["id"],
                "datasheets" : datasheets,
                "type" : "datafile",
                "url_type" : r["url_type"],
                "md5" : self._hashfile(ckanLocation)
            }
            self._saveJson("%s/%s/info.json" % (dir, r['id']), info)
            return info
        else:
            print "Found Unknown: %s" % r.name

        return None

    def _processGitUrl(self, pkg, r, dir, pkgWorkspace, metadataSheets, metadataRun):
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

        parseData['datasheets'] = []

        # now walk tree and get attribute information
        for root, dirs, files in os.walk(gitDir):
            # ignore .git directory
            if re.match(r".*/\.git.*", root):
                continue

            for f in files:
                if self._isDataFile(f):
                    parseData['datasheets'].append({
                        "id" : self._getFileId(r['id'], root, f['name']),
                        "name" : f['name'],
                        "location" : re.sub(self.workspaceDir, "", root)
                    })

        # now parse information for known data files
        for datasheet in parseData['datasheets']:
            workspaceResource = self._getById(pkgWorkspace['resources'], r['id'])
            self._processFile(datasheet, parseData['datasheets'], r['id'], workspaceResource, metadataSheets, metadataRun)

        self._saveJson("%s/%s/info.json" % (dir, r['id']), parseData)

        return parseData

    # actually parse file information object
    # must have name and location
    def _processFile(self, datasheet, datasheets, rid, resourceConfig, metadataSheets, metadataRun):
        ext = self._getFileExtension(datasheet['name'])

        # at this point, check type and bail out if we are on a metadata and this is not metadata or vice versa
        # we have to wait till we open up and look at an excel file before we can make this decision, thus it's in
        # two places
        if ext == "csv" or ext == "spectra" or ext == "tsv":
            if not self._parseOnThisRun(datasheet, resourceConfig, metadataRun):
                datasheets.remove(datasheet)
                return

        # how should be parse this file?
        dataLayout = 'row'
        if 'layout' in datasheet:
            dataLayout = datasheet['layout']
        elif config != None:
            if config.get('type') == 'metadata':
                dataLayout = 'row'
            elif 'layout' in config:
                dataLayout = config['layout']

        data = []
        if ext == "csv":
            self._processCsv(datasheet, dataLayout, resourceConfig, metadataSheets)
        elif ext == "tsv" or ext == "spectra":
            self._processTsv(datasheet, dataLayout, resourceConfig, metadataSheets)
        elif ext == "xlsx" or ext == "xls":
            # an excel file is going to actually expand to several files
            # so pass the files array so the placeholder can be removed
            # and the new 'sheet' files can be inserted
            self._processExcel(datasheet, datasheets, rid, dataLayout, resourceConfig, metadataSheets, metadataRun)



    # given a data array [[]], process based on config
    #  - type row = attribute names are in the first row
    #  - type col = attribute names are in the first col
    #
    # layout - row || column
    # sheetInfo - the sheet response object
    # TODO: this needs to have access to all metadata file information,
    #       Should be able to set match counts
    def _processSheetArray(self, data, layout, sheetInfo, resourceConfig, metadataSheets):
        ranges = self._getDataRanges(data)

        # get config for sheet if on exists
        sheetConfig = self._getById(resourceConfig.get('datasheets'), sheetInfo['id'])

        localRange = {}
        globalRange = None
        if len(ranges) == 1:
            localRange = ranges[0]
        elif len(ranges) == 2:
            globalRange = ranges[0]
            localRange = ranges[1]

        # no local data
        if localRange['start'] == localRange['end']:
            return

        # find all the attribute types based on layout
        attrTypes = []
        if layout == "row":
            for i in range(0, len(data[localRange['start']])):
                info = self._parseAttrType(data[localRange['start']][i], [localRange['start'], i],  "local")
                attrTypes.append(info)
        else:
            names = []
            for i in range(localRange['start'], localRange['end']):
                info = self._parseAttrType(data[i][0], [i,0], "local")
                attrTypes.append(info)
        sheetInfo['attributes'] = attrTypes

        if sheetConfig != None and sheetConfig.get('metadata') == True:
            joinlib.processMetadataSheet(data, sheetConfig, sheetInfo)
        else:
            # now find the spectra count based on layout
            if layout == "row":
                sheetInfo['spectra_count'] = localRange['end'] - localRange['start']
            else:
                i = 0
                for i in reversed(range(len(data[localRange['start']]))):
                    if data[localRange['start']] != None or data[localRange['start']] != '':
                        break
                sheetInfo['spectra_count'] = i

            # finally find match counts for metadata joins
            joinlib.matchMetadataSheets(data, localRange, layout, sheetInfo, metadataSheets)


    # is a row array empty
    def _isEmptyRow(self, row):
        if len(row) == 0:
            return True

        for i in range(0, len(row)):
            if row[i] != "" or row[i] != None:
                return False

        return True

    # src:
    #  https://github.com/python-excel/xlrd
    # help:
    #  http://www.youlikeprogramming.com/2012/03/examples-reading-excel-xls-documents-using-pythons-xlrd/
    #  https://secure.simplistix.co.uk/svn/xlrd/trunk/xlrd/doc/xlrd.html?p=4966
    def _processExcel(self, datasheet, datasheets, rid, layout, resourceConfig, metadataSheets, metadataRun):
        # remove the place holder, the sheets will be the actual 'files'

        fullPath = "%s%s%s" % (self.workspaceDir, datasheet['location'], datasheet['name'])

        try:
            workbook = xlrd.open_workbook(fullPath)
            sheets = workbook.sheet_names()

            for sheet in sheets:
                sheetInfo = {
                    "id" : self._getFileId(rid, datasheet['location'], "%s-%s" %  (datasheet['name'], sheet) ),
                    "sheet" : sheet,
                    "name" : datasheet['name'],
                    "location" : datasheet['location'],
                    "layout" : layout
                }

                # are we on the metadata run and should we be parsing this sheet?
                if not self._parseOnThisRun(sheetInfo, resourceConfig, metadataRun):
                    continue

                data = self._getWorksheetData(workbook.sheet_by_name(sheet))
                self._processSheetArray(data, layout, sheetInfo, resourceConfig, metadataSheets)
                datasheets.append(sheetInfo)

        #TODO: how do we really want to handle this?
        except Exception as e:
            datasheet['error'] = True
            datasheet['message'] = e

        if not 'error' in datasheet:
            datasheets.remove(datasheet)

    def _getWorksheetData(self, sheet):
        data = []
        for i in range(sheet.nrows):
            row = []
            for j in range(sheet.ncols):
                row.append(str(sheet.cell_value(i, j)))
            data.append(row)
        return data


    def _processCsv(self, datasheet, layout, resourceConfig, metadataSheets):
        self._processSeperatorFile(datasheet, ",", layout, resourceConfig, metadataSheets)

    def _processTsv(self, datasheet, layout, resourceConfig, metadataSheets):
        self._processSeperatorFile(datasheet, "\t", layout, resourceConfig, metadataSheets)

    # parse a csv or tsv file location into array
    def _processSeperatorFile(self, datasheet, separator, layout, resourceConfig, metadataSheets):
        with open("%s%s%s" % (self.workspaceDir, datasheet['location'], datasheet['name']), 'rb') as csvfile:
            reader = csv.reader(csvfile, delimiter=separator, quotechar='"')
            data = []
            for row in reader:
                data.append(row)
            csvfile.close()

            datasheet['layout'] = layout
            self._processSheetArray(data, layout, datasheet, resourceConfig, metadataSheets)

    # given information about the current datasheet, the config and if we are on the metadata run,
    # should we parse this datasheet on this run or not.  Remember, there are always two runs.  First,
    # one for metadata, second, one for data
    def _parseOnThisRun(self, datasheet, resourceConfig, metadataRun):
        sheetConfig = self._getById(resourceConfig.get('datasheets'), datasheet['id'])

        if sheetConfig == None and metadataRun:
            return False
        elif sheetConfig == None:
            return True

        if sheetConfig.get('metadata') == True:
            if metadataRun:
                return True
            else:
                return False

        if metadataRun:
            return False
        return True

    # parse out the attribute information from the attribute information
    # TODO: check for units and attribute data type
    def _parseAttrType(self, name, pos, attributeLocality, isData=False):
        original = name

        # clean up string
        name = name.strip()

        # parse out units
        # TODO

        type = "metadata"
        if re.match(r"^-?\d+\.?\d*", name) or re.match(r"^-?\d*\.\d+", name):
            type = "wavelength"
        elif re.match(r".*__d($|\s)", name) or isData:
            name = re.sub(r".*__d($|\s)", "", name)
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

        return attr

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
        elif not started and len(ranges) == 0:
            ranges.append(r)

        return ranges

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

    # get the md5 of a resource file
    # takes the resource id, local path (if github or expanded zip), and filename
    def _getFileId(self, rid, path, name):
        m = hashlib.md5()
        m.update("%s%s%s" % (rid, path, name))
        return m.hexdigest()

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

    # does the ckan package contain the resource id
    def _hasResource(self, rid, pkg):
        for r in pkg['resources']:
            if rid == r['id']:
                return True
        return False