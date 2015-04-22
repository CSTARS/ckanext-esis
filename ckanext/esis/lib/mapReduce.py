import os, time
from bson.code import Code
from bson.son import SON
from pylons import config

searchCollectionName = config._process_configs[1]['esis.mongo.search_collection']
path = os.path.dirname(os.path.abspath(__file__))

# read in mapreduce strings
f = open('%s/../mapreduce/map.js' %  path, 'r')
map = Code(f.read())
f.close()

f = open('%s/../mapreduce/reduce.js' % path, 'r')
reduce = Code(f.read())
f.close()

extras = ['Citation', 'Funding Source', 'Citation DOI', 'Funding Source Grant Number', 'Website']

#f = open('%s/../mapreduce/finalize.js' % path, 'r')
#self.mapreduce['finalize'] = f.read()
#f.close()

# pkg should be a ckan pkg
# collection should be the search collection
def mapreducePackage(ckanPkg, workspacePackage, collection):
    # if the package is private, remove a return
    if ckanPkg['private'] == True:
        collection.remove({'_id': ckanPkg['id']})
        return

    # TODO: remove this later on
    #finalize = Code(self.mapreduce['finalize'])
    #spectraCollection.map_reduce(map, reduce, finalize=finalize, out=SON([("merge", searchCollectionName)]), query={"ecosis.package_id": pkg['id']})

    collection.map_reduce(map, reduce, out=SON([("merge", searchCollectionName)]), query={"ecosis.package_id": pkg['id']})

    updateEcosisNs(ckanPkg, workspacePackage, collection)

def updateEcosisNs(self, pkg, wrkspacePkg, collection):
    ecosis = {
        "pushed" : time.time(),
        "organization_name" : "",
        "organization_id" : "",
        "organization_image_url" : "",
        "keywords" : [],
        "description" : pkg.get('notes'),
        "groups" : [],
        "package_id" : pkg.get("id"),
        "package_name" : pkg.get("id"),
        "package_title" : pkg.get("title"),
        "created" : pkg.get("created"),
        "modified" : pkg.get("modified"),
        "version" : pkg.get("version"),
        "license" : pkg.get("license"),
        "sort_on" : "",
        "maintainer" : pkg.get("maintainer"),
        "maintainer_email" : pkg.get("maintainer_email"),
        "author" : pkg.get("author"),
        "author_email" : pkg.get("author_email")
    }

    found = []
    for item in pkg['extras']:
        if item.get('key') in extras:
            found.append(item.get('key'))
            ecosis[item.get('key')] = item.get('value')
    for item in extras:
        if not item in found:
            ecosis[item] = None

    dsAttrs = wrkspacePkg.get('datasetAttributes')
    if dsAttrs != None:
        ecosis["sort_on"] = dsAttrs.get('sort_on')

    for item in pkg['tags']:
        ecosis["keywords"].append(item['display_name'])

    for item in pkg['groups']:
        ecosis["groups"].append(item['display_name'])

    if 'organization' in pkg:
        if pkg['organization'] != None:
            ecosis["organization"] = pkg['organization']['title']
            ecosis["organization_id"] = pkg['organization']['id']
            ecosis["organization_image_url"] = '/uploads/group/%s' % pkg['organization']['image_url']

    # make sure the map reduce did not create a null collection, if so, remove
    # This means there is no spectra
    item = collection.find_one({'_id': pkg['id'], 'value': None})

    # now see if we have a group by attribute...
    if item != None:
        collection.remove({'_id': pkg['id']})
    else:
        setValues = {'$set' : { 'value.ecosis': ecosis } }

        collection.update(
            {'_id': pkg['id']},
            setValues
        )
