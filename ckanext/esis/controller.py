import logging
import re, zlib, StringIO
#import simplejson as json
import ujson as json
from pymongo import MongoClient
from pylons import config

import ckan.lib.munge as munge

from ckan.lib.base import c, model, BaseController
import ckan.logic as logic
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
        return self.stringify_json(infoCollection.find({},{'package_id':1}))

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

        return self.stringify_json({'success':True})

    def addData(self):
        data = self.parse_json(request.params.get('data'))

        if 'package_id' not in data:
            return self.stringify_json({'error':True, 'message':'No package_id provided'})

        # check package has item in info collection
        if infoCollection.find_one({'package_id': data['package_id']}) == None:
             return self.stringify_json({'error':True, 'message':'No package spectra found'})

        # get current spectra for possible merge
        currentData = dataCollection.find({'package_id': data['package_id']})
        if currentData == None:
            currentData = []

        for item in data['spectra']:
            self._merge_and_insert(item, currentData)

        return self.stringify_json({'success':True})

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
        id = request.params.get('id')

        context = {'model': model, 'user': c.user}
        resp = logic.get_action('package_delete')(context, {'id': id})

        if resp.success:
            dataCollection.remove({'package_id':id})
            infoCollection.remove({'package_id':id})

        return resp

    def deleteResource(self):
        id = request.params.get('id')

        context = {'model': model, 'user': c.user}
        resp = logic.get_action('resource_delete')(context, {'id': id})

        if resp.success:
            dataCollection.remove({'resource_id':id})

        return resp


    def get(self):
        id = request.params.get('id')
        metadataOnly = request.params.get('metadataOnly')

        dataset = infoCollection.find_one({'package_id':id}, {'_id':0})

        cur = ''
        dataset['data'] = []
        if metadataOnly == 'true':
            cur = dataCollection.find({'package_id':id}, {'spectra':0,'_id':0})
        else:
            cur = dataCollection.find({'package_id':id})

        for item in cur:
            dataset['data'].append(item)

        dataset = self.stringify_json(dataset)

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


def sub_parse_json(q, jsonstr):
        t = json.loads(jsonstr)
        q.put(t)

def sub_stringify_json(q, jsonobj):
        q.put(json.dumps(jsonobj))