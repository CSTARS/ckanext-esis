import json, re, os, utils

schema = None

def init(schemaDef):
    global schema

    schema = schemaDef

def getEcoSISName(self, key):
    flat = utils.flatten(key)

    if schema.get(flat) != None:
        return schema.get(flat).get('name')

    # now try an clean the key
    return re.sub(r'(\.|\$)', '', key)

def enforce(spectra):
    set = {}
    remove = []

    for key, value in spectra.iteritems():
        value = spectra[key]

        if key == 'datapoints' or value == '' or value == None:
            continue

        flat = utils.flatten(key)
        if schema.get(flat) == None:
            continue

        item = schema.get(flat)
        if item['input'] != 'controlled' or item.get('vocabulary') == 'None':
            continue

        lower = value.lower().strip()
        found = False
        for name in item.get('vocabulary'):
            if lower == name.lower():
                spectra[key] = name
                found = True
                break

        if not found:
            if item.get('allowOther') == True:
                other = "%s Other" % item.get("name")
                set[other] = value
                spectra[key] = 'Other'
            else:
                remove.append(key)

    for key, value in set.iteritems():
        spectra[key] = value

    for key in remove:
        del spectra[key]
