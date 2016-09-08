import package as ckanPackageQuery
import resource as ckanResourceQuery

'''
This module clones so CKAN functionality, allow access of CKAN-like objects
w/o the requirement of authenticated HTTP requests.  This helps with seperation of concerns
'''

# inject global dependencies
def init(pgConn, schema):
    ckanPackageQuery.init(pgConn, schema)
    ckanResourceQuery.init(pgConn)