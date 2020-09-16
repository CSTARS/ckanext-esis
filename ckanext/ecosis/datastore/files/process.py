import utils, excel, hashlib, datetime

from ckanext.ecosis.datastore.ckan import resource as ckanResourceQuery
from ckanext.ecosis.datastore.files import csvReader
from ckanext.ecosis.datastore.mongo import get_package_spectra_collection

collections = None

# inject global dependencies
def init(co):
    global collections

    collections = co

# read a tabular file, this may be a single sheet of a excel file
def processFile(file="", packageId="", resourceId="", sheetId=None, options={}, resource=None):

    # get config for sheet if on exists
    sheetConfig = collections.get('resource').find_one({
        "resourceId" : resourceId,
        "packageId" : packageId,
        "sheetId" : sheetId
    })

    # if we don't have a sheet config, query CKAN PG for details
    if resource is None:
        if 'name' in sheetConfig:
            resource = sheetConfig
        else:
            resource = ckanResourceQuery.get(resourceId)

    # grab the file extension
    ext = utils.getFileExtension(resource.get('name'))

    # check for ignore conditions
    ignore = False

    if sheetConfig == None:
        sheetConfig = {}

    # update with passed options
    keyCount = 0
    for key in options:
        sheetConfig[key] = options[key]
        keyCount += 1

    # now get md5 of current file
    hash = hashfile(file)

    # if the hash has changed compared to the value stored in the workspace
    # collection, then no changes have been made to this file and we do not need to
    # reparse.  Note, the response will be flagged as 'ignored'.
    if sheetConfig.get('hash') == hash and keyCount == 0:
        # no changes to file for config, just exit
        return {
            "ignored" : True,
            "message" : "nothing todo. hash is equal and new config given",
            "resourceId" : resourceId,
            "fromZip" : sheetConfig.get("fromZip"),
            "name" : resource.get("name")
        }

    # make sure defaults are set
    sheetConfig['file'] = file
    sheetConfig['packageId'] = packageId
    sheetConfig['resourceId'] = resourceId
    sheetConfig['sheetId'] = sheetId

    # clear spectra collection for this sheet
    removeQuery = {
        "resourceId" : resourceId,
        "packageId" : packageId
    }
    if sheetId is not None:
        removeQuery["sheetId"] = sheetId
    get_package_spectra_collection(packageId).remove(removeQuery)

    # has this sheet been marked by user to ignore?
    if sheetConfig.get('ignore') == True:
        ignore = True
    # is this sheet not of a valid extension?
    # TODO: make global array
    elif ext != "csv" and ext != "tsv" and ext != "spectra" and ext != "xlsx" and ext != "xls":
        ignore = True
        sheetConfig['ignore'] = True
        sheetConfig['invalidFileType'] = True
        if 'layout' in sheetConfig:
            del sheetConfig['layout']

    # if we should ignore sheet for reasons above, just save and return
    if ignore == True:
        collections.get('resource').update({
            "resourceId" : sheetConfig.get('resourceId'),
            "packageId" : sheetConfig.get('packageId'),
            "sheetId" : sheetConfig.get('sheetId')
        }, sheetConfig, upsert=True)

        return {
            "ignored" : True,
            "message" : "ignore flag set or invalid file type",
            "resourceId" : resourceId,
            "fromZip" : resource.get("fromZip"),
            "name" : resource.get("name")
        }

    # set our last processed timestamp
    sheetConfig['processed'] = datetime.datetime.utcnow()

    response = None
    # parse as comma sperated
    if ext == "csv" or ext == "spectra":
        sheetConfig['hash'] = hash
        response = _processCsv(sheetConfig)
        response['name'] = resource.get('name')

    # parse as tab sperated
    elif ext == "tsv":
        sheetConfig['hash'] = hash
        response = _processTsv(sheetConfig)
        response['name'] = resource.get('name')

    # parse as excel
    elif ext == "xlsx" or ext == "xls":
        # an excel file is going to actually expand to several files
        # so pass the files array so the placeholder can be removed
        # and the new 'sheet' files can be inserted
        sheets = excel.process(collections.get("resource"), sheetConfig, hash)
        response = []
        for sheet in sheets:
            t = _processSheetArray(sheet.get('data'), sheet.get('config'))
            t['sheetId'] = sheet.get('config').get('sheetId')
            t['name'] = resource.get('name')
            response.append(t)
    # badness
    else:
        response = {
            "message" : "not parsed, invalid file type"
        }

    # ensure joinOn opts have indexes
    sp_col = get_package_spectra_collection(packageId)
    sp_col.create_index('index')
    if options.get('joinOn') is not None:
        sp_col.create_index("spectra.%s" % options.get('joinOn'))

    return response

# start of parsing csv file
def _processCsv(sheetConfig):
    # default seperator
    seperator = ","

    # user can specify seperator as well
    if sheetConfig.get("seperator") is not None:
        seperator = str(sheetConfig.get("seperator"))
        if seperator == "tab":
            seperator = "\t"

    # actually parse file with given sperator
    return _processSeperatorFile(seperator, sheetConfig)

# like _processCsv above but defaults to tab
def _processTsv(sheetConfig):
    return _processSeperatorFile("\t", sheetConfig)

# parse a csv or tsv file location into array
def _processSeperatorFile(separator, sheetConfig):
    # parse using csvReader module
    data = csvReader.read(sheetConfig.get('file'), separator)

    # post process sheet data
    return _processSheetArray(data, sheetConfig)

# This function deals with the 'orientation' of a sheet.  IE, should it be read
# as a set of rows or a set of columns.  There is optionally a global table
# of key/value pairs at the top of the sheet that will be applied to every
# measurement of that sheet
def _processSheetArray(data, sheetConfig):

    # for local scope are we parsing a metadata file or a normal datasheet
    # how should be parse this file?
    layout = utils.getLayout(sheetConfig)


    # get table ranges in sheet, where is the data
    ranges = utils.getDataRanges(data)

    # figure out the data range as well as global data range (if exits)
    localRange = {}
    globalRange = None
    if len(ranges) == 1:
        localRange = ranges[0]
    elif len(ranges) == 2:
        globalRange = ranges[0]
        localRange = ranges[1]

    # no local data, nothing to do
    if localRange['start'] == localRange['stop']:
        return {
            "processed" : True,
            "resourceId" : sheetConfig.get("resourceId"),
            "fromZip" : sheetConfig.get("fromZip"),
            "count" : 0
        }

    # parse all the attribute types based on layout
    # basically this is reading the first column or row (depending on layout) then
    # parsing out the attribute name, 'cleaned' ecosis name as well as position
    # within the sheet.  Finally it parses the units as well.
    attrTypes = []
    if layout == "row":
        stop = len(data[localRange['start']])

        if stop > 1:# check for bad parse
            for i in range(0, stop):
                # actually parse attribute info
                info = utils.parseAttrType(data[localRange['start']][i], [localRange['start'], i])
                attrTypes.append(info)
    else:
        for i in range(localRange['start'], localRange['stop']+1):
            if len(data[i]) <= 1: # probably a bad parse
                continue

            # actually parse attribute info
            info = utils.parseAttrType(data[i][0], [i,0])
            attrTypes.append(info)

    # if there is a global range, read in attribute information for global
    # attributes as well
    if globalRange != None:
        for i in range(globalRange['start'], globalRange['stop']+1):
            info = utils.parseAttrType(data[i][0], [i,0])
            attrTypes.append(info)

    # store attribute information as well as range information
    sheetConfig["attributes"] = attrTypes
    sheetConfig["localRange"] = localRange

    # save sheet info back to collection
    if globalRange != None:
        sheetConfig['globalRange'] = globalRange
    elif 'globalRange' in sheetConfig:
        del sheetConfig['globalRange']

    # store in the workspace resources collection
    collections.get('resource').update({
        "resourceId" : sheetConfig.get('resourceId'),
        "packageId" : sheetConfig.get('packageId'),
        "sheetId" : sheetConfig.get('sheetId')
    }, sheetConfig, upsert=True)

    # create a quick lookup for 'tweaked' names
    nameMap = {}
    for info in attrTypes:
        if info.get('originalName') != None:
            nameMap[info.get('originalName')] = info.get('name')

    # now lets insert into mongo
    index = 0

    # loop over rows and columns
    if layout == 'row':
        start = localRange['start']
        for j in range(start+1, localRange['stop']+1):
            sp = {}
            for i in range(len(data[start])):
                try:
                    if data[j][i]:
                        # grab the attribute name as set the data
                        sp[_getName(nameMap, data[start][i])] = data[j][i]
                except Exception as e:
                    pass

            # add global data
            if globalRange != None:
                for i in range(globalRange['start'], globalRange['stop']+1):
                    # grab the attribute name as set the data
                    sp[_getName(nameMap, data[i][0])] = data[i][1]

            index += 1

            # insert the spectra into the spectra workspace collection
            _insertSpectra(sp, sheetConfig, index)

    else:
        start = localRange['start']
        for j in range(start+1, len(data[start])):
            sp = {}
            for i in range(start, localRange['stop']+1):
                try:
                    if data[i][j]:
                        # grab the attribute name as set the data
                        sp[_getName(nameMap, data[i][0])] = data[i][j]
                except:
                    pass

            # add global data
            if globalRange != None:
                for i in range(globalRange['start'], globalRange['stop']+1):
                    # grab the attribute name as set the data
                    sp[_getName(nameMap, data[i][0])] = data[i][1]

            index += 1

            # insert the spectra into the spectra workspace collection
            _insertSpectra(sp, sheetConfig, index)

    return {
        "processed" : True,
        "resourceId" : sheetConfig.get("resourceId"),
        "fromZip" : sheetConfig.get("fromZip"),
        "count" : index
    }

# insert a spectra into the workspace collection.
# if this is from a metadata, this is actually considered a metadata 'chunk'
# that can be joined to spectra later on.  The metadata will just be flagged
# for now
def _insertSpectra(sp, sheetConfig, index):
    type = "data"
    if sheetConfig.get('metadata') == True:
        type = "metadata"

    data = {
        "spectra" : sp,
        "packageId" : sheetConfig.get("packageId"),
        "resourceId" : sheetConfig.get("resourceId"),
        "sheetId" : sheetConfig.get("sheetId"),
        "index" : index,
        "type" : type
    }

    try:
        get_package_spectra_collection(sheetConfig.get("packageId")).insert(data)
    except Exception as e:
        pass

# get the md5 hash of a files contents
def hashfile(file):
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

# get the name of an attribute, see if it has been modified
def _getName(nameMap, name):
    mapped = nameMap.get(name)
    if mapped != None:
        return mapped
    return name

