import ckanext.ecosis.datastore.workspace as workspace
import ckanext.ecosis.datastore.query.workspace as workspaceQuery
from ckanext.ecosis.datastore.push import Push
from ckanext.ecosis.lib.utils import jsonStringify

from ckan.common import request
from ckan.lib.base import c, model
import ckan.logic as logic

def prepare():
    package_id = request.params.get('package_id')

    # get package by name or id
    context = {'model': model, 'user': c.user}
    ckanPackage = logic.get_action('package_show')(context, {'id': package_id})

    if ckanPackage == None:
        raise Exception('Invalid package ID')

    force = request.params.get('force')
    clean = request.params.get('clean')
    if force == "true":
        force = False
    else:
        force = False

    # remove old unused packages
    workspace.clean(current_package_id=package_id)

    if clean == "true":
        workspace.cleanPackage(ckanPackage.get("id"))

    result = workspace.prepare(ckanPackage.get("id"), force)

    if clean == "true":
        result['cleaned'] = True

    return jsonStringify(result)

def pushToSearch():
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

    return push.run(ckanPackage, email, c.userobj.email, c.userobj.display_name)

def get():
    package_id = request.params.get('package_id')

    # get package by name or id
    context = {'model': model, 'user': c.user}
    ckanPackage = logic.get_action('package_show')(context, {'id': package_id})

    return jsonStringify(workspaceQuery.get(ckanPackage.get("id")))

def clean():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    workspace.cleanPackage(package_id)

    return jsonStringify({
        "cleaned": True,
        "packageId" : package_id
    })