from ckan.common import request, response

from ecosis.lib.utils import jsonStringify
import ecosis.datastore.query as query

def get():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    return jsonStringify(query.get(package_id, resource_id, sheet_id, _getIndex()))


def getMetadataChunk():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    return jsonStringify(query.getMetadataChunk(package_id, resource_id, sheet_id, _getIndex()))

def _getIndex():
    index = request.params.get('index')
    if index is None:
        return 0
    else:
        return int(index)