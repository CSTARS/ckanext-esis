import logging
import re, zlib, StringIO
#import simplejson as json
import ujson as json
from pymongo import MongoClient
from pylons import config
import urllib2


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
dataCollection = db[config._process_configs[1]['esis.mongo.data_collection']]
infoCollection = db[config._process_configs[1]['esis.mongo.info_collection']]


class SpectraController(PackageController):

    def all(self):
        list = []
        cur = infoCollection.find({},{'package_id':1,'_id':0})
        for item in cur:
            list.append(item['package_id'])

        return json.dumps(list)

    def addInfo(self):
        info = request.params.get('info')
        info = self.parse_json(info)
        if 'package_id' not in info:
            return self.stringify_json({'error':True, 'message':'No package_id provided'})

        cInfo = infoCollection.find_one({'package_id':info['package_id']})
        if cInfo != None:
            info['_id'] = cInfo['_id']

        if '_id' in info:
            infoCollection.update({'_id':info['_id']}, info)
        else:
            infoCollection.insert(info)

        return json.dumps({'success':True})

    def addData(self):
        data = self.parse_json(request.params.get('data'))

        if 'package_id' not in data:
            return self.stringify_json({'error':True, 'message':'No package_id provided'})

        # check package has item in info collection
        if infoCollection.find_one({'package_id': data['package_id']}) == None:
             return self.stringify_json({'error':True, 'message':'No package spectra found'})

        # get current spectra for possible merge
        currentData = []
        cur = dataCollection.find({'package_id': data['package_id']})
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
            dataCollection.update({'_id':item['_id']}, item)
        else:
            dataCollection.insert(item)

    def deletePackage(self):
        params = self._get_request_data(request)

        context = {'model': model, 'user': c.user}
        logic.get_action('package_delete')(context, params)

        dataCollection.remove({'package_id':params['id']})
        infoCollection.remove({'package_id':params['id']})

        return json.dumps({'success': True})

    def deleteResource(self):
        params = self._get_request_data(request)

        context = {'model': model, 'user': c.user}
        logic.get_action('resource_delete')(context, params)

        dataCollection.remove({'resource_id':params['id']})

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
            dataset = infoCollection.find_one({'package_id':id}, {'_id':0})

            cur = ''
            dataset['data'] = []
            if metadataOnly == 'true':
                cur = dataCollection.find({'package_id':id}, {'spectra':0,'_id':0})
            else:
                cur = dataCollection.find({'package_id':id},{'_id':0})

            for item in cur:
                dataset['data'].append(item)

            dataset['package_name'] = pkg.get('name')
            dataset['package_title'] = pkg.get('title')
            dataset['package_id'] = pkg.get('id')
            dataset['groups'] = pkg.get('groups')
        except Exception as e:
            print e

        q.put(json.dumps(dataset))