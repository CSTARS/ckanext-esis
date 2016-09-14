import re
gcmdCollection = None

# inject global dependencies
def init(collections):
    global gcmdCollection
    gcmdCollection = collections.get('gcmd')

# find gcmd keywords based on given query
def suggest(query):
    # split on comma's
    query = re.split(',|\s', query)
    # clean up query
    query = map(unicode.strip, query)

    # create regex for each string
    arr = []
    for q in query:
        regx = re.compile("%s" % q)
        arr.append({'keywords': regx})

    # run query
    results = []
    match = gcmdCollection.find({'$and': arr}).limit(20)
    if match is None:
        match = []
    else:
        for doc in match:
            results.append(doc)

    return results