import json

import ckanext.ecosis.lib.utils as utils
import ckanext.ecosis.datastore.delete as deleteUtil
from ckanext.ecosis.lib.auth import hasAccess
import ckanext.ecosis.datastore.workspace as workspace
from ckan.common import request, response
from ckan.lib.base import c, model
import ckan.logic as logic
from ckan.lib.email_notifications import send_notification
from pylons import config


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

def create():
    response.headers["Content-Type"] = "application/json"

    params = json.loads(request.body)

    context = {'model': model, 'user': c.user}
    package_create = logic.get_action('package_create')
    ckanPackage = package_create(context, params)


    url = config.get('ckan.site_url')
    admin_email = config.get('ecosis.admin_email')

    if url != "" and url is not None:
        if admin_email != "" and admin_email is not None:
            send_notification(
                {
                    "email" : admin_email,
                    "display_name" : "EcoSIS Admins"
                },
                {
                    "subject" : "EcoSIS Dataset Created - %s" % ckanPackage.get('title'),
                    "body" : ("The dataset '%s' has been created by %s/user/%s.  "
                                "You can view the dataset here:  %s/dataset/%s"
                                "\n\n-EcoSIS Server") %
                             (ckanPackage.get('title'), config.get('ckan.site_url'), c.user, config.get('ckan.site_url'), ckanPackage.get("name"))
                }
            )

    return json.dumps(ckanPackage)


def setPrivate():
    response.headers["Content-Type"] = "application/json"
    package_id = request.params.get('id')
    hasAccess(package_id)

    deleteUtil.cleanFromSearch(package_id)

    return json.dumps({'success': True})

def setOptions():
    response.headers["Content-Type"] = "application/json"
    package_id = request.params.get('package_id')
    hasAccess(package_id)

    options = json.loads(request.params.get('options'))

    workspace.setOptions(package_id, options)

    return json.dumps({'success': True})

def createPackageRedirect():
    group = request.params.get('group')
    response.status_int = 307

    if group == None:
        response.headers["Location"] = "/import/"
    else:
        response.headers["Location"] = "/import/?group=%s" % group.encode('ascii','ignore')

    return "Redirecting"

def editPackageRedirect(id):
    response.status_int = 307
    response.headers["Location"] = "/import/?id=%s" % id.encode('ascii','ignore')
    return "Redirecting"