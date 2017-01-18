from ckan.common import response
from ckan.lib.base import c, model
import ckan.logic as logic
import ckan.lib.uploader as uploader
import json, subprocess, os, urllib2, re

from ckanext.ecosis.datastore import delete as deleteUtil
from ckanext.ecosis.datastore.mapreduce import mapreducePackage
from ckanext.ecosis.lib.utils import jsonStringify
from upgrade import run as runUpgrade
from upgrade import fixUnits as runFixUnits
from upgrade import fixCitationText as runFixCitationText


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

# Remove all testing data flagged with _testing_
def cleanTests():
    response.headers["Content-Type"] = "application/json"
    context = {'model': model, 'user': c.user}

    path = os.path.dirname(__file__)

    if not isAdmin():
        raise Exception('Nope.')

    result = logic.get_action('package_search')(context, {'q' : '_testing_:true'})
    packages = []
    msgs = []

    for package in result.get('results'):
        packages.append({
            'id': package.get('id'),
            'name' : package.get('name')
        })

        logic.get_action('package_delete')(context, {'id' : package.get('id')})
        deleteUtil.package(package.get('id'))

        # from ckan's admin.py, run a 'purge' on the dataset
        pkgs = model.Session.query(model.Package).filter_by(id=package.get('id'))
        for pkg in pkgs:
            revisions = [x[0] for x in pkg.all_related_revisions]
            revs_to_purge = []
            revs_to_purge += [r.id for r in revisions]
            model.Session.remove()

            for id in revs_to_purge:
                revision = model.Session.query(model.Revision).get(id)
                try:
                    model.repo.purge_revision(revision, leave_record=False)
                except Exception, inst:
                    msgs.append('Problem purging revision %s: %s' % (id, inst))


    return json.dumps({
        "packages" : packages,
        "messages" : msgs,
        "success" : True
    })


# dump everything (data)!
# this will not work on the master branch
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
    collections.get('spectra').remove({})
    collections.get('resource').remove({})
    collections.get('package').remove({})
    collections.get('search_package').remove({})
    collections.get('search_spectra').remove({})
    collections.get('lookup').remove({})

    return json.dumps({
        'removed': packages,
        'message' : 'Go to /ckan-admin/trash to finish cleanup'
    })

# rebuild the USDA MongoDB collection
def rebuildUSDACollection(collections, usdaApiUrl):
    if not isAdmin():
        raise Exception('Nope.')

    usdaCollection = collections.get('usda')
    usdaCollection.remove({})

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

# check workspace collections for badness
def verifyWorkspace(collections):
    if not isAdmin():
        raise Exception('Nope.')

    packages = collections.get('package').find({},{"packageId":1,"prepared":1,"lastTouched":1})
    packageInfo = {}
    ids = []
    repeatPackages = []
    pCount = 0
    for package in packages:
        packageInfo[package.get("packageId")] = {
            "prepared" : package.get("prepared"),
            "lastTouched" : package.get("lastTouched"),
            "workspaceSpectra" : collections.get('spectra').count({"packageId": package.get("packageId")})
        }

        if package.get("packageId") in ids:
            repeatPackages.append(package.get("packageId"))
        else:
            pCount += 1
            ids.append(package.get("packageId"))

    resources = collections.get('resource').find({},{"resourceId":1,"sheetId": 1})
    ids = []
    repeatResources = []
    rCount = 0
    for resource in resources:
        id = "%s %s" % (resource.get("resourceId"), resource.get("sheetId"))
        if id in ids:
            repeatResources.append(id)
        else:
            rCount += 1
            ids.append(id)

    return jsonStringify({
        "packageCount" : pCount,
        "resourceCount" : rCount,
        "spectraCount" : collections.get('spectra').count({"type": "data"}),
        "metadataCount" : collections.get('spectra').count({"type": "metadata"}),
        "repeats" : {
            "resources" : repeatResources,
            "packages" : repeatPackages
        },
        "packageInfo" : packageInfo
    })

def isAdmin():
    if c.userobj == None:
        return False
    if not c.userobj.sysadmin:
        return False
    return True

def upgrade():
    if not isAdmin():
        raise Exception('Nope.')

    return jsonStringify(runUpgrade())

def fixUnits():
    if not isAdmin():
        raise Exception('Nope.')

    return jsonStringify(runFixUnits())

def fixCitationText():
    if not isAdmin():
        raise Exception('Nope.')

    return jsonStringify(runFixCitationText())
