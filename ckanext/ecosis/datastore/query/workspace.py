from ckanext.ecosis.datastore.ckan import resource as ckanResourceQuery
from ckanext.ecosis.datastore.ckan import package as ckanPackageQuery
# WHY is this not working?
# from . import getResource

collections = None
getResource = None

def init(co, fn):
    global collections, getResource

    collections = co
    getResource = fn

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
        }
    }

    if response['package'] is None:
        response['package'] = {}


    for resource in resources:
        sheets = getResource(resource.get('id'))

        for sheet in sheets:
            # we don't care about root excel files, only the sheets
            if sheet.get('excel') == True or sheet.get('isZip') == True:
                continue

            response.get('resources').append(sheet)

    # now add all zip file resources
    #resources = collections.get("resource").find({
    #    "packageId" : package_id,
    #    "fromZip" : True
    #})

    #for resourceOrSheet in resources:
    #    response.get('resources').append(resourceOrSheet)

    return response