import os
import json

# from ckan.common import request, response
from ckan.common import request
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
from ckanext.ecosis.datastore.ckan import resource as ckanResourceQuery

parseOptions = ["ignore", "layout", "metadata", "joinOn", "seperator"]

# delete are resource
# By default, CKAN keeps resources on disk after they are deleted.  EcoSIS does not.
def delete():
    response.headers["Content-Type"] = "application/json"

    params = utils.get_request_data(request)

    # remove resource from disk - normally this doesn't happen
    resp = _delete(params)

    return json.dumps(resp)

# Single HTTP call for deleting multiple resources
def deleteMany():
    response.headers["Content-Type"] = "application/json"

    params = utils.get_request_data(request)
    ids = params.get('ids')

    resp = []

    for id in ids:
        resp.append(_delete({'id': id}))

    return jsonStringify(resp)

# Actually delete are srource
def _delete(params):
    # remove resource from disk - normally this doesn't happen
    context = {'model': model, 'user': c.user}
    resource = logic.get_action('resource_show')(context, params)

    # if package has DOI applied, resources cannot be modified
    if hasAppliedDoi(resource.get('package_id')):
        return {'error':True, 'message':'Cannot delete resource of package with applied DOI'}

    # this will fire error if user does not have access
    logic.get_action('resource_delete')(context, params)
    id = params.get('id')

    # if the resource is a file upload, remove from disk
    if resource.get('url_type') == "upload":
        upload = uploader.ResourceUpload(resource)
        path = upload.get_path(resource['id'])
        if os.path.exists(path):
            os.remove(path)

    # remove resource from EcoSIS
    deleteUtil.resource(resource.get("package_id"), id)

    params['success'] = True
    return params

# create new resource for dataset
def create():
    response.headers["Content-Type"] = "application/json"

    request_data = dict(request.POST)

    # if the dataset has a DOI applied, you cannot add new resources
    if hasAppliedDoi(request_data.get('package_id')):
        return {'error': True, 'message': 'Cannot add resources to package with applied DOI'}

    # run the default CKAN create resource logic
    context = {'model': model, 'user': c.user}
    resource_create = logic.get_action('resource_create')
    resp = resource_create(context, request_data)

    return json.dumps({
        'result' : resp,
        'success' : True
    })

# process a resource
# this will be given a set of options, then parse the measurement data or metadata out of
# the resource based on this options
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

    # only allow specified options
    safeOptions = {}
    for option in parseOptions:
        if option in options:
            safeOptions[option] = options[option]

    # see if we are editing multiple files or just one
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

    # use this counter to poke the dataset.  This will update the last modified timestamps
    # required for 'updated since last pushed UI'
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

# get a specific resource
# optional sheet id, it the resource has multiple sheets (excel file)
def get():
    response.headers["Content-Type"] = "application/json"

    pid = request.params.get('package_id')
    rid = request.params.get('resource_id')
    sid = request.params.get('sheet_id')

    if sid == "":
        sid = None

    hasAccess(pid)

    return jsonStringify(query.getResource(rid, sid))

# a get a row or column (depending on sheet orientation) of a resource file
# index is the row/column to retrieve
def getMetadataChunk():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    if sheet_id == "":
        sheet_id = None

    return jsonStringify(query.getMetadataChunk(package_id, resource_id, sheet_id, _getIndex()))

# get overview information for file, like number of rows/columns (chunks)
# also returns number of join rows/columns if metadata resource type
def getMetadataInfo():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    if sheet_id == "":
        sheet_id = None

    return jsonStringify(query.getMetadataInfo(package_id, resource_id, sheet_id))

# get the number of spectra measurements found in the file
def getSpectraCount():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')

    if sheet_id == "":
        sheet_id = None

    return jsonStringify(query.total(package_id, resource_id, sheet_id))

def getByName(package_id, resource_name):
    resource = ckanResourceQuery.getByName(package_id, resource_name)

    response.status_int = 307
    response.headers["Location"] = resource['url']
    return "Redirecting"

# helper for getting index as int
def _getIndex():
    index = request.params.get('index')
    if index is None:
        return 0
    else:
        return int(index)
