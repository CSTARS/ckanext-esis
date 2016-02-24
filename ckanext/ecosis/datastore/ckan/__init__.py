import package as ckanPackageQuery
import resource as ckanResourceQuery


def init(pgConn, schema):
    ckanPackageQuery.init(pgConn, schema)
    ckanResourceQuery.init(pgConn)