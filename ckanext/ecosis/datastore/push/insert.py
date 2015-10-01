spectraCollection = None

def init(collections):
    global spectraCollection

    spectraCollection = collections.get('search_spectra')

def insert(spectra):
    spectraCollection.insert(spectra)