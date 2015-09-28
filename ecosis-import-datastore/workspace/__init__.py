from datetime import datetime, timedelta
import re, os, shutil, zipfile, hashlib
import ckan.resource as ckanResourceQuery
import parser.process as importer

dataExtension = ["xlsx","xls","spectra","csv","tsv"]
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

        collections.get('spectra').remove({
            "packageId" : package.get("package_id"),
        })

        package["prepared"] = False
        collections.get("package").update({"packageId", package.get("package_id")}, package)

        # clear anything placed on the filesystem workspace
        workspacePath = os.path.join(workspaceDir, package.get("package_id"))

        # clean out any existing extraction
        shutil.rmtree(workspacePath)

def touch(package_id):
    packageInfo = collections.get("package").find_one({
        "packageId" : package_id,
    })

    if packageInfo is None:
        return

    packageInfo["lastTouched"] = datetime.utcnow()

    collections.get("package").update({"packageId":package_id}, packageInfo)


def prepare(package_id):
    packageInfo = collections.get("package").find_one({
        "packageId" : package_id,
    })

    if packageInfo is None:
        packageInfo = {
            "packageId" : package_id
        }

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

    result = collections.get("package").update({"packageId":package_id}, packageInfo, upsert=True)
    t = 1

# extract zip file and set resources
def extractZip(package_id, resource_id, zipPath, zipName):
    workspacePath = os.path.join(workspaceDir, package_id, resource_id)

    # clean out any existing extraction
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