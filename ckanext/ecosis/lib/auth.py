from ckan.logic import check_access
from ckan.common import c
import ckan.model as model

def hasAccess(package_id):
    context = {'model': model, 'session': model.Session,
                       'api_version': 3, 'for_edit': True,
                       'user': c.user or c.author, 'auth_user_obj': c.userobj}
    data_dict = {
        "id" : package_id
    }

    check_access('package_update', context, data_dict)

def hasOrgAccess(package_id):
    context = {'model': model, 'session': model.Session,
                       'api_version': 3, 'for_edit': True,
                       'user': c.user or c.author, 'auth_user_obj': c.userobj}
    data_dict = {
        "id" : package_id
    }

    check_access('organization_update', context, data_dict)

