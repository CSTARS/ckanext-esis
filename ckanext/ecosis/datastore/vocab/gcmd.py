import re, copy
gcmdCollection = None

def init(collections):
    global gcmdCollection
    gcmdCollection = collections.get('gcmd')

def suggest(query):
    query = query.split(",")
    query = map(unicode.strip, query)

    arr = []
    for q in query:
        regx = re.compile("%s" % q)
        arr.append({'keywords': regx})

    results = []
    match = gcmdCollection.find({'$and': arr}).limit(20)
    if match is None:
        match = []
    else:
        for doc in match:
            results.append(doc)

    return results