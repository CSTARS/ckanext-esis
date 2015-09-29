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

parseOptions = ["ignore", "layout", "metadata", "joinOn"]

def delete():
    response.headers["Content-Type"] = "application/json"

    params = utils._get_request_data(request)

    # remove resource from disk - normally this doesn't happen
    _delete(params)

    return json.dumps({'success': True})

def deleteMany(self, params):
    response.headers["Content-Type"] = "application/json"

    params = utils._get_request_data(request)

    for id in params.get('ids'):
        _delete({'id': id})

    return json.dumps({'success': True})

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

    try:
        options = json.loads(request.params.get('options'))
    except:
        options = {}

    # option, if a resource id and a datasheet id are passed, then the full 'merged' view will be return

    safeOptions = {}
    for option in parseOptions:
        if option in options:
            safeOptions[option] = safeOptions[option]

    workspace.prepareFile(package_id, resource_id, sheet_id, safeOptions)

    return query.getResource(resource_id, sheet_id)

def get():
    response.headers["Content-Type"] = "application/json"

    pid = request.params.get('package_id')
    rid = request.params.get('resource_id')
    sid = request.params.get('sheet_id')

    hasAccess(pid)

    return query.getResource(rid, sid)


def getLayoutOverview():
    response.headers["Content-Type"] = "application/json"

    rid = request.params.get('resource_id')
    sid = request.params.get('datasheet_id')

    # initialize the workspace and get the package config as well as the ckan package
    #(workspacePackage, ckanPackage, rootDir, fresh) = setup.init(request.params.get('package_id'))

    # make sure all files on disk are up to date in the package
    #resources = setup.resources(workspacePackage, ckanPackage, rootDir)

    #r = getById(resources, rid)
    #if r == None:
    #    return json.dumps({'error':True, 'message':'resource does not exist'})

    #s = getById(r['datasheets'], sid)
    #if s == None:
    #    return json.dumps({'error':True, 'message':'datasheet does not exist'})

    #file = "%s%s%s" % (self.workspaceDir, s['location'], s['name'])
    #s['data'] = getFile(self.workspaceDir, file, s)

    # limit to 250 x 250
    #if len(s['data']) > 250:
    #    s['data'] = s['data'][0:250]
    #for row in s['data']:
    #    if len(row) > 250:
    #        row = row[0:250]

    #removeAttr = ['location', 'attributes']
    #for attr in removeAttr:
    #    if attr in s:
    #        del s[attr]

    #return json.dumps(s)
