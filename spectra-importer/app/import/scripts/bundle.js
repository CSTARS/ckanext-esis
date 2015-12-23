(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Ecosis = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var EventEmitter = require("events").EventEmitter;
var Datastore = require('./datastore');
var CKAN = require('./ckan');


module.exports = function(config) {
  this.user = null;

  this.ckan = new CKAN({
    host : config.host
  });

  this.ds = new Datastore({
    ckan : this.ckan,
    package_id : config.package_id
  });

  // wire events
  var ee = new EventEmitter();
  this.on = function(e, fn) {
       ee.on(e, fn);
  };


  // get the user account
  this.ckan.getActiveUser(function(resp){
    if( resp.error ) {
      this.userLoadError = true;
    }


    this.user = resp;
    ee.emit('user-load');
  }.bind(this));

  if( config.package_id ) this.ds.load();

}

},{"./ckan":2,"./datastore":3,"events":8}],2:[function(require,module,exports){
var request = require('superagent');

// depends if we are running from nodejs or browser
var agent = request.agent ? request.agent() : request;
var isBrowser = request.agent ? false : true;

module.exports = function(config) {
  this.host = config.host || '/';

  this.prepareWorkspace = function(pkgid, callback) {
    get(this.host+'/ecosis/workspace/prepare?force=true&package_id='+pkgid, function(err, resp){
      callback(resp.body);
    });
  }

  this.getWorkspace = function(pkgid, callback) {
    get(this.host+'/ecosis/workspace/get?package_id='+pkgid, function(err, resp){
      callback(resp.body);
    });
  }

  this.getActiveUser = function(callback) {
    get(this.host+'/ecosis/user/get', function(err, resp) {
      callback(resp.body)
    });
  }

  /**
   * Add a resource to a package using the browsers FormData object in a browser
   * or user the superagent for NodeJS
   *
   * pkgid: id of the package to add to
   * file: object representing the to resource to upload or if NodeJS string path to file
   * callback: callback handler
   * progress: callback for progress update (not supported in NodeJS)
   **/
  this.addResource = function(pkgid, file, callback, progress) {
    if( isBrowser ) this._addResourceBrowser(pkgid, file, callback, progress);
    else this._addResourceNode(pkgid, file, callback);
  }

  // TODO: this needs to be verified :/
  this._addResourceNode = function(pkgid, file, callback) {
    request
     .post(this.host + '/api/3/action/resource_create')
     .withCredentials()
     .field('package_id', pkgid)
     .field('mimetype', file.mimetype)
     .field('name', file.filename)
     .field('url','upload')
     .attach('upload', file.mimetype)
     .end(callback);
  }

  this._addResourceBrowser = function(pkgid, file, callback, progress) {
    // TODO: if this fails, we have an issue on our hands
    var formData = new FormData();

    formData.append('package_id', pkgid);
    formData.append('mimetype', file.mimetype);
    formData.append('name', file.filename);
    formData.append('url', 'upload');
    formData.append('upload', new Blob([file.contents], {type: file.mimetype}), file.filename);

    var time = new Date().getTime();

    var xhr = $.ajaxSettings.xhr();
    // attach progress handler to the XMLHttpRequest Object
    try {
        if( progress ) {
            xhr.upload.addEventListener("progress", function(evt){
                if (evt.lengthComputable) {
                  var diff = new Date().getTime() - time;
                  var speed = (evt.loaded / 1000000) / (diff / 1000);

                    progress(((evt.loaded / evt.total)*100).toFixed(0), speed.toFixed(2)+'Mbps');
                }
            }, false);
        }
    } catch(e) {}

    $.ajax({
      url: this.host + '/api/3/action/resource_create',
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      xhrFields: {
        withCredentials: true
      },
      xhr : function() {
          return xhr;
      },
      success: callback,
      error : function() {
          callback({error:true,message:'Request Error'});
      }
    });

    return xhr;
  }

  /*this.getLayoutOverview = function(pkgid, rid, sid, callback) {
    var params = '?package_id=' + pkgid +
      '&resource_id=' + rid +
      '&datasheet_id=' + sid;

    get(this.host+'/workspace/getLayoutOverview'+params, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body)
    });
  }*/

  /*this.setDefaultLayout = function(pkgid, resourceList, layout, callback) {
    var data = {
      package_id : pkgid,
      resources : JSON.stringify(resourceList),
      layout : layout
    };

    post(this.host+'/workspace/setDefaultLayout', data, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message: 'Request Error'});
      callback(resp.body);
    });
  }*/

  this.getDatasheet = function(pkgid, rid, sid, callback) {
    var params = '?package_id=' + pkgid +
    '&resource_id=' + rid +
    '&datasheet_id=' + sid;

    get(this.host+'/ecosis/resource/get'+params, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body);
    });
  }

  this.getMetadataInfo = function(package_id, resource_id, sheet_id, callback) {
      var params = '?package_id=' + package_id +
      '&resource_id=' + resource_id;
      if( sheet_id ) params += '&sheet_id='+sheet_id;

      get(this.host+'/ecosis/resource/getMetadataInfo'+params, function(err, resp) {
        if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
        callback(resp.body);
      });
  }

  this.getMetadataChunk = function(package_id, resource_id, sheet_id, index, callback) {
      var params = '?package_id=' + package_id +
      '&resource_id=' + resource_id +
      '&index='+index;
      if( sheet_id ) params += '&sheet_id='+sheet_id;

      get(this.host+'/ecosis/resource/getMetadataChunk'+params, function(err, resp) {
        if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
        callback(resp.body);
      });
  }

  this.getSpectra = function(pkgid, rid, sid, index, callback) {
    var params = '?package_id=' + pkgid;
    if( rid ) params += '&resource_id=' + rid;
    if( sid ) params += '&sheet_id='+sid;
    params += '&index='+index;

    get(this.host+'/ecosis/spectra/get'+params, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body);
    });
  }

  this.getSpectraCount = function(pkgid, rid, sid, callback) {
    var params = '?package_id=' + pkgid;
    if( rid ) params += '&resource_id=' + rid;
    if( sid ) params += '&sheet_id='+sid;

    get(this.host+'/ecosis/resource/getSpectraCount'+params, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body);
    });
  }


  this.processResource = function(pkgid, resource_id, sheet_id, options, callback) {
    var data = {
        package_id : pkgid,
        options : JSON.stringify(options)
    }

    // apply to multiple resources, helper for first upload
    if( Array.isArray(resource_id) ) {
      data.resource_ids = JSON.stringify(resource_id)
    } else {
      data.resource_id = resource_id;
      data.sheet_id = sheet_id;
    }

    post(this.host+'/ecosis/resource/process', data, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});

      // update info in the datastore if we have one
      if( this.ds ) {
        this.ds.wavelengths = resp.wavelengths || [];
        this.ds.schema = [];
        if( !resp.attributes ) return;

        for( var attrName in resp.attributes ) {
            var attr = resp.attributes[attrName];
            attr.name = attrName;
            this.ds.schema.push(attr);
        }
      }

      callback(resp.body);
    });
  }

  this.getLicenseList = function(callback) {
    get(this.host+'/api/3/action/license_list', function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body.result);
    });
  }

  this.getPackage = function(pkgid, callback) {
    get(this.host+'/api/3/action/package_show?id='+pkgid, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message: 'Request Error', body: resp.body});
      callback(resp.body);
    });
  }

  this.tagSearch = function(query, limit, callback) {
    // supporting multiple versions of ckan.  why they changed this parameter... who knows...
    var query = encodeURIComponent(query);
    query = '&query='+query+'&ckan='+query;
    get(this.host+'/api/3/action/tag_search?limit='+(limit || 10)+query, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message: 'Request Error', body: resp.body});
      callback(resp.body);
    });
  }

  this.updatePackage = function(pkg, callback) {
    if( pkg.private ) {
      this.verifyPrivate(pkg.id,
        function(resp) {
          this._updatePackage(pkg, callback);
        }.bind(this)
      );
      return;
    }
    this._updatePackage(pkg, callback);
  }

  this._updatePackage = function(pkg, callback) {
    postRaw(this.host+'/api/3/action/package_update', pkg, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body);
    });
  }

  this.verifyPrivate = function(id, callback) {
    get(this.host+'/ecosis/package/setPrivate?id='+id, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message: 'Request Error', body: resp.body});
      callback(resp.body);
    });
  }

  this.deletePackage = function(pkgid, callback) {
    postRaw(this.host+'/api/3/action/package_delete', JSON.stringify({id: pkgid}), function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body);
    });
  }

  this.createPackage = function(pkg, callback) {
    postRaw(this.host+'/api/3/action/package_create', pkg, function(err, resp) {
      if( err ) return callback({error:true, message:'Request Error'});
      if( resp.body.error ) return callback(resp.body);
      callback(resp.body);
    });
  }

  this.setPackageOptions = function(pkgid, options, callback) {
    var data = {
      package_id : pkgid,
      options : JSON.stringify(options)
    };

    post(this.host+'/ecosis/package/setOptions', data, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body);
    });
  }

  this.removeResource = function(resourceId, callback) {
    postRaw(this.host+'/api/3/action/resource_delete', JSON.stringify({id : resourceId }), function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp);
    });
  }

  this.deleteResources = function(resourceIds, callback) {
    postRaw(this.host+'/ecosis/resource/deleteMany', JSON.stringify({ids : resourceIds }), function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp);
    });
  }

  this.pushToSearch = function(pkgid, includeEmail, callback) {
    includeEmail = includeEmail ? 'true' : 'false';
    get(this.host+'/ecosis/workspace/push?package_id='+pkgid+'&email='+includeEmail, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message: 'Request Error', body: resp.body});
      callback(resp.body);
    });
  }

  this.gitInfo = function(callback) {
    get(this.host+'/ecosis/gitInfo', function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message: 'Request Error', body: resp.body});
      callback(resp.body);
    });
  }

}


function post(url, data, callback) {
  request
   .post(url)
   .withCredentials()
   .type('form')
   .send(data)
   .end(callback)
}

function postRaw(url, data, callback) {
  request
   .post(url)
   .withCredentials()
   .send(data)
   .end(callback)
}

function get(url, callback) {
  request
    .get(url)
    .withCredentials()
    .end(callback);
}

function isError(err, resp) {
  if( err ) return true;
  if( resp && resp.body && resp.body.error ) return true;
  return false;
}

},{"superagent":5}],3:[function(require,module,exports){
var EventEmitter = require("events").EventEmitter;

module.exports = function(config) {
  this.ckan = config.ckan;
  if( this.ckan ) this.ckan.ds = this;

  // is this an existing dataset
  this.editMode = config.package_id ? true : false;

  // existing package id
  this.package_id = config.package_id;

  // information about exsiting resources
  /*this.existing = {
    resources : [],
    metadata  : [],
    data      : []
  };*/

  this.data = {
    title : '',
    name : '',
    notes : '',
    author : '',
    author_email : '',
    license_id : '',
    license_title : '',
    maintainer : '',
    maintainer_email : '',
    version : '',
    owner_org : '',
    tags : [],
    private : false,
    extras : []
  };

  this.owner_org_name = '';

  //this.schema = [];
  //wavelengths : [],

  this.datasetAttributes = {
    //group_by : '',
    sort_on : '',
    sort_type : '',
    sort_description : ''
  };

  // list of all new resources
  this.resources = [];

  // hash of current attribute name mappings
  //  - key: ecosis name
  //  - value: dataset name
  this.attributeMap = {};
  // inverse list of above map w/ key / value switched
  this.inverseAttributeMap = {};

  this.metadataDefinitions = require('./schema.json');
  this.metadataLookup = {};
  for( var cat in this.metadataDefinitions ) {
    var defs = this.metadataDefinitions[cat];
    for( var i = 0; i < defs.length; i++ ) {
      defs[i].category = cat;
      defs[i].flat = defs[i].name.replace(/\s/g,'').toLowerCase();
      this.metadataLookup[defs[i].name] = defs[i];
    }
  }

  // this flag prevents up from making updates when we are initially
  // setting the data
  this.loaded = false;
  this.loadingError = false;

  // wire events
  var ee = new EventEmitter();
  ee.setMaxListeners(100);
  this.on = function(e, fn) {
    // if things want to know we are loaded and we have already fired, just trigger.
    if( e == 'load' && this.loaded ) {
      setTimeout(fn, 200); // HACK: need to fix setValues() of ecosis-*-input
      //return
    }

    ee.on(e, fn);
  };

  this.load = function() {
    this.ckan.prepareWorkspace(this.package_id, function(result){

      if( result.error ) {
        this.loadingError = result;
        ee.emit('load-error', result);
        return
      }

      this.ckan.getWorkspace(this.package_id, function(result){
        if( result.error ) {
          this.loadingError = result;
          ee.emit('load-error', result);
          return
        }

        this.result = result;
        this._setData();

        this.loaded = true;
        ee.emit('load');

      }.bind(this));
    }.bind(this));
  };

  this.loadFromTemplate = function(ckanPackage) {
    // set the default attirbutes for this dataset
    for( var key in this.data ) {
      if( ckanPackage[key] ) this.data[key] = ckanPackage[key];
    }

    if( ckanPackage.extras ) {
      var arr = [];
      for( var key in ckanPackage.extras ) {
        arr.push({
          key : key,
          value : ckanPackage.extras[key]
        });
      }
      this.data.extras = arr;
    }

    if( ckanPackage.tags ) {
      var arr = [];
      for( var i = 0; i < ckanPackage.tags.length; i++ ) {
        arr.push({
          name : ckanPackage.tags[i],
          display_name : ckanPackage.tags[i]
        });
      }
      this.data.tags = arr;
    }

    if( ckanPackage.map ) {
      this.attributeMap = {};
      this.inverseAttributeMap = {};

      this.attributeMap = ckanPackage.map;
      for( var key in ckanPackage.map ) {
        this.inverseAttributeMap[ckanPackage.map[key]] = key;
      }
    }

    ee.emit('load');
  };

  // helper for when data loads
  this._setData = function() {
    this.editMode = true;

    var ckanPackage = this.result.ckan.package;
    this.package_id = ckanPackage.id;

    // set the default attirbutes for this dataset
    for( var key in this.data ) {
      if( ckanPackage[key] ) this.data[key] = ckanPackage[key];
    }

    if( this.data.extras && !Array.isArray(this.data.extras) ) {
      var arr = [];
      for( var key in this.data.extras) {
        arr.push({
          key : key,
          value : this.data.extras[key]
        });
      }
      this.data.extras = arr;
    }

    if( this.data.tags ) {
      var arr = [];
      for( var i = 0; i < this.data.tags.length; i++ ) {
        arr.push({
          name : this.data.tags[i],
          display_name : this.data.tags[i]
        });
      }
      this.data.tags = arr;
    }

    this.datasheets = this.result.resources;

    this.attributeMap = {};
    this.inverseAttributeMap = {};
    if( this.result.package.map ) {
      this.attributeMap = this.result.package.map;
      for( var key in this.result.package.map ) {
        this.inverseAttributeMap[this.result.package.map[key]] = key;
      }
    }

    this.sort = {};
    if( this.result.package.sort ) {
      this.sort = this.result.package.sort;
    }

    this.resources = this.result.ckan.resources;

    var zips = {}; // used to quickly add resource stubs
    for( var i = 0; i < this.resources.length; i++ ) {
      if( this.resources[i].format.toLowerCase() === 'zip' ) {
        zips[this.resources[i].id] = this.resources[i];
        this.resources[i].childResources = [];
        this.resources[i].isZip = true;
      }
    }


    this.resources.sort(function(a, b){
      if( a.name > b.name ) return 1;
      if( a.name < b.name ) return -1;
      return 0;
    });


    this.resourceLookup = {};

    // create fake stubs for zip file resources
    var alreadyAdded = {};
    for( var i = 0; i < this.datasheets.length; i++ ) {
      if( !this.datasheets[i].fromZip ) continue;
      if( alreadyAdded[this.datasheets[i].resourceId] ) continue;

      var r = this.datasheets[i];

      var stub = {
        id : r.resourceId,
        package_id : r.packageId,
        fromZip : true,
        zip : r.zip,
        name : r.name
      }

      zips[r.zip.resourceId].childResources.push(stub);
      this.resources.push(stub);

      alreadyAdded[r.resourceId] = 1; // why?
    }

    // map resources to datasheets for daster lookup
    for( var i = 0; i < this.resources.length; i++ ) {
      var datasheets = [];
      for( var j = 0; j < this.datasheets.length; j++ ) {
        if( this.datasheets[j].resourceId == this.resources[i].id ) {
          datasheets.push(this.datasheets[j]);
        }
      }

      this.resourceLookup[this.resources[i].id] = this.resources[i];
      this.resources[i].datasheets = datasheets;
    }

    this.fireUpdate();
  }

  this.setSheet = function(sheet) {
    for( var i = 0; i < this.datasheets.length; i++ ) {
      if( this.datasheets[i].resourceId == sheet.resourceId &&
          this.datasheets[i].sheetId == sheet.sheetId ) {

          this.datasheets[i] = sheet;
          break;
      }
    }

    var resource = this.resourceLookup[sheet.resourceId];
    if( !resource ) {
      console.log('Attempting to set sheet with a resourceId that does not exist');
      console.log(sheet);
      return;
    }

    for( var i = 0; i < resource.datasheets.length; i++ ) {
      if( resource.datasheets[i].sheetId == sheet.sheetId ) {
          resource.datasheets[i] = sheet;
          break;
      }
    }
  }

  this.fireUpdate = function() {
    ee.emit('update');
  }

  // after a resource is added, our entire state is different
  this.runAfterResourceAdd = function(workspaceData) {
    this.result = workspaceData;
    this._setData();
  }

  this.getDatasetExtra = function(key) {
    if( !this.data.extras ) return null;

    for( var i = 0; i < this.data.extras.length; i++ ) {
      if( this.data.extras[i].key == key ) return this.data.extras[i];
    }
    return {};
  }

  this.setDatasetExtra = function(key, value) {
    if( !this.data.extras ) this.data.extras = [];

    for( var i = 0; i < this.data.extras.length; i++ ) {
      if( this.data.extras[i].key == key ) {
        this.data.extras[i].value = value;
        return;
      }
    }

    this.data.extras.push({
      key : key,
      value : value
    });
  }

  // get all attirbutes from sheets marked as data
  this.getDatasheetAttributes = function() {
    var attrs = {}, sheet, attr;

    for( var i = 0; i < this.datasheets.length; i++ ) {
      sheet = this.datasheets[i];
      if( sheet.metadata ) continue;

      for( var j = 0; j < sheet.attributes.length; j++ ) {
        attr = sheet.attributes[j];
        attrs[attr] = 1;
      }
    }

    return Object.keys(attrs);
  }

  this.isEcosisMetadata = function(name) {
    name = name.replace(/\s/g, '').toLowerCase();
    for( var key in this.metadataLookup ) {
      if( this.metadataLookup[key].flat == name ) return true;
    }
    return false;
  }

  this.getScore = function() {
    var count = 0;

    // check for spectra level ecosis metadata
    // TODO
    /*this.schema.forEach(function(item){
      if( this.isEcosisMetadata(item.name) ) {
        count++;
      } else if( this.inverseAttributeMap[item.name] &&
                this.isEcosisMetadata(this.inverseAttributeMap[item.name]) ) {

        count++;
      }
    }.bind(this));*/

    var map = {
      'Keywords' : 'tags',
      'Author' : 'author',
      'Author Email' : 'author_email',
      'Maintainer' : 'maintainer',
      'Maintainer Email' : 'maintainer_email'
    }

    // check dataset level ecosis metadata
    for( var key in this.metadataLookup ) {
      if( map[key] && this.data[map[key]] ) {
        count++;
      } else if( this.getDatasetExtra(key).value ) {
        count++;
      }
    }

    if( this.data.notes ) count++;
    if( this.data.owner_org ) count++;


    return count;
  }
}

},{"./schema.json":4,"events":8}],4:[function(require,module,exports){
module.exports={
  "Measurement": [
    {
      "name": "Acquisition Method",
      "level": 1,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Contact",
        "Other",
        "Pixel",
        "Proximal"
      ],
      "description": "Minimum measurement unit for your spectra (i.e. contact probe, proximal with X-degree foreoptic, pixel, other).",
      "allowOther": true
    },
    {
      "name": "Sample Platform",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Airplane",
        "Boom",
        "Satellite",
        "Tower",
        "UAV"
      ],
      "description": "Platform from which the spectral measurements were made (e.g. handheld, boom, tram, UAV).",
      "allowOther": false
    },
    {
      "name": "Measurement Venue",
      "level": 2,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Greenhouse",
        "Laboratory",
        "Other",
        "Outdoor"
      ],
      "description": "Setting in which the spectral measurements were made.",
      "allowOther": true
    },
    {
      "name": "Target Type",
      "level": 1,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Animal",
        "Bark",
        "Branch",
        "Canopy",
        "Flower",
        "Leaf",
        "Mineral",
        "NPV",
        "Other",
        "Reference",
        "Rock",
        "Soil",
        "Water"
      ],
      "description": "Describes the target that was measured.",
      "allowOther": true
    },
    {
      "name": "Measurement Quantity",
      "level": 1,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Absorptance",
        "DN",
        "Index",
        "Other",
        "Radiance",
        "Reflectance",
        "Transflectance",
        "Transmittance"
      ],
      "description": "",
      "allowOther": true
    },
    {
      "name": "Index Name",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "Measurement quantity's index name.  Please provide if Measurement Quantity = \"Index\"",
      "allowOther": false
    },
    {
      "name": "Measurement Units",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "Scale for spectral instensity (e.g. DN, radiance, irradiance, reflectance)",
      "allowOther": false
    },
    {
      "name": "Wavelength Units",
      "level": 2,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Other",
        "Unitless",
        "nm",
        "um"
      ],
      "description": "Wavelength units (e.g. nm, um, Hz)",
      "allowOther": false
    },
    {
      "name": "Target Status",
      "level": 1,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Dried",
        "Fresh",
        "Green",
        "Ground",
        "Liquid",
        "Live",
        "Other",
        "Panel",
        "Standard"
      ],
      "description": "State of the measurement target.",
      "allowOther": true
    },
    {
      "name": "Light Source",
      "level": 1,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Lamp",
        "Laser",
        "Other",
        "Sun"
      ],
      "description": "Description of the light source used for your spectral measurements",
      "allowOther": true
    },
    {
      "name": "Light Source Specifications",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Foreoptic Type",
      "level": 1,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Bare Fiber",
        "Cosine Diffuser",
        "Foreoptic",
        "Gershon Tube",
        "Integrating Sphere",
        "Leaf Clip",
        "None",
        "Other"
      ],
      "description": "Description of the foreoptic used to make your spectral measurement",
      "allowOther": true
    },
    {
      "name": "Foreoptic Field of View",
      "level": 2,
      "input": "text",
      "units": "integer degrees",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Foreoptic Specifications",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    }
  ],
  "Processing Information": [
    {
      "name": "Processing Averaged",
      "level": 2,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "No",
        "Yes"
      ],
      "description": "Is the measurement an average of other measurements?",
      "allowOther": false
    },
    {
      "name": "Processing Interpolated",
      "level": 2,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "No",
        "Yes"
      ],
      "description": "Is the measurement interpolated?",
      "allowOther": false
    },
    {
      "name": "Processing Resampled",
      "level": 2,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "No",
        "Yes"
      ],
      "description": "Is the measurement resampled?",
      "allowOther": false
    },
    {
      "name": "Processing Information Details",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "Other details about processing are provided here.",
      "allowOther": false
    }
  ],
  "Instrument": [
    {
      "name": "Instrument Manufacturer",
      "level": 1,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "Spectrometer manufacturer.",
      "allowOther": false
    },
    {
      "name": "Instrument Model",
      "level": 1,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "Spectrometer model.",
      "allowOther": false
    },
    {
      "name": "Instrument Serial Number",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    }
  ],
  "Theme": [
    {
      "name": "Theme",
      "level": 1,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Agriculture",
        "Biochemistry",
        "Ecology",
        "Forest",
        "Global Change",
        "Land Cover",
        "Other",
        "Phenology",
        "Physiology",
        "Urban",
        "Water Quality"
      ],
      "description": "Research context for the the spectral measurements.",
      "allowOther": true
    },
    {
      "name": "Keywords",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Ecosystem Type",
      "level": 2,
      "input": "controlled",
      "units": "",
      "spectraLevel": true,
      "vocabulary": [
        "Aquatic",
        "Coastal",
        "Crops",
        "Forest",
        "Grassland",
        "Wetland"
      ],
      "description": "",
      "allowOther": false
    }
  ],
  "Location": [
    {
      "name": "Latitude",
      "level": 1,
      "input": "latlng",
      "units": "decimal degree",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Longitude",
      "level": 1,
      "input": "latlng",
      "units": "decimal degree",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "geojson",
      "level": 1,
      "input": "geojson",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Location Name",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    }
  ],
  "Date": [
    {
      "name": "Sample Collection Date",
      "level": 1,
      "input": "date",
      "units": "ISO Date ",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Measurement Date",
      "level": 2,
      "input": "date",
      "units": "ISO Date ",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Phenological Status",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    }
  ],
  "Species": [
    {
      "name": "Common Name",
      "level": 1,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "Common name of the target that was measured.",
      "allowOther": false
    },
    {
      "name": "Latin Genus",
      "level": 1,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "Latin genus of the target that was measured.",
      "allowOther": false
    },
    {
      "name": "Latin Species",
      "level": 1,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "Latin species of the target that was measured.",
      "allowOther": false
    },
    {
      "name": "USDA Symbol",
      "level": 1,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "USDA code of the target that was measured.",
      "allowOther": false
    },
    {
      "name": "Vegetation Type",
      "level": 1,
      "input": "text",
      "units": "",
      "spectraLevel": true,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    }
  ],
  "Citation": [
    {
      "name": "Citation",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Citation DOI",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Website",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Author",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Author Email",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Maintainer",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Maintainer Email",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Funding Source",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Funding Source Grant Number",
      "level": 2,
      "input": "text",
      "units": "",
      "spectraLevel": false,
      "vocabulary": null,
      "description": "",
      "allowOther": false
    }
  ]
}
},{}],5:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? (this || self)
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(err || new_err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":6,"reduce":7}],6:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],7:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNvcmUvYXBwIiwiY29yZS9ja2FuLmpzIiwiY29yZS9kYXRhc3RvcmUuanMiLCJjb3JlL3NjaGVtYS5qc29uIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25qQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNubUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlcjtcbnZhciBEYXRhc3RvcmUgPSByZXF1aXJlKCcuL2RhdGFzdG9yZScpO1xudmFyIENLQU4gPSByZXF1aXJlKCcuL2NrYW4nKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gIHRoaXMuY2thbiA9IG5ldyBDS0FOKHtcbiAgICBob3N0IDogY29uZmlnLmhvc3RcbiAgfSk7XG5cbiAgdGhpcy5kcyA9IG5ldyBEYXRhc3RvcmUoe1xuICAgIGNrYW4gOiB0aGlzLmNrYW4sXG4gICAgcGFja2FnZV9pZCA6IGNvbmZpZy5wYWNrYWdlX2lkXG4gIH0pO1xuXG4gIC8vIHdpcmUgZXZlbnRzXG4gIHZhciBlZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgdGhpcy5vbiA9IGZ1bmN0aW9uKGUsIGZuKSB7XG4gICAgICAgZWUub24oZSwgZm4pO1xuICB9O1xuXG5cbiAgLy8gZ2V0IHRoZSB1c2VyIGFjY291bnRcbiAgdGhpcy5ja2FuLmdldEFjdGl2ZVVzZXIoZnVuY3Rpb24ocmVzcCl7XG4gICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICB0aGlzLnVzZXJMb2FkRXJyb3IgPSB0cnVlO1xuICAgIH1cblxuXG4gICAgdGhpcy51c2VyID0gcmVzcDtcbiAgICBlZS5lbWl0KCd1c2VyLWxvYWQnKTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICBpZiggY29uZmlnLnBhY2thZ2VfaWQgKSB0aGlzLmRzLmxvYWQoKTtcblxufVxuIiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5cbi8vIGRlcGVuZHMgaWYgd2UgYXJlIHJ1bm5pbmcgZnJvbSBub2RlanMgb3IgYnJvd3NlclxudmFyIGFnZW50ID0gcmVxdWVzdC5hZ2VudCA/IHJlcXVlc3QuYWdlbnQoKSA6IHJlcXVlc3Q7XG52YXIgaXNCcm93c2VyID0gcmVxdWVzdC5hZ2VudCA/IGZhbHNlIDogdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgdGhpcy5ob3N0ID0gY29uZmlnLmhvc3QgfHwgJy8nO1xuXG4gIHRoaXMucHJlcGFyZVdvcmtzcGFjZSA9IGZ1bmN0aW9uKHBrZ2lkLCBjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvd29ya3NwYWNlL3ByZXBhcmU/Zm9yY2U9dHJ1ZSZwYWNrYWdlX2lkPScrcGtnaWQsIGZ1bmN0aW9uKGVyciwgcmVzcCl7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5nZXRXb3Jrc3BhY2UgPSBmdW5jdGlvbihwa2dpZCwgY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL3dvcmtzcGFjZS9nZXQ/cGFja2FnZV9pZD0nK3BrZ2lkLCBmdW5jdGlvbihlcnIsIHJlc3Ape1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZ2V0QWN0aXZlVXNlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy91c2VyL2dldCcsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlc291cmNlIHRvIGEgcGFja2FnZSB1c2luZyB0aGUgYnJvd3NlcnMgRm9ybURhdGEgb2JqZWN0IGluIGEgYnJvd3NlclxuICAgKiBvciB1c2VyIHRoZSBzdXBlcmFnZW50IGZvciBOb2RlSlNcbiAgICpcbiAgICogcGtnaWQ6IGlkIG9mIHRoZSBwYWNrYWdlIHRvIGFkZCB0b1xuICAgKiBmaWxlOiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSB0byByZXNvdXJjZSB0byB1cGxvYWQgb3IgaWYgTm9kZUpTIHN0cmluZyBwYXRoIHRvIGZpbGVcbiAgICogY2FsbGJhY2s6IGNhbGxiYWNrIGhhbmRsZXJcbiAgICogcHJvZ3Jlc3M6IGNhbGxiYWNrIGZvciBwcm9ncmVzcyB1cGRhdGUgKG5vdCBzdXBwb3J0ZWQgaW4gTm9kZUpTKVxuICAgKiovXG4gIHRoaXMuYWRkUmVzb3VyY2UgPSBmdW5jdGlvbihwa2dpZCwgZmlsZSwgY2FsbGJhY2ssIHByb2dyZXNzKSB7XG4gICAgaWYoIGlzQnJvd3NlciApIHRoaXMuX2FkZFJlc291cmNlQnJvd3Nlcihwa2dpZCwgZmlsZSwgY2FsbGJhY2ssIHByb2dyZXNzKTtcbiAgICBlbHNlIHRoaXMuX2FkZFJlc291cmNlTm9kZShwa2dpZCwgZmlsZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gVE9ETzogdGhpcyBuZWVkcyB0byBiZSB2ZXJpZmllZCA6L1xuICB0aGlzLl9hZGRSZXNvdXJjZU5vZGUgPSBmdW5jdGlvbihwa2dpZCwgZmlsZSwgY2FsbGJhY2spIHtcbiAgICByZXF1ZXN0XG4gICAgIC5wb3N0KHRoaXMuaG9zdCArICcvYXBpLzMvYWN0aW9uL3Jlc291cmNlX2NyZWF0ZScpXG4gICAgIC53aXRoQ3JlZGVudGlhbHMoKVxuICAgICAuZmllbGQoJ3BhY2thZ2VfaWQnLCBwa2dpZClcbiAgICAgLmZpZWxkKCdtaW1ldHlwZScsIGZpbGUubWltZXR5cGUpXG4gICAgIC5maWVsZCgnbmFtZScsIGZpbGUuZmlsZW5hbWUpXG4gICAgIC5maWVsZCgndXJsJywndXBsb2FkJylcbiAgICAgLmF0dGFjaCgndXBsb2FkJywgZmlsZS5taW1ldHlwZSlcbiAgICAgLmVuZChjYWxsYmFjayk7XG4gIH1cblxuICB0aGlzLl9hZGRSZXNvdXJjZUJyb3dzZXIgPSBmdW5jdGlvbihwa2dpZCwgZmlsZSwgY2FsbGJhY2ssIHByb2dyZXNzKSB7XG4gICAgLy8gVE9ETzogaWYgdGhpcyBmYWlscywgd2UgaGF2ZSBhbiBpc3N1ZSBvbiBvdXIgaGFuZHNcbiAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgIGZvcm1EYXRhLmFwcGVuZCgncGFja2FnZV9pZCcsIHBrZ2lkKTtcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ21pbWV0eXBlJywgZmlsZS5taW1ldHlwZSk7XG4gICAgZm9ybURhdGEuYXBwZW5kKCduYW1lJywgZmlsZS5maWxlbmFtZSk7XG4gICAgZm9ybURhdGEuYXBwZW5kKCd1cmwnLCAndXBsb2FkJyk7XG4gICAgZm9ybURhdGEuYXBwZW5kKCd1cGxvYWQnLCBuZXcgQmxvYihbZmlsZS5jb250ZW50c10sIHt0eXBlOiBmaWxlLm1pbWV0eXBlfSksIGZpbGUuZmlsZW5hbWUpO1xuXG4gICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIHZhciB4aHIgPSAkLmFqYXhTZXR0aW5ncy54aHIoKTtcbiAgICAvLyBhdHRhY2ggcHJvZ3Jlc3MgaGFuZGxlciB0byB0aGUgWE1MSHR0cFJlcXVlc3QgT2JqZWN0XG4gICAgdHJ5IHtcbiAgICAgICAgaWYoIHByb2dyZXNzICkge1xuICAgICAgICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKFwicHJvZ3Jlc3NcIiwgZnVuY3Rpb24oZXZ0KXtcbiAgICAgICAgICAgICAgICBpZiAoZXZ0Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBkaWZmID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lO1xuICAgICAgICAgICAgICAgICAgdmFyIHNwZWVkID0gKGV2dC5sb2FkZWQgLyAxMDAwMDAwKSAvIChkaWZmIC8gMTAwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MoKChldnQubG9hZGVkIC8gZXZ0LnRvdGFsKSoxMDApLnRvRml4ZWQoMCksIHNwZWVkLnRvRml4ZWQoMikrJ01icHMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmhvc3QgKyAnL2FwaS8zL2FjdGlvbi9yZXNvdXJjZV9jcmVhdGUnLFxuICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICBkYXRhOiBmb3JtRGF0YSxcbiAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZSxcbiAgICAgIHhockZpZWxkczoge1xuICAgICAgICB3aXRoQ3JlZGVudGlhbHM6IHRydWVcbiAgICAgIH0sXG4gICAgICB4aHIgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4geGhyO1xuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrLFxuICAgICAgZXJyb3IgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSxtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHhocjtcbiAgfVxuXG4gIC8qdGhpcy5nZXRMYXlvdXRPdmVydmlldyA9IGZ1bmN0aW9uKHBrZ2lkLCByaWQsIHNpZCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcGFyYW1zID0gJz9wYWNrYWdlX2lkPScgKyBwa2dpZCArXG4gICAgICAnJnJlc291cmNlX2lkPScgKyByaWQgK1xuICAgICAgJyZkYXRhc2hlZXRfaWQ9JyArIHNpZDtcblxuICAgIGdldCh0aGlzLmhvc3QrJy93b3Jrc3BhY2UvZ2V0TGF5b3V0T3ZlcnZpZXcnK3BhcmFtcywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KVxuICAgIH0pO1xuICB9Ki9cblxuICAvKnRoaXMuc2V0RGVmYXVsdExheW91dCA9IGZ1bmN0aW9uKHBrZ2lkLCByZXNvdXJjZUxpc3QsIGxheW91dCwgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZCxcbiAgICAgIHJlc291cmNlcyA6IEpTT04uc3RyaW5naWZ5KHJlc291cmNlTGlzdCksXG4gICAgICBsYXlvdXQgOiBsYXlvdXRcbiAgICB9O1xuXG4gICAgcG9zdCh0aGlzLmhvc3QrJy93b3Jrc3BhY2Uvc2V0RGVmYXVsdExheW91dCcsIGRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTogJ1JlcXVlc3QgRXJyb3InfSk7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgIH0pO1xuICB9Ki9cblxuICB0aGlzLmdldERhdGFzaGVldCA9IGZ1bmN0aW9uKHBrZ2lkLCByaWQsIHNpZCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcGFyYW1zID0gJz9wYWNrYWdlX2lkPScgKyBwa2dpZCArXG4gICAgJyZyZXNvdXJjZV9pZD0nICsgcmlkICtcbiAgICAnJmRhdGFzaGVldF9pZD0nICsgc2lkO1xuXG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9nZXQnK3BhcmFtcywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZ2V0TWV0YWRhdGFJbmZvID0gZnVuY3Rpb24ocGFja2FnZV9pZCwgcmVzb3VyY2VfaWQsIHNoZWV0X2lkLCBjYWxsYmFjaykge1xuICAgICAgdmFyIHBhcmFtcyA9ICc/cGFja2FnZV9pZD0nICsgcGFja2FnZV9pZCArXG4gICAgICAnJnJlc291cmNlX2lkPScgKyByZXNvdXJjZV9pZDtcbiAgICAgIGlmKCBzaGVldF9pZCApIHBhcmFtcyArPSAnJnNoZWV0X2lkPScrc2hlZXRfaWQ7XG5cbiAgICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZ2V0TWV0YWRhdGFJbmZvJytwYXJhbXMsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgICAgfSk7XG4gIH1cblxuICB0aGlzLmdldE1ldGFkYXRhQ2h1bmsgPSBmdW5jdGlvbihwYWNrYWdlX2lkLCByZXNvdXJjZV9pZCwgc2hlZXRfaWQsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgdmFyIHBhcmFtcyA9ICc/cGFja2FnZV9pZD0nICsgcGFja2FnZV9pZCArXG4gICAgICAnJnJlc291cmNlX2lkPScgKyByZXNvdXJjZV9pZCArXG4gICAgICAnJmluZGV4PScraW5kZXg7XG4gICAgICBpZiggc2hlZXRfaWQgKSBwYXJhbXMgKz0gJyZzaGVldF9pZD0nK3NoZWV0X2lkO1xuXG4gICAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL2dldE1ldGFkYXRhQ2h1bmsnK3BhcmFtcywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6J1JlcXVlc3QgRXJyb3InfSk7XG4gICAgICAgIGNhbGxiYWNrKHJlc3AuYm9keSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZ2V0U3BlY3RyYSA9IGZ1bmN0aW9uKHBrZ2lkLCByaWQsIHNpZCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHBhcmFtcyA9ICc/cGFja2FnZV9pZD0nICsgcGtnaWQ7XG4gICAgaWYoIHJpZCApIHBhcmFtcyArPSAnJnJlc291cmNlX2lkPScgKyByaWQ7XG4gICAgaWYoIHNpZCApIHBhcmFtcyArPSAnJnNoZWV0X2lkPScrc2lkO1xuICAgIHBhcmFtcyArPSAnJmluZGV4PScraW5kZXg7XG5cbiAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL3NwZWN0cmEvZ2V0JytwYXJhbXMsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICAgIGNhbGxiYWNrKHJlc3AuYm9keSk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLmdldFNwZWN0cmFDb3VudCA9IGZ1bmN0aW9uKHBrZ2lkLCByaWQsIHNpZCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcGFyYW1zID0gJz9wYWNrYWdlX2lkPScgKyBwa2dpZDtcbiAgICBpZiggcmlkICkgcGFyYW1zICs9ICcmcmVzb3VyY2VfaWQ9JyArIHJpZDtcbiAgICBpZiggc2lkICkgcGFyYW1zICs9ICcmc2hlZXRfaWQ9JytzaWQ7XG5cbiAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL2dldFNwZWN0cmFDb3VudCcrcGFyYW1zLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6J1JlcXVlc3QgRXJyb3InfSk7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgIH0pO1xuICB9XG5cblxuICB0aGlzLnByb2Nlc3NSZXNvdXJjZSA9IGZ1bmN0aW9uKHBrZ2lkLCByZXNvdXJjZV9pZCwgc2hlZXRfaWQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZCxcbiAgICAgICAgb3B0aW9ucyA6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpXG4gICAgfVxuXG4gICAgLy8gYXBwbHkgdG8gbXVsdGlwbGUgcmVzb3VyY2VzLCBoZWxwZXIgZm9yIGZpcnN0IHVwbG9hZFxuICAgIGlmKCBBcnJheS5pc0FycmF5KHJlc291cmNlX2lkKSApIHtcbiAgICAgIGRhdGEucmVzb3VyY2VfaWRzID0gSlNPTi5zdHJpbmdpZnkocmVzb3VyY2VfaWQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGEucmVzb3VyY2VfaWQgPSByZXNvdXJjZV9pZDtcbiAgICAgIGRhdGEuc2hlZXRfaWQgPSBzaGVldF9pZDtcbiAgICB9XG5cbiAgICBwb3N0KHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9wcm9jZXNzJywgZGF0YSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuXG4gICAgICAvLyB1cGRhdGUgaW5mbyBpbiB0aGUgZGF0YXN0b3JlIGlmIHdlIGhhdmUgb25lXG4gICAgICBpZiggdGhpcy5kcyApIHtcbiAgICAgICAgdGhpcy5kcy53YXZlbGVuZ3RocyA9IHJlc3Aud2F2ZWxlbmd0aHMgfHwgW107XG4gICAgICAgIHRoaXMuZHMuc2NoZW1hID0gW107XG4gICAgICAgIGlmKCAhcmVzcC5hdHRyaWJ1dGVzICkgcmV0dXJuO1xuXG4gICAgICAgIGZvciggdmFyIGF0dHJOYW1lIGluIHJlc3AuYXR0cmlidXRlcyApIHtcbiAgICAgICAgICAgIHZhciBhdHRyID0gcmVzcC5hdHRyaWJ1dGVzW2F0dHJOYW1lXTtcbiAgICAgICAgICAgIGF0dHIubmFtZSA9IGF0dHJOYW1lO1xuICAgICAgICAgICAgdGhpcy5kcy5zY2hlbWEucHVzaChhdHRyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5nZXRMaWNlbnNlTGlzdCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9saWNlbnNlX2xpc3QnLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6J1JlcXVlc3QgRXJyb3InfSk7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkucmVzdWx0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZ2V0UGFja2FnZSA9IGZ1bmN0aW9uKHBrZ2lkLCBjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vcGFja2FnZV9zaG93P2lkPScrcGtnaWQsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTogJ1JlcXVlc3QgRXJyb3InLCBib2R5OiByZXNwLmJvZHl9KTtcbiAgICAgIGNhbGxiYWNrKHJlc3AuYm9keSk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLnRhZ1NlYXJjaCA9IGZ1bmN0aW9uKHF1ZXJ5LCBsaW1pdCwgY2FsbGJhY2spIHtcbiAgICAvLyBzdXBwb3J0aW5nIG11bHRpcGxlIHZlcnNpb25zIG9mIGNrYW4uICB3aHkgdGhleSBjaGFuZ2VkIHRoaXMgcGFyYW1ldGVyLi4uIHdobyBrbm93cy4uLlxuICAgIHZhciBxdWVyeSA9IGVuY29kZVVSSUNvbXBvbmVudChxdWVyeSk7XG4gICAgcXVlcnkgPSAnJnF1ZXJ5PScrcXVlcnkrJyZja2FuPScrcXVlcnk7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi90YWdfc2VhcmNoP2xpbWl0PScrKGxpbWl0IHx8IDEwKStxdWVyeSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsIGJvZHk6IHJlc3AuYm9keX0pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMudXBkYXRlUGFja2FnZSA9IGZ1bmN0aW9uKHBrZywgY2FsbGJhY2spIHtcbiAgICBpZiggcGtnLnByaXZhdGUgKSB7XG4gICAgICB0aGlzLnZlcmlmeVByaXZhdGUocGtnLmlkLFxuICAgICAgICBmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlUGFja2FnZShwa2csIGNhbGxiYWNrKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVQYWNrYWdlKHBrZywgY2FsbGJhY2spO1xuICB9XG5cbiAgdGhpcy5fdXBkYXRlUGFja2FnZSA9IGZ1bmN0aW9uKHBrZywgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9wYWNrYWdlX3VwZGF0ZScsIHBrZywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMudmVyaWZ5UHJpdmF0ZSA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvcGFja2FnZS9zZXRQcml2YXRlP2lkPScraWQsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTogJ1JlcXVlc3QgRXJyb3InLCBib2R5OiByZXNwLmJvZHl9KTtcbiAgICAgIGNhbGxiYWNrKHJlc3AuYm9keSk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLmRlbGV0ZVBhY2thZ2UgPSBmdW5jdGlvbihwa2dpZCwgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9wYWNrYWdlX2RlbGV0ZScsIEpTT04uc3RyaW5naWZ5KHtpZDogcGtnaWR9KSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuY3JlYXRlUGFja2FnZSA9IGZ1bmN0aW9uKHBrZywgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9wYWNrYWdlX2NyZWF0ZScsIHBrZywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggZXJyICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgaWYoIHJlc3AuYm9keS5lcnJvciApIHJldHVybiBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuc2V0UGFja2FnZU9wdGlvbnMgPSBmdW5jdGlvbihwa2dpZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZCxcbiAgICAgIG9wdGlvbnMgOiBKU09OLnN0cmluZ2lmeShvcHRpb25zKVxuICAgIH07XG5cbiAgICBwb3N0KHRoaXMuaG9zdCsnL2Vjb3Npcy9wYWNrYWdlL3NldE9wdGlvbnMnLCBkYXRhLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6J1JlcXVlc3QgRXJyb3InfSk7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5yZW1vdmVSZXNvdXJjZSA9IGZ1bmN0aW9uKHJlc291cmNlSWQsIGNhbGxiYWNrKSB7XG4gICAgcG9zdFJhdyh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vcmVzb3VyY2VfZGVsZXRlJywgSlNPTi5zdHJpbmdpZnkoe2lkIDogcmVzb3VyY2VJZCB9KSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgY2FsbGJhY2socmVzcCk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLmRlbGV0ZVJlc291cmNlcyA9IGZ1bmN0aW9uKHJlc291cmNlSWRzLCBjYWxsYmFjaykge1xuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL2RlbGV0ZU1hbnknLCBKU09OLnN0cmluZ2lmeSh7aWRzIDogcmVzb3VyY2VJZHMgfSksIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICAgIGNhbGxiYWNrKHJlc3ApO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5wdXNoVG9TZWFyY2ggPSBmdW5jdGlvbihwa2dpZCwgaW5jbHVkZUVtYWlsLCBjYWxsYmFjaykge1xuICAgIGluY2x1ZGVFbWFpbCA9IGluY2x1ZGVFbWFpbCA/ICd0cnVlJyA6ICdmYWxzZSc7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy93b3Jrc3BhY2UvcHVzaD9wYWNrYWdlX2lkPScrcGtnaWQrJyZlbWFpbD0nK2luY2x1ZGVFbWFpbCwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsIGJvZHk6IHJlc3AuYm9keX0pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZ2l0SW5mbyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9naXRJbmZvJywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsIGJvZHk6IHJlc3AuYm9keX0pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG59XG5cblxuZnVuY3Rpb24gcG9zdCh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG4gIHJlcXVlc3RcbiAgIC5wb3N0KHVybClcbiAgIC53aXRoQ3JlZGVudGlhbHMoKVxuICAgLnR5cGUoJ2Zvcm0nKVxuICAgLnNlbmQoZGF0YSlcbiAgIC5lbmQoY2FsbGJhY2spXG59XG5cbmZ1bmN0aW9uIHBvc3RSYXcodXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICByZXF1ZXN0XG4gICAucG9zdCh1cmwpXG4gICAud2l0aENyZWRlbnRpYWxzKClcbiAgIC5zZW5kKGRhdGEpXG4gICAuZW5kKGNhbGxiYWNrKVxufVxuXG5mdW5jdGlvbiBnZXQodXJsLCBjYWxsYmFjaykge1xuICByZXF1ZXN0XG4gICAgLmdldCh1cmwpXG4gICAgLndpdGhDcmVkZW50aWFscygpXG4gICAgLmVuZChjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZXJyLCByZXNwKSB7XG4gIGlmKCBlcnIgKSByZXR1cm4gdHJ1ZTtcbiAgaWYoIHJlc3AgJiYgcmVzcC5ib2R5ICYmIHJlc3AuYm9keS5lcnJvciApIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG4iLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHRoaXMuY2thbiA9IGNvbmZpZy5ja2FuO1xuICBpZiggdGhpcy5ja2FuICkgdGhpcy5ja2FuLmRzID0gdGhpcztcblxuICAvLyBpcyB0aGlzIGFuIGV4aXN0aW5nIGRhdGFzZXRcbiAgdGhpcy5lZGl0TW9kZSA9IGNvbmZpZy5wYWNrYWdlX2lkID8gdHJ1ZSA6IGZhbHNlO1xuXG4gIC8vIGV4aXN0aW5nIHBhY2thZ2UgaWRcbiAgdGhpcy5wYWNrYWdlX2lkID0gY29uZmlnLnBhY2thZ2VfaWQ7XG5cbiAgLy8gaW5mb3JtYXRpb24gYWJvdXQgZXhzaXRpbmcgcmVzb3VyY2VzXG4gIC8qdGhpcy5leGlzdGluZyA9IHtcbiAgICByZXNvdXJjZXMgOiBbXSxcbiAgICBtZXRhZGF0YSAgOiBbXSxcbiAgICBkYXRhICAgICAgOiBbXVxuICB9OyovXG5cbiAgdGhpcy5kYXRhID0ge1xuICAgIHRpdGxlIDogJycsXG4gICAgbmFtZSA6ICcnLFxuICAgIG5vdGVzIDogJycsXG4gICAgYXV0aG9yIDogJycsXG4gICAgYXV0aG9yX2VtYWlsIDogJycsXG4gICAgbGljZW5zZV9pZCA6ICcnLFxuICAgIGxpY2Vuc2VfdGl0bGUgOiAnJyxcbiAgICBtYWludGFpbmVyIDogJycsXG4gICAgbWFpbnRhaW5lcl9lbWFpbCA6ICcnLFxuICAgIHZlcnNpb24gOiAnJyxcbiAgICBvd25lcl9vcmcgOiAnJyxcbiAgICB0YWdzIDogW10sXG4gICAgcHJpdmF0ZSA6IGZhbHNlLFxuICAgIGV4dHJhcyA6IFtdXG4gIH07XG5cbiAgdGhpcy5vd25lcl9vcmdfbmFtZSA9ICcnO1xuXG4gIC8vdGhpcy5zY2hlbWEgPSBbXTtcbiAgLy93YXZlbGVuZ3RocyA6IFtdLFxuXG4gIHRoaXMuZGF0YXNldEF0dHJpYnV0ZXMgPSB7XG4gICAgLy9ncm91cF9ieSA6ICcnLFxuICAgIHNvcnRfb24gOiAnJyxcbiAgICBzb3J0X3R5cGUgOiAnJyxcbiAgICBzb3J0X2Rlc2NyaXB0aW9uIDogJydcbiAgfTtcblxuICAvLyBsaXN0IG9mIGFsbCBuZXcgcmVzb3VyY2VzXG4gIHRoaXMucmVzb3VyY2VzID0gW107XG5cbiAgLy8gaGFzaCBvZiBjdXJyZW50IGF0dHJpYnV0ZSBuYW1lIG1hcHBpbmdzXG4gIC8vICAtIGtleTogZWNvc2lzIG5hbWVcbiAgLy8gIC0gdmFsdWU6IGRhdGFzZXQgbmFtZVxuICB0aGlzLmF0dHJpYnV0ZU1hcCA9IHt9O1xuICAvLyBpbnZlcnNlIGxpc3Qgb2YgYWJvdmUgbWFwIHcvIGtleSAvIHZhbHVlIHN3aXRjaGVkXG4gIHRoaXMuaW52ZXJzZUF0dHJpYnV0ZU1hcCA9IHt9O1xuXG4gIHRoaXMubWV0YWRhdGFEZWZpbml0aW9ucyA9IHJlcXVpcmUoJy4vc2NoZW1hLmpzb24nKTtcbiAgdGhpcy5tZXRhZGF0YUxvb2t1cCA9IHt9O1xuICBmb3IoIHZhciBjYXQgaW4gdGhpcy5tZXRhZGF0YURlZmluaXRpb25zICkge1xuICAgIHZhciBkZWZzID0gdGhpcy5tZXRhZGF0YURlZmluaXRpb25zW2NhdF07XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBkZWZzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZGVmc1tpXS5jYXRlZ29yeSA9IGNhdDtcbiAgICAgIGRlZnNbaV0uZmxhdCA9IGRlZnNbaV0ubmFtZS5yZXBsYWNlKC9cXHMvZywnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgIHRoaXMubWV0YWRhdGFMb29rdXBbZGVmc1tpXS5uYW1lXSA9IGRlZnNbaV07XG4gICAgfVxuICB9XG5cbiAgLy8gdGhpcyBmbGFnIHByZXZlbnRzIHVwIGZyb20gbWFraW5nIHVwZGF0ZXMgd2hlbiB3ZSBhcmUgaW5pdGlhbGx5XG4gIC8vIHNldHRpbmcgdGhlIGRhdGFcbiAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcbiAgdGhpcy5sb2FkaW5nRXJyb3IgPSBmYWxzZTtcblxuICAvLyB3aXJlIGV2ZW50c1xuICB2YXIgZWUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIGVlLnNldE1heExpc3RlbmVycygxMDApO1xuICB0aGlzLm9uID0gZnVuY3Rpb24oZSwgZm4pIHtcbiAgICAvLyBpZiB0aGluZ3Mgd2FudCB0byBrbm93IHdlIGFyZSBsb2FkZWQgYW5kIHdlIGhhdmUgYWxyZWFkeSBmaXJlZCwganVzdCB0cmlnZ2VyLlxuICAgIGlmKCBlID09ICdsb2FkJyAmJiB0aGlzLmxvYWRlZCApIHtcbiAgICAgIHNldFRpbWVvdXQoZm4sIDIwMCk7IC8vIEhBQ0s6IG5lZWQgdG8gZml4IHNldFZhbHVlcygpIG9mIGVjb3Npcy0qLWlucHV0XG4gICAgICAvL3JldHVyblxuICAgIH1cblxuICAgIGVlLm9uKGUsIGZuKTtcbiAgfTtcblxuICB0aGlzLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNrYW4ucHJlcGFyZVdvcmtzcGFjZSh0aGlzLnBhY2thZ2VfaWQsIGZ1bmN0aW9uKHJlc3VsdCl7XG5cbiAgICAgIGlmKCByZXN1bHQuZXJyb3IgKSB7XG4gICAgICAgIHRoaXMubG9hZGluZ0Vycm9yID0gcmVzdWx0O1xuICAgICAgICBlZS5lbWl0KCdsb2FkLWVycm9yJywgcmVzdWx0KTtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2thbi5nZXRXb3Jrc3BhY2UodGhpcy5wYWNrYWdlX2lkLCBmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICBpZiggcmVzdWx0LmVycm9yICkge1xuICAgICAgICAgIHRoaXMubG9hZGluZ0Vycm9yID0gcmVzdWx0O1xuICAgICAgICAgIGVlLmVtaXQoJ2xvYWQtZXJyb3InLCByZXN1bHQpO1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIHRoaXMuX3NldERhdGEoKTtcblxuICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgICAgIGVlLmVtaXQoJ2xvYWQnKTtcblxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9O1xuXG4gIHRoaXMubG9hZEZyb21UZW1wbGF0ZSA9IGZ1bmN0aW9uKGNrYW5QYWNrYWdlKSB7XG4gICAgLy8gc2V0IHRoZSBkZWZhdWx0IGF0dGlyYnV0ZXMgZm9yIHRoaXMgZGF0YXNldFxuICAgIGZvciggdmFyIGtleSBpbiB0aGlzLmRhdGEgKSB7XG4gICAgICBpZiggY2thblBhY2thZ2Vba2V5XSApIHRoaXMuZGF0YVtrZXldID0gY2thblBhY2thZ2Vba2V5XTtcbiAgICB9XG5cbiAgICBpZiggY2thblBhY2thZ2UuZXh0cmFzICkge1xuICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgZm9yKCB2YXIga2V5IGluIGNrYW5QYWNrYWdlLmV4dHJhcyApIHtcbiAgICAgICAgYXJyLnB1c2goe1xuICAgICAgICAgIGtleSA6IGtleSxcbiAgICAgICAgICB2YWx1ZSA6IGNrYW5QYWNrYWdlLmV4dHJhc1trZXldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5kYXRhLmV4dHJhcyA9IGFycjtcbiAgICB9XG5cbiAgICBpZiggY2thblBhY2thZ2UudGFncyApIHtcbiAgICAgIHZhciBhcnIgPSBbXTtcbiAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgY2thblBhY2thZ2UudGFncy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgYXJyLnB1c2goe1xuICAgICAgICAgIG5hbWUgOiBja2FuUGFja2FnZS50YWdzW2ldLFxuICAgICAgICAgIGRpc3BsYXlfbmFtZSA6IGNrYW5QYWNrYWdlLnRhZ3NbaV1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLmRhdGEudGFncyA9IGFycjtcbiAgICB9XG5cbiAgICBpZiggY2thblBhY2thZ2UubWFwICkge1xuICAgICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSB7fTtcbiAgICAgIHRoaXMuaW52ZXJzZUF0dHJpYnV0ZU1hcCA9IHt9O1xuXG4gICAgICB0aGlzLmF0dHJpYnV0ZU1hcCA9IGNrYW5QYWNrYWdlLm1hcDtcbiAgICAgIGZvciggdmFyIGtleSBpbiBja2FuUGFja2FnZS5tYXAgKSB7XG4gICAgICAgIHRoaXMuaW52ZXJzZUF0dHJpYnV0ZU1hcFtja2FuUGFja2FnZS5tYXBba2V5XV0gPSBrZXk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZWUuZW1pdCgnbG9hZCcpO1xuICB9O1xuXG4gIC8vIGhlbHBlciBmb3Igd2hlbiBkYXRhIGxvYWRzXG4gIHRoaXMuX3NldERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVkaXRNb2RlID0gdHJ1ZTtcblxuICAgIHZhciBja2FuUGFja2FnZSA9IHRoaXMucmVzdWx0LmNrYW4ucGFja2FnZTtcbiAgICB0aGlzLnBhY2thZ2VfaWQgPSBja2FuUGFja2FnZS5pZDtcblxuICAgIC8vIHNldCB0aGUgZGVmYXVsdCBhdHRpcmJ1dGVzIGZvciB0aGlzIGRhdGFzZXRcbiAgICBmb3IoIHZhciBrZXkgaW4gdGhpcy5kYXRhICkge1xuICAgICAgaWYoIGNrYW5QYWNrYWdlW2tleV0gKSB0aGlzLmRhdGFba2V5XSA9IGNrYW5QYWNrYWdlW2tleV07XG4gICAgfVxuXG4gICAgaWYoIHRoaXMuZGF0YS5leHRyYXMgJiYgIUFycmF5LmlzQXJyYXkodGhpcy5kYXRhLmV4dHJhcykgKSB7XG4gICAgICB2YXIgYXJyID0gW107XG4gICAgICBmb3IoIHZhciBrZXkgaW4gdGhpcy5kYXRhLmV4dHJhcykge1xuICAgICAgICBhcnIucHVzaCh7XG4gICAgICAgICAga2V5IDoga2V5LFxuICAgICAgICAgIHZhbHVlIDogdGhpcy5kYXRhLmV4dHJhc1trZXldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5kYXRhLmV4dHJhcyA9IGFycjtcbiAgICB9XG5cbiAgICBpZiggdGhpcy5kYXRhLnRhZ3MgKSB7XG4gICAgICB2YXIgYXJyID0gW107XG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS50YWdzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBhcnIucHVzaCh7XG4gICAgICAgICAgbmFtZSA6IHRoaXMuZGF0YS50YWdzW2ldLFxuICAgICAgICAgIGRpc3BsYXlfbmFtZSA6IHRoaXMuZGF0YS50YWdzW2ldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5kYXRhLnRhZ3MgPSBhcnI7XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhc2hlZXRzID0gdGhpcy5yZXN1bHQucmVzb3VyY2VzO1xuXG4gICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSB7fTtcbiAgICB0aGlzLmludmVyc2VBdHRyaWJ1dGVNYXAgPSB7fTtcbiAgICBpZiggdGhpcy5yZXN1bHQucGFja2FnZS5tYXAgKSB7XG4gICAgICB0aGlzLmF0dHJpYnV0ZU1hcCA9IHRoaXMucmVzdWx0LnBhY2thZ2UubWFwO1xuICAgICAgZm9yKCB2YXIga2V5IGluIHRoaXMucmVzdWx0LnBhY2thZ2UubWFwICkge1xuICAgICAgICB0aGlzLmludmVyc2VBdHRyaWJ1dGVNYXBbdGhpcy5yZXN1bHQucGFja2FnZS5tYXBba2V5XV0gPSBrZXk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zb3J0ID0ge307XG4gICAgaWYoIHRoaXMucmVzdWx0LnBhY2thZ2Uuc29ydCApIHtcbiAgICAgIHRoaXMuc29ydCA9IHRoaXMucmVzdWx0LnBhY2thZ2Uuc29ydDtcbiAgICB9XG5cbiAgICB0aGlzLnJlc291cmNlcyA9IHRoaXMucmVzdWx0LmNrYW4ucmVzb3VyY2VzO1xuXG4gICAgdmFyIHppcHMgPSB7fTsgLy8gdXNlZCB0byBxdWlja2x5IGFkZCByZXNvdXJjZSBzdHVic1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5yZXNvdXJjZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5yZXNvdXJjZXNbaV0uZm9ybWF0LnRvTG93ZXJDYXNlKCkgPT09ICd6aXAnICkge1xuICAgICAgICB6aXBzW3RoaXMucmVzb3VyY2VzW2ldLmlkXSA9IHRoaXMucmVzb3VyY2VzW2ldO1xuICAgICAgICB0aGlzLnJlc291cmNlc1tpXS5jaGlsZFJlc291cmNlcyA9IFtdO1xuICAgICAgICB0aGlzLnJlc291cmNlc1tpXS5pc1ppcCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICB0aGlzLnJlc291cmNlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgaWYoIGEubmFtZSA+IGIubmFtZSApIHJldHVybiAxO1xuICAgICAgaWYoIGEubmFtZSA8IGIubmFtZSApIHJldHVybiAtMTtcbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuXG5cbiAgICB0aGlzLnJlc291cmNlTG9va3VwID0ge307XG5cbiAgICAvLyBjcmVhdGUgZmFrZSBzdHVicyBmb3IgemlwIGZpbGUgcmVzb3VyY2VzXG4gICAgdmFyIGFscmVhZHlBZGRlZCA9IHt9O1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhc2hlZXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoICF0aGlzLmRhdGFzaGVldHNbaV0uZnJvbVppcCApIGNvbnRpbnVlO1xuICAgICAgaWYoIGFscmVhZHlBZGRlZFt0aGlzLmRhdGFzaGVldHNbaV0ucmVzb3VyY2VJZF0gKSBjb250aW51ZTtcblxuICAgICAgdmFyIHIgPSB0aGlzLmRhdGFzaGVldHNbaV07XG5cbiAgICAgIHZhciBzdHViID0ge1xuICAgICAgICBpZCA6IHIucmVzb3VyY2VJZCxcbiAgICAgICAgcGFja2FnZV9pZCA6IHIucGFja2FnZUlkLFxuICAgICAgICBmcm9tWmlwIDogdHJ1ZSxcbiAgICAgICAgemlwIDogci56aXAsXG4gICAgICAgIG5hbWUgOiByLm5hbWVcbiAgICAgIH1cblxuICAgICAgemlwc1tyLnppcC5yZXNvdXJjZUlkXS5jaGlsZFJlc291cmNlcy5wdXNoKHN0dWIpO1xuICAgICAgdGhpcy5yZXNvdXJjZXMucHVzaChzdHViKTtcblxuICAgICAgYWxyZWFkeUFkZGVkW3IucmVzb3VyY2VJZF0gPSAxOyAvLyB3aHk/XG4gICAgfVxuXG4gICAgLy8gbWFwIHJlc291cmNlcyB0byBkYXRhc2hlZXRzIGZvciBkYXN0ZXIgbG9va3VwXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnJlc291cmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHZhciBkYXRhc2hlZXRzID0gW107XG4gICAgICBmb3IoIHZhciBqID0gMDsgaiA8IHRoaXMuZGF0YXNoZWV0cy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgaWYoIHRoaXMuZGF0YXNoZWV0c1tqXS5yZXNvdXJjZUlkID09IHRoaXMucmVzb3VyY2VzW2ldLmlkICkge1xuICAgICAgICAgIGRhdGFzaGVldHMucHVzaCh0aGlzLmRhdGFzaGVldHNbal0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVzb3VyY2VMb29rdXBbdGhpcy5yZXNvdXJjZXNbaV0uaWRdID0gdGhpcy5yZXNvdXJjZXNbaV07XG4gICAgICB0aGlzLnJlc291cmNlc1tpXS5kYXRhc2hlZXRzID0gZGF0YXNoZWV0cztcbiAgICB9XG5cbiAgICB0aGlzLmZpcmVVcGRhdGUoKTtcbiAgfVxuXG4gIHRoaXMuc2V0U2hlZXQgPSBmdW5jdGlvbihzaGVldCkge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhc2hlZXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YXNoZWV0c1tpXS5yZXNvdXJjZUlkID09IHNoZWV0LnJlc291cmNlSWQgJiZcbiAgICAgICAgICB0aGlzLmRhdGFzaGVldHNbaV0uc2hlZXRJZCA9PSBzaGVldC5zaGVldElkICkge1xuXG4gICAgICAgICAgdGhpcy5kYXRhc2hlZXRzW2ldID0gc2hlZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlc291cmNlID0gdGhpcy5yZXNvdXJjZUxvb2t1cFtzaGVldC5yZXNvdXJjZUlkXTtcbiAgICBpZiggIXJlc291cmNlICkge1xuICAgICAgY29uc29sZS5sb2coJ0F0dGVtcHRpbmcgdG8gc2V0IHNoZWV0IHdpdGggYSByZXNvdXJjZUlkIHRoYXQgZG9lcyBub3QgZXhpc3QnKTtcbiAgICAgIGNvbnNvbGUubG9nKHNoZWV0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHJlc291cmNlLmRhdGFzaGVldHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggcmVzb3VyY2UuZGF0YXNoZWV0c1tpXS5zaGVldElkID09IHNoZWV0LnNoZWV0SWQgKSB7XG4gICAgICAgICAgcmVzb3VyY2UuZGF0YXNoZWV0c1tpXSA9IHNoZWV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuZmlyZVVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGVlLmVtaXQoJ3VwZGF0ZScpO1xuICB9XG5cbiAgLy8gYWZ0ZXIgYSByZXNvdXJjZSBpcyBhZGRlZCwgb3VyIGVudGlyZSBzdGF0ZSBpcyBkaWZmZXJlbnRcbiAgdGhpcy5ydW5BZnRlclJlc291cmNlQWRkID0gZnVuY3Rpb24od29ya3NwYWNlRGF0YSkge1xuICAgIHRoaXMucmVzdWx0ID0gd29ya3NwYWNlRGF0YTtcbiAgICB0aGlzLl9zZXREYXRhKCk7XG4gIH1cblxuICB0aGlzLmdldERhdGFzZXRFeHRyYSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIGlmKCAhdGhpcy5kYXRhLmV4dHJhcyApIHJldHVybiBudWxsO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEuZXh0cmFzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YS5leHRyYXNbaV0ua2V5ID09IGtleSApIHJldHVybiB0aGlzLmRhdGEuZXh0cmFzW2ldO1xuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH1cblxuICB0aGlzLnNldERhdGFzZXRFeHRyYSA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICBpZiggIXRoaXMuZGF0YS5leHRyYXMgKSB0aGlzLmRhdGEuZXh0cmFzID0gW107XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5leHRyYXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5kYXRhLmV4dHJhc1tpXS5rZXkgPT0ga2V5ICkge1xuICAgICAgICB0aGlzLmRhdGEuZXh0cmFzW2ldLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmRhdGEuZXh0cmFzLnB1c2goe1xuICAgICAga2V5IDoga2V5LFxuICAgICAgdmFsdWUgOiB2YWx1ZVxuICAgIH0pO1xuICB9XG5cbiAgLy8gZ2V0IGFsbCBhdHRpcmJ1dGVzIGZyb20gc2hlZXRzIG1hcmtlZCBhcyBkYXRhXG4gIHRoaXMuZ2V0RGF0YXNoZWV0QXR0cmlidXRlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhdHRycyA9IHt9LCBzaGVldCwgYXR0cjtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhc2hlZXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgc2hlZXQgPSB0aGlzLmRhdGFzaGVldHNbaV07XG4gICAgICBpZiggc2hlZXQubWV0YWRhdGEgKSBjb250aW51ZTtcblxuICAgICAgZm9yKCB2YXIgaiA9IDA7IGogPCBzaGVldC5hdHRyaWJ1dGVzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBhdHRyID0gc2hlZXQuYXR0cmlidXRlc1tqXTtcbiAgICAgICAgYXR0cnNbYXR0cl0gPSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBPYmplY3Qua2V5cyhhdHRycyk7XG4gIH1cblxuICB0aGlzLmlzRWNvc2lzTWV0YWRhdGEgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvXFxzL2csICcnKS50b0xvd2VyQ2FzZSgpO1xuICAgIGZvciggdmFyIGtleSBpbiB0aGlzLm1ldGFkYXRhTG9va3VwICkge1xuICAgICAgaWYoIHRoaXMubWV0YWRhdGFMb29rdXBba2V5XS5mbGF0ID09IG5hbWUgKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdGhpcy5nZXRTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3VudCA9IDA7XG5cbiAgICAvLyBjaGVjayBmb3Igc3BlY3RyYSBsZXZlbCBlY29zaXMgbWV0YWRhdGFcbiAgICAvLyBUT0RPXG4gICAgLyp0aGlzLnNjaGVtYS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgaWYoIHRoaXMuaXNFY29zaXNNZXRhZGF0YShpdGVtLm5hbWUpICkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfSBlbHNlIGlmKCB0aGlzLmludmVyc2VBdHRyaWJ1dGVNYXBbaXRlbS5uYW1lXSAmJlxuICAgICAgICAgICAgICAgIHRoaXMuaXNFY29zaXNNZXRhZGF0YSh0aGlzLmludmVyc2VBdHRyaWJ1dGVNYXBbaXRlbS5uYW1lXSkgKSB7XG5cbiAgICAgICAgY291bnQrKztcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpOyovXG5cbiAgICB2YXIgbWFwID0ge1xuICAgICAgJ0tleXdvcmRzJyA6ICd0YWdzJyxcbiAgICAgICdBdXRob3InIDogJ2F1dGhvcicsXG4gICAgICAnQXV0aG9yIEVtYWlsJyA6ICdhdXRob3JfZW1haWwnLFxuICAgICAgJ01haW50YWluZXInIDogJ21haW50YWluZXInLFxuICAgICAgJ01haW50YWluZXIgRW1haWwnIDogJ21haW50YWluZXJfZW1haWwnXG4gICAgfVxuXG4gICAgLy8gY2hlY2sgZGF0YXNldCBsZXZlbCBlY29zaXMgbWV0YWRhdGFcbiAgICBmb3IoIHZhciBrZXkgaW4gdGhpcy5tZXRhZGF0YUxvb2t1cCApIHtcbiAgICAgIGlmKCBtYXBba2V5XSAmJiB0aGlzLmRhdGFbbWFwW2tleV1dICkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfSBlbHNlIGlmKCB0aGlzLmdldERhdGFzZXRFeHRyYShrZXkpLnZhbHVlICkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCB0aGlzLmRhdGEubm90ZXMgKSBjb3VudCsrO1xuICAgIGlmKCB0aGlzLmRhdGEub3duZXJfb3JnICkgY291bnQrKztcblxuXG4gICAgcmV0dXJuIGNvdW50O1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiTWVhc3VyZW1lbnRcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkFjcXVpc2l0aW9uIE1ldGhvZFwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkNvbnRhY3RcIixcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIlBpeGVsXCIsXG4gICAgICAgIFwiUHJveGltYWxcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNaW5pbXVtIG1lYXN1cmVtZW50IHVuaXQgZm9yIHlvdXIgc3BlY3RyYSAoaS5lLiBjb250YWN0IHByb2JlLCBwcm94aW1hbCB3aXRoIFgtZGVncmVlIGZvcmVvcHRpYywgcGl4ZWwsIG90aGVyKS5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJTYW1wbGUgUGxhdGZvcm1cIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBaXJwbGFuZVwiLFxuICAgICAgICBcIkJvb21cIixcbiAgICAgICAgXCJTYXRlbGxpdGVcIixcbiAgICAgICAgXCJUb3dlclwiLFxuICAgICAgICBcIlVBVlwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlBsYXRmb3JtIGZyb20gd2hpY2ggdGhlIHNwZWN0cmFsIG1lYXN1cmVtZW50cyB3ZXJlIG1hZGUgKGUuZy4gaGFuZGhlbGQsIGJvb20sIHRyYW0sIFVBVikuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1lYXN1cmVtZW50IFZlbnVlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiR3JlZW5ob3VzZVwiLFxuICAgICAgICBcIkxhYm9yYXRvcnlcIixcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIk91dGRvb3JcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTZXR0aW5nIGluIHdoaWNoIHRoZSBzcGVjdHJhbCBtZWFzdXJlbWVudHMgd2VyZSBtYWRlLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlRhcmdldCBUeXBlXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQW5pbWFsXCIsXG4gICAgICAgIFwiQmFya1wiLFxuICAgICAgICBcIkJyYW5jaFwiLFxuICAgICAgICBcIkNhbm9weVwiLFxuICAgICAgICBcIkZsb3dlclwiLFxuICAgICAgICBcIkxlYWZcIixcbiAgICAgICAgXCJNaW5lcmFsXCIsXG4gICAgICAgIFwiTlBWXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJSZWZlcmVuY2VcIixcbiAgICAgICAgXCJSb2NrXCIsXG4gICAgICAgIFwiU29pbFwiLFxuICAgICAgICBcIldhdGVyXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRGVzY3JpYmVzIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWVhc3VyZW1lbnQgUXVhbnRpdHlcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBYnNvcnB0YW5jZVwiLFxuICAgICAgICBcIkROXCIsXG4gICAgICAgIFwiSW5kZXhcIixcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIlJhZGlhbmNlXCIsXG4gICAgICAgIFwiUmVmbGVjdGFuY2VcIixcbiAgICAgICAgXCJUcmFuc2ZsZWN0YW5jZVwiLFxuICAgICAgICBcIlRyYW5zbWl0dGFuY2VcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbmRleCBOYW1lXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1lYXN1cmVtZW50IHF1YW50aXR5J3MgaW5kZXggbmFtZS4gIFBsZWFzZSBwcm92aWRlIGlmIE1lYXN1cmVtZW50IFF1YW50aXR5ID0gXFxcIkluZGV4XFxcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNZWFzdXJlbWVudCBVbml0c1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTY2FsZSBmb3Igc3BlY3RyYWwgaW5zdGVuc2l0eSAoZS5nLiBETiwgcmFkaWFuY2UsIGlycmFkaWFuY2UsIHJlZmxlY3RhbmNlKVwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJXYXZlbGVuZ3RoIFVuaXRzXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJVbml0bGVzc1wiLFxuICAgICAgICBcIm5tXCIsXG4gICAgICAgIFwidW1cIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXYXZlbGVuZ3RoIHVuaXRzIChlLmcuIG5tLCB1bSwgSHopXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlRhcmdldCBTdGF0dXNcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJEcmllZFwiLFxuICAgICAgICBcIkZyZXNoXCIsXG4gICAgICAgIFwiR3JlZW5cIixcbiAgICAgICAgXCJHcm91bmRcIixcbiAgICAgICAgXCJMaXF1aWRcIixcbiAgICAgICAgXCJMaXZlXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJQYW5lbFwiLFxuICAgICAgICBcIlN0YW5kYXJkXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3RhdGUgb2YgdGhlIG1lYXN1cmVtZW50IHRhcmdldC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMaWdodCBTb3VyY2VcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJMYW1wXCIsXG4gICAgICAgIFwiTGFzZXJcIixcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIlN1blwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkRlc2NyaXB0aW9uIG9mIHRoZSBsaWdodCBzb3VyY2UgdXNlZCBmb3IgeW91ciBzcGVjdHJhbCBtZWFzdXJlbWVudHNcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMaWdodCBTb3VyY2UgU3BlY2lmaWNhdGlvbnNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkZvcmVvcHRpYyBUeXBlXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQmFyZSBGaWJlclwiLFxuICAgICAgICBcIkNvc2luZSBEaWZmdXNlclwiLFxuICAgICAgICBcIkZvcmVvcHRpY1wiLFxuICAgICAgICBcIkdlcnNob24gVHViZVwiLFxuICAgICAgICBcIkludGVncmF0aW5nIFNwaGVyZVwiLFxuICAgICAgICBcIkxlYWYgQ2xpcFwiLFxuICAgICAgICBcIk5vbmVcIixcbiAgICAgICAgXCJPdGhlclwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkRlc2NyaXB0aW9uIG9mIHRoZSBmb3Jlb3B0aWMgdXNlZCB0byBtYWtlIHlvdXIgc3BlY3RyYWwgbWVhc3VyZW1lbnRcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGb3Jlb3B0aWMgRmllbGQgb2YgVmlld1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJpbnRlZ2VyIGRlZ3JlZXNcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRm9yZW9wdGljIFNwZWNpZmljYXRpb25zXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIlByb2Nlc3NpbmcgSW5mb3JtYXRpb25cIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlByb2Nlc3NpbmcgQXZlcmFnZWRcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJOb1wiLFxuICAgICAgICBcIlllc1wiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIklzIHRoZSBtZWFzdXJlbWVudCBhbiBhdmVyYWdlIG9mIG90aGVyIG1lYXN1cmVtZW50cz9cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUHJvY2Vzc2luZyBJbnRlcnBvbGF0ZWRcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJOb1wiLFxuICAgICAgICBcIlllc1wiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIklzIHRoZSBtZWFzdXJlbWVudCBpbnRlcnBvbGF0ZWQ/XCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlByb2Nlc3NpbmcgUmVzYW1wbGVkXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTm9cIixcbiAgICAgICAgXCJZZXNcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJcyB0aGUgbWVhc3VyZW1lbnQgcmVzYW1wbGVkP1wiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIEluZm9ybWF0aW9uIERldGFpbHNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiBmYWxzZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk90aGVyIGRldGFpbHMgYWJvdXQgcHJvY2Vzc2luZyBhcmUgcHJvdmlkZWQgaGVyZS5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJJbnN0cnVtZW50XCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbnN0cnVtZW50IE1hbnVmYWN0dXJlclwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTcGVjdHJvbWV0ZXIgbWFudWZhY3R1cmVyLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbnN0cnVtZW50IE1vZGVsXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNwZWN0cm9tZXRlciBtb2RlbC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiSW5zdHJ1bWVudCBTZXJpYWwgTnVtYmVyXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIlRoZW1lXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJUaGVtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkFncmljdWx0dXJlXCIsXG4gICAgICAgIFwiQmlvY2hlbWlzdHJ5XCIsXG4gICAgICAgIFwiRWNvbG9neVwiLFxuICAgICAgICBcIkZvcmVzdFwiLFxuICAgICAgICBcIkdsb2JhbCBDaGFuZ2VcIixcbiAgICAgICAgXCJMYW5kIENvdmVyXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJQaGVub2xvZ3lcIixcbiAgICAgICAgXCJQaHlzaW9sb2d5XCIsXG4gICAgICAgIFwiVXJiYW5cIixcbiAgICAgICAgXCJXYXRlciBRdWFsaXR5XCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmVzZWFyY2ggY29udGV4dCBmb3IgdGhlIHRoZSBzcGVjdHJhbCBtZWFzdXJlbWVudHMuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiS2V5d29yZHNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiBmYWxzZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJFY29zeXN0ZW0gVHlwZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkFxdWF0aWNcIixcbiAgICAgICAgXCJDb2FzdGFsXCIsXG4gICAgICAgIFwiQ3JvcHNcIixcbiAgICAgICAgXCJGb3Jlc3RcIixcbiAgICAgICAgXCJHcmFzc2xhbmRcIixcbiAgICAgICAgXCJXZXRsYW5kXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiTG9jYXRpb25cIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxhdGl0dWRlXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwibGF0bG5nXCIsXG4gICAgICBcInVuaXRzXCI6IFwiZGVjaW1hbCBkZWdyZWVcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTG9uZ2l0dWRlXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwibGF0bG5nXCIsXG4gICAgICBcInVuaXRzXCI6IFwiZGVjaW1hbCBkZWdyZWVcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiZ2VvanNvblwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImdlb2pzb25cIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTG9jYXRpb24gTmFtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IGZhbHNlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiRGF0ZVwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiU2FtcGxlIENvbGxlY3Rpb24gRGF0ZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImRhdGVcIixcbiAgICAgIFwidW5pdHNcIjogXCJJU08gRGF0ZSBcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWVhc3VyZW1lbnQgRGF0ZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImRhdGVcIixcbiAgICAgIFwidW5pdHNcIjogXCJJU08gRGF0ZSBcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUGhlbm9sb2dpY2FsIFN0YXR1c1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJTcGVjaWVzXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJDb21tb24gTmFtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJDb21tb24gbmFtZSBvZiB0aGUgdGFyZ2V0IHRoYXQgd2FzIG1lYXN1cmVkLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMYXRpbiBHZW51c1wiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMYXRpbiBnZW51cyBvZiB0aGUgdGFyZ2V0IHRoYXQgd2FzIG1lYXN1cmVkLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMYXRpbiBTcGVjaWVzXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkxhdGluIHNwZWNpZXMgb2YgdGhlIHRhcmdldCB0aGF0IHdhcyBtZWFzdXJlZC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVVNEQSBTeW1ib2xcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVVNEQSBjb2RlIG9mIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlZlZ2V0YXRpb24gVHlwZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJDaXRhdGlvblwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ2l0YXRpb25cIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiBmYWxzZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJDaXRhdGlvbiBET0lcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiBmYWxzZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJXZWJzaXRlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogZmFsc2UsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQXV0aG9yXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogZmFsc2UsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQXV0aG9yIEVtYWlsXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogZmFsc2UsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWFpbnRhaW5lclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IGZhbHNlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1haW50YWluZXIgRW1haWxcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiBmYWxzZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGdW5kaW5nIFNvdXJjZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IGZhbHNlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkZ1bmRpbmcgU291cmNlIEdyYW50IE51bWJlclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IGZhbHNlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF1cbn0iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG5cbi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3QgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93XG4gID8gKHRoaXMgfHwgc2VsZilcbiAgOiB3aW5kb3c7XG5cbi8qKlxuICogTm9vcC5cbiAqL1xuXG5mdW5jdGlvbiBub29wKCl7fTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGhvc3Qgb2JqZWN0LFxuICogd2UgZG9uJ3Qgd2FudCB0byBzZXJpYWxpemUgdGhlc2UgOilcbiAqXG4gKiBUT0RPOiBmdXR1cmUgcHJvb2YsIG1vdmUgdG8gY29tcG9lbnQgbGFuZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0hvc3Qob2JqKSB7XG4gIHZhciBzdHIgPSB7fS50b1N0cmluZy5jYWxsKG9iaik7XG5cbiAgc3dpdGNoIChzdHIpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZpbGVdJzpcbiAgICBjYXNlICdbb2JqZWN0IEJsb2JdJzpcbiAgICBjYXNlICdbb2JqZWN0IEZvcm1EYXRhXSc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIFhIUi5cbiAqL1xuXG5yZXF1ZXN0LmdldFhIUiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAgICYmICghcm9vdC5sb2NhdGlvbiB8fCAnZmlsZTonICE9IHJvb3QubG9jYXRpb24ucHJvdG9jb2xcbiAgICAgICAgICB8fCAhcm9vdC5BY3RpdmVYT2JqZWN0KSkge1xuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC42LjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuMy4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSwgYWRkZWQgdG8gc3VwcG9ydCBJRS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIHRyaW0gPSAnJy50cmltXG4gID8gZnVuY3Rpb24ocykgeyByZXR1cm4gcy50cmltKCk7IH1cbiAgOiBmdW5jdGlvbihzKSB7IHJldHVybiBzLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZywgJycpOyB9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgZ2l2ZW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VyaWFsaXplKG9iaikge1xuICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gIHZhciBwYWlycyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKG51bGwgIT0gb2JqW2tleV0pIHtcbiAgICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSlcbiAgICAgICAgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2tleV0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0ID0gc2VyaWFsaXplO1xuXG4gLyoqXG4gICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICogQGFwaSBwcml2YXRlXG4gICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgnJicpO1xuICB2YXIgcGFydHM7XG4gIHZhciBwYWlyO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICBwYXJ0cyA9IHBhaXIuc3BsaXQoJz0nKTtcbiAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBFeHBvc2UgcGFyc2VyLlxuICovXG5cbnJlcXVlc3QucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcblxuLyoqXG4gKiBEZWZhdWx0IE1JTUUgdHlwZSBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICovXG5cbnJlcXVlc3QudHlwZXMgPSB7XG4gIGh0bWw6ICd0ZXh0L2h0bWwnLFxuICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gIHhtbDogJ2FwcGxpY2F0aW9uL3htbCcsXG4gIHVybGVuY29kZWQ6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybS1kYXRhJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbi8qKlxuICogRGVmYXVsdCBzZXJpYWxpemF0aW9uIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ob2JqKXtcbiAqICAgICAgIHJldHVybiAnZ2VuZXJhdGVkIHhtbCBoZXJlJztcbiAqICAgICB9O1xuICpcbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemUgPSB7XG4gICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogc2VyaWFsaXplLFxuICAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnN0cmluZ2lmeVxuIH07XG5cbiAvKipcbiAgKiBEZWZhdWx0IHBhcnNlcnMuXG4gICpcbiAgKiAgICAgc3VwZXJhZ2VudC5wYXJzZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihzdHIpe1xuICAqICAgICAgIHJldHVybiB7IG9iamVjdCBwYXJzZWQgZnJvbSBzdHIgfTtcbiAgKiAgICAgfTtcbiAgKlxuICAqL1xuXG5yZXF1ZXN0LnBhcnNlID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcGFyc2VTdHJpbmcsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5wYXJzZVxufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gaGVhZGVyIGBzdHJgIGludG9cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtYXBwZWQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyKHN0cikge1xuICB2YXIgbGluZXMgPSBzdHIuc3BsaXQoL1xccj9cXG4vKTtcbiAgdmFyIGZpZWxkcyA9IHt9O1xuICB2YXIgaW5kZXg7XG4gIHZhciBsaW5lO1xuICB2YXIgZmllbGQ7XG4gIHZhciB2YWw7XG5cbiAgbGluZXMucG9wKCk7IC8vIHRyYWlsaW5nIENSTEZcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBsaW5lID0gbGluZXNbaV07XG4gICAgaW5kZXggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBmaWVsZCA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdHJpbShsaW5lLnNsaWNlKGluZGV4ICsgMSkpO1xuICAgIGZpZWxkc1tmaWVsZF0gPSB2YWw7XG4gIH1cblxuICByZXR1cm4gZmllbGRzO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJhbXMoc3RyKXtcbiAgcmV0dXJuIHJlZHVjZShzdHIuc3BsaXQoLyAqOyAqLyksIGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLylcbiAgICAgICwga2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgLCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICAvLyByZXNwb25zZVRleHQgaXMgYWNjZXNzaWJsZSBvbmx5IGlmIHJlc3BvbnNlVHlwZSBpcyAnJyBvciAndGV4dCcgYW5kIG9uIG9sZGVyIGJyb3dzZXJzXG4gIHRoaXMudGV4dCA9ICgodGhpcy5yZXEubWV0aG9kICE9J0hFQUQnICYmICh0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICcnIHx8IHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnKSkgfHwgdHlwZW9mIHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgID8gdGhpcy54aHIucmVzcG9uc2VUZXh0XG4gICAgIDogbnVsbDtcbiAgdGhpcy5zdGF0dXNUZXh0ID0gdGhpcy5yZXEueGhyLnN0YXR1c1RleHQ7XG4gIHRoaXMuc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG4gIHRoaXMuYm9keSA9IHRoaXMucmVxLm1ldGhvZCAhPSAnSEVBRCdcbiAgICA/IHRoaXMucGFyc2VCb2R5KHRoaXMudGV4dCA/IHRoaXMudGV4dCA6IHRoaXMueGhyLnJlc3BvbnNlKVxuICAgIDogbnVsbDtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbihoZWFkZXIpe1xuICAvLyBjb250ZW50LXR5cGVcbiAgdmFyIGN0ID0gdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB0eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgdmFyIG9iaiA9IHBhcmFtcyhjdCk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHRoaXNba2V5XSA9IG9ialtrZXldO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIHJldHVybiBwYXJzZSAmJiBzdHIgJiYgKHN0ci5sZW5ndGggfHwgc3RyIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbihzdGF0dXMpe1xuICAvLyBoYW5kbGUgSUU5IGJ1ZzogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDA0Njk3Mi9tc2llLXJldHVybnMtc3RhdHVzLWNvZGUtb2YtMTIyMy1mb3ItYWpheC1yZXF1ZXN0XG4gIGlmIChzdGF0dXMgPT09IDEyMjMpIHtcbiAgICBzdGF0dXMgPSAyMDQ7XG4gIH1cblxuICB2YXIgdHlwZSA9IHN0YXR1cyAvIDEwMCB8IDA7XG5cbiAgLy8gc3RhdHVzIC8gY2xhc3NcbiAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IDEgPT0gdHlwZTtcbiAgdGhpcy5vayA9IDIgPT0gdHlwZTtcbiAgdGhpcy5jbGllbnRFcnJvciA9IDQgPT0gdHlwZTtcbiAgdGhpcy5zZXJ2ZXJFcnJvciA9IDUgPT0gdHlwZTtcbiAgdGhpcy5lcnJvciA9ICg0ID09IHR5cGUgfHwgNSA9PSB0eXBlKVxuICAgID8gdGhpcy50b0Vycm9yKClcbiAgICA6IGZhbHNlO1xuXG4gIC8vIHN1Z2FyXG4gIHRoaXMuYWNjZXB0ZWQgPSAyMDIgPT0gc3RhdHVzO1xuICB0aGlzLm5vQ29udGVudCA9IDIwNCA9PSBzdGF0dXM7XG4gIHRoaXMuYmFkUmVxdWVzdCA9IDQwMCA9PSBzdGF0dXM7XG4gIHRoaXMudW5hdXRob3JpemVkID0gNDAxID09IHN0YXR1cztcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gNDA2ID09IHN0YXR1cztcbiAgdGhpcy5ub3RGb3VuZCA9IDQwNCA9PSBzdGF0dXM7XG4gIHRoaXMuZm9yYmlkZGVuID0gNDAzID09IHN0YXR1cztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVxID0gdGhpcy5yZXE7XG4gIHZhciBtZXRob2QgPSByZXEubWV0aG9kO1xuICB2YXIgdXJsID0gcmVxLnVybDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgdXJsICsgJyAoJyArIHRoaXMuc3RhdHVzICsgJyknO1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZXJyID0gbnVsbDtcbiAgICB2YXIgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICB2YXIgbmV3X2VyciA9IG5ldyBFcnJvcihyZXMuc3RhdHVzVGV4dCB8fCAnVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2UnKTtcbiAgICBuZXdfZXJyLm9yaWdpbmFsID0gZXJyO1xuICAgIG5ld19lcnIucmVzcG9uc2UgPSByZXM7XG4gICAgbmV3X2Vyci5zdGF0dXMgPSByZXMuc3RhdHVzO1xuXG4gICAgc2VsZi5jYWxsYmFjayhlcnIgfHwgbmV3X2VyciwgcmVzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgLlxuICovXG5cbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4vKipcbiAqIEFsbG93IGZvciBleHRlbnNpb25cbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihmbikge1xuICBmbih0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogU2V0IHRpbWVvdXQgdG8gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMpe1xuICB0aGlzLl90aW1lb3V0ID0gbXM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLl90aW1lb3V0ID0gMDtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5hYm9ydGVkKSByZXR1cm47XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMueGhyLmFib3J0KCk7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpe1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBoZWFkZXIgYGZpZWxkYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnVuc2V0KCdVc2VyLUFnZW50JylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51bnNldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgZGVsZXRlIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbiAgZGVsZXRlIHRoaXMuaGVhZGVyW2ZpZWxkXTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0SGVhZGVyID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzKXtcbiAgdmFyIHN0ciA9IGJ0b2EodXNlciArICc6JyArIHBhc3MpO1xuICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgc3RyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbipcbiogRXhhbXBsZXM6XG4qXG4qICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4qICAgICAucXVlcnkoJ3NpemU9MTAnKVxuKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuKlxuKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiogQGFwaSBwdWJsaWNcbiovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKXtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgZmllbGQgYG5hbWVgIGFuZCBgdmFsYCBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCJcbiAqIHJlcXVlc3QgYm9kaWVzLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKCdmb28nLCAnYmFyJylcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd8QmxvYnxGaWxlfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5maWVsZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKG5hbWUsIHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgZmlsZW5hbWVgLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmF0dGFjaChuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbihmaWVsZCwgZmlsZSwgZmlsZW5hbWUpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyByb290LkZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChmaWVsZCwgZmlsZSwgZmlsZW5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAsIGRlZmF1bHRpbmcgdGhlIGAudHlwZSgpYCB0byBcImpzb25cIiB3aGVuXG4gKiBhbiBvYmplY3QgaXMgZ2l2ZW4uXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICAgLy8gcXVlcnlzdHJpbmdcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtdWx0aXBsZSBkYXRhIFwid3JpdGVzXCJcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLnNlbmQoeyBzZWFyY2g6ICdxdWVyeScgfSlcbiAqICAgICAgICAgLnNlbmQoeyByYW5nZTogJzEuLjUnIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgb3JkZXI6ICdkZXNjJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoJ25hbWU9dGonKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBkZWZhdWx0cyB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgKiAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAgKiAgICAgICAgLnNlbmQoJ3NwZWNpZXM9ZmVycmV0JylcbiAgKiAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSl7XG4gIHZhciBvYmogPSBpc09iamVjdChkYXRhKTtcbiAgdmFyIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG5cbiAgLy8gbWVyZ2VcbiAgaWYgKG9iaiAmJiBpc09iamVjdCh0aGlzLl9kYXRhKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9IGVsc2UgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBkYXRhKSB7XG4gICAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2Zvcm0nKTtcbiAgICB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyA9PSB0eXBlKSB7XG4gICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGF0YVxuICAgICAgICA/IHRoaXMuX2RhdGEgKyAnJicgKyBkYXRhXG4gICAgICAgIDogZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGF0YSA9ICh0aGlzLl9kYXRhIHx8ICcnKSArIGRhdGE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgaWYgKCFvYmogfHwgaXNIb3N0KGRhdGEpKSByZXR1cm4gdGhpcztcbiAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2pzb24nKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBgZXJyYCBhbmQgYHJlc2BcbiAqIGFuZCBoYW5kbGUgYXJpdHkgY2hlY2suXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24oZXJyLCByZXMpe1xuICB2YXIgZm4gPSB0aGlzLl9jYWxsYmFjaztcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgZm4oZXJyLCByZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicpO1xuICBlcnIuY3Jvc3NEb21haW4gPSB0cnVlO1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSByZXF1ZXN0LmdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcblxuICAgIC8vIEluIElFOSwgcmVhZHMgdG8gYW55IHByb3BlcnR5IChlLmcuIHN0YXR1cykgb2ZmIG9mIGFuIGFib3J0ZWQgWEhSIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gdGhlIGVycm9yIFwiQ291bGQgbm90IGNvbXBsZXRlIHRoZSBvcGVyYXRpb24gZHVlIHRvIGVycm9yIGMwMGMwMjNmXCJcbiAgICB2YXIgc3RhdHVzO1xuICAgIHRyeSB7IHN0YXR1cyA9IHhoci5zdGF0dXMgfSBjYXRjaChlKSB7IHN0YXR1cyA9IDA7IH1cblxuICAgIGlmICgwID09IHN0YXR1cykge1xuICAgICAgaWYgKHNlbGYudGltZWRvdXQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIHZhciBoYW5kbGVQcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgIGlmIChlLnRvdGFsID4gMCkge1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gIH07XG4gIGlmICh0aGlzLmhhc0xpc3RlbmVycygncHJvZ3Jlc3MnKSkge1xuICAgIHhoci5vbnByb2dyZXNzID0gaGFuZGxlUHJvZ3Jlc3M7XG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAoeGhyLnVwbG9hZCAmJiB0aGlzLmhhc0xpc3RlbmVycygncHJvZ3Jlc3MnKSkge1xuICAgICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gaGFuZGxlUHJvZ3Jlc3M7XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICAvLyBBY2Nlc3NpbmcgeGhyLnVwbG9hZCBmYWlscyBpbiBJRSBmcm9tIGEgd2ViIHdvcmtlciwgc28ganVzdCBwcmV0ZW5kIGl0IGRvZXNuJ3QgZXhpc3QuXG4gICAgLy8gUmVwb3J0ZWQgaGVyZTpcbiAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzgzNzI0NS94bWxodHRwcmVxdWVzdC11cGxvYWQtdGhyb3dzLWludmFsaWQtYXJndW1lbnQtd2hlbi11c2VkLWZyb20td2ViLXdvcmtlci1jb250ZXh0XG4gIH1cblxuICAvLyB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc2VsZi50aW1lZG91dCA9IHRydWU7XG4gICAgICBzZWxmLmFib3J0KCk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICAvLyBxdWVyeXN0cmluZ1xuICBpZiAocXVlcnkpIHtcbiAgICBxdWVyeSA9IHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0KHF1ZXJ5KTtcbiAgICB0aGlzLnVybCArPSB+dGhpcy51cmwuaW5kZXhPZignPycpXG4gICAgICA/ICcmJyArIHF1ZXJ5XG4gICAgICA6ICc/JyArIHF1ZXJ5O1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICFpc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpXTtcbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yICh2YXIgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAobnVsbCA9PSB0aGlzLmhlYWRlcltmaWVsZF0pIGNvbnRpbnVlO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcbiAgeGhyLnNlbmQoZGF0YSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlcXVlc3RgLlxuICovXG5cbnJlcXVlc3QuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogSXNzdWUgYSByZXF1ZXN0OlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgIHJlcXVlc3QoJ0dFVCcsICcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnLCBjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gdXJsIG9yIGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiByZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB1cmwpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVxdWVzdChtZXRob2QsIHVybCk7XG59XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEhFQUQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5kZWwgPSBmdW5jdGlvbih1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiXG4vKipcbiAqIFJlZHVjZSBgYXJyYCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFxuICpcbiAqIFRPRE86IGNvbWJhdGlibGUgZXJyb3IgaGFuZGxpbmc/XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuLCBpbml0aWFsKXsgIFxuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gIHZhciBjdXJyID0gYXJndW1lbnRzLmxlbmd0aCA9PSAzXG4gICAgPyBpbml0aWFsXG4gICAgOiBhcnJbaWR4KytdO1xuXG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICBjdXJyID0gZm4uY2FsbChudWxsLCBjdXJyLCBhcnJbaWR4XSwgKytpZHgsIGFycik7XG4gIH1cbiAgXG4gIHJldHVybiBjdXJyO1xufTsiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
