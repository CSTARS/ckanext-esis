import click

# ckan ecosis initdb -c
name = 'ecosis'

@click.group()
def ecosis():
  """Database management commands.
  """
  pass
  
@ecosis.command(
  name=u'initdb',
  short_help=u'Initialize ecosis tables'
)
def initdb():
  u'''Initialize ecosis tables'''
  from .model import setup