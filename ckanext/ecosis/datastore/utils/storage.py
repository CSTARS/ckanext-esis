import os

storage_path = None

'''
Helpers for reading storage paths for reading resources from disk
'''

def init(config):
    global storage_path

    storage_path = None
    _storage_path = None

    #None means it has not been set. False means not in config.
    if _storage_path is None:
        storage_path = config.get("app:main", 'ckan.storage_path')

        if storage_path:
            _storage_path = storage_path
        else:
            _storage_path = False

    if not _storage_path:
        storage_path = None
        return

    storage_path = os.path.join(_storage_path, 'resources')


def get_directory(id):
    directory = os.path.join(storage_path,
                             id[0:3], id[3:6])
    return directory

def get_path(resource_id):
    directory = get_directory(resource_id)
    filepath = os.path.join(directory, resource_id[6:])
    return filepath