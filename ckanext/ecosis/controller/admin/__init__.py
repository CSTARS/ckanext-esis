from ckan.common import request, response
from ckan.lib.base import c, model
import ckan.logic as logic
import ckan.lib.uploader as uploader
import json, subprocess, os, urllib2, re

from ecosis.datastore.mapreduce import mapreducePackage

# rebuild entire search index
def rebuildIndex(collections):
    context = {'model': model, 'user': c.user}

    if not isAdmin():
        raise Exception('Nope.')

    list = logic.get_action('package_list')(context,{})

    # clear the current collection
    collections.get("package_search").remove({})

    for pkgId in list:
        context = {'model': model, 'user': c.user}
        ckanPackage = logic.get_action('package_show')(context,{id: pkgId})

        mapreducePackage(ckanPackage, collections.get("spectra_search"), collections.get("package_search"))

    return json.dumps({'success': True, 'rebuildCount': len(list)})

# dump everything (data)!
def clean(collections):
    response.headers["Content-Type"] = "application/json"
    context = {'model': model, 'user': c.user}

    path = os.path.dirname(__file__)

    if not isAdmin():
        raise Exception('Nope.')

    cmd = "git branch"
    process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=path)
    branches = process.communicate()[0].split("\n")
    for branch in branches:
        if "*" in branch:
            branch = branch.replace("* ","")
            if branch == 'master':
                return json.dumps({'error':True, 'message':'operation can\'t be preformed on branch master'})

    packages = logic.get_action('package_list')(context, {})

    for package in packages:
        package = logic.get_action('package_show')(context, {'id': package})
        # make sure all resources are removed from disk
        if 'resources' in package:
            for r in package['resources']:
                if r.get('url_type') == "upload":
                    upload = uploader.ResourceUpload(r)
                    path = upload.get_path(r['id'])
                    if os.path.exists(path):
                        os.remove(path)
        logic.get_action('package_delete')(context, {'id': package['id']})

    # clear mongo
    for collection in collections:
        collection.remove({})

    return json.dumps({
        'removed': packages,
        'message' : 'Go to /ckan-admin/trash to finish cleanup'
    })

def rebuildUSDACollection(collections, usdaApiUrl):
    if not isAdmin():
        raise Exception('Nope.')

    usdaCollection = collections.get('usda')
    usdaCollection.get('usda').remove({})

    resp = urllib2.urlopen(usdaApiUrl)
    rows = re.sub(r'\r', '', resp.read()).split('\n')
    header = re.sub(r'"', '', rows[0]).split(',')

    for i in range(1, len(rows)-1):
        row = re.sub(r'"', '', rows[i]).split(',')
        item = {}
        for j in range(0, len(header)-1):
            item[header[j]] = row[j]
        usdaCollection.insert(item)

    return json.dumps({'success':True, 'count': len(rows)-2})

def isAdmin():
    if c.userobj == None:
        return False
    if not c.userobj.sysadmin:
        return False
    return True