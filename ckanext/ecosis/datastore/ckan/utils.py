
# mostly for debug
# was having issue with dropped db connection
def verifyConnection(conn):
    print "Connect status:%s, closed:%s" % (conn.status, conn.closed)

    if conn.closed != 0:
        print "Postgres connection is CLOSED, reseting..."
        conn.reset()
        return
    print "Postgres connection is OPEN"