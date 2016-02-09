import xlrd, os, shutil, datetime, json, csv, re
from ckanext.ecosis.datastore.delete import removeDeletedExcelSheets
from ckanext.ecosis.datastore.parser import csvReader

workspaceDir = None

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

    sheetIds = []
    if sheetConfig.get('hash') != hash:
        sheetIds = cacheWrite(collection, sheetConfig, hash)
    else:
        workspacePath = os.path.join(workspaceDir, sheetConfig.get('packageId'), sheetConfig.get('resourceId'))
        fullPath = os.path.join(workspacePath,'sheets.json')
        f = open(fullPath, 'r')
        sheetIds = json.load(f)
        f.close()

    for sheetId in sheetIds:
        configSheetId = sheetConfig.get('sheetId')

        config = None

        if configSheetId == sheetId:
            # we are processing a single sheet
            config = sheetConfig

        # update just these attributes
        elif configSheetId is None:
            # we are processing everything
            config = collection.find_one({
                "packageId" : sheetConfig.get('packageId'),
                "resourceId" : sheetConfig.get('resourceId'),
                "sheetId" : sheetId
            })

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

            data = cacheRead(config)

            datasheets.append({
                "data" : data,
                "config" : config
            })

    # This shouldn't be required.  To do this a resource has to be deleted and replaced
    #removeDeletedExcelSheets(sheetConfig.get('resourceId'), sheetIds)

    return datasheets

def getWorksheetData(sheet):
    data = []
    for i in range(sheet.nrows):
        row = []
        for j in range(sheet.ncols):
            val = ""
            try:
                val = str(sheet.cell_value(i, j))
            except Exception as e:
                try:
                    val = re.sub(r'[^\x00-\x7F]+',' ', sheet.cell_value(i, j))
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

    os.makedirs(workspacePath)

    sheetNames = []

    try:
        workbook = xlrd.open_workbook(sheetConfig.get('file'))
        sheets = workbook.sheet_names()

        for i, sheet in enumerate(sheets):
            sheetNames.append('%s-%s' % (i, sheet))
            data = getWorksheetData(workbook.sheet_by_name(sheet))
            fullPath = os.path.join(workspacePath,'%s.csv' % i)

            csvfile = open(fullPath, 'wb')

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