collections = None
running = False

def init(mongoCollections):
    global collections
    collections = mongoCollections

def update():
    global running

    if running:
        return

    running = True
    try:
        _update()
    except Exception as e:
        print "Error creating lookup index"
    running = False

def _update():
    collection = collections.get('search_package')
    lookupCollection = collections.get('lookup')

    packages = collection.find({},{'value.id':0,'value.ecosis':0})

    lookup = {}

    for package in packages:
        package = package['value']
        for key in package:

            if key not in lookup:
                lookup[key] = {}

            for value in package[key]:
                lookup[key][value] = 1

    keys = []
    for key in lookup:
        keys.append(key)

        arr = []
        for value in lookup[key]:
            arr.append(value)
        arr.sort()

        lookupCollection.update({"key": key},{
            "key" : key,
            "values" : arr
        }, upsert=True)

    lookupCollection.remove({
        "key" : {
            "$nin" : keys
        }
    })


