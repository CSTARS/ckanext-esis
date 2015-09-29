from ckan.common import request, response

import ecosis.datastore.query as query

def get():
    response.headers["Content-Type"] = "application/json"

    package_id = request.params.get('package_id')
    resource_id = request.params.get('resource_id')
    sheet_id = request.params.get('sheet_id')
    index = int(request.params.get('index'))

    return query.get(package_id, resource_id, sheet_id, index)
