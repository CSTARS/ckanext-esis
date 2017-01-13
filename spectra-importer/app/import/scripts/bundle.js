(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Ecosis = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var request, key, host;

// TODO: this needs to be verified :/
function addResourceNode(pkgid, file, callback) {
  var r = request
   .post(host + '/api/3/action/resource_create')
   .withCredentials()
   .field('package_id', pkgid)
   .field('mimetype', file.mimetype)
   .field('name', file.filename)
   .field('url','upload')
   .attach('upload', file.path);

  if( key ) {
    r.set('Authorization', key);
  }

  r.end(callback);
}

function addResourceBrowser(pkgid, file, callback, progress) {
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
    url: host + '/api/3/action/resource_create',
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
    success: function(resp){
      callback(null, {
        body : resp
      });
    },
    error : function() {
      callback({error:true,message:'Request Error'});
    }
  });

  return xhr;
}

module.exports = function(r, h, k, isBrowser, handleResp) {
  request = r;
  key = k;
  host = h;

  return function(pkgid, file, callback, progress) {
    function next(err, resp) {
      handleResp(err, resp, callback);
    }

    if( isBrowser ) addResourceBrowser(pkgid, file, next, progress);
    else addResourceNode(pkgid, file, next);
  };
};

},{}],2:[function(require,module,exports){
var request = require('superagent');

// depends if we are running from nodejs or browser
var agent = request.agent ? request.agent() : request;
var isBrowser = request.agent ? false : true;
var key = '';


module.exports = function(config) {
  this.host = config.host || '/';
  key = config.key || '';
  this.key = key;

  this.prepareWorkspace = function(pkgid, callback) {
    get(
      this.host+'/ecosis/workspace/prepare',
      {
        force: true,
        package_id: pkgid
      },
      function(err, resp){
        handleResp(err, resp, callback);
      }
    );
  };

  this.getWorkspace = function(pkgid, callback) {
    get(
      this.host+'/ecosis/workspace/get',
      {
        package_id : pkgid
      },
      function(err, resp){
        handleResp(err, resp, callback);
      }
    );
  };

  this.getActiveUser = function(callback) {
    get(
      this.host+'/ecosis/user/get',
      {},
      function(err, resp) {
        handleResp(err, resp, callback);
      }
    );
  };

  /**
   * Add a resource to a package using the browsers FormData object in a browser
   * or user the superagent for NodeJS
   *
   * pkgid: id of the package to add to
   * file: object representing the to resource to upload or if NodeJS string path to file
   * callback: callback handler
   * progress: callback for progress update (not supported in NodeJS)
   **/
  this.addResource = require('./addResource')(request, config.host, key, isBrowser, handleResp);


  this.getDatasheet = function(pkgid, rid, sid, callback) {
    get(
      this.host+'/ecosis/resource/get',
      {
        package_id : pkgid,
        resource_id : rid,
        datasheet_id : sid
      },
      function(err, resp) {
        handleResp(err, resp, callback);
      }
    );
  };

  this.getMetadataInfo = function(package_id, resource_id, sheet_id, callback) {
      var query = {
        package_id : package_id,
        resource_id : resource_id
      };
      if( sheet_id ) {
        query.sheet_id = sheet_id;
      }

      get(
        this.host+'/ecosis/resource/getMetadataInfo',
        query,
        function(err, resp) {
          handleResp(err, resp, callback);
        }
      );
  };

  this.getMetadataChunk = function(package_id, resource_id, sheet_id, index, callback) {
      var query = {
        package_id : package_id,
        resource_id : resource_id,
        index : index
      };
      if( sheet_id ) {
        query.sheet_id = sheet_id;
      }

      get(
        this.host+'/ecosis/resource/getMetadataChunk',
        query,
        function(err, resp) {
          handleResp(err, resp, callback);
        }
      );
  };

  this.getSpectra = function(pkgid, rid, sid, index, callback) {
    var query = {
      package_id : pkgid,
      index : index
    };

    if( rid ) {
      query.resource_id = rid;
    }
    if( sid ) {
      query.sheet_id = sid;
    }

    get(
      this.host+'/ecosis/spectra/get',
      query,
      function(err, resp) {
        handleResp(err, resp, callback);
      }
    );
  };

  this.getSpectraCount = function(pkgid, rid, sid, callback) {
    var query = {
      package_id : pkgid
    };

    if( rid ) {
      query.resource_id = rid;
    }
    if( sid ) {
      query.sheet_id = sid;
    }

    get(
      this.host+'/ecosis/resource/getSpectraCount',
      query,
      function(err, resp) {
        handleResp(err, resp, callback);
      }
    );
  };


  this.processResource = function(pkgid, resource_id, sheet_id, options, callback) {
    var data = {
        package_id : pkgid,
        options : JSON.stringify(options)
    };

    // apply to multiple resources, helper for first upload
    if( Array.isArray(resource_id) ) {
      data.resource_ids = JSON.stringify(resource_id);
    } else {
      data.resource_id = resource_id;
      data.sheet_id = sheet_id;
    }

    post(
      this.host+'/ecosis/resource/process',
      data,
      function(err, resp) {
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
      }
    );
  };

  this.getLicenseList = function(callback) {
    get(this.host+'/api/3/action/license_list', {}, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.getPackage = function(pkgid, callback) {
    get(this.host+'/api/3/action/package_show', {id : pkgid}, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.getOrganization = function(nameOrId, callback) {
    get(this.host+'/api/3/action/organization_show', {id : nameOrId}, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.tagSearch = function(query, limit, callback) {
    // supporting multiple versions of ckan.  why they changed this parameter... who knows...

    query = {
      query : query,
      ckan : query,
      limit : limit || 10
    };

    get(this.host+'/api/3/action/tag_search', query, function(err, resp) {
      handleResp(err, resp, function(resp){
        if( resp.error ) {
          return callback(resp);
        }

        try {
          var tmp = {}, key;
          for( var i = 0; i < resp.results.length; i++ ) {
            resp.results[i].name = resp.results[i].name.toLowerCase().trim();
            tmp[resp.results[i].name] = resp.results[i];
          }

          resp.results = [];
          for( key in tmp ) {
            resp.results.push(tmp[key]);
          }

        } catch(e) {}

        callback(resp);
      });
    });
  };

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
  };

  this._updatePackage = function(pkg, callback) {
    postRaw(this.host+'/api/3/action/package_update', pkg, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.updateLinkedResources = function(id, resources, callback) {
    var data = {
      id : id,
      linkedResources : resources
    }

    postRaw(this.host+'/ecosis/package/updateLinkedResources', data, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.verifyPrivate = function(id, callback) {
    get(this.host+'/ecosis/package/setPrivate', {id: id}, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.deletePackage = function(pkgid, callback) {
    postRaw(this.host+'/api/3/action/package_delete', JSON.stringify({id: pkgid}), function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.createPackage = function(pkg, callback) {
    postRaw(this.host+'/api/3/action/package_create', pkg, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  /*this.setPackageOptions = function(pkgid, options, callback) {
    var data = {
      package_id : pkgid,
      options : JSON.stringify(options)
    };

    post(this.host+'/ecosis/package/setOptions', data, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };*/

  this.topSuggestOverview = function(list, callback) {
    var data = {
      names : JSON.stringify(list),
    };

    post(this.host+'/ecosis/spectra/suggestOverview', data, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.topSuggest = function(name, callback) {
    get(this.host+'/ecosis/spectra/suggest', {name :name}, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.gcmdSuggest = function(name, callback) {
    get(this.host+'/ecosis/spectra/gcmd', {query: name.toLowerCase()}, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.removeResource = function(resourceId, callback) {
    postRaw(this.host+'/api/3/action/resource_delete', JSON.stringify({id : resourceId }), function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.deleteResources = function(resourceIds, callback) {
    postRaw(this.host+'/ecosis/resource/deleteMany', JSON.stringify({ids : resourceIds }), function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.pushToSearch = function(pkgid, includeEmail, callback) {
    var query = {
      package_id : pkgid,
      email : includeEmail ? 'true' : 'false'
    };

    get(
      this.host+'/ecosis/workspace/push',
      query,
      function(err, resp) {
        handleResp(err, resp, callback);
      }
    );
  };

  this.gitInfo = function(callback) {
    get(this.host+'/ecosis/gitInfo', {}, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };
};


function post(url, data, callback) {
  var r = request
   .post(url)
   .withCredentials()
   .type('form')
   .send(data);

  if( key ) {
    r.set('Authorization', key);
  }

  r.end(callback);
}

function postRaw(url, data, callback) {
  var r = request
   .post(url)
   .withCredentials()
   .send(data);

   if( key ) {
     r.set('Authorization', key);
   }

   r.end(callback);
}

function get(url, data, callback) {
  var r = request
    .get(url)
    .query(data || {})
    .withCredentials();


  if( key ) {
    r.set('Authorization', key);
  }

  r.end(callback);
}

function handleResp(err, resp, callback) {
  if( err ) {
    return callback({
      error: true,
      message: 'Request Error',
      type : 'http',
      details: err
    });
  }

  if( !resp ) {
    return callback({
      error: true,
      message: 'Request Error',
      type : 'http',
      details: 'Server did not send a response'
    });
  }

  if( !resp.body ) {
    return callback({
      error: true,
      message: 'Request Error',
      type : 'http',
      details: 'Server did not send a response'
    });
  }

  if( resp.body.error ) {
    return callback({
      error: true,
      message: 'Request Error',
      type : 'ckan',
      details: resp ? resp.body : ''
    });
  }

  if( resp.body.success && resp.body.result ) {
    callback(resp.body.result);
  } else {
    callback(resp.body);
  }

}

function isError(err, resp) {
  if( err ) return true;
  if( resp && resp.body && resp.body.error ) return true;
  return false;
}

},{"./addResource":1,"superagent":16}],3:[function(require,module,exports){
var EventEmitter = require("events").EventEmitter;

module.exports = function(config) {
  this.ckan = config.ckan;
  this.SDK = config.SDK;
  if( this.ckan ) this.ckan.ds = this;

  // is this an existing dataset
  this.editMode = config.package_id ? true : false;

  // existing package id
  this.package_id = config.package_id;

  this.package = this.SDK.newPackage();
  this.package.mode = this.editMode ? 'edit' : 'create';

  this.owner_org_name = '';

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

  this.metadataDefinitions = require('./schema');
  this.metadataLookup = {};
  for( var cat in this.metadataDefinitions ) {
    var defs = this.metadataDefinitions[cat];
    for( var i = 0; i < defs.length; i++ ) {
      defs[i].category = cat;
      defs[i].flat = defs[i].name.replace(/\s/g,'').toLowerCase();
      defs[i].fnName = defs[i].name.replace(/\s/g,'');
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
        return;
      }

      this.ckan.getWorkspace(this.package_id, function(result){
        if( result.error ) {
          this.loadingError = result;
          ee.emit('load-error', result);
          return;
        }

        this.result = result;
        this._setData();

        this.loaded = true;
        ee.emit('load');
        this.checkChanges();

      }.bind(this));
    }.bind(this));
  };

  this.loadFromTemplate = function(ckanPackage) {
    this.package.reset();
    this.package.mode = 'create';

    // set the default attirbutes for this dataset
    this.package.loadFromTemplate(ckanPackage, this.SDK.user);
    this.updateAliasLookup();

    ee.emit('load');
    this.fireUpdate();
  };

  this.checkChanges = function() {
    if( !this.editMode || !this.lastPushed ) return;

    var t = new Date(this.package.data.metadata_modified).getTime();

    if( this.deleteResourceTime ) {
      if( this.deleteResourceTime.getTime() > t ) {
        t = this.deleteResourceTime.getTime();
      }
    }

    var resp = {
      lastPushed : this.lastPushed,
      lastUpdated : new Date(t),
      unpublishedChanges : (this.lastPushed.getTime() < new Date(t).getTime())
    };

    ee.emit('changes', resp);
    return resp;
  },

  // helper for when data loads
  this._setData = function() {
    this.editMode = true;

    this.lastPushed = this.result.pushed;
    if( this.lastPushed ) {
      this.lastPushed = new Date(this.lastPushed);
    }

    var ckanPackage = this.result.ckan.package;
    this.package_id = ckanPackage.id;

    this.package.reset(ckanPackage);
    this.package.loadFromTemplate(ckanPackage, null, true);

    this.datasheets = this.result.resources;

    this.attributeMap = {};
    this.inverseAttributeMap = {};

    if( this.result.package.map && Object(this.package.getAliases()).length === 0 ) {
      this.package.setAliases(this.result.package.map);
    }

    this.updateAliasLookup();

    // check for badness
    if( this.result.package.sort && Object(this.package.getSort()).length === 0 ) {
      this.package.setSort(this.result.package.sort);
    }

    this.resources = this.result.ckan.resources;

    var zips = {}; // used to quickly add resource stubs
    for( var i = 0; i < this.resources.length; i++ ) {
      if( this.resources[i].format.toLowerCase() === 'zip' || this.resources[i].name.toLowerCase().match(/\.zip$/) ) {
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

  this.updateAliasLookup = function() {
    this.attributeMap = this.package.getAliases();
    for( var key in this.attributeMap ) {
      this.inverseAttributeMap[this.attributeMap[key]] = key;
    }
  };

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

    this.checkChanges();
  }

  this.fireUpdate = function() {
    ee.emit('update');
  };

  this.package.on('save-end', function(){
    this.checkChanges();
    this.fireUpdate();
  }.bind(this));

  this.package.on('value-set-on-create', function(){
    this.fireUpdate();
  }.bind(this));

  // after a resource is added, our entire state is different
  this.runAfterResourceAdd = function(workspaceData) {
    this.result = workspaceData;
    this._setData();
    this.checkChanges();
  };


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
  };

  this.isEcosisMetadata = function(name) {
    name = name.replace(/\s/g, '').toLowerCase();
    for( var key in this.metadataLookup ) {
      if( this.metadataLookup[key].flat == name ) return true;
    }
    return false;
  };

  this.getScore = function() {
    var count = 0;
    var total = 7;

    var breakdown = {
      basic : {
        score : 0,
        total : 5
      },
      linked : {
        score : 0,
        total : 1
      },
      location : {
        score : 0,
        total : 1
      }
    };

    // check dataset level ecosis metadata
    var cat = '';
    for( var key in this.metadataLookup ) {
      cat = this.metadataLookup[key].category.toLowerCase();
      key = key.replace(/ /g, '');

      if( !breakdown[cat] ) {
        breakdown[cat] = {
          score : 0,
          total : 0
        };
      }

      if( key === 'Latitude' || key === 'Longitude' ) {
        continue;
      }

      // toggle to enable
      // if( key === 'NASAGCMDKeywords' ) continue;

      if( this.package['get'+key] ) {
        var value = this.package['get'+key]();
        if( value && value.length > 0 ) {
          count++;

          if( key === 'Keywords' || key === 'Website' ) {
            breakdown.basic.score++;
          } else {
            breakdown[cat].score++;
          }
        }
        total++;
        if( key === 'Keywords' || key === 'Website' ) {
          breakdown.basic.total++;
        } else {
          breakdown[cat].total++;
        }
      }
    }

    // if we have ecosis doi, add to Citation score
    if( this.package.getDoi().value ) {
      breakdown.citation.score++;
    }


    if( this.package.getTitle() ) {
      count++;
      breakdown.basic.score++;
    }
    if( this.package.getDescription() ) {
      count++;
      breakdown.basic.score++;
    }
    if( Object.keys(this.package.getLinkedData()).length > 0 ) {
      count++;
      breakdown.linked.score++;
    }
    if( this.package.getOrganization() ) {
      count++;
      breakdown.basic.score++;
    }
    if( this.package.getVersion() ) {
      count++;
      breakdown.basic.score++;
    }
    if( this.package.getLicenseId() ) {
      count++;
      breakdown.basic.score++;
    }
    if( Object.keys(this.package.getGeoJson()).length > 0 ) {
      count++;
      breakdown.location.score++;
    }

    return {
      score: count,
      total : total,
      breakdown : breakdown
    };
  };
};

},{"./schema":17,"events":18}],4:[function(require,module,exports){
var EventEmitter = require("events").EventEmitter;
var Datastore = require('./datastore');
var CKAN = require('./ckan');
var Package = require('./package');

function SDK(config) {
  this.user = null;

  this.defaultGroup = config.defaultGroup;

  this.newPackage = function(data) {
    return new Package(data, this);
  };

  this.ckan = new CKAN({
    host : config.host,
    key : config.key
  });

  this.ds = new Datastore({
    ckan : this.ckan,
    package_id : config.package_id,
    SDK : this
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

  require('./logic')(this);

  if( config.package_id ) this.ds.load();
}



module.exports = SDK;

},{"./ckan":2,"./datastore":3,"./logic":6,"./package":11,"events":18}],5:[function(require,module,exports){
var SDK;

module.exports = function(sdk) {
  SDK = sdk;
  SDK.createPackage = createPackage;
};

function createPackage(data, callback) {

}

},{}],6:[function(require,module,exports){
module.exports = function(SDK) {
  require('./createPackage')(SDK);
  require('./verify')(SDK);
};

},{"./createPackage":5,"./verify":7}],7:[function(require,module,exports){
module.exports = function(SDK) {
  SDK.verify = {
    name : require('./name')(SDK)
  };
};

},{"./name":8}],8:[function(require,module,exports){
module.exports = function(SDK) {
  return function(name, callback) {

    SDK.ckan.getPackage(name, function(resp){
      if( resp.error ) {
        return callback(true);
      }

      callback(false);
    }.bind(this));
  };
};

},{}],9:[function(require,module,exports){
// attributes that have a direct mapping to CKAN standard attributes,
// so they should not be wrapped up in the 'extras' fields.  IE, use
// these functions.
var ckanAttriutes = ['Keywords', 'Website', 'Author', 'Author Email',
'Maintainer Email', 'Maintainer'];

module.exports = function(attribute, Package) {
  if( attribute.name === 'Keywords' || attribute.name === 'Website' ) return;

  if( attribute.input === 'controlled' ) {
    createControlledInput(attribute, Package);
  } else if( attribute.input === 'split-text' ) {
    createControlledInput(attribute, Package);
  } else if( attribute.input === 'controlled-single' ) {
    createSingleInput(attribute, Package);
  } else if( attribute.input === 'text' || attribute.input === 'latlng' ) {
    createInput(attribute, Package);
  }
};

function createInput(attribute, Package) {
  var name = attribute.name.replace(/ /g, '');

  Package.prototype['get'+name] = function() {
    return this.getExtra(attribute.name);
  };

  Package.prototype['set'+name] = function(value) {
    this.setExtra(attribute.name, value+'');
    this._onUpdate(attribute.name);
  };
}

function createSingleInput(attribute, Package) {
  var name = attribute.name.replace(/ /g, '');

  Package.prototype['get'+name] = function() {
    return this.getExtra(attribute.name);
  };

  Package.prototype['set'+name] = function(value) {
    var t = tokenize(value);

    for( var i = 0; i < attribute.vocabulary.length; i++ ) {
      if( tokenize(attribute.vocabulary[i]) === t ) {
        this.setExtra(attribute.name, attribute.vocabulary[i]);
        this._onUpdate(attribute.name);
        return;
      }
    }

    if( attribute.allowOther ) {
      this.setExtra(attribute.name, 'Other');
      this.setExtra(attribute.name+' Other', value);
      this._onUpdate(attribute.name);
    } else {
      this.setExtra(attribute.name, '');
    }
  };

  if( attribute.allowOther ) {
    Package.prototype['get'+name+'Other'] = function() {
      return this.getExtra(attribute.name+' Other');
    };
  }
}

function createControlledInput(attribute, Package) {
  var name = attribute.name.replace(/ /g, '');

  Package.prototype['get'+name] = function() {
    var attr = this.getExtra(attribute.name);
    if( !attr ) return [];
    return attr.split(',').map(cleanTerm);
  };

  if( attribute.allowOther ) {
    Package.prototype['get'+name+'Other'] = function() {
      var attr = this.getExtra(attribute.name+' Other');
      if( !attr ) return [];
      return attr.split(',').map(cleanTerm);
    };
  }

  Package.prototype['set'+name] = function(value) {
    if( !value ) {
      this.setExtra(attribute.name, null);
      if( attribute.allowOther ) {
        this.setExtra(attribute.name+' Other', null);
      }

      this._onUpdate(attribute.name);
      return;
    }

    var terms;
    if( !Array.isArray(value) ) {
      value = value+'';
      terms = value.split(',');
    } else {
      terms = value;
    }

    terms = terms.map(cleanTerm);

    if( attribute.input === 'controlled' ) {
      var values = getValues(terms, attribute.vocabulary);

      if( attribute.allowOther && values.other.length > 0 && values.valid.indexOf('Other') == -1 ) {
        values.valid.push('Other');
      }

      this.setExtra(attribute.name, values.valid.join(', '));
      if( attribute.allowOther ) {
        this.setExtra(attribute.name+' Other', values.other.join(', '));
      }

    } else if( attribute.input === 'split-text' ) {
      this.setExtra(attribute.name, terms.join(', '));
    }

    this._onUpdate(attribute.name);
  };
}

function cleanTerm(txt) {
  return txt.trim();
}

function getValues(terms, vocabulary) {
  var valid = [];
  var other = [];

  var map = {};
  vocabulary.forEach(function(name){
    map[tokenize(name)] = name;
  });

  var t;
  for( var i = 0; i < terms.length; i++ ) {
    t = tokenize(terms[i]);

    if( map[t] ) {
      if( valid.indexOf(map[t]) === -1 ) {
        valid.push(map[t]);
      }
    } else {
      if( other.indexOf(map[t]) === -1 ) {
        other.push(terms[i].trim());
      }
    }
  }

  return {
    valid : valid,
    other : other
  };
}

function tokenize(name) {
  return name.toLowerCase().replace(/\s/g, '');
}

},{}],10:[function(require,module,exports){
module.exports = function(Package){
  Package.prototype.create = create;
  Package.prototype.delete = deleteFn;
  Package.prototype.save = save;
};


function deleteFn(callback) {
  this.SDK.ckan.deletePackage(this.data.id, function(resp) {
    if( resp.error ) {
      // ERROR 5
      resp.code = 5;
      return callback(resp);
    }

    callback({success: true});
  });
}

function create(callback) {
  this.SDK.ckan.createPackage(this.data, function(resp) {
      if( resp.error ) {
        // ERROR 6
        resp.code = 6;
        return callback(resp);
      }

      if( !resp.id ) {
        // ERROR 7
        return callback({
          error : true,
          message : 'Failed to create dataset',
          code : 7
        });
      }

      callback(resp);
    }.bind(this)
  );
}

var saveTimer = -1;
function save(callback) {
  this.ee.emit('save-start');

  if( saveTimer !== -1 ) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(function(){
    saveTimer = -1;
    _save(this, callback);
  }.bind(this), 500);
}

function _save(ref, callback) {
  // make sure we have the correct package state
  // all resources need to be included when you make a updatePackage call
  ref.SDK.ckan.getPackage(ref.data.id, function(resp) {
      if( resp.error ) {
        resp.code = 8;
        resp.message += '. Failed to fetch package for update.';
        ref.ee.emit('save-end', resp);
        if( callback ) callback(resp);
        return;
      }

      var metadata = resp;
      for( var key in ref.data ) {
        metadata[key] = ref.data[key];
      }

      ref.SDK.ckan.updatePackage(metadata,
        function(resp) {
          if( resp.error ) {
            // ERROR 9
            resp.code = 9;
            resp.message += '. Failed to update dataset.';
            ref.ee.emit('save-end', resp);
            if( callback ) callback(resp);
            return;
          }

          if( !resp.id )  {
            var msg = {
              error: true,
              message : 'Failed to update dataset',
              code : 10
            };
            ref.ee.emit('save-end', msg);
            // ERROR 10
            if( callback ) callback(msg);
            return;
          }

          ref.data = resp;

          if( callback ) callback({success: true});
          ref.ee.emit('save-end', {success: true});
        }
      );
    }
  );
}

},{}],11:[function(require,module,exports){
var extend = require('extend');
var schema = require('../schema');
var createSchemaMethods = require('./createSchemaMethods');
var template = require('./template');
var crud = require('./crud');
var EventEmitter = require("events").EventEmitter;


var ignore = ['Species', 'Date'];

function Package(initdata, SDK) {

  this.reset = function(data) {
    if( data ) {
      this.data = extend(true, {}, data);
    } else {
      this.data = {
        id : '',
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
    }
  };

  this.reset(initdata);

  this.ee = new EventEmitter();

  if( !SDK ) {
    throw(new Error('No SDK provided'));
  }
  this.SDK = SDK;

  this.on = function(event, fn) {
    this.ee.on(event, fn);
  };

  this._onUpdate = function(name) {
    this.ee.emit('update', {attribute: name});

    if( this.mode !== 'create' ) {
      this.save();
    } else {
      this.ee.emit('value-set-on-create', {});
    }
  };

  this.getId = function() {
    return this.data.id || '';
  };

  this.setTitle = function(title, callback) {
    title = title.replace(/_/g, ' ').trim();

    if( title.length >= 100 ) {
      return callback({error: true, message: 'Invalid name.  Title can have at most 100 characters.'});
    }

    if( title.length <= 5 ) {
      return callback({error: true, message: 'Invalid name.  Title must have at least 5 characters.'});
    }

    var name = title.toLowerCase().replace(/[^a-z0-9]/g,'-');

    if( this.data.name === name ) {
      this.data.title = title;
      return callback(null, {title: title, name: name});
    }

    SDK.verify.name(name, function(valid) {
      if( !valid ) {
        return callback({error: true, message: 'Invalid name.  A dataset with the name "'+name+'" already exists'});
      }

      this.data.title = title;
      this.data.name = name;
      this._onUpdate('Title');

      callback(null, {title: title, name: name});
    }.bind(this));
  };

  this.getName = function() {
    return this.data.name || '';
  };

  this.getTitle = function() {
    return this.data.title || '';
  };

  this.setDescription = function(description) {
    this.data.notes = description;
    this._onUpdate('Description');
  };

  this.getDescription = function() {
    return this.data.notes || '';
  };

  this.getKeywords = function(){
    return this.data.tags || [];
  };

  this.setKeywords = function(keywords) {
    if( typeof keywords === 'string' ) {
      keywords = keywords.split(',');
    }

    if( !Array.isArray(keywords) ) {
      throw(new Error('Keywords must by of type string or array'));
    }

    this.data.tags = [];
    keywords.forEach(this.addKeyword.bind(this));
  };

  this.addKeyword = function(keyword) {
    if( typeof keyword === 'object' ) {
      keyword = keyword.name;

    }

    keyword = cleanKeyword(keyword+'');

    if( keyword.length < 2 ) {
      return;
    } else if( this.hasKeyword(keyword) ) {
      return;
    }

    if( !this.data.tags ) {
      this.data.tags = [];
    }

    this.data.tags.push({
      display_name : keyword,
      name : keyword
    });

    this._onUpdate('Keywords');
  };

  this.removeKeyword = function(keyword) {
    if( !this.data.tags ) return;

    for( var i = 0; i < this.data.tags.length; i++ ) {
      if( this.data.tags[i].name === keyword ) {
        this.data.tags.splice(i, 1);
        break;
      }
    }

    this._onUpdate('Keywords');
  };

  this.hasKeyword = function(keyword) {
    if( !this.data.tags ) return false;
    for( var i = 0; i < this.data.tags.length; i++ ) {
      if( this.data.tags[i].name === keyword ) {
        return true;
      }
    }
    return false;
  };


  function cleanKeyword(txt) {
    return txt.replace(/[^A-Za-z0-9-_ ]/g, '').toLowerCase().trim();
  }

  this.setLicense = function(id, title) {
    this.data.license_id = id;
    this.data.license_title = title;
    this._onUpdate('License');
  };

  this.getLicenseId = function() {
    return this.data.license_id || '';
  };

  this.getLicenseTitle = function() {
    return this.data.license_title || '';
  };

  this.setOrganization = function(id, callback) {
    if( !id ) {
      this.data.owner_org = '';
      if( callback ) {
        callback({success: true});
      }
      return;
    }

    SDK.ckan.getOrganization(id, function(resp){
      if( resp.error ) {
        if( callback ) callback(resp);
        return;
      }

      this.data.owner_org = resp.id;
      this._onUpdate('Organization');

      if( callback ) {
        callback({success: true});
      }
    }.bind(this));
  };

  this.getOrganization = function() {
    return this.data.owner_org || '';
  };

  this.setVersion = function(version) {
    this.data.version = version;
    this._onUpdate('Version');
  };

  this.getVersion = function() {
    return this.data.version || '';
  };

  this.setWebsite = function(website) {
    this.setExtra('Website', website);
    this._onUpdate('Website');
  };

  this.getWebsite = function() {
    return this.getExtra('Website');
  };

  this.setAuthor = function(author) {
    this.data.author = author;
    this._onUpdate('Author');
  };

  this.getAuthor = function() {
    return this.data.author || '';
  };

  this.setAuthorEmail = function(author_email) {
    this.data.author_email = author_email;
    this._onUpdate('AuthorEmail');
  };

  this.getAuthorEmail = function() {
    return this.data.author_email || '';
  };

  this.setMaintainer = function(maintainer) {
    this.data.maintainer = maintainer;
    this._onUpdate('Maintainer');
  };

  this.getMaintainer = function() {
    return this.data.maintainer || '';
  };

  this.setMaintainerEmail = function(maintainer_email) {
    this.data.maintainer_email = maintainer_email;
    this._onUpdate('MaintainerEmail');
  };

  this.getMaintainerEmail = function() {
    return this.data.maintainer_email || '';
  };

  this.setPrivate = function(private) {
    if( this.data.private === private ) return;
    this.data.private = private;
    this._onUpdate('Private');
  };

  this.isPrivate = function() {
    return this.data.private ? true : false;
  };

  this.setLinkedData = function(data) {
    var newData = JSON.stringify(data);
    var oldData = JSON.stringify(this.getLinkedData());

    if( newData === oldData ) return;

    this.setExtra('LinkedData', newData);

    this.ee.emit('update', {attribute: name});

    if( this.mode !== 'create' ) {
      this.SDK.ckan.updateLinkedResources(this.data.id, data, function(resp) {
        console.log(resp);
      });
    } else {
      this.ee.emit('value-set-on-create', {});
    }
  };

  this.getLinkedData = function() {
    var value = this.getExtra('LinkedData');
    if( !value ) return [];

    try {
      return JSON.parse(value);
    } catch(e) {}

    return [];
  };

  this.requestDoi = function() {
    var doi = this.getDoi();

    if( doi.status.value !== 'Pending Revision' && doi.status.value ) {
      return false;
    }

    this.setExtra('EcoSIS DOI Status', JSON.stringify({value:'Pending Approval'}));
    this._onUpdate('EcoSIS DOI Status');
    
    return true;
  };
  
  this.cancelDoiRequest = function() {
    var doi = this.getDoi();

    if( doi.status.value !== 'Pending Revision' && doi.status.value !== 'Pending Approval' ) {
      return false;
    }

    this.setExtra('EcoSIS DOI Status', JSON.stringify({}));
    this._onUpdate('EcoSIS DOI Status');
    
    return true;
  };

  this.getDoi = function() {
    var status = this.getExtra('EcoSIS DOI Status');
    var value = this.getExtra('EcoSIS DOI');
    
    if( status && status.length > 0 ) {
      status = JSON.parse(status);
    } else {
      status = {};
    }

    return {
      status : status,
      value : value
    };
  };

  this.setSort = function(data) {
    this.setExtra('sort', JSON.stringify(data));
    this._onUpdate('sort');
  };

  this.getSort = function() {
    var value = this.getExtra('sort');
    if( !value ) return [];

    try {
      return JSON.parse(value);
    } catch(e) {}

    return {};
  };

  this.setAliases = function(data) {
    this.setExtra('aliases', JSON.stringify(data));
    this._onUpdate('aliases');
  };

  this.getAliases = function() {
    var value = this.getExtra('aliases');
    if( !value ) return {};

    try {
      var t = JSON.parse(value);
      // hack
      if( Array.isArray(t) ) return {};
      return t;
    } catch(e) {}

    return {};
  };

  this.setGeoJson = function(data) {
    if( !data ) {
      this.setExtra('geojson', '');
    } else {
      this.setExtra('geojson', JSON.stringify(data));
    }

    this._onUpdate('geojson');
  };

  this.getGeoJson = function() {
    var value = this.getExtra('geojson');
    if( !value ) return {};

    try {
      return JSON.parse(value);
    } catch(e) {}

    return {};
  };

  this.addResource = function(file, callback, progress) {
    function next(resp) {
      if( resp.error ) {
        return callback(error);
      }

      SDK.ckan.processResource(
        this.data.id,
        [resp.id],
        null,
        {layout: 'column'},
        function(resp){
          if( resp.error ) {
            return callback(resp);
          }

          // get new workspace state
          // TODO: proly a better way TODO this.
          SDK.ckan.getWorkspace(this.data.id, function(result){
            if( result.error ) {
              return callback(result);
            }
            SDK.ds.runAfterResourceAdd(result);

            callback({success: true});
          });

        }.bind(this));
    }

    SDK.ckan.addResource(this.data.id, file, next.bind(this), progress);
  };

  this.getExtra = function(key) {
    if( !this.data.extras ) return '';

    for( var i = 0; i < this.data.extras.length; i++ ) {
      if( this.data.extras[i].key === key ) {
        return this.data.extras[i].value;
      }
    }

    return '';
  };

  this.setExtra = function(key, value) {
    if( !this.data.extras ) this.data.extras = [];

    for( var i = 0; i < this.data.extras.length; i++ ) {
      if( this.data.extras[i].key == key ) {
        if( value === '' || value === null || value === undefined ) {
          this.data.extras.splice(i, 1);
        } else {
          this.data.extras[i].value = value;
        }
        return;
      }
    }

    if( value === '' || value === null || value === undefined ) {
      return;
    }

    this.data.extras.push({
      key : key,
      value : value
    });
  };

  // Should only be used for test data!!
  this._setTesting = function() {
    this.setExtra('_testing_', true);
  };

}

// extend package getters/setters based on schema
for( var key in schema ) {
  if( ignore.indexOf(key) > -1 ) {
    continue;
  }

  for( var i = 0; i < schema[key].length; i++ ){
    createSchemaMethods(schema[key][i], Package);
  }
}

template(Package);
crud(Package);


module.exports = Package;

},{"../schema":17,"./createSchemaMethods":9,"./crud":10,"./template":12,"events":18,"extend":14}],12:[function(require,module,exports){

module.exports = function(Package) {
  Package.prototype.loadFromTemplate = loadFromTemplate;
};

// load from server provided template
function loadFromTemplate(ckanPackage, user, keepDoi)  {
  for( var key in this.data ) {
    if( key === 'owner_org' || key === 'id' ) continue;
    if( ckanPackage[key] ) this.data[key] = ckanPackage[key];
  }

  if( user && user.organizations && ckanPackage.owner_org ) {
    for( var i = 0; i < user.organizations.length; i++ ) {
      if( user.organizations[i].id === ckanPackage.owner_org ) {
        data.owner_org = ckanPackage.owner_org;
        break;
      }
    }
  }

  if( ckanPackage.extras ) {
    if( !keepDoi ) {
      if( ckanPackage.extras['EcoSIS DOI'] ) {
        delete ckanPackage.extras['EcoSIS DOI']
      }
      if( ckanPackage.extras['EcoSIS DOI Status'] ) {
        delete ckanPackage.extras['EcoSIS DOI Status']
      }
    }

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
    this.setAliases(ckanPackage.map);
  }
}

},{}],13:[function(require,module,exports){

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
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
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
  function on() {
    this.off(event, on);
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
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
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
    , callbacks = this._callbacks['$' + event];

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
  return this._callbacks['$' + event] || [];
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

},{}],14:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],15:[function(require,module,exports){

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
},{}],16:[function(require,module,exports){
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
      pushEncodedKeyValuePair(pairs, key, obj[key]);
        }
      }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (Array.isArray(val)) {
    return val.forEach(function(v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  }
  pairs.push(encodeURIComponent(key)
    + '=' + encodeURIComponent(val));
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
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
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
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
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
 * Force given parser
 *
 * Sets the body parser no matter type.
 *
 * @param {Function}
 * @api public
 */

Request.prototype.parse = function(fn){
  this._parser = fn;
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
  this._formData.append(field, file, filename || file.name);
  return this;
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
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
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

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
    e.direction = 'download';
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
    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
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

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

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

},{"emitter":13,"reduce":15}],17:[function(require,module,exports){
module.exports={
  "Measurement": [
    {
      "name": "Acquisition Method",
      "level": 1,
      "input": "controlled",
      "units": "",
      "forSchema": "Both",
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
      "input": "split-text",
      "units": "",
      "forSchema": "Both",
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
      "forSchema": "Both",
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
      "forSchema": "Both",
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
      "forSchema": "Both",
      "vocabulary": [
        "Absorptance",
        "DN",
        "Emissivity",
        "Index",
        "Other",
        "Radiance",
        "Reflectance",
        "Transflectance",
        "Transmittance"
      ],
      "description": "Scale for spectral instensity (e.g. DN, radiance, irradiance, reflectance)",
      "allowOther": true
    },
    {
      "name": "Index Name",
      "level": 2,
      "input": "split-text",
      "units": "",
      "forSchema": "Both",
      "vocabulary": null,
      "description": "Measurement quantity's index name.  Please provide if Measurement Quantity = \"Index\"",
      "allowOther": false
    },
    {
      "name": "Measurement Units",
      "level": 2,
      "input": "controlled-single",
      "units": "",
      "forSchema": "Both",
      "vocabulary": [
        "%",
        "W/m^2",
        "W/m^2/Hz",
        "W/m^2/nm",
        "W/m^2/um",
        "W/sr/m^2"
      ],
      "description": "Measuremnt units",
      "allowOther": false
    },
    {
      "name": "Wavelength Units",
      "level": 2,
      "input": "controlled-single",
      "units": "",
      "forSchema": "Both",
      "vocabulary": [
        "Other",
        "Unitless",
        "nm",
        "um"
      ],
      "description": "Wavelength units (e.g. nm, um, Hz)",
      "allowOther": true
    },
    {
      "name": "Target Status",
      "level": 1,
      "input": "controlled",
      "units": "",
      "forSchema": "Both",
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
      "forSchema": "Both",
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
      "input": "split-text",
      "units": "",
      "forSchema": "Both",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Foreoptic Type",
      "level": 1,
      "input": "controlled",
      "units": "",
      "forSchema": "Both",
      "vocabulary": [
        "Bare Fiber",
        "Contact Probe",
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
      "input": "split-text",
      "units": "integer degrees",
      "forSchema": "Both",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Foreoptic Specifications",
      "level": 2,
      "input": "split-text",
      "units": "",
      "forSchema": "Both",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    }
  ],
  "Processing Information": [
    {
      "name": "Processing Averaged",
      "level": 2,
      "input": "controlled-single",
      "units": "",
      "forSchema": "Both",
      "vocabulary": [
        "No",
        "Yes"
      ],
      "description": "Is the measurement an average of multiple measurements?",
      "allowOther": false
    },
    {
      "name": "Processing Interpolated",
      "level": 2,
      "input": "controlled-single",
      "units": "",
      "forSchema": "Both",
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
      "input": "controlled-single",
      "units": "",
      "forSchema": "Both",
      "vocabulary": [
        "No",
        "Yes"
      ],
      "description": "Is the measurement resampled? (e.g. are multiple wavelengths averaged?)",
      "allowOther": false
    },
    {
      "name": "Processing Information Details",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Both",
      "vocabulary": null,
      "description": "Other details about processing are provided here.",
      "allowOther": false
    }
  ],
  "Instrument": [
    {
      "name": "Instrument Manufacturer",
      "level": 1,
      "input": "split-text",
      "units": "",
      "forSchema": "Both",
      "vocabulary": null,
      "description": "Spectrometer manufacturer.",
      "allowOther": false
    },
    {
      "name": "Instrument Model",
      "level": 1,
      "input": "split-text",
      "units": "",
      "forSchema": "Both",
      "vocabulary": null,
      "description": "Spectrometer model.",
      "allowOther": false
    },
    {
      "name": "Instrument Serial Number",
      "level": 2,
      "input": "split-text",
      "units": "",
      "forSchema": "Both",
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
      "forSchema": "Both",
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
      "input": "split-text",
      "units": "",
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Ecosystem Type",
      "level": 2,
      "input": "controlled",
      "units": "",
      "forSchema": "Both",
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
    },
    {
      "name": "NASA GCMD Keywords",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Both",
      "vocabulary": null,
      "description": "Select spectroscopy-related keywords from the NASA Global Change Master Directory's controlled keyword vocabularies. (http://gcmd.nasa.gov/learn/keyword_list.html)",
      "allowOther": false
    }
  ],
  "Location": [
    {
      "name": "Latitude",
      "level": 1,
      "input": "latlng",
      "units": "decimal degree",
      "forSchema": "Spectra",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Longitude",
      "level": 1,
      "input": "latlng",
      "units": "decimal degree",
      "forSchema": "Spectra",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "geojson",
      "level": 1,
      "input": "geojson",
      "units": "",
      "forSchema": "Spectra",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Location Name",
      "level": 2,
      "input": "split-text",
      "units": "",
      "forSchema": "Spectra",
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
      "forSchema": "Both",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Measurement Date",
      "level": 2,
      "input": "date",
      "units": "ISO Date ",
      "forSchema": "Both",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Phenological Status",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Both",
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
      "forSchema": "Spectra",
      "vocabulary": null,
      "description": "Common name of the target that was measured.",
      "allowOther": false
    },
    {
      "name": "Latin Genus",
      "level": 1,
      "input": "text",
      "units": "",
      "forSchema": "Spectra",
      "vocabulary": null,
      "description": "Latin genus of the target that was measured.",
      "allowOther": false
    },
    {
      "name": "Latin Species",
      "level": 1,
      "input": "text",
      "units": "",
      "forSchema": "Spectra",
      "vocabulary": null,
      "description": "Latin species of the target that was measured.",
      "allowOther": false
    },
    {
      "name": "USDA Symbol",
      "level": 1,
      "input": "text",
      "units": "",
      "forSchema": "Spectra",
      "vocabulary": null,
      "description": "USDA code of the target that was measured.",
      "allowOther": false
    },
    {
      "name": "Vegetation Type",
      "level": 1,
      "input": "text",
      "units": "",
      "forSchema": "Spectra",
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
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Citation DOI",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Website",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Author",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Author Email",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Maintainer",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Maintainer Email",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Funding Source",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Funding Source Grant Number",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    },
    {
      "name": "Year",
      "level": 2,
      "input": "text",
      "units": "",
      "forSchema": "Dataset",
      "vocabulary": null,
      "description": "",
      "allowOther": false
    }
  ]
}
},{}],18:[function(require,module,exports){
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
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
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
  } else if (listeners) {
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

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
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

},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi9ja2FuL2FkZFJlc291cmNlLmpzIiwibGliL2NrYW4vaW5kZXguanMiLCJsaWIvZGF0YXN0b3JlLmpzIiwibGliL2luZGV4LmpzIiwibGliL2xvZ2ljL2NyZWF0ZVBhY2thZ2UuanMiLCJsaWIvbG9naWMvaW5kZXguanMiLCJsaWIvbG9naWMvdmVyaWZ5L2luZGV4LmpzIiwibGliL2xvZ2ljL3ZlcmlmeS9uYW1lLmpzIiwibGliL3BhY2thZ2UvY3JlYXRlU2NoZW1hTWV0aG9kcy5qcyIsImxpYi9wYWNrYWdlL2NydWQuanMiLCJsaWIvcGFja2FnZS9pbmRleC5qcyIsImxpYi9wYWNrYWdlL3RlbXBsYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsInV0aWxzL21ldGFkYXRhL3NjaGVtYS5qc29uIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2cUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZXF1ZXN0LCBrZXksIGhvc3Q7XG5cbi8vIFRPRE86IHRoaXMgbmVlZHMgdG8gYmUgdmVyaWZpZWQgOi9cbmZ1bmN0aW9uIGFkZFJlc291cmNlTm9kZShwa2dpZCwgZmlsZSwgY2FsbGJhY2spIHtcbiAgdmFyIHIgPSByZXF1ZXN0XG4gICAucG9zdChob3N0ICsgJy9hcGkvMy9hY3Rpb24vcmVzb3VyY2VfY3JlYXRlJylcbiAgIC53aXRoQ3JlZGVudGlhbHMoKVxuICAgLmZpZWxkKCdwYWNrYWdlX2lkJywgcGtnaWQpXG4gICAuZmllbGQoJ21pbWV0eXBlJywgZmlsZS5taW1ldHlwZSlcbiAgIC5maWVsZCgnbmFtZScsIGZpbGUuZmlsZW5hbWUpXG4gICAuZmllbGQoJ3VybCcsJ3VwbG9hZCcpXG4gICAuYXR0YWNoKCd1cGxvYWQnLCBmaWxlLnBhdGgpO1xuXG4gIGlmKCBrZXkgKSB7XG4gICAgci5zZXQoJ0F1dGhvcml6YXRpb24nLCBrZXkpO1xuICB9XG5cbiAgci5lbmQoY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBhZGRSZXNvdXJjZUJyb3dzZXIocGtnaWQsIGZpbGUsIGNhbGxiYWNrLCBwcm9ncmVzcykge1xuICAvLyBUT0RPOiBpZiB0aGlzIGZhaWxzLCB3ZSBoYXZlIGFuIGlzc3VlIG9uIG91ciBoYW5kc1xuICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICBmb3JtRGF0YS5hcHBlbmQoJ3BhY2thZ2VfaWQnLCBwa2dpZCk7XG4gIGZvcm1EYXRhLmFwcGVuZCgnbWltZXR5cGUnLCBmaWxlLm1pbWV0eXBlKTtcbiAgZm9ybURhdGEuYXBwZW5kKCduYW1lJywgZmlsZS5maWxlbmFtZSk7XG4gIGZvcm1EYXRhLmFwcGVuZCgndXJsJywgJ3VwbG9hZCcpO1xuICBmb3JtRGF0YS5hcHBlbmQoJ3VwbG9hZCcsIG5ldyBCbG9iKFtmaWxlLmNvbnRlbnRzXSwge3R5cGU6IGZpbGUubWltZXR5cGV9KSwgZmlsZS5maWxlbmFtZSk7XG5cbiAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICB2YXIgeGhyID0gJC5hamF4U2V0dGluZ3MueGhyKCk7XG4gIC8vIGF0dGFjaCBwcm9ncmVzcyBoYW5kbGVyIHRvIHRoZSBYTUxIdHRwUmVxdWVzdCBPYmplY3RcblxuICB0cnkge1xuICAgICAgaWYoIHByb2dyZXNzICkge1xuICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcInByb2dyZXNzXCIsIGZ1bmN0aW9uKGV2dCl7XG4gICAgICAgICAgICAgIGlmIChldnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICAgIHZhciBkaWZmID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lO1xuICAgICAgICAgICAgICAgIHZhciBzcGVlZCA9IChldnQubG9hZGVkIC8gMTAwMDAwMCkgLyAoZGlmZiAvIDEwMDApO1xuICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MoKChldnQubG9hZGVkIC8gZXZ0LnRvdGFsKSoxMDApLnRvRml4ZWQoMCksIHNwZWVkLnRvRml4ZWQoMikrJ01icHMnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgIH1cbiAgfSBjYXRjaChlKSB7fVxuXG4gICQuYWpheCh7XG4gICAgdXJsOiBob3N0ICsgJy9hcGkvMy9hY3Rpb24vcmVzb3VyY2VfY3JlYXRlJyxcbiAgICB0eXBlOiBcIlBPU1RcIixcbiAgICBkYXRhOiBmb3JtRGF0YSxcbiAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgIHhockZpZWxkczoge1xuICAgICAgd2l0aENyZWRlbnRpYWxzOiB0cnVlXG4gICAgfSxcbiAgICB4aHIgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHhocjtcbiAgICB9LFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgY2FsbGJhY2sobnVsbCwge1xuICAgICAgICBib2R5IDogcmVzcFxuICAgICAgfSk7XG4gICAgfSxcbiAgICBlcnJvciA6IGZ1bmN0aW9uKCkge1xuICAgICAgY2FsbGJhY2soe2Vycm9yOnRydWUsbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB4aHI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ociwgaCwgaywgaXNCcm93c2VyLCBoYW5kbGVSZXNwKSB7XG4gIHJlcXVlc3QgPSByO1xuICBrZXkgPSBrO1xuICBob3N0ID0gaDtcblxuICByZXR1cm4gZnVuY3Rpb24ocGtnaWQsIGZpbGUsIGNhbGxiYWNrLCBwcm9ncmVzcykge1xuICAgIGZ1bmN0aW9uIG5leHQoZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGlmKCBpc0Jyb3dzZXIgKSBhZGRSZXNvdXJjZUJyb3dzZXIocGtnaWQsIGZpbGUsIG5leHQsIHByb2dyZXNzKTtcbiAgICBlbHNlIGFkZFJlc291cmNlTm9kZShwa2dpZCwgZmlsZSwgbmV4dCk7XG4gIH07XG59O1xuIiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5cbi8vIGRlcGVuZHMgaWYgd2UgYXJlIHJ1bm5pbmcgZnJvbSBub2RlanMgb3IgYnJvd3NlclxudmFyIGFnZW50ID0gcmVxdWVzdC5hZ2VudCA/IHJlcXVlc3QuYWdlbnQoKSA6IHJlcXVlc3Q7XG52YXIgaXNCcm93c2VyID0gcmVxdWVzdC5hZ2VudCA/IGZhbHNlIDogdHJ1ZTtcbnZhciBrZXkgPSAnJztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICB0aGlzLmhvc3QgPSBjb25maWcuaG9zdCB8fCAnLyc7XG4gIGtleSA9IGNvbmZpZy5rZXkgfHwgJyc7XG4gIHRoaXMua2V5ID0ga2V5O1xuXG4gIHRoaXMucHJlcGFyZVdvcmtzcGFjZSA9IGZ1bmN0aW9uKHBrZ2lkLCBjYWxsYmFjaykge1xuICAgIGdldChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy93b3Jrc3BhY2UvcHJlcGFyZScsXG4gICAgICB7XG4gICAgICAgIGZvcmNlOiB0cnVlLFxuICAgICAgICBwYWNrYWdlX2lkOiBwa2dpZFxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCl7XG4gICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICB0aGlzLmdldFdvcmtzcGFjZSA9IGZ1bmN0aW9uKHBrZ2lkLCBjYWxsYmFjaykge1xuICAgIGdldChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy93b3Jrc3BhY2UvZ2V0JyxcbiAgICAgIHtcbiAgICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkXG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKXtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0QWN0aXZlVXNlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZ2V0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3VzZXIvZ2V0JyxcbiAgICAgIHt9LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIGEgcmVzb3VyY2UgdG8gYSBwYWNrYWdlIHVzaW5nIHRoZSBicm93c2VycyBGb3JtRGF0YSBvYmplY3QgaW4gYSBicm93c2VyXG4gICAqIG9yIHVzZXIgdGhlIHN1cGVyYWdlbnQgZm9yIE5vZGVKU1xuICAgKlxuICAgKiBwa2dpZDogaWQgb2YgdGhlIHBhY2thZ2UgdG8gYWRkIHRvXG4gICAqIGZpbGU6IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHRvIHJlc291cmNlIHRvIHVwbG9hZCBvciBpZiBOb2RlSlMgc3RyaW5nIHBhdGggdG8gZmlsZVxuICAgKiBjYWxsYmFjazogY2FsbGJhY2sgaGFuZGxlclxuICAgKiBwcm9ncmVzczogY2FsbGJhY2sgZm9yIHByb2dyZXNzIHVwZGF0ZSAobm90IHN1cHBvcnRlZCBpbiBOb2RlSlMpXG4gICAqKi9cbiAgdGhpcy5hZGRSZXNvdXJjZSA9IHJlcXVpcmUoJy4vYWRkUmVzb3VyY2UnKShyZXF1ZXN0LCBjb25maWcuaG9zdCwga2V5LCBpc0Jyb3dzZXIsIGhhbmRsZVJlc3ApO1xuXG5cbiAgdGhpcy5nZXREYXRhc2hlZXQgPSBmdW5jdGlvbihwa2dpZCwgcmlkLCBzaWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL2dldCcsXG4gICAgICB7XG4gICAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZCxcbiAgICAgICAgcmVzb3VyY2VfaWQgOiByaWQsXG4gICAgICAgIGRhdGFzaGVldF9pZCA6IHNpZFxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICk7XG4gIH07XG5cbiAgdGhpcy5nZXRNZXRhZGF0YUluZm8gPSBmdW5jdGlvbihwYWNrYWdlX2lkLCByZXNvdXJjZV9pZCwgc2hlZXRfaWQsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgcXVlcnkgPSB7XG4gICAgICAgIHBhY2thZ2VfaWQgOiBwYWNrYWdlX2lkLFxuICAgICAgICByZXNvdXJjZV9pZCA6IHJlc291cmNlX2lkXG4gICAgICB9O1xuICAgICAgaWYoIHNoZWV0X2lkICkge1xuICAgICAgICBxdWVyeS5zaGVldF9pZCA9IHNoZWV0X2lkO1xuICAgICAgfVxuXG4gICAgICBnZXQoXG4gICAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9nZXRNZXRhZGF0YUluZm8nLFxuICAgICAgICBxdWVyeSxcbiAgICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgfTtcblxuICB0aGlzLmdldE1ldGFkYXRhQ2h1bmsgPSBmdW5jdGlvbihwYWNrYWdlX2lkLCByZXNvdXJjZV9pZCwgc2hlZXRfaWQsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgdmFyIHF1ZXJ5ID0ge1xuICAgICAgICBwYWNrYWdlX2lkIDogcGFja2FnZV9pZCxcbiAgICAgICAgcmVzb3VyY2VfaWQgOiByZXNvdXJjZV9pZCxcbiAgICAgICAgaW5kZXggOiBpbmRleFxuICAgICAgfTtcbiAgICAgIGlmKCBzaGVldF9pZCApIHtcbiAgICAgICAgcXVlcnkuc2hlZXRfaWQgPSBzaGVldF9pZDtcbiAgICAgIH1cblxuICAgICAgZ2V0KFxuICAgICAgICB0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZ2V0TWV0YWRhdGFDaHVuaycsXG4gICAgICAgIHF1ZXJ5LFxuICAgICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0U3BlY3RyYSA9IGZ1bmN0aW9uKHBrZ2lkLCByaWQsIHNpZCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge1xuICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkLFxuICAgICAgaW5kZXggOiBpbmRleFxuICAgIH07XG5cbiAgICBpZiggcmlkICkge1xuICAgICAgcXVlcnkucmVzb3VyY2VfaWQgPSByaWQ7XG4gICAgfVxuICAgIGlmKCBzaWQgKSB7XG4gICAgICBxdWVyeS5zaGVldF9pZCA9IHNpZDtcbiAgICB9XG5cbiAgICBnZXQoXG4gICAgICB0aGlzLmhvc3QrJy9lY29zaXMvc3BlY3RyYS9nZXQnLFxuICAgICAgcXVlcnksXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0U3BlY3RyYUNvdW50ID0gZnVuY3Rpb24ocGtnaWQsIHJpZCwgc2lkLCBjYWxsYmFjaykge1xuICAgIHZhciBxdWVyeSA9IHtcbiAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZFxuICAgIH07XG5cbiAgICBpZiggcmlkICkge1xuICAgICAgcXVlcnkucmVzb3VyY2VfaWQgPSByaWQ7XG4gICAgfVxuICAgIGlmKCBzaWQgKSB7XG4gICAgICBxdWVyeS5zaGVldF9pZCA9IHNpZDtcbiAgICB9XG5cbiAgICBnZXQoXG4gICAgICB0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZ2V0U3BlY3RyYUNvdW50JyxcbiAgICAgIHF1ZXJ5LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuXG4gIHRoaXMucHJvY2Vzc1Jlc291cmNlID0gZnVuY3Rpb24ocGtnaWQsIHJlc291cmNlX2lkLCBzaGVldF9pZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkLFxuICAgICAgICBvcHRpb25zIDogSlNPTi5zdHJpbmdpZnkob3B0aW9ucylcbiAgICB9O1xuXG4gICAgLy8gYXBwbHkgdG8gbXVsdGlwbGUgcmVzb3VyY2VzLCBoZWxwZXIgZm9yIGZpcnN0IHVwbG9hZFxuICAgIGlmKCBBcnJheS5pc0FycmF5KHJlc291cmNlX2lkKSApIHtcbiAgICAgIGRhdGEucmVzb3VyY2VfaWRzID0gSlNPTi5zdHJpbmdpZnkocmVzb3VyY2VfaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXRhLnJlc291cmNlX2lkID0gcmVzb3VyY2VfaWQ7XG4gICAgICBkYXRhLnNoZWV0X2lkID0gc2hlZXRfaWQ7XG4gICAgfVxuXG4gICAgcG9zdChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9wcm9jZXNzJyxcbiAgICAgIGRhdGEsXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcblxuICAgICAgICAvLyB1cGRhdGUgaW5mbyBpbiB0aGUgZGF0YXN0b3JlIGlmIHdlIGhhdmUgb25lXG4gICAgICAgIGlmKCB0aGlzLmRzICkge1xuICAgICAgICAgIHRoaXMuZHMud2F2ZWxlbmd0aHMgPSByZXNwLndhdmVsZW5ndGhzIHx8IFtdO1xuICAgICAgICAgIHRoaXMuZHMuc2NoZW1hID0gW107XG4gICAgICAgICAgaWYoICFyZXNwLmF0dHJpYnV0ZXMgKSByZXR1cm47XG5cbiAgICAgICAgICBmb3IoIHZhciBhdHRyTmFtZSBpbiByZXNwLmF0dHJpYnV0ZXMgKSB7XG4gICAgICAgICAgICAgIHZhciBhdHRyID0gcmVzcC5hdHRyaWJ1dGVzW2F0dHJOYW1lXTtcbiAgICAgICAgICAgICAgYXR0ci5uYW1lID0gYXR0ck5hbWU7XG4gICAgICAgICAgICAgIHRoaXMuZHMuc2NoZW1hLnB1c2goYXR0cik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0TGljZW5zZUxpc3QgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vbGljZW5zZV9saXN0Jywge30sIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmdldFBhY2thZ2UgPSBmdW5jdGlvbihwa2dpZCwgY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL3BhY2thZ2Vfc2hvdycsIHtpZCA6IHBrZ2lkfSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuZ2V0T3JnYW5pemF0aW9uID0gZnVuY3Rpb24obmFtZU9ySWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9vcmdhbml6YXRpb25fc2hvdycsIHtpZCA6IG5hbWVPcklkfSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMudGFnU2VhcmNoID0gZnVuY3Rpb24ocXVlcnksIGxpbWl0LCBjYWxsYmFjaykge1xuICAgIC8vIHN1cHBvcnRpbmcgbXVsdGlwbGUgdmVyc2lvbnMgb2YgY2thbi4gIHdoeSB0aGV5IGNoYW5nZWQgdGhpcyBwYXJhbWV0ZXIuLi4gd2hvIGtub3dzLi4uXG5cbiAgICBxdWVyeSA9IHtcbiAgICAgIHF1ZXJ5IDogcXVlcnksXG4gICAgICBja2FuIDogcXVlcnksXG4gICAgICBsaW1pdCA6IGxpbWl0IHx8IDEwXG4gICAgfTtcblxuICAgIGdldCh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vdGFnX3NlYXJjaCcsIHF1ZXJ5LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgdG1wID0ge30sIGtleTtcbiAgICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHJlc3AucmVzdWx0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHJlc3AucmVzdWx0c1tpXS5uYW1lID0gcmVzcC5yZXN1bHRzW2ldLm5hbWUudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgICAgICAgICB0bXBbcmVzcC5yZXN1bHRzW2ldLm5hbWVdID0gcmVzcC5yZXN1bHRzW2ldO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3AucmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvcigga2V5IGluIHRtcCApIHtcbiAgICAgICAgICAgIHJlc3AucmVzdWx0cy5wdXNoKHRtcFtrZXldKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaChlKSB7fVxuXG4gICAgICAgIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy51cGRhdGVQYWNrYWdlID0gZnVuY3Rpb24ocGtnLCBjYWxsYmFjaykge1xuICAgIGlmKCBwa2cucHJpdmF0ZSApIHtcbiAgICAgIHRoaXMudmVyaWZ5UHJpdmF0ZShwa2cuaWQsXG4gICAgICAgIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVQYWNrYWdlKHBrZywgY2FsbGJhY2spO1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVBhY2thZ2UocGtnLCBjYWxsYmFjayk7XG4gIH07XG5cbiAgdGhpcy5fdXBkYXRlUGFja2FnZSA9IGZ1bmN0aW9uKHBrZywgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9wYWNrYWdlX3VwZGF0ZScsIHBrZywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMudXBkYXRlTGlua2VkUmVzb3VyY2VzID0gZnVuY3Rpb24oaWQsIHJlc291cmNlcywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkIDogaWQsXG4gICAgICBsaW5rZWRSZXNvdXJjZXMgOiByZXNvdXJjZXNcbiAgICB9XG5cbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2Vjb3Npcy9wYWNrYWdlL3VwZGF0ZUxpbmtlZFJlc291cmNlcycsIGRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLnZlcmlmeVByaXZhdGUgPSBmdW5jdGlvbihpZCwgY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL3BhY2thZ2Uvc2V0UHJpdmF0ZScsIHtpZDogaWR9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5kZWxldGVQYWNrYWdlID0gZnVuY3Rpb24ocGtnaWQsIGNhbGxiYWNrKSB7XG4gICAgcG9zdFJhdyh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vcGFja2FnZV9kZWxldGUnLCBKU09OLnN0cmluZ2lmeSh7aWQ6IHBrZ2lkfSksIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmNyZWF0ZVBhY2thZ2UgPSBmdW5jdGlvbihwa2csIGNhbGxiYWNrKSB7XG4gICAgcG9zdFJhdyh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vcGFja2FnZV9jcmVhdGUnLCBwa2csIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKnRoaXMuc2V0UGFja2FnZU9wdGlvbnMgPSBmdW5jdGlvbihwa2dpZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZCxcbiAgICAgIG9wdGlvbnMgOiBKU09OLnN0cmluZ2lmeShvcHRpb25zKVxuICAgIH07XG5cbiAgICBwb3N0KHRoaXMuaG9zdCsnL2Vjb3Npcy9wYWNrYWdlL3NldE9wdGlvbnMnLCBkYXRhLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07Ki9cblxuICB0aGlzLnRvcFN1Z2dlc3RPdmVydmlldyA9IGZ1bmN0aW9uKGxpc3QsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lcyA6IEpTT04uc3RyaW5naWZ5KGxpc3QpLFxuICAgIH07XG5cbiAgICBwb3N0KHRoaXMuaG9zdCsnL2Vjb3Npcy9zcGVjdHJhL3N1Z2dlc3RPdmVydmlldycsIGRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLnRvcFN1Z2dlc3QgPSBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvc3BlY3RyYS9zdWdnZXN0Jywge25hbWUgOm5hbWV9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5nY21kU3VnZ2VzdCA9IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9zcGVjdHJhL2djbWQnLCB7cXVlcnk6IG5hbWUudG9Mb3dlckNhc2UoKX0sIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLnJlbW92ZVJlc291cmNlID0gZnVuY3Rpb24ocmVzb3VyY2VJZCwgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9yZXNvdXJjZV9kZWxldGUnLCBKU09OLnN0cmluZ2lmeSh7aWQgOiByZXNvdXJjZUlkIH0pLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5kZWxldGVSZXNvdXJjZXMgPSBmdW5jdGlvbihyZXNvdXJjZUlkcywgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9kZWxldGVNYW55JywgSlNPTi5zdHJpbmdpZnkoe2lkcyA6IHJlc291cmNlSWRzIH0pLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5wdXNoVG9TZWFyY2ggPSBmdW5jdGlvbihwa2dpZCwgaW5jbHVkZUVtYWlsLCBjYWxsYmFjaykge1xuICAgIHZhciBxdWVyeSA9IHtcbiAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZCxcbiAgICAgIGVtYWlsIDogaW5jbHVkZUVtYWlsID8gJ3RydWUnIDogJ2ZhbHNlJ1xuICAgIH07XG5cbiAgICBnZXQoXG4gICAgICB0aGlzLmhvc3QrJy9lY29zaXMvd29ya3NwYWNlL3B1c2gnLFxuICAgICAgcXVlcnksXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2l0SW5mbyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9naXRJbmZvJywge30sIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cblxuZnVuY3Rpb24gcG9zdCh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG4gIHZhciByID0gcmVxdWVzdFxuICAgLnBvc3QodXJsKVxuICAgLndpdGhDcmVkZW50aWFscygpXG4gICAudHlwZSgnZm9ybScpXG4gICAuc2VuZChkYXRhKTtcblxuICBpZigga2V5ICkge1xuICAgIHIuc2V0KCdBdXRob3JpemF0aW9uJywga2V5KTtcbiAgfVxuXG4gIHIuZW5kKGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gcG9zdFJhdyh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG4gIHZhciByID0gcmVxdWVzdFxuICAgLnBvc3QodXJsKVxuICAgLndpdGhDcmVkZW50aWFscygpXG4gICAuc2VuZChkYXRhKTtcblxuICAgaWYoIGtleSApIHtcbiAgICAgci5zZXQoJ0F1dGhvcml6YXRpb24nLCBrZXkpO1xuICAgfVxuXG4gICByLmVuZChjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGdldCh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG4gIHZhciByID0gcmVxdWVzdFxuICAgIC5nZXQodXJsKVxuICAgIC5xdWVyeShkYXRhIHx8IHt9KVxuICAgIC53aXRoQ3JlZGVudGlhbHMoKTtcblxuXG4gIGlmKCBrZXkgKSB7XG4gICAgci5zZXQoJ0F1dGhvcml6YXRpb24nLCBrZXkpO1xuICB9XG5cbiAgci5lbmQoY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spIHtcbiAgaWYoIGVyciApIHtcbiAgICByZXR1cm4gY2FsbGJhY2soe1xuICAgICAgZXJyb3I6IHRydWUsXG4gICAgICBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsXG4gICAgICB0eXBlIDogJ2h0dHAnLFxuICAgICAgZGV0YWlsczogZXJyXG4gICAgfSk7XG4gIH1cblxuICBpZiggIXJlc3AgKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ1JlcXVlc3QgRXJyb3InLFxuICAgICAgdHlwZSA6ICdodHRwJyxcbiAgICAgIGRldGFpbHM6ICdTZXJ2ZXIgZGlkIG5vdCBzZW5kIGEgcmVzcG9uc2UnXG4gICAgfSk7XG4gIH1cblxuICBpZiggIXJlc3AuYm9keSApIHtcbiAgICByZXR1cm4gY2FsbGJhY2soe1xuICAgICAgZXJyb3I6IHRydWUsXG4gICAgICBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsXG4gICAgICB0eXBlIDogJ2h0dHAnLFxuICAgICAgZGV0YWlsczogJ1NlcnZlciBkaWQgbm90IHNlbmQgYSByZXNwb25zZSdcbiAgICB9KTtcbiAgfVxuXG4gIGlmKCByZXNwLmJvZHkuZXJyb3IgKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ1JlcXVlc3QgRXJyb3InLFxuICAgICAgdHlwZSA6ICdja2FuJyxcbiAgICAgIGRldGFpbHM6IHJlc3AgPyByZXNwLmJvZHkgOiAnJ1xuICAgIH0pO1xuICB9XG5cbiAgaWYoIHJlc3AuYm9keS5zdWNjZXNzICYmIHJlc3AuYm9keS5yZXN1bHQgKSB7XG4gICAgY2FsbGJhY2socmVzcC5ib2R5LnJlc3VsdCk7XG4gIH0gZWxzZSB7XG4gICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZXJyLCByZXNwKSB7XG4gIGlmKCBlcnIgKSByZXR1cm4gdHJ1ZTtcbiAgaWYoIHJlc3AgJiYgcmVzcC5ib2R5ICYmIHJlc3AuYm9keS5lcnJvciApIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG4iLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHRoaXMuY2thbiA9IGNvbmZpZy5ja2FuO1xuICB0aGlzLlNESyA9IGNvbmZpZy5TREs7XG4gIGlmKCB0aGlzLmNrYW4gKSB0aGlzLmNrYW4uZHMgPSB0aGlzO1xuXG4gIC8vIGlzIHRoaXMgYW4gZXhpc3RpbmcgZGF0YXNldFxuICB0aGlzLmVkaXRNb2RlID0gY29uZmlnLnBhY2thZ2VfaWQgPyB0cnVlIDogZmFsc2U7XG5cbiAgLy8gZXhpc3RpbmcgcGFja2FnZSBpZFxuICB0aGlzLnBhY2thZ2VfaWQgPSBjb25maWcucGFja2FnZV9pZDtcblxuICB0aGlzLnBhY2thZ2UgPSB0aGlzLlNESy5uZXdQYWNrYWdlKCk7XG4gIHRoaXMucGFja2FnZS5tb2RlID0gdGhpcy5lZGl0TW9kZSA/ICdlZGl0JyA6ICdjcmVhdGUnO1xuXG4gIHRoaXMub3duZXJfb3JnX25hbWUgPSAnJztcblxuICB0aGlzLmRhdGFzZXRBdHRyaWJ1dGVzID0ge1xuICAgIC8vZ3JvdXBfYnkgOiAnJyxcbiAgICBzb3J0X29uIDogJycsXG4gICAgc29ydF90eXBlIDogJycsXG4gICAgc29ydF9kZXNjcmlwdGlvbiA6ICcnXG4gIH07XG5cbiAgLy8gbGlzdCBvZiBhbGwgbmV3IHJlc291cmNlc1xuICB0aGlzLnJlc291cmNlcyA9IFtdO1xuXG4gIC8vIGhhc2ggb2YgY3VycmVudCBhdHRyaWJ1dGUgbmFtZSBtYXBwaW5nc1xuICAvLyAgLSBrZXk6IGVjb3NpcyBuYW1lXG4gIC8vICAtIHZhbHVlOiBkYXRhc2V0IG5hbWVcbiAgdGhpcy5hdHRyaWJ1dGVNYXAgPSB7fTtcblxuICAvLyBpbnZlcnNlIGxpc3Qgb2YgYWJvdmUgbWFwIHcvIGtleSAvIHZhbHVlIHN3aXRjaGVkXG4gIHRoaXMuaW52ZXJzZUF0dHJpYnV0ZU1hcCA9IHt9O1xuXG4gIHRoaXMubWV0YWRhdGFEZWZpbml0aW9ucyA9IHJlcXVpcmUoJy4vc2NoZW1hJyk7XG4gIHRoaXMubWV0YWRhdGFMb29rdXAgPSB7fTtcbiAgZm9yKCB2YXIgY2F0IGluIHRoaXMubWV0YWRhdGFEZWZpbml0aW9ucyApIHtcbiAgICB2YXIgZGVmcyA9IHRoaXMubWV0YWRhdGFEZWZpbml0aW9uc1tjYXRdO1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZGVmcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGRlZnNbaV0uY2F0ZWdvcnkgPSBjYXQ7XG4gICAgICBkZWZzW2ldLmZsYXQgPSBkZWZzW2ldLm5hbWUucmVwbGFjZSgvXFxzL2csJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBkZWZzW2ldLmZuTmFtZSA9IGRlZnNbaV0ubmFtZS5yZXBsYWNlKC9cXHMvZywnJyk7XG4gICAgICB0aGlzLm1ldGFkYXRhTG9va3VwW2RlZnNbaV0ubmFtZV0gPSBkZWZzW2ldO1xuICAgIH1cbiAgfVxuXG4gIC8vIHRoaXMgZmxhZyBwcmV2ZW50cyB1cCBmcm9tIG1ha2luZyB1cGRhdGVzIHdoZW4gd2UgYXJlIGluaXRpYWxseVxuICAvLyBzZXR0aW5nIHRoZSBkYXRhXG4gIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gIHRoaXMubG9hZGluZ0Vycm9yID0gZmFsc2U7XG5cbiAgLy8gd2lyZSBldmVudHNcbiAgdmFyIGVlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBlZS5zZXRNYXhMaXN0ZW5lcnMoMTAwKTtcbiAgdGhpcy5vbiA9IGZ1bmN0aW9uKGUsIGZuKSB7XG4gICAgLy8gaWYgdGhpbmdzIHdhbnQgdG8ga25vdyB3ZSBhcmUgbG9hZGVkIGFuZCB3ZSBoYXZlIGFscmVhZHkgZmlyZWQsIGp1c3QgdHJpZ2dlci5cbiAgICBpZiggZSA9PSAnbG9hZCcgJiYgdGhpcy5sb2FkZWQgKSB7XG4gICAgICBzZXRUaW1lb3V0KGZuLCAyMDApOyAvLyBIQUNLOiBuZWVkIHRvIGZpeCBzZXRWYWx1ZXMoKSBvZiBlY29zaXMtKi1pbnB1dFxuICAgICAgLy9yZXR1cm5cbiAgICB9XG5cbiAgICBlZS5vbihlLCBmbik7XG4gIH07XG5cbiAgdGhpcy5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ja2FuLnByZXBhcmVXb3Jrc3BhY2UodGhpcy5wYWNrYWdlX2lkLCBmdW5jdGlvbihyZXN1bHQpe1xuXG4gICAgICBpZiggcmVzdWx0LmVycm9yICkge1xuICAgICAgICB0aGlzLmxvYWRpbmdFcnJvciA9IHJlc3VsdDtcbiAgICAgICAgZWUuZW1pdCgnbG9hZC1lcnJvcicsIHJlc3VsdCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5ja2FuLmdldFdvcmtzcGFjZSh0aGlzLnBhY2thZ2VfaWQsIGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIGlmKCByZXN1bHQuZXJyb3IgKSB7XG4gICAgICAgICAgdGhpcy5sb2FkaW5nRXJyb3IgPSByZXN1bHQ7XG4gICAgICAgICAgZWUuZW1pdCgnbG9hZC1lcnJvcicsIHJlc3VsdCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIHRoaXMuX3NldERhdGEoKTtcblxuICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgICAgIGVlLmVtaXQoJ2xvYWQnKTtcbiAgICAgICAgdGhpcy5jaGVja0NoYW5nZXMoKTtcblxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9O1xuXG4gIHRoaXMubG9hZEZyb21UZW1wbGF0ZSA9IGZ1bmN0aW9uKGNrYW5QYWNrYWdlKSB7XG4gICAgdGhpcy5wYWNrYWdlLnJlc2V0KCk7XG4gICAgdGhpcy5wYWNrYWdlLm1vZGUgPSAnY3JlYXRlJztcblxuICAgIC8vIHNldCB0aGUgZGVmYXVsdCBhdHRpcmJ1dGVzIGZvciB0aGlzIGRhdGFzZXRcbiAgICB0aGlzLnBhY2thZ2UubG9hZEZyb21UZW1wbGF0ZShja2FuUGFja2FnZSwgdGhpcy5TREsudXNlcik7XG4gICAgdGhpcy51cGRhdGVBbGlhc0xvb2t1cCgpO1xuXG4gICAgZWUuZW1pdCgnbG9hZCcpO1xuICAgIHRoaXMuZmlyZVVwZGF0ZSgpO1xuICB9O1xuXG4gIHRoaXMuY2hlY2tDaGFuZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYoICF0aGlzLmVkaXRNb2RlIHx8ICF0aGlzLmxhc3RQdXNoZWQgKSByZXR1cm47XG5cbiAgICB2YXIgdCA9IG5ldyBEYXRlKHRoaXMucGFja2FnZS5kYXRhLm1ldGFkYXRhX21vZGlmaWVkKS5nZXRUaW1lKCk7XG5cbiAgICBpZiggdGhpcy5kZWxldGVSZXNvdXJjZVRpbWUgKSB7XG4gICAgICBpZiggdGhpcy5kZWxldGVSZXNvdXJjZVRpbWUuZ2V0VGltZSgpID4gdCApIHtcbiAgICAgICAgdCA9IHRoaXMuZGVsZXRlUmVzb3VyY2VUaW1lLmdldFRpbWUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmVzcCA9IHtcbiAgICAgIGxhc3RQdXNoZWQgOiB0aGlzLmxhc3RQdXNoZWQsXG4gICAgICBsYXN0VXBkYXRlZCA6IG5ldyBEYXRlKHQpLFxuICAgICAgdW5wdWJsaXNoZWRDaGFuZ2VzIDogKHRoaXMubGFzdFB1c2hlZC5nZXRUaW1lKCkgPCBuZXcgRGF0ZSh0KS5nZXRUaW1lKCkpXG4gICAgfTtcblxuICAgIGVlLmVtaXQoJ2NoYW5nZXMnLCByZXNwKTtcbiAgICByZXR1cm4gcmVzcDtcbiAgfSxcblxuICAvLyBoZWxwZXIgZm9yIHdoZW4gZGF0YSBsb2Fkc1xuICB0aGlzLl9zZXREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lZGl0TW9kZSA9IHRydWU7XG5cbiAgICB0aGlzLmxhc3RQdXNoZWQgPSB0aGlzLnJlc3VsdC5wdXNoZWQ7XG4gICAgaWYoIHRoaXMubGFzdFB1c2hlZCApIHtcbiAgICAgIHRoaXMubGFzdFB1c2hlZCA9IG5ldyBEYXRlKHRoaXMubGFzdFB1c2hlZCk7XG4gICAgfVxuXG4gICAgdmFyIGNrYW5QYWNrYWdlID0gdGhpcy5yZXN1bHQuY2thbi5wYWNrYWdlO1xuICAgIHRoaXMucGFja2FnZV9pZCA9IGNrYW5QYWNrYWdlLmlkO1xuXG4gICAgdGhpcy5wYWNrYWdlLnJlc2V0KGNrYW5QYWNrYWdlKTtcbiAgICB0aGlzLnBhY2thZ2UubG9hZEZyb21UZW1wbGF0ZShja2FuUGFja2FnZSwgbnVsbCwgdHJ1ZSk7XG5cbiAgICB0aGlzLmRhdGFzaGVldHMgPSB0aGlzLnJlc3VsdC5yZXNvdXJjZXM7XG5cbiAgICB0aGlzLmF0dHJpYnV0ZU1hcCA9IHt9O1xuICAgIHRoaXMuaW52ZXJzZUF0dHJpYnV0ZU1hcCA9IHt9O1xuXG4gICAgaWYoIHRoaXMucmVzdWx0LnBhY2thZ2UubWFwICYmIE9iamVjdCh0aGlzLnBhY2thZ2UuZ2V0QWxpYXNlcygpKS5sZW5ndGggPT09IDAgKSB7XG4gICAgICB0aGlzLnBhY2thZ2Uuc2V0QWxpYXNlcyh0aGlzLnJlc3VsdC5wYWNrYWdlLm1hcCk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVBbGlhc0xvb2t1cCgpO1xuXG4gICAgLy8gY2hlY2sgZm9yIGJhZG5lc3NcbiAgICBpZiggdGhpcy5yZXN1bHQucGFja2FnZS5zb3J0ICYmIE9iamVjdCh0aGlzLnBhY2thZ2UuZ2V0U29ydCgpKS5sZW5ndGggPT09IDAgKSB7XG4gICAgICB0aGlzLnBhY2thZ2Uuc2V0U29ydCh0aGlzLnJlc3VsdC5wYWNrYWdlLnNvcnQpO1xuICAgIH1cblxuICAgIHRoaXMucmVzb3VyY2VzID0gdGhpcy5yZXN1bHQuY2thbi5yZXNvdXJjZXM7XG5cbiAgICB2YXIgemlwcyA9IHt9OyAvLyB1c2VkIHRvIHF1aWNrbHkgYWRkIHJlc291cmNlIHN0dWJzXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnJlc291cmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLnJlc291cmNlc1tpXS5mb3JtYXQudG9Mb3dlckNhc2UoKSA9PT0gJ3ppcCcgfHwgdGhpcy5yZXNvdXJjZXNbaV0ubmFtZS50b0xvd2VyQ2FzZSgpLm1hdGNoKC9cXC56aXAkLykgKSB7XG4gICAgICAgIHppcHNbdGhpcy5yZXNvdXJjZXNbaV0uaWRdID0gdGhpcy5yZXNvdXJjZXNbaV07XG4gICAgICAgIHRoaXMucmVzb3VyY2VzW2ldLmNoaWxkUmVzb3VyY2VzID0gW107XG4gICAgICAgIHRoaXMucmVzb3VyY2VzW2ldLmlzWmlwID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIHRoaXMucmVzb3VyY2VzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICBpZiggYS5uYW1lID4gYi5uYW1lICkgcmV0dXJuIDE7XG4gICAgICBpZiggYS5uYW1lIDwgYi5uYW1lICkgcmV0dXJuIC0xO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSk7XG5cblxuICAgIHRoaXMucmVzb3VyY2VMb29rdXAgPSB7fTtcblxuICAgIC8vIGNyZWF0ZSBmYWtlIHN0dWJzIGZvciB6aXAgZmlsZSByZXNvdXJjZXNcbiAgICB2YXIgYWxyZWFkeUFkZGVkID0ge307XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGFzaGVldHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggIXRoaXMuZGF0YXNoZWV0c1tpXS5mcm9tWmlwICkgY29udGludWU7XG4gICAgICBpZiggYWxyZWFkeUFkZGVkW3RoaXMuZGF0YXNoZWV0c1tpXS5yZXNvdXJjZUlkXSApIGNvbnRpbnVlO1xuXG4gICAgICB2YXIgciA9IHRoaXMuZGF0YXNoZWV0c1tpXTtcblxuICAgICAgdmFyIHN0dWIgPSB7XG4gICAgICAgIGlkIDogci5yZXNvdXJjZUlkLFxuICAgICAgICBwYWNrYWdlX2lkIDogci5wYWNrYWdlSWQsXG4gICAgICAgIGZyb21aaXAgOiB0cnVlLFxuICAgICAgICB6aXAgOiByLnppcCxcbiAgICAgICAgbmFtZSA6IHIubmFtZVxuICAgICAgfVxuXG4gICAgICB6aXBzW3IuemlwLnJlc291cmNlSWRdLmNoaWxkUmVzb3VyY2VzLnB1c2goc3R1Yik7XG4gICAgICB0aGlzLnJlc291cmNlcy5wdXNoKHN0dWIpO1xuXG4gICAgICBhbHJlYWR5QWRkZWRbci5yZXNvdXJjZUlkXSA9IDE7IC8vIHdoeT9cbiAgICB9XG5cbiAgICAvLyBtYXAgcmVzb3VyY2VzIHRvIGRhdGFzaGVldHMgZm9yIGRhc3RlciBsb29rdXBcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMucmVzb3VyY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdmFyIGRhdGFzaGVldHMgPSBbXTtcbiAgICAgIGZvciggdmFyIGogPSAwOyBqIDwgdGhpcy5kYXRhc2hlZXRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBpZiggdGhpcy5kYXRhc2hlZXRzW2pdLnJlc291cmNlSWQgPT0gdGhpcy5yZXNvdXJjZXNbaV0uaWQgKSB7XG4gICAgICAgICAgZGF0YXNoZWV0cy5wdXNoKHRoaXMuZGF0YXNoZWV0c1tqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5yZXNvdXJjZUxvb2t1cFt0aGlzLnJlc291cmNlc1tpXS5pZF0gPSB0aGlzLnJlc291cmNlc1tpXTtcbiAgICAgIHRoaXMucmVzb3VyY2VzW2ldLmRhdGFzaGVldHMgPSBkYXRhc2hlZXRzO1xuICAgIH1cblxuICAgIHRoaXMuZmlyZVVwZGF0ZSgpO1xuICB9XG5cbiAgdGhpcy51cGRhdGVBbGlhc0xvb2t1cCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYXR0cmlidXRlTWFwID0gdGhpcy5wYWNrYWdlLmdldEFsaWFzZXMoKTtcbiAgICBmb3IoIHZhciBrZXkgaW4gdGhpcy5hdHRyaWJ1dGVNYXAgKSB7XG4gICAgICB0aGlzLmludmVyc2VBdHRyaWJ1dGVNYXBbdGhpcy5hdHRyaWJ1dGVNYXBba2V5XV0gPSBrZXk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuc2V0U2hlZXQgPSBmdW5jdGlvbihzaGVldCkge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhc2hlZXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YXNoZWV0c1tpXS5yZXNvdXJjZUlkID09IHNoZWV0LnJlc291cmNlSWQgJiZcbiAgICAgICAgICB0aGlzLmRhdGFzaGVldHNbaV0uc2hlZXRJZCA9PSBzaGVldC5zaGVldElkICkge1xuXG4gICAgICAgICAgdGhpcy5kYXRhc2hlZXRzW2ldID0gc2hlZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlc291cmNlID0gdGhpcy5yZXNvdXJjZUxvb2t1cFtzaGVldC5yZXNvdXJjZUlkXTtcbiAgICBpZiggIXJlc291cmNlICkge1xuICAgICAgY29uc29sZS5sb2coJ0F0dGVtcHRpbmcgdG8gc2V0IHNoZWV0IHdpdGggYSByZXNvdXJjZUlkIHRoYXQgZG9lcyBub3QgZXhpc3QnKTtcbiAgICAgIGNvbnNvbGUubG9nKHNoZWV0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHJlc291cmNlLmRhdGFzaGVldHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggcmVzb3VyY2UuZGF0YXNoZWV0c1tpXS5zaGVldElkID09IHNoZWV0LnNoZWV0SWQgKSB7XG4gICAgICAgICAgcmVzb3VyY2UuZGF0YXNoZWV0c1tpXSA9IHNoZWV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2hlY2tDaGFuZ2VzKCk7XG4gIH1cblxuICB0aGlzLmZpcmVVcGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBlZS5lbWl0KCd1cGRhdGUnKTtcbiAgfTtcblxuICB0aGlzLnBhY2thZ2Uub24oJ3NhdmUtZW5kJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNoZWNrQ2hhbmdlcygpO1xuICAgIHRoaXMuZmlyZVVwZGF0ZSgpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHRoaXMucGFja2FnZS5vbigndmFsdWUtc2V0LW9uLWNyZWF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5maXJlVXBkYXRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG5cbiAgLy8gYWZ0ZXIgYSByZXNvdXJjZSBpcyBhZGRlZCwgb3VyIGVudGlyZSBzdGF0ZSBpcyBkaWZmZXJlbnRcbiAgdGhpcy5ydW5BZnRlclJlc291cmNlQWRkID0gZnVuY3Rpb24od29ya3NwYWNlRGF0YSkge1xuICAgIHRoaXMucmVzdWx0ID0gd29ya3NwYWNlRGF0YTtcbiAgICB0aGlzLl9zZXREYXRhKCk7XG4gICAgdGhpcy5jaGVja0NoYW5nZXMoKTtcbiAgfTtcblxuXG4gIC8vIGdldCBhbGwgYXR0aXJidXRlcyBmcm9tIHNoZWV0cyBtYXJrZWQgYXMgZGF0YVxuICB0aGlzLmdldERhdGFzaGVldEF0dHJpYnV0ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXR0cnMgPSB7fSwgc2hlZXQsIGF0dHI7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YXNoZWV0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHNoZWV0ID0gdGhpcy5kYXRhc2hlZXRzW2ldO1xuICAgICAgaWYoIHNoZWV0Lm1ldGFkYXRhICkgY29udGludWU7XG5cbiAgICAgIGZvciggdmFyIGogPSAwOyBqIDwgc2hlZXQuYXR0cmlidXRlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgYXR0ciA9IHNoZWV0LmF0dHJpYnV0ZXNbal07XG4gICAgICAgIGF0dHJzW2F0dHJdID0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoYXR0cnMpO1xuICB9O1xuXG4gIHRoaXMuaXNFY29zaXNNZXRhZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9cXHMvZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgZm9yKCB2YXIga2V5IGluIHRoaXMubWV0YWRhdGFMb29rdXAgKSB7XG4gICAgICBpZiggdGhpcy5tZXRhZGF0YUxvb2t1cFtrZXldLmZsYXQgPT0gbmFtZSApIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgdGhpcy5nZXRTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgdmFyIHRvdGFsID0gNztcblxuICAgIHZhciBicmVha2Rvd24gPSB7XG4gICAgICBiYXNpYyA6IHtcbiAgICAgICAgc2NvcmUgOiAwLFxuICAgICAgICB0b3RhbCA6IDVcbiAgICAgIH0sXG4gICAgICBsaW5rZWQgOiB7XG4gICAgICAgIHNjb3JlIDogMCxcbiAgICAgICAgdG90YWwgOiAxXG4gICAgICB9LFxuICAgICAgbG9jYXRpb24gOiB7XG4gICAgICAgIHNjb3JlIDogMCxcbiAgICAgICAgdG90YWwgOiAxXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIGNoZWNrIGRhdGFzZXQgbGV2ZWwgZWNvc2lzIG1ldGFkYXRhXG4gICAgdmFyIGNhdCA9ICcnO1xuICAgIGZvciggdmFyIGtleSBpbiB0aGlzLm1ldGFkYXRhTG9va3VwICkge1xuICAgICAgY2F0ID0gdGhpcy5tZXRhZGF0YUxvb2t1cFtrZXldLmNhdGVnb3J5LnRvTG93ZXJDYXNlKCk7XG4gICAgICBrZXkgPSBrZXkucmVwbGFjZSgvIC9nLCAnJyk7XG5cbiAgICAgIGlmKCAhYnJlYWtkb3duW2NhdF0gKSB7XG4gICAgICAgIGJyZWFrZG93bltjYXRdID0ge1xuICAgICAgICAgIHNjb3JlIDogMCxcbiAgICAgICAgICB0b3RhbCA6IDBcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaWYoIGtleSA9PT0gJ0xhdGl0dWRlJyB8fCBrZXkgPT09ICdMb25naXR1ZGUnICkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdG9nZ2xlIHRvIGVuYWJsZVxuICAgICAgLy8gaWYoIGtleSA9PT0gJ05BU0FHQ01ES2V5d29yZHMnICkgY29udGludWU7XG5cbiAgICAgIGlmKCB0aGlzLnBhY2thZ2VbJ2dldCcra2V5XSApIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5wYWNrYWdlWydnZXQnK2tleV0oKTtcbiAgICAgICAgaWYoIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgY291bnQrKztcblxuICAgICAgICAgIGlmKCBrZXkgPT09ICdLZXl3b3JkcycgfHwga2V5ID09PSAnV2Vic2l0ZScgKSB7XG4gICAgICAgICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWtkb3duW2NhdF0uc2NvcmUrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdG90YWwrKztcbiAgICAgICAgaWYoIGtleSA9PT0gJ0tleXdvcmRzJyB8fCBrZXkgPT09ICdXZWJzaXRlJyApIHtcbiAgICAgICAgICBicmVha2Rvd24uYmFzaWMudG90YWwrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVha2Rvd25bY2F0XS50b3RhbCsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWYgd2UgaGF2ZSBlY29zaXMgZG9pLCBhZGQgdG8gQ2l0YXRpb24gc2NvcmVcbiAgICBpZiggdGhpcy5wYWNrYWdlLmdldERvaSgpLnZhbHVlICkge1xuICAgICAgYnJlYWtkb3duLmNpdGF0aW9uLnNjb3JlKys7XG4gICAgfVxuXG5cbiAgICBpZiggdGhpcy5wYWNrYWdlLmdldFRpdGxlKCkgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmJhc2ljLnNjb3JlKys7XG4gICAgfVxuICAgIGlmKCB0aGlzLnBhY2thZ2UuZ2V0RGVzY3JpcHRpb24oKSApIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICB9XG4gICAgaWYoIE9iamVjdC5rZXlzKHRoaXMucGFja2FnZS5nZXRMaW5rZWREYXRhKCkpLmxlbmd0aCA+IDAgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmxpbmtlZC5zY29yZSsrO1xuICAgIH1cbiAgICBpZiggdGhpcy5wYWNrYWdlLmdldE9yZ2FuaXphdGlvbigpICkge1xuICAgICAgY291bnQrKztcbiAgICAgIGJyZWFrZG93bi5iYXNpYy5zY29yZSsrO1xuICAgIH1cbiAgICBpZiggdGhpcy5wYWNrYWdlLmdldFZlcnNpb24oKSApIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICB9XG4gICAgaWYoIHRoaXMucGFja2FnZS5nZXRMaWNlbnNlSWQoKSApIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICB9XG4gICAgaWYoIE9iamVjdC5rZXlzKHRoaXMucGFja2FnZS5nZXRHZW9Kc29uKCkpLmxlbmd0aCA+IDAgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmxvY2F0aW9uLnNjb3JlKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNjb3JlOiBjb3VudCxcbiAgICAgIHRvdGFsIDogdG90YWwsXG4gICAgICBicmVha2Rvd24gOiBicmVha2Rvd25cbiAgICB9O1xuICB9O1xufTtcbiIsInZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlcjtcbnZhciBEYXRhc3RvcmUgPSByZXF1aXJlKCcuL2RhdGFzdG9yZScpO1xudmFyIENLQU4gPSByZXF1aXJlKCcuL2NrYW4nKTtcbnZhciBQYWNrYWdlID0gcmVxdWlyZSgnLi9wYWNrYWdlJyk7XG5cbmZ1bmN0aW9uIFNESyhjb25maWcpIHtcbiAgdGhpcy51c2VyID0gbnVsbDtcblxuICB0aGlzLmRlZmF1bHRHcm91cCA9IGNvbmZpZy5kZWZhdWx0R3JvdXA7XG5cbiAgdGhpcy5uZXdQYWNrYWdlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBuZXcgUGFja2FnZShkYXRhLCB0aGlzKTtcbiAgfTtcblxuICB0aGlzLmNrYW4gPSBuZXcgQ0tBTih7XG4gICAgaG9zdCA6IGNvbmZpZy5ob3N0LFxuICAgIGtleSA6IGNvbmZpZy5rZXlcbiAgfSk7XG5cbiAgdGhpcy5kcyA9IG5ldyBEYXRhc3RvcmUoe1xuICAgIGNrYW4gOiB0aGlzLmNrYW4sXG4gICAgcGFja2FnZV9pZCA6IGNvbmZpZy5wYWNrYWdlX2lkLFxuICAgIFNESyA6IHRoaXNcbiAgfSk7XG5cbiAgLy8gd2lyZSBldmVudHNcbiAgdmFyIGVlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICB0aGlzLm9uID0gZnVuY3Rpb24oZSwgZm4pIHtcbiAgICAgICBlZS5vbihlLCBmbik7XG4gIH07XG5cblxuICAvLyBnZXQgdGhlIHVzZXIgYWNjb3VudFxuICB0aGlzLmNrYW4uZ2V0QWN0aXZlVXNlcihmdW5jdGlvbihyZXNwKXtcbiAgICBpZiggcmVzcC5lcnJvciApIHtcbiAgICAgIHRoaXMudXNlckxvYWRFcnJvciA9IHRydWU7XG4gICAgfVxuXG5cbiAgICB0aGlzLnVzZXIgPSByZXNwO1xuICAgIGVlLmVtaXQoJ3VzZXItbG9hZCcpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHJlcXVpcmUoJy4vbG9naWMnKSh0aGlzKTtcblxuICBpZiggY29uZmlnLnBhY2thZ2VfaWQgKSB0aGlzLmRzLmxvYWQoKTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU0RLO1xuIiwidmFyIFNESztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZGspIHtcbiAgU0RLID0gc2RrO1xuICBTREsuY3JlYXRlUGFja2FnZSA9IGNyZWF0ZVBhY2thZ2U7XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVQYWNrYWdlKGRhdGEsIGNhbGxiYWNrKSB7XG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU0RLKSB7XG4gIHJlcXVpcmUoJy4vY3JlYXRlUGFja2FnZScpKFNESyk7XG4gIHJlcXVpcmUoJy4vdmVyaWZ5JykoU0RLKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFNESykge1xuICBTREsudmVyaWZ5ID0ge1xuICAgIG5hbWUgOiByZXF1aXJlKCcuL25hbWUnKShTREspXG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihTREspIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrKSB7XG5cbiAgICBTREsuY2thbi5nZXRQYWNrYWdlKG5hbWUsIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2soZmFsc2UpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG59O1xuIiwiLy8gYXR0cmlidXRlcyB0aGF0IGhhdmUgYSBkaXJlY3QgbWFwcGluZyB0byBDS0FOIHN0YW5kYXJkIGF0dHJpYnV0ZXMsXG4vLyBzbyB0aGV5IHNob3VsZCBub3QgYmUgd3JhcHBlZCB1cCBpbiB0aGUgJ2V4dHJhcycgZmllbGRzLiAgSUUsIHVzZVxuLy8gdGhlc2UgZnVuY3Rpb25zLlxudmFyIGNrYW5BdHRyaXV0ZXMgPSBbJ0tleXdvcmRzJywgJ1dlYnNpdGUnLCAnQXV0aG9yJywgJ0F1dGhvciBFbWFpbCcsXG4nTWFpbnRhaW5lciBFbWFpbCcsICdNYWludGFpbmVyJ107XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXR0cmlidXRlLCBQYWNrYWdlKSB7XG4gIGlmKCBhdHRyaWJ1dGUubmFtZSA9PT0gJ0tleXdvcmRzJyB8fCBhdHRyaWJ1dGUubmFtZSA9PT0gJ1dlYnNpdGUnICkgcmV0dXJuO1xuXG4gIGlmKCBhdHRyaWJ1dGUuaW5wdXQgPT09ICdjb250cm9sbGVkJyApIHtcbiAgICBjcmVhdGVDb250cm9sbGVkSW5wdXQoYXR0cmlidXRlLCBQYWNrYWdlKTtcbiAgfSBlbHNlIGlmKCBhdHRyaWJ1dGUuaW5wdXQgPT09ICdzcGxpdC10ZXh0JyApIHtcbiAgICBjcmVhdGVDb250cm9sbGVkSW5wdXQoYXR0cmlidXRlLCBQYWNrYWdlKTtcbiAgfSBlbHNlIGlmKCBhdHRyaWJ1dGUuaW5wdXQgPT09ICdjb250cm9sbGVkLXNpbmdsZScgKSB7XG4gICAgY3JlYXRlU2luZ2xlSW5wdXQoYXR0cmlidXRlLCBQYWNrYWdlKTtcbiAgfSBlbHNlIGlmKCBhdHRyaWJ1dGUuaW5wdXQgPT09ICd0ZXh0JyB8fCBhdHRyaWJ1dGUuaW5wdXQgPT09ICdsYXRsbmcnICkge1xuICAgIGNyZWF0ZUlucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUlucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSkge1xuICB2YXIgbmFtZSA9IGF0dHJpYnV0ZS5uYW1lLnJlcGxhY2UoLyAvZywgJycpO1xuXG4gIFBhY2thZ2UucHJvdG90eXBlWydnZXQnK25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RXh0cmEoYXR0cmlidXRlLm5hbWUpO1xuICB9O1xuXG4gIFBhY2thZ2UucHJvdG90eXBlWydzZXQnK25hbWVdID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lLCB2YWx1ZSsnJyk7XG4gICAgdGhpcy5fb25VcGRhdGUoYXR0cmlidXRlLm5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTaW5nbGVJbnB1dChhdHRyaWJ1dGUsIFBhY2thZ2UpIHtcbiAgdmFyIG5hbWUgPSBhdHRyaWJ1dGUubmFtZS5yZXBsYWNlKC8gL2csICcnKTtcblxuICBQYWNrYWdlLnByb3RvdHlwZVsnZ2V0JytuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKTtcbiAgfTtcblxuICBQYWNrYWdlLnByb3RvdHlwZVsnc2V0JytuYW1lXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHQgPSB0b2tlbml6ZSh2YWx1ZSk7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGF0dHJpYnV0ZS52b2NhYnVsYXJ5Lmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRva2VuaXplKGF0dHJpYnV0ZS52b2NhYnVsYXJ5W2ldKSA9PT0gdCApIHtcbiAgICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLnZvY2FidWxhcnlbaV0pO1xuICAgICAgICB0aGlzLl9vblVwZGF0ZShhdHRyaWJ1dGUubmFtZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgKSB7XG4gICAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lLCAnT3RoZXInKTtcbiAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUrJyBPdGhlcicsIHZhbHVlKTtcbiAgICAgIHRoaXMuX29uVXBkYXRlKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgJycpO1xuICAgIH1cbiAgfTtcblxuICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgKSB7XG4gICAgUGFja2FnZS5wcm90b3R5cGVbJ2dldCcrbmFtZSsnT3RoZXInXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RXh0cmEoYXR0cmlidXRlLm5hbWUrJyBPdGhlcicpO1xuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlZElucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSkge1xuICB2YXIgbmFtZSA9IGF0dHJpYnV0ZS5uYW1lLnJlcGxhY2UoLyAvZywgJycpO1xuXG4gIFBhY2thZ2UucHJvdG90eXBlWydnZXQnK25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF0dHIgPSB0aGlzLmdldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICBpZiggIWF0dHIgKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGF0dHIuc3BsaXQoJywnKS5tYXAoY2xlYW5UZXJtKTtcbiAgfTtcblxuICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgKSB7XG4gICAgUGFja2FnZS5wcm90b3R5cGVbJ2dldCcrbmFtZSsnT3RoZXInXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGF0dHIgPSB0aGlzLmdldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKycgT3RoZXInKTtcbiAgICAgIGlmKCAhYXR0ciApIHJldHVybiBbXTtcbiAgICAgIHJldHVybiBhdHRyLnNwbGl0KCcsJykubWFwKGNsZWFuVGVybSk7XG4gICAgfTtcbiAgfVxuXG4gIFBhY2thZ2UucHJvdG90eXBlWydzZXQnK25hbWVdID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiggIXZhbHVlICkge1xuICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgbnVsbCk7XG4gICAgICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgKSB7XG4gICAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUrJyBPdGhlcicsIG51bGwpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9vblVwZGF0ZShhdHRyaWJ1dGUubmFtZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRlcm1zO1xuICAgIGlmKCAhQXJyYXkuaXNBcnJheSh2YWx1ZSkgKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlKycnO1xuICAgICAgdGVybXMgPSB2YWx1ZS5zcGxpdCgnLCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZXJtcyA9IHZhbHVlO1xuICAgIH1cblxuICAgIHRlcm1zID0gdGVybXMubWFwKGNsZWFuVGVybSk7XG5cbiAgICBpZiggYXR0cmlidXRlLmlucHV0ID09PSAnY29udHJvbGxlZCcgKSB7XG4gICAgICB2YXIgdmFsdWVzID0gZ2V0VmFsdWVzKHRlcm1zLCBhdHRyaWJ1dGUudm9jYWJ1bGFyeSk7XG5cbiAgICAgIGlmKCBhdHRyaWJ1dGUuYWxsb3dPdGhlciAmJiB2YWx1ZXMub3RoZXIubGVuZ3RoID4gMCAmJiB2YWx1ZXMudmFsaWQuaW5kZXhPZignT3RoZXInKSA9PSAtMSApIHtcbiAgICAgICAgdmFsdWVzLnZhbGlkLnB1c2goJ090aGVyJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsIHZhbHVlcy52YWxpZC5qb2luKCcsICcpKTtcbiAgICAgIGlmKCBhdHRyaWJ1dGUuYWxsb3dPdGhlciApIHtcbiAgICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSsnIE90aGVyJywgdmFsdWVzLm90aGVyLmpvaW4oJywgJykpO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIGlmKCBhdHRyaWJ1dGUuaW5wdXQgPT09ICdzcGxpdC10ZXh0JyApIHtcbiAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsIHRlcm1zLmpvaW4oJywgJykpO1xuICAgIH1cblxuICAgIHRoaXMuX29uVXBkYXRlKGF0dHJpYnV0ZS5uYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xlYW5UZXJtKHR4dCkge1xuICByZXR1cm4gdHh0LnRyaW0oKTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVzKHRlcm1zLCB2b2NhYnVsYXJ5KSB7XG4gIHZhciB2YWxpZCA9IFtdO1xuICB2YXIgb3RoZXIgPSBbXTtcblxuICB2YXIgbWFwID0ge307XG4gIHZvY2FidWxhcnkuZm9yRWFjaChmdW5jdGlvbihuYW1lKXtcbiAgICBtYXBbdG9rZW5pemUobmFtZSldID0gbmFtZTtcbiAgfSk7XG5cbiAgdmFyIHQ7XG4gIGZvciggdmFyIGkgPSAwOyBpIDwgdGVybXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdCA9IHRva2VuaXplKHRlcm1zW2ldKTtcblxuICAgIGlmKCBtYXBbdF0gKSB7XG4gICAgICBpZiggdmFsaWQuaW5kZXhPZihtYXBbdF0pID09PSAtMSApIHtcbiAgICAgICAgdmFsaWQucHVzaChtYXBbdF0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggb3RoZXIuaW5kZXhPZihtYXBbdF0pID09PSAtMSApIHtcbiAgICAgICAgb3RoZXIucHVzaCh0ZXJtc1tpXS50cmltKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdmFsaWQgOiB2YWxpZCxcbiAgICBvdGhlciA6IG90aGVyXG4gIH07XG59XG5cbmZ1bmN0aW9uIHRva2VuaXplKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMvZywgJycpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQYWNrYWdlKXtcbiAgUGFja2FnZS5wcm90b3R5cGUuY3JlYXRlID0gY3JlYXRlO1xuICBQYWNrYWdlLnByb3RvdHlwZS5kZWxldGUgPSBkZWxldGVGbjtcbiAgUGFja2FnZS5wcm90b3R5cGUuc2F2ZSA9IHNhdmU7XG59O1xuXG5cbmZ1bmN0aW9uIGRlbGV0ZUZuKGNhbGxiYWNrKSB7XG4gIHRoaXMuU0RLLmNrYW4uZGVsZXRlUGFja2FnZSh0aGlzLmRhdGEuaWQsIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICBpZiggcmVzcC5lcnJvciApIHtcbiAgICAgIC8vIEVSUk9SIDVcbiAgICAgIHJlc3AuY29kZSA9IDU7XG4gICAgICByZXR1cm4gY2FsbGJhY2socmVzcCk7XG4gICAgfVxuXG4gICAgY2FsbGJhY2soe3N1Y2Nlc3M6IHRydWV9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZShjYWxsYmFjaykge1xuICB0aGlzLlNESy5ja2FuLmNyZWF0ZVBhY2thZ2UodGhpcy5kYXRhLCBmdW5jdGlvbihyZXNwKSB7XG4gICAgICBpZiggcmVzcC5lcnJvciApIHtcbiAgICAgICAgLy8gRVJST1IgNlxuICAgICAgICByZXNwLmNvZGUgPSA2O1xuICAgICAgICByZXR1cm4gY2FsbGJhY2socmVzcCk7XG4gICAgICB9XG5cbiAgICAgIGlmKCAhcmVzcC5pZCApIHtcbiAgICAgICAgLy8gRVJST1IgN1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soe1xuICAgICAgICAgIGVycm9yIDogdHJ1ZSxcbiAgICAgICAgICBtZXNzYWdlIDogJ0ZhaWxlZCB0byBjcmVhdGUgZGF0YXNldCcsXG4gICAgICAgICAgY29kZSA6IDdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKHJlc3ApO1xuICAgIH0uYmluZCh0aGlzKVxuICApO1xufVxuXG52YXIgc2F2ZVRpbWVyID0gLTE7XG5mdW5jdGlvbiBzYXZlKGNhbGxiYWNrKSB7XG4gIHRoaXMuZWUuZW1pdCgnc2F2ZS1zdGFydCcpO1xuXG4gIGlmKCBzYXZlVGltZXIgIT09IC0xICkge1xuICAgIGNsZWFyVGltZW91dChzYXZlVGltZXIpO1xuICB9XG5cbiAgc2F2ZVRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgIHNhdmVUaW1lciA9IC0xO1xuICAgIF9zYXZlKHRoaXMsIGNhbGxiYWNrKTtcbiAgfS5iaW5kKHRoaXMpLCA1MDApO1xufVxuXG5mdW5jdGlvbiBfc2F2ZShyZWYsIGNhbGxiYWNrKSB7XG4gIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIHRoZSBjb3JyZWN0IHBhY2thZ2Ugc3RhdGVcbiAgLy8gYWxsIHJlc291cmNlcyBuZWVkIHRvIGJlIGluY2x1ZGVkIHdoZW4geW91IG1ha2UgYSB1cGRhdGVQYWNrYWdlIGNhbGxcbiAgcmVmLlNESy5ja2FuLmdldFBhY2thZ2UocmVmLmRhdGEuaWQsIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICByZXNwLmNvZGUgPSA4O1xuICAgICAgICByZXNwLm1lc3NhZ2UgKz0gJy4gRmFpbGVkIHRvIGZldGNoIHBhY2thZ2UgZm9yIHVwZGF0ZS4nO1xuICAgICAgICByZWYuZWUuZW1pdCgnc2F2ZS1lbmQnLCByZXNwKTtcbiAgICAgICAgaWYoIGNhbGxiYWNrICkgY2FsbGJhY2socmVzcCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIG1ldGFkYXRhID0gcmVzcDtcbiAgICAgIGZvciggdmFyIGtleSBpbiByZWYuZGF0YSApIHtcbiAgICAgICAgbWV0YWRhdGFba2V5XSA9IHJlZi5kYXRhW2tleV07XG4gICAgICB9XG5cbiAgICAgIHJlZi5TREsuY2thbi51cGRhdGVQYWNrYWdlKG1ldGFkYXRhLFxuICAgICAgICBmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgICAgICAvLyBFUlJPUiA5XG4gICAgICAgICAgICByZXNwLmNvZGUgPSA5O1xuICAgICAgICAgICAgcmVzcC5tZXNzYWdlICs9ICcuIEZhaWxlZCB0byB1cGRhdGUgZGF0YXNldC4nO1xuICAgICAgICAgICAgcmVmLmVlLmVtaXQoJ3NhdmUtZW5kJywgcmVzcCk7XG4gICAgICAgICAgICBpZiggY2FsbGJhY2sgKSBjYWxsYmFjayhyZXNwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiggIXJlc3AuaWQgKSAge1xuICAgICAgICAgICAgdmFyIG1zZyA9IHtcbiAgICAgICAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgICAgICAgIG1lc3NhZ2UgOiAnRmFpbGVkIHRvIHVwZGF0ZSBkYXRhc2V0JyxcbiAgICAgICAgICAgICAgY29kZSA6IDEwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVmLmVlLmVtaXQoJ3NhdmUtZW5kJywgbXNnKTtcbiAgICAgICAgICAgIC8vIEVSUk9SIDEwXG4gICAgICAgICAgICBpZiggY2FsbGJhY2sgKSBjYWxsYmFjayhtc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlZi5kYXRhID0gcmVzcDtcblxuICAgICAgICAgIGlmKCBjYWxsYmFjayApIGNhbGxiYWNrKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgICAgcmVmLmVlLmVtaXQoJ3NhdmUtZW5kJywge3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gICk7XG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgnZXh0ZW5kJyk7XG52YXIgc2NoZW1hID0gcmVxdWlyZSgnLi4vc2NoZW1hJyk7XG52YXIgY3JlYXRlU2NoZW1hTWV0aG9kcyA9IHJlcXVpcmUoJy4vY3JlYXRlU2NoZW1hTWV0aG9kcycpO1xudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZScpO1xudmFyIGNydWQgPSByZXF1aXJlKCcuL2NydWQnKTtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlcjtcblxuXG52YXIgaWdub3JlID0gWydTcGVjaWVzJywgJ0RhdGUnXTtcblxuZnVuY3Rpb24gUGFja2FnZShpbml0ZGF0YSwgU0RLKSB7XG5cbiAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiggZGF0YSApIHtcbiAgICAgIHRoaXMuZGF0YSA9IGV4dGVuZCh0cnVlLCB7fSwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGF0YSA9IHtcbiAgICAgICAgaWQgOiAnJyxcbiAgICAgICAgdGl0bGUgOiAnJyxcbiAgICAgICAgbmFtZSA6ICcnLFxuICAgICAgICBub3RlcyA6ICcnLFxuICAgICAgICBhdXRob3IgOiAnJyxcbiAgICAgICAgYXV0aG9yX2VtYWlsIDogJycsXG4gICAgICAgIGxpY2Vuc2VfaWQgOiAnJyxcbiAgICAgICAgbGljZW5zZV90aXRsZSA6ICcnLFxuICAgICAgICBtYWludGFpbmVyIDogJycsXG4gICAgICAgIG1haW50YWluZXJfZW1haWwgOiAnJyxcbiAgICAgICAgdmVyc2lvbiA6ICcnLFxuICAgICAgICBvd25lcl9vcmcgOiAnJyxcbiAgICAgICAgdGFncyA6IFtdLFxuICAgICAgICBwcml2YXRlIDogZmFsc2UsXG4gICAgICAgIGV4dHJhcyA6IFtdXG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICB0aGlzLnJlc2V0KGluaXRkYXRhKTtcblxuICB0aGlzLmVlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGlmKCAhU0RLICkge1xuICAgIHRocm93KG5ldyBFcnJvcignTm8gU0RLIHByb3ZpZGVkJykpO1xuICB9XG4gIHRoaXMuU0RLID0gU0RLO1xuXG4gIHRoaXMub24gPSBmdW5jdGlvbihldmVudCwgZm4pIHtcbiAgICB0aGlzLmVlLm9uKGV2ZW50LCBmbik7XG4gIH07XG5cbiAgdGhpcy5fb25VcGRhdGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdGhpcy5lZS5lbWl0KCd1cGRhdGUnLCB7YXR0cmlidXRlOiBuYW1lfSk7XG5cbiAgICBpZiggdGhpcy5tb2RlICE9PSAnY3JlYXRlJyApIHtcbiAgICAgIHRoaXMuc2F2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVlLmVtaXQoJ3ZhbHVlLXNldC1vbi1jcmVhdGUnLCB7fSk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuZ2V0SWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmlkIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0VGl0bGUgPSBmdW5jdGlvbih0aXRsZSwgY2FsbGJhY2spIHtcbiAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL18vZywgJyAnKS50cmltKCk7XG5cbiAgICBpZiggdGl0bGUubGVuZ3RoID49IDEwMCApIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6IHRydWUsIG1lc3NhZ2U6ICdJbnZhbGlkIG5hbWUuICBUaXRsZSBjYW4gaGF2ZSBhdCBtb3N0IDEwMCBjaGFyYWN0ZXJzLid9KTtcbiAgICB9XG5cbiAgICBpZiggdGl0bGUubGVuZ3RoIDw9IDUgKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soe2Vycm9yOiB0cnVlLCBtZXNzYWdlOiAnSW52YWxpZCBuYW1lLiAgVGl0bGUgbXVzdCBoYXZlIGF0IGxlYXN0IDUgY2hhcmFjdGVycy4nfSk7XG4gICAgfVxuXG4gICAgdmFyIG5hbWUgPSB0aXRsZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teYS16MC05XS9nLCctJyk7XG5cbiAgICBpZiggdGhpcy5kYXRhLm5hbWUgPT09IG5hbWUgKSB7XG4gICAgICB0aGlzLmRhdGEudGl0bGUgPSB0aXRsZTtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCB7dGl0bGU6IHRpdGxlLCBuYW1lOiBuYW1lfSk7XG4gICAgfVxuXG4gICAgU0RLLnZlcmlmeS5uYW1lKG5hbWUsIGZ1bmN0aW9uKHZhbGlkKSB7XG4gICAgICBpZiggIXZhbGlkICkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soe2Vycm9yOiB0cnVlLCBtZXNzYWdlOiAnSW52YWxpZCBuYW1lLiAgQSBkYXRhc2V0IHdpdGggdGhlIG5hbWUgXCInK25hbWUrJ1wiIGFscmVhZHkgZXhpc3RzJ30pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRhdGEudGl0bGUgPSB0aXRsZTtcbiAgICAgIHRoaXMuZGF0YS5uYW1lID0gbmFtZTtcbiAgICAgIHRoaXMuX29uVXBkYXRlKCdUaXRsZScpO1xuXG4gICAgICBjYWxsYmFjayhudWxsLCB7dGl0bGU6IHRpdGxlLCBuYW1lOiBuYW1lfSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICB0aGlzLmdldE5hbWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLm5hbWUgfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5nZXRUaXRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEudGl0bGUgfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5zZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5kYXRhLm5vdGVzID0gZGVzY3JpcHRpb247XG4gICAgdGhpcy5fb25VcGRhdGUoJ0Rlc2NyaXB0aW9uJyk7XG4gIH07XG5cbiAgdGhpcy5nZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEubm90ZXMgfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5nZXRLZXl3b3JkcyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS50YWdzIHx8IFtdO1xuICB9O1xuXG4gIHRoaXMuc2V0S2V5d29yZHMgPSBmdW5jdGlvbihrZXl3b3Jkcykge1xuICAgIGlmKCB0eXBlb2Yga2V5d29yZHMgPT09ICdzdHJpbmcnICkge1xuICAgICAga2V5d29yZHMgPSBrZXl3b3Jkcy5zcGxpdCgnLCcpO1xuICAgIH1cblxuICAgIGlmKCAhQXJyYXkuaXNBcnJheShrZXl3b3JkcykgKSB7XG4gICAgICB0aHJvdyhuZXcgRXJyb3IoJ0tleXdvcmRzIG11c3QgYnkgb2YgdHlwZSBzdHJpbmcgb3IgYXJyYXknKSk7XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhLnRhZ3MgPSBbXTtcbiAgICBrZXl3b3Jkcy5mb3JFYWNoKHRoaXMuYWRkS2V5d29yZC5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICB0aGlzLmFkZEtleXdvcmQgPSBmdW5jdGlvbihrZXl3b3JkKSB7XG4gICAgaWYoIHR5cGVvZiBrZXl3b3JkID09PSAnb2JqZWN0JyApIHtcbiAgICAgIGtleXdvcmQgPSBrZXl3b3JkLm5hbWU7XG5cbiAgICB9XG5cbiAgICBrZXl3b3JkID0gY2xlYW5LZXl3b3JkKGtleXdvcmQrJycpO1xuXG4gICAgaWYoIGtleXdvcmQubGVuZ3RoIDwgMiApIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYoIHRoaXMuaGFzS2V5d29yZChrZXl3b3JkKSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiggIXRoaXMuZGF0YS50YWdzICkge1xuICAgICAgdGhpcy5kYXRhLnRhZ3MgPSBbXTtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGEudGFncy5wdXNoKHtcbiAgICAgIGRpc3BsYXlfbmFtZSA6IGtleXdvcmQsXG4gICAgICBuYW1lIDoga2V5d29yZFxuICAgIH0pO1xuXG4gICAgdGhpcy5fb25VcGRhdGUoJ0tleXdvcmRzJyk7XG4gIH07XG5cbiAgdGhpcy5yZW1vdmVLZXl3b3JkID0gZnVuY3Rpb24oa2V5d29yZCkge1xuICAgIGlmKCAhdGhpcy5kYXRhLnRhZ3MgKSByZXR1cm47XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS50YWdzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YS50YWdzW2ldLm5hbWUgPT09IGtleXdvcmQgKSB7XG4gICAgICAgIHRoaXMuZGF0YS50YWdzLnNwbGljZShpLCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fb25VcGRhdGUoJ0tleXdvcmRzJyk7XG4gIH07XG5cbiAgdGhpcy5oYXNLZXl3b3JkID0gZnVuY3Rpb24oa2V5d29yZCkge1xuICAgIGlmKCAhdGhpcy5kYXRhLnRhZ3MgKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEudGFncy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmRhdGEudGFnc1tpXS5uYW1lID09PSBrZXl3b3JkICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gY2xlYW5LZXl3b3JkKHR4dCkge1xuICAgIHJldHVybiB0eHQucmVwbGFjZSgvW15BLVphLXowLTktXyBdL2csICcnKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgfVxuXG4gIHRoaXMuc2V0TGljZW5zZSA9IGZ1bmN0aW9uKGlkLCB0aXRsZSkge1xuICAgIHRoaXMuZGF0YS5saWNlbnNlX2lkID0gaWQ7XG4gICAgdGhpcy5kYXRhLmxpY2Vuc2VfdGl0bGUgPSB0aXRsZTtcbiAgICB0aGlzLl9vblVwZGF0ZSgnTGljZW5zZScpO1xuICB9O1xuXG4gIHRoaXMuZ2V0TGljZW5zZUlkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5saWNlbnNlX2lkIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuZ2V0TGljZW5zZVRpdGxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5saWNlbnNlX3RpdGxlIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0T3JnYW5pemF0aW9uID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKSB7XG4gICAgaWYoICFpZCApIHtcbiAgICAgIHRoaXMuZGF0YS5vd25lcl9vcmcgPSAnJztcbiAgICAgIGlmKCBjYWxsYmFjayApIHtcbiAgICAgICAgY2FsbGJhY2soe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBTREsuY2thbi5nZXRPcmdhbml6YXRpb24oaWQsIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgIGlmKCBjYWxsYmFjayApIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZGF0YS5vd25lcl9vcmcgPSByZXNwLmlkO1xuICAgICAgdGhpcy5fb25VcGRhdGUoJ09yZ2FuaXphdGlvbicpO1xuXG4gICAgICBpZiggY2FsbGJhY2sgKSB7XG4gICAgICAgIGNhbGxiYWNrKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICB0aGlzLmdldE9yZ2FuaXphdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEub3duZXJfb3JnIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0VmVyc2lvbiA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgICB0aGlzLmRhdGEudmVyc2lvbiA9IHZlcnNpb247XG4gICAgdGhpcy5fb25VcGRhdGUoJ1ZlcnNpb24nKTtcbiAgfTtcblxuICB0aGlzLmdldFZlcnNpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnZlcnNpb24gfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5zZXRXZWJzaXRlID0gZnVuY3Rpb24od2Vic2l0ZSkge1xuICAgIHRoaXMuc2V0RXh0cmEoJ1dlYnNpdGUnLCB3ZWJzaXRlKTtcbiAgICB0aGlzLl9vblVwZGF0ZSgnV2Vic2l0ZScpO1xuICB9O1xuXG4gIHRoaXMuZ2V0V2Vic2l0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEV4dHJhKCdXZWJzaXRlJyk7XG4gIH07XG5cbiAgdGhpcy5zZXRBdXRob3IgPSBmdW5jdGlvbihhdXRob3IpIHtcbiAgICB0aGlzLmRhdGEuYXV0aG9yID0gYXV0aG9yO1xuICAgIHRoaXMuX29uVXBkYXRlKCdBdXRob3InKTtcbiAgfTtcblxuICB0aGlzLmdldEF1dGhvciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEuYXV0aG9yIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0QXV0aG9yRW1haWwgPSBmdW5jdGlvbihhdXRob3JfZW1haWwpIHtcbiAgICB0aGlzLmRhdGEuYXV0aG9yX2VtYWlsID0gYXV0aG9yX2VtYWlsO1xuICAgIHRoaXMuX29uVXBkYXRlKCdBdXRob3JFbWFpbCcpO1xuICB9O1xuXG4gIHRoaXMuZ2V0QXV0aG9yRW1haWwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmF1dGhvcl9lbWFpbCB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldE1haW50YWluZXIgPSBmdW5jdGlvbihtYWludGFpbmVyKSB7XG4gICAgdGhpcy5kYXRhLm1haW50YWluZXIgPSBtYWludGFpbmVyO1xuICAgIHRoaXMuX29uVXBkYXRlKCdNYWludGFpbmVyJyk7XG4gIH07XG5cbiAgdGhpcy5nZXRNYWludGFpbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5tYWludGFpbmVyIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0TWFpbnRhaW5lckVtYWlsID0gZnVuY3Rpb24obWFpbnRhaW5lcl9lbWFpbCkge1xuICAgIHRoaXMuZGF0YS5tYWludGFpbmVyX2VtYWlsID0gbWFpbnRhaW5lcl9lbWFpbDtcbiAgICB0aGlzLl9vblVwZGF0ZSgnTWFpbnRhaW5lckVtYWlsJyk7XG4gIH07XG5cbiAgdGhpcy5nZXRNYWludGFpbmVyRW1haWwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLm1haW50YWluZXJfZW1haWwgfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5zZXRQcml2YXRlID0gZnVuY3Rpb24ocHJpdmF0ZSkge1xuICAgIGlmKCB0aGlzLmRhdGEucHJpdmF0ZSA9PT0gcHJpdmF0ZSApIHJldHVybjtcbiAgICB0aGlzLmRhdGEucHJpdmF0ZSA9IHByaXZhdGU7XG4gICAgdGhpcy5fb25VcGRhdGUoJ1ByaXZhdGUnKTtcbiAgfTtcblxuICB0aGlzLmlzUHJpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEucHJpdmF0ZSA/IHRydWUgOiBmYWxzZTtcbiAgfTtcblxuICB0aGlzLnNldExpbmtlZERhdGEgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIG5ld0RhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB2YXIgb2xkRGF0YSA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0TGlua2VkRGF0YSgpKTtcblxuICAgIGlmKCBuZXdEYXRhID09PSBvbGREYXRhICkgcmV0dXJuO1xuXG4gICAgdGhpcy5zZXRFeHRyYSgnTGlua2VkRGF0YScsIG5ld0RhdGEpO1xuXG4gICAgdGhpcy5lZS5lbWl0KCd1cGRhdGUnLCB7YXR0cmlidXRlOiBuYW1lfSk7XG5cbiAgICBpZiggdGhpcy5tb2RlICE9PSAnY3JlYXRlJyApIHtcbiAgICAgIHRoaXMuU0RLLmNrYW4udXBkYXRlTGlua2VkUmVzb3VyY2VzKHRoaXMuZGF0YS5pZCwgZGF0YSwgZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVlLmVtaXQoJ3ZhbHVlLXNldC1vbi1jcmVhdGUnLCB7fSk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuZ2V0TGlua2VkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0RXh0cmEoJ0xpbmtlZERhdGEnKTtcbiAgICBpZiggIXZhbHVlICkgcmV0dXJuIFtdO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4gW107XG4gIH07XG5cbiAgdGhpcy5yZXF1ZXN0RG9pID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvaSA9IHRoaXMuZ2V0RG9pKCk7XG5cbiAgICBpZiggZG9pLnN0YXR1cy52YWx1ZSAhPT0gJ1BlbmRpbmcgUmV2aXNpb24nICYmIGRvaS5zdGF0dXMudmFsdWUgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRFeHRyYSgnRWNvU0lTIERPSSBTdGF0dXMnLCBKU09OLnN0cmluZ2lmeSh7dmFsdWU6J1BlbmRpbmcgQXBwcm92YWwnfSkpO1xuICAgIHRoaXMuX29uVXBkYXRlKCdFY29TSVMgRE9JIFN0YXR1cycpO1xuICAgIFxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICBcbiAgdGhpcy5jYW5jZWxEb2lSZXF1ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvaSA9IHRoaXMuZ2V0RG9pKCk7XG5cbiAgICBpZiggZG9pLnN0YXR1cy52YWx1ZSAhPT0gJ1BlbmRpbmcgUmV2aXNpb24nICYmIGRvaS5zdGF0dXMudmFsdWUgIT09ICdQZW5kaW5nIEFwcHJvdmFsJyApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnNldEV4dHJhKCdFY29TSVMgRE9JIFN0YXR1cycsIEpTT04uc3RyaW5naWZ5KHt9KSk7XG4gICAgdGhpcy5fb25VcGRhdGUoJ0Vjb1NJUyBET0kgU3RhdHVzJyk7XG4gICAgXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgdGhpcy5nZXREb2kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhdHVzID0gdGhpcy5nZXRFeHRyYSgnRWNvU0lTIERPSSBTdGF0dXMnKTtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldEV4dHJhKCdFY29TSVMgRE9JJyk7XG4gICAgXG4gICAgaWYoIHN0YXR1cyAmJiBzdGF0dXMubGVuZ3RoID4gMCApIHtcbiAgICAgIHN0YXR1cyA9IEpTT04ucGFyc2Uoc3RhdHVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdHVzID0ge307XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1cyA6IHN0YXR1cyxcbiAgICAgIHZhbHVlIDogdmFsdWVcbiAgICB9O1xuICB9O1xuXG4gIHRoaXMuc2V0U29ydCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLnNldEV4dHJhKCdzb3J0JywgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIHRoaXMuX29uVXBkYXRlKCdzb3J0Jyk7XG4gIH07XG5cbiAgdGhpcy5nZXRTb3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5nZXRFeHRyYSgnc29ydCcpO1xuICAgIGlmKCAhdmFsdWUgKSByZXR1cm4gW107XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xuICAgIH0gY2F0Y2goZSkge31cblxuICAgIHJldHVybiB7fTtcbiAgfTtcblxuICB0aGlzLnNldEFsaWFzZXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zZXRFeHRyYSgnYWxpYXNlcycsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB0aGlzLl9vblVwZGF0ZSgnYWxpYXNlcycpO1xuICB9O1xuXG4gIHRoaXMuZ2V0QWxpYXNlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0RXh0cmEoJ2FsaWFzZXMnKTtcbiAgICBpZiggIXZhbHVlICkgcmV0dXJuIHt9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciB0ID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAvLyBoYWNrXG4gICAgICBpZiggQXJyYXkuaXNBcnJheSh0KSApIHJldHVybiB7fTtcbiAgICAgIHJldHVybiB0O1xuICAgIH0gY2F0Y2goZSkge31cblxuICAgIHJldHVybiB7fTtcbiAgfTtcblxuICB0aGlzLnNldEdlb0pzb24gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYoICFkYXRhICkge1xuICAgICAgdGhpcy5zZXRFeHRyYSgnZ2VvanNvbicsICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRFeHRyYSgnZ2VvanNvbicsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vblVwZGF0ZSgnZ2VvanNvbicpO1xuICB9O1xuXG4gIHRoaXMuZ2V0R2VvSnNvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0RXh0cmEoJ2dlb2pzb24nKTtcbiAgICBpZiggIXZhbHVlICkgcmV0dXJuIHt9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4ge307XG4gIH07XG5cbiAgdGhpcy5hZGRSZXNvdXJjZSA9IGZ1bmN0aW9uKGZpbGUsIGNhbGxiYWNrLCBwcm9ncmVzcykge1xuICAgIGZ1bmN0aW9uIG5leHQocmVzcCkge1xuICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcik7XG4gICAgICB9XG5cbiAgICAgIFNESy5ja2FuLnByb2Nlc3NSZXNvdXJjZShcbiAgICAgICAgdGhpcy5kYXRhLmlkLFxuICAgICAgICBbcmVzcC5pZF0sXG4gICAgICAgIG51bGwsXG4gICAgICAgIHtsYXlvdXQ6ICdjb2x1bW4nfSxcbiAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2socmVzcCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gZ2V0IG5ldyB3b3Jrc3BhY2Ugc3RhdGVcbiAgICAgICAgICAvLyBUT0RPOiBwcm9seSBhIGJldHRlciB3YXkgVE9ETyB0aGlzLlxuICAgICAgICAgIFNESy5ja2FuLmdldFdvcmtzcGFjZSh0aGlzLmRhdGEuaWQsIGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgICAgICBpZiggcmVzdWx0LmVycm9yICkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2socmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFNESy5kcy5ydW5BZnRlclJlc291cmNlQWRkKHJlc3VsdCk7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBTREsuY2thbi5hZGRSZXNvdXJjZSh0aGlzLmRhdGEuaWQsIGZpbGUsIG5leHQuYmluZCh0aGlzKSwgcHJvZ3Jlc3MpO1xuICB9O1xuXG4gIHRoaXMuZ2V0RXh0cmEgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiggIXRoaXMuZGF0YS5leHRyYXMgKSByZXR1cm4gJyc7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5leHRyYXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5kYXRhLmV4dHJhc1tpXS5rZXkgPT09IGtleSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5leHRyYXNbaV0udmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0RXh0cmEgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgaWYoICF0aGlzLmRhdGEuZXh0cmFzICkgdGhpcy5kYXRhLmV4dHJhcyA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEuZXh0cmFzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YS5leHRyYXNbaV0ua2V5ID09IGtleSApIHtcbiAgICAgICAgaWYoIHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIHRoaXMuZGF0YS5leHRyYXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZGF0YS5leHRyYXNbaV0udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YS5leHRyYXMucHVzaCh7XG4gICAgICBrZXkgOiBrZXksXG4gICAgICB2YWx1ZSA6IHZhbHVlXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gU2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgdGVzdCBkYXRhISFcbiAgdGhpcy5fc2V0VGVzdGluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0RXh0cmEoJ190ZXN0aW5nXycsIHRydWUpO1xuICB9O1xuXG59XG5cbi8vIGV4dGVuZCBwYWNrYWdlIGdldHRlcnMvc2V0dGVycyBiYXNlZCBvbiBzY2hlbWFcbmZvciggdmFyIGtleSBpbiBzY2hlbWEgKSB7XG4gIGlmKCBpZ25vcmUuaW5kZXhPZihrZXkpID4gLTEgKSB7XG4gICAgY29udGludWU7XG4gIH1cblxuICBmb3IoIHZhciBpID0gMDsgaSA8IHNjaGVtYVtrZXldLmxlbmd0aDsgaSsrICl7XG4gICAgY3JlYXRlU2NoZW1hTWV0aG9kcyhzY2hlbWFba2V5XVtpXSwgUGFja2FnZSk7XG4gIH1cbn1cblxudGVtcGxhdGUoUGFja2FnZSk7XG5jcnVkKFBhY2thZ2UpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFja2FnZTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQYWNrYWdlKSB7XG4gIFBhY2thZ2UucHJvdG90eXBlLmxvYWRGcm9tVGVtcGxhdGUgPSBsb2FkRnJvbVRlbXBsYXRlO1xufTtcblxuLy8gbG9hZCBmcm9tIHNlcnZlciBwcm92aWRlZCB0ZW1wbGF0ZVxuZnVuY3Rpb24gbG9hZEZyb21UZW1wbGF0ZShja2FuUGFja2FnZSwgdXNlciwga2VlcERvaSkgIHtcbiAgZm9yKCB2YXIga2V5IGluIHRoaXMuZGF0YSApIHtcbiAgICBpZigga2V5ID09PSAnb3duZXJfb3JnJyB8fCBrZXkgPT09ICdpZCcgKSBjb250aW51ZTtcbiAgICBpZiggY2thblBhY2thZ2Vba2V5XSApIHRoaXMuZGF0YVtrZXldID0gY2thblBhY2thZ2Vba2V5XTtcbiAgfVxuXG4gIGlmKCB1c2VyICYmIHVzZXIub3JnYW5pemF0aW9ucyAmJiBja2FuUGFja2FnZS5vd25lcl9vcmcgKSB7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB1c2VyLm9yZ2FuaXphdGlvbnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdXNlci5vcmdhbml6YXRpb25zW2ldLmlkID09PSBja2FuUGFja2FnZS5vd25lcl9vcmcgKSB7XG4gICAgICAgIGRhdGEub3duZXJfb3JnID0gY2thblBhY2thZ2Uub3duZXJfb3JnO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiggY2thblBhY2thZ2UuZXh0cmFzICkge1xuICAgIGlmKCAha2VlcERvaSApIHtcbiAgICAgIGlmKCBja2FuUGFja2FnZS5leHRyYXNbJ0Vjb1NJUyBET0knXSApIHtcbiAgICAgICAgZGVsZXRlIGNrYW5QYWNrYWdlLmV4dHJhc1snRWNvU0lTIERPSSddXG4gICAgICB9XG4gICAgICBpZiggY2thblBhY2thZ2UuZXh0cmFzWydFY29TSVMgRE9JIFN0YXR1cyddICkge1xuICAgICAgICBkZWxldGUgY2thblBhY2thZ2UuZXh0cmFzWydFY29TSVMgRE9JIFN0YXR1cyddXG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGZvciggdmFyIGtleSBpbiBja2FuUGFja2FnZS5leHRyYXMgKSB7XG4gICAgICBhcnIucHVzaCh7XG4gICAgICAgIGtleSA6IGtleSxcbiAgICAgICAgdmFsdWUgOiBja2FuUGFja2FnZS5leHRyYXNba2V5XVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuZGF0YS5leHRyYXMgPSBhcnI7XG4gIH1cblxuICBpZiggY2thblBhY2thZ2UudGFncyApIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBja2FuUGFja2FnZS50YWdzLmxlbmd0aDsgaSsrICkge1xuICAgICAgYXJyLnB1c2goe1xuICAgICAgICBuYW1lIDogY2thblBhY2thZ2UudGFnc1tpXSxcbiAgICAgICAgZGlzcGxheV9uYW1lIDogY2thblBhY2thZ2UudGFnc1tpXVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuZGF0YS50YWdzID0gYXJyO1xuICB9XG5cbiAgaWYoIGNrYW5QYWNrYWdlLm1hcCApIHtcbiAgICB0aGlzLnNldEFsaWFzZXMoY2thblBhY2thZ2UubWFwKTtcbiAgfVxufVxuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgdGhpcy5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgey8qKi99XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICgodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgfHwgdGFyZ2V0ID09IG51bGwpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyZWR1Y2UnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdDtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgeyAvLyBCcm93c2VyIHdpbmRvd1xuICByb290ID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gV2ViIFdvcmtlclxuICByb290ID0gc2VsZjtcbn0gZWxzZSB7IC8vIE90aGVyIGVudmlyb25tZW50c1xuICByb290ID0gdGhpcztcbn1cblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbnJlcXVlc3QuZ2V0WEhSID0gZnVuY3Rpb24gKCkge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdFxuICAgICAgJiYgKCFyb290LmxvY2F0aW9uIHx8ICdmaWxlOicgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbFxuICAgICAgICAgIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAobnVsbCAhPSBvYmpba2V5XSkge1xuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgb2JqW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogSGVscHMgJ3NlcmlhbGl6ZScgd2l0aCBzZXJpYWxpemluZyBhcnJheXMuXG4gKiBNdXRhdGVzIHRoZSBwYWlycyBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYWlyc1xuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKi9cblxuZnVuY3Rpb24gcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdmFsKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICByZXR1cm4gdmFsLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdik7XG4gICAgfSk7XG4gIH1cbiAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHBhaXI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBhcnRzID0gcGFpci5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG1pbWVgIGlzIGpzb24gb3IgaGFzICtqc29uIHN0cnVjdHVyZWQgc3ludGF4IHN1ZmZpeC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWltZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSlNPTihtaW1lKSB7XG4gIHJldHVybiAvW1xcLytdanNvblxcYi8udGVzdChtaW1lKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPSAoKHRoaXMucmVxLm1ldGhvZCAhPSdIRUFEJyAmJiAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8IHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnKVxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSlcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2UgJiYgc3RyICYmIChzdHIubGVuZ3RoIHx8IHN0ciBpbnN0YW5jZW9mIE9iamVjdClcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgc3RhdHVzID0gMjA0O1xuICB9XG5cbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5zdGF0dXNDb2RlID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBFbWl0dGVyLmNhbGwodGhpcyk7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTtcbiAgdGhpcy5faGVhZGVyID0ge307XG4gIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGVyciA9IG51bGw7XG4gICAgdmFyIHJlcyA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGU7XG4gICAgICAvLyBpc3N1ZSAjNjc1OiByZXR1cm4gdGhlIHJhdyByZXNwb25zZSBpZiB0aGUgcmVzcG9uc2UgcGFyc2luZyBmYWlsc1xuICAgICAgZXJyLnJhd1Jlc3BvbnNlID0gc2VsZi54aHIgJiYgc2VsZi54aHIucmVzcG9uc2VUZXh0ID8gc2VsZi54aHIucmVzcG9uc2VUZXh0IDogbnVsbDtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICB2YXIgbmV3X2VyciA9IG5ldyBFcnJvcihyZXMuc3RhdHVzVGV4dCB8fCAnVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2UnKTtcbiAgICBuZXdfZXJyLm9yaWdpbmFsID0gZXJyO1xuICAgIG5ld19lcnIucmVzcG9uc2UgPSByZXM7XG4gICAgbmV3X2Vyci5zdGF0dXMgPSByZXMuc3RhdHVzO1xuXG4gICAgc2VsZi5jYWxsYmFjayhuZXdfZXJyLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEZvcmNlIGdpdmVuIHBhcnNlclxuICpcbiAqIFNldHMgdGhlIGJvZHkgcGFyc2VyIG5vIG1hdHRlciB0eXBlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZm4pe1xuICB0aGlzLl9wYXJzZXIgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSB8fCBmaWxlLm5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAgYXMgdGhlIHJlcXVlc3QgYm9keSwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9JylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaiB8fCBpc0hvc3QoZGF0YSkpIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICBmbihlcnIsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdSZXF1ZXN0IGhhcyBiZWVuIHRlcm1pbmF0ZWRcXG5Qb3NzaWJsZSBjYXVzZXM6IHRoZSBuZXR3b3JrIGlzIG9mZmxpbmUsIE9yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4sIHRoZSBwYWdlIGlzIGJlaW5nIHVubG9hZGVkLCBldGMuJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG5cbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gdGhpcy5tZXRob2Q7XG4gIGVyci51cmwgPSB0aGlzLnVybDtcblxuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSByZXF1ZXN0LmdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcblxuICAgIC8vIEluIElFOSwgcmVhZHMgdG8gYW55IHByb3BlcnR5IChlLmcuIHN0YXR1cykgb2ZmIG9mIGFuIGFib3J0ZWQgWEhSIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gdGhlIGVycm9yIFwiQ291bGQgbm90IGNvbXBsZXRlIHRoZSBvcGVyYXRpb24gZHVlIHRvIGVycm9yIGMwMGMwMjNmXCJcbiAgICB2YXIgc3RhdHVzO1xuICAgIHRyeSB7IHN0YXR1cyA9IHhoci5zdGF0dXMgfSBjYXRjaChlKSB7IHN0YXR1cyA9IDA7IH1cblxuICAgIGlmICgwID09IHN0YXR1cykge1xuICAgICAgaWYgKHNlbGYudGltZWRvdXQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIHZhciBoYW5kbGVQcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgIGlmIChlLnRvdGFsID4gMCkge1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgIH1cbiAgICBlLmRpcmVjdGlvbiA9ICdkb3dubG9hZCc7XG4gICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICB9O1xuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB4aHIub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKHhoci51cGxvYWQgJiYgdGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIC8vIFJlcG9ydGVkIGhlcmU6XG4gICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy84MzcyNDUveG1saHR0cHJlcXVlc3QtdXBsb2FkLXRocm93cy1pbnZhbGlkLWFyZ3VtZW50LXdoZW4tdXNlZC1mcm9tLXdlYi13b3JrZXItY29udGV4dFxuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYudGltZWRvdXQgPSB0cnVlO1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCdHRVQnICE9IHRoaXMubWV0aG9kICYmICdIRUFEJyAhPSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSAmJiAhaXNIb3N0KGRhdGEpKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgdmFyIGNvbnRlbnRUeXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIHZhciBzZXJpYWxpemUgPSB0aGlzLl9wYXJzZXIgfHwgcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG5cbiAgLy8gSUUxMSB4aHIuc2VuZCh1bmRlZmluZWQpIHNlbmRzICd1bmRlZmluZWQnIHN0cmluZyBhcyBQT1NUIHBheWxvYWQgKGluc3RlYWQgb2Ygbm90aGluZylcbiAgLy8gV2UgbmVlZCBudWxsIGhlcmUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgeGhyLnNlbmQodHlwZW9mIGRhdGEgIT09ICd1bmRlZmluZWQnID8gZGF0YSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRmF1eCBwcm9taXNlIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsLCByZWplY3QpIHtcbiAgcmV0dXJuIHRoaXMuZW5kKGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgZXJyID8gcmVqZWN0KGVycikgOiBmdWxmaWxsKHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWwodXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxucmVxdWVzdFsnZGVsJ10gPSBkZWw7XG5yZXF1ZXN0WydkZWxldGUnXSA9IGRlbDtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJNZWFzdXJlbWVudFwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQWNxdWlzaXRpb24gTWV0aG9kXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkNvbnRhY3RcIixcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIlBpeGVsXCIsXG4gICAgICAgIFwiUHJveGltYWxcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNaW5pbXVtIG1lYXN1cmVtZW50IHVuaXQgZm9yIHlvdXIgc3BlY3RyYSAoaS5lLiBjb250YWN0IHByb2JlLCBwcm94aW1hbCB3aXRoIFgtZGVncmVlIGZvcmVvcHRpYywgcGl4ZWwsIG90aGVyKS5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJTYW1wbGUgUGxhdGZvcm1cIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQWlycGxhbmVcIixcbiAgICAgICAgXCJCb29tXCIsXG4gICAgICAgIFwiU2F0ZWxsaXRlXCIsXG4gICAgICAgIFwiVG93ZXJcIixcbiAgICAgICAgXCJVQVZcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJQbGF0Zm9ybSBmcm9tIHdoaWNoIHRoZSBzcGVjdHJhbCBtZWFzdXJlbWVudHMgd2VyZSBtYWRlIChlLmcuIGhhbmRoZWxkLCBib29tLCB0cmFtLCBVQVYpLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNZWFzdXJlbWVudCBWZW51ZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJHcmVlbmhvdXNlXCIsXG4gICAgICAgIFwiTGFib3JhdG9yeVwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiT3V0ZG9vclwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNldHRpbmcgaW4gd2hpY2ggdGhlIHNwZWN0cmFsIG1lYXN1cmVtZW50cyB3ZXJlIG1hZGUuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVGFyZ2V0IFR5cGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQW5pbWFsXCIsXG4gICAgICAgIFwiQmFya1wiLFxuICAgICAgICBcIkJyYW5jaFwiLFxuICAgICAgICBcIkNhbm9weVwiLFxuICAgICAgICBcIkZsb3dlclwiLFxuICAgICAgICBcIkxlYWZcIixcbiAgICAgICAgXCJNaW5lcmFsXCIsXG4gICAgICAgIFwiTlBWXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJSZWZlcmVuY2VcIixcbiAgICAgICAgXCJSb2NrXCIsXG4gICAgICAgIFwiU29pbFwiLFxuICAgICAgICBcIldhdGVyXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRGVzY3JpYmVzIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWVhc3VyZW1lbnQgUXVhbnRpdHlcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQWJzb3JwdGFuY2VcIixcbiAgICAgICAgXCJETlwiLFxuICAgICAgICBcIkVtaXNzaXZpdHlcIixcbiAgICAgICAgXCJJbmRleFwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiUmFkaWFuY2VcIixcbiAgICAgICAgXCJSZWZsZWN0YW5jZVwiLFxuICAgICAgICBcIlRyYW5zZmxlY3RhbmNlXCIsXG4gICAgICAgIFwiVHJhbnNtaXR0YW5jZVwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNjYWxlIGZvciBzcGVjdHJhbCBpbnN0ZW5zaXR5IChlLmcuIEROLCByYWRpYW5jZSwgaXJyYWRpYW5jZSwgcmVmbGVjdGFuY2UpXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiSW5kZXggTmFtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWVhc3VyZW1lbnQgcXVhbnRpdHkncyBpbmRleCBuYW1lLiAgUGxlYXNlIHByb3ZpZGUgaWYgTWVhc3VyZW1lbnQgUXVhbnRpdHkgPSBcXFwiSW5kZXhcXFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1lYXN1cmVtZW50IFVuaXRzXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZC1zaW5nbGVcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCIlXCIsXG4gICAgICAgIFwiVy9tXjJcIixcbiAgICAgICAgXCJXL21eMi9IelwiLFxuICAgICAgICBcIlcvbV4yL25tXCIsXG4gICAgICAgIFwiVy9tXjIvdW1cIixcbiAgICAgICAgXCJXL3NyL21eMlwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1lYXN1cmVtbnQgdW5pdHNcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiV2F2ZWxlbmd0aCBVbml0c1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWQtc2luZ2xlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJVbml0bGVzc1wiLFxuICAgICAgICBcIm5tXCIsXG4gICAgICAgIFwidW1cIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXYXZlbGVuZ3RoIHVuaXRzIChlLmcuIG5tLCB1bSwgSHopXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVGFyZ2V0IFN0YXR1c1wiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJEcmllZFwiLFxuICAgICAgICBcIkZyZXNoXCIsXG4gICAgICAgIFwiR3JlZW5cIixcbiAgICAgICAgXCJHcm91bmRcIixcbiAgICAgICAgXCJMaXF1aWRcIixcbiAgICAgICAgXCJMaXZlXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJQYW5lbFwiLFxuICAgICAgICBcIlN0YW5kYXJkXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3RhdGUgb2YgdGhlIG1lYXN1cmVtZW50IHRhcmdldC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMaWdodCBTb3VyY2VcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTGFtcFwiLFxuICAgICAgICBcIkxhc2VyXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJTdW5cIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEZXNjcmlwdGlvbiBvZiB0aGUgbGlnaHQgc291cmNlIHVzZWQgZm9yIHlvdXIgc3BlY3RyYWwgbWVhc3VyZW1lbnRzXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTGlnaHQgU291cmNlIFNwZWNpZmljYXRpb25zXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwic3BsaXQtdGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRm9yZW9wdGljIFR5cGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQmFyZSBGaWJlclwiLFxuICAgICAgICBcIkNvbnRhY3QgUHJvYmVcIixcbiAgICAgICAgXCJDb3NpbmUgRGlmZnVzZXJcIixcbiAgICAgICAgXCJGb3Jlb3B0aWNcIixcbiAgICAgICAgXCJHZXJzaG9uIFR1YmVcIixcbiAgICAgICAgXCJJbnRlZ3JhdGluZyBTcGhlcmVcIixcbiAgICAgICAgXCJMZWFmIENsaXBcIixcbiAgICAgICAgXCJOb25lXCIsXG4gICAgICAgIFwiT3RoZXJcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEZXNjcmlwdGlvbiBvZiB0aGUgZm9yZW9wdGljIHVzZWQgdG8gbWFrZSB5b3VyIHNwZWN0cmFsIG1lYXN1cmVtZW50XCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRm9yZW9wdGljIEZpZWxkIG9mIFZpZXdcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiaW50ZWdlciBkZWdyZWVzXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGb3Jlb3B0aWMgU3BlY2lmaWNhdGlvbnNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIlByb2Nlc3NpbmcgSW5mb3JtYXRpb25cIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlByb2Nlc3NpbmcgQXZlcmFnZWRcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkLXNpbmdsZVwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIk5vXCIsXG4gICAgICAgIFwiWWVzXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSXMgdGhlIG1lYXN1cmVtZW50IGFuIGF2ZXJhZ2Ugb2YgbXVsdGlwbGUgbWVhc3VyZW1lbnRzP1wiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIEludGVycG9sYXRlZFwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWQtc2luZ2xlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTm9cIixcbiAgICAgICAgXCJZZXNcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJcyB0aGUgbWVhc3VyZW1lbnQgaW50ZXJwb2xhdGVkP1wiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIFJlc2FtcGxlZFwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWQtc2luZ2xlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTm9cIixcbiAgICAgICAgXCJZZXNcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJcyB0aGUgbWVhc3VyZW1lbnQgcmVzYW1wbGVkPyAoZS5nLiBhcmUgbXVsdGlwbGUgd2F2ZWxlbmd0aHMgYXZlcmFnZWQ/KVwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIEluZm9ybWF0aW9uIERldGFpbHNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk90aGVyIGRldGFpbHMgYWJvdXQgcHJvY2Vzc2luZyBhcmUgcHJvdmlkZWQgaGVyZS5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJJbnN0cnVtZW50XCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbnN0cnVtZW50IE1hbnVmYWN0dXJlclwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3BlY3Ryb21ldGVyIG1hbnVmYWN0dXJlci5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiSW5zdHJ1bWVudCBNb2RlbFwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3BlY3Ryb21ldGVyIG1vZGVsLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbnN0cnVtZW50IFNlcmlhbCBOdW1iZXJcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIlRoZW1lXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJUaGVtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBZ3JpY3VsdHVyZVwiLFxuICAgICAgICBcIkJpb2NoZW1pc3RyeVwiLFxuICAgICAgICBcIkVjb2xvZ3lcIixcbiAgICAgICAgXCJGb3Jlc3RcIixcbiAgICAgICAgXCJHbG9iYWwgQ2hhbmdlXCIsXG4gICAgICAgIFwiTGFuZCBDb3ZlclwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiUGhlbm9sb2d5XCIsXG4gICAgICAgIFwiUGh5c2lvbG9neVwiLFxuICAgICAgICBcIlVyYmFuXCIsXG4gICAgICAgIFwiV2F0ZXIgUXVhbGl0eVwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlJlc2VhcmNoIGNvbnRleHQgZm9yIHRoZSB0aGUgc3BlY3RyYWwgbWVhc3VyZW1lbnRzLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIktleXdvcmRzXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwic3BsaXQtdGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRWNvc3lzdGVtIFR5cGVcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQXF1YXRpY1wiLFxuICAgICAgICBcIkNvYXN0YWxcIixcbiAgICAgICAgXCJDcm9wc1wiLFxuICAgICAgICBcIkZvcmVzdFwiLFxuICAgICAgICBcIkdyYXNzbGFuZFwiLFxuICAgICAgICBcIldldGxhbmRcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTkFTQSBHQ01EIEtleXdvcmRzXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTZWxlY3Qgc3BlY3Ryb3Njb3B5LXJlbGF0ZWQga2V5d29yZHMgZnJvbSB0aGUgTkFTQSBHbG9iYWwgQ2hhbmdlIE1hc3RlciBEaXJlY3RvcnkncyBjb250cm9sbGVkIGtleXdvcmQgdm9jYWJ1bGFyaWVzLiAoaHR0cDovL2djbWQubmFzYS5nb3YvbGVhcm4va2V5d29yZF9saXN0Lmh0bWwpXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiTG9jYXRpb25cIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxhdGl0dWRlXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwibGF0bG5nXCIsXG4gICAgICBcInVuaXRzXCI6IFwiZGVjaW1hbCBkZWdyZWVcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiU3BlY3RyYVwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxvbmdpdHVkZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImxhdGxuZ1wiLFxuICAgICAgXCJ1bml0c1wiOiBcImRlY2ltYWwgZGVncmVlXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJnZW9qc29uXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiZ2VvanNvblwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTG9jYXRpb24gTmFtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiU3BlY3RyYVwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiRGF0ZVwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiU2FtcGxlIENvbGxlY3Rpb24gRGF0ZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImRhdGVcIixcbiAgICAgIFwidW5pdHNcIjogXCJJU08gRGF0ZSBcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1lYXN1cmVtZW50IERhdGVcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJkYXRlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiSVNPIERhdGUgXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQaGVub2xvZ2ljYWwgU3RhdHVzXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJTcGVjaWVzXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJDb21tb24gTmFtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiU3BlY3RyYVwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQ29tbW9uIG5hbWUgb2YgdGhlIHRhcmdldCB0aGF0IHdhcyBtZWFzdXJlZC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTGF0aW4gR2VudXNcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkxhdGluIGdlbnVzIG9mIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxhdGluIFNwZWNpZXNcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkxhdGluIHNwZWNpZXMgb2YgdGhlIHRhcmdldCB0aGF0IHdhcyBtZWFzdXJlZC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVVNEQSBTeW1ib2xcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlVTREEgY29kZSBvZiB0aGUgdGFyZ2V0IHRoYXQgd2FzIG1lYXN1cmVkLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJWZWdldGF0aW9uIFR5cGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIkNpdGF0aW9uXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJDaXRhdGlvblwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkNpdGF0aW9uIERPSVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIldlYnNpdGVcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJBdXRob3JcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJBdXRob3IgRW1haWxcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNYWludGFpbmVyXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWFpbnRhaW5lciBFbWFpbFwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkZ1bmRpbmcgU291cmNlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRnVuZGluZyBTb3VyY2UgR3JhbnQgTnVtYmVyXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiWWVhclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF1cbn0iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
