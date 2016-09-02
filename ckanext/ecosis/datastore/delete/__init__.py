import os, shutil

collections = None
workspaceDir = None

'''
Helper methods for remove packages from the EcoSIS extension.  There are two groups
of MongoDB collections that are maintained.  The workspace collections used by the CKAN
extension and the search collections, used by the search application.  Finally, the
extension does store files on disk while a workspace is 'open'.  These files need
to be cleaned as well.
'''

def init(mongoCollections, workspaceDirectory):
    global collections, workspaceDir

    collections = mongoCollections
    workspaceDir = workspaceDirectory

# remove a package from EcoSIS
# Note: this does not handle removing package for CKAN, the EcoSIS extension
def package(package_id):
    # remove from the package workspace
    collections.get('package').remove({
        "packageId": package_id
    })

    # remove from the spectra workspace
    collections.get('spectra').remove({
        "packageId": package_id,
    })

    # remove from the resources workspace
    collections.get('resource').remove({
        "packageId": package_id,
    })

    cleanFromSearch(package_id)

    # clear anything placed on the filesystem workspace
    # this is were we store cache files (ie excel sheets as CSV files, for example) and the like
    workspacePath = os.path.join(workspaceDir, package_id)
    if os.path.exists(workspacePath):
        shutil.rmtree(workspacePath)

# The really important bit, remove package for primary MongoDB search collections
# this will pull all references of package from ecosis.org
def cleanFromSearch(package_id):
    # remove from package collection
    collections.get('search_package').remove({
        "_id": package_id,
    })

    # remove from spectra collection
    collections.get('search_spectra').remove({
        "ecosis.package_id": package_id,
    })

# remove a resource from Mongo collections as well as disk
# Note: this does not handle removing resource for CKAN, the EcoSIS extension
def resource(package_id, resource_id):
    collections.get('spectra').remove({
        "resourceId": resource_id,
    })

    collections.get('resource').remove({
        "resourceId": resource_id,
    })

    # if zip, remove child references
    childResources = collections.get('resource').find({"zip.resourceId": resource_id})

    for childResource in childResources:
        collections.get('spectra').remove({
            "resourceId": childResource.get('resourceId'),
        })

    collections.get('resource').remove({
        "zip.resourceId": resource_id,
    })

    path = os.path.join(workspaceDir, package_id, resource_id)
    if os.path.exists(path):
        shutil.rmtree(path)

# when a excel sheet is processed, keep track of it's sheet id's
# this will remove all spectra sheets that are not in this list
def removeDeletedExcelSheets(resource_id, current_sheet_id_list):
    if None not in current_sheet_id_list:
        current_sheet_id_list.append(None)

    collections.get('resource').remove({
        'resourceId' : resource_id,
        'sheetId' : {
            '$nin' : current_sheet_id_list
        }
    })

    collections.get('spectra').remove({
        'resourceId' : resource_id,
        'sheetId' : {
            '$nin' : current_sheet_id_list
        }
    })

def resources(package_id, resources):
    for resource_id in resources:
        resource(package_id, resource_id)