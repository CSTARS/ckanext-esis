import re, copy
topCollection = None

# MongoDB query projection
projection = {
    'definition' : 1,
    '_id' : 0,
    'prefUnit' : 1,
    'label' : 1,
    'alternativeLabel' : 1,
    'relatedTerm' : 1,
    'preferredLabel' : 1,
    'relatedMatch' : 1,
    'broaderTransitive' : 1,
    'subClassOf' : 1,
    'id' : 1,
}
searchProjection = copy.copy(projection)
searchProjection['score'] = {
    '$meta': "textScore"
}

# inject global dependencies
def init(collections):
    global topCollection

    topCollection = collections.get('top')

# get list of suggested top names
def overview(list):
    result = {}

    for name in list:
        regx = re.compile("^%s$" % name, re.IGNORECASE)

        match = topCollection.find_one({'preferredLabel': regx}, {'preferredLabel': 1})
        if match is not None:
            result[name] = {
                'match' : match,
                'type' : 'match'
            }
            continue

        match = topCollection.find_one(
            {
                '$or' : [
                    {'alternativeLabel' : regx},
                    {'abbreviation': regx},
                    {'relatedTerm': regx}
                ]
            },
            projection
        )

        if match is not None:
            result[name] = {
                'match' : match,
                'type' : 'related'
            }
            continue

        count = topCollection.find(
            {
                '$text': {
                    '$search' : name
                },
            },
            {'_id':1}
        ).count()

        if count > 0:
            result[name] = {
                'type' : 'textMatch'
            }
            continue

        result[name] = {
            'type' : 'nomatch'
        }

    return result

def suggest(name):
    result = []
    regx = re.compile("^%s$" % name, re.IGNORECASE)

    match = topCollection.find_one({'preferredLabel': regx}, projection)
    if match is not None:
        return {
            'type' : 'match',
            'result' : [match]
        }

    cur = topCollection.find(
        {
            '$or' : [
                {'alternativeLabel' : regx},
                {'abbreviation': regx},
                {'relatedTerm': regx}
            ]
        },
        projection
    )
    for doc in cur:
        result.append(doc)

    if len(result) > 0:
        return {
            'type' : 'related',
            'result' : result
        }

    cur = topCollection.find(
        {
            '$text': {
                '$search' : name
            },
        },
        searchProjection
    ).sort( [('score', { '$meta': "textScore" })] ).limit(30)


    for doc in cur:
        result.append(doc)

    return {
        'type' : 'textMatch',
        'result' : result
    }