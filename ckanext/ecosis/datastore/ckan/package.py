import psycopg2.extras, json

connStr = None
schema = None

# inject global dependencies
def init(pgConn, s):
    global connStr, schema
    connStr = pgConn
    schema = s

# helper for returning EcoSIS attribute schema
def getSchema():
    return schema

def getPgConn():
    return psycopg2.connect(connStr)

# get a dataset by id
def get(package_id):
    conn = psycopg2.connect(connStr)

    # query pg for dataset
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("select * from package where id = %s", (package_id,))
    package = cur.fetchall()
    cur.close()

    if len(package) == 0:
        raise Exception('Invalid package ID')
    else:
        package = package[0]

    # extras
    package['extras'] = {}

    # grab all extra fields where status is not deleted
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("select * from package_extra where package_id = %s and state != 'deleted'", (package_id,))
    rows = cur.fetchall()
    for row in rows:
        package['extras'][row['key']] = row['value']
    cur.close()

    # append organization information
    ownerOrg = package.get('owner_org')
    if ownerOrg != None and ownerOrg != "":
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("select * from public.group where id = %s", (ownerOrg,))
        rows = cur.fetchall()
        cur.close()

        if len(rows) > 0:
            package['organization'] = rows[0]

    # append tag (keywords) information
    package['tags'] = []
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("select t.name from tag t, package_tag pt where t.id = pt.tag_id and pt.package_id = %s and pt.state = 'active'", (package_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    for row in rows:
        package['tags'].append(row.get('name'))

    return package

# query package by EcoSIS DOI status.  Uses pg-json functionality
# TODO: build index on doi status -> value field
def doiQuery(status="", query="", limit=10, offset=0):
    conn = psycopg2.connect(connStr)

    if status == "" or status is None:
        status = "Pending Approval"
    if query is None:
        query = ""
    if limit is None:
        limit = 10
    if offset is None:
        offset = 0

    query = "%%%s%%" % query.lower()

    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        ("select p.title as title, p.id, pe.value as status, pev.value as doi "
         "from package_extra pe join package p on pe.package_id = p.id "
         "left join package_extra pev on pev.package_id = p.id and pev.key = 'EcoSIS DOI' "
         "where pe.key = 'EcoSIS DOI Status' and pe.state != 'deleted' "
         "and pe.value::json->>'value' = %s and lower(p.title) like %s order by title limit %s offset %s;"),(status, query, limit, offset)
        )
    packages = cur.fetchall()
    cur.close()

    for package in packages:
        if package.get('status') is not None:
            package['status'] = json.loads(package['status'])

    return packages