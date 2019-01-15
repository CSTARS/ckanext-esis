from ckan.lib.cli import CkanCommand

# paster --plugin=ckanext-ecosis initdb -c

class InitCommand(CkanCommand):
    """
    Initialize database tables.
    """
    max_args = 0
    min_args = 0
    usage = __doc__
    summary = __doc__.strip().split('\n')[0]

    def command(self):
        self._load_config()
        from .model import setup
        setup()