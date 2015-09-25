import utils, csv, excel

resourceCollection = None
spectraCollection = None

def init(rCollection, sCollection):
    global resourceCollection, spectraCollection

    resourceCollection = rCollection
    spectraCollection = sCollection

def processFile(file="", packageId="", resourceId="", sheetId=None, options={}):
    ext = utils.getFileExtension(file)

    # check for ignore conditions
    ignore = False

    # get config for sheet if on exists
    sheetConfig = resourceCollection.find_one({
        "resourceId" : resourceId,
        "packageId" : packageId,
        "sheetId" : sheetId
    })

    if sheetConfig == None:
        sheetConfig = {}

    # update with passed options
    for key in options:
        sheetConfig[key] = options[key]

    # make sure defaults are set
    sheetConfig['file'] = file
    sheetConfig['packageId'] = packageId
    sheetConfig['resourceId'] = resourceId
    sheetConfig['sheetId'] = sheetId

    # clear spectra collection
    spectraCollection.remove({
        "resourceId" : resourceId,
        "packageId" : packageId,
        "sheetId" : sheetId
    })

    if sheetConfig.get('ignore') == True:
        ignore = True
    elif ext != "csv" and ext != "tsv" and ext != "spectra" and ext != "xlsx" and ext != "xls":
        ignore = True

    if ignore == True: # return
        return

    response = None
    if ext == "csv":
        response = _processCsv(sheetConfig)
    elif ext == "tsv" or ext == "spectra":
        response = _processTsv(sheetConfig)
    elif ext == "xlsx" or ext == "xls":
        # TODO: add flag so we can specify we only want to update one sheet here

        # an excel file is going to actually expand to several files
        # so pass the files array so the placeholder can be removed
        # and the new 'sheet' files can be inserted
        sheets = excel.process(sheetConfig)
        for sheet in sheets:
            _processSheetArray(sheet.data, file, packageId, resourceId, sheet.config)
    else:
        return {
            "message" : "not parsed"
        }

def _processCsv(sheetConfig):
    _processSeperatorFile(",", sheetConfig)

def _processTsv(sheetConfig):
    _processSeperatorFile("\t", sheetConfig)

# parse a csv or tsv file location into array
def _processSeperatorFile(separator, sheetConfig):
    with open("%s%s%s" % sheetConfig.get('file'), 'rU') as csvfile:
        reader = csv.reader(csvfile, delimiter=separator, quotechar='"')
        data = []
        for row in reader:
            data.append(row)
        csvfile.close()

        _processSheetArray(data, sheetConfig)

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
        return

    # query all the attribute types based on layout
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

    resourceCollection.update({
        "resourceId" : sheetConfig.get('resourceId'),
        "packageId" : sheetConfig.get('packageId'),
        "sheetId" : sheetConfig.get('sheetId')
    }, sheetConfig)

    # create a quick lookup for 'tweaked' names
    nameMap = {}
    for info in attrTypes:
        if info.get('originalName') != None:
            nameMap[info.get('originalName')] = info.get('name')

    # now lets insert into mongo
    if layout == 'row':
        start = localRange['start']
        for j in range(start+1, localRange['stop']):
            sp = {}
            for i in range(len(data[start])):
                try:
                    if data[start+j][i]:
                        sp[_getName(data[start][i])] = data[start+j][i]
                except:
                    pass

            # add global data
            if globalRange != None:
                for i in range(globalRange['start'], globalRange['stop']):
                    sp[_getName(data[i][0])] = data[i][1]

            _insertSpectra(sp, sheetConfig)

    else:
        start = localRange['start']
        for j in range(1, len(data[start])):
            sp = {}
            for i in range(start, localRange['stop']):
                try:
                    if data[i][j]:
                        sp[_getName(data[i][0])] = data[i][j]
                except:
                    pass

            # add global data
            if globalRange != None:
                for i in range(globalRange['start'], globalRange['stop']):
                    sp[_getName(data[i][0])] = data[i][1]

            _insertSpectra(sp, sheetConfig)

def _insertSpectra(sp, sheetConfig):
    type = sheetConfig.get("type")
    if type == None:
        type = "data"

    data = {
        "spectra" : sp,
        "packageId" : sheetConfig.get("packageId"),
        "resourceId" : sheetConfig.get("resourceId"),
        "sheetId" : sheetConfig.get("sheetId"),
        "type" : type
    }
    spectraCollection.insert(data)

def _getName(nameMap, name):
    mapped = nameMap.get(name)
    if mapped != None:
        return mapped
    return name