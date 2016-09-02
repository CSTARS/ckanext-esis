from ckan.lib.base import c, model
from ckanext.ecosis.datastore import delete as deleteUtil
import ckan.logic as logic
from ckan.common import response


NotFound = logic.NotFound
collections = None

# inject global dependencies
def init(co):
    global collections
    collections = co

# delete organization
# when org is deleted, we need to remove all of organizations datasets
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

    # EcoSIS package delete happens here
    for package_id in datasets:
        deleteUtil.package(package_id)

    response.status_int = 307
    response.headers["Location"] = "/dashboard/organizations"

    return "Redirecting"

# update search (MongoDB) org name when organization is updated
def update(org):
    name = org.title
    id = org.id

    collections\
        .get('search_package')\
        .update_many(
            {"value.ecosis.organization_id": id},
            { "$set" : {"value.ecosis.organization": name} }
        )