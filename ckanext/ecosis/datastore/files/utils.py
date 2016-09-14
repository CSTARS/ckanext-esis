import re
from ..vocab import controlled as controlledVocabulary

'''
Utilities for the process module
'''

# grab extension for a file
# TODO: make lower case
def getFileExtension(filename):
     return re.sub(r".*\.", "", filename)

# given a sheet config, get the correct layout
def getLayout(sheetConfig):
    layout = 'row' # default

    if 'layout' in sheetConfig:
        layout = sheetConfig['layout']
    else: # set default for saving
        sheetConfig['layout'] = 'row'

    return layout

# walk of data[][] and discover data ranges
# this will find the first two tables of data
def getDataRanges(data):
    ranges = []
    r = {
        "start" : 0,
        "stop" : 0
    }
    started = False
    couldBeGlobal = False

    i = 0
    for i in range(0, len(data)):
        if _isEmptyRow(data[i]):
            if started:
                r['stop'] = i-1
                ranges.append(r)
                started = False
                if len(ranges) == 2:
                    break
                else:
                    r = {"start":0, "stop":0}
            continue

        elif couldBeGlobal and len(data[i]) != 2:
            r['stop'] = i-1
            ranges.append(r)
            started = False
            couldBeGlobal = False
            if len(ranges) == 2:
                break
            else:
                r = {"start":0, "stop":0}

        if not started:
            # if we are on the first range and there are two columns
            # we may be looking at global data
            if len(data[i]) == 2 and len(ranges) == 0:
                couldBeGlobal = True
            r['start'] = i
            started = True

    if started and len(ranges) < 2:
        r['stop'] = i
        ranges.append(r)
    elif not started and len(ranges) == 0:
        ranges.append(r)

    return ranges

# is a row array empty
def _isEmptyRow(row):
    if len(row) == 0:
        return True

    for i in range(0, len(row)):
        if row[i] != "" and row[i] != None:
            return False

    return True

# parse out the attribute information from the attribute information
# TODO: check for units and attribute data type
def parseAttrType(name, pos):
    original = name
    units = None

    # clean up string
    name = name.strip()

    # parse out units
    if re.match(r".*\(.*\)\s*$", name):
        units = re.sub(r".*\(","", name)
        units = re.sub(r"\)\s*","", units)
        name = re.sub(r"\(.*", "", name).strip()

    type = "metadata" # default type

    # if attribute name is actually a number, assum its a wavelength
    if re.match(r"^-?\d+\.?\d*", name) or re.match(r"^-?\d*\.\d+", name):
        type = "wavelength"
        name = re.sub(r"\.0+$", "", name)
    # otherwise lookup and see if we 'flatten' (lower case, no spaces) name, does it match
    # a EcoSIS defined schema name.  If so, set as 'pretty' schema name
    else:
        name = controlledVocabulary.getEcoSISName(name)

    # clean up name for Mongo
    if type == "metadata":
        name = re.sub(r'[\.\$]', '', name)
    else:
        name = re.sub(r'\$', '', name)
        name = re.sub(r'\.', ',', name)

    attr = {
        "type" : type,
        "name" : name,
        "pos" : "%s-%s" % (pos[0], pos[1])
    }

    # if units were found, store them
    if units != None:
        attr["units"] = units

    # if the name was changed, store the name that was given to us as well
    if original != name:
        attr["originalName"] = original

    return attr