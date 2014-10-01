import logging
import re, zlib, StringIO
#import simplejson as json
import ujson as json
from pymongo import MongoClient
from pylons import config
import urllib2
import dateutil.parser


from ckan.lib.base import c, model, BaseController
import ckan.logic as logic
import ckan.lib.helpers as h
from ckan.common import request, response
import ckan.lib.uploader as uploader

from ckan.controllers.package import PackageController
from multiprocessing import Process, Queue


log = logging.getLogger(__name__)

# setup mongo connection
client = MongoClient(config._process_configs[1]['esis.mongo.url'])
db = client[config._process_configs[1]['esis.mongo.db']]
spectraCollection = db[config._process_configs[1]['esis.mongo.spectra_collection']]
packageCollection = db[config._process_configs[1]['esis.mongo.package_collection']]
metadataCollection = db[config._process_configs[1]['esis.mongo.metadata_collection']]


class SpectraController(PackageController):

    # Takes an array of spectra and adds to mongo spectra collection
    def add(self):
        datapoints = self.parse_json(request.params.get('datapoints'))

        inserted = 0
        ignored = 0

        # how do we want to display this back to user?
        for point in datapoints:
            if 'package_id' or 'resource_id' not in point['ecosis']:
                ignored += 1
                continue

            spectraCollection.insert(point)
            inserted += 1

        return json.dumps({
            'success': True,
            'ignored': ignored,
            'inserted': inserted
        })

    def addUpdatePackage(self):
        packageData = self.parse_json(request.params.get('package'))

        metadata = []
        isUpdate = False

        # is this an update?
        pkg = packageCollection.find_one({'package_id': packageData['package_id']})
        if pkg != None:
            isUpdate = True
            packageData['_id'] = pkg['_id']

        # pull out metadata for insert if there is any
        if 'metadata' in packageData:
            metadata = packageData['metadata']
            del packageData['metadata'] # remove from packageData document

            for item in metadata:
                metadataCollection.insert(item)

        # now transpose existing data
        if isUpdate:
            # create an inverse map of the attribute name mapping
            map = {}
            for key, value in packageData['attributes']['map']:
                map[value] = key

            cur = spectraCollection.find({'ecosis.package_id': packageData['package_id']})
            for spectra in cur:
                self._rejoin_metadata(spectra, metadata, packageData['attributes'])
                self._transpose_attributes_by_type(spectra, packageData['attributes'])
                self._map_attribute_names(spectra, map)
                self._set_sort(spectra, packageData['dataset'])

                spectraCollection.update(spectra)

        # now update or insert
        if isUpdate:
            packageData.update(packageData)
        else:
            packageData.insert(packageData)

    def deletePackage(self):
        params = self._get_request_data(request)

        context = {'model': model, 'user': c.user}
        logic.get_action('package_delete')(context, params)

        spectraCollection.remove({'ecosis.package_id':params['id']})
        packageCollection.remove({'package_id':params['id']})
        metadataCollection.remove({'package_id': params['id']})

        return json.dumps({'success': True})

    # first we need to look up if this resource is a metadata resource
    # if it is, this complicates things, otherwise just pull from
    # spectra collection and then do normal delete
    def deleteResource(self):
        id = request.params.get('id')

        context = {'model': model, 'user': c.user}
        logic.get_action('resource_delete')(context, {'id': id})

        metadata = metadataCollection.find_one({'resource_id': id})
        if metadata != None:
            pkg = packageCollection.find_one({'package_id': metadata['package_id']})

            metadataCollection.remove({'resource_id': id})

            metadata = self._get_metadata_for_package(pkg['id'])

            cur = spectraCollection.find({'ecosis.package_id': pkg['package_id']})
            for spectra in cur:
                self._rejoin_metadata(spectra, metadata, pkg['attributes'])
                spectraCollection.update(spectra)

    # if we have a sort variable, it should be in the metadata and datapoints locations
    # in a spectra.  It should also be set in spectra.ecosis.sort namespace
    def _set_sort(self, spectra, datasetAttrs):
        if 'sort_on' not in datasetAttrs:
            return
        if datasetAttrs['sort_on'] == None or datasetAttrs['sort_on'] == '':
            return

        # find the sort attribute in the data points
        pt = None
        for point in spectra['datapoints']:
            if datasetAttrs['sort_on'] == point['key']:
                pt = point
                break

        # if the sort attribute is not found in the points
        if pt == None:
            # and not found in the metadata, just return
            if datasetAttrs['sort_on'] not in spectra:
                return
            # else add to points
            else:
                spectra['datapoints'].append({
                    'key' : datasetAttrs['sort_on'],
                    'value' : spectra[datasetAttrs['sort_on']]
                })
        # if the sort attribute is found in points and not in metadata
        elif datasetAttrs['sort_on'] not in spectra:
            spectra[datasetAttrs['sort_on']] = pt['value']

        # now set the sort variable, if it is date or numberic attempt to parse
        # if we fail, just set to null
        val = spectra[datasetAttrs['sort_on']]
        if 'sort_type' in datasetAttrs:
            try:
                if datasetAttrs['sort_type'] == 'datetime':
                    spectra['ecosis']['sort'] = dateutil.parser.parse(val)
                elif datasetAttrs['sort_type'] == 'numberic':
                    spectra['ecosis']['sort'] = float(val)
                else:
                    spectra['ecosis']['sort'] = val
            except:
                spectra['ecosis']['sort'] = None

    # make sure all mapped names are set
    def _map_attribute_name(self, spectra, map):
        for key in map:
            if key not in spectra and map[key] in spectra:
                spectra[key] = spectra[map[key]]

    # make sure data attributes are in the datapoints set and that
    # metadata is a first class citizen
    def _transpose_attributes_by_type(self, spectra, attributeInfo):
        map = {}
        if 'modifications' in attributeInfo:
            map = attributeInfo['modifications']

        for key, typeInfo in attributeInfo['types'].iteritems():
            # did the user override the type schema?
            type = typeInfo['type']
            if key in map:
                type = map[key]

            # take appropriate action
            if type == 'data':
                self._make_datapoint(key, spectra)
            if type == 'metadata':
                self._make_metadata(key, spectra)

    def _make_metadata(self, key, spectra):
        pt = None
        for point in spectra['datapoints']:
            if point['key'] == key:
                pt = point
                spectra['datapoints'].remove(point)
                break

        spectra[key] = pt['value']

    def _make_datapoint(self, key, spectra):
        found = False
        for point in spectra['datapoints']:
            if point['key'] == key:
                found = True
                break

        if not found and spectra[key] != None:
            spectra['datapoints'].push({
                'key' : key,
                'value' : spectra[key]
            })

        if spectra[key] != None:
            del spectra[key]

    # this will remove all attributes that have been joined into the spectra
    # then will rejoin with all metadata in the given list
    def _rejoin_metadata(self, spectra, metadataList, attributeInfo):
        # for the join below, it will be nice to have an inverse dic of
        # the attribute map
        map = {}
        for key, value in attributeInfo['map'].iteritems():
            map[value] = key

        # remove all attributes of type join
        for attr, typeInfo in attributeInfo['types'].iteritems():
            if typeInfo['flag'] != 1:
                continue

            self._remove_attribute(spectra, attr)

            mappedName = attributeInfo['map'][attr]
            if mappedName != None:
                self._remove_attribute(spectra, attr, map)

        # now rejoin all data
        for metadata in metadataList:
            for col in metadata['metadata']:
                if self._is_join_match(spectra, metadata, col):
                    self._join(spectra, col, map)
                    break

    # join a metadata column to a spectra
    def _join(self, spectra, col, map):
        for key, value in col.iteritems():
            spectra[key] = value
            if key in map:
                spectra[map[key]] = value

    # see if a metadata column is a match on a spectra
    def _is_join_match(self, spectra, metadata, col):
        val = col[metadata['join_id']]

        if metadata['worksheetMatch'] or metadata['filenameMatch']:
            name = spectra['ecosis']['filename'] if metadata['filenameMatch'] else spectra['ecosis']['worksheet']

            # if the value doesn't have a period, assume we want to strip any extension on a filename match
            if val.find('.') == -1 and metadata['filenameMatch']:
                name = re.sub(r'\..*', '', name)

            # this can match too much
            if metadata['exactMatch'] and name.find(val) > -1:
                return True
            if val == name:
                return True

        else:
            if spectra[metadata['join_id']] == val:
                return True
            if spectra['custom'] != None:
                if spectra['custom'][metadata['join_id']] == val:
                    return True

        return False

    # remove an attribute from spectra
    def _remove_attribute(self, spectra, attr, map):
        if attr in spectra:
            del spectra[attr]

        if attr in map:
            del spectra[map[attr]]




    # Mongo Helpers
    def _get_metadata_for_package(self, id):
        metadata = []
        cur = metadataCollection.find({'package_id': id})
        for m in cur:
            metadata.append(m)
        return metadata


    def all(self):
        list = []
        cur = packageCollection.find({},{'package_id':1,'_id':0})
        for item in cur:
            list.append(item['package_id'])

        return json.dumps(list)

    def addInfo(self):
        info = request.params.get('info')
        info = self.parse_json(info)
        if 'package_id' not in info:
            return self.stringify_json({'error':True, 'message':'No package_id provided'})

        cInfo = packageCollection.find_one({'package_id':info['package_id']})
        if cInfo != None:
            info['_id'] = cInfo['_id']

        if '_id' in info:
            packageCollection.update({'_id':info['_id']}, info)
        else:
            packageCollection.insert(info)

        return json.dumps({'success':True})

    def addData(self):
        data = self.parse_json(request.params.get('data'))

        if 'package_id' not in data:
            return self.stringify_json({'error':True, 'message':'No package_id provided'})

        # check package has item in info collection
        if packageCollection.find_one({'package_id': data['package_id']}) == None:
             return self.stringify_json({'error':True, 'message':'No package spectra found'})

        # get current spectra for possible merge
        currentData = []
        cur = spectraCollection.find({'package_id': data['package_id']})
        for item in cur:
            currentData.append(item)

        for item in data['spectra']:
            self._merge_and_insert(item, currentData)

        return json.dumps({'success':True})

    def _merge_and_insert(self, item, currentData):
        for cItem in currentData:
            if cItem['spectra_id'] == item['spectra_id']:
                item['spectra'] = cItem['spectra']
                item['_id'] = cItem['_id']
                break

        if '_id' in item:
            spectraCollection.update({'_id':item['_id']}, item)
        else:
            spectraCollection.insert(item)



    def deleteResource(self):
        params = self._get_request_data(request)

        context = {'model': model, 'user': c.user}
        logic.get_action('resource_delete')(context, params)

        spectraCollection.remove({'resource_id':params['id']})

        return json.dumps({'success': True})

    # replicating default param parsing in ckan... really python... really...
    def _get_request_data(self, request):
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


    def getUSDACommonName(self):
        response.headers["Content-Type"] = "application/json"
        code = request.params.get('code')
        try:
            resp = urllib2.urlopen('http://plants.usda.gov/java/AdvancedSearchServlet?symbol=%s&dsp_vernacular=on&dsp_category=on&dsp_genus=on&dsp_family=on&Synonyms=all&viewby=sciname&download=on' % code)
        except:
            return json.dumps({'error': True})
        return json.dumps({'body': resp.read(), 'code': code})


    def get(self):
        id = request.params.get('id')
        metadataOnly = request.params.get('metadataOnly')

        # now add some package information
        context = {'model': model, 'user': c.user}
        pkg = logic.get_action('package_show')(context, {'id': id})

        dataset = self._sub_get(pkg, id, metadataOnly)

        response.headers["Content-Type"] = "application/json"
        response.headers["Content-Length"] = "%s" % len(dataset)

        return dataset

    def createPackageRedirect(self):
        response.status_int = 307
        response.headers["Location"] = "/editor/"
        return "Redirecting"

    def editPackageRedirect(self, id):
        response.status_int = 307
        response.headers["Location"] = "/editor/?id=%s" % id.encode('ascii','ignore')
        return "Redirecting"

    def parse_json(self, jsonstr):
        q = Queue()
        p = Process(target=sub_parse_json, args=(q, jsonstr,))
        p.start()
        json = q.get()
        p.join()
        p.terminate()
        return json

    def stringify_json(self, json):
        q = Queue()
        p = Process(target=sub_stringify_json, args=(q, json,))
        p.start()
        jsonstr = q.get()
        p.join()
        p.terminate()
        return jsonstr

    def _sub_get(self, pkg, id, metadataOnly):
        q = Queue()
        p = Process(target=sub_get, args=(q, pkg, id, metadataOnly,))
        p.start()
        jsonstr = q.get()
        p.join()
        p.terminate()
        return jsonstr



def sub_parse_json(q, jsonstr):
        t = json.loads(jsonstr)
        q.put(t)

def sub_stringify_json(q, jsonobj):
        q.put(json.dumps(jsonobj))

def sub_get(q, pkg, id, metadataOnly):
        dataset = {}
        try:
            dataset = packageCollection.find_one({'package_id':id}, {'_id':0})

            cur = ''
            dataset['data'] = []
            if metadataOnly == 'true':
                cur = spectraCollection.find({'package_id':id}, {'spectra':0,'_id':0})
            else:
                cur = spectraCollection.find({'package_id':id},{'_id':0})

            for item in cur:
                dataset['data'].append(item)

            dataset['package_name'] = pkg.get('name')
            dataset['package_title'] = pkg.get('title')
            dataset['package_id'] = pkg.get('id')
            dataset['groups'] = pkg.get('groups')
        except Exception as e:
            print e

        q.put(json.dumps(dataset))