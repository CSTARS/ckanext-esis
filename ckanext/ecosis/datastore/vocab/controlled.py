import re
from . import utils

schema = None

# inject global dependencies
def init(schemaDef):
    global schema

    schema = schemaDef

def getEcoSISName(key):
    flat = utils.flatten(key)

    if schema.get(flat) != None:
        return schema.get(flat).get('name')

    # now try an clean the key
    return re.sub(r'(\.|\$)', '', key)

# enforce controlled vocab on spectra attributes
def enforce(spectra):
    set = {}
    remove = []

    # loop through all attributes in spactra
    for key, value in spectra.iteritems():
        # TODO: why?
        value = spectra[key]

        # ignore datapoints attribute or badness
        if key == 'datapoints' or value == '' or value == None:
            continue

        # create flat (lower case, no spaces) key, see if it's part of the EcoSIS schema
        flat = utils.flatten(key)
        if schema.get(flat) == None:
            continue

        item = schema.get(flat)

        # see if the schema is of type controlled and has a associated vocabulary
        if item['input'] != 'controlled' or item.get('vocabulary') == 'None':
            continue

        lower = value.lower().strip()
        found = False

        # check if the provided value is allowed
        for name in item.get('vocabulary'):
            if lower == name.lower():
                spectra[key] = name
                found = True
                break

        # if not allowed
        if not found:
            # if 'other' is allowed, append to other(s) array
            if item.get('allowOther') == True:
                other = "%s Other" % item.get("name")
                set[other] = value
                spectra[key] = 'Other'
            # otherwise remove
            else:
                remove.append(key)

    # the loop above is keeping track of additional items to add and remove, do that here
    for key, value in set.iteritems():
        spectra[key] = value

    for key in remove:
        del spectra[key]
