from ckan.logic import check_access
from ckan.common import c
import ckan.model as model

'''
Helper methods for verifying user login state and access

Since we override a lot of endpoints as well as add our own in
EcoSIS, these are used a lot.
'''

# Does the requesting user have access to the package
def hasAccess(package_id):
    context = {'model': model, 'session': model.Session,
                       'api_version': 3, 'for_edit': True,
                       'user': c.user or c.author, 'auth_user_obj': c.userobj}
    data_dict = {
        "id" : package_id
    }

    check_access('package_update', context, data_dict)

# Does the requesting user have access to the organization
def hasOrgAccess(package_id):
    context = {'model': model, 'session': model.Session,
                       'api_version': 3, 'for_edit': True,
                       'user': c.user or c.author, 'auth_user_obj': c.userobj}
    data_dict = {
        "id" : package_id
    }

    check_access('organization_update', context, data_dict)

# is the user a site admin
def isAdmin():
    if c.userobj == None:
        return False
    if not c.userobj.sysadmin:
        return False
    return True
