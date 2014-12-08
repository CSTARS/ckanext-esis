# setup a package workspace
# this should in no way care about user config
# simply get all data resources into the correct directories

from ckan.lib.base import c, model
import ckan.logic as logic
import ckan.lib.uploader as uploader
from pylons import config


import os, datetime, shutil, re, json, hashlib, zipfile, subprocess, pickle, time

class WorkspaceSetup:

    dataExtension = ["xlsx","xls","spectra","csv","tsv"]

    workspaceCollection = None
    workspaceDir = ""

    def __init__(self):
        self.workspaceDir = "%s/workspace" % config._process_configs[1]['ecosis.workspace.root']

    def setCollection(self, collection):
        self.workspaceCollection = collection

    # Takes a package_id and initializes workspace if it doesn't exist
    # if it does, checks md5 hash and re-parses any new or updates files
    def init(self, package_id):
        runTime = time.time()
        context = {'model': model, 'user': c.user}

        ckanPackage = logic.get_action('package_show')(context, {'id': package_id})

        # TODO: this will be remove and become a check
        rootDir = "%s/%s" % (self.workspaceDir, ckanPackage['name'])

        fresh = False
        if not os.path.exists(rootDir):
            os.makedirs(rootDir)
            fresh = True

        # grab the current package import workspace information from mongo
        workspacePackage = self.workspaceCollection.find_one({'package_id': ckanPackage['id']})
        if workspacePackage == None:
            workspacePackage = {'package_id': ckanPackage['id']}
        if not 'resources' in workspacePackage:
            workspacePackage['resources'] = []

        # clean up any resources that may have been deleted
        for rid in os.listdir(rootDir):
            if not self._hasResource(rid, ckanPackage):
                print "Removing deleted resource: %s" % rid
                shutil.rmtree("%s/%s" % (rootDir, rid))

        # save package modification info to mongo
        workspacePackage['last_used'] = datetime.datetime.utcnow()
        self.workspaceCollection.update({'package_id': ckanPackage['id']}, workspacePackage, upsert=True)

        print "** Setup.init() time: %ss" % (time.time() - runTime)

        return (workspacePackage, ckanPackage, rootDir, fresh)

    # make sure  all of the resources are where they should be
    def resources(self, workspacePackage, ckanPackage, rootDir):
        runTime = time.time()
        resources = []

        for ckanResource in ckanPackage['resources']:
            if not self._ignoreResource(ckanResource, workspacePackage):
                info = self.resource(ckanPackage, ckanResource, rootDir)
                if info != None:
                    resources.append(info)

        print "** Setup.resources() time: %ss" % (time.time() - runTime)
        return resources

     # process and individual resource
    def resource(self, ckanPackage, ckanResource, rootDir):

        #workspaceResource = self._getById(pkgWorkspace['resources'], r['id'])
        #if workspaceResource == None:
        #    workspaceResource = {}

        #if workspaceResource.get('ignore') == True:
        #    print "Ignoring resource: %s" % r['name']
        #    return

        # this is a url link
        if ckanResource.get('url_type') == None:
            if re.match(r".*github.com.*", ckanResource['url']):
                return self._processGitUrl(ckanPackage, ckanResource, rootDir)
            return self._resourceError(ckanResource, 'Unrecognized git url')

        ext = self._getFileExtension(ckanResource['name'])

        parseData = self._getParseFile(ckanResource, rootDir)

        # extract zip file
        if ext == "zip":
            # location of file on disk, where ckan placed it
            ckanLocation = self._getLocalResourcePath(ckanResource)

            # check for changes
            if parseData != None:
                md5 = self._hashfile(ckanLocation)
                if md5 == parseData['md5']:
                    print "Found zipfile: %s but NO changes detected" % ckanResource['name']
                    return parseData
                else:
                    print "Found zipfile: %s and changes detected" % ckanResource['name']
                    shutil.rmtree("%s/%s/files" % (rootDir, ckanResource['id']))
            else:
                print "Found new zipfile: %s extracting..." % ckanResource['name']

            # init resource dir in the workspace
            self._initResourceDir(ckanResource, rootDir)

            # create dir for zip
            zipDir = "%s/%s/files" % (rootDir, ckanResource['id'])

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
                    id = self._getFileId(ckanResource['id'], zipPath, name)

                    #extract individual file
                    z.extract(info, "%s" % zipDir)

                    datasheet = {
                        "id" : id,
                        "name" : name,
                        "location" : "%s/%s" % (re.sub(self.workspaceDir, "", zipDir), zipPath)
                    }
                    datasheets.append(datasheet)

            z.close()

            info = {
                "name" : ckanResource["name"],
                "id"   : ckanResource["id"],
                "datasheets" : datasheets,
                "type" : "zip",
                "url_type" : ckanResource["url_type"],
                "md5" : self._hashfile(ckanLocation),
                "location" : "%s/%s/info.json" % (rootDir, ckanResource['id']),
                "changes" : True
            }

            # save parse info to disk
            # TODO: this should be done later on, after the config has been processed
            # self._saveJson("%s/%s/info.json" % (rootDir, ckanResource['id']), info)
            return info


        elif ext in self.dataExtension:
            ckanLocation = self._getLocalResourcePath(ckanResource)

            if parseData != None:
                md5 = self._hashfile(ckanLocation)
                if md5 == parseData['md5']:
                    print "Found data file: %s but NO changes detected" % ckanResource['name']
                    return parseData
                else:
                    print "Found data file: %s and changes detected" % ckanResource['name']
            else:
                print "Found new data file: %s extracting..." % ckanResource['name']

            # TODO: we shouldn't always have to remove the symlink...
            if os.path.exists("%s/%s/files/%s" % (rootDir, ckanResource['id'], ckanResource['name'])):
                os.remove("%s/%s/files/%s" % (rootDir, ckanResource['id'], ckanResource['name']))

            # get the resource file id
            id = self._getFileId(ckanResource['id'], "", ckanResource['name'])

            # init resource dir
            self._initResourceDir(ckanResource, rootDir)

            # link in file
            os.symlink(ckanLocation, "%s/%s/files/%s" % (rootDir, ckanResource['id'], ckanResource['name']))

            datasheet = {
                "id" : id,
                "name" : ckanResource['name'],
                "location" : "%s/%s/files/" % (re.sub(self.workspaceDir, "", rootDir), ckanResource['id'])
            }
            datasheets = [datasheet]

            info = {
                "name" : ckanResource["name"],
                "id"   : ckanResource["id"],
                "datasheets" : datasheets,
                "type" : "datafile",
                "url_type" : ckanResource["url_type"],
                "md5" : self._hashfile(ckanLocation),
                "location" : "%s/%s/info.json" % (rootDir, ckanResource['id']),
                "changes" : True
            }
            #self._saveJson("%s/%s/info.json" % (dir, ckanResource['id']), info)

            return info
        else:
            print "Found Unknown: %s" % ckanResource['name']

        return None

    def _processGitUrl(self, ckanPackage, ckanResource, rootDir, workspacePackage):
        print "Found Git Repo"

        gitDir = "%s/%s" % (rootDir, ckanResource['id'])
        repoName = re.sub(r"/$","", ckanResource['url'])
        repoName = re.sub(r".*/", "", repoName)
        repoName = re.sub(r".git$","",repoName)

        parseData = self._getParseFile(ckanResource, rootDir)

        if os.path.exists(gitDir):
            # get the parsed data file
            # TODO: should we move on?  This is badness, but should we really choke here?
            if parseData == 'None':
                raise NameError("Git Repo exists but no existing parse data found for %s" % ckanResource['id'])

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
                parseData['changes'] = True

        else:
            print "New Git Repo found"


            os.makedirs(gitDir)
            process = subprocess.Popen(["git","clone",ckanResource['url'],'files'], cwd=gitDir)
            process.wait()

            #checking for good clone
            hiddenGitDir = "%s/files/.git" % (gitDir)
            if not os.path.exists(hiddenGitDir):
                raise NameError("Failed to clone %s, dir does not exists %s" % (repoName, hiddenGitDir))

            gitDir = "%s/files" % gitDir
            cmd = "git log -1"
            process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=gitDir)
            process.wait()


            # set some other attributes for processed data file
            parseData = {
                'commit' : re.sub(r'\n.*', '', process.communicate()[0]).replace("commit ",""),
                'name' : ckanResource['name'],
                'id': ckanResource['id'],
                'url': ckanResource['url'],
                'type': 'github',
                'repo': repoName,
                'location' : "%s/info.json" % gitDir,
                'changes' : True
            }


        parseData['datasheets'] = []

        # now walk tree and get attribute information
        for root, dirs, files in os.walk(gitDir):
            # ignore .git directory
            if re.match(r".*/\.git.*", root):
                continue

            for f in files:
                if self._isDataFile(f):
                    parseData['datasheets'].append({
                        "id" : self._getFileId(ckanResource['id'], root, f['name']),
                        "name" : f['name'],
                        "location" : re.sub(self.workspaceDir, "", root),
                    })

        # now parse information for known data files
        #for datasheet in parseData['datasheets']:
        #    workspaceResource = self._getById(workspacePackage['resources'], ckanResource['id'])
        #    self._processFile(datasheet, parseData['datasheets'], ckanResource['id'], workspaceResource, metadataSheets, metadataRun)

        #self._saveJson("%s/%s/info.json" % (dir, ckanPackage['id']), parseData)

        return parseData

    def _resourceError(self, ckanResource, msg):
        return {
            "error" : True,
            "message" : msg,
            "id" : ckanResource['id'],
            "name" : ckanResource["name"],
            "url" : ckanResource["url"],
            "url_type" : ckanResource["url_type"]
        }

     # get the parse data file if on exists
    def _getParseFile(self, r, dir):
        parsedFile = "%s/%s/info.json" % (dir, r['id'])

        if not os.path.exists(parsedFile):
            return None

        file = open(parsedFile, 'r')
        parseData = json.loads(file.read())
        file.close()
        #with open(parsedFile, 'rb') as f:
        #    return pickle.load(f)
        #    f.close()

        return parseData

    # get the extension from a filename
    def _getFileExtension(self, filename):
         return re.sub(r".*\.", "", filename)

    # get the location of a ckan file on disk from a ckan resource object
    def _getLocalResourcePath(self, r):
        upload = uploader.ResourceUpload(r)
        return upload.get_path(r['id'])

    # create a resource director if it doesn't exist
    def _initResourceDir(self, r, dir):
        if not os.path.exists("%s/%s" % (dir, r['id'])):
            os.makedirs("%s/%s/files" % (dir, r['id']))

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

    def _ignoreResource(self, ckanResource, workspacePackage):
        workspaceResource = self._getById(workspacePackage['resources'], ckanResource['id'])
        if workspaceResource != None:
            if workspaceResource.get('ignore') == True:
                return True
        return False

    def _getById(self, arr, id):
        if arr == None:
            return None

        for obj in arr:
            if obj.get('id') == id:
                return obj
        return None

    # get the md5 of a resource file
    # takes the resource id, local path (if github or expanded zip), and filename
    def _getFileId(self, rid, path, name):
        m = hashlib.md5()
        m.update("%s%s%s" % (rid, path, name))
        return m.hexdigest()

    # is this a known data file type (based on extension)
    def _isDataFile(self, filename):
        if self._getFileExtension(filename) in self.dataExtension:
            return True
        return False

    # does the ckan package contain the resource id
    def _hasResource(self, rid, pkg):
        for r in pkg['resources']:
            if rid == r['id']:
                return True
        return False