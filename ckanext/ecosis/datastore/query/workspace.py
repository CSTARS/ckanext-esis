from  ecosis.datastore.ckan import resource as ckanResourceQuery
from  ecosis.datastore.ckan import package as ckanPackageQuery

collections = None

def init(co):
    global collections

    collections = co


def get(package_id):
    # get all package resources
    resources = ckanResourceQuery.active(package_id)

    response = {
        "package" : collections.get("package").find_one({"packageId":package_id}),
        "resources" : [],
        "ckan" : {
            "package" : ckanPackageQuery.get(package_id),
            "resources" : resources
        }
    }

    if response['package'] is None:
        response['package'] = {}


    for resource in resources:
        sheets = collections.get("resource").find({
            "packageId" : package_id,
            "resourceId" : resource.get('id')
        },{
            "localRange" : 0,
            "hash" : 0,
            "file" : 0,
            "_id" : 0
        })

        for sheet in sheets:
            # we don't care about root excel files, only the sheets
            if sheet.get('excel') == True:
                continue

            # only send metadata attributes
            metadata = []
            if sheet.get('attributes') is not None:
                for attr in sheet.get('attributes'):
                    if attr.get("type") != "metadata":
                        continue

                    metadata.append(attr.get("name"))
            sheet['attributes'] = metadata

            response.get('resources').append(sheet)

    # now add all zip file resources
    resources = collections.get("resource").find({
        "packageId" : package_id,
        "fromZip" : True
    })

    for resourceOrSheet in resources:
        response.get('resources').append(resourceOrSheet)

    return response