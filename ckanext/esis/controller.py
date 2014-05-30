import logging
import json, re


from ckan.lib.base import c, model
import ckan.logic as logic
from ckan.common import request
import ckan.lib.uploader as uploader

from ckan.controllers.package import PackageController


log = logging.getLogger(__name__)

class SpectraController(PackageController):

    def all(self):
        context = {'model': model, 'user': c.user}
        data_dict = {
            'query': 'name:esis_spectral_data.json'
        }
        query = logic.get_action('resource_search')(context, data_dict)
        return json.dumps(query)

    def get(self):
        id = request.params.get('id')
        context = {'model': model, 'user': c.user}

        resource = model.Resource.get(id)
        pkg_id = resource.get_package_id()
        pkg = model.Package.get(pkg_id)

        upload = uploader.ResourceUpload(logic.get_action('resource_show')(context, {'id': id}))
        filepath = upload.get_path(id)
        file = open(filepath, 'r')

        data = {
            'pkg_id' : pkg_id,
            'pkg_name' : pkg.name,
            'pkg_title' : pkg.title,
            'resource_id' : id,
            'dataset'   : json.loads(file.read()),
        }
        file.close()

        return json.dumps(data)

    # clear all of the resources for a package
    # currently we are not going to keep track of mapping between spectra to file
    # was well as the workflow that got us there, so, you will always have to jump
    # through the hoop to do this
    #
    # TODO: perhaps we let them download the attribute map?
    # or let them use the attribute map?
    def clear(self):
        id = request.params.get('id')
        context = {'model': model, 'user': c.user}

        pkg = logic.get_action('package_show')(context, {'id': id})
        resources = pkg['resources']
        count = 0
        for resource in resources:
            count += 1
            logic.get_action('resource_delete')(context, {'id':resource['id']})

        return json.dumps({'success':'true', 'count':count})

