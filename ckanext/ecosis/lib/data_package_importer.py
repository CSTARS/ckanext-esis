from this import d
from urllib.parse import urlparse
import urllib.request
import re, shutil, shortuuid, zipfile, json
from werkzeug.datastructures import FileStorage
from ckan.common import config
import ckan.logic as logic
from ckanext.ecosis.controller.resource import _process as resource_process
from os import path, makedirs, walk
from .aws import s3

'''
 package.json file is required.  Should contain:

 {
   title: "",
   resources : {
    "[filename]" : {
      "layout" : "column|row",
      "metadata" : Boolean,
      "seperator" : "empty (comma),tab or character"
    }
  }
 }
'''

class DataPackageImporter():
  """
  Import a dataset from a S3 bucket or HTTP endpoint
  """

  root_dir = ''
  uri = ''
  uri_parts = None
  id = ''
  zipfile = ''
  zipfile_name = 'package.zip'
  package_dir = 'package'
  package = {}

  def __init__(self, uri):
    self.uri = uri
    self.id = shortuuid.ShortUUID().random(length=8)
    # todo, make this better
    self.root_dir = path.join(config.get('ecosis.package_import.root'), self.id)
    self.package_dir = path.join(self.root_dir, self.package_dir)

  def run(self, context):
    self.context = context

    try:
      self.download()
      self.unzip()
      self.validate()
      self.create()
    except Exception as e:
      self.cleanup()
      raise e

    self.cleanup()
    return self.newPkg

  def download(self):
    """
    Download the uri, currently supports S3 or HTTP uri
    """
    makedirs(self.root_dir)

    self.uri_parts = urlparse(self.uri)
    self.zipfile = path.join(self.root_dir, self.zipfile_name)

    if self.uri_parts.scheme == 's3':
      self.downloadS3()
    elif re.match(r'^http(s)?',  self.uri_parts.scheme ):
      self.downloadHttp()

  def downloadS3(self):
    """
    Download file from S3 bucket
    """
    s3.download_file(self.uri_parts.netloc, self.uri_parts.path, self.zipfile)

  def downloadHttp(self):
    """
    Download file from http endpoint
    """
    urllib.request.urlretrieve(self.uri, self.zipfile)

  def unzip(self):
    """
    unzip package contents
    """
    makedirs(self.package_dir)
    with zipfile.ZipFile(self.zipfile, 'r') as zip_ref:
      zip_ref.extractall(self.package_dir)

    # check one level deep for package.json folder
    if not self.package_file_exits('package.json', throw_error=False):
      for root, dirs, files in walk(self.package_dir):
        for dir in dirs:
          new_pkg_dir = path.join(self.package_dir, dir)
          if path.exists(path.join(new_pkg_dir, 'package.json')):
            self.package_dir = new_pkg_dir
            break
        break



  def validate(self):
    """
    Validate a package
    """
    self.package_file_exits('package.json')
    f = open(path.join(self.package_dir, 'package.json'))
    self.package = json.load(f)

    if self.package.get("resources") is not None:
      self.resources = self.package.get("resources")
      del self.package["resources"]

    if self.package.get('title') is None:
      raise Exception('No package title provided')
    # set name based on title
    self.package['name'] = self.package.get('title').strip().lower().replace(' ', '-')

    if self.package.get('owner_org') is None:
      raise Exception('No package owner_org provided')

    org = logic.get_action('organization_show')(self.context, {'id': self.package.get('owner_org')})
    if org is None:
      raise Exception('No organization provided')

    # set a default license id if none provided
    if not self.package.get('license_id'):
      self.package['license_id'] = 'cc-by'

    # if extras provided as dict, convert to array
    if self.package.get('extras') is not None:
      extras = self.package.get('extras')
      if type(extras) is dict:
        arr = []
        for key, value in extras.items():
          arr.append({
            'key' : key,
            'value' : value
          })
        self.package['extras'] = arr

    if self.package.get('tags') is not None:
      tags = self.package.get('tags')
      for i in range(len(tags)):
        if type(tags[i]) is str:
          tags[i] = {'display_name': tags[i], 'name': tags[i]}
        

  def create(self):
    """
    Create package
    """
    # For debugging
    # try:
    #   logic.get_action('package_delete')(self.context, {'id': self.package.get('name')})
    # except Exception as err:
    #   print(err)
    #   pass

    # TODO: does this raise error on badness?
    self.newPkg = logic.get_action('package_create')(self.context, self.package)

    # TODO: list files
    # TODO: add all non-package.json files as resources
    # TODO: set all self.resources config using EcoSIS API
    # Reminder: any file not defined in self.resource should have `ignore` flag set

    if self.resources is not None:
      for filename, properties in self.resources.items():
        fp = open(path.join(self.package_dir, filename), mode='rb')
        upload = FileStorage(fp)
        resource = {
          'package_id' : self.newPkg.get('id'),
          'name' : filename,
          'mimetype' : properties.get('mimetype'),
          'upload': upload
        }
        resource_create = logic.get_action('resource_create')
        resource = resource_create(self.context, resource)
        resource_process(resource['package_id'], None, resource['id'], None, properties)

  def package_file_exits(self, file, throw_error=True):
    if not path.exists(path.join(self.package_dir, file)):
      if throw_error:
        raise Exception('Missing package file: %s' % file)
      else:
        return False
    return True

  def cleanup(self, remove_pkg=False):
    """
    Remove all files and package is flag is set and package has been created
    """
    if remove_pkg == True and self.package.get('id') is not None:
      logic.get_action('package_delete')(self.context, {'id': self.package.get('id')})

    shutil.rmtree(self.root_dir)
