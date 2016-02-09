# mongo driver hacks
# TODO: this needs to go away when the driver sucks less


def count(collection, query):
    try:
        return collection.count(query)
    except:
        return collection.find(query).count()

def distinct(collection, key, query):
    try:
        return collection.distinct(key, query)
    except:
        return collection.find(query).distinct(key)
