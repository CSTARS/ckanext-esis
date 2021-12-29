from urllib.parse import urlparse
import re, shutil, shortuuid, zipfile, json
from ckan.common import config
import ckan.logic as logic
from os import path, mkdir
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
    self.root_dir = path.join(config.get('ecosis.package.dir'), self.id)
    self.package_dir = path.join(self.root_dir, self.package_dir)

  def run(self, context):
    self.context = context
    self.download()
    self.unzip()
    self.validate()
    self.create()
    self.cleanup()
    return self.package

  def download(self):
    """
    Download the uri, currently supports S3 or HTTP uri
    """
    mkdir(self.root_dir)

    self.uri_parts = urlparse(self.uri)
    if self.uri_parts.scheme == 's3':
      self.downloadS3()
    elif re.match(r'^http(s)?',  self.uri_parts.scheme ):
      self.downloadHttp()
    
  def downloadS3(self):
    """
    Download file from S3 bucket
    """
    self.zipfile = path.join(self.root_dir, self.zipfile_name)
    s3.download_file(self.uri_parts.netloc, self.uri_parts.path, zipfile)

  def unzip():
    """
    unzip package contents
    """
    mkdir(self.package_dir)
    with zipfile.ZipFile(self.zipfile_name, 'r') as zip_ref:
      zip_ref.extractall(self.package_dir)


  def validate(self):
    """
    Validate a package
    """
    self.package_file_exits('package.json')
    f = open(path.join(self.package_dir, 'package.json'))
    self.package = json.load(f)

    if self.package.get("resources") is not None:
      self.resources = self.package.get("resources")
      del self.package["resource"]

    if self.package.get('name') is None:
      raise Exception('No package name provided')

    if self.package.get('owner_org') is None:
      raise Exception('No package name provided')

    org = logic.get_action('organization_show')(self.context, {'id': self.package.get('owner_org')})
    if org is None:
      raise Exception('No organization provided')

  def create(self):
    """
    Create package
    """
    # TODO: does this raise error on badness?
    newPkg = logic.get_action('package_create')(self.context, self.package)

    # TODO: list files
    # TODO: add all non-package.json files as resources
    # TODO: set all self.resources config using EcoSIS API
    # Reminder: any file not defined in self.resource should have `ignore` flag set

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
