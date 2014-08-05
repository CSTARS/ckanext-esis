import logging
import json, re, zlib, StringIO, zipfile, tempfile

import ckan.lib.munge as munge

from ckan.lib.base import c, model, BaseController
import ckan.logic as logic
from ckan.common import request, response
import ckan.lib.uploader as uploader

from ckan.controllers.package import PackageController
from paste.httpheaders import _AcceptLanguage


log = logging.getLogger(__name__)

class SpectraController(PackageController):

    def all(self):
        context = {'model': model, 'user': c.user}
        data_dict = {
            'query': 'name:esis_spectral_data.zip'
        }
        query = logic.get_action('resource_search')(context, data_dict)
        return json.dumps(query)

    def add(self):
        params = request.params

        for item in params.multi.dicts:
            if hasattr(item, '_items'):
                if len(item._items) > 0:
                    # for an update proly need to splice in here
                    resource = self._create_resource(item._items)
                    return json.dumps(resource)

        return json.dumps({'success':'false', 'error':'true'})

    def _create_resource(self, tuple):
        data_dict = {}
        file = ''
        filename = ''

        for key in tuple:
            if key[0] == 'upload':
                data = key[1]
                file = data.file
                filename = data.filename
            else:
                data_dict[key[0]] = key[1]
        data_dict['url'] = filename.replace('json', 'zip')
        data_dict['mimetype'] = data_dict.get('mimetype').replace('json', 'zip')
        data_dict['name'] = filename.replace('json', 'zip')
        data_dict['url_type'] = 'upload'

        context = {'model': model, 'user': c.user}
        resource = logic.get_action('resource_create')(context, data_dict)

        upload = uploader.ResourceUpload(resource)
        upload.filename = munge.munge_filename(filename.replace('json', 'zip'))

        f = tempfile.TemporaryFile()
        zf = zipfile.ZipFile(f, mode="w")

        zf.writestr(filename, file.read(), zipfile.ZIP_DEFLATED)

        file.close()
        zf.close()

        f.seek(0)
        upload.upload_file = f
        upload.upload(resource.get('id'), uploader.get_max_resource_size())

        f.close()

        return resource

    def update(self):
        params = request.params

        for item in params.multi.dicts:
            if hasattr(item, '_items'):
                if len(item._items) > 0:
                    # for an update proly need to splice in here
                    resource = self._update_resource(item._items)
                    return json.dumps(resource)

        return json.dumps({'success':'false', 'error':'true'})

    def _update_resource(self, tuple):
        data_dict = {}
        file = ''
        filename = ''

        for key in tuple:
            if key[0] == 'upload':
                data = key[1]
                file = data.file
                filename = data.filename
            else:
                data_dict[key[0]] = key[1]


        newDataset = json.loads(file.read())


        # grab the old file
        context = {'model': model, 'user': c.user}
        resource = logic.get_action('resource_show')(context, {'id': data_dict['id']})
        upload = uploader.ResourceUpload(resource)

        oldData = ''
        zipfilename = upload.get_path(data_dict['id'])
        zf = zipfile.ZipFile(zipfilename)
        oldData = zf.read('esis_spectral_data.json')
        oldDataset = json.loads(oldData)
        zf.close()

        # now merge the file data
        self._merge_dataset(oldDataset, newDataset)

        # write new data
        zf = zipfile.ZipFile(zipfilename, mode="w")
        zf.writestr(filename, json.dumps(newDataset), zipfile.ZIP_DEFLATED)

        file.close()
        zf.close()


        return resource

    # loop through all of the old data fields,  old data fields will not have spectra, so reassociate
    # based on spectra id
    def _merge_dataset(self, old, new):
        for oldData in old['data']:
            for newData in new['data']:
                if oldData['spectra_id'] == newData['spectra_id']:
                    newData['spectra'] = oldData['spectra']
                    break

    # download all package resources
    def download(self):
        id = request.params.get('id')
        context = {'model': model, 'user': c.user}
        pkg = logic.get_action('package_show')(context, {'id': id})

        f = tempfile.TemporaryFile()
        zf = zipfile.ZipFile(f, mode="w", compression=zipfile.ZIP_DEFLATED)

        for resource in pkg.get('resources'):
            if resource.get('name') == 'esis_spectral_data.zip':
                continue

            upload = uploader.ResourceUpload(resource)
            zf.write(upload.get_path(resource.get('id')), arcname=resource.get('name'))

        zf.close()
        f.seek(0)

        data = f.read()
        f.close()

    def get(self):
        id = request.params.get('id')
        compress = request.params.get('compressed')
        metadataOnly = request.params.get('metadataOnly')

        context = {'model': model, 'user': c.user}
        upload = uploader.ResourceUpload(logic.get_action('resource_show')(context, {'id': id}))

        data = ''
        if compress == 'false':
            id = request.params.get('id')
            zf = zipfile.ZipFile(upload.get_path(id))
            data = zf.read('esis_spectral_data.json')

            if metadataOnly == 'true':
                # need to splice out the spectra
                tmp = 1

                dataset = json.loads(data)
                for item in dataset['data']:
                    item.pop("spectra", None)
                data = json.dumps(dataset)

            response.headers["Content-Type"] = "application/json"
        else:
            file = open(upload.get_path(id), 'r')
            data = file.read()
            file.close()
            response.headers["Content-Type"] = "application/zip"

        response.headers["Content-Length"] = "%s" % len(data)

        return data

    def info(self):
        id = request.params.get('id')
        context = {'model': model, 'user': c.user}

        resource = model.Resource.get(id)
        pkg_id = resource.get_package_id()
        pkg = logic.get_action('package_show')(context, {'id': pkg_id})

        data = {
            'pkg_id' : pkg_id,
            'pkg_name' : pkg.get('name'),
            'pkg_title' : pkg.get('title'),
            'resource_id' : id,
            'groups' : pkg.get('groups')
        }

        return json.dumps(data)

    def createPackage(self):
        response.status_int = 307
        response.headers["Location"] = "/editor/"
        return "Redirecting"

    def editPackage(self, id):
        response.status_int = 307
        response.headers["Location"] = "/editor/?id=%s" % id.encode('ascii','ignore')
        return "Redirecting"
