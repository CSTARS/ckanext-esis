import re
from ..vocab import controlled as controlledVocabulary

def getFileExtension(filename):
     return re.sub(r".*\.", "", filename)

def getLayout(sheetConfig):
    layout = 'row' # default

    if 'layout' in sheetConfig:
        layout = sheetConfig['layout']

    return layout

def getDataRanges(data):
    ranges = []
    r = {
        "start" : 0,
        "stop" : 0
    }
    started = False

    i = 0
    for i in range(0, len(data)):
        if _isEmptyRow(data[i]):
            if started:
                r['stop'] = i
                ranges.append(r)
                started = False
                if len(ranges) == 2:
                    break
                else:
                    r = {"start":0, "stop":0}
            continue

        if not started:
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

    type = "metadata"
    if re.match(r"^-?\d+\.?\d*", name) or re.match(r"^-?\d*\.\d+", name):
        type = "data"
        name = re.sub(r"\.0+$", "", name)

    name = controlledVocabulary.getEcoSISName(name)

    attr = {
        "type" : type,
        "name" : name,
        "pos" : "%s-%s" % (pos[0], pos[1])
    }

    if units != None:
        attr["units"] = units

    if original != name:
        attr["originalName"] = original

    return attr