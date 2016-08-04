from ckan.common import response
from ckan.lib.base import c, model
from ckanext.ecosis.datastore import delete as deleteUtil
import ckan.logic as logic

NotFound = logic.NotFound

def delete(id):
    # first, get a list of all organizations datasets
    group = model.Group.get(id)

    if group is None:
        raise NotFound('Organization was not found.')

    datasets = []
    for pkg in group.packages(with_private=True):
        datasets.append(pkg.id)

    # now perform normal delete
    # this should check auth
    context = {'model': model, 'user': c.user}
    logic.get_action('organization_delete')(context, {'id': id})


    for package_id in datasets:
        deleteUtil.package(package_id)

    response.status_int = 307
    response.headers["Location"] = "/dashboard/organizations"

    return "Redirecting"
