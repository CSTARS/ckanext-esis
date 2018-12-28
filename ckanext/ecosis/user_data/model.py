import logging
import datetime

from sqlalchemy import Table, Column, types
from ckan.model.meta import mapper, metadata, Session
from ckan.model.domain_object import DomainObject
from ckan import model
from ckan.model.types import make_uuid

log = logging.getLogger(__name__)

# good references for editing tables
# https://github.com/ckan/ckanext-harvest/blob/master/ckanext/harvest/model/__init__.py
# https://github.com/stadt-karlsruhe/ckanext-extractor/blob/master/ckanext/extractor/model.py

source_table = None

def setup():
    if source_table is None:
        define_table()
        log.debug('User github table defined in memory')

    if not model.package_table.exists():
        log.debug('User github table creation deferred')
        return

    if not source_table.exists():
        source_table.create()
        log.debug('User github table created')

    else:
        log.debug('Github table already exist')
        # Check if existing tables need to be updated
        # for migration

def get(user_id):
    q = Session.query(UserGithubInfo).\
        filter(UserGithubInfo.user_id == user_id)
    return q.first()

def update(user_id, github_username):
    info = get(user_id)

    if info is None:
        info = UserGithubInfo()
        info.user_id = user_id

    info.github_username = github_username
    info.save()

def define_table():

    global source_table

    source_table = Table('user_github_info', metadata,
        Column('id', types.UnicodeText, primary_key=True, default=make_uuid),
        Column('created', types.DateTime, default=datetime.datetime.utcnow),
        Column('user_id', types.UnicodeText, default=u''),
        Column('github_username', types.UnicodeText, default=u''),
    )
    mapper(UserGithubInfo, source_table)


class UserGithubInfo(DomainObject):
    '''Contains a users github user account for EcoSML
    '''
    pass