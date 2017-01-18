import psycopg2, json, re
from ckanext.ecosis.datastore.ckan.package import getPgConn
from ckanext.ecosis.datastore import getCollections

# append the aliases to the search results
def run():
    conn = getPgConn()

    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(("select name, p.id, pe.value as aliases from package p join package_extra pe on "
                "p.id = pe.package_id where pe.key = 'aliases' and pe.state = 'active'"))
    packages = cur.fetchall()
    cur.close()

    collection = getCollections().get('search_package')

    for pkg in packages:
        aliases = json.loads(pkg.get('aliases'))
        pkg['result'] = collection.update(
            {'_id': pkg.get('id')},
            {
                '$set' : {
                    'value.ecosis.spectra_metadata_schema.aliases' : aliases
                 }
            }
        )

    return packages

# Fix unit bug
def fixUnits():
    conn = getPgConn()

    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(("select id from package"))
    packages = cur.fetchall()
    cur.close()

    collection = getCollections().get('resource')
    searchCollection = getCollections().get('search_package')

    for pkg in packages:
        query = {
            "packageId" : pkg.get('id')
        }

        # query workspace resources for package
        sheets = collection.find(query,{
            "localRange" : 0,
            "hash" : 0,
            "file" : 0,
            "_id" : 0
        })

        units = {}

        # loop through all sheets, all attributes
        for sheet in sheets:
            if sheet.get('attributes') is not None:
                for attr in sheet.get('attributes'):
                    if attr.get("units") is not None and attr.get("units") != "":
                        units[attr.get("name")] = attr.get("units")

        pkg['result'] = searchCollection.update(
            {'_id': pkg.get('id')},
            {
                '$set' : {
                    'value.ecosis.spectra_metadata_schema.units' : units
                 }
            }
        )

    return packages

def fixCitationText():
    conn = getPgConn()

    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(("select * from package_extra where key = 'Citation';"))
    rows = cur.fetchall()
    cur.close()

    pgCount = 0
    for row in rows:
        citation = re.sub(r'Ecosystem', 'Ecological', row.get('value'), flags=re.I)

        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(("update package_extra set value = '%s' where id = '%s';" % (citation, row.get('id'))))
        conn.commit()
        cur.close()

        pgCount += 1

    mongoCount = 0
    searchCollection = getCollections().get('search_package')
    results = searchCollection.find({'value.Citation':{'$exists': True}}, {'value.Citation':1})
    for item in results:
        citation = re.sub(r'Ecosystem', 'Ecological', item.get('value').get('Citation')[0], flags=re.I)

        searchCollection.update(
            {'_id': item.get('_id')},
            {
                '$set' : {
                    'value.Citation' : [citation]
                }
            }
        )

        mongoCount += 1

    return {
        'success' : True,
        'stats' : {
            'MongoUpdates' : mongoCount,
            'PGUpdates' : pgCount
        }
    }
