from ckan.lib.cli import CkanCommand

# paster --plugin=ckanext-ecosis initdb -c

class InitCommand(CkanCommand):
    """
    Initialize database tables.
    """

    def command(self):
        self._load_config()
        from .model import setup
        setup()