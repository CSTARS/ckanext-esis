import os
import json

from ckan.common import request, response
from ckan.lib.base import c, model
import ckan.logic as logic
import ckan.lib.uploader as uploader

import ckanext.ecosis.lib.utils as utils
from ckanext.ecosis.lib.auth import hasAccess
import ckanext.ecosis.datastore.delete as deleteUtil
import ckanext.ecosis.datastore.query as query
import ckanext.ecosis.datastore.workspace as workspace
from ckanext.ecosis.lib.utils import jsonStringify
from ckanext.ecosis.controller.package.doi import hasAppliedDoi

parseOptions = ["ignore", "layout", "metadata", "joinOn", "seperator"]

def delete():
    response.headers["Content-Type"] = "application/json"

    params = utils.get_request_data(request)

    # remove resource from disk - normally this doesn't happen
    resp = _delete(params)

    return json.dumps(resp)

def deleteMany():
    response.headers["Content-Type"] = "application/json"

    params = utils.get_request_data(request)
    ids = params.get('ids')

    resp = []

    for id in ids:
        resp.append(_delete({'id': id}))

    return jsonStringify(resp)

def _delete(params):
    # remove resource from disk - normally this doesn't happen
    context = {'model': model, 'user': c.user}
    resource = logic.get_action('resource_show')(context, params)

    if hasAppliedDoi(resource.get('package_id')):
        return {'error':True, 'message':'Cannot delete resource of package with applied DOI'}

    # this will fire error if user does not have access
    logic.get_action('resource_delete')(context, params)
    id = params.get('id')

    if resource.get('url_type') == "upload":
        upload = uploader.ResourceUpload(resource)
        path = upload.get_path(resource['id'])
        if os.path.exists(path):
            os.remove(path)

    deleteUtil.resource(resource.get("package_id"), id)

    params['success'] = True
    return params

def create():
    response.headers["Content-Type"] = "application/json"

    request_data = dict(request.POST)

    if hasAppliedDoi(request_data.get('package_id')):
        return {'error': True, 'message': 'Cannot add resources to package with applied DOI'}

    context = {'model': model, 'user': c.user}
    resource_create = logic.get_action('resource_create')
    resp = resource_create(context, request_data)

    return json.dumps({
        'result' : resp,
        'success' : True
    })


def process():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    hasAccess(package_id)

    if hasAppliedDoi(package_id):
        return {'error':True, 'message':'Cannot edit resource of package with applied DOI'}

    sheet_id = request.params.get('sheet_id')
    resource_id = request.params.get('resource_id')
    ids = request.params.get('resource_ids')

    if sheet_id == "":
        sheet_id = None

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

    # update the dataset, so the metadata timestamp changes
    context = {'model': model, 'user': c.user}
    pkg = logic.get_action('package_show')(context, {'id': package_id})

    resourceUpdateCount = utils.getPackageExtra('resourceUpdateCount', pkg)
    if resourceUpdateCount is None:
        resourceUpdateCount = 1
    else:
        resourceUpdateCount = int(resourceUpdateCount) + 1
    utils.setPackageExtra('resourceUpdateCount', resourceUpdateCount, pkg)
    pkg = logic.get_action('package_update')(context, pkg)

    result = {
        'metadata_modified' : pkg.get('metadata_modified'),
        'result' : result
    }

    return jsonStringify(result)

def get():
    response.headers["Content-Type"] = "application/json"

    pid = request.params.get('package_id')
    rid = request.params.get('resource_id')
    sid = request.params.get('sheet_id')

    if sid == "":
        sid = None

    hasAccess(pid)

    return jsonStringify(query.getResource(rid, sid))

def getMetadataChunk():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    if sheet_id == "":
        sheet_id = None

    return jsonStringify(query.getMetadataChunk(package_id, resource_id, sheet_id, _getIndex()))

def getMetadataInfo():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    if sheet_id == "":
        sheet_id = None

    return jsonStringify(query.getMetadataInfo(package_id, resource_id, sheet_id))

def getSpectraCount():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    if sheet_id == "":
        sheet_id = None

    return jsonStringify(query.total(package_id, resource_id, sheet_id))

def _getIndex():
    index = request.params.get('index')
    if index is None:
        return 0
    else:
        return int(index)
