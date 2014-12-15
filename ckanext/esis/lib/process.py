# actually process the datasheet with given workspace config

import xlrd, csv, re, json, time, pickle, hashlib

from pylons import config



class ProcessWorkspace:

    workspaceCollection = None
    workspaceDir = ""
    joinlib = None

    def __init__(self):
        self.workspaceDir = "%s/workspace" % config._process_configs[1]['ecosis.workspace.root']

    def setCollection(self, collection):
        self.workspaceCollection = collection

    def setHelpers(self, joinlib):
        self.joinlib = joinlib

    # resource should be merged from setup.parse and the workspace resource
    def getSpectra(self, package, resource, rootDir, datasheet_id, index):
        datasheet = self._getById(resource['datasheets'], datasheet_id)

        # TODO: check that index is less than the spectra count
        # check that datasheet actually exists

        file = "%s%s%s" % (rootDir, datasheet['location'], datasheet['name'])

        data = self.getFile(file, datasheet)

        (layout, scope) = self.getLayout(datasheet)
        spectra = {}

        if layout == 'row':
            start = datasheet['localRange']['start']
            for i in range(len(data[start])):
                spectra[data[start][i]] = data[start+index+1][i]
        else:
            for i in range(datasheet['localRange']['start'], datasheet['localRange']['stop']):
                spectra[data[i][0]] = data[i][index+1]

        spectra['datapoints'] = []

        # TODO: add global attributes if they exist

        # move wavelengths to datapoints array
        if "wavelengths" in package:
            for attr in package["wavelengths"]:
                if attr in spectra:
                    spectra['datapoints'].append({
                        "key" : attr,
                        "value" : spectra[attr]
                    })
                    del spectra[attr]

        # move data attributes to datapoints array
        if "attributes" in package:
            for attr in package["attributes"]:
                if attr in spectra and package["attributes"][attr]["type"] == "data":
                    spectra['datapoints'].append({
                        "key" : attr,
                        "value" : spectra[attr],
                        "units" : package["attributes"][attr]
                    })
                    del spectra[attr]

        # join on many metadata sheets that matched
        for resource in package['resources']:
            if 'datasheets' in resource:
                for sheet in resource['datasheets']:
                    if sheet.get('metadata') == True:
                        if 'matches' in sheet and datasheet['id'] in sheet['matches']:
                            metadatafile = "%s%s%s" % (rootDir, sheet['location'], sheet['name'])
                            data = self.getFile(metadatafile, sheet)
                            self.joinlib.joinOnSpectra(datasheet, spectra, sheet, data)

        # copy any mapped attributes
        if package.get('attributeMap') != None:
            for key, value in package["attributeMap"].iteritems():
                if value in spectra:
                    spectra[key] = spectra[value]


        return spectra

    def resources(self, resources, workspacePackage, ckanPackage, rootDir):
        # resourceInfo is the parsed resource information from setup.resources

        runTime = time.time()

        # break up into 2 groups, first is metadata, this needs to be parsed first,
        # second is data.  Pass the metadata group along with each data resource
        # so a join can be preformed
        for resourceInfo in resources:
            ckanResource =  self._getById(ckanPackage['resources'], resourceInfo['id'])
            self._processResource(ckanResource, resourceInfo['datasheets'], workspacePackage, metadataRun=True)

        # now do non-metadata run
        metadataSheets = self._getMetadataSheets(resources, workspacePackage)
        for resourceInfo in resources:
            ckanResource =  self._getById(ckanPackage['resources'], resourceInfo['id'])
            self._processResource(ckanResource, resourceInfo['datasheets'], workspacePackage, metadataSheets)

        # finally save all json files with current state
        for resourceInfo in resources:
            if resourceInfo.get('changes') == True:
                location = resourceInfo['location']
                del resourceInfo['location']
                del resourceInfo['changes']
                self._saveJson(location, resourceInfo)

        print "** Process.resources()  %s time: %ss" % (ckanPackage['name'], (time.time() - runTime))


    # process any user changes to resource
    def _processResource(self, ckanResource, datasheets, workspacePackage, metadataSheets=[], metadataRun=False):
        #TODO: IMPORTANT... if we hit here and nothing has changed, we should just quit
        # nothing has changed needs to track, workspace updates as well as resource additions and removals
        #return

        workspaceResource = self._getById(workspacePackage['resources'], ckanResource['id'])
        if workspaceResource == None:
            workspaceResource = {}

        if workspaceResource.get('ignore') == True:
            return None

        # first we will process any excel sheets
        # we will group these together by file so we don't keep opening/closing file
        excelFiles = {}
        for datasheet in datasheets:
            if self._ignoreDatasheet(datasheet, workspaceResource):
                continue

            if 'sheetname' in datasheet:
                if datasheet['name'] in excelFiles:
                    excelFiles[datasheet['name']].append(datasheet)
                else:
                    excelFiles[datasheet['name']] = [datasheet]
        for file, sheets in excelFiles.iteritems():
            self._processExcelSheets(sheets, workspaceResource, metadataSheets, metadataRun)

        for datasheet in datasheets:
            if self._ignoreDatasheet(datasheet, workspaceResource):
                continue
            elif 'sheetname' in datasheet: # this isn't a file, it was added by processing a excel file
                continue
            self._processFile(datasheet, datasheets, ckanResource['id'], workspaceResource, metadataSheets, metadataRun)


    # actually parse file information object
    # must have name and location
    def _processFile(self, datasheet, datasheets, rid, workspaceResource, metadataSheets, metadataRun):
        ext = self._getFileExtension(datasheet['name'])

        # at this point, check type and bail out if we are on a metadata and this is not metadata or vice versa
        # we have to wait till we open up and look at an excel file before we can make this decision, thus it's in
        # two places
        if ext == "csv" or ext == "spectra" or ext == "tsv":
            if not self._parseOnThisRun(datasheet, workspaceResource, metadataRun):
                return

        data = []
        if ext == "csv":
            self._processCsv(datasheet, workspaceResource, metadataSheets)
        elif ext == "tsv" or ext == "spectra":
            self._processTsv(datasheet, workspaceResource, metadataSheets)
        elif ext == "xlsx" or ext == "xls":
            # an excel file is going to actually expand to several files
            # so pass the files array so the placeholder can be removed
            # and the new 'sheet' files can be inserted
            self._processExcel(datasheet, datasheets, rid, workspaceResource, metadataSheets, metadataRun)

    def getFile(self, file, datasheet):
        ext = self._getFileExtension(file)
        data = None

        if ext == "csv":
            data = self._readSeperatorFile(file, ",")
        elif ext == "tsv" or ext == "spectra":
            data = self._readSeperatorFile(file, "\t")
        elif ext == "xlsx" or ext == "xls":
            data = self._readExcelSheet(file, datasheet.get('sheetname'))
        return data



    def _readSeperatorFile(self, file, separator):
        with open(file) as csvfile:
            reader = csv.reader(csvfile, delimiter=separator, quotechar='"')
            data = []
            for row in reader:
                data.append(row)
            return data
        return [[]]

    def _readExcelSheet(self, file, sheetname):
        workbook = xlrd.open_workbook(file)
        sheets = workbook.sheet_names()

        for sheet in sheets:
            if sheet == sheetname:
                return self._getWorksheetData(workbook.sheet_by_name(sheetname))


    # given a data array [[]], process based on config
    #  - type row = attribute names are in the first row
    #  - type col = attribute names are in the first col
    #
    # layout - row || column
    # sheetInfo - the sheet response object
    def _processSheetArray(self, data, sheetInfo, resourceConfig, metadataSheets):
        # get config for sheet if on exists
        sheetConfig = self._getById(resourceConfig.get('datasheets'), sheetInfo['id'])

        # should we ignore this sheet?
        if sheetConfig != None:
            if sheetConfig.get('ignore') == True:
                sheetInfo['ignore'] = True
                return

        # for local scope are we parsing a metadata file or a normal datasheet
        # how should be parse this file?
        (layout, scope) = self.getLayout(sheetConfig)

        sheetInfo['layout'] = layout

        # get table ranges in sheet, where is the data
        ranges = self._getDataRanges(data)

        localRange = {}
        globalRange = None
        if len(ranges) == 1:
            localRange = ranges[0]
        elif len(ranges) == 2:
            globalRange = ranges[0]
            localRange = ranges[1]

        # no local data
        if localRange['start'] == localRange['stop']:
            return



        # find all the attribute types based on layout
        attrTypes = []
        if layout == "row":
            for i in range(0, len(data[localRange['start']])):
                info = self._parseAttrType(data[localRange['start']][i], [localRange['start'], i],  scope)
                attrTypes.append(info)
        else:
            for i in range(localRange['start'], localRange['stop']):
                info = self._parseAttrType(data[i][0], [i,0], scope)
                attrTypes.append(info)

        if globalRange != None:
            for i in range(globalRange['start'], globalRange['stop']):
                info = self._parseAttrType(data[i][0], [i,0], "file")
                attrTypes.append(info)

        sheetInfo['attributes'] = attrTypes
        sheetInfo['localRange'] = localRange
        if globalRange != None:
            sheetInfo['globalRange'] = globalRange

        if sheetConfig != None and sheetConfig.get('metadata') == True:
            self.joinlib.processMetadataSheet(data, sheetConfig, sheetInfo)
        else:
            # now find the spectra count based on layout
            if layout == "row":
                sheetInfo['spectra_count'] = localRange['stop'] - localRange['start']
            else:
                i = 0
                for i in reversed(range(len(data[localRange['start']]))):
                    if data[localRange['start']] != None or data[localRange['start']] != '':
                        break
                sheetInfo['spectra_count'] = i

            # finally find match counts for metadata joins
            self.joinlib.matchMetadataSheets(data, localRange, layout, sheetInfo, metadataSheets)

    # src:
    #  https://github.com/python-excel/xlrd
    # help:
    #  http://www.youlikeprogramming.com/2012/03/examples-reading-excel-xls-documents-using-pythons-xlrd/
    #  https://secure.simplistix.co.uk/svn/xlrd/trunk/xlrd/doc/xlrd.html?p=4966
    def _processExcel(self, datasheet, datasheets, rid, resourceConfig, metadataSheets, metadataRun):
        # remove the place holder, the sheets will be the actual 'files'

        fullPath = "%s%s%s" % (self.workspaceDir, datasheet['location'], datasheet['name'])

        try:
            workbook = xlrd.open_workbook(fullPath)
            sheets = workbook.sheet_names()

            for sheet in sheets:
                sheetInfo = {
                    "id" : self._getFileId(rid, datasheet['location'], "%s-%s" %  (datasheet['name'], sheet) ),
                    "sheetname" : sheet,
                    "name" : datasheet['name'],
                    "location" : datasheet['location'],
                }

                # are we on the metadata run and should we be parsing this sheet?
                if not self._parseOnThisRun(sheetInfo, resourceConfig, metadataRun):
                    continue

                data = self._getWorksheetData(workbook.sheet_by_name(sheet))
                self._processSheetArray(data, sheetInfo, resourceConfig, metadataSheets)
                datasheets.append(sheetInfo)

        #TODO: how do we really want to handle this?
        except Exception as e:
            datasheet['error'] = True
            datasheet['message'] = e.message.message

        # if we are on the second run and there is no error, remove the excel file as a 'sheet'
        if not 'error' in datasheet and not metadataRun:
            datasheets.remove(datasheet)

    def _processExcelSheets(self, sheets, resourceConfig, metadataSheets, metadataRun):
        if len(sheets) == 0:
            return

        fullPath = "%s%s%s" % (self.workspaceDir, sheets[0]['location'], sheets[0]['name'])

        workbook = xlrd.open_workbook(fullPath)

        for sheetInfo in sheets:
            # are we on the metadata run and should we be parsing this sheet?
            if not self._parseOnThisRun(sheetInfo, resourceConfig, metadataRun):
                continue

            data = self._getWorksheetData(workbook.sheet_by_name(sheetInfo['sheetname']))
            self._processSheetArray(data, sheetInfo, resourceConfig, metadataSheets)

    def _getWorksheetData(self, sheet):
        data = []
        for i in range(sheet.nrows):
            row = []
            for j in range(sheet.ncols):
                row.append(str(sheet.cell_value(i, j)))
            data.append(row)
        return data


    def _processCsv(self, datasheet, resourceConfig, metadataSheets):
        self._processSeperatorFile(datasheet, ",", resourceConfig, metadataSheets)

    def _processTsv(self, datasheet, resourceConfig, metadataSheets):
        self._processSeperatorFile(datasheet, "\t", resourceConfig, metadataSheets)

    # parse a csv or tsv file location into array
    def _processSeperatorFile(self, datasheet, separator, resourceConfig, metadataSheets):
        with open("%s%s%s" % (self.workspaceDir, datasheet['location'], datasheet['name']), 'rb') as csvfile:
            reader = csv.reader(csvfile, delimiter=separator, quotechar='"')
            data = []
            for row in reader:
                data.append(row)
            csvfile.close()

            self._processSheetArray(data, datasheet, resourceConfig, metadataSheets)

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
        units = None
        declared = False

        # clean up string
        name = name.strip()

        # parse out units
        # TODO

        type = "metadata"
        if re.match(r"^-?\d+\.?\d*", name) or re.match(r"^-?\d*\.\d+", name):
            type = "wavelength"
            name = re.sub(r"\.0+$", "", name)
        elif re.match(r".*__d($|\s)", name) or isData:
            name = re.sub(r".*__d($|\s)", "", name)
            type = "data"
            declared = True

        attr = {
            "type" : type,
            "name" : name,
            "pos" : "%s-%s" % (pos[0], pos[1]),
            "scope" : attributeLocality
        }

        if units != None:
            attr["units"] = units

        if declared:
            attr['declared'] = True

        if original != name:
            attr["original"] = original

        return attr

    # find the table ranges (is there one or two)
    def _getDataRanges(self, data):
        ranges = []
        r = {
            "start" : 0,
            "stop" : 0
        }
        started = False

        i = 0
        for i in range(0, len(data)):
            if self._isEmptyRow(data[i]):
                if started:
                    r['stop'] = i
                    ranges.append(r)
                    started = False
                    if len(ranges) == 2:
                        break
                    else:
                        r = {"start":0, "stop":0}
                continue

            if not started:
                r['start'] = i
                started = True

        if started and len(ranges) < 2:
            r['stop'] = i
            ranges.append(r)
        elif not started and len(ranges) == 0:
            ranges.append(r)

        return ranges



    # is a row array empty
    def _isEmptyRow(self, row):
        if len(row) == 0:
            return True

        for i in range(0, len(row)):
            if row[i] != "" and row[i] != None:
                return False

        return True

    def _getMetadataSheets(self, resources, workspacePackage):
        sheets = []

        for workspaceResource in workspacePackage['resources']:
            if workspaceResource.get('ignore') == True:
                continue

            r = self._getById(resources, workspaceResource['id'])
            for sheet in workspaceResource['datasheets']:
                if sheet.get('ignore') == True:
                    continue

                if sheet.get('metadata') == True:
                    ds = self._getById(r['datasheets'], sheet['id'])
                    ds['metadata'] = True
                    sheets.append({
                        'config': sheet,
                        'datasheet' : ds
                    })
                elif r != None and sheet != None:
                    # TODO: got an error where ds ends up being None
                    ds = self._getById(r['datasheets'], sheet['id'])
                    #make sure the join info is not apart of the ds
                    if 'matchValues' in ds:
                        del ds['matchValues']
                    if 'matches' in ds:
                        del ds['matches']
                    if 'looseMatch' in ds:
                        del ds['looseMatch']
                    if 'matchType' in ds:
                        del ds['matchType']
                    if 'metadata' in ds:
                        del ds['metadata']

        return sheets

    def _saveJson(self, file, data):
        # was running into issues with json dump, looks like it might have been IDE
        #runTime = time.time()
        #with open(file, 'wb') as f:
        #    pickle.dump(data, f)
        #    f.close()
        #print "  --resource file %s write time:\n      %ss" % (file, (time.time() - runTime))

        # this actually looks to be faster
        runTime = time.time()
        f = open(file, 'w')
        json.dump(data, f)
        f.close()
        print "  --resource file %s write time:\n      %ss" % (file, (time.time() - runTime))

    def _getById(self, arr, id):
        if arr == None:
            return None

        for obj in arr:
            if obj.get('id') == id:
                return obj
        return None

    # get the extension from a filename
    def _getFileExtension(self, filename):
         return re.sub(r".*\.", "", filename)

    def _ignoreDatasheet(self, datasheet, resourceConfig):
        datasheetConfig = self._getById(resourceConfig.get('datasheets'), datasheet['id'])
        if datasheetConfig == None:
            if 'ignore' in datasheet:
                del datasheet['ignore']
            return False

        if datasheetConfig.get('ignore') == True:
            datasheet['ignore'] = True
            return True
        elif datasheet.get('ignore') == True:
            del datasheet['ignore']
        return False

    def getLayout(self, sheetConfig):
        layout = 'row'
        scope = 'local'
        if sheetConfig != None:
            if sheetConfig.get('metadata') == True:
                scope = 'metadata'
                layout = 'row'
            elif 'layout' in sheetConfig:
                layout = sheetConfig['layout']
        return (layout, scope)


    # get the md5 of a resource file
    # takes the resource id, local path (if github or expanded zip), and filename
    def _getFileId(self, rid, path, name):
        m = hashlib.md5()
        m.update("%s%s%s" % (rid, path, name))
        return m.hexdigest()
