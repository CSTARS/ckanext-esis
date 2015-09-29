spectraCollection = None

def init(collections):
    global spectraCollection

    spectraCollection = collections.get('spectra')

def insert(spectra):
    spectraCollection.insert(spectra)