import ckan.plugins as plugins
import ckan.plugins.toolkit as tk
import pylons.config as config

class EcosisPlugin(plugins.SingletonPlugin,
        tk.DefaultDatasetForm):
    '''An example IDatasetForm CKAN plugin.

    Uses a tag vocabulary to add a custom metadata field to datasets.

    '''
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IRoutes, inherit=True)


    def update_config(self, config):
        # Add this plugin's templates dir to CKAN's extra_template_paths, so
        # that CKAN will use this plugin's custom templates.
        tk.add_template_directory(config, 'templates')

    # set helpers for ecosis templates
    def get_helpers(self):
        # Example:
        #return { 'to_json' : 'self.to_json' }
        return {
            'get_google_analytics_code' : self.get_google_analytics_code
        }

    def get_google_analytics_code(self):
        return config.get('ckan.google_analytics_code', '')


    def is_fallback(self):
        # Return True to register this plugin as the default handler for
        # spectral types not handled by any other IDatasetForm plugin.
        return False

    def before_map(self, map):
        self.set_map(map);
        return map

    # override?
    def set_map(self, map):
        controller = 'ckanext.ecosis.controller:SpectraController'
        # Most of the routes are defined via the IDatasetForm interface
        # (ie they are the ones for a package type)

        # new routes







        # multi delete


        # TODO: override the package delete button, make sure that deleted packages are removed from search as well
        # Ex: http://localhost:5000/organization/delete/12568285-6f7c-458e-a1c7-a6fb5119b296
        # map.connect('delete_organization_ui', '/organization/delete/{id}', controller=controller, action='deleteOrganizationUi')

        # TODO: should probably override the API call as well

        # connect workspace calls
        controller = 'ckanext.ecosis.workspace:WorkspaceController'
        map.connect('process_workspace', '/workspace/process', controller=controller, action='processWorkspace')
        map.connect('process_resource', '/workspace/processResource', controller=controller, action='processResource')
        map.connect('set_parse_info', '/workspace/setParseInfo', controller=controller, action='setParseInformation')
        map.connect('update_join', '/workspace/updateJoin', controller=controller, action='updateJoin')
        map.connect('set_default_layout', '/workspace/setDefaultLayout', controller=controller, action='setDefaultLayout')
        map.connect('get_datasheet', '/workspace/getDatasheet', controller=controller, action='getDatasheet')
        map.connect('set_attribute_info', '/workspace/setAttributeInfo', controller=controller, action='setAttributeInfo')
        map.connect('set_dataset_attributes', '/workspace/setDatasetAttributes', controller=controller, action='setDatasetAttributes')
        map.connect('set_attribute_map', '/workspace/setAttributeMap', controller=controller, action='setAttributeMap')
        map.connect('get_layout_overview', '/workspace/getLayoutOverview', controller=controller, action='getLayoutOverview')
        map.connect('get_spectra', '/workspace/getSpectra', controller=controller, action='getSpectra')
        map.connect('push_to_search', '/workspace/push', controller=controller, action='pushToSearch')


        # The 'new' way
        controller = 'ckanext.ecosis.controller:EcosisController'

        # Standard
        map.connect('delete_package_3', '/api/3/action/package_delete', controller=controller, action='deletePackage')
        map.connect('delete_package', '/api/action/package_delete', controller=controller, action='deletePackage')
        map.connect('delete_resource_3', '/api/3/action/resource_delete', controller=controller, action='deleteResource')
        map.connect('delete_resource', '/api/action/resource_delete', controller=controller, action='deleteResource')
        # Ex: http://localhost:5000/organization/delete/12568285-6f7c-458e-a1c7-a6fb5119b296
        map.connect('delete_organization_ui', '/organization/delete/{id}', controller=controller, action='deleteOrganizationUi')
        # route all resource edit screens to main ecosis dataset editor
        map.connect('create_package_ui', '/dataset/new', controller=controller, action='createPackageRedirect')
        # TODO: can we get fancy and point at specific action or resource?
        map.connect('edit_package_ui', '/dataset/edit/{id}', controller=controller, action='editPackageRedirect')
        map.connect('package_resources_ui', '/dataset/resources/{id}', controller=controller, action='editPackageRedirect')
        map.connect('new_resource_ui', '/dataset/new_resource/{id}', controller=controller, action='editPackageRedirect')
        map.connect('edit_resource_ui', '/dataset/{id}/resource_edit/{resource_id}', controller=controller, action='editPackageRedirect')


        # ecosis
        map.connect('rebuild_index', '/ecosis/admin/rebuildIndex', controller=controller, action='rebuildIndex')
        map.connect('clean', '/ecosis/admin/clean', controller=controller, action='clean')
        map.connect('rebuild_usda_collection', '/ecosis/admin/rebuildUSDA', controller=controller, action='rebuildUSDACollection')


        map.connect('setPrivate', '/ecosis/package/setPrivate', controller=controller, action='setPrivate')

        map.connect('git_info', '/ecosis/gitInfo', controller=controller, action='gitInfo')
        map.connect('userInfo', '/ecosis/userInfo', controller=controller, action='userInfo')

        # TODO: you can have a race condition if delete_resource is called too fast.  This is VERY POOR fix...
        # still the case? - JM
        map.connect('delete_resources', '/ecosis/resource/deleteMany', controller=controller, action='deleteResources')


        return map

    def package_types(self):
        # This plugin doesn't handle any special package types, it just
        # registers itself as the default (above).
        return []

    def _modify_package_schema(self, schema):
        #schema.update({
        #        'access_level': [tk.get_validator('ignore_missing'),
        #            tk.get_converter('convert_to_tags')('access_levels')]
        #        })

        # Add custom access_level as extra field
        return schema

    def create_package_schema(self):
        schema = super(EcosisPlugin, self).create_package_schema()
        schema = self._modify_package_schema(schema)
        return schema

    def update_package_schema(self):
        schema = super(EcosisPlugin, self).update_package_schema()
        schema = self._modify_package_schema(schema)
        return schema

    def show_package_schema(self):
        schema = super(EcosisPlugin, self).show_package_schema()

        return schema

    # check_data_dict() is deprecated, this method is only here to test that
    # legacy support for the deprecated method works.
    def check_data_dict(self, data_dict, schema=None):
        return

    def setup_template_variables(self, context, data_dict):
        return super(EcosisPlugin, self).setup_template_variables(
                context, data_dict)

    def new_template(self):
        return super(EcosisPlugin, self).new_template()

    def read_template(self):
        return super(EcosisPlugin, self).read_template()

    def edit_template(self):
        return super(EcosisPlugin, self).edit_template()

    def comments_template(self):
        return super(EcosisPlugin, self).comments_template()

    def search_template(self):
        return super(EcosisPlugin, self).search_template()

    def history_template(self):
        return super(EcosisPlugin, self).history_template()

    def package_form(self):
        return super(EcosisPlugin, self).package_form()
