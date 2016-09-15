from datetime import datetime, timedelta
import re
import os
import shutil
import zipfile
import hashlib

from ckanext.ecosis.datastore.ckan import resource as ckanResourceQuery
from ckanext.ecosis.datastore.ckan import package as ckanPackageQuery
from ckanext.ecosis.datastore.files import process as importer

dataExtension = ["xlsx","xls","spectra","csv","tsv"]
allowedOptions = ['map', 'sort']
packageExpireTime = timedelta(days=1)
workspaceDir = ""

'''
The workspace is the core of the EcoSIS ckan extension.  It is composed of both collections in MongoDB
and files on disk.  The workspace spectra, resource and dataset collections contain information about
the dataset including last process time and resource (csv, excel, etc) parsing information.  The spectra
collection contains a entry for every row/column in every spectra resource file.

Workspaces will remain 'open', ie files on disk and data in the workspace package and spectra collections
for one day.  If they are not 'touched' in 24 hours, they will be removed.

The resources workspace collection is persistent.  It must always remember the file parsing configuration
incase the user comes back while the other two workspace collections (spectra, package) are volatile.

Finally, the filesystem stores all spectra resources as individual CSV sheets for fast lookups.  That means
valid file types are extrated from zip files and excel files are expanded into multiple csv sheets.  This
allows efficient responses to file parsing changes by the user (Excel is SLOW, nested inside zip is complicated,
zipped excel is both).
'''

# inject global resources
def init(co, resourceUtils, workDir):
    global collections, resourceUtil, workspaceDir

    collections = co
    resourceUtil = resourceUtils
    workspaceDir = workDir

# cleanup unused workspaces
def clean(current_package_id=None):
    expired = datetime.utcnow() - packageExpireTime

    # find all packages that were last touch before expired date
    packages = collections.get("package").find({
        '$and' : [
            {'$or' :[
                {'lastTouched': {'$exists' : False} },
                {'lastTouched': {'$lt' : expired } },
            ]},
            {'packageId' : {'$ne' : current_package_id}}
        ]
    })

    # remove those packages from workspace
    for package in packages:
        if package.get("package_id") == current_package_id:
            continue

        cleanPackage(package.get('packageId'))

# remove a package from the workspace
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
            "prepared" : False,
            "runInfo" : None
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

# update the last touched field for a package
def touch(package_id):
    collections.get("package").update(
        {"packageId":package_id},
        {"$set" :{
            "lastTouched" : datetime.utcnow()
        }}
    )

# TODO: verify this can go away
# def setOptions(package_id, options):
#     # TODO: should we always run a prepare?
#     # are just insert default option setup if not prepared?
#     prepare(package_id)
#
#     packageInfo = collections.get("package").find_one({"packageId": package_id})
#     if packageInfo is None:
#         return
#
#     for option in allowedOptions:
#         if option in options:
#             packageInfo[option] = options[option]
#
#     packageInfo["lastTouched"] = datetime.utcnow()
#     packageInfo["modified"] = datetime.utcnow()
#
#     collections.get("package").update({"packageId": package_id}, packageInfo)

# prepare a package, that means expand it out, make sure the workspace package and
# spectra collections are populated for this package.  Make sure all disk resources
# are properly created in workspace folder
def prepare(package_id, force=False):
    packageInfo = collections.get("package").find_one({
        "packageId" : package_id,
    },{"_id" : 0})

    # create a workspace package object if required
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

    # make sure we are not trying to prepare a package that has been deleted
    ckanPackage = ckanPackageQuery.get(package_id)
    if ckanPackage.get('state') == 'deleted':
        raise Exception('Package has been deleted')

    # get all package resources
    resources = ckanResourceQuery.active(package_id)

    status = []
    for resource in resources:
        # get path on disk for file as well as file extension
        filepath = resourceUtil.get_path(resource.get('id'))
        ext = _getFileExtension(resource.get('name'))

        # extract zip contents if zip
        if ext == "zip":
            # TODO: we should be checking a zip hash before we go unzipping every time
            results = extractZip(package_id, resource.get('id'), filepath, resource.get('name'))
            for result in results:
                status.append(result)

        # extract 'normal' file (non-zip)
        else:
            result = importer.processFile(filepath, package_id, resource.get('id'), resource=resource)
            status.append(result)

    # respond with update of what we did (or did not) do.
    packageInfo["runInfo"] = status
    packageInfo["lastTouched"] = datetime.utcnow()
    packageInfo["prepared"] = True

    collections.get("package").update({"packageId":package_id}, packageInfo, upsert=True)
    return packageInfo

# helper for single file process, handles zip condition
def prepareFile(package_id, resource_id, sheet_id=None, options={}):
    sheetInfo = collections.get("resource").find_one({
        "resourceId" : resource_id,
        "sheetId" : sheet_id
    })

    if sheetInfo is None:
        sheetInfo = {}

    # get the name of the resource
    if 'name' in sheetInfo:
        resource = sheetInfo
    else: # fallback on querying PG for the name
        resource = ckanResourceQuery.get(resource_id)

    # see if we have the path, otherwise lookup it up
    if 'file' in sheetInfo:
        filepath = sheetInfo.get('file')
    else:
        filepath = resourceUtil.get_path(resource_id)

    ext = _getFileExtension(resource.get('name'))

    # much like in the prepare() method aboves resource loop
    if ext == "zip":
        extractZip(package_id, resource.get('id'), filepath, resource.get('name'), options=options)
    else:
        importer.processFile(filepath, package_id, resource_id, sheetId=sheet_id, options=options, resource=resource)



# extract zip file and set resources
def extractZip(package_id, resource_id, zipPath, zipName, options={}):
    status = []

    # check to see if there are any changes
    zipFileInfo = collections.get("resource").find_one({
        "packageId" : package_id,
        "resourceId" : resource_id
    })
    if zipFileInfo is None:
        zipFileInfo = {}
    hash = importer.hashfile(zipPath)

    # if hashes are equal, we nothing has changed
    if zipFileInfo.get("hash") == hash:
        status.append({
            "resourceId" : resource_id,
            "name" : zipName,
            "unzipped" : False,
            "message" : "nothing todo, hash is equal"
        })
        return status

    # Send info back about what was processed
    zipFileInfo['hash'] = hash
    zipFileInfo['resourceId'] = resource_id
    zipFileInfo['packageId'] = package_id
    zipFileInfo['file'] = zipPath
    zipFileInfo['isZip'] = True

    # update resource collection
    collections.get("resource").update({
        "packageId" : package_id,
        "resourceId" : resource_id
    }, zipFileInfo, upsert=True)

    status.append({
        "resourceId" : resource_id,
        "name" : zipName,
        "unzipped" : True
    })

    # get the workspace path on disk
    workspacePath = os.path.join(workspaceDir, package_id, resource_id)

    # clean out any existing extraction
    if os.path.exists(workspacePath):
        shutil.rmtree(workspacePath)

    z = zipfile.ZipFile(zipPath, "r")

    zipPackageIds = []
    for info in z.infolist():
        if _isDataFile(info.filename):

            # create id for individual file
            name = re.sub(r".*/", "", info.filename)

            if re.match(r"^\..*", name): # ignore .dot files
                continue

            id = _getZipResourceId(resource_id, info.filename)

            #extract individual file
            z.extract(info, workspacePath)

            # check for existing config
            resource = collections.get("resource").find_one({
                "packageId" : package_id,
                "resourceId" : id
            })

            # create new config if one doesn't exist
            if resource is None:
                resource = {
                    "packageId" : package_id,
                    "resourceId" : id,
                    "name" : name,
                    "file" : os.path.join(workspacePath, info.filename),
                    "zip" : {
                        "name" : zipName,
                        "resourceId" : resource_id
                    },
                    "fromZip" : True
                }

                collections.get("resource").update({
                    "packageId" : package_id,
                    "resourceId" : id
                }, resource, upsert=True)

            zipPackageIds.append(id)

            # now we pass with new resource id, but path to file
            result = importer.processFile(resource.get('file'), package_id, id, resource=resource, options=options)
            status.append(result)
        # TODO: implement .ecosis file

    # cleanup
    collections.get("resource").remove({
        "packageId" : package_id,
        "zip.resourceId" : resource_id,
        "resourceId" : {
            "$nin" : zipPackageIds
        }
    })

    # more cleanup
    collections.get("spectra").remove({
        "packageId" : package_id,
        "zip.resourceId" : resource_id,
        "resourceId" : {
            "$nin" : zipPackageIds
        }
    })

    return status

def _getZipResourceId(rid, name):
    m = hashlib.md5()
    m.update("%s%s" % (rid, name))
    return m.hexdigest()

def _getFileExtension(filename):
    return re.sub(r".*\.", "", filename)

def _isDataFile(filename):
    if _getFileExtension(filename) in dataExtension:
        return True
    return False