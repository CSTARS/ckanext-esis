import json

from ckan.common import request, response

from ckanext.ecosis.lib.utils import jsonStringify
import ckanext.ecosis.datastore.query as query
from ckanext.ecosis.datastore.vocab import top
import ckanext.ecosis.lib.utils as utils

def get():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    return jsonStringify(query.get(package_id, resource_id, sheet_id, _getIndex(), showProcessInfo=True))

def suggestAttributeName():
    response.headers["Content-Type"] = "application/json"

    name = request.params.get('name')
    if name is None:
        name = ""

    return jsonStringify(top.suggest(name))

def suggestOverview():
    response.headers["Content-Type"] = "application/json"

    params = {}
    try:
        keys = request.POST.keys()
        if 'names' in keys:
            params['names'] = request.POST['names']
    except Exception as e:
        params = {'names': request.params.get('names')}

    if params.get('names') is None:
        raise Exception('Name list not provided')

    return jsonStringify(top.overview(json.loads(params.get('names'))))


def _getIndex():
    index = request.params.get('index')
    if index is None:
        return 0
    else:
        return int(index)