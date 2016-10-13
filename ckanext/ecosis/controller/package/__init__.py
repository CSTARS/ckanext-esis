import json

import ckanext.ecosis.lib.utils as utils
from ckanext.ecosis.datastore import delete as deleteUtil
from ckanext.ecosis.lib.auth import hasAccess
from ckanext.ecosis.datastore import workspace
from ckanext.ecosis.datastore.ckan import package
from ckan.common import request, response
from ckan.lib.base import c, model
import ckan.logic as logic
from ckanext.ecosis.lib.utils import jsonStringify
from ckanext.ecosis.lib.utils import setPackageExtra
from ckan.lib.email_notifications import send_notification
from pylons import config
from doi import handleDoiUpdate, hasAppliedDoi, getDoiStatus, DOI_STATUS, applyDoi
from doi import init as initDoi

collections = None
ignoreTemplateVars = ["metadata_modified", "state", "creator_user_id", "revision_id", "type", "url","organization"]

'''
Most of these functions will be called from the main __init__.py controller file.
'''

# inject global dependencies
def init(co, pgConn):
    global collections

    initDoi(pgConn)
    collections = co

# remove a package
# This will remove from CKAN as well as EcoSIS extension
def delete():
    response.headers["Content-Type"] = "application/json"

    # grab package id from request
    params = {}
    try:
        params = utils.get_request_data(request)
    except:
        params = {'id': request.params.get('id')}

    if params.get('id') is None:
        raise Exception('No package_id provided')

    # make sure user has access to package
    hasAccess(params['id'])

    # make sure no DOI is applied
    if hasAppliedDoi(params['id']):
        return json.dumps({'error': True, 'message':'Cannot delete package with applied DOI'})

    # remove from CKAN
    context = {'model': model, 'user': c.user}
    logic.get_action('package_delete')(context, params)

    # remove from EcoSIS
    deleteUtil.package(params['id'])

    return json.dumps({'success': True})

# update a package
# makes sure update is valid does checking against DOI status
def update():
    response.headers["Content-Type"] = "application/json"

    params = json.loads(request.body)

    hasAccess(params['id'])
    context = {'model': model, 'user': c.user}

    cpkg = logic.get_action('package_show')(context, {'id': params['id']})

    # check EcoSIS DOI status
    resp = handleDoiUpdate(cpkg, params)
    if resp.get('error') == True:
        resp['doiApplied'] = True
        return json.dumps(resp)

    pkg = logic.get_action('package_update')(context, params)

    doiStatus = getDoiStatus(pkg);
    if doiStatus.get('status').get('value') == DOI_STATUS["ACCEPTED"]:
        applyDoi(pkg)

    if resp.get('email') is not None:
        pkg['doi_user_email'] = resp.get('email')
        pkg['doi_user_name'] = resp.get('user')


    return json.dumps(pkg)

# create a package. notify admins
def create():
    response.headers["Content-Type"] = "application/json"

    params = json.loads(request.body)

    # normal CKAN create logic
    context = {'model': model, 'user': c.user}
    package_create = logic.get_action('package_create')
    ckanPackage = package_create(context, params)

    # send email to the admin email group
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

# Once a DOI is applied, the update package function is disabled
# this is a simple workaround service, for just upda
# TODO: remove this, not required anymore, app should use normal package update
def updateLinkedResources():
    response.headers["Content-Type"] = "application/json"
    context = {'model': model, 'user': c.user}

    params = json.loads(request.body)
    package_id = params.get('id')
    hasAccess(package_id)

    linkedResources = params.get('linkedResources')
    cpkg = logic.get_action('package_show')(context, {'id': package_id})

    setPackageExtra('LinkedData', json.dumps(linkedResources), cpkg)
    pkg = logic.get_action('package_update')(context, cpkg)

    return json.dumps({'success': True})

# set a package to private
def setPrivate():
    response.headers["Content-Type"] = "application/json"
    package_id = request.params.get('id')
    hasAccess(package_id)

    # can't set a package to private that has a DOI
    if hasAppliedDoi(package_id):
        return json.dumps({'error':True, 'message': 'Cannot modify package with applied DOI'})

    # Once a package is private, it should not be in EcoSIS search
    deleteUtil.cleanFromSearch(package_id)

    return json.dumps({'success': True})

# create the reusable template for a package
def getTemplate():
    response.headers["Content-Type"] = "application/json"
    package_id = request.params.get('id')
    format = request.params.get('format')

    # are we only creating a properties alias template?
    mapOnly = request.params.get('mapOnly')

    # check access
    hasAccess(package_id)

    pkg = package.get(package_id)

    # clean out variables that should NOT be reused between templates
    for var in ignoreTemplateVars:
        if var in pkg:
            del pkg[var]

    # move the aliases to first order citizen
    extras = pkg.get("extras")
    if extras != None and extras.get("aliases") != None:
        pkg["aliases"] = json.loads(extras["aliases"])
        del extras["aliases"]

    # resourceUpdateCount is only for keeping track of when resource files are
    # modified, does not need to be passed along.
    if extras != None:
        if extras.get("resourceUpdateCount") is not None:
            del extras["resourceUpdateCount"]

    # backward compatability with the old 'map' attribute.  Used to be used instead of 'aliases'
    if pkg.get("aliases") == None:
        wpkg = collections.get('package').find_one({"packageId": package_id},{"map": 1})
        if "map" in wpkg:
            pkg['aliases'] = wpkg['map']
        else:
            pkg['aliases'] = {}

    # are we downloading or are we sending as rest api call?
    if format != "json":
        response.headers["Content-Disposition"] = "attachment; filename=\"%s.json\"" % pkg.get('name')

    # we are only interested in the aliases template
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

# TODO: remove.  this used to set sort and alias, these fields are now stored the
# the CKAN 'extra'.
def setOptions():
    response.headers["Content-Type"] = "application/json"
    package_id = request.params.get('package_id')
    hasAccess(package_id)

    options = json.loads(request.params.get('options'))

    workspace.setOptions(package_id, options)

    return json.dumps({'success': True})

# if someone is trying to access the main CKAN package create screen, redirect to
# EcoSIS spectra importer app.
def createPackageRedirect():
    group = request.params.get('group')
    response.status_int = 307

    if group == None:
        response.headers["Location"] = "/import/"
    else:
        response.headers["Location"] = "/import/?group=%s" % group.encode('ascii','ignore')

    return "Redirecting"

# if someone is trying to access the main CKAN package edit screen, redirect to
# EcoSIS spectra importer app.
def editPackageRedirect(id):
    response.status_int = 307
    response.headers["Location"] = "/import/?id=%s" % id.encode('ascii','ignore')
    return "Redirecting"