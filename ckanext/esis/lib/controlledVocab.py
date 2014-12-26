
class ControlledVocab:

    usdaCollection = None

    def setCollection(self, collection):
        self.usdaCollection = collection

    # expects a spectra object that is either being sent to preview or pushed to search
    def set(self, spectra):
        self._setUSDACodes(spectra)

    def _setUSDACodes(self, spectra):
        if not 'USDA Code' in spectra:
            return

        item = self.usdaCollection.find_one({'Accepted Symbol': spectra['USDA Code'].upper()},{'_id':0})
        if item != None:
            for attr, val in item.iteritems():
                spectra[attr] = val