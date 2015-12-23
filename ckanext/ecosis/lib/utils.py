import urllib2, json, datetime
import ckan.lib.helpers as h
from ckan.common import response

# replicating default param parsing in ckan... really python... really...
# TODO: see if this is really needed
def get_request_data(request):
    try:
        keys = request.POST.keys()
        # Parsing breaks if there is a = in the value, so for now
        # we will check if the data is actually all in a single key
        if keys and request.POST[keys[0]] in [u'1', u'']:
            request_data = keys[0]
        else:
            request_data = urllib2.unquote(request.body)
    except Exception, inst:
        msg = "Could not find the POST data: %r : %s" % \
              (request.POST, inst)
        raise ValueError(msg)

    try:
        request_data = h.json.loads(request_data, encoding='utf8')
    except ValueError, e:
        raise ValueError('Error decoding JSON data. '
                         'Error: %r '
                         'JSON data extracted from the request: %r' %
                          (e, request_data))
    return request_data

def handleError(e):
    response.headers["Content-Type"] = "application/json"

    if hasattr(e, 'message'):
        if e.message is not None:
            return json.dumps({
                "error": True,
                "message": "%s:%s" % (type(e).__name__, e.message)
            })
    if hasattr(e, 'error_summary'):
        if e.error_summary is not None:
            return json.dumps({
                "error": True,
                "message": "%s:%s" % (type(e).__name__, e.error_summary)
            })

    return json.dumps({
        "error": True,
        "message": "%s:%s" % (type(e).__name__, str(e))
    })

def jsonStringify(obj, formatted=False):
    if not formatted:
        return json.dumps(obj, default=jsondefault)
    return json.dumps(obj, default=jsondefault, indent=4, separators=(',', ': '))

def jsondefault(obj):
    if isinstance(obj, datetime.datetime) or isinstance(obj, datetime.date):
        return obj.isoformat()
    else:
        return None