## status codes
# 1 - attribute did not exist
# 2 - attribute not recognized
# 3 - attribute set


class ControlledVocab:

    usdaCollection = None

    def setCollection(self, collection):
        self.usdaCollection = collection

    # expects a spectra object that is either being sent to preview or pushed to search
    def set(self, spectra):
        return self._setUSDACodes(spectra)

    def _setUSDACodes(self, spectra):
        if not 'USDA Symbol' in spectra:
            return 1

        item = self.usdaCollection.find_one({'Accepted Symbol': spectra['USDA Symbol'].upper()},{'_id':0})
        if item != None:
            if item.get('Common Name') != None and item.get('Common Name') != "":
                spectra['Common Name'] = item['Common Name']

            if item.get('Scientific Name') != None and item.get('Scientific Name') != "":
                parts = item.get('Scientific Name').split(' ')
                spectra['Latin Genus'] = parts.pop(0)
                spectra['Latin Species'] = " ".join(parts)

            return 3

        return 2