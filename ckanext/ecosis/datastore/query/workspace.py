from ckanext.ecosis.datastore.ckan import resource as ckanResourceQuery
from ckanext.ecosis.datastore.ckan import package as ckanPackageQuery
import ckan.lib.uploader as uploader
import os

collections = None
getResource = None
isPushed = None

# inject global dependencies
def init(co, fn, q):
    global collections, getResource, isPushed

    collections = co
    getResource = fn
    isPushed = q

# get a workspace for a package
def get(package_id):
    # get all package resources
    resources = ckanResourceQuery.active(package_id)

    response = {
        "package" : collections.get("package").find_one({
            "packageId": package_id,
        }, {"runInfo": 0, "_id": 0}),
        "resources" : [],
        "ckan" : {
            "package" : ckanPackageQuery.get(package_id),
            "resources" : resources
        },
        "pushed" : isPushed(package_id)
    }

    if response['package'] is None:
        response['package'] = {}

    # append information about the dataset resources to response
    for resource in resources:
        sheets = getResource(resource.get('id'))

        upload = uploader.ResourceUpload(resource)
        path = upload.get_path(resource['id'])
        if os.path.exists(path):
            resource['file_size'] = os.path.getsize(path)
        else:
            resource['file_size'] = 0

        for sheet in sheets:
            # we don't care about root excel files, only the sheets
            if sheet.get('excel') == True or sheet.get('isZip') == True:
                continue

            response.get('resources').append(sheet)

    return response