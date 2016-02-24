import psycopg2.extras

connStr = None
schema = None

def init(pgConn, s):
    global connStr, schema
    connStr = pgConn
    schema = s

def getSchema():
    return schema

def get(package_id):
    conn = psycopg2.connect(connStr)

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

    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("select * from package_extra where package_id = %s and state != 'deleted'", (package_id,))
    rows = cur.fetchall()
    for row in rows:
        package['extras'][row['key']] = row['value']
    cur.close()

    # org
    ownerOrg = package.get('owner_org')
    if ownerOrg != None and ownerOrg != "":
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("select * from public.group where id = %s", (ownerOrg,))
        rows = cur.fetchall()
        cur.close()

        if len(rows) > 0:
            package['organization'] = rows[0]

    # tags
    package['tags'] = []
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("select t.name from tag t, package_tag pt where t.id = pt.tag_id and pt.package_id = %s and pt.state = 'active'", (package_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    for row in rows:
        package['tags'].append(row.get('name'))

    return package