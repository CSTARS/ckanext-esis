import xlrd

# src:
#  https://github.com/python-excel/xlrd
# help:
#  http://www.youlikeprogramming.com/2012/03/examples-reading-excel-xls-documents-using-pythons-xlrd/
#  https://secure.simplistix.co.uk/svn/xlrd/trunk/xlrd/doc/xlrd.html?p=4966
# Known Issues:
#  Looks like some versions of officelibre and badness that xlrd doesn't like...
def process(collection, file, packageId, resourceId, sheetConfig):
    # remove the place holder, the sheets will be the actual 'files'
    datasheets = []

    try:
        workbook = xlrd.open_workbook(file)
        sheets = workbook.sheet_names()


        for i, sheet in enumerate(sheets):
            id = "%s-%s" % (i, sheet)

            config = None

            if sheetConfig.get('sheetId') == id:
                config = sheetConfig
            else:
                config = collection.find_one({
                    "packageId" : packageId,
                    "resourceId" : resourceId,
                    "sheetId" : id
                })

                if config == None:
                    config = {
                        "packageId" : packageId,
                        "resourceId" : resourceId,
                        "sheetId": id
                    }

                # tack on zip stuff
                if sheetConfig.get("fromZip") == True:
                    config["fromZip"] = True
                    config["zip"] = sheetConfig.get("zip")

            data = getWorksheetData(workbook.sheet_by_name(sheet))

            datasheets.append({
                "data" : data,
                config : config
            })


    #TODO: how do we really want to handle this?
    except Exception as e:
        pass

    return datasheets

def getWorksheetData(sheet):
    data = []
    for i in range(sheet.nrows):
        row = []
        for j in range(sheet.ncols):
            row.append(str(sheet.cell_value(i, j)))
        data.append(row)
    return data