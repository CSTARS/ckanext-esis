import json, re, os

## status codes
# 1 - attribute did not exist
# 2 - attribute not recognized
# 3 - attribute set


path = os.path.dirname(os.path.abspath(__file__))
schema = {}

def flatten(name):
    return re.sub(r'\s', '', name).lower()

# read schema file from importer core
with open('%s/../../../spectra-importer/core/schema.json' % path, 'r') as data_file:
    cats = json.load(data_file)
    for cat, items in cats.iteritems():
        for item in items:
            flat = flatten(item.get('name'))
            schema[flat] = item

class ControlledVocab:

    usdaCollection = None


    def setCollection(self, collection):
        self.usdaCollection = collection

    # expects a spectra object that is either being sent to preview or pushed to search
    def setUSDACodes(self, spectra):
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

    # see if a flat version of this exists
    def getEcoSISName(self, key):
        flat = flatten(key)

        if schema.get(flat) != None:
            return schema.get(flat).get('name')

        return key

    def enforceControlled(self, measurement):
        set = {}
        remove = []

        for key, value in measurement.iteritems():
            value = measurement[key]

            if key == 'datapoints' or value == '' or value == None:
                continue

            flat = flatten(key)
            if schema.get(flat) == None:
                continue

            item = schema.get(flat)
            if item['input'] != 'controlled' or item.get('vocabulary') == 'None':
                continue

            lower = value.lower().strip()
            found = False
            for name in item.get('vocabulary'):
                if lower == name.lower():
                    measurement[key] = name
                    found = True
                    break

            if not found:
                if item.get('allowOther') == True:
                    other = "%s Other" % item.get("name")
                    set[other] = value
                    measurement[key] = 'Other'
                else:
                    remove.append(key)

        for key, value in set.iteritems():
            measurement[key] = value

        for key in remove:
            del measurement[key]
