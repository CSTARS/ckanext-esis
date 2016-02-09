import os
from bson.code import Code
from bson.son import SON
from pylons import config

path = os.path.dirname(os.path.abspath(__file__))
collections = None
running = False

f = open('%s/../mapreduce/lookup_map.js' %  path, 'r')
mapJs = Code(f.read())
f.close()

f = open('%s/../mapreduce/lookup_reduce.js' % path, 'r')
reduceJs = Code(f.read())
f.close()

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
    try:
        collection.map_reduce(mapJs, reduceJs, out=SON([("replace", "lookup")]))
    except Exception as e:
        pass



