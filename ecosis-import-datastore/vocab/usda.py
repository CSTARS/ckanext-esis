usdaCollection = None

def init(collection):
    global usdaCollection

    usdaCollection = collection

def setCodes(spectra):
    if not 'USDA Symbol' in spectra:
        return 1

    item = usdaCollection.find_one({'Accepted Symbol': spectra['USDA Symbol'].upper()},{'_id':0})
    if item != None:
        if item.get('Common Name') != None and item.get('Common Name') != "":
            spectra['Common Name'] = item['Common Name']

        if item.get('Scientific Name') != None and item.get('Scientific Name') != "":
            parts = item.get('Scientific Name').split(' ')
            spectra['Latin Genus'] = parts.pop(0)
            spectra['Latin Species'] = " ".join(parts)

        return 3

    return 2