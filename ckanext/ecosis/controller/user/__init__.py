from ckan.common import response
from ckan.lib.base import c, model
import ckan.logic as logic
import json

def info():
    response.headers["Content-Type"] = "application/json"
    if len(c.user) == 0:
        return json.dumps({"loggedIn": False})

    context = {'model': model, 'user': c.user}
    # see line 604 or ckan/logic/action/get about params for this method
    orgs = logic.get_action('organization_list_for_user')(context,{"permission": "create_dataset"})

    return json.dumps({
        "loggedIn": True,
        "username": c.user,
        "organizations" : orgs
    })
