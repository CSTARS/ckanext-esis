import psycopg2.extras

conn = None

def init(pgConn):
    global conn

    conn = pgConn

def get(resource_id):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("select * from resource where id = %s", (resource_id,))
    resource = cur.fetchall()

    if len(resource) == 0:
        raise Exception('Invalid resource ID')
    else:
        resource = resource[0]

    return resource