import psycopg2.extras

conn = None

def init(pgConn):
    global conn
    conn = pgConn

def get(package_id):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("select * from package where id = %s", (package_id,))
    package = cur.fetchall()

    if len(package) == 0:
        raise Exception('Invalid package ID')
    else:
        package = package[0]

    package['extras'] = {}

    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("select * from package_extra where package_id = %s", (package_id,))
    rows = cur.fetchall()
    for row in rows:
        package['extras'][row['key']] = row['value']

    return package