import ecosis.datastore.workspace as workspace
import ecosis.datastore.query.workspace as workspaceQuery
from ecosis.lib.auth import hasAccess
from ecosis.datastore.push import Push

from ckan.common import request, response
from ckan.lib.base import c, model
import ckan.logic as logic

def prepare():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')

    hasAccess(package_id)

    force = request.params.get('package_id')
    if force == None:
        force = False

    return workspace.prepare(package_id, force)

def pushToSearch(self):
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

    return push.run(ckanPackage, email, c.user)

def get():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')

    hasAccess(package_id)

    return workspaceQuery.get(package_id)