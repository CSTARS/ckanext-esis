import ecosis.utils as utils
import ecosisImportDatastore.delete as deleteUtil
from ecosis.lib.auth import hasAccess

from ckan.common import request, response
from ckan.lib.base import c, model
import ckan.logic as logic

import json

def delete():
    response.headers["Content-Type"] = "application/json"

    params = {}
    try:
        params = utils.get_request_data(request)
    except:
        params = {'id': request.params.get('id')}

    if params.get('id') is None:
        raise Exception('No package_id provided')

    hasAccess(params['id'])

    context = {'model': model, 'user': c.user}
    logic.get_action('package_delete')(context, params)

    deleteUtil.package(params['id'])

    return json.dumps({'success': True})