from boto3.session import Session
import boto3
from ckan.common import config


ACCESS_KEY = config.get('aws.access_key')
SECRET_KEY = config.get('aws.secret_key')

session = Session(
  aws_access_key_id=ACCESS_KEY,
  aws_secret_access_key=SECRET_KEY
)
s3 = session.resource('s3')
