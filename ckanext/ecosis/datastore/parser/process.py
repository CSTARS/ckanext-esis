import csv, utils, excel, hashlib, datetime

from ckanext.ecosis.datastore.ckan import resource as ckanResourceQuery

collections = None


def init(co):
    global collections

    collections = co

def processFile(file="", packageId="", resourceId="", sheetId=None, options={}, resource=None):
    # get config for sheet if on exists
    sheetConfig = collections.get('resource').find_one({
        "resourceId" : resourceId,
        "packageId" : packageId,
        "sheetId" : sheetId
    })

    if resource is None:
        if 'name' in sheetConfig:
            resource = sheetConfig
        else:
            resource = ckanResourceQuery.get(resourceId)

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

    # clear spectra collection
    removeQuery = {
        "resourceId" : resourceId,
        "packageId" : packageId
    }
    if sheetId is not None:
        removeQuery["sheetId"] = sheetId
    collections.get('spectra').remove(removeQuery)


    if sheetConfig.get('ignore') == True:
        ignore = True
    elif ext != "csv" and ext != "tsv" and ext != "spectra" and ext != "xlsx" and ext != "xls":
        ignore = True
        sheetConfig['ignore'] = True
        sheetConfig['invalidFileType'] = True
        if 'layout' in sheetConfig:
            del sheetConfig['layout']

    if ignore == True: # save and return
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

    sheetConfig['processed'] = datetime.datetime.utcnow()

    response = None
    if ext == "csv":
        sheetConfig['hash'] = hash
        response = _processCsv(sheetConfig)
        response['name'] = resource.get('name')
    elif ext == "tsv" or ext == "spectra":
        sheetConfig['hash'] = hash
        response = _processTsv(sheetConfig)
        response['name'] = resource.get('name')
    elif ext == "xlsx" or ext == "xls":
        # TODO: add flag so we can specify we only want to update one sheet here

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
    else:
        response = {
            "message" : "not parsed, invalid file type"
        }
    return response

def _processCsv(sheetConfig):
    return _processSeperatorFile(",", sheetConfig)

def _processTsv(sheetConfig):
    return _processSeperatorFile("\t", sheetConfig)

# parse a csv or tsv file location into array
def _processSeperatorFile(separator, sheetConfig):
    with open(sheetConfig.get('file'), 'rU') as csvfile:
        reader = csv.reader(csvfile, delimiter=separator, quotechar='"')
        data = []
        for row in reader:
            data.append(row)
        csvfile.close()

        return _processSheetArray(data, sheetConfig)

def _processSheetArray(data, sheetConfig):
    # for local scope are we parsing a metadata file or a normal datasheet
    # how should be parse this file?
    layout = utils.getLayout(sheetConfig)


    # get table ranges in sheet, where is the data
    ranges = utils.getDataRanges(data)

    localRange = {}
    globalRange = None
    if len(ranges) == 1:
        localRange = ranges[0]
    elif len(ranges) == 2:
        globalRange = ranges[0]
        localRange = ranges[1]

    # no local data
    if localRange['start'] == localRange['stop']:
        return {
            "processed" : True,
            "resourceId" : sheetConfig.get("resourceId"),
            "fromZip" : sheetConfig.get("fromZip"),
            "count" : 0
        }

    # ckan all the attribute types based on layout
    attrTypes = []
    if layout == "row":
        for i in range(0, len(data[localRange['start']])):
            info = utils.parseAttrType(data[localRange['start']][i], [localRange['start'], i])
            attrTypes.append(info)
    else:
        for i in range(localRange['start'], localRange['stop']):
            info = utils.parseAttrType(data[i][0], [i,0])
            attrTypes.append(info)

    if globalRange != None:
        for i in range(globalRange['start'], globalRange['stop']):
            info = utils.parseAttrType(data[i][0], [i,0])
            attrTypes.append(info)

    sheetConfig["attributes"] = attrTypes
    sheetConfig["localRange"] = localRange

    # save sheet info back to collection
    if globalRange != None:
        sheetConfig['globalRange'] = globalRange
    elif 'globalRange' in sheetConfig:
        del sheetConfig['globalRange']

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
    if layout == 'row':
        start = localRange['start']
        for j in range(start+1, localRange['stop']):
            sp = {}
            for i in range(len(data[start])):
                try:
                    if data[start+j][i]:
                        sp[_getName(nameMap, data[start][i])] = data[start+j][i]
                except Exception as e:
                    pass

            # add global data
            if globalRange != None:
                for i in range(globalRange['start'], globalRange['stop']):
                    sp[_getName(nameMap, data[i][0])] = data[i][1]

            index += 1
            _insertSpectra(sp, sheetConfig, index)

    else:
        start = localRange['start']
        for j in range(1, len(data[start])):
            sp = {}
            for i in range(start, localRange['stop']):
                try:
                    if data[i][j]:
                        sp[_getName(nameMap, data[i][0])] = data[i][j]
                except:
                    pass

            # add global data
            if globalRange != None:
                for i in range(globalRange['start'], globalRange['stop']):
                    sp[_getName(data[i][0])] = data[i][1]

            index += 1
            _insertSpectra(sp, sheetConfig, index)

    return {
        "processed" : True,
        "resourceId" : sheetConfig.get("resourceId"),
        "fromZip" : sheetConfig.get("fromZip"),
        "count" : index
    }

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
    collections.get('spectra').insert(data)

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

def _getName(nameMap, name):
    mapped = nameMap.get(name)
    if mapped != None:
        return mapped
    return name

