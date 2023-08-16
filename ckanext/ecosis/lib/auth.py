from ckan.logic import check_access
from ckanext.ecosis.lib.context import get_auth_context
from ckan.authz import is_sysadmin
from ckan.common import current_user

'''
Helper methods for verifying user login state and access

Since we override a lot of endpoints as well as add our own in
EcoSIS, these are used a lot.
'''

# Does the requesting user have access to the package
def hasAccess(package_id):
    context = get_auth_context()
    data_dict = {
        "id" : package_id
    }

    check_access('package_update', context, data_dict)

# Does the requesting user have access to the organization
def hasOrgAccess(package_id):
    context = get_auth_context()
    data_dict = {
        "id" : package_id
    }

    check_access('organization_update', context, data_dict)

# is the user a site admin
def isAdmin():
    if current_user == None:
        return False
    if not is_sysadmin(current_user.name):
        return False
    return True
