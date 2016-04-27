import json

import ckanext.ecosis.lib.utils as utils
import ckanext.ecosis.datastore.delete as deleteUtil
from ckanext.ecosis.lib.auth import hasAccess
import ckanext.ecosis.datastore.workspace as workspace
import ckanext.ecosis.datastore.ckan.package as package
from ckan.common import request, response
from ckan.lib.base import c, model
import ckan.logic as logic
from ckanext.ecosis.lib.utils import jsonStringify
from ckan.lib.email_notifications import send_notification
from pylons import config
from doi import handleDoiUpdate, hasAppliedDoi

collections = None
ignoreTemplateVars = ["metadata_modified", "state", "creator_user_id", "revision_id", "type", "url","organization"]

def init(co):
    global collections

    collections = co

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

    if hasAppliedDoi(params['id']):
        return json.dumps({'error': True, 'message':'Cannot delete package with applied DOI'})

    context = {'model': model, 'user': c.user}
    logic.get_action('package_delete')(context, params)

    deleteUtil.package(params['id'])

    return json.dumps({'success': True})

def update():
    response.headers["Content-Type"] = "application/json"

    params = json.loads(request.body)

    hasAccess(params['id'])
    context = {'model': model, 'user': c.user}

    cpkg = logic.get_action('package_update')(context, {'id': params['id']})

    # check EcoSIS DOI status
    resp = handleDoiUpdate(cpkg, params)
    if resp.get('error') == True:
        return json.dumps(response)

    pkg = logic.get_action('package_update')(context, params)

    return json.dumps(pkg)

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
            try:
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
            except:
                print "Failed to send admin email"

    return json.dumps(ckanPackage)


def setPrivate():
    response.headers["Content-Type"] = "application/json"
    package_id = request.params.get('id')
    hasAccess(package_id)

    if hasAppliedDoi(package_id):
        return json.dumps({'error':True, 'message': 'Cannot modify package with applied DOI'})

    deleteUtil.cleanFromSearch(package_id)

    return json.dumps({'success': True})

def getTemplate():
    response.headers["Content-Type"] = "application/json"
    package_id = request.params.get('id')
    format = request.params.get('format')
    mapOnly = request.params.get('mapOnly')

    hasAccess(package_id)

    pkg = package.get(package_id)

    # clean out
    for var in ignoreTemplateVars:
        if var in pkg:
            del pkg[var]

    extras = pkg.get("extras")
    if extras != None and extras.get("aliases") != None:
        pkg["aliases"] = json.loads(extras["aliases"])
        del extras["aliases"]

    if pkg.get("aliases") == None:
        wpkg = collections.get('package').find_one({"packageId": package_id},{"map": 1})
        if "map" in wpkg:
            pkg['aliases'] = wpkg['map']
        else:
            pkg['aliases'] = {}

    if format != "json":
        response.headers["Content-Disposition"] = "attachment; filename=\"%s.json\"" % pkg.get('name')

    if mapOnly:
        schema = package.getSchema()
        for key, s in schema.iteritems():
            for item in s:
                if pkg['aliases'].get(item.get('name')) == None:
                    pkg['aliases'][item.get('name')] = ''

        pkg = {
            'aliases' : pkg['aliases']
        }

    return jsonStringify(pkg, formatted=True)


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