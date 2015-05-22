import os, json, time

collection = {'info' : None}

def setInfoCollection(c):
    collection['info'] = c

def getInfoFile(file, package_id):
    fileData = collection['info'].find_one({'file': file})
    if fileData == None:
        return None

    return json.loads(fileData['data'])

    #if not os.path.exists(file):
    #    return {}

    #file = open(file, 'r')
    #parseData = json.loads(file.read())
    #file.close()

    #return parseData

def saveInfoFile(file, data, package_id):
    # this actually looks to be faster
    runTime = time.time()

    collection['info'].update(
        {'file': file},
        {
            'file' : file,
            'data': json.dumps(data),
            'package_id' : package_id
        },
        upsert=True)

    #f = open(file, 'w')
    #json.dump(data, f)
    #f.close()
    print "  --resource file %s write time:\n      %ss" % (file, (time.time() - runTime))