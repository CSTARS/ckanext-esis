import xlrd, os, shutil, datetime, json, csv, re
from ckanext.ecosis.datastore.files import csvReader

# TODO: document the workspace object and what attributes actually mean

workspaceDir = None

# inject global dependencies
def init(workspaceDirectory):
    global workspaceDir
    workspaceDir = workspaceDirectory

# src:
#  https://github.com/python-excel/xlrd
# help:
#  http://www.youlikeprogramming.com/2012/03/examples-reading-excel-xls-documents-using-pythons-xlrd/
#  https://secure.simplistix.co.uk/svn/xlrd/trunk/xlrd/doc/xlrd.html?p=4966
# Known Issues:
#  Looks like some versions of officelibre and badness that xlrd doesn't like...
def process(collection, sheetConfig, hash):

    # remove the place holder, the sheets will be the actual 'files'
    datasheets = []

    # check if a excel file sheets has been cached as csv files
    # this is the default way we want to read the excel files, cause parsing excel is slooooow
    sheetIds = []

    # we are not cached, need to write excel sheets as csv files
    if sheetConfig.get('hash') != hash:
        sheetIds = cacheWrite(collection, sheetConfig, hash)
    # we are cached, read in sheet ids
    else:
        workspacePath = os.path.join(workspaceDir, sheetConfig.get('packageId'), sheetConfig.get('resourceId'))
        fullPath = os.path.join(workspacePath,'sheets.json')
        f = open(fullPath, 'r')
        sheetIds = json.load(f)
        f.close()

    for sheetId in sheetIds:
        configSheetId = sheetConfig.get('sheetId')

        config = None

        # we are processing a single sheet
        if configSheetId == sheetId:
            config = sheetConfig

        # we are processing everything
        elif configSheetId is None:
            config = collection.find_one({
                "packageId" : sheetConfig.get('packageId'),
                "resourceId" : sheetConfig.get('resourceId'),
                "sheetId" : sheetId
            })

            # no config prepared
            if config == None:
                config = {
                    "packageId" : sheetConfig.get('packageId'),
                    "resourceId" : sheetConfig.get('resourceId'),
                    "layout" : sheetConfig.get('layout'),
                    "sheetId": sheetId
                }



        if configSheetId == sheetId or configSheetId is None:
            config['hash'] = hash

            # tack on zip stuff
            if sheetConfig.get("fromZip") == True:
                config["fromZip"] = True
                config["name"] = sheetConfig.get("name")
                config["file"] = sheetConfig.get("file")
                config["zip"] = sheetConfig.get("zip")

            # finally let's read the csv file for this sheet
            data = cacheRead(config)

            # append the sheet data and config to the response
            datasheets.append({
                "data" : data,
                "config" : config
            })

    return datasheets

# read an individual excel sheet
def getWorksheetData(sheet, workbook):
    data = []

    # run over rows and columns of sheet
    for i in range(sheet.nrows):
        row = []
        for j in range(sheet.ncols):
            val = ""

            # let's try and parse out some values
            try:
                # if of type date, read in as iso formatted string
                if sheet.cell_type(i,j) == xlrd.XL_CELL_DATE:
                    val = sheet.cell_value(i, j)
                    val = datetime.datetime(*xlrd.xldate_as_tuple(val, workbook.datemode)).isoformat()
                # otherwise, just read value as string
                else:
                    val = sheet.cell_value(i, j)
                    if isinstance(val, unicode):
                        val = val.encode("utf-8")
                    else:
                        val = str(val) # see if this fails.  if so, we have badness



            # if anything fails, see if it's cause of bad utf-8 characters
            except Exception as e:
                try:
                    # try and scrub utf-8 badness
                    val = re.sub(r'[^\x00-\x7F]+',' ', sheet.cell_value(i, j))
                # just give up.
                except Exception as e:
                    val = '__invalid_utf-8_characters__'
            row.append(val)

        data.append(row)
    return data

# read a single sheet
def cacheRead(sheetConfig):
    id = sheetConfig.get('sheetId').split('-')[0]
    filename = '%s.csv' % id
    workspacePath = os.path.join(workspaceDir, sheetConfig.get('packageId'), sheetConfig.get('resourceId'), filename)

    return csvReader.read(workspacePath, ",")

# write excel files to disk as csv for faster read time
# excel read is unreal slow in python.
def cacheWrite(collection, sheetConfig, hash):

    # we need to update the csv file cache
    workspacePath = os.path.join(workspaceDir, sheetConfig.get('packageId'), sheetConfig.get('resourceId'))

    # clean out any existing extraction
    if os.path.exists(workspacePath):
        shutil.rmtree(workspacePath)

    # create workspace (cache) path
    os.makedirs(workspacePath)

    sheetNames = []

    try:
        # open up the excel file
        workbook = xlrd.open_workbook(sheetConfig.get('file'))
        # grab sheet information
        sheets = workbook.sheet_names()

        for i, sheet in enumerate(sheets):
            sheetNames.append('%s-%s' % (i, sheet))

            # read in the sheet
            data = getWorksheetData(workbook.sheet_by_name(sheet), workbook)
            fullPath = os.path.join(workspacePath,'%s.csv' % i)

            # prepare to write the csv file for this sheet
            csvfile = open(fullPath, 'wb')

            # actually write csv file to disk
            wr = csv.writer(csvfile, quoting=csv.QUOTE_ALL)
            for row in data:
                wr.writerow(row)
            csvfile.close()

    except Exception as e:
        print e
        pass

    # make sure we save the hash
    excelConfig = collection.find_one({
        "packageId" : sheetConfig.get('packageId'),
        "resourceId" : sheetConfig.get('resourceId'),
        "sheetId" : None
    })

    # this is the first time we are reading the file
    if excelConfig is None:
        excelConfig = {
            "file" : sheetConfig.get('file'),
            "packageId" : sheetConfig.get('packageId'),
            "resourceId" : sheetConfig.get('resourceId'),
            "sheetId" : None,
            "hash" : hash,
            "cached" : datetime.datetime.utcnow(),
            "excel" : True
        }
    else:
        excelConfig['excel'] = True;
        excelConfig['cached'] = datetime.datetime.utcnow();
        excelConfig['hash'] = hash

    # if we have a 'fake' resource, it's from a zipfile, make sure we save the name
    if sheetConfig.get('fromZip') and 'name' in sheetConfig:
        excelConfig['name'] = sheetConfig['name']
        excelConfig['file'] = sheetConfig.get('file')

    # update the workspace collection
    collection.update({
        "resourceId" : sheetConfig.get('resourceId'),
        "packageId" : sheetConfig.get('packageId'),
        "sheetId" : None
    }, excelConfig, upsert=True)

    # save ids
    fullPath = os.path.join(workspacePath,'sheets.json')
    f = open(fullPath, 'w')
    json.dump(sheetNames, f)
    f.close()

    return sheetNames