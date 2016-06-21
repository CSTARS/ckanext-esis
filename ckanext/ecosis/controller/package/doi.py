from ckan.lib.base import c, model
import ckan.logic as logic
from ckan.lib.email_notifications import send_notification
from pylons import config
from ckan.common import request, response
import json, datetime, psycopg2, urllib2, base64
from dateutil import parser
from ckanext.ecosis.datastore.push import Push

from ckanext.ecosis.datastore.ckan import package

DOI_STATUS = {
    'APPLIED' : 'Applied',
    'REQUESTING' : 'Requesting',
    'ACCEPTED' : 'Accepted',
    'PENDING_REVISION' : 'Pending Revision',
    'PENDING_APPROVAL' : 'Pending Approval'
}
DOI_CONFIG = {
    "url" : config.get("ecosis.doi.url"),
    "username" : config.get("ecosis.doi.username"),
    "password" : config.get("ecosis.doi.password")
}
connStr = ""

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
            if not canUpdate(oldDoi):
                return {
                    'error': True,
                    'message' : 'You cannot update a package once the DOI as been applied'
                }
            else:
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

    if newDoi.get('status').get('value') == DOI_STATUS['PENDING_REVISION'] and oldDoi.get('status').get('value') != DOI_STATUS['PENDING_REVISION']:
        sendUserNotification(newPackage, False)
    elif newDoi.get('status').get('value') == DOI_STATUS['ACCEPTED'] and oldDoi.get('status').get('value') != DOI_STATUS['ACCEPTED']:
        sendUserNotification(newPackage, True)


    return {'success': True}

def applyDoi(pkg):
    doiStatus = getDoiStatus(pkg)

    if doiStatus.get('status').get('value') != DOI_STATUS["ACCEPTED"]:
        return

    setPackageExtra('EcoSIS DOI Status', json.dumps({'value':DOI_STATUS["REQUESTING"]}), pkg)

    context = {'model': model, 'user': c.user}
    logic.get_action('package_update')(context, pkg)

    doiResponse = requestDoi(pkg)

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

    status = {
        'value' : DOI_STATUS["APPLIED"],
        'ark' : doiResponse.get('ark'),
        'applied' : datetime.datetime.utcnow().isoformat()
    }
    setPackageExtra('EcoSIS DOI Status', json.dumps(status), pkg)
    setPackageExtra('EcoSIS DOI', doiResponse.get('doi'),  pkg)

    # now that it's applied, push to search
    push = Push()
    push.run(pkg)

    logic.get_action('package_update')(context, pkg)

    return {'success': True}

def requestDoi(pkg):
    data = "_target: %s/#result/%s\n" % (config.get("ecosis.search_url"), pkg.get('id'))
    data += "datacite.creator: %s\n" % pkg.get('author')
    data += "datacite.title: %s\n" % pkg.get('title')
    data += "datacite.publisher: EcoSIS\n"
    data += "datacite.publicationyear: %s" % parser.parse(pkg.get('metadata_created')).year


    r = urllib2.Request(DOI_CONFIG.get('url'))
    base64string = base64.encodestring('%s:%s' % (DOI_CONFIG.get('username'), DOI_CONFIG.get('password'))).replace('\n', '')
    r.add_header("Authorization", "Basic %s" % base64string)
    r.add_header("Content-Type", "text/plain;charset=UTF-8")
    r.add_data(data)

    try:
        result = urllib2.urlopen(r).read()
    except Exception as e:
        result = "error: request error"

    (status, value) = result.split(': ')
    doi = ""
    ark = ""
    if status == 'success':
        (doi, ark) = value.split(' | ')

    return {
        "status" : status,
        "doi" : doi,
        "ark" : ark
    }


# helper for deleting package or updating resources
def hasAppliedDoi(pkgId):
    context = {'model': model, 'user': c.user}
    pkg = logic.get_action('package_update')(context, {'id': pkgId})
    return not canUpdate(getDoiStatus(pkg))

def doiUpdateStatus():
    response.headers["Content-Type"] = "application/json"

    if not isAdmin():
        return {
            'error' : True,
            'message' : 'Nope.'
        }

    return json.dumps({})

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

def sendUserNotification(pkg, approved):
    url = config.get('ckan.site_url')

    status = getDoiStatus(pkg)

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
                        "display_name" : "EcoSIS DOI Service"
                    },
                    {
                        "subject" : "EcoSIS Dataset DOI Request - %s" % pkg.get('title'),
                        "body" : body
                    }
                )
            except:
                print "Failed to send admin email"



def canUpdate(doi):
    # TODO: later check for props we can update?
    if doi.get('status').get('value') == None or \
       doi.get('status').get('value') == DOI_STATUS['PENDING_REVISION']:
        return True
    return False

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

def getPackageExtra(attr, pkg):
    extra = pkg.get('extras')
    if extra == None:
        return None

    for item in extra:
        if item.get('key') == attr:
            return item.get('value')
    return None

def setPackageExtra(attr, value, pkg):
    extra = pkg.get('extras')
    if extra == None:
        pkg['extras'] = []
        extra = pkg['extras']

    for item in extra:
        if item.get('key') == attr:
            item['value'] = value;
            return

    extra.append({
        'key' : attr,
        'value' : value
    })

def isAdmin():
    if c.userobj == None:
        return False
    if not c.userobj.sysadmin:
        return False
    return True