import json, os
import ckan.plugins as plugins
import ckan.plugins.toolkit as tk
import ckan.lib.base as base
from ckan.common import config, request
from ckan.logic.action.create import organization_member_create
from ckan.logic.action.delete import organization_member_delete

from flask import Blueprint, make_response, send_from_directory
import ckanext.ecosis.lib.utils as utils

import ckanext.ecosis.datastore.query as query
import ckanext.ecosis.controller.organization as orgController
import ckanext.ecosis.user_data.model as userDataModel
from ckanext.ecosis.controller import EcosisController

controller = EcosisController()

@tk.side_effect_free
def organization_member_create_wrapper(context, member_create):
    organization_member_create(context, member_create)
    orgController.notify_remotes(member_create.get('id'))

@tk.side_effect_free
def organization_member_delete_wrapper(context, member_delete):
    organization_member_delete(context, member_delete)
    orgController.notify_remotes(member_delete.get('id'))

class EcosisPlugin(plugins.SingletonPlugin,
        tk.DefaultDatasetForm):
    '''An example IDatasetForm CKAN plugin.

    Uses a tag vocabulary to add a custom metadata field to datasets.

    '''
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IRoutes, inherit=True)
    plugins.implements(plugins.IOrganizationController)
    plugins.implements(plugins.IActions)
    plugins.implements(plugins.IClick)
    plugins.implements(plugins.IMiddleware)


    # IClick
    def get_commands(self):
        import click
        from ckanext.ecosis.user_data.paster import ecosis as ecosisCmd

        # @click.command()
        # def hello():
        #     click.echo('Hello, World!')
        return [ecosisCmd]

    def read(self, entity):
        pass

    def create(self, entity):
        orgController.notify_remotes(entity.id)

    def edit(self, entity):
        orgController.update(entity)

    def authz_add_role(self, object_role):
        pass

    def authz_remove_role(self, object_role):
        pass

    def delete(self, entity):
        orgController.delete(entity)

    def before_view(self, pkg_dict):
        return pkg_dict

    # we need to listen for org create/update/delete events and notify remotes
    def get_actions(self):
        return {
            'organization_member_create' : organization_member_create_wrapper,
            'organization_member_delete': organization_member_delete_wrapper
        }


    def update_config(self, config):
        # Add this plugin's templates dir to CKAN's extra_template_paths, so
        # that CKAN will use this plugin's custom templates.
        tk.add_template_directory(config, 'templates')
        tk.add_resource('public/fanstatic', 'ecosis')
        userDataModel.define_table()

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

    def make_middleware(self, app, config):
      editor_redirects = Blueprint(u'editor_redirects', __name__, url_prefix=u'/')
      # route all resource edit screens to main ecosis dataset editor
      editor_redirects.add_url_rule(u'/dataset/new', methods=[u'GET'],
          view_func=controller.createPackageRedirect)

      editor_redirects.add_url_rule(u'/import/', methods=[u'GET'],
          view_func=lambda: send_from_directory(os.path.join(os.getcwd(), 'ckanext-ecosis/spectra-importer/dist/import'), 'index.html'))

      app.register_blueprint(editor_redirects)

      # API
      api = Blueprint(u'ecosis', __name__, url_prefix=u'/ecosis')

      # ecosis - admin
      api.add_url_rule(u'/admin/rebuildIndex', methods=[u'GET'],
          view_func=controller.rebuildIndex)
      api.add_url_rule(u'/admin/clean', methods=[u'GET'],
          view_func=controller.clean)

          # ecosis - admin

      app.register_blueprint(api)
      return app

    def make_error_log_middleware(self, app, config):
      return app


    def before_map(self, map):
        self.set_map(map)
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

        # route all resource edit screens to main ecosis dataset editor
        # TODO: can we get fancy and point at specific action or resource?
        map.connect('edit_package_ui', '/dataset/edit/<id>', controller=controller, action='editPackageRedirect')
        map.connect('package_resources_ui', '/dataset/resources/<id>', controller=controller, action='editPackageRedirect')
        map.connect('new_resource_ui', '/dataset/new_resource/<id>', controller=controller, action='editPackageRedirect')
        map.connect('edit_resource_ui', '/dataset/<id>/resource_edit/<resource_id>', controller=controller, action='editPackageRedirect')


        # ecosis - admin
        map.connect('verifyWorkspace', '/ecosis/admin/verifyWorkspace', controller=controller, action='verifyWorkspace')
        map.connect('rebuild_usda_collection', '/ecosis/admin/rebuildUSDA', controller=controller, action='rebuildUSDACollection')
        map.connect('clean_tests', '/ecosis/admin/cleanTests', controller=controller, action='cleanTests')
        map.connect('upgrade', '/ecosis/admin/upgrade', controller=controller, action='upgrade')
        map.connect('fixUnits', '/ecosis/admin/fixUnits', controller=controller, action='fixUnits')
        map.connect('fixCitations', '/ecosis/admin/fixCitations', controller=controller, action='fixCitations')

        # ecosis - admin doi
        map.connect('doi_query', '/ecosis/admin/doi/query', controller=controller, action='doiQuery')
        map.connect('doi_update_status', '/ecosis/admin/doi/update', controller=controller, action='doiUpdateStatus')
        map.connect('doi_clear', '/ecosis/admin/doi/clear', controller=controller, action='clearDoi')
        map.connect('getAllGithubInfo', '/ecosis/admin/github/sync', controller=controller, action='getAllGithubInfo')

        # ecosis - package
        map.connect('setPrivate', '/ecosis/package/setPrivate', controller=controller, action='setPrivate')
        map.connect('updateLinkedResources', '/ecosis/package/updateLinkedResources', controller=controller, action='updateLinkedResources')
        map.connect('getTemplate', '/ecosis/package/getTemplate', controller=controller, action='getTemplate')
        map.connect('set_package_options', '/ecosis/package/setOptions', controller=controller, action='setPackageOptions')

        # ecosis - root
        map.connect('git_info', '/ecosis/gitInfo', controller=controller, action='gitInfo')
        map.connect('userInfo', '/ecosis/user/get', controller=controller, action='userInfo')
        map.connect('userInfo', '/ecosis/user/githubInfo', controller=controller, action='setGithubInfo')
        map.connect('remoteLogin', '/ecosis/user/remoteLogin', controller=controller, action='remoteLogin')

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

        # custom pages
        map.connect('remotelogin', '/user/remotelogin', controller='ckanext.ecosis.plugin:StaticPageController', action='remotelogin')


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


# class StaticPageController(base.BaseController):

#     def remotelogin(self):
#         return base.render('user/remotelogin.html')