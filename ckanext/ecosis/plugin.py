import ckan.plugins as plugins
import ckan.plugins.toolkit as tk
import pylons.config as config

import ckanext.ecosis.datastore.query as query
import ckanext.ecosis.controller.organization as orgController

class EcosisPlugin(plugins.SingletonPlugin,
        tk.DefaultDatasetForm):
    '''An example IDatasetForm CKAN plugin.

    Uses a tag vocabulary to add a custom metadata field to datasets.

    '''
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IRoutes, inherit=True)
    plugins.implements(plugins.IOrganizationController)

    def read(self, entity):
        pass

    def create(self, entity):
        pass

    def edit(self, entity):
        orgController.update(entity)
        pass

    def authz_add_role(self, object_role):
        pass

    def authz_remove_role(self, object_role):
        pass

    def delete(self, entity):
        pass

    def before_view(self, pkg_dict):
        return pkg_dict

    def update_config(self, config):
        # Add this plugin's templates dir to CKAN's extra_template_paths, so
        # that CKAN will use this plugin's custom templates.
        tk.add_template_directory(config, 'templates')

    # set helpers for ecosis templates
    def get_helpers(self):
        # Example:
        #return { 'to_json' : 'self.to_json' }
        return {
            'get_google_analytics_code' : self.get_google_analytics_code,
            'get_search_url' : self.get_search_url,
            'get_last_pushed_str' : self.get_last_pushed_str,
            'pushed_to_search' :  self.pushed_to_search
        }

    def pushed_to_search(self, package_id):
        result = query.isPushed(package_id)
        if result is None:
            return False
        return True

    def get_last_pushed_str(self, package_id):
        result = query.isPushed(package_id)
        if result is None:
            return None
        try:
            return result.strftime("%Y-%m-%d %H:%M")
        except:
            return result

    def get_search_url(self):
        return config.get('ecosis.search_url','')

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

        # The 'new' way
        controller = 'ckanext.ecosis.controller:EcosisController'

        # Standard CKAN overrides
        map.connect('create_package_3', '/api/3/action/package_create', controller=controller, action='createPackage')
        map.connect('create_package', '/api/action/package_create', controller=controller, action='createPackage')
        map.connect('update_package_3', '/api/3/action/package_update', controller=controller, action='updatePackage')
        map.connect('update_package', '/api/action/package_update', controller=controller, action='updatePackage')
        map.connect('delete_package_3', '/api/3/action/package_delete', controller=controller, action='deletePackage')
        map.connect('delete_package', '/api/action/package_delete', controller=controller, action='deletePackage')
        map.connect('delete_resource_3', '/api/3/action/resource_delete', controller=controller, action='deleteResource')
        map.connect('delete_resource', '/api/action/resource_delete', controller=controller, action='deleteResource')
        map.connect('create_resource_3', '/api/3/action/resource_create', controller=controller, action='createResource')
        map.connect('create_resource', '/api/action/resource_create', controller=controller, action='createResource')

        # Ex: http://localhost:5000/organization/delete/12568285-6f7c-458e-a1c7-a6fb5119b296
        map.connect('delete_organization_ui', '/organization/delete/{id}', controller=controller, action='deleteOrganizationUi')

        # route all resource edit screens to main ecosis dataset editor
        map.connect('create_package_ui', '/dataset/new', controller=controller, action='createPackageRedirect')
        # TODO: can we get fancy and point at specific action or resource?
        map.connect('edit_package_ui', '/dataset/edit/{id}', controller=controller, action='editPackageRedirect')
        map.connect('package_resources_ui', '/dataset/resources/{id}', controller=controller, action='editPackageRedirect')
        map.connect('new_resource_ui', '/dataset/new_resource/{id}', controller=controller, action='editPackageRedirect')
        map.connect('edit_resource_ui', '/dataset/{id}/resource_edit/{resource_id}', controller=controller, action='editPackageRedirect')


        # ecosis - admin
        map.connect('rebuild_index', '/ecosis/admin/rebuildIndex', controller=controller, action='rebuildIndex')
        map.connect('clean', '/ecosis/admin/clean', controller=controller, action='clean')
        map.connect('verifyWorkspace', '/ecosis/admin/verifyWorkspace', controller=controller, action='verifyWorkspace')
        map.connect('rebuild_usda_collection', '/ecosis/admin/rebuildUSDA', controller=controller, action='rebuildUSDACollection')
        map.connect('clean_tests', '/ecosis/admin/cleanTests', controller=controller, action='cleanTests')
        map.connect('upgrade', '/ecosis/admin/upgrade', controller=controller, action='upgrade')

        # ecosis - admin doi
        map.connect('doi_query', '/ecosis/admin/doi/query', controller=controller, action='doiQuery')
        map.connect('doi_update_status', '/ecosis/admin/doi/update', controller=controller, action='doiUpdateStatus')
        map.connect('doi_clear', '/ecosis/admin/doi/clear', controller=controller, action='clearDoi')

        # ecosis - package
        map.connect('setPrivate', '/ecosis/package/setPrivate', controller=controller, action='setPrivate')
        map.connect('updateLinkedResources', '/ecosis/package/updateLinkedResources', controller=controller, action='updateLinkedResources')
        map.connect('getTemplate', '/ecosis/package/getTemplate', controller=controller, action='getTemplate')
        map.connect('set_package_options', '/ecosis/package/setOptions', controller=controller, action='setPackageOptions')

        # ecosis - root
        map.connect('git_info', '/ecosis/gitInfo', controller=controller, action='gitInfo')
        map.connect('userInfo', '/ecosis/user/get', controller=controller, action='userInfo')

        # ecosis - resource
        map.connect('delete_resources', '/ecosis/resource/deleteMany', controller=controller, action='deleteResources')
        map.connect('process_resource', '/ecosis/resource/process', controller=controller, action='processResource')
        map.connect('get_resource', '/ecosis/resource/get', controller=controller, action='getResource')
        map.connect('get_spectra_metadata', '/ecosis/resource/getMetadataChunk', controller=controller, action='getMetadataChunk')
        map.connect('getMetadataInfo', '/ecosis/resource/getMetadataInfo', controller=controller, action='getMetadataInfo')
        map.connect('get_spectra_count', '/ecosis/resource/getSpectraCount', controller=controller, action='getSpectraCount')
        map.connect('get_resource_by_name', '/ecosis/resource/byname/{package_id}/{resource_name}', controller=controller, action='getResourceByName')

        # ecosis - spectra
        map.connect('get_spectra', '/ecosis/spectra/get', controller=controller, action='getSpectra')
        map.connect('top_suggest', '/ecosis/spectra/suggest', controller=controller, action='topSuggest')
        map.connect('top_overview', '/ecosis/spectra/suggestOverview', controller=controller, action='topOverview')
        map.connect('gcmd_suggest', '/ecosis/spectra/gcmd', controller=controller, action='gcmdSuggest')

        # ecosis - workspace
        map.connect('prepare_workspace', '/ecosis/workspace/prepare', controller=controller, action='prepareWorkspace')
        map.connect('get_workspace', '/ecosis/workspace/get', controller=controller, action='getWorkspace')
        map.connect('push_to_search', '/ecosis/workspace/push', controller=controller, action='pushToSearch')


        return map

    def package_types(self):
        # This plugin doesn't handle any special package types, it just
        # registers itself as the default (above).
        return []

    def _modify_package_schema(self, schema):
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
