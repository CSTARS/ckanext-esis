from ckan.lib.base import c, model
import ckan.logic as logic
from ckan.lib.email_notifications import send_notification
from pylons import config
from ckan.common import request, response
import json, datetime, psycopg2, urllib2, base64
from dateutil import parser
from ckanext.ecosis.datastore.push import Push
from ckanext.ecosis.lib.utils import setPackageExtra, getPackageExtra
from ckanext.ecosis.lib.auth import isAdmin
from ckanext.ecosis.datastore.ckan import package

DOI_STATUS = {
    'APPLIED' : 'Applied',                   # DOI has been applied by EZID
    'REQUESTING' : 'Requesting',             # Requesting DOI from EZID
    'ACCEPTED' : 'Accepted',                 # Admins have accepted DOI request
    'PENDING_REVISION' : 'Pending Revision', # Admins not approved the DOI request, dataset needs revision
    'PENDING_APPROVAL' : 'Pending Approval'  # User has requested DOI
}

# EZID config
DOI_CONFIG = {
    "url" : config.get("ecosis.doi.url"),
    "username" : config.get("ecosis.doi.username"),
    "password" : config.get("ecosis.doi.password")
}
connStr = ""

# inject global dependencies
def init(pgConn):
    global connStr
    connStr = pgConn

## helper for updating package
def handleDoiUpdate(currentPackage, newPackage):
    oldDoi = getDoiStatus(currentPackage)
    newDoi = getDoiStatus(newPackage)

    # No changes
    if oldDoi.get('status').get('value') == newDoi.get('status').get('value') and oldDoi.get('status').get('error') != True:
        if oldDoi.get('value') == newDoi.get('value'):
            # check this package doesn't have a DOI
            # Perhaps just not let them make it private?
            # if not canUpdate(oldDoi):
            #     return {
            #         'error': True,
            #         'message' : 'You cannot update a package once the DOI as been applied'
            #     }
            # else:
            return {'success': True}

    # the one thing a USER can do is request approval
    if oldDoi.get('status').get('value') in (None, DOI_STATUS['PENDING_REVISION']):
        if newDoi.get('status').get('value') == DOI_STATUS['PENDING_APPROVAL'] and newDoi.get('value') is None:
            # set the requesting user
            status = {
                'value' : DOI_STATUS['PENDING_APPROVAL'],
                'requested_by' : c.user
            }
            setPackageExtra('EcoSIS DOI Status', json.dumps(status), newPackage)

            # alert the admins of the request
            sendAdminNotification(newPackage)

            return {'success': True}

        # user is canceling request
        if newDoi.get('status').get('value') is None:
            setPackageExtra('EcoSIS DOI Status', '{}', newPackage)

            return {'success': True}


    if not isAdmin():
        return {
            'error' : True,
            'message' : 'You do not have access to update DOI values'
        }

    resp = {}
    if newDoi.get('status').get('value') == DOI_STATUS['PENDING_REVISION'] and oldDoi.get('status').get('value') != DOI_STATUS['PENDING_REVISION']:
        resp = sendUserNotification(newPackage, False)
    elif newDoi.get('status').get('value') == DOI_STATUS['ACCEPTED'] and oldDoi.get('status').get('value') != DOI_STATUS['ACCEPTED']:
        resp = sendUserNotification(newPackage, True)

    resp['success'] = True
    return resp

# Actually request DOI from EZID
def applyDoi(pkg):
    # get the current package DOI status
    doiStatus = getDoiStatus(pkg)

    # make sure it's set to accepted
    if doiStatus.get('status').get('value') != DOI_STATUS["ACCEPTED"]:
        return

    # set the new status to REQUESTING DOI
    setPackageExtra('EcoSIS DOI Status', json.dumps({'value':DOI_STATUS["REQUESTING"]}), pkg)

    # update the dataset
    context = {'model': model, 'user': c.user}
    logic.get_action('package_update')(context, pkg)

    # Request DOI from EZID
    doiResponse = requestDoi(pkg)

    # If request failed, reset DOI status, return new error
    if doiResponse.get('status') != 'success':
        status = {
            'value': DOI_STATUS["ACCEPTED"],
            'error' : True,
            'message': 'Failed to request DOI from service',
            'serverResponseStatus' : doiResponse.get('status')
        }
        setPackageExtra('EcoSIS DOI Status', json.dumps(status), pkg)
        logic.get_action('package_update')(context, pkg)
        return status

    # set the returned DOI and new DOI Status
    status = {
        'value' : DOI_STATUS["APPLIED"],
        'applied' : datetime.datetime.utcnow().isoformat()
    }
    setPackageExtra('EcoSIS DOI Status', json.dumps(status), pkg)
    setPackageExtra('EcoSIS DOI', doiResponse.get('doi'),  pkg)

    # now that it's applied, re-push to search so updates are visible
    push = Push()
    push.run(pkg)

    # final dataset update with new DOI status
    logic.get_action('package_update')(context, pkg)

    return {'success': True}

# HTTP request for EZID
def requestDoi(pkg):
    # Request body
    data = "_profile: datacite\n"
    data += "_target: %s/#result/%s\n" % (config.get("ecosis.search_url"), pkg.get('id'))
    data += "datacite.creator: %s\n" % pkg.get('author')
    data += "datacite.title: %s\n" % pkg.get('title')
    data += "datacite.resourcetype: Dataset\n"
    data += "datacite.publisher: EcoSIS\n"
    data += "datacite.publicationyear: %s" % parser.parse(pkg.get('metadata_created')).year

    # set body, authentication header and make request
    r = urllib2.Request(DOI_CONFIG.get('url'))
    base64string = base64.encodestring('%s:%s' % (DOI_CONFIG.get('username'), DOI_CONFIG.get('password'))).replace('\n', '')
    r.add_header("Authorization", "Basic %s" % base64string)
    r.add_header("Content-Type", "text/plain;charset=UTF-8")
    r.add_data(data)

    try:
        result = urllib2.urlopen(r).read()
    except Exception as e:
        result = "error: request error"

    # parse text response format
    (status, doi) = result.split('\n')[0].split(': ')

    return {
        "status" : status,
        "doi" : doi
    }


# helper for deleting package or updating resources
def hasAppliedDoi(pkgId):
    context = {'model': model, 'user': c.user}
    pkg = logic.get_action('package_show')(context, {'id': pkgId})
    resp = not canUpdate(getDoiStatus(pkg))
    return resp

# def doiUpdateStatus():
#     response.headers["Content-Type"] = "application/json"
#
#     if not isAdmin():
#         return {
#             'error' : True,
#             'message' : 'Nope.'
#         }
#
#     return json.dumps({})

# for admin DOI interface, query datasets by DOI status
def doiQuery():
    response.headers["Content-Type"] = "application/json"

    if not isAdmin():
        return {
            'error' : True,
            'message' : 'Nope.'
        }

    query = request.params.get('query')
    status = request.params.get('status')
    offset = request.params.get('offset')
    limit = request.params.get('limit')

    resp = package.doiQuery(query=query, status=status, offset=offset, limit=limit)
    return json.dumps(resp)

# for admin, allows admin to completely clear a DOI.  Should only be used in
# dev interface, never in production.
def clearDoi():
    response.headers["Content-Type"] = "application/json"

    if not isAdmin():
        return {
            'error' : True,
            'message' : 'Nope.'
        }

    id = request.params.get('id')

    context = {'model': model, 'user': c.user}
    pkg = logic.get_action('package_show')(context, {'id': id})

    # check EcoSIS DOI status
    setPackageExtra('EcoSIS DOI Status', '{}', pkg)
    setPackageExtra('EcoSIS DOI', '', pkg)

    pkg = logic.get_action('package_update')(context, pkg)

    return json.dumps({'success': True})

# Send admin notification of DOI request
def sendAdminNotification(pkg):
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
                        "subject" : "EcoSIS Dataset DOI Request - %s" % pkg.get('title'),
                        "body" : ("A DOI has been requested for the dataset '%s' by user %s/user/%s.  "
                                    "You can view the dataset here:  %s/#result/%s and approve the DOI here: %s/doi-admin/#%s"
                                    "\n\n-EcoSIS Server") %
                                 (pkg.get('title'), config.get('ckan.site_url'), c.user, config.get('ecosis.search_url'), pkg.get("id"), config.get('ckan.site_url'), urllib2.quote(pkg.get("title")))
                    }
                )
            except:
                print "Failed to send admin email"

# send user notification of approval/denial of DOI request
def sendUserNotification(pkg, approved):
    url = config.get('ckan.site_url')

    status = getDoiStatus(pkg).get('status')
    if status is None:
        status = {}

    conn = psycopg2.connect(connStr)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        "select email from public.user where name = %s", (status.get('requested_by'),)
    )
    users = cur.fetchall()
    cur.close()

    email = ""
    for user in users:
        email = user.get('email')
        break

    body = ""
    if approved:
        body = ("The DOI request for the dataset '%s' has been approved.  "
                "It may take a couple minutes for the DOI to generate.  "
                "You can view the dataset here:  %s/#result/%s\n\n"
                "\n\n-EcoSIS Team") % (pkg.get('title'),
                                       config.get('ecosis.search_url'),
                                       pkg.get("id"))
    else:
        body = ("The DOI request for the dataset '%s' requires more information before approval.  "
                "Please provide a full description, keywords and fill out as much metadata as possible.  "
                "Then feel free to re-request a DOI."
                "\n\n-EcoSIS Team") % (pkg.get('title'))

    if url != "" and url is not None:
        if email != "" and email is not None:
            try:
                send_notification(
                    {
                        "email" : email,
                        "display_name" : "EcoSIS User %s," % status.get('requested_by')
                    },
                    {
                        "subject" : "EcoSIS Dataset DOI Request - %s" % pkg.get('title'),
                        "body" : body
                    }
                )
            except:
                print "Failed to send admin email"

    return {
        "email" : email,
        "user" : status.get('requested_by')
    }

# make sure user has permission to update DOI status.  There are only two status users are
# allowed to update.  1) Doi has never been requested 2) DOI has been requested and
# the admins have said revisions are needed
def canUpdate(doi):
    # TODO: later check for props we can update?
    if doi.get('status').get('value') == None or \
       doi.get('status').get('value') == DOI_STATUS['PENDING_REVISION']:
        return True

    return False

# wrapper for getting package-extra doi status from status fields (stored as JSON)
def getDoiStatus(pkg):
    doi = {
        'status' : getPackageExtra('EcoSIS DOI Status', pkg),
        'value' : getPackageExtra('EcoSIS DOI', pkg)
    }

    if doi['status'] is None or doi['status'] == "":
        doi['status'] = {}
    else:
        doi['status'] = json.loads(doi['status'])

    return doi