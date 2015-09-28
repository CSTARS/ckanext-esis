import urllib2, json
import ckan.lib.helpers as h

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
            request_data = urllib2.unquote_plus(request.body)
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
    json.dumps({
        "error": True,
        "message": str(e)
    })