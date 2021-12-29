import os
from bson.code import Code
from bson.son import SON

'''
Create the keywords typeahead collection
Will run the lookup mapreduce js functions in MongoDB
'''

# Read in local js mapreduce files
path = os.path.dirname(os.path.abspath(__file__))
collections = None
running = False

f = open('%s/../mapreduce/lookup_map.js' %  path, 'r')
mapJs = Code(f.read())
f.close()

f = open('%s/../mapreduce/lookup_reduce.js' % path, 'r')
reduceJs = Code(f.read())
f.close()

# inject global dependencies
def init(mongoCollections):
    global collections
    collections = mongoCollections

def update():
    global running

    # check if we are already running
    if running:
        return

    running = True
    try:
        _update()
    except Exception as e:
        print("Error creating lookup index")
    running = False

# update the filter lookup collection
def _update():
    collection = collections.get('search_package')
    try:
        collection.map_reduce(mapJs, reduceJs, out=SON([("replace", "lookup")]))
    except Exception as e:
        pass



