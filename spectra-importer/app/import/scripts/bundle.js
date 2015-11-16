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

},{"./ckan":2,"./datastore":3,"events":5}],2:[function(require,module,exports){
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
    var params = '?package_id=' + pkgid +
      '&resource_id=' + rid +
      '&index='+index;
    if( sid ) params += '&sheet_id='+sid;

    get(this.host+'/ecosis/spectra/get'+params, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body);
    });
  }

  this.getSpectraCount = function(pkgid, rid, sid, callback) {
    var params = '?package_id=' + pkgid +
      '&resource_id=' + rid;
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
    get(this.host+'/api/3/action/tag_search?limit='+(limit || 10)+'&query='+query, function(err, resp) {
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
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body.result);
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

},{"superagent":6}],3:[function(require,module,exports){
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
      return
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

},{"./schema.json":4,"events":5}],4:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  root = this;
}

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
 * Force given parser
 * 
 * Sets the body parser no matter type.
 * 
 * @param {Function}
 * @api public
 */

Response.prototype.parse = function(fn){
  this.parser = fn;
  return this;
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
  var parse = this.parser || request.parse[this.type];
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
  this.status = this.statusCode = status;
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

    self.callback(new_err, res);
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
    var contentType = this.getHeader('Content-Type');
    var serialize = request.serialize[contentType ? contentType.split(';')[0] : ''];
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
 * Faux promise support
 *
 * @param {Function} fulfill
 * @param {Function} reject
 * @return {Request}
 */

Request.prototype.then = function (fulfill, reject) {
  return this.end(function(err, res) {
    err ? reject(err) : fulfill(res);
  });
}

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

},{"emitter":7,"reduce":8}],7:[function(require,module,exports){

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

},{}],8:[function(require,module,exports){

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
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb3JlL2FwcC5qcyIsImNvcmUvY2thbi5qcyIsImNvcmUvZGF0YXN0b3JlLmpzIiwiY29yZS9zY2hlbWEuanNvbiIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcm9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG52YXIgRGF0YXN0b3JlID0gcmVxdWlyZSgnLi9kYXRhc3RvcmUnKTtcbnZhciBDS0FOID0gcmVxdWlyZSgnLi9ja2FuJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgdGhpcy51c2VyID0gbnVsbDtcblxuICB0aGlzLmNrYW4gPSBuZXcgQ0tBTih7XG4gICAgaG9zdCA6IGNvbmZpZy5ob3N0XG4gIH0pO1xuXG4gIHRoaXMuZHMgPSBuZXcgRGF0YXN0b3JlKHtcbiAgICBja2FuIDogdGhpcy5ja2FuLFxuICAgIHBhY2thZ2VfaWQgOiBjb25maWcucGFja2FnZV9pZFxuICB9KTtcblxuICAvLyB3aXJlIGV2ZW50c1xuICB2YXIgZWUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIHRoaXMub24gPSBmdW5jdGlvbihlLCBmbikge1xuICAgICAgIGVlLm9uKGUsIGZuKTtcbiAgfTtcblxuXG4gIC8vIGdldCB0aGUgdXNlciBhY2NvdW50XG4gIHRoaXMuY2thbi5nZXRBY3RpdmVVc2VyKGZ1bmN0aW9uKHJlc3Ape1xuICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgdGhpcy51c2VyTG9hZEVycm9yID0gdHJ1ZTtcbiAgICB9XG5cblxuICAgIHRoaXMudXNlciA9IHJlc3A7XG4gICAgZWUuZW1pdCgndXNlci1sb2FkJyk7XG4gIH0uYmluZCh0aGlzKSk7XG5cbiAgaWYoIGNvbmZpZy5wYWNrYWdlX2lkICkgdGhpcy5kcy5sb2FkKCk7XG5cbn1cbiIsInZhciByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xuXG4vLyBkZXBlbmRzIGlmIHdlIGFyZSBydW5uaW5nIGZyb20gbm9kZWpzIG9yIGJyb3dzZXJcbnZhciBhZ2VudCA9IHJlcXVlc3QuYWdlbnQgPyByZXF1ZXN0LmFnZW50KCkgOiByZXF1ZXN0O1xudmFyIGlzQnJvd3NlciA9IHJlcXVlc3QuYWdlbnQgPyBmYWxzZSA6IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHRoaXMuaG9zdCA9IGNvbmZpZy5ob3N0IHx8ICcvJztcblxuICB0aGlzLnByZXBhcmVXb3Jrc3BhY2UgPSBmdW5jdGlvbihwa2dpZCwgY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL3dvcmtzcGFjZS9wcmVwYXJlP2ZvcmNlPXRydWUmcGFja2FnZV9pZD0nK3BrZ2lkLCBmdW5jdGlvbihlcnIsIHJlc3Ape1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZ2V0V29ya3NwYWNlID0gZnVuY3Rpb24ocGtnaWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy93b3Jrc3BhY2UvZ2V0P3BhY2thZ2VfaWQ9Jytwa2dpZCwgZnVuY3Rpb24oZXJyLCByZXNwKXtcbiAgICAgIGNhbGxiYWNrKHJlc3AuYm9keSk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLmdldEFjdGl2ZVVzZXIgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvdXNlci9nZXQnLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGNhbGxiYWNrKHJlc3AuYm9keSlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSByZXNvdXJjZSB0byBhIHBhY2thZ2UgdXNpbmcgdGhlIGJyb3dzZXJzIEZvcm1EYXRhIG9iamVjdCBpbiBhIGJyb3dzZXJcbiAgICogb3IgdXNlciB0aGUgc3VwZXJhZ2VudCBmb3IgTm9kZUpTXG4gICAqXG4gICAqIHBrZ2lkOiBpZCBvZiB0aGUgcGFja2FnZSB0byBhZGQgdG9cbiAgICogZmlsZTogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgdG8gcmVzb3VyY2UgdG8gdXBsb2FkIG9yIGlmIE5vZGVKUyBzdHJpbmcgcGF0aCB0byBmaWxlXG4gICAqIGNhbGxiYWNrOiBjYWxsYmFjayBoYW5kbGVyXG4gICAqIHByb2dyZXNzOiBjYWxsYmFjayBmb3IgcHJvZ3Jlc3MgdXBkYXRlIChub3Qgc3VwcG9ydGVkIGluIE5vZGVKUylcbiAgICoqL1xuICB0aGlzLmFkZFJlc291cmNlID0gZnVuY3Rpb24ocGtnaWQsIGZpbGUsIGNhbGxiYWNrLCBwcm9ncmVzcykge1xuICAgIGlmKCBpc0Jyb3dzZXIgKSB0aGlzLl9hZGRSZXNvdXJjZUJyb3dzZXIocGtnaWQsIGZpbGUsIGNhbGxiYWNrLCBwcm9ncmVzcyk7XG4gICAgZWxzZSB0aGlzLl9hZGRSZXNvdXJjZU5vZGUocGtnaWQsIGZpbGUsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFRPRE86IHRoaXMgbmVlZHMgdG8gYmUgdmVyaWZpZWQgOi9cbiAgdGhpcy5fYWRkUmVzb3VyY2VOb2RlID0gZnVuY3Rpb24ocGtnaWQsIGZpbGUsIGNhbGxiYWNrKSB7XG4gICAgcmVxdWVzdFxuICAgICAucG9zdCh0aGlzLmhvc3QgKyAnL2FwaS8zL2FjdGlvbi9yZXNvdXJjZV9jcmVhdGUnKVxuICAgICAud2l0aENyZWRlbnRpYWxzKClcbiAgICAgLmZpZWxkKCdwYWNrYWdlX2lkJywgcGtnaWQpXG4gICAgIC5maWVsZCgnbWltZXR5cGUnLCBmaWxlLm1pbWV0eXBlKVxuICAgICAuZmllbGQoJ25hbWUnLCBmaWxlLmZpbGVuYW1lKVxuICAgICAuZmllbGQoJ3VybCcsJ3VwbG9hZCcpXG4gICAgIC5hdHRhY2goJ3VwbG9hZCcsIGZpbGUubWltZXR5cGUpXG4gICAgIC5lbmQoY2FsbGJhY2spO1xuICB9XG5cbiAgdGhpcy5fYWRkUmVzb3VyY2VCcm93c2VyID0gZnVuY3Rpb24ocGtnaWQsIGZpbGUsIGNhbGxiYWNrLCBwcm9ncmVzcykge1xuICAgIC8vIFRPRE86IGlmIHRoaXMgZmFpbHMsIHdlIGhhdmUgYW4gaXNzdWUgb24gb3VyIGhhbmRzXG4gICAgdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgICBmb3JtRGF0YS5hcHBlbmQoJ3BhY2thZ2VfaWQnLCBwa2dpZCk7XG4gICAgZm9ybURhdGEuYXBwZW5kKCdtaW1ldHlwZScsIGZpbGUubWltZXR5cGUpO1xuICAgIGZvcm1EYXRhLmFwcGVuZCgnbmFtZScsIGZpbGUuZmlsZW5hbWUpO1xuICAgIGZvcm1EYXRhLmFwcGVuZCgndXJsJywgJ3VwbG9hZCcpO1xuICAgIGZvcm1EYXRhLmFwcGVuZCgndXBsb2FkJywgbmV3IEJsb2IoW2ZpbGUuY29udGVudHNdLCB7dHlwZTogZmlsZS5taW1ldHlwZX0pLCBmaWxlLmZpbGVuYW1lKTtcblxuICAgIHZhciB0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICB2YXIgeGhyID0gJC5hamF4U2V0dGluZ3MueGhyKCk7XG4gICAgLy8gYXR0YWNoIHByb2dyZXNzIGhhbmRsZXIgdG8gdGhlIFhNTEh0dHBSZXF1ZXN0IE9iamVjdFxuICAgIHRyeSB7XG4gICAgICAgIGlmKCBwcm9ncmVzcyApIHtcbiAgICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcInByb2dyZXNzXCIsIGZ1bmN0aW9uKGV2dCl7XG4gICAgICAgICAgICAgICAgaWYgKGV2dC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgZGlmZiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZTtcbiAgICAgICAgICAgICAgICAgIHZhciBzcGVlZCA9IChldnQubG9hZGVkIC8gMTAwMDAwMCkgLyAoZGlmZiAvIDEwMDApO1xuXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzKCgoZXZ0LmxvYWRlZCAvIGV2dC50b3RhbCkqMTAwKS50b0ZpeGVkKDApLCBzcGVlZC50b0ZpeGVkKDIpKydNYnBzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogdGhpcy5ob3N0ICsgJy9hcGkvMy9hY3Rpb24vcmVzb3VyY2VfY3JlYXRlJyxcbiAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgZGF0YTogZm9ybURhdGEsXG4gICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgICBjb250ZW50VHlwZTogZmFsc2UsXG4gICAgICB4aHJGaWVsZHM6IHtcbiAgICAgICAgd2l0aENyZWRlbnRpYWxzOiB0cnVlXG4gICAgICB9LFxuICAgICAgeGhyIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHhocjtcbiAgICAgIH0sXG4gICAgICBzdWNjZXNzOiBjYWxsYmFjayxcbiAgICAgIGVycm9yIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FsbGJhY2soe2Vycm9yOnRydWUsbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB4aHI7XG4gIH1cblxuICAvKnRoaXMuZ2V0TGF5b3V0T3ZlcnZpZXcgPSBmdW5jdGlvbihwa2dpZCwgcmlkLCBzaWQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHBhcmFtcyA9ICc/cGFja2FnZV9pZD0nICsgcGtnaWQgK1xuICAgICAgJyZyZXNvdXJjZV9pZD0nICsgcmlkICtcbiAgICAgICcmZGF0YXNoZWV0X2lkPScgKyBzaWQ7XG5cbiAgICBnZXQodGhpcy5ob3N0Kycvd29ya3NwYWNlL2dldExheW91dE92ZXJ2aWV3JytwYXJhbXMsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICAgIGNhbGxiYWNrKHJlc3AuYm9keSlcbiAgICB9KTtcbiAgfSovXG5cbiAgLyp0aGlzLnNldERlZmF1bHRMYXlvdXQgPSBmdW5jdGlvbihwa2dpZCwgcmVzb3VyY2VMaXN0LCBsYXlvdXQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBwYWNrYWdlX2lkIDogcGtnaWQsXG4gICAgICByZXNvdXJjZXMgOiBKU09OLnN0cmluZ2lmeShyZXNvdXJjZUxpc3QpLFxuICAgICAgbGF5b3V0IDogbGF5b3V0XG4gICAgfTtcblxuICAgIHBvc3QodGhpcy5ob3N0Kycvd29ya3NwYWNlL3NldERlZmF1bHRMYXlvdXQnLCBkYXRhLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6ICdSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfSovXG5cbiAgdGhpcy5nZXREYXRhc2hlZXQgPSBmdW5jdGlvbihwa2dpZCwgcmlkLCBzaWQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHBhcmFtcyA9ICc/cGFja2FnZV9pZD0nICsgcGtnaWQgK1xuICAgICcmcmVzb3VyY2VfaWQ9JyArIHJpZCArXG4gICAgJyZkYXRhc2hlZXRfaWQ9JyArIHNpZDtcblxuICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZ2V0JytwYXJhbXMsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICAgIGNhbGxiYWNrKHJlc3AuYm9keSk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLmdldE1ldGFkYXRhSW5mbyA9IGZ1bmN0aW9uKHBhY2thZ2VfaWQsIHJlc291cmNlX2lkLCBzaGVldF9pZCwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBwYXJhbXMgPSAnP3BhY2thZ2VfaWQ9JyArIHBhY2thZ2VfaWQgK1xuICAgICAgJyZyZXNvdXJjZV9pZD0nICsgcmVzb3VyY2VfaWQ7XG4gICAgICBpZiggc2hlZXRfaWQgKSBwYXJhbXMgKz0gJyZzaGVldF9pZD0nK3NoZWV0X2lkO1xuXG4gICAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL2dldE1ldGFkYXRhSW5mbycrcGFyYW1zLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgdGhpcy5nZXRNZXRhZGF0YUNodW5rID0gZnVuY3Rpb24ocGFja2FnZV9pZCwgcmVzb3VyY2VfaWQsIHNoZWV0X2lkLCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBwYXJhbXMgPSAnP3BhY2thZ2VfaWQ9JyArIHBhY2thZ2VfaWQgK1xuICAgICAgJyZyZXNvdXJjZV9pZD0nICsgcmVzb3VyY2VfaWQgK1xuICAgICAgJyZpbmRleD0nK2luZGV4O1xuICAgICAgaWYoIHNoZWV0X2lkICkgcGFyYW1zICs9ICcmc2hlZXRfaWQ9JytzaGVldF9pZDtcblxuICAgICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9nZXRNZXRhZGF0YUNodW5rJytwYXJhbXMsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgICAgfSk7XG4gIH1cblxuICB0aGlzLmdldFNwZWN0cmEgPSBmdW5jdGlvbihwa2dpZCwgcmlkLCBzaWQsIGluZGV4LCBjYWxsYmFjaykge1xuICAgIHZhciBwYXJhbXMgPSAnP3BhY2thZ2VfaWQ9JyArIHBrZ2lkICtcbiAgICAgICcmcmVzb3VyY2VfaWQ9JyArIHJpZCArXG4gICAgICAnJmluZGV4PScraW5kZXg7XG4gICAgaWYoIHNpZCApIHBhcmFtcyArPSAnJnNoZWV0X2lkPScrc2lkO1xuXG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9zcGVjdHJhL2dldCcrcGFyYW1zLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6J1JlcXVlc3QgRXJyb3InfSk7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5nZXRTcGVjdHJhQ291bnQgPSBmdW5jdGlvbihwa2dpZCwgcmlkLCBzaWQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHBhcmFtcyA9ICc/cGFja2FnZV9pZD0nICsgcGtnaWQgK1xuICAgICAgJyZyZXNvdXJjZV9pZD0nICsgcmlkO1xuICAgIGlmKCBzaWQgKSBwYXJhbXMgKz0gJyZzaGVldF9pZD0nK3NpZDtcblxuICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZ2V0U3BlY3RyYUNvdW50JytwYXJhbXMsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICAgIGNhbGxiYWNrKHJlc3AuYm9keSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIHRoaXMucHJvY2Vzc1Jlc291cmNlID0gZnVuY3Rpb24ocGtnaWQsIHJlc291cmNlX2lkLCBzaGVldF9pZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkLFxuICAgICAgICBvcHRpb25zIDogSlNPTi5zdHJpbmdpZnkob3B0aW9ucylcbiAgICB9XG5cbiAgICAvLyBhcHBseSB0byBtdWx0aXBsZSByZXNvdXJjZXMsIGhlbHBlciBmb3IgZmlyc3QgdXBsb2FkXG4gICAgaWYoIEFycmF5LmlzQXJyYXkocmVzb3VyY2VfaWQpICkge1xuICAgICAgZGF0YS5yZXNvdXJjZV9pZHMgPSBKU09OLnN0cmluZ2lmeShyZXNvdXJjZV9pZClcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YS5yZXNvdXJjZV9pZCA9IHJlc291cmNlX2lkO1xuICAgICAgZGF0YS5zaGVldF9pZCA9IHNoZWV0X2lkO1xuICAgIH1cblxuICAgIHBvc3QodGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL3Byb2Nlc3MnLCBkYXRhLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6J1JlcXVlc3QgRXJyb3InfSk7XG5cbiAgICAgIC8vIHVwZGF0ZSBpbmZvIGluIHRoZSBkYXRhc3RvcmUgaWYgd2UgaGF2ZSBvbmVcbiAgICAgIGlmKCB0aGlzLmRzICkge1xuICAgICAgICB0aGlzLmRzLndhdmVsZW5ndGhzID0gcmVzcC53YXZlbGVuZ3RocyB8fCBbXTtcbiAgICAgICAgdGhpcy5kcy5zY2hlbWEgPSBbXTtcbiAgICAgICAgaWYoICFyZXNwLmF0dHJpYnV0ZXMgKSByZXR1cm47XG5cbiAgICAgICAgZm9yKCB2YXIgYXR0ck5hbWUgaW4gcmVzcC5hdHRyaWJ1dGVzICkge1xuICAgICAgICAgICAgdmFyIGF0dHIgPSByZXNwLmF0dHJpYnV0ZXNbYXR0ck5hbWVdO1xuICAgICAgICAgICAgYXR0ci5uYW1lID0gYXR0ck5hbWU7XG4gICAgICAgICAgICB0aGlzLmRzLnNjaGVtYS5wdXNoKGF0dHIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKHJlc3AuYm9keSk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLmdldExpY2Vuc2VMaXN0ID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL2xpY2Vuc2VfbGlzdCcsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICAgIGNhbGxiYWNrKHJlc3AuYm9keS5yZXN1bHQpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5nZXRQYWNrYWdlID0gZnVuY3Rpb24ocGtnaWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9wYWNrYWdlX3Nob3c/aWQ9Jytwa2dpZCwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsIGJvZHk6IHJlc3AuYm9keX0pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMudGFnU2VhcmNoID0gZnVuY3Rpb24ocXVlcnksIGxpbWl0LCBjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vdGFnX3NlYXJjaD9saW1pdD0nKyhsaW1pdCB8fCAxMCkrJyZxdWVyeT0nK3F1ZXJ5LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6ICdSZXF1ZXN0IEVycm9yJywgYm9keTogcmVzcC5ib2R5fSk7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy51cGRhdGVQYWNrYWdlID0gZnVuY3Rpb24ocGtnLCBjYWxsYmFjaykge1xuICAgIGlmKCBwa2cucHJpdmF0ZSApIHtcbiAgICAgIHRoaXMudmVyaWZ5UHJpdmF0ZShwa2cuaWQsXG4gICAgICAgIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVQYWNrYWdlKHBrZywgY2FsbGJhY2spO1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVBhY2thZ2UocGtnLCBjYWxsYmFjayk7XG4gIH1cblxuICB0aGlzLl91cGRhdGVQYWNrYWdlID0gZnVuY3Rpb24ocGtnLCBjYWxsYmFjaykge1xuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL3BhY2thZ2VfdXBkYXRlJywgcGtnLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6J1JlcXVlc3QgRXJyb3InfSk7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy52ZXJpZnlQcml2YXRlID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9wYWNrYWdlL3NldFByaXZhdGU/aWQ9JytpZCwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsIGJvZHk6IHJlc3AuYm9keX0pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZGVsZXRlUGFja2FnZSA9IGZ1bmN0aW9uKHBrZ2lkLCBjYWxsYmFjaykge1xuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL3BhY2thZ2VfZGVsZXRlJywgSlNPTi5zdHJpbmdpZnkoe2lkOiBwa2dpZH0pLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6J1JlcXVlc3QgRXJyb3InfSk7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5jcmVhdGVQYWNrYWdlID0gZnVuY3Rpb24ocGtnLCBjYWxsYmFjaykge1xuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL3BhY2thZ2VfY3JlYXRlJywgcGtnLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6J1JlcXVlc3QgRXJyb3InfSk7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkucmVzdWx0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuc2V0UGFja2FnZU9wdGlvbnMgPSBmdW5jdGlvbihwa2dpZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZCxcbiAgICAgIG9wdGlvbnMgOiBKU09OLnN0cmluZ2lmeShvcHRpb25zKVxuICAgIH07XG5cbiAgICBwb3N0KHRoaXMuaG9zdCsnL2Vjb3Npcy9wYWNrYWdlL3NldE9wdGlvbnMnLCBkYXRhLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGlmKCBpc0Vycm9yKGVyciwgcmVzcCkgKSByZXR1cm4gY2FsbGJhY2soe2Vycm9yOnRydWUsIG1lc3NhZ2U6J1JlcXVlc3QgRXJyb3InfSk7XG4gICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5yZW1vdmVSZXNvdXJjZSA9IGZ1bmN0aW9uKHJlc291cmNlSWQsIGNhbGxiYWNrKSB7XG4gICAgcG9zdFJhdyh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vcmVzb3VyY2VfZGVsZXRlJywgSlNPTi5zdHJpbmdpZnkoe2lkIDogcmVzb3VyY2VJZCB9KSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgICAgY2FsbGJhY2socmVzcCk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLmRlbGV0ZVJlc291cmNlcyA9IGZ1bmN0aW9uKHJlc291cmNlSWRzLCBjYWxsYmFjaykge1xuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL2RlbGV0ZU1hbnknLCBKU09OLnN0cmluZ2lmeSh7aWRzIDogcmVzb3VyY2VJZHMgfSksIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICAgIGNhbGxiYWNrKHJlc3ApO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5wdXNoVG9TZWFyY2ggPSBmdW5jdGlvbihwa2dpZCwgaW5jbHVkZUVtYWlsLCBjYWxsYmFjaykge1xuICAgIGluY2x1ZGVFbWFpbCA9IGluY2x1ZGVFbWFpbCA/ICd0cnVlJyA6ICdmYWxzZSc7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy93b3Jrc3BhY2UvcHVzaD9wYWNrYWdlX2lkPScrcGtnaWQrJyZlbWFpbD0nK2luY2x1ZGVFbWFpbCwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsIGJvZHk6IHJlc3AuYm9keX0pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuZ2l0SW5mbyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9naXRJbmZvJywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsIGJvZHk6IHJlc3AuYm9keX0pO1xuICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICB9KTtcbiAgfVxuXG59XG5cblxuZnVuY3Rpb24gcG9zdCh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG4gIHJlcXVlc3RcbiAgIC5wb3N0KHVybClcbiAgIC53aXRoQ3JlZGVudGlhbHMoKVxuICAgLnR5cGUoJ2Zvcm0nKVxuICAgLnNlbmQoZGF0YSlcbiAgIC5lbmQoY2FsbGJhY2spXG59XG5cbmZ1bmN0aW9uIHBvc3RSYXcodXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICByZXF1ZXN0XG4gICAucG9zdCh1cmwpXG4gICAud2l0aENyZWRlbnRpYWxzKClcbiAgIC5zZW5kKGRhdGEpXG4gICAuZW5kKGNhbGxiYWNrKVxufVxuXG5mdW5jdGlvbiBnZXQodXJsLCBjYWxsYmFjaykge1xuICByZXF1ZXN0XG4gICAgLmdldCh1cmwpXG4gICAgLndpdGhDcmVkZW50aWFscygpXG4gICAgLmVuZChjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZXJyLCByZXNwKSB7XG4gIGlmKCBlcnIgKSByZXR1cm4gdHJ1ZTtcbiAgaWYoIHJlc3AgJiYgcmVzcC5ib2R5ICYmIHJlc3AuYm9keS5lcnJvciApIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG4iLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHRoaXMuY2thbiA9IGNvbmZpZy5ja2FuO1xuICBpZiggdGhpcy5ja2FuICkgdGhpcy5ja2FuLmRzID0gdGhpcztcblxuICAvLyBpcyB0aGlzIGFuIGV4aXN0aW5nIGRhdGFzZXRcbiAgdGhpcy5lZGl0TW9kZSA9IGNvbmZpZy5wYWNrYWdlX2lkID8gdHJ1ZSA6IGZhbHNlO1xuXG4gIC8vIGV4aXN0aW5nIHBhY2thZ2UgaWRcbiAgdGhpcy5wYWNrYWdlX2lkID0gY29uZmlnLnBhY2thZ2VfaWQ7XG5cbiAgLy8gaW5mb3JtYXRpb24gYWJvdXQgZXhzaXRpbmcgcmVzb3VyY2VzXG4gIC8qdGhpcy5leGlzdGluZyA9IHtcbiAgICByZXNvdXJjZXMgOiBbXSxcbiAgICBtZXRhZGF0YSAgOiBbXSxcbiAgICBkYXRhICAgICAgOiBbXVxuICB9OyovXG5cbiAgdGhpcy5kYXRhID0ge1xuICAgIHRpdGxlIDogJycsXG4gICAgbmFtZSA6ICcnLFxuICAgIG5vdGVzIDogJycsXG4gICAgYXV0aG9yIDogJycsXG4gICAgYXV0aG9yX2VtYWlsIDogJycsXG4gICAgbGljZW5zZV9pZCA6ICcnLFxuICAgIGxpY2Vuc2VfdGl0bGUgOiAnJyxcbiAgICBtYWludGFpbmVyIDogJycsXG4gICAgbWFpbnRhaW5lcl9lbWFpbCA6ICcnLFxuICAgIHZlcnNpb24gOiAnJyxcbiAgICBvd25lcl9vcmcgOiAnJyxcbiAgICB0YWdzIDogW10sXG4gICAgcHJpdmF0ZSA6IGZhbHNlLFxuICAgIGV4dHJhcyA6IFtdXG4gIH07XG5cbiAgdGhpcy5vd25lcl9vcmdfbmFtZSA9ICcnO1xuXG4gIC8vdGhpcy5zY2hlbWEgPSBbXTtcbiAgLy93YXZlbGVuZ3RocyA6IFtdLFxuXG4gIHRoaXMuZGF0YXNldEF0dHJpYnV0ZXMgPSB7XG4gICAgLy9ncm91cF9ieSA6ICcnLFxuICAgIHNvcnRfb24gOiAnJyxcbiAgICBzb3J0X3R5cGUgOiAnJyxcbiAgICBzb3J0X2Rlc2NyaXB0aW9uIDogJydcbiAgfTtcblxuICAvLyBsaXN0IG9mIGFsbCBuZXcgcmVzb3VyY2VzXG4gIHRoaXMucmVzb3VyY2VzID0gW107XG5cbiAgLy8gaGFzaCBvZiBjdXJyZW50IGF0dHJpYnV0ZSBuYW1lIG1hcHBpbmdzXG4gIC8vICAtIGtleTogZWNvc2lzIG5hbWVcbiAgLy8gIC0gdmFsdWU6IGRhdGFzZXQgbmFtZVxuICB0aGlzLmF0dHJpYnV0ZU1hcCA9IHt9O1xuICAvLyBpbnZlcnNlIGxpc3Qgb2YgYWJvdmUgbWFwIHcvIGtleSAvIHZhbHVlIHN3aXRjaGVkXG4gIHRoaXMuaW52ZXJzZUF0dHJpYnV0ZU1hcCA9IHt9O1xuXG4gIHRoaXMubWV0YWRhdGFEZWZpbml0aW9ucyA9IHJlcXVpcmUoJy4vc2NoZW1hLmpzb24nKTtcbiAgdGhpcy5tZXRhZGF0YUxvb2t1cCA9IHt9O1xuICBmb3IoIHZhciBjYXQgaW4gdGhpcy5tZXRhZGF0YURlZmluaXRpb25zICkge1xuICAgIHZhciBkZWZzID0gdGhpcy5tZXRhZGF0YURlZmluaXRpb25zW2NhdF07XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBkZWZzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZGVmc1tpXS5jYXRlZ29yeSA9IGNhdDtcbiAgICAgIGRlZnNbaV0uZmxhdCA9IGRlZnNbaV0ubmFtZS5yZXBsYWNlKC9cXHMvZywnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgIHRoaXMubWV0YWRhdGFMb29rdXBbZGVmc1tpXS5uYW1lXSA9IGRlZnNbaV07XG4gICAgfVxuICB9XG5cbiAgLy8gdGhpcyBmbGFnIHByZXZlbnRzIHVwIGZyb20gbWFraW5nIHVwZGF0ZXMgd2hlbiB3ZSBhcmUgaW5pdGlhbGx5XG4gIC8vIHNldHRpbmcgdGhlIGRhdGFcbiAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcbiAgdGhpcy5sb2FkaW5nRXJyb3IgPSBmYWxzZTtcblxuICAvLyB3aXJlIGV2ZW50c1xuICB2YXIgZWUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIGVlLnNldE1heExpc3RlbmVycygxMDApO1xuICB0aGlzLm9uID0gZnVuY3Rpb24oZSwgZm4pIHtcbiAgICAvLyBpZiB0aGluZ3Mgd2FudCB0byBrbm93IHdlIGFyZSBsb2FkZWQgYW5kIHdlIGhhdmUgYWxyZWFkeSBmaXJlZCwganVzdCB0cmlnZ2VyLlxuICAgIGlmKCBlID09ICdsb2FkJyAmJiB0aGlzLmxvYWRlZCApIHtcbiAgICAgIHNldFRpbWVvdXQoZm4sIDIwMCk7IC8vIEhBQ0s6IG5lZWQgdG8gZml4IHNldFZhbHVlcygpIG9mIGVjb3Npcy0qLWlucHV0XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBlZS5vbihlLCBmbik7XG4gIH07XG5cbiAgdGhpcy5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ja2FuLnByZXBhcmVXb3Jrc3BhY2UodGhpcy5wYWNrYWdlX2lkLCBmdW5jdGlvbihyZXN1bHQpe1xuXG4gICAgICBpZiggcmVzdWx0LmVycm9yICkge1xuICAgICAgICB0aGlzLmxvYWRpbmdFcnJvciA9IHJlc3VsdDtcbiAgICAgICAgZWUuZW1pdCgnbG9hZC1lcnJvcicsIHJlc3VsdCk7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0aGlzLmNrYW4uZ2V0V29ya3NwYWNlKHRoaXMucGFja2FnZV9pZCwgZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAgICAgaWYoIHJlc3VsdC5lcnJvciApIHtcbiAgICAgICAgICB0aGlzLmxvYWRpbmdFcnJvciA9IHJlc3VsdDtcbiAgICAgICAgICBlZS5lbWl0KCdsb2FkLWVycm9yJywgcmVzdWx0KTtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLl9zZXREYXRhKCk7XG5cbiAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICAgICAgICBlZS5lbWl0KCdsb2FkJyk7XG5cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICAvLyBoZWxwZXIgZm9yIHdoZW4gZGF0YSBsb2Fkc1xuICB0aGlzLl9zZXREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lZGl0TW9kZSA9IHRydWU7XG5cbiAgICB2YXIgY2thblBhY2thZ2UgPSB0aGlzLnJlc3VsdC5ja2FuLnBhY2thZ2U7XG4gICAgdGhpcy5wYWNrYWdlX2lkID0gY2thblBhY2thZ2UuaWQ7XG5cbiAgICAvLyBzZXQgdGhlIGRlZmF1bHQgYXR0aXJidXRlcyBmb3IgdGhpcyBkYXRhc2V0XG4gICAgZm9yKCB2YXIga2V5IGluIHRoaXMuZGF0YSApIHtcbiAgICAgIGlmKCBja2FuUGFja2FnZVtrZXldICkgdGhpcy5kYXRhW2tleV0gPSBja2FuUGFja2FnZVtrZXldO1xuICAgIH1cblxuICAgIGlmKCB0aGlzLmRhdGEuZXh0cmFzICYmICFBcnJheS5pc0FycmF5KHRoaXMuZGF0YS5leHRyYXMpICkge1xuICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgZm9yKCB2YXIga2V5IGluIHRoaXMuZGF0YS5leHRyYXMpIHtcbiAgICAgICAgYXJyLnB1c2goe1xuICAgICAgICAgIGtleSA6IGtleSxcbiAgICAgICAgICB2YWx1ZSA6IHRoaXMuZGF0YS5leHRyYXNba2V5XVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZGF0YS5leHRyYXMgPSBhcnI7XG4gICAgfVxuXG4gICAgaWYoIHRoaXMuZGF0YS50YWdzICkge1xuICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEudGFncy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgYXJyLnB1c2goe1xuICAgICAgICAgIG5hbWUgOiB0aGlzLmRhdGEudGFnc1tpXSxcbiAgICAgICAgICBkaXNwbGF5X25hbWUgOiB0aGlzLmRhdGEudGFnc1tpXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZGF0YS50YWdzID0gYXJyO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YXNoZWV0cyA9IHRoaXMucmVzdWx0LnJlc291cmNlcztcblxuICAgIHRoaXMuYXR0cmlidXRlTWFwID0ge307XG4gICAgdGhpcy5pbnZlcnNlQXR0cmlidXRlTWFwID0ge307XG4gICAgaWYoIHRoaXMucmVzdWx0LnBhY2thZ2UubWFwICkge1xuICAgICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSB0aGlzLnJlc3VsdC5wYWNrYWdlLm1hcDtcbiAgICAgIGZvciggdmFyIGtleSBpbiB0aGlzLnJlc3VsdC5wYWNrYWdlLm1hcCApIHtcbiAgICAgICAgdGhpcy5pbnZlcnNlQXR0cmlidXRlTWFwW3RoaXMucmVzdWx0LnBhY2thZ2UubWFwW2tleV1dID0ga2V5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc29ydCA9IHt9O1xuICAgIGlmKCB0aGlzLnJlc3VsdC5wYWNrYWdlLnNvcnQgKSB7XG4gICAgICB0aGlzLnNvcnQgPSB0aGlzLnJlc3VsdC5wYWNrYWdlLnNvcnQ7XG4gICAgfVxuXG4gICAgdGhpcy5yZXNvdXJjZXMgPSB0aGlzLnJlc3VsdC5ja2FuLnJlc291cmNlcztcblxuICAgIHZhciB6aXBzID0ge307IC8vIHVzZWQgdG8gcXVpY2tseSBhZGQgcmVzb3VyY2Ugc3R1YnNcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMucmVzb3VyY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMucmVzb3VyY2VzW2ldLmZvcm1hdC50b0xvd2VyQ2FzZSgpID09PSAnemlwJyApIHtcbiAgICAgICAgemlwc1t0aGlzLnJlc291cmNlc1tpXS5pZF0gPSB0aGlzLnJlc291cmNlc1tpXTtcbiAgICAgICAgdGhpcy5yZXNvdXJjZXNbaV0uY2hpbGRSZXNvdXJjZXMgPSBbXTtcbiAgICAgICAgdGhpcy5yZXNvdXJjZXNbaV0uaXNaaXAgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuXG4gICAgdGhpcy5yZXNvdXJjZXMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgIGlmKCBhLm5hbWUgPiBiLm5hbWUgKSByZXR1cm4gMTtcbiAgICAgIGlmKCBhLm5hbWUgPCBiLm5hbWUgKSByZXR1cm4gLTE7XG4gICAgICByZXR1cm4gMDtcbiAgICB9KTtcblxuXG4gICAgdGhpcy5yZXNvdXJjZUxvb2t1cCA9IHt9O1xuXG4gICAgLy8gY3JlYXRlIGZha2Ugc3R1YnMgZm9yIHppcCBmaWxlIHJlc291cmNlc1xuICAgIHZhciBhbHJlYWR5QWRkZWQgPSB7fTtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YXNoZWV0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCAhdGhpcy5kYXRhc2hlZXRzW2ldLmZyb21aaXAgKSBjb250aW51ZTtcbiAgICAgIGlmKCBhbHJlYWR5QWRkZWRbdGhpcy5kYXRhc2hlZXRzW2ldLnJlc291cmNlSWRdICkgY29udGludWU7XG5cbiAgICAgIHZhciByID0gdGhpcy5kYXRhc2hlZXRzW2ldO1xuXG4gICAgICB2YXIgc3R1YiA9IHtcbiAgICAgICAgaWQgOiByLnJlc291cmNlSWQsXG4gICAgICAgIHBhY2thZ2VfaWQgOiByLnBhY2thZ2VJZCxcbiAgICAgICAgZnJvbVppcCA6IHRydWUsXG4gICAgICAgIHppcCA6IHIuemlwLFxuICAgICAgICBuYW1lIDogci5uYW1lXG4gICAgICB9XG5cbiAgICAgIHppcHNbci56aXAucmVzb3VyY2VJZF0uY2hpbGRSZXNvdXJjZXMucHVzaChzdHViKTtcbiAgICAgIHRoaXMucmVzb3VyY2VzLnB1c2goc3R1Yik7XG5cbiAgICAgIGFscmVhZHlBZGRlZFtyLnJlc291cmNlSWRdID0gMTsgLy8gd2h5P1xuICAgIH1cblxuICAgIC8vIG1hcCByZXNvdXJjZXMgdG8gZGF0YXNoZWV0cyBmb3IgZGFzdGVyIGxvb2t1cFxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5yZXNvdXJjZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB2YXIgZGF0YXNoZWV0cyA9IFtdO1xuICAgICAgZm9yKCB2YXIgaiA9IDA7IGogPCB0aGlzLmRhdGFzaGVldHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGlmKCB0aGlzLmRhdGFzaGVldHNbal0ucmVzb3VyY2VJZCA9PSB0aGlzLnJlc291cmNlc1tpXS5pZCApIHtcbiAgICAgICAgICBkYXRhc2hlZXRzLnB1c2godGhpcy5kYXRhc2hlZXRzW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnJlc291cmNlTG9va3VwW3RoaXMucmVzb3VyY2VzW2ldLmlkXSA9IHRoaXMucmVzb3VyY2VzW2ldO1xuICAgICAgdGhpcy5yZXNvdXJjZXNbaV0uZGF0YXNoZWV0cyA9IGRhdGFzaGVldHM7XG4gICAgfVxuXG4gICAgdGhpcy5maXJlVXBkYXRlKCk7XG4gIH1cblxuICB0aGlzLnNldFNoZWV0ID0gZnVuY3Rpb24oc2hlZXQpIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YXNoZWV0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmRhdGFzaGVldHNbaV0ucmVzb3VyY2VJZCA9PSBzaGVldC5yZXNvdXJjZUlkICYmXG4gICAgICAgICAgdGhpcy5kYXRhc2hlZXRzW2ldLnNoZWV0SWQgPT0gc2hlZXQuc2hlZXRJZCApIHtcblxuICAgICAgICAgIHRoaXMuZGF0YXNoZWV0c1tpXSA9IHNoZWV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZXNvdXJjZSA9IHRoaXMucmVzb3VyY2VMb29rdXBbc2hlZXQucmVzb3VyY2VJZF07XG4gICAgaWYoICFyZXNvdXJjZSApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBdHRlbXB0aW5nIHRvIHNldCBzaGVldCB3aXRoIGEgcmVzb3VyY2VJZCB0aGF0IGRvZXMgbm90IGV4aXN0Jyk7XG4gICAgICBjb25zb2xlLmxvZyhzaGVldCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCByZXNvdXJjZS5kYXRhc2hlZXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHJlc291cmNlLmRhdGFzaGVldHNbaV0uc2hlZXRJZCA9PSBzaGVldC5zaGVldElkICkge1xuICAgICAgICAgIHJlc291cmNlLmRhdGFzaGVldHNbaV0gPSBzaGVldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLmZpcmVVcGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBlZS5lbWl0KCd1cGRhdGUnKTtcbiAgfVxuXG4gIC8vIGFmdGVyIGEgcmVzb3VyY2UgaXMgYWRkZWQsIG91ciBlbnRpcmUgc3RhdGUgaXMgZGlmZmVyZW50XG4gIHRoaXMucnVuQWZ0ZXJSZXNvdXJjZUFkZCA9IGZ1bmN0aW9uKHdvcmtzcGFjZURhdGEpIHtcbiAgICB0aGlzLnJlc3VsdCA9IHdvcmtzcGFjZURhdGE7XG4gICAgdGhpcy5fc2V0RGF0YSgpO1xuICB9XG5cbiAgdGhpcy5nZXREYXRhc2V0RXh0cmEgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiggIXRoaXMuZGF0YS5leHRyYXMgKSByZXR1cm4gbnVsbDtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmV4dHJhcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmRhdGEuZXh0cmFzW2ldLmtleSA9PSBrZXkgKSByZXR1cm4gdGhpcy5kYXRhLmV4dHJhc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgdGhpcy5zZXREYXRhc2V0RXh0cmEgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgaWYoICF0aGlzLmRhdGEuZXh0cmFzICkgdGhpcy5kYXRhLmV4dHJhcyA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEuZXh0cmFzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YS5leHRyYXNbaV0ua2V5ID09IGtleSApIHtcbiAgICAgICAgdGhpcy5kYXRhLmV4dHJhc1tpXS52YWx1ZSA9IHZhbHVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhLmV4dHJhcy5wdXNoKHtcbiAgICAgIGtleSA6IGtleSxcbiAgICAgIHZhbHVlIDogdmFsdWVcbiAgICB9KTtcbiAgfVxuXG4gIC8vIGdldCBhbGwgYXR0aXJidXRlcyBmcm9tIHNoZWV0cyBtYXJrZWQgYXMgZGF0YVxuICB0aGlzLmdldERhdGFzaGVldEF0dHJpYnV0ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXR0cnMgPSB7fSwgc2hlZXQsIGF0dHI7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YXNoZWV0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHNoZWV0ID0gdGhpcy5kYXRhc2hlZXRzW2ldO1xuICAgICAgaWYoIHNoZWV0Lm1ldGFkYXRhICkgY29udGludWU7XG5cbiAgICAgIGZvciggdmFyIGogPSAwOyBqIDwgc2hlZXQuYXR0cmlidXRlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgYXR0ciA9IHNoZWV0LmF0dHJpYnV0ZXNbal07XG4gICAgICAgIGF0dHJzW2F0dHJdID0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoYXR0cnMpO1xuICB9XG5cbiAgdGhpcy5pc0Vjb3Npc01ldGFkYXRhID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1xccy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICBmb3IoIHZhciBrZXkgaW4gdGhpcy5tZXRhZGF0YUxvb2t1cCApIHtcbiAgICAgIGlmKCB0aGlzLm1ldGFkYXRhTG9va3VwW2tleV0uZmxhdCA9PSBuYW1lICkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHRoaXMuZ2V0U2NvcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY291bnQgPSAwO1xuXG4gICAgLy8gY2hlY2sgZm9yIHNwZWN0cmEgbGV2ZWwgZWNvc2lzIG1ldGFkYXRhXG4gICAgLy8gVE9ET1xuICAgIC8qdGhpcy5zY2hlbWEuZm9yRWFjaChmdW5jdGlvbihpdGVtKXtcbiAgICAgIGlmKCB0aGlzLmlzRWNvc2lzTWV0YWRhdGEoaXRlbS5uYW1lKSApIHtcbiAgICAgICAgY291bnQrKztcbiAgICAgIH0gZWxzZSBpZiggdGhpcy5pbnZlcnNlQXR0cmlidXRlTWFwW2l0ZW0ubmFtZV0gJiZcbiAgICAgICAgICAgICAgICB0aGlzLmlzRWNvc2lzTWV0YWRhdGEodGhpcy5pbnZlcnNlQXR0cmlidXRlTWFwW2l0ZW0ubmFtZV0pICkge1xuXG4gICAgICAgIGNvdW50Kys7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTsqL1xuXG4gICAgdmFyIG1hcCA9IHtcbiAgICAgICdLZXl3b3JkcycgOiAndGFncycsXG4gICAgICAnQXV0aG9yJyA6ICdhdXRob3InLFxuICAgICAgJ0F1dGhvciBFbWFpbCcgOiAnYXV0aG9yX2VtYWlsJyxcbiAgICAgICdNYWludGFpbmVyJyA6ICdtYWludGFpbmVyJyxcbiAgICAgICdNYWludGFpbmVyIEVtYWlsJyA6ICdtYWludGFpbmVyX2VtYWlsJ1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGRhdGFzZXQgbGV2ZWwgZWNvc2lzIG1ldGFkYXRhXG4gICAgZm9yKCB2YXIga2V5IGluIHRoaXMubWV0YWRhdGFMb29rdXAgKSB7XG4gICAgICBpZiggbWFwW2tleV0gJiYgdGhpcy5kYXRhW21hcFtrZXldXSApIHtcbiAgICAgICAgY291bnQrKztcbiAgICAgIH0gZWxzZSBpZiggdGhpcy5nZXREYXRhc2V0RXh0cmEoa2V5KS52YWx1ZSApIHtcbiAgICAgICAgY291bnQrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggdGhpcy5kYXRhLm5vdGVzICkgY291bnQrKztcbiAgICBpZiggdGhpcy5kYXRhLm93bmVyX29yZyApIGNvdW50Kys7XG5cblxuICAgIHJldHVybiBjb3VudDtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIk1lYXN1cmVtZW50XCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJBY3F1aXNpdGlvbiBNZXRob2RcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJDb250YWN0XCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJQaXhlbFwiLFxuICAgICAgICBcIlByb3hpbWFsXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWluaW11bSBtZWFzdXJlbWVudCB1bml0IGZvciB5b3VyIHNwZWN0cmEgKGkuZS4gY29udGFjdCBwcm9iZSwgcHJveGltYWwgd2l0aCBYLWRlZ3JlZSBmb3Jlb3B0aWMsIHBpeGVsLCBvdGhlcikuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiU2FtcGxlIFBsYXRmb3JtXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQWlycGxhbmVcIixcbiAgICAgICAgXCJCb29tXCIsXG4gICAgICAgIFwiU2F0ZWxsaXRlXCIsXG4gICAgICAgIFwiVG93ZXJcIixcbiAgICAgICAgXCJVQVZcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJQbGF0Zm9ybSBmcm9tIHdoaWNoIHRoZSBzcGVjdHJhbCBtZWFzdXJlbWVudHMgd2VyZSBtYWRlIChlLmcuIGhhbmRoZWxkLCBib29tLCB0cmFtLCBVQVYpLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNZWFzdXJlbWVudCBWZW51ZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkdyZWVuaG91c2VcIixcbiAgICAgICAgXCJMYWJvcmF0b3J5XCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJPdXRkb29yXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2V0dGluZyBpbiB3aGljaCB0aGUgc3BlY3RyYWwgbWVhc3VyZW1lbnRzIHdlcmUgbWFkZS5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJUYXJnZXQgVHlwZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkFuaW1hbFwiLFxuICAgICAgICBcIkJhcmtcIixcbiAgICAgICAgXCJCcmFuY2hcIixcbiAgICAgICAgXCJDYW5vcHlcIixcbiAgICAgICAgXCJGbG93ZXJcIixcbiAgICAgICAgXCJMZWFmXCIsXG4gICAgICAgIFwiTWluZXJhbFwiLFxuICAgICAgICBcIk5QVlwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiUmVmZXJlbmNlXCIsXG4gICAgICAgIFwiUm9ja1wiLFxuICAgICAgICBcIlNvaWxcIixcbiAgICAgICAgXCJXYXRlclwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkRlc2NyaWJlcyB0aGUgdGFyZ2V0IHRoYXQgd2FzIG1lYXN1cmVkLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1lYXN1cmVtZW50IFF1YW50aXR5XCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQWJzb3JwdGFuY2VcIixcbiAgICAgICAgXCJETlwiLFxuICAgICAgICBcIkluZGV4XCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJSYWRpYW5jZVwiLFxuICAgICAgICBcIlJlZmxlY3RhbmNlXCIsXG4gICAgICAgIFwiVHJhbnNmbGVjdGFuY2VcIixcbiAgICAgICAgXCJUcmFuc21pdHRhbmNlXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiSW5kZXggTmFtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNZWFzdXJlbWVudCBxdWFudGl0eSdzIGluZGV4IG5hbWUuICBQbGVhc2UgcHJvdmlkZSBpZiBNZWFzdXJlbWVudCBRdWFudGl0eSA9IFxcXCJJbmRleFxcXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWVhc3VyZW1lbnQgVW5pdHNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2NhbGUgZm9yIHNwZWN0cmFsIGluc3RlbnNpdHkgKGUuZy4gRE4sIHJhZGlhbmNlLCBpcnJhZGlhbmNlLCByZWZsZWN0YW5jZSlcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiV2F2ZWxlbmd0aCBVbml0c1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiVW5pdGxlc3NcIixcbiAgICAgICAgXCJubVwiLFxuICAgICAgICBcInVtXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2F2ZWxlbmd0aCB1bml0cyAoZS5nLiBubSwgdW0sIEh6KVwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJUYXJnZXQgU3RhdHVzXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiRHJpZWRcIixcbiAgICAgICAgXCJGcmVzaFwiLFxuICAgICAgICBcIkdyZWVuXCIsXG4gICAgICAgIFwiR3JvdW5kXCIsXG4gICAgICAgIFwiTGlxdWlkXCIsXG4gICAgICAgIFwiTGl2ZVwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiUGFuZWxcIixcbiAgICAgICAgXCJTdGFuZGFyZFwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlN0YXRlIG9mIHRoZSBtZWFzdXJlbWVudCB0YXJnZXQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTGlnaHQgU291cmNlXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTGFtcFwiLFxuICAgICAgICBcIkxhc2VyXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJTdW5cIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEZXNjcmlwdGlvbiBvZiB0aGUgbGlnaHQgc291cmNlIHVzZWQgZm9yIHlvdXIgc3BlY3RyYWwgbWVhc3VyZW1lbnRzXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTGlnaHQgU291cmNlIFNwZWNpZmljYXRpb25zXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGb3Jlb3B0aWMgVHlwZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkJhcmUgRmliZXJcIixcbiAgICAgICAgXCJDb3NpbmUgRGlmZnVzZXJcIixcbiAgICAgICAgXCJGb3Jlb3B0aWNcIixcbiAgICAgICAgXCJHZXJzaG9uIFR1YmVcIixcbiAgICAgICAgXCJJbnRlZ3JhdGluZyBTcGhlcmVcIixcbiAgICAgICAgXCJMZWFmIENsaXBcIixcbiAgICAgICAgXCJOb25lXCIsXG4gICAgICAgIFwiT3RoZXJcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEZXNjcmlwdGlvbiBvZiB0aGUgZm9yZW9wdGljIHVzZWQgdG8gbWFrZSB5b3VyIHNwZWN0cmFsIG1lYXN1cmVtZW50XCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRm9yZW9wdGljIEZpZWxkIG9mIFZpZXdcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiaW50ZWdlciBkZWdyZWVzXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkZvcmVvcHRpYyBTcGVjaWZpY2F0aW9uc1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJQcm9jZXNzaW5nIEluZm9ybWF0aW9uXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIEF2ZXJhZ2VkXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTm9cIixcbiAgICAgICAgXCJZZXNcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJcyB0aGUgbWVhc3VyZW1lbnQgYW4gYXZlcmFnZSBvZiBvdGhlciBtZWFzdXJlbWVudHM/XCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlByb2Nlc3NpbmcgSW50ZXJwb2xhdGVkXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTm9cIixcbiAgICAgICAgXCJZZXNcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJcyB0aGUgbWVhc3VyZW1lbnQgaW50ZXJwb2xhdGVkP1wiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIFJlc2FtcGxlZFwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIk5vXCIsXG4gICAgICAgIFwiWWVzXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSXMgdGhlIG1lYXN1cmVtZW50IHJlc2FtcGxlZD9cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUHJvY2Vzc2luZyBJbmZvcm1hdGlvbiBEZXRhaWxzXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogZmFsc2UsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJPdGhlciBkZXRhaWxzIGFib3V0IHByb2Nlc3NpbmcgYXJlIHByb3ZpZGVkIGhlcmUuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiSW5zdHJ1bWVudFwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiSW5zdHJ1bWVudCBNYW51ZmFjdHVyZXJcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3BlY3Ryb21ldGVyIG1hbnVmYWN0dXJlci5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiSW5zdHJ1bWVudCBNb2RlbFwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTcGVjdHJvbWV0ZXIgbW9kZWwuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkluc3RydW1lbnQgU2VyaWFsIE51bWJlclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJUaGVtZVwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVGhlbWVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBZ3JpY3VsdHVyZVwiLFxuICAgICAgICBcIkJpb2NoZW1pc3RyeVwiLFxuICAgICAgICBcIkVjb2xvZ3lcIixcbiAgICAgICAgXCJGb3Jlc3RcIixcbiAgICAgICAgXCJHbG9iYWwgQ2hhbmdlXCIsXG4gICAgICAgIFwiTGFuZCBDb3ZlclwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiUGhlbm9sb2d5XCIsXG4gICAgICAgIFwiUGh5c2lvbG9neVwiLFxuICAgICAgICBcIlVyYmFuXCIsXG4gICAgICAgIFwiV2F0ZXIgUXVhbGl0eVwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlJlc2VhcmNoIGNvbnRleHQgZm9yIHRoZSB0aGUgc3BlY3RyYWwgbWVhc3VyZW1lbnRzLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIktleXdvcmRzXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogZmFsc2UsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRWNvc3lzdGVtIFR5cGVcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBcXVhdGljXCIsXG4gICAgICAgIFwiQ29hc3RhbFwiLFxuICAgICAgICBcIkNyb3BzXCIsXG4gICAgICAgIFwiRm9yZXN0XCIsXG4gICAgICAgIFwiR3Jhc3NsYW5kXCIsXG4gICAgICAgIFwiV2V0bGFuZFwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIkxvY2F0aW9uXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMYXRpdHVkZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImxhdGxuZ1wiLFxuICAgICAgXCJ1bml0c1wiOiBcImRlY2ltYWwgZGVncmVlXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxvbmdpdHVkZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImxhdGxuZ1wiLFxuICAgICAgXCJ1bml0c1wiOiBcImRlY2ltYWwgZGVncmVlXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcImdlb2pzb25cIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJnZW9qc29uXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxvY2F0aW9uIE5hbWVcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiBmYWxzZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIkRhdGVcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlNhbXBsZSBDb2xsZWN0aW9uIERhdGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJkYXRlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiSVNPIERhdGUgXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1lYXN1cmVtZW50IERhdGVcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJkYXRlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiSVNPIERhdGUgXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlBoZW5vbG9naWNhbCBTdGF0dXNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiU3BlY2llc1wiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ29tbW9uIE5hbWVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQ29tbW9uIG5hbWUgb2YgdGhlIHRhcmdldCB0aGF0IHdhcyBtZWFzdXJlZC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTGF0aW4gR2VudXNcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTGF0aW4gZ2VudXMgb2YgdGhlIHRhcmdldCB0aGF0IHdhcyBtZWFzdXJlZC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTGF0aW4gU3BlY2llc1wiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IHRydWUsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMYXRpbiBzcGVjaWVzIG9mIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlVTREEgU3ltYm9sXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogdHJ1ZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlVTREEgY29kZSBvZiB0aGUgdGFyZ2V0IHRoYXQgd2FzIG1lYXN1cmVkLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJWZWdldGF0aW9uIFR5cGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiB0cnVlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiQ2l0YXRpb25cIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkNpdGF0aW9uXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogZmFsc2UsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ2l0YXRpb24gRE9JXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogZmFsc2UsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiV2Vic2l0ZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IGZhbHNlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkF1dGhvclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IGZhbHNlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkF1dGhvciBFbWFpbFwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwic3BlY3RyYUxldmVsXCI6IGZhbHNlLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1haW50YWluZXJcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiBmYWxzZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNYWludGFpbmVyIEVtYWlsXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJzcGVjdHJhTGV2ZWxcIjogZmFsc2UsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRnVuZGluZyBTb3VyY2VcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiBmYWxzZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGdW5kaW5nIFNvdXJjZSBHcmFudCBOdW1iZXJcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcInNwZWN0cmFMZXZlbFwiOiBmYWxzZSxcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdXG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ3JlZHVjZScpO1xuXG4vKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbnZhciByb290O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7IC8vIEJyb3dzZXIgd2luZG93XG4gIHJvb3QgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykgeyAvLyBXZWIgV29ya2VyXG4gIHJvb3QgPSBzZWxmO1xufSBlbHNlIHsgLy8gT3RoZXIgZW52aXJvbm1lbnRzXG4gIHJvb3QgPSB0aGlzO1xufVxuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe307XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogVE9ETzogZnV0dXJlIHByb29mLCBtb3ZlIHRvIGNvbXBvZW50IGxhbmRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNIb3N0KG9iaikge1xuICB2YXIgc3RyID0ge30udG9TdHJpbmcuY2FsbChvYmopO1xuXG4gIHN3aXRjaCAoc3RyKSB7XG4gICAgY2FzZSAnW29iamVjdCBGaWxlXSc6XG4gICAgY2FzZSAnW29iamVjdCBCbG9iXSc6XG4gICAgY2FzZSAnW29iamVjdCBGb3JtRGF0YV0nOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxucmVxdWVzdC5nZXRYSFIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAmJiAoIXJvb3QubG9jYXRpb24gfHwgJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sXG4gICAgICAgICAgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPSAoKHRoaXMucmVxLm1ldGhvZCAhPSdIRUFEJyAmJiAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8IHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnKVxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSlcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogRm9yY2UgZ2l2ZW4gcGFyc2VyXG4gKiBcbiAqIFNldHMgdGhlIGJvZHkgcGFyc2VyIG5vIG1hdHRlciB0eXBlLlxuICogXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihmbil7XG4gIHRoaXMucGFyc2VyID0gZm47XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSB0aGlzLnBhcnNlciB8fCByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIHJldHVybiBwYXJzZSAmJiBzdHIgJiYgKHN0ci5sZW5ndGggfHwgc3RyIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbihzdGF0dXMpe1xuICAvLyBoYW5kbGUgSUU5IGJ1ZzogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDA0Njk3Mi9tc2llLXJldHVybnMtc3RhdHVzLWNvZGUtb2YtMTIyMy1mb3ItYWpheC1yZXF1ZXN0XG4gIGlmIChzdGF0dXMgPT09IDEyMjMpIHtcbiAgICBzdGF0dXMgPSAyMDQ7XG4gIH1cblxuICB2YXIgdHlwZSA9IHN0YXR1cyAvIDEwMCB8IDA7XG5cbiAgLy8gc3RhdHVzIC8gY2xhc3NcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLnN0YXR1c0NvZGUgPSBzdGF0dXM7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IDEgPT0gdHlwZTtcbiAgdGhpcy5vayA9IDIgPT0gdHlwZTtcbiAgdGhpcy5jbGllbnRFcnJvciA9IDQgPT0gdHlwZTtcbiAgdGhpcy5zZXJ2ZXJFcnJvciA9IDUgPT0gdHlwZTtcbiAgdGhpcy5lcnJvciA9ICg0ID09IHR5cGUgfHwgNSA9PSB0eXBlKVxuICAgID8gdGhpcy50b0Vycm9yKClcbiAgICA6IGZhbHNlO1xuXG4gIC8vIHN1Z2FyXG4gIHRoaXMuYWNjZXB0ZWQgPSAyMDIgPT0gc3RhdHVzO1xuICB0aGlzLm5vQ29udGVudCA9IDIwNCA9PSBzdGF0dXM7XG4gIHRoaXMuYmFkUmVxdWVzdCA9IDQwMCA9PSBzdGF0dXM7XG4gIHRoaXMudW5hdXRob3JpemVkID0gNDAxID09IHN0YXR1cztcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gNDA2ID09IHN0YXR1cztcbiAgdGhpcy5ub3RGb3VuZCA9IDQwNCA9PSBzdGF0dXM7XG4gIHRoaXMuZm9yYmlkZGVuID0gNDAzID09IHN0YXR1cztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVxID0gdGhpcy5yZXE7XG4gIHZhciBtZXRob2QgPSByZXEubWV0aG9kO1xuICB2YXIgdXJsID0gcmVxLnVybDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgdXJsICsgJyAoJyArIHRoaXMuc3RhdHVzICsgJyknO1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZXJyID0gbnVsbDtcbiAgICB2YXIgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICB2YXIgbmV3X2VyciA9IG5ldyBFcnJvcihyZXMuc3RhdHVzVGV4dCB8fCAnVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2UnKTtcbiAgICBuZXdfZXJyLm9yaWdpbmFsID0gZXJyO1xuICAgIG5ld19lcnIucmVzcG9uc2UgPSByZXM7XG4gICAgbmV3X2Vyci5zdGF0dXMgPSByZXMuc3RhdHVzO1xuXG4gICAgc2VsZi5jYWxsYmFjayhuZXdfZXJyLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBxdWVyeXN0cmluZ1xuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG11bHRpcGxlIGRhdGEgXCJ3cml0ZXNcIlxuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuc2VuZCh7IHNlYXJjaDogJ3F1ZXJ5JyB9KVxuICogICAgICAgICAuc2VuZCh7IHJhbmdlOiAnMS4uNScgfSlcbiAqICAgICAgICAgLnNlbmQoeyBvcmRlcjogJ2Rlc2MnIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaiB8fCBpc0hvc3QoZGF0YSkpIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICBmbihlcnIsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0RXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3RpbWVvdXQgb2YgJyArIHRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnKTtcbiAgZXJyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndpdGhDcmVkZW50aWFscyA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB4aHIgPSB0aGlzLnhociA9IHJlcXVlc3QuZ2V0WEhSKCk7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuXG4gICAgLy8gSW4gSUU5LCByZWFkcyB0byBhbnkgcHJvcGVydHkgKGUuZy4gc3RhdHVzKSBvZmYgb2YgYW4gYWJvcnRlZCBYSFIgd2lsbFxuICAgIC8vIHJlc3VsdCBpbiB0aGUgZXJyb3IgXCJDb3VsZCBub3QgY29tcGxldGUgdGhlIG9wZXJhdGlvbiBkdWUgdG8gZXJyb3IgYzAwYzAyM2ZcIlxuICAgIHZhciBzdGF0dXM7XG4gICAgdHJ5IHsgc3RhdHVzID0geGhyLnN0YXR1cyB9IGNhdGNoKGUpIHsgc3RhdHVzID0gMDsgfVxuXG4gICAgaWYgKDAgPT0gc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi50aW1lZG91dCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm47XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgdmFyIGhhbmRsZVByb2dyZXNzID0gZnVuY3Rpb24oZSl7XG4gICAgaWYgKGUudG90YWwgPiAwKSB7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgfTtcbiAgaWYgKHRoaXMuaGFzTGlzdGVuZXJzKCdwcm9ncmVzcycpKSB7XG4gICAgeGhyLm9ucHJvZ3Jlc3MgPSBoYW5kbGVQcm9ncmVzcztcbiAgfVxuICB0cnkge1xuICAgIGlmICh4aHIudXBsb2FkICYmIHRoaXMuaGFzTGlzdGVuZXJzKCdwcm9ncmVzcycpKSB7XG4gICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBoYW5kbGVQcm9ncmVzcztcbiAgICB9XG4gIH0gY2F0Y2goZSkge1xuICAgIC8vIEFjY2Vzc2luZyB4aHIudXBsb2FkIGZhaWxzIGluIElFIGZyb20gYSB3ZWIgd29ya2VyLCBzbyBqdXN0IHByZXRlbmQgaXQgZG9lc24ndCBleGlzdC5cbiAgICAvLyBSZXBvcnRlZCBoZXJlOlxuICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvODM3MjQ1L3htbGh0dHByZXF1ZXN0LXVwbG9hZC10aHJvd3MtaW52YWxpZC1hcmd1bWVudC13aGVuLXVzZWQtZnJvbS13ZWItd29ya2VyLWNvbnRleHRcbiAgfVxuXG4gIC8vIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgJiYgIXRoaXMuX3RpbWVyKSB7XG4gICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBzZWxmLnRpbWVkb3V0ID0gdHJ1ZTtcbiAgICAgIHNlbGYuYWJvcnQoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIGlmIChxdWVyeSkge1xuICAgIHF1ZXJ5ID0gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgIHRoaXMudXJsICs9IH50aGlzLnVybC5pbmRleE9mKCc/JylcbiAgICAgID8gJyYnICsgcXVlcnlcbiAgICAgIDogJz8nICsgcXVlcnk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmICgnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIWlzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBjb250ZW50VHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICB2YXIgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuICB4aHIuc2VuZChkYXRhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEZhdXggcHJvbWlzZSBzdXBwb3J0XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAoZnVsZmlsbCwgcmVqZWN0KSB7XG4gIHJldHVybiB0aGlzLmVuZChmdW5jdGlvbihlcnIsIHJlcykge1xuICAgIGVyciA/IHJlamVjdChlcnIpIDogZnVsZmlsbChyZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBFeHBvc2UgYFJlcXVlc3RgLlxuICovXG5cbnJlcXVlc3QuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogSXNzdWUgYSByZXF1ZXN0OlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgIHJlcXVlc3QoJ0dFVCcsICcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnLCBjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gdXJsIG9yIGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiByZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB1cmwpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVxdWVzdChtZXRob2QsIHVybCk7XG59XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEhFQUQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5kZWwgPSBmdW5jdGlvbih1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiXG4vKipcbiAqIFJlZHVjZSBgYXJyYCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFxuICpcbiAqIFRPRE86IGNvbWJhdGlibGUgZXJyb3IgaGFuZGxpbmc/XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuLCBpbml0aWFsKXsgIFxuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gIHZhciBjdXJyID0gYXJndW1lbnRzLmxlbmd0aCA9PSAzXG4gICAgPyBpbml0aWFsXG4gICAgOiBhcnJbaWR4KytdO1xuXG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICBjdXJyID0gZm4uY2FsbChudWxsLCBjdXJyLCBhcnJbaWR4XSwgKytpZHgsIGFycik7XG4gIH1cbiAgXG4gIHJldHVybiBjdXJyO1xufTsiXX0=
