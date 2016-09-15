usdaCollection = None

# inject global dependencies
def init(collections):
    global usdaCollection

    usdaCollection = collections.get('usda')

# Given a spectra object with attribute 'USDA Symbol', lookup USDA plant information
def setCodes(spectra, info=None):
    if not 'USDA Symbol' in spectra:
        return

    item = usdaCollection.find_one({'Accepted Symbol': spectra['USDA Symbol'].upper()},{'_id':0})
    if item != None:
        # see if we have common name
        if item.get('Common Name') != None and item.get('Common Name') != "":
            spectra['Common Name'] = item['Common Name']

            # let the UI know where this attribute came from
            if info is not None:
                info.append({
                    "type" : "usda lookup",
                    "key" : "Common Name"
                })

        # see if we have genus and species
        if item.get('Scientific Name') != None and item.get('Scientific Name') != "":
            parts = item.get('Scientific Name').split(' ')
            spectra['Latin Genus'] = parts.pop(0)
            spectra['Latin Species'] = " ".join(parts)

            # let the UI know where these attributes cam from
            if info is not None:
                info.append({
                    "type" : "usda lookup",
                    "key" : "Latin Genus"
                })
                info.append({
                    "type" : "usda lookup",
                    "key" : "Latin Species"
                })