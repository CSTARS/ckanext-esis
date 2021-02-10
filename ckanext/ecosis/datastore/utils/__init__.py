from . import storage

# inject global dependencies
def init(config):
    storage.init(config)