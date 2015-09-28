import json

import ckan.logic as logic
from ckan.lib.base import c, model


def updatePackageUnits(ckanPackage, attributes):
        # save the package unit state
        units = {};
        for name, info in attributes.iteritems():
            if info.get('units') == None:
                continue
            units[name] = info.get('units')

        extras = ckanPackage.get('extras')
        set = False
        for item in extras:
            if item.get('key') == 'package_units':
                item['value'] = json.dumps(units)
                set = True
                break
        if not set:
            extras.append({
                "key" : "package_units",
                "value" : json.dumps(units)
            })

        if ckanPackage.get('resources') == None:
            print "BADNESS! in units.py.  trying to save package with no resources :("
            return

        context = {'model': model, 'user': c.user}
        logic.get_action('package_update')(context, ckanPackage)

def getAllAttributes(resources):
    attrs = {}

    for resource in resources:
        datasheets = []
        for datasheet in resource['datasheets']:

            if 'attributes' in datasheet and datasheet.get('ignore') != True:
                for attr in datasheet['attributes']:

                    if not attr['name'] in attrs and attr['type'] != 'wavelength':
                        respAttr = {
                            "original" : attr.get('original'),
                            "type" : attr["type"],
                            "scope" : attr["scope"],
                            "units" : attr.get("units")
                        }

                        attrs[attr['name']] = respAttr
    return attrs