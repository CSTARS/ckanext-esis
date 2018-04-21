from ckan.lib.base import c, model
from ckanext.ecosis.datastore import delete as deleteUtil
import ckan.logic as logic
import pylons.config as config
from ckan.common import response
import urllib, urllib2, jwt, json

remote_hosts = config.get('ecosis.remote_hosts', '')
remote_hosts = [x.strip() for x in remote_hosts.split(',')]
secret = config.get('ecosis.jwt.secret')
NotFound = logic.NotFound
collections = None


# inject global dependencies
def init(co):
    global collections
    collections = co

# delete organization
# when org is deleted, we need to remove all of organizations datasets
def delete(group):
    # # first, get a list of all organizations datasets
    # group = model.Group.get(id)
    #
    # if group is None:
    #     raise NotFound('Organization was not found.')

    datasets = []
    for pkg in group.packages(with_private=True):
        datasets.append(pkg.id)

    # now perform normal delete
    # this should check auth
    # context = {'model': model, 'user': c.user}
    # logic.get_action('organization_delete')(context, {'id': id})

    # EcoSIS package delete happens here
    for package_id in datasets:
        deleteUtil.package(package_id)

    # notify remote hosts of change
    notify_remotes(group.id, True)


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

    # notify remote hosts of change
    notify_remotes(id, False)


def notify_remotes(organization_id, deleted=False):
    msg = {
        "id": organization_id,
        "deleted" : deleted
    }

    token = jwt.encode({"id": organization_id}, secret, algorithm='HS256')
    msg = json.dumps(msg)


    for url in remote_hosts:
        try:
            req = urllib2.Request(url, msg, {'Content-Type': 'application/json'})
            req.add_header('x-ecosis-signature', token)
            urllib2.urlopen(req)
            # ignore response, we don't care
        except Exception as e:
            pass