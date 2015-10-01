usdaCollection = None

def init(collections):
    global usdaCollection

    usdaCollection = collections.get('usda')

def setCodes(spectra, info=None):
    if not 'USDA Symbol' in spectra:
        return

    item = usdaCollection.find_one({'Accepted Symbol': spectra['USDA Symbol'].upper()},{'_id':0})
    if item != None:
        if item.get('Common Name') != None and item.get('Common Name') != "":
            spectra['Common Name'] = item['Common Name']

            if info is not None:
                info.append({
                    "type" : "usda lookup",
                    "key" : "Common Name"
                })

        if item.get('Scientific Name') != None and item.get('Scientific Name') != "":
            parts = item.get('Scientific Name').split(' ')
            spectra['Latin Genus'] = parts.pop(0)
            spectra['Latin Species'] = " ".join(parts)

            if info is not None:
                info.append({
                    "type" : "usda lookup",
                    "key" : "Latin Genus"
                })
                info.append({
                    "type" : "usda lookup",
                    "key" : "Latin Species"
                })


        return

    return