import psycopg2, json
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