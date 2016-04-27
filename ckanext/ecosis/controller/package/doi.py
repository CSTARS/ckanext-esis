from ckan.lib.base import c, model
import ckan.logic as logic
from ckan.lib.email_notifications import send_notification
from pylons import config
from ckan.common import request, response
import json

from ckanext.ecosis.datastore.ckan import package

DOI_STATUS = {
    'APPLIED' : 'Applied',
    'ACCEPTED' : 'Accepted',
    'PENDING_REVISION' : 'Pending Revision',
    'PENDING_APPROVAL' : 'Pending Approval'
}

## helper for updating package
def handleDoiUpdate(currentPackage, newPackage):
    oldDoi = getDoiStatus(currentPackage)
    newDoi = getDoiStatus(newPackage)

    # No changes
    if oldDoi.get('status') == newDoi.get('status'):
        if oldDoi.get('value') == newDoi.get('value'):
            # check this package doesn't have a DOI
            if not canUpdate(oldDoi):
                return {
                    'error': True,
                    'message' : 'You cannot update a package once the DOI as been applied'
                }
            else:
                return {'success': True}

    # the one thing a USER can do is request approval
    if oldDoi.get('status') in (None, DOI_STATUS['PENDING_REVISION']):
        if newDoi.get('status') == DOI_STATUS['PENDING_APPROVAL'] and newDoi.get('value') is None:
            sendNotification(newPackage)

            return {'success': True}

    if not isAdmin():
        return {
            'error' : True,
            'message' : 'You do not have access to update DOI values'
        }

    return {'success': True}

# helper for deleting package or updating resources
def hasAppliedDoi(pkgId):
    context = {'model': model, 'user': c.user}
    pkg = logic.get_action('package_update')(context, {'id': pkgId})
    return canUpdate(getDoiStatus(pkg))

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

    return json.dumps(package.doiQuery(query=query, status=status, offset=offset, limit=limit))


def sendNotification(pkg):
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
                                    "You can view the dataset here:  %s/#result/%s and approve the DOI here: %s/doi/%s"
                                    "\n\n-EcoSIS Server") %
                                 (pkg.get('title'), config.get('ckan.site_url'), c.user, config.get('ecosis.search_url'), pkg.get("id"), config.get('ckan.site_url'), pkg.get("id"))
                    }
                )
            except:
                print "Failed to send admin email"


def canUpdate(doi):
    # TODO: later check for props we can update?

    if doi.get('status') == DOI_STATUS['APPLIED'] or doi.get('status') == DOI_STATUS['ACCEPTED']:
        return False
    return True

def getDoiStatus(pkg):
    doi = {
        'status' : getPackageExtra('EcoSIS DOI Status', pkg),
        'value' : getPackageExtra('EcoSIS DOI', pkg)
    }

    return doi

def getPackageExtra(attr, pkg):
    extra = pkg.get('extras')
    if extra == None:
        return None

    for item in extra:
        if item.get('key') == attr:
            return item.get('value')
    return None

def isAdmin():
    if c.userobj == None:
        return False
    if not c.userobj.sysadmin:
        return False
    return True