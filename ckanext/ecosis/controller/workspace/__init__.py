import ecosis.datastore.workspace as workspace
import ecosis.datastore.query.workspace as workspaceQuery
from ecosis.lib.auth import hasAccess
from ecosis.datastore.push import Push
from ecosis.lib.utils import jsonStringify

from ckan.common import request, response
from ckan.lib.base import c, model
import ckan.logic as logic

def prepare():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')

    # get package by name or id
    context = {'model': model, 'user': c.user}
    ckanPackage = logic.get_action('package_show')(context, {'id': package_id})

    if ckanPackage == None:
        raise Exception('Invalid package ID')

    force = request.params.get('force')
    clean = request.params.get('clean')
    if force == None:
        force = False

    if clean == "true":
        workspace.cleanPackage(ckanPackage.get("id"))

    return jsonStringify(workspace.prepare(ckanPackage.get("id"), force))

def pushToSearch():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    email = request.params.get('email')
    if email is None:
        email = "false"

    context = {'model': model, 'user': c.user}
    ckanPackage = logic.get_action('package_show')(context, {"id": package_id})

    if email == True or email.lower() == "true":
        email = True
    else:
        email = False

    push = Push()

    return jsonStringify(push.run(ckanPackage, email, c.userobj.email, c.userobj.display_name))

def get():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')

    # get package by name or id
    context = {'model': model, 'user': c.user}
    ckanPackage = logic.get_action('package_show')(context, {'id': package_id})

    return jsonStringify(workspaceQuery.get(ckanPackage.get("id")))