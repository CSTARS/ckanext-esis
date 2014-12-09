import re, time

from pymongo import MongoClient
from pylons import config

client = MongoClient(config._process_configs[1]['esis.mongo.url'])
db = client[config._process_configs[1]['esis.mongo.db']]
spectraCollection = db[config._process_configs[1]['esis.mongo.spectra_collection']]
searchCollectionName = config._process_configs[1]['esis.mongo.search_collection']
searchCollection = db[searchCollectionName]

class Push:

    workspaceDir = ""
    setup = None
    process = None
    workspace = None
    joinlib = None

    def __init__(self):
        self.workspaceDir = "%s/workspace" % config._process_configs[1]['ecosis.workspace.root']

    def setCollection(self, collection):
        self.workspaceCollection = collection

    def setHelpers(self, workspace, setup, process, joinlib):
        self.workspace = workspace
        self.setup = setup
        self.process = process
        self.joinlib = joinlib

    def pushToSearch(self, package_id):
        runTime = time.time()
        # first clean out data
        #searchCollection.remove({'package_id':package_id})
        #spectraCollection.remove({'ecosis.package_id': package_id})

        # next add resources one at a time and join spectra
        (workspacePackage, ckanPackage, rootDir, fresh) = self.setup.init(package_id)
        resources = self.setup.resources(workspacePackage, ckanPackage, rootDir)
        self.process.resources(resources, workspacePackage, ckanPackage, rootDir)


        package = self.workspace._mergeWorkspace(resources, workspacePackage, ckanPackage, fresh)

        for resource in package['resources']:
            resource = self.workspace._getMergedResources(resource['id'], resources, workspacePackage, removeValues=False)
            spectra = self._getResourceSpectra(resource, self.workspaceDir, package)
            # now insert into mongo

        # finally run map reduce

        return {'success': True, 'runTime': (time.time()-runTime)}

    # this is a lot like process._getSpectra() but will be more efficent for access and joining all of
    # a files spectra
    def _getResourceSpectra(self, resource, rootDir, package):
        if 'datasheets' not in resource:
            return []

        if resource.get('ignore') == True:
            return []

        runTime = time.time()
        spectra = []
        # cache for metadata datasheets file name to 2-dim array of data
        # so we don't need to keep opening and closing the files
        metadataCache = {}

        for datasheet in resource['datasheets']:
            if datasheet.get('ignore') == True or datasheet.get('metadata') == True:
                continue

            file = "%s%s%s" % (rootDir, datasheet['location'], datasheet['name'])
            data = self.process.getFile(file, datasheet)

            (layout, scope) = self.process.getLayout(datasheet)

            if layout == 'row':
                start = datasheet['localRange']['start']
                for j in range(start+1, datasheet['localRange']['end']):
                    m = {}
                    for i in range(len(data[start])):
                        m[data[start][i]] = data[start+j][i]
                    spectra.append(m)
            else:
                start = datasheet['localRange']['start']
                for j in range(1, len(data[start])):
                    m = {}
                    for i in range(start, datasheet['localRange']['stop']):
                        m[data[i][0]] = data[i][j]
                    spectra.append(m)

            for m in spectra:
                m['datapoints'] = []

                # move wavelengths to datapoints array
                if "wavelengths" in package:
                    for attr in package["wavelengths"]:
                        if attr in m:
                            m['datapoints'].append({
                                "key" : attr,
                                "value" : m[attr]
                            })
                            del m[attr]

                # move data attributes to datapoints array
                if "attributes" in package:
                    for attr in package["attributes"]:
                        if attr in m and package["attributes"][attr]["type"] == "data":
                            m['datapoints'].append({
                                "key" : attr,
                                "value" : m[attr],
                                "units" : package["attributes"][attr]
                            })
                            del m[attr]

                # TODO: add global attributes if they exist

                # join on many metadata sheets that matched
                for resource in package['resources']:
                    if 'datasheets' in resource:
                        for sheet in resource['datasheets']:
                            if sheet.get('metadata') == True:
                                if 'matches' in sheet and datasheet['id'] in sheet['matches']:
                                    metadatafile = "%s%s%s" % (rootDir, sheet['location'], sheet['name'])
                                    data = None

                                    if metadatafile in metadataCache:
                                        data = metadataCache[metadatafile]
                                    else:
                                        data = self.process.getFile(metadatafile, sheet)
                                        metadataCache[metadatafile] = data

                                    self.joinlib.joinOnSpectra(datasheet, m, sheet, data)

                # copy any mapped attributes
                if "attributeMap" in package:
                    for key, value in package["attributeMap"].iteritems():
                        if value in m:
                            m[key] = m[value]

                # TODO
                # finally, set ckan dataset info, as well as specific info on, sort, geolocation

        print " Push resource process time: %ss" % (time.time() - runTime)


        return spectra
