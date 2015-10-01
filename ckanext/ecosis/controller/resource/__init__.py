import os
import json

from ckan.common import request, response
from ckan.lib.base import c, model
import ckan.logic as logic
import ckan.lib.uploader as uploader
import ecosis.lib.utils as utils
from ecosis.lib.auth import hasAccess
import ecosis.datastore.delete as deleteUtil
import ecosis.datastore.query as query
import ecosis.datastore.workspace as workspace
from ecosis.lib.utils import jsonStringify

parseOptions = ["ignore", "layout", "metadata", "joinOn"]

def delete():
    response.headers["Content-Type"] = "application/json"

    params = utils.get_request_data(request)

    # remove resource from disk - normally this doesn't happen
    _delete(params)

    return json.dumps({'success': True})

def deleteMany():
    response.headers["Content-Type"] = "application/json"

    params = utils.get_request_data(request)
    ids = params.get('ids')

    for id in ids:
        _delete({'id': id})

    return jsonStringify({'success': True})

def _delete(params):
    # remove resource from disk - normally this doesn't happen
    context = {'model': model, 'user': c.user}
    resource = logic.get_action('resource_show')(context, params)

    # this will fire error if user does not have access
    logic.get_action('resource_delete')(context, params)
    id = params.get('id')

    if resource.get('url_type') == "upload":
        upload = uploader.ResourceUpload(resource)
        path = upload.get_path(resource['id'])
        if os.path.exists(path):
            os.remove(path)

    deleteUtil.resource(resource.get("package_id"), id)

def process():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    hasAccess(package_id)

    sheet_id = request.params.get('sheet_id')
    resource_id = request.params.get('resource_id')
    ids = request.params.get('resource_ids')

    try:
        options = json.loads(request.params.get('options'))
    except:
        options = {}

    # option, if a resource id and a datasheet id are passed, then the full 'merged' view will be return

    safeOptions = {}
    for option in parseOptions:
        if option in options:
            safeOptions[option] = options[option]


    result = []
    if ids is not None:
        ids = json.loads(ids)
        for resource_id in ids:
            workspace.prepareFile(package_id, resource_id, sheet_id, safeOptions)
            result.append(query.getResource(resource_id))
    else:
        workspace.prepareFile(package_id, resource_id, sheet_id, safeOptions)
        result = query.getResource(resource_id, sheet_id)

    return jsonStringify(result)

def get():
    response.headers["Content-Type"] = "application/json"

    pid = request.params.get('package_id')
    rid = request.params.get('resource_id')
    sid = request.params.get('sheet_id')

    hasAccess(pid)

    return jsonStringify(query.getResource(rid, sid))

def getMetadataChunk():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    return jsonStringify(query.getMetadataChunk(package_id, resource_id, sheet_id, _getIndex()))

def getMetadataInfo():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    return jsonStringify(query.getMetadataInfo(package_id, resource_id, sheet_id))

def getSpectraCount():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    return jsonStringify(query.total(package_id, resource_id, sheet_id))

def _getIndex():
    index = request.params.get('index')
    if index is None:
        return 0
    else:
        return int(index)
