import package as ckanPackageQuery
import resource as ckanResourceQuery


def init(pgConn):
    ckanPackageQuery.init(pgConn)
    ckanResourceQuery.init(pgConn)