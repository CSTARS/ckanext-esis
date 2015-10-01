from datetime import datetime, timedelta
import re
import os
import shutil
import zipfile
import hashlib

from ecosis.datastore.ckan import resource as ckanResourceQuery
from ecosis.datastore.ckan import package as ckanPackageQuery
from ecosis.datastore.parser import process as importer

dataExtension = ["xlsx","xls","spectra","csv","tsv"]
allowedOptions = ['map', 'sort']
packageExpireTime = timedelta(days=1)
workspaceDir = ""

def init(co, resourceUtils, workDir):
    global collections, resourceUtil, workspaceDir

    collections = co
    resourceUtil = resourceUtils
    workspaceDir = workDir

# cleanup unused workspaces
def clean(current_package_id=None):
    expired = datetime.utcnow() - packageExpireTime

    packages = collections.get("package").find({
        '$and' : [
            {'lastTouched': {'$lt' : expired } },
            {'packageId' : {'$ne' : current_package_id}}
        ]
    })

    for package in packages:
        if package.get("package_id") == current_package_id:
            continue

        cleanPackage(package.get('package_id'))

def cleanPackage(package_id):
    # remove all spectra chunks
    collections.get('spectra').remove({
        "packageId" : package_id,
    })

    # set not prepared
    collections.get("package").update({
        "packageId": package_id
    },{
        "$set" : {
            "prepared" : False
        }
    })

    # remove all hash file ids.  next time we process, we should assume all is bad
    collections.get("resource").update({
        "packageId": package_id
    },{
        "$set" : {
            "hash" : None
        }
    },multi=True)

    # clear anything placed on the filesystem workspace
    workspacePath = os.path.join(workspaceDir, package_id)

    # clean out any existing extraction
    if os.path.exists(workspacePath):
        shutil.rmtree(workspacePath)

def touch(package_id):
    collections.get("package").update(
        {"packageId":package_id},
        {"$set" :{
            "lastTouched" : datetime.utcnow()
        }}
    )

def setOptions(package_id, options):

    packageInfo = collections.get("package").find_one({"packageId": package_id})
    if packageInfo is None:
        return

    for option in allowedOptions:
        if option in options:
            packageInfo[option] = options[option]

    packageInfo["lastTouched"] = datetime.utcnow()

    collections.get("package").update({"packageId": package_id}, packageInfo)

def prepare(package_id, force=False):
    packageInfo = collections.get("package").find_one({
        "packageId" : package_id,
    })

    if packageInfo is None:
        packageInfo = {
            "packageId" : package_id
        }

    # quit if there is nothing todo
    if not force and packageInfo.get("prepared") == True:
        return {
            "success" : True,
            "message" : "already prepared, use force flag to force prepare"
        }

    ckanPackage = ckanPackageQuery.get(package_id)
    if ckanPackage.get('state') == 'deleted':
        raise Exception('Package has been deleted')

    # get all package resources
    resources = ckanResourceQuery.active(package_id)

    for resource in resources:

        filepath = resourceUtil.get_path(resource.get('id'))
        ext = _getFileExtension(resource.get('name'))

        if ext == "zip":
            extractZip(package_id, resource.get('id'), filepath, resource.get('name'))
        else:
            importer.processFile(filepath, package_id, resource.get('id'), resource=resource)

    packageInfo["lastTouched"] = datetime.utcnow()
    packageInfo["prepared"] = True

    collections.get("package").update({"packageId":package_id}, packageInfo, upsert=True)
    return packageInfo

# helper for single file process, handles zip condition
def prepareFile(package_id, resource_id, sheet_id=None, options={}):
    resource = ckanResourceQuery.get(resource_id)
    filepath = resourceUtil.get_path(resource_id)
    ext = _getFileExtension(resource.get('name'))

    if ext == "zip":
        extractZip(package_id, resource.get('id'), filepath, resource.get('name'))
    else:
        importer.processFile(filepath, package_id, resource.get('id'), sheetId=sheet_id, options=options, resource=resource)



# extract zip file and set resources
def extractZip(package_id, resource_id, zipPath, zipName):
    workspacePath = os.path.join(workspaceDir, package_id, resource_id)

    # clean out any existing extraction
    if os.path.exists(workspacePath):
        shutil.rmtree(workspacePath)

    z = zipfile.ZipFile(zipPath, "r")

    for info in z.infolist():
        if _isDataFile(info.filename):
            parts = info.filename.split("/")

            zipPath = ""
            for i in range(0, len(parts)-1):
                zipPath += parts[i]+"/"

            # create id for individual file
            name = re.sub(r".*/", "", info.filename)
            id = _getZipResourceId(resource_id, zipPath, name)

            #extract individual file
            z.extract(info, workspacePath)

            resource = {
                "packageId" : package_id,
                "resourceId" : id,
                "name" : name,
                "file" : workspacePath,
                "zip" : {
                    "name" : zipName,
                    "resourceId" : resource_id
                },
                "fromZip" : True
            }

            collections.get("resource").insert(resource)

            # now we pass with new resource id, but path to file
            importer.processFile(workspacePath, package_id, id, resource=resource)
        # TODO: implement .ecosis file

def _getZipResourceId(rid, path, name):
    m = hashlib.md5()
    m.update("%s%s%s" % (rid, path, name))
    return m.hexdigest()

def _getFileExtension(filename):
    return re.sub(r".*\.", "", filename)

def _isDataFile(filename):
    if _getFileExtension(filename) in dataExtension:
        return True
    return False