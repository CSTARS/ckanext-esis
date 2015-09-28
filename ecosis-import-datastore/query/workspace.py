import ckan.resource as ckanResourceQuery

collections = None

def init(co):
    global collections

    collections = co


def get(package_id):
    # get all package resources
    resources = ckanResourceQuery.active(package_id)

    response = {
        "package" : None,
        "resources" : []
    }

    for resource in resources:
        sheets = collections.get("resource").find({
            "packageId" : package_id,
            "resourceId" : resource.get('id')
        })

        # resource has not been processed
        if sheets is None or len(sheets) == 0:
            continue

        for sheet in sheets:
            response.get('resources').push(sheet)

    # now add all zip file resources
    resources = collections.get("resource").find({
        "packageId" : package_id,
        "fromZip" : True
    })

    for resourceOrSheet in resources:
        response.get('resources').push(resourceOrSheet)