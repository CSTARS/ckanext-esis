
collections = None

def init(mongoCollections):
    global collections

    collections = mongoCollections

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


def resource(package_id, resource_id):
    collections.get('spectra').remove({
        "resourceId": resource_id,
        "packageId": package_id,
    })

    collections.get('resource').remove({
        "resourceId": resource_id,
        "packageId": package_id,
    })

    # if zip, remove child references
    collections.get('resource').remove({
        "zip.resourceId": resource_id,
        "packageId": package_id,
    })

def resources(package_id, resources):
    for resource_id in resources:
        resource(package_id, resource_id)