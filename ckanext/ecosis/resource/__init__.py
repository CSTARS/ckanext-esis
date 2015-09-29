from ckan.common import request, response
import ecosis.utils as utils
from ckan.lib.base import c, model
import ckan.logic as logic
import ckan.lib.uploader as uploader
import os, json

import ecosisImportDatastore.delete as deleteUtil

def delete():
    response.headers["Content-Type"] = "application/json"

    params = utils._get_request_data(request)

    # remove resource from disk - normally this doesn't happen
    _delete(params)

    return json.dumps({'success': True})

def deleteMany(self, params):
    response.headers["Content-Type"] = "application/json"

    params = utils._get_request_data(request)
    context = {'model': model, 'user': c.user}

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