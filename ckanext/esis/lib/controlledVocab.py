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
        if not 'USDA Code' in spectra:
            return 1

        item = self.usdaCollection.find_one({'Accepted Symbol': spectra['USDA Code'].upper()},{'_id':0})
        if item != None:
            for attr, val in item.iteritems():
                if len(val) == 0:
                    continue
                    
                spectra[attr] = val
            return 3
        return 2