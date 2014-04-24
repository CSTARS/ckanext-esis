import logging

import ckan.plugins as plugins
import ckan.plugins.toolkit as tk
import json
from ckan.common import c

class EsisPlugin(plugins.SingletonPlugin,
        tk.DefaultDatasetForm):
    '''An example IDatasetForm CKAN plugin.

    Uses a tag vocabulary to add a custom metadata field to datasets.

    '''
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IDatasetForm)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IRoutes, inherit=True)


    def update_config(self, config):
        # Add this plugin's templates dir to CKAN's extra_template_paths, so
        # that CKAN will use this plugin's custom templates.
        tk.add_template_directory(config, 'templates')
        # setting up Fanstatic directory.  In here you will find a resource.config file
        tk.add_resource('public','esis')

    def get_helpers(self):
        return {
            'to_json' : self.to_json,
            'getUser' : self.getUser,
            'getPackage' : self.getPackage
        }

    def test(self):
        user = c.userobj
        t = 1

    def getUser(self):
        user = tk.get_action('user_show')({},{'id': c.userobj.id});
        del user['datasets']
        del user['activity']
        return user

    def getPackage(self):
        pkg = tk.get_action('package_show')({},{'id': c.id})
        return pkg

    def to_json(self, data):
        try:
            return json.dumps(data)
        except Exception:
            return "{}"

    def is_fallback(self):
        # Return True to register this plugin as the default handler for
        # spectral types not handled by any other IDatasetForm plugin.
        return False

    def package_types(self):
        return ['spectral']

    def _modify_package_schema(self, schema):
        return schema

    def create_package_schema(self):
        schema = super(EsisPlugin, self).create_package_schema()
        schema = self._modify_package_schema(schema)
        return schema

    def update_package_schema(self):
        schema = super(EsisPlugin, self).update_package_schema()
        schema = self._modify_package_schema(schema)
        return schema

    def show_package_schema(self):
        schema = super(EsisPlugin, self).show_package_schema()

        # Don't show vocab tags mixed in with normal 'free' tags
        # (e.g. on dataset pages, or on the search page)
        schema['tags']['__extras'].append(tk.get_converter('free_tags_only'))

        return schema


    def setup_template_variables(self, context, data_dict):
        return super(EsisPlugin, self).setup_template_variables(
                context, data_dict)

    def new_template(self):
        return 'spectral/new.html'

    def read_template(self):
        return super(EsisPlugin, self).read_template()

    def edit_template(self):
        return super(EsisPlugin, self).edit_template()

    def comments_template(self):
        return super(EsisPlugin, self).comments_template()

    def search_template(self):
        return 'spectral/search.html'

    def history_template(self):
        return super(EsisPlugin, self).history_template()

    def package_form(self):
        return 'spectral/new_package_form.html'

    def before_map(self, map):
        controller = 'ckanext.esis.spectral:SpectralController'
        # Most of the routes are defined via the IDatasetForm interface
        # (ie they are the ones for a package type)

        # just use the basic package controller for this on, there is a js hack
        # to select the correct menu as the menu select is action based :/
        map.connect('spectralSearch', '/spectral', controller='package', action='search')

        # attach the upload handle to the SpectralController
        map.connect('upload', '/spectral/api/upload', controller=controller, action='upload')

        return map

    # check_data_dict() is deprecated, this method is only here to test that
    # legacy support for the deprecated method works.
    def check_data_dict(self, data_dict, schema=None):
        return

