import os, shutil

collections = None
workspaceDir = None

def init(mongoCollections, workspaceDirectory):
    global collections, workspaceDir

    collections = mongoCollections
    workspaceDir = workspaceDirectory

def package(package_id):
    collections.get('package').remove({
        "packageId": package_id
    })

    collections.get('spectra').remove({
        "packageId": package_id,
    })

    collections.get('resource').remove({
        "packageId": package_id,
    })

    cleanFromSearch(package_id)

    # clear anything placed on the filesystem workspace
    workspacePath = os.path.join(workspaceDir, package_id)
    if os.path.exists(workspacePath):
        shutil.rmtree(workspacePath)

def cleanFromSearch(package_id):
    collections.get('search_package').remove({
        "_id": package_id,
    })

    collections.get('search_spectra').remove({
        "ecosis.package_id": package_id,
    })

def resource(package_id, resource_id):
    collections.get('spectra').remove({
        "resourceId": resource_id,
    })

    collections.get('resource').remove({
        "resourceId": resource_id,
    })

    # if zip, remove child references
    collections.get('resource').remove({
        "zip.resourceId": resource_id,
    })

    path = os.path.join(workspaceDir, package_id, resource_id)
    if os.path.exists(path):
        shutil.rmtree(path)

def resources(package_id, resources):
    for resource_id in resources:
        resource(package_id, resource_id)