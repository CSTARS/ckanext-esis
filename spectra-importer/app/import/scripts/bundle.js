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
    postRaw(this.host+'/api/3/action/resource_delete', {id : resourceId }, function(err, resp) {
      handleResp(err, resp, callback);
    });
  };

  this.deleteResources = function(resourceIds, callback) {
    postRaw(this.host+'/ecosis/resource/deleteMany', {ids : resourceIds }, function(err, resp) {
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
   .withCredentials();

  if( typeof data === 'object' ) {
    data = JSON.stringify(data);
    r.set('Content-type', 'application/json');
  }
  r.send(data);

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

},{"./addResource":1,"superagent":18}],3:[function(require,module,exports){
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
      count++;
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

},{"./schema":13,"events":15}],4:[function(require,module,exports){
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

},{"./ckan":2,"./datastore":3,"./logic":6,"./package":11,"events":15}],5:[function(require,module,exports){
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

},{"../schema":13,"./createSchemaMethods":9,"./crud":10,"./template":12,"events":15,"extend":16}],12:[function(require,module,exports){

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
        "Alpine",
        "Antarctic",
        "Aquatic",
        "Arctic",
        "Arctic Tundra",
        "Coastal",
        "Crops",
        "Desert",
        "Estuary",
        "Forest",
        "Freshwater",
        "Grassland",
        "Lake",
        "Marine",
        "Montane",
        "Ocean",
        "Pond",
        "Rainforest",
        "River",
        "Savanna",
        "Scrubland",
        "Shrubland",
        "Steppe",
        "Tundra",
        "Urban",
        "Woodland"
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
},{}],14:[function(require,module,exports){

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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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


},{}],17:[function(require,module,exports){

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
},{}],18:[function(require,module,exports){
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

},{"emitter":14,"reduce":17}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY2thbi9hZGRSZXNvdXJjZS5qcyIsImxpYi9ja2FuL2luZGV4LmpzIiwibGliL2RhdGFzdG9yZS5qcyIsImxpYi9pbmRleC5qcyIsImxpYi9sb2dpYy9jcmVhdGVQYWNrYWdlLmpzIiwibGliL2xvZ2ljL2luZGV4LmpzIiwibGliL2xvZ2ljL3ZlcmlmeS9pbmRleC5qcyIsImxpYi9sb2dpYy92ZXJpZnkvbmFtZS5qcyIsImxpYi9wYWNrYWdlL2NyZWF0ZVNjaGVtYU1ldGhvZHMuanMiLCJsaWIvcGFja2FnZS9jcnVkLmpzIiwibGliL3BhY2thZ2UvaW5kZXguanMiLCJsaWIvcGFja2FnZS90ZW1wbGF0ZS5qcyIsImxpYi9zY2hlbWEuanNvbiIsIm5vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzliQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25tQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHJlcXVlc3QsIGtleSwgaG9zdDtcblxuLy8gVE9ETzogdGhpcyBuZWVkcyB0byBiZSB2ZXJpZmllZCA6L1xuZnVuY3Rpb24gYWRkUmVzb3VyY2VOb2RlKHBrZ2lkLCBmaWxlLCBjYWxsYmFjaykge1xuICB2YXIgciA9IHJlcXVlc3RcbiAgIC5wb3N0KGhvc3QgKyAnL2FwaS8zL2FjdGlvbi9yZXNvdXJjZV9jcmVhdGUnKVxuICAgLndpdGhDcmVkZW50aWFscygpXG4gICAuZmllbGQoJ3BhY2thZ2VfaWQnLCBwa2dpZClcbiAgIC5maWVsZCgnbWltZXR5cGUnLCBmaWxlLm1pbWV0eXBlKVxuICAgLmZpZWxkKCduYW1lJywgZmlsZS5maWxlbmFtZSlcbiAgIC5maWVsZCgndXJsJywndXBsb2FkJylcbiAgIC5hdHRhY2goJ3VwbG9hZCcsIGZpbGUucGF0aCk7XG5cbiAgaWYoIGtleSApIHtcbiAgICByLnNldCgnQXV0aG9yaXphdGlvbicsIGtleSk7XG4gIH1cblxuICByLmVuZChjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGFkZFJlc291cmNlQnJvd3Nlcihwa2dpZCwgZmlsZSwgY2FsbGJhY2ssIHByb2dyZXNzKSB7XG4gIC8vIFRPRE86IGlmIHRoaXMgZmFpbHMsIHdlIGhhdmUgYW4gaXNzdWUgb24gb3VyIGhhbmRzXG4gIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXG4gIGZvcm1EYXRhLmFwcGVuZCgncGFja2FnZV9pZCcsIHBrZ2lkKTtcbiAgZm9ybURhdGEuYXBwZW5kKCdtaW1ldHlwZScsIGZpbGUubWltZXR5cGUpO1xuICBmb3JtRGF0YS5hcHBlbmQoJ25hbWUnLCBmaWxlLmZpbGVuYW1lKTtcbiAgZm9ybURhdGEuYXBwZW5kKCd1cmwnLCAndXBsb2FkJyk7XG4gIGZvcm1EYXRhLmFwcGVuZCgndXBsb2FkJywgbmV3IEJsb2IoW2ZpbGUuY29udGVudHNdLCB7dHlwZTogZmlsZS5taW1ldHlwZX0pLCBmaWxlLmZpbGVuYW1lKTtcblxuICB2YXIgdGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gIHZhciB4aHIgPSAkLmFqYXhTZXR0aW5ncy54aHIoKTtcbiAgLy8gYXR0YWNoIHByb2dyZXNzIGhhbmRsZXIgdG8gdGhlIFhNTEh0dHBSZXF1ZXN0IE9iamVjdFxuXG4gIHRyeSB7XG4gICAgICBpZiggcHJvZ3Jlc3MgKSB7XG4gICAgICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKFwicHJvZ3Jlc3NcIiwgZnVuY3Rpb24oZXZ0KXtcbiAgICAgICAgICAgICAgaWYgKGV2dC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpZmYgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRpbWU7XG4gICAgICAgICAgICAgICAgdmFyIHNwZWVkID0gKGV2dC5sb2FkZWQgLyAxMDAwMDAwKSAvIChkaWZmIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICBwcm9ncmVzcygoKGV2dC5sb2FkZWQgLyBldnQudG90YWwpKjEwMCkudG9GaXhlZCgwKSwgc3BlZWQudG9GaXhlZCgyKSsnTWJwcycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgfVxuICB9IGNhdGNoKGUpIHt9XG5cbiAgJC5hamF4KHtcbiAgICB1cmw6IGhvc3QgKyAnL2FwaS8zL2FjdGlvbi9yZXNvdXJjZV9jcmVhdGUnLFxuICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgIGRhdGE6IGZvcm1EYXRhLFxuICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICBjb250ZW50VHlwZTogZmFsc2UsXG4gICAgeGhyRmllbGRzOiB7XG4gICAgICB3aXRoQ3JlZGVudGlhbHM6IHRydWVcbiAgICB9LFxuICAgIHhociA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geGhyO1xuICAgIH0sXG4gICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcCl7XG4gICAgICBjYWxsYmFjayhudWxsLCB7XG4gICAgICAgIGJvZHkgOiByZXNwXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGVycm9yIDogZnVuY3Rpb24oKSB7XG4gICAgICBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSxtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHhocjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihyLCBoLCBrLCBpc0Jyb3dzZXIsIGhhbmRsZVJlc3ApIHtcbiAgcmVxdWVzdCA9IHI7XG4gIGtleSA9IGs7XG4gIGhvc3QgPSBoO1xuXG4gIHJldHVybiBmdW5jdGlvbihwa2dpZCwgZmlsZSwgY2FsbGJhY2ssIHByb2dyZXNzKSB7XG4gICAgZnVuY3Rpb24gbmV4dChlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgaWYoIGlzQnJvd3NlciApIGFkZFJlc291cmNlQnJvd3Nlcihwa2dpZCwgZmlsZSwgbmV4dCwgcHJvZ3Jlc3MpO1xuICAgIGVsc2UgYWRkUmVzb3VyY2VOb2RlKHBrZ2lkLCBmaWxlLCBuZXh0KTtcbiAgfTtcbn07XG4iLCJ2YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcblxuLy8gZGVwZW5kcyBpZiB3ZSBhcmUgcnVubmluZyBmcm9tIG5vZGVqcyBvciBicm93c2VyXG52YXIgYWdlbnQgPSByZXF1ZXN0LmFnZW50ID8gcmVxdWVzdC5hZ2VudCgpIDogcmVxdWVzdDtcbnZhciBpc0Jyb3dzZXIgPSByZXF1ZXN0LmFnZW50ID8gZmFsc2UgOiB0cnVlO1xudmFyIGtleSA9ICcnO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHRoaXMuaG9zdCA9IGNvbmZpZy5ob3N0IHx8ICcvJztcbiAga2V5ID0gY29uZmlnLmtleSB8fCAnJztcbiAgdGhpcy5rZXkgPSBrZXk7XG5cbiAgdGhpcy5wcmVwYXJlV29ya3NwYWNlID0gZnVuY3Rpb24ocGtnaWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3dvcmtzcGFjZS9wcmVwYXJlJyxcbiAgICAgIHtcbiAgICAgICAgZm9yY2U6IHRydWUsXG4gICAgICAgIHBhY2thZ2VfaWQ6IHBrZ2lkXG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKXtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0V29ya3NwYWNlID0gZnVuY3Rpb24ocGtnaWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3dvcmtzcGFjZS9nZXQnLFxuICAgICAge1xuICAgICAgICBwYWNrYWdlX2lkIDogcGtnaWRcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3Ape1xuICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICk7XG4gIH07XG5cbiAgdGhpcy5nZXRBY3RpdmVVc2VyID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBnZXQoXG4gICAgICB0aGlzLmhvc3QrJy9lY29zaXMvdXNlci9nZXQnLFxuICAgICAge30sXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgYSByZXNvdXJjZSB0byBhIHBhY2thZ2UgdXNpbmcgdGhlIGJyb3dzZXJzIEZvcm1EYXRhIG9iamVjdCBpbiBhIGJyb3dzZXJcbiAgICogb3IgdXNlciB0aGUgc3VwZXJhZ2VudCBmb3IgTm9kZUpTXG4gICAqXG4gICAqIHBrZ2lkOiBpZCBvZiB0aGUgcGFja2FnZSB0byBhZGQgdG9cbiAgICogZmlsZTogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgdG8gcmVzb3VyY2UgdG8gdXBsb2FkIG9yIGlmIE5vZGVKUyBzdHJpbmcgcGF0aCB0byBmaWxlXG4gICAqIGNhbGxiYWNrOiBjYWxsYmFjayBoYW5kbGVyXG4gICAqIHByb2dyZXNzOiBjYWxsYmFjayBmb3IgcHJvZ3Jlc3MgdXBkYXRlIChub3Qgc3VwcG9ydGVkIGluIE5vZGVKUylcbiAgICoqL1xuICB0aGlzLmFkZFJlc291cmNlID0gcmVxdWlyZSgnLi9hZGRSZXNvdXJjZScpKHJlcXVlc3QsIGNvbmZpZy5ob3N0LCBrZXksIGlzQnJvd3NlciwgaGFuZGxlUmVzcCk7XG5cblxuICB0aGlzLmdldERhdGFzaGVldCA9IGZ1bmN0aW9uKHBrZ2lkLCByaWQsIHNpZCwgY2FsbGJhY2spIHtcbiAgICBnZXQoXG4gICAgICB0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZ2V0JyxcbiAgICAgIHtcbiAgICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkLFxuICAgICAgICByZXNvdXJjZV9pZCA6IHJpZCxcbiAgICAgICAgZGF0YXNoZWV0X2lkIDogc2lkXG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICB0aGlzLmdldE1ldGFkYXRhSW5mbyA9IGZ1bmN0aW9uKHBhY2thZ2VfaWQsIHJlc291cmNlX2lkLCBzaGVldF9pZCwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBxdWVyeSA9IHtcbiAgICAgICAgcGFja2FnZV9pZCA6IHBhY2thZ2VfaWQsXG4gICAgICAgIHJlc291cmNlX2lkIDogcmVzb3VyY2VfaWRcbiAgICAgIH07XG4gICAgICBpZiggc2hlZXRfaWQgKSB7XG4gICAgICAgIHF1ZXJ5LnNoZWV0X2lkID0gc2hlZXRfaWQ7XG4gICAgICB9XG5cbiAgICAgIGdldChcbiAgICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL2dldE1ldGFkYXRhSW5mbycsXG4gICAgICAgIHF1ZXJ5LFxuICAgICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0TWV0YWRhdGFDaHVuayA9IGZ1bmN0aW9uKHBhY2thZ2VfaWQsIHJlc291cmNlX2lkLCBzaGVldF9pZCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgcXVlcnkgPSB7XG4gICAgICAgIHBhY2thZ2VfaWQgOiBwYWNrYWdlX2lkLFxuICAgICAgICByZXNvdXJjZV9pZCA6IHJlc291cmNlX2lkLFxuICAgICAgICBpbmRleCA6IGluZGV4XG4gICAgICB9O1xuICAgICAgaWYoIHNoZWV0X2lkICkge1xuICAgICAgICBxdWVyeS5zaGVldF9pZCA9IHNoZWV0X2lkO1xuICAgICAgfVxuXG4gICAgICBnZXQoXG4gICAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9nZXRNZXRhZGF0YUNodW5rJyxcbiAgICAgICAgcXVlcnksXG4gICAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gIH07XG5cbiAgdGhpcy5nZXRTcGVjdHJhID0gZnVuY3Rpb24ocGtnaWQsIHJpZCwgc2lkLCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcXVlcnkgPSB7XG4gICAgICBwYWNrYWdlX2lkIDogcGtnaWQsXG4gICAgICBpbmRleCA6IGluZGV4XG4gICAgfTtcblxuICAgIGlmKCByaWQgKSB7XG4gICAgICBxdWVyeS5yZXNvdXJjZV9pZCA9IHJpZDtcbiAgICB9XG4gICAgaWYoIHNpZCApIHtcbiAgICAgIHF1ZXJ5LnNoZWV0X2lkID0gc2lkO1xuICAgIH1cblxuICAgIGdldChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy9zcGVjdHJhL2dldCcsXG4gICAgICBxdWVyeSxcbiAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICk7XG4gIH07XG5cbiAgdGhpcy5nZXRTcGVjdHJhQ291bnQgPSBmdW5jdGlvbihwa2dpZCwgcmlkLCBzaWQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge1xuICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkXG4gICAgfTtcblxuICAgIGlmKCByaWQgKSB7XG4gICAgICBxdWVyeS5yZXNvdXJjZV9pZCA9IHJpZDtcbiAgICB9XG4gICAgaWYoIHNpZCApIHtcbiAgICAgIHF1ZXJ5LnNoZWV0X2lkID0gc2lkO1xuICAgIH1cblxuICAgIGdldChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9nZXRTcGVjdHJhQ291bnQnLFxuICAgICAgcXVlcnksXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG5cbiAgdGhpcy5wcm9jZXNzUmVzb3VyY2UgPSBmdW5jdGlvbihwa2dpZCwgcmVzb3VyY2VfaWQsIHNoZWV0X2lkLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgICBwYWNrYWdlX2lkIDogcGtnaWQsXG4gICAgICAgIG9wdGlvbnMgOiBKU09OLnN0cmluZ2lmeShvcHRpb25zKVxuICAgIH07XG5cbiAgICAvLyBhcHBseSB0byBtdWx0aXBsZSByZXNvdXJjZXMsIGhlbHBlciBmb3IgZmlyc3QgdXBsb2FkXG4gICAgaWYoIEFycmF5LmlzQXJyYXkocmVzb3VyY2VfaWQpICkge1xuICAgICAgZGF0YS5yZXNvdXJjZV9pZHMgPSBKU09OLnN0cmluZ2lmeShyZXNvdXJjZV9pZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGEucmVzb3VyY2VfaWQgPSByZXNvdXJjZV9pZDtcbiAgICAgIGRhdGEuc2hlZXRfaWQgPSBzaGVldF9pZDtcbiAgICB9XG5cbiAgICBwb3N0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL3Byb2Nlc3MnLFxuICAgICAgZGF0YSxcbiAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSBpbmZvIGluIHRoZSBkYXRhc3RvcmUgaWYgd2UgaGF2ZSBvbmVcbiAgICAgICAgaWYoIHRoaXMuZHMgKSB7XG4gICAgICAgICAgdGhpcy5kcy53YXZlbGVuZ3RocyA9IHJlc3Aud2F2ZWxlbmd0aHMgfHwgW107XG4gICAgICAgICAgdGhpcy5kcy5zY2hlbWEgPSBbXTtcbiAgICAgICAgICBpZiggIXJlc3AuYXR0cmlidXRlcyApIHJldHVybjtcblxuICAgICAgICAgIGZvciggdmFyIGF0dHJOYW1lIGluIHJlc3AuYXR0cmlidXRlcyApIHtcbiAgICAgICAgICAgICAgdmFyIGF0dHIgPSByZXNwLmF0dHJpYnV0ZXNbYXR0ck5hbWVdO1xuICAgICAgICAgICAgICBhdHRyLm5hbWUgPSBhdHRyTmFtZTtcbiAgICAgICAgICAgICAgdGhpcy5kcy5zY2hlbWEucHVzaChhdHRyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgICAgfVxuICAgICk7XG4gIH07XG5cbiAgdGhpcy5nZXRMaWNlbnNlTGlzdCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9saWNlbnNlX2xpc3QnLCB7fSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuZ2V0UGFja2FnZSA9IGZ1bmN0aW9uKHBrZ2lkLCBjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vcGFja2FnZV9zaG93Jywge2lkIDogcGtnaWR9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5nZXRPcmdhbml6YXRpb24gPSBmdW5jdGlvbihuYW1lT3JJZCwgY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL29yZ2FuaXphdGlvbl9zaG93Jywge2lkIDogbmFtZU9ySWR9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy50YWdTZWFyY2ggPSBmdW5jdGlvbihxdWVyeSwgbGltaXQsIGNhbGxiYWNrKSB7XG4gICAgLy8gc3VwcG9ydGluZyBtdWx0aXBsZSB2ZXJzaW9ucyBvZiBja2FuLiAgd2h5IHRoZXkgY2hhbmdlZCB0aGlzIHBhcmFtZXRlci4uLiB3aG8ga25vd3MuLi5cblxuICAgIHF1ZXJ5ID0ge1xuICAgICAgcXVlcnkgOiBxdWVyeSxcbiAgICAgIGNrYW4gOiBxdWVyeSxcbiAgICAgIGxpbWl0IDogbGltaXQgfHwgMTBcbiAgICB9O1xuXG4gICAgZ2V0KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi90YWdfc2VhcmNoJywgcXVlcnksIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICBpZiggcmVzcC5lcnJvciApIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2socmVzcCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciB0bXAgPSB7fSwga2V5O1xuICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgcmVzcC5yZXN1bHRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgcmVzcC5yZXN1bHRzW2ldLm5hbWUgPSByZXNwLnJlc3VsdHNbaV0ubmFtZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICAgICAgICAgIHRtcFtyZXNwLnJlc3VsdHNbaV0ubmFtZV0gPSByZXNwLnJlc3VsdHNbaV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzcC5yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yKCBrZXkgaW4gdG1wICkge1xuICAgICAgICAgICAgcmVzcC5yZXN1bHRzLnB1c2godG1wW2tleV0pO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICAgICAgY2FsbGJhY2socmVzcCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLnVwZGF0ZVBhY2thZ2UgPSBmdW5jdGlvbihwa2csIGNhbGxiYWNrKSB7XG4gICAgaWYoIHBrZy5wcml2YXRlICkge1xuICAgICAgdGhpcy52ZXJpZnlQcml2YXRlKHBrZy5pZCxcbiAgICAgICAgZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZVBhY2thZ2UocGtnLCBjYWxsYmFjayk7XG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlUGFja2FnZShwa2csIGNhbGxiYWNrKTtcbiAgfTtcblxuICB0aGlzLl91cGRhdGVQYWNrYWdlID0gZnVuY3Rpb24ocGtnLCBjYWxsYmFjaykge1xuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL3BhY2thZ2VfdXBkYXRlJywgcGtnLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy51cGRhdGVMaW5rZWRSZXNvdXJjZXMgPSBmdW5jdGlvbihpZCwgcmVzb3VyY2VzLCBjYWxsYmFjaykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQgOiBpZCxcbiAgICAgIGxpbmtlZFJlc291cmNlcyA6IHJlc291cmNlc1xuICAgIH1cblxuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvZWNvc2lzL3BhY2thZ2UvdXBkYXRlTGlua2VkUmVzb3VyY2VzJywgZGF0YSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMudmVyaWZ5UHJpdmF0ZSA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvcGFja2FnZS9zZXRQcml2YXRlJywge2lkOiBpZH0sIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmRlbGV0ZVBhY2thZ2UgPSBmdW5jdGlvbihwa2dpZCwgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9wYWNrYWdlX2RlbGV0ZScsIEpTT04uc3RyaW5naWZ5KHtpZDogcGtnaWR9KSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuY3JlYXRlUGFja2FnZSA9IGZ1bmN0aW9uKHBrZywgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9wYWNrYWdlX2NyZWF0ZScsIHBrZywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMudG9wU3VnZ2VzdE92ZXJ2aWV3ID0gZnVuY3Rpb24obGlzdCwgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWVzIDogSlNPTi5zdHJpbmdpZnkobGlzdCksXG4gICAgfTtcblxuICAgIHBvc3QodGhpcy5ob3N0KycvZWNvc2lzL3NwZWN0cmEvc3VnZ2VzdE92ZXJ2aWV3JywgZGF0YSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMudG9wU3VnZ2VzdCA9IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9zcGVjdHJhL3N1Z2dlc3QnLCB7bmFtZSA6bmFtZX0sIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmdjbWRTdWdnZXN0ID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL3NwZWN0cmEvZ2NtZCcsIHtxdWVyeTogbmFtZS50b0xvd2VyQ2FzZSgpfSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMucmVtb3ZlUmVzb3VyY2UgPSBmdW5jdGlvbihyZXNvdXJjZUlkLCBjYWxsYmFjaykge1xuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL3Jlc291cmNlX2RlbGV0ZScsIHtpZCA6IHJlc291cmNlSWQgfSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuZGVsZXRlUmVzb3VyY2VzID0gZnVuY3Rpb24ocmVzb3VyY2VJZHMsIGNhbGxiYWNrKSB7XG4gICAgcG9zdFJhdyh0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZGVsZXRlTWFueScsIHtpZHMgOiByZXNvdXJjZUlkcyB9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5wdXNoVG9TZWFyY2ggPSBmdW5jdGlvbihwa2dpZCwgaW5jbHVkZUVtYWlsLCBjYWxsYmFjaykge1xuICAgIHZhciBxdWVyeSA9IHtcbiAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZCxcbiAgICAgIGVtYWlsIDogaW5jbHVkZUVtYWlsID8gJ3RydWUnIDogJ2ZhbHNlJ1xuICAgIH07XG5cbiAgICBnZXQoXG4gICAgICB0aGlzLmhvc3QrJy9lY29zaXMvd29ya3NwYWNlL3B1c2gnLFxuICAgICAgcXVlcnksXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2l0SW5mbyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9naXRJbmZvJywge30sIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cblxuZnVuY3Rpb24gcG9zdCh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG4gIHZhciByID0gcmVxdWVzdFxuICAgLnBvc3QodXJsKVxuICAgLndpdGhDcmVkZW50aWFscygpXG4gICAudHlwZSgnZm9ybScpXG4gICAuc2VuZChkYXRhKTtcblxuICBpZigga2V5ICkge1xuICAgIHIuc2V0KCdBdXRob3JpemF0aW9uJywga2V5KTtcbiAgfVxuXG4gIHIuZW5kKGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gcG9zdFJhdyh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG4gIHZhciByID0gcmVxdWVzdFxuICAgLnBvc3QodXJsKVxuICAgLndpdGhDcmVkZW50aWFscygpO1xuXG4gIGRlYnVnZ2VyO1xuICBpZiggdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICkge1xuICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICByLnNldCgnQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgfVxuICByLnNlbmQoZGF0YSk7XG5cbiAgaWYoIGtleSApIHtcbiAgICByLnNldCgnQXV0aG9yaXphdGlvbicsIGtleSk7XG4gIH1cblxuICByLmVuZChjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGdldCh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG4gIHZhciByID0gcmVxdWVzdFxuICAgIC5nZXQodXJsKVxuICAgIC5xdWVyeShkYXRhIHx8IHt9KVxuICAgIC53aXRoQ3JlZGVudGlhbHMoKTtcblxuXG4gIGlmKCBrZXkgKSB7XG4gICAgci5zZXQoJ0F1dGhvcml6YXRpb24nLCBrZXkpO1xuICB9XG5cbiAgci5lbmQoY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spIHtcbiAgaWYoIGVyciApIHtcbiAgICByZXR1cm4gY2FsbGJhY2soe1xuICAgICAgZXJyb3I6IHRydWUsXG4gICAgICBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsXG4gICAgICB0eXBlIDogJ2h0dHAnLFxuICAgICAgZGV0YWlsczogZXJyXG4gICAgfSk7XG4gIH1cblxuICBpZiggIXJlc3AgKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ1JlcXVlc3QgRXJyb3InLFxuICAgICAgdHlwZSA6ICdodHRwJyxcbiAgICAgIGRldGFpbHM6ICdTZXJ2ZXIgZGlkIG5vdCBzZW5kIGEgcmVzcG9uc2UnXG4gICAgfSk7XG4gIH1cblxuICBpZiggIXJlc3AuYm9keSApIHtcbiAgICByZXR1cm4gY2FsbGJhY2soe1xuICAgICAgZXJyb3I6IHRydWUsXG4gICAgICBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsXG4gICAgICB0eXBlIDogJ2h0dHAnLFxuICAgICAgZGV0YWlsczogJ1NlcnZlciBkaWQgbm90IHNlbmQgYSByZXNwb25zZSdcbiAgICB9KTtcbiAgfVxuXG4gIGlmKCByZXNwLmJvZHkuZXJyb3IgKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ1JlcXVlc3QgRXJyb3InLFxuICAgICAgdHlwZSA6ICdja2FuJyxcbiAgICAgIGRldGFpbHM6IHJlc3AgPyByZXNwLmJvZHkgOiAnJ1xuICAgIH0pO1xuICB9XG5cbiAgaWYoIHJlc3AuYm9keS5zdWNjZXNzICYmIHJlc3AuYm9keS5yZXN1bHQgKSB7XG4gICAgY2FsbGJhY2socmVzcC5ib2R5LnJlc3VsdCk7XG4gIH0gZWxzZSB7XG4gICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZXJyLCByZXNwKSB7XG4gIGlmKCBlcnIgKSByZXR1cm4gdHJ1ZTtcbiAgaWYoIHJlc3AgJiYgcmVzcC5ib2R5ICYmIHJlc3AuYm9keS5lcnJvciApIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG4iLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHRoaXMuY2thbiA9IGNvbmZpZy5ja2FuO1xuICB0aGlzLlNESyA9IGNvbmZpZy5TREs7XG4gIGlmKCB0aGlzLmNrYW4gKSB0aGlzLmNrYW4uZHMgPSB0aGlzO1xuXG4gIC8vIGlzIHRoaXMgYW4gZXhpc3RpbmcgZGF0YXNldFxuICB0aGlzLmVkaXRNb2RlID0gY29uZmlnLnBhY2thZ2VfaWQgPyB0cnVlIDogZmFsc2U7XG5cbiAgLy8gZXhpc3RpbmcgcGFja2FnZSBpZFxuICB0aGlzLnBhY2thZ2VfaWQgPSBjb25maWcucGFja2FnZV9pZDtcblxuICB0aGlzLnBhY2thZ2UgPSB0aGlzLlNESy5uZXdQYWNrYWdlKCk7XG4gIHRoaXMucGFja2FnZS5tb2RlID0gdGhpcy5lZGl0TW9kZSA/ICdlZGl0JyA6ICdjcmVhdGUnO1xuXG4gIHRoaXMub3duZXJfb3JnX25hbWUgPSAnJztcblxuICB0aGlzLmRhdGFzZXRBdHRyaWJ1dGVzID0ge1xuICAgIC8vZ3JvdXBfYnkgOiAnJyxcbiAgICBzb3J0X29uIDogJycsXG4gICAgc29ydF90eXBlIDogJycsXG4gICAgc29ydF9kZXNjcmlwdGlvbiA6ICcnXG4gIH07XG5cbiAgLy8gbGlzdCBvZiBhbGwgbmV3IHJlc291cmNlc1xuICB0aGlzLnJlc291cmNlcyA9IFtdO1xuXG4gIC8vIGhhc2ggb2YgY3VycmVudCBhdHRyaWJ1dGUgbmFtZSBtYXBwaW5nc1xuICAvLyAgLSBrZXk6IGVjb3NpcyBuYW1lXG4gIC8vICAtIHZhbHVlOiBkYXRhc2V0IG5hbWVcbiAgdGhpcy5hdHRyaWJ1dGVNYXAgPSB7fTtcblxuICAvLyBpbnZlcnNlIGxpc3Qgb2YgYWJvdmUgbWFwIHcvIGtleSAvIHZhbHVlIHN3aXRjaGVkXG4gIHRoaXMuaW52ZXJzZUF0dHJpYnV0ZU1hcCA9IHt9O1xuXG4gIHRoaXMubWV0YWRhdGFEZWZpbml0aW9ucyA9IHJlcXVpcmUoJy4vc2NoZW1hJyk7XG4gIHRoaXMubWV0YWRhdGFMb29rdXAgPSB7fTtcbiAgZm9yKCB2YXIgY2F0IGluIHRoaXMubWV0YWRhdGFEZWZpbml0aW9ucyApIHtcbiAgICB2YXIgZGVmcyA9IHRoaXMubWV0YWRhdGFEZWZpbml0aW9uc1tjYXRdO1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZGVmcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGRlZnNbaV0uY2F0ZWdvcnkgPSBjYXQ7XG4gICAgICBkZWZzW2ldLmZsYXQgPSBkZWZzW2ldLm5hbWUucmVwbGFjZSgvXFxzL2csJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBkZWZzW2ldLmZuTmFtZSA9IGRlZnNbaV0ubmFtZS5yZXBsYWNlKC9cXHMvZywnJyk7XG4gICAgICB0aGlzLm1ldGFkYXRhTG9va3VwW2RlZnNbaV0ubmFtZV0gPSBkZWZzW2ldO1xuICAgIH1cbiAgfVxuXG4gIC8vIHRoaXMgZmxhZyBwcmV2ZW50cyB1cCBmcm9tIG1ha2luZyB1cGRhdGVzIHdoZW4gd2UgYXJlIGluaXRpYWxseVxuICAvLyBzZXR0aW5nIHRoZSBkYXRhXG4gIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gIHRoaXMubG9hZGluZ0Vycm9yID0gZmFsc2U7XG5cbiAgLy8gd2lyZSBldmVudHNcbiAgdmFyIGVlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBlZS5zZXRNYXhMaXN0ZW5lcnMoMTAwKTtcbiAgdGhpcy5vbiA9IGZ1bmN0aW9uKGUsIGZuKSB7XG4gICAgLy8gaWYgdGhpbmdzIHdhbnQgdG8ga25vdyB3ZSBhcmUgbG9hZGVkIGFuZCB3ZSBoYXZlIGFscmVhZHkgZmlyZWQsIGp1c3QgdHJpZ2dlci5cbiAgICBpZiggZSA9PSAnbG9hZCcgJiYgdGhpcy5sb2FkZWQgKSB7XG4gICAgICBzZXRUaW1lb3V0KGZuLCAyMDApOyAvLyBIQUNLOiBuZWVkIHRvIGZpeCBzZXRWYWx1ZXMoKSBvZiBlY29zaXMtKi1pbnB1dFxuICAgICAgLy9yZXR1cm5cbiAgICB9XG5cbiAgICBlZS5vbihlLCBmbik7XG4gIH07XG5cbiAgdGhpcy5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ja2FuLnByZXBhcmVXb3Jrc3BhY2UodGhpcy5wYWNrYWdlX2lkLCBmdW5jdGlvbihyZXN1bHQpe1xuXG4gICAgICBpZiggcmVzdWx0LmVycm9yICkge1xuICAgICAgICB0aGlzLmxvYWRpbmdFcnJvciA9IHJlc3VsdDtcbiAgICAgICAgZWUuZW1pdCgnbG9hZC1lcnJvcicsIHJlc3VsdCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5ja2FuLmdldFdvcmtzcGFjZSh0aGlzLnBhY2thZ2VfaWQsIGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIGlmKCByZXN1bHQuZXJyb3IgKSB7XG4gICAgICAgICAgdGhpcy5sb2FkaW5nRXJyb3IgPSByZXN1bHQ7XG4gICAgICAgICAgZWUuZW1pdCgnbG9hZC1lcnJvcicsIHJlc3VsdCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIHRoaXMuX3NldERhdGEoKTtcblxuICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgICAgIGVlLmVtaXQoJ2xvYWQnKTtcbiAgICAgICAgdGhpcy5jaGVja0NoYW5nZXMoKTtcblxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9O1xuXG4gIHRoaXMubG9hZEZyb21UZW1wbGF0ZSA9IGZ1bmN0aW9uKGNrYW5QYWNrYWdlKSB7XG4gICAgdGhpcy5wYWNrYWdlLnJlc2V0KCk7XG4gICAgdGhpcy5wYWNrYWdlLm1vZGUgPSAnY3JlYXRlJztcblxuICAgIC8vIHNldCB0aGUgZGVmYXVsdCBhdHRpcmJ1dGVzIGZvciB0aGlzIGRhdGFzZXRcbiAgICB0aGlzLnBhY2thZ2UubG9hZEZyb21UZW1wbGF0ZShja2FuUGFja2FnZSwgdGhpcy5TREsudXNlcik7XG4gICAgdGhpcy51cGRhdGVBbGlhc0xvb2t1cCgpO1xuXG4gICAgZWUuZW1pdCgnbG9hZCcpO1xuICAgIHRoaXMuZmlyZVVwZGF0ZSgpO1xuICB9O1xuXG4gIHRoaXMuY2hlY2tDaGFuZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYoICF0aGlzLmVkaXRNb2RlIHx8ICF0aGlzLmxhc3RQdXNoZWQgKSByZXR1cm47XG5cbiAgICB2YXIgdCA9IG5ldyBEYXRlKHRoaXMucGFja2FnZS5kYXRhLm1ldGFkYXRhX21vZGlmaWVkKS5nZXRUaW1lKCk7XG5cbiAgICBpZiggdGhpcy5kZWxldGVSZXNvdXJjZVRpbWUgKSB7XG4gICAgICBpZiggdGhpcy5kZWxldGVSZXNvdXJjZVRpbWUuZ2V0VGltZSgpID4gdCApIHtcbiAgICAgICAgdCA9IHRoaXMuZGVsZXRlUmVzb3VyY2VUaW1lLmdldFRpbWUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmVzcCA9IHtcbiAgICAgIGxhc3RQdXNoZWQgOiB0aGlzLmxhc3RQdXNoZWQsXG4gICAgICBsYXN0VXBkYXRlZCA6IG5ldyBEYXRlKHQpLFxuICAgICAgdW5wdWJsaXNoZWRDaGFuZ2VzIDogKHRoaXMubGFzdFB1c2hlZC5nZXRUaW1lKCkgPCBuZXcgRGF0ZSh0KS5nZXRUaW1lKCkpXG4gICAgfTtcblxuICAgIGVlLmVtaXQoJ2NoYW5nZXMnLCByZXNwKTtcbiAgICByZXR1cm4gcmVzcDtcbiAgfSxcblxuICAvLyBoZWxwZXIgZm9yIHdoZW4gZGF0YSBsb2Fkc1xuICB0aGlzLl9zZXREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lZGl0TW9kZSA9IHRydWU7XG5cbiAgICB0aGlzLmxhc3RQdXNoZWQgPSB0aGlzLnJlc3VsdC5wdXNoZWQ7XG4gICAgaWYoIHRoaXMubGFzdFB1c2hlZCApIHtcbiAgICAgIHRoaXMubGFzdFB1c2hlZCA9IG5ldyBEYXRlKHRoaXMubGFzdFB1c2hlZCk7XG4gICAgfVxuXG4gICAgdmFyIGNrYW5QYWNrYWdlID0gdGhpcy5yZXN1bHQuY2thbi5wYWNrYWdlO1xuICAgIHRoaXMucGFja2FnZV9pZCA9IGNrYW5QYWNrYWdlLmlkO1xuXG4gICAgdGhpcy5wYWNrYWdlLnJlc2V0KGNrYW5QYWNrYWdlKTtcbiAgICB0aGlzLnBhY2thZ2UubG9hZEZyb21UZW1wbGF0ZShja2FuUGFja2FnZSwgbnVsbCwgdHJ1ZSk7XG5cbiAgICB0aGlzLmRhdGFzaGVldHMgPSB0aGlzLnJlc3VsdC5yZXNvdXJjZXM7XG5cbiAgICB0aGlzLmF0dHJpYnV0ZU1hcCA9IHt9O1xuICAgIHRoaXMuaW52ZXJzZUF0dHJpYnV0ZU1hcCA9IHt9O1xuXG4gICAgaWYoIHRoaXMucmVzdWx0LnBhY2thZ2UubWFwICYmIE9iamVjdCh0aGlzLnBhY2thZ2UuZ2V0QWxpYXNlcygpKS5sZW5ndGggPT09IDAgKSB7XG4gICAgICB0aGlzLnBhY2thZ2Uuc2V0QWxpYXNlcyh0aGlzLnJlc3VsdC5wYWNrYWdlLm1hcCk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVBbGlhc0xvb2t1cCgpO1xuXG4gICAgLy8gY2hlY2sgZm9yIGJhZG5lc3NcbiAgICBpZiggdGhpcy5yZXN1bHQucGFja2FnZS5zb3J0ICYmIE9iamVjdCh0aGlzLnBhY2thZ2UuZ2V0U29ydCgpKS5sZW5ndGggPT09IDAgKSB7XG4gICAgICB0aGlzLnBhY2thZ2Uuc2V0U29ydCh0aGlzLnJlc3VsdC5wYWNrYWdlLnNvcnQpO1xuICAgIH1cblxuICAgIHRoaXMucmVzb3VyY2VzID0gdGhpcy5yZXN1bHQuY2thbi5yZXNvdXJjZXM7XG5cbiAgICB2YXIgemlwcyA9IHt9OyAvLyB1c2VkIHRvIHF1aWNrbHkgYWRkIHJlc291cmNlIHN0dWJzXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnJlc291cmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLnJlc291cmNlc1tpXS5mb3JtYXQudG9Mb3dlckNhc2UoKSA9PT0gJ3ppcCcgfHwgdGhpcy5yZXNvdXJjZXNbaV0ubmFtZS50b0xvd2VyQ2FzZSgpLm1hdGNoKC9cXC56aXAkLykgKSB7XG4gICAgICAgIHppcHNbdGhpcy5yZXNvdXJjZXNbaV0uaWRdID0gdGhpcy5yZXNvdXJjZXNbaV07XG4gICAgICAgIHRoaXMucmVzb3VyY2VzW2ldLmNoaWxkUmVzb3VyY2VzID0gW107XG4gICAgICAgIHRoaXMucmVzb3VyY2VzW2ldLmlzWmlwID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIHRoaXMucmVzb3VyY2VzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICBpZiggYS5uYW1lID4gYi5uYW1lICkgcmV0dXJuIDE7XG4gICAgICBpZiggYS5uYW1lIDwgYi5uYW1lICkgcmV0dXJuIC0xO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSk7XG5cblxuICAgIHRoaXMucmVzb3VyY2VMb29rdXAgPSB7fTtcblxuICAgIC8vIGNyZWF0ZSBmYWtlIHN0dWJzIGZvciB6aXAgZmlsZSByZXNvdXJjZXNcbiAgICB2YXIgYWxyZWFkeUFkZGVkID0ge307XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGFzaGVldHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggIXRoaXMuZGF0YXNoZWV0c1tpXS5mcm9tWmlwICkgY29udGludWU7XG4gICAgICBpZiggYWxyZWFkeUFkZGVkW3RoaXMuZGF0YXNoZWV0c1tpXS5yZXNvdXJjZUlkXSApIGNvbnRpbnVlO1xuXG4gICAgICB2YXIgciA9IHRoaXMuZGF0YXNoZWV0c1tpXTtcblxuICAgICAgdmFyIHN0dWIgPSB7XG4gICAgICAgIGlkIDogci5yZXNvdXJjZUlkLFxuICAgICAgICBwYWNrYWdlX2lkIDogci5wYWNrYWdlSWQsXG4gICAgICAgIGZyb21aaXAgOiB0cnVlLFxuICAgICAgICB6aXAgOiByLnppcCxcbiAgICAgICAgbmFtZSA6IHIubmFtZVxuICAgICAgfVxuXG4gICAgICB6aXBzW3IuemlwLnJlc291cmNlSWRdLmNoaWxkUmVzb3VyY2VzLnB1c2goc3R1Yik7XG4gICAgICB0aGlzLnJlc291cmNlcy5wdXNoKHN0dWIpO1xuXG4gICAgICBhbHJlYWR5QWRkZWRbci5yZXNvdXJjZUlkXSA9IDE7IC8vIHdoeT9cbiAgICB9XG5cbiAgICAvLyBtYXAgcmVzb3VyY2VzIHRvIGRhdGFzaGVldHMgZm9yIGRhc3RlciBsb29rdXBcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMucmVzb3VyY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdmFyIGRhdGFzaGVldHMgPSBbXTtcbiAgICAgIGZvciggdmFyIGogPSAwOyBqIDwgdGhpcy5kYXRhc2hlZXRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBpZiggdGhpcy5kYXRhc2hlZXRzW2pdLnJlc291cmNlSWQgPT0gdGhpcy5yZXNvdXJjZXNbaV0uaWQgKSB7XG4gICAgICAgICAgZGF0YXNoZWV0cy5wdXNoKHRoaXMuZGF0YXNoZWV0c1tqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5yZXNvdXJjZUxvb2t1cFt0aGlzLnJlc291cmNlc1tpXS5pZF0gPSB0aGlzLnJlc291cmNlc1tpXTtcbiAgICAgIHRoaXMucmVzb3VyY2VzW2ldLmRhdGFzaGVldHMgPSBkYXRhc2hlZXRzO1xuICAgIH1cblxuICAgIHRoaXMuZmlyZVVwZGF0ZSgpO1xuICB9XG5cbiAgdGhpcy51cGRhdGVBbGlhc0xvb2t1cCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYXR0cmlidXRlTWFwID0gdGhpcy5wYWNrYWdlLmdldEFsaWFzZXMoKTtcbiAgICBmb3IoIHZhciBrZXkgaW4gdGhpcy5hdHRyaWJ1dGVNYXAgKSB7XG4gICAgICB0aGlzLmludmVyc2VBdHRyaWJ1dGVNYXBbdGhpcy5hdHRyaWJ1dGVNYXBba2V5XV0gPSBrZXk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuc2V0U2hlZXQgPSBmdW5jdGlvbihzaGVldCkge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhc2hlZXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YXNoZWV0c1tpXS5yZXNvdXJjZUlkID09IHNoZWV0LnJlc291cmNlSWQgJiZcbiAgICAgICAgICB0aGlzLmRhdGFzaGVldHNbaV0uc2hlZXRJZCA9PSBzaGVldC5zaGVldElkICkge1xuXG4gICAgICAgICAgdGhpcy5kYXRhc2hlZXRzW2ldID0gc2hlZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlc291cmNlID0gdGhpcy5yZXNvdXJjZUxvb2t1cFtzaGVldC5yZXNvdXJjZUlkXTtcbiAgICBpZiggIXJlc291cmNlICkge1xuICAgICAgY29uc29sZS5sb2coJ0F0dGVtcHRpbmcgdG8gc2V0IHNoZWV0IHdpdGggYSByZXNvdXJjZUlkIHRoYXQgZG9lcyBub3QgZXhpc3QnKTtcbiAgICAgIGNvbnNvbGUubG9nKHNoZWV0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHJlc291cmNlLmRhdGFzaGVldHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggcmVzb3VyY2UuZGF0YXNoZWV0c1tpXS5zaGVldElkID09IHNoZWV0LnNoZWV0SWQgKSB7XG4gICAgICAgICAgcmVzb3VyY2UuZGF0YXNoZWV0c1tpXSA9IHNoZWV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2hlY2tDaGFuZ2VzKCk7XG4gIH1cblxuICB0aGlzLmZpcmVVcGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBlZS5lbWl0KCd1cGRhdGUnKTtcbiAgfTtcblxuICB0aGlzLnBhY2thZ2Uub24oJ3NhdmUtZW5kJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNoZWNrQ2hhbmdlcygpO1xuICAgIHRoaXMuZmlyZVVwZGF0ZSgpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHRoaXMucGFja2FnZS5vbigndmFsdWUtc2V0LW9uLWNyZWF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5maXJlVXBkYXRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG5cbiAgLy8gYWZ0ZXIgYSByZXNvdXJjZSBpcyBhZGRlZCwgb3VyIGVudGlyZSBzdGF0ZSBpcyBkaWZmZXJlbnRcbiAgdGhpcy5ydW5BZnRlclJlc291cmNlQWRkID0gZnVuY3Rpb24od29ya3NwYWNlRGF0YSkge1xuICAgIHRoaXMucmVzdWx0ID0gd29ya3NwYWNlRGF0YTtcbiAgICB0aGlzLl9zZXREYXRhKCk7XG4gICAgdGhpcy5jaGVja0NoYW5nZXMoKTtcbiAgfTtcblxuXG4gIC8vIGdldCBhbGwgYXR0aXJidXRlcyBmcm9tIHNoZWV0cyBtYXJrZWQgYXMgZGF0YVxuICB0aGlzLmdldERhdGFzaGVldEF0dHJpYnV0ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXR0cnMgPSB7fSwgc2hlZXQsIGF0dHI7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YXNoZWV0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHNoZWV0ID0gdGhpcy5kYXRhc2hlZXRzW2ldO1xuICAgICAgaWYoIHNoZWV0Lm1ldGFkYXRhICkgY29udGludWU7XG5cbiAgICAgIGZvciggdmFyIGogPSAwOyBqIDwgc2hlZXQuYXR0cmlidXRlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgYXR0ciA9IHNoZWV0LmF0dHJpYnV0ZXNbal07XG4gICAgICAgIGF0dHJzW2F0dHJdID0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoYXR0cnMpO1xuICB9O1xuXG4gIHRoaXMuaXNFY29zaXNNZXRhZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9cXHMvZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgZm9yKCB2YXIga2V5IGluIHRoaXMubWV0YWRhdGFMb29rdXAgKSB7XG4gICAgICBpZiggdGhpcy5tZXRhZGF0YUxvb2t1cFtrZXldLmZsYXQgPT0gbmFtZSApIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgdGhpcy5nZXRTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgdmFyIHRvdGFsID0gNztcblxuICAgIHZhciBicmVha2Rvd24gPSB7XG4gICAgICBiYXNpYyA6IHtcbiAgICAgICAgc2NvcmUgOiAwLFxuICAgICAgICB0b3RhbCA6IDVcbiAgICAgIH0sXG4gICAgICBsaW5rZWQgOiB7XG4gICAgICAgIHNjb3JlIDogMCxcbiAgICAgICAgdG90YWwgOiAxXG4gICAgICB9LFxuICAgICAgbG9jYXRpb24gOiB7XG4gICAgICAgIHNjb3JlIDogMCxcbiAgICAgICAgdG90YWwgOiAxXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIGNoZWNrIGRhdGFzZXQgbGV2ZWwgZWNvc2lzIG1ldGFkYXRhXG4gICAgdmFyIGNhdCA9ICcnO1xuICAgIGZvciggdmFyIGtleSBpbiB0aGlzLm1ldGFkYXRhTG9va3VwICkge1xuICAgICAgY2F0ID0gdGhpcy5tZXRhZGF0YUxvb2t1cFtrZXldLmNhdGVnb3J5LnRvTG93ZXJDYXNlKCk7XG4gICAgICBrZXkgPSBrZXkucmVwbGFjZSgvIC9nLCAnJyk7XG5cbiAgICAgIGlmKCAhYnJlYWtkb3duW2NhdF0gKSB7XG4gICAgICAgIGJyZWFrZG93bltjYXRdID0ge1xuICAgICAgICAgIHNjb3JlIDogMCxcbiAgICAgICAgICB0b3RhbCA6IDBcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaWYoIGtleSA9PT0gJ0xhdGl0dWRlJyB8fCBrZXkgPT09ICdMb25naXR1ZGUnICkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdG9nZ2xlIHRvIGVuYWJsZVxuICAgICAgLy8gaWYoIGtleSA9PT0gJ05BU0FHQ01ES2V5d29yZHMnICkgY29udGludWU7XG5cbiAgICAgIGlmKCB0aGlzLnBhY2thZ2VbJ2dldCcra2V5XSApIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5wYWNrYWdlWydnZXQnK2tleV0oKTtcbiAgICAgICAgaWYoIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgY291bnQrKztcblxuICAgICAgICAgIGlmKCBrZXkgPT09ICdLZXl3b3JkcycgfHwga2V5ID09PSAnV2Vic2l0ZScgKSB7XG4gICAgICAgICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWtkb3duW2NhdF0uc2NvcmUrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdG90YWwrKztcbiAgICAgICAgaWYoIGtleSA9PT0gJ0tleXdvcmRzJyB8fCBrZXkgPT09ICdXZWJzaXRlJyApIHtcbiAgICAgICAgICBicmVha2Rvd24uYmFzaWMudG90YWwrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVha2Rvd25bY2F0XS50b3RhbCsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWYgd2UgaGF2ZSBlY29zaXMgZG9pLCBhZGQgdG8gQ2l0YXRpb24gc2NvcmVcbiAgICBpZiggdGhpcy5wYWNrYWdlLmdldERvaSgpLnZhbHVlICkge1xuICAgICAgY291bnQrKztcbiAgICAgIGJyZWFrZG93bi5jaXRhdGlvbi5zY29yZSsrO1xuICAgIH1cblxuXG4gICAgaWYoIHRoaXMucGFja2FnZS5nZXRUaXRsZSgpICkge1xuICAgICAgY291bnQrKztcbiAgICAgIGJyZWFrZG93bi5iYXNpYy5zY29yZSsrO1xuICAgIH1cbiAgICBpZiggdGhpcy5wYWNrYWdlLmdldERlc2NyaXB0aW9uKCkgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmJhc2ljLnNjb3JlKys7XG4gICAgfVxuICAgIGlmKCBPYmplY3Qua2V5cyh0aGlzLnBhY2thZ2UuZ2V0TGlua2VkRGF0YSgpKS5sZW5ndGggPiAwICkge1xuICAgICAgY291bnQrKztcbiAgICAgIGJyZWFrZG93bi5saW5rZWQuc2NvcmUrKztcbiAgICB9XG4gICAgaWYoIHRoaXMucGFja2FnZS5nZXRPcmdhbml6YXRpb24oKSApIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICB9XG4gICAgaWYoIHRoaXMucGFja2FnZS5nZXRWZXJzaW9uKCkgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmJhc2ljLnNjb3JlKys7XG4gICAgfVxuICAgIGlmKCB0aGlzLnBhY2thZ2UuZ2V0TGljZW5zZUlkKCkgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmJhc2ljLnNjb3JlKys7XG4gICAgfVxuICAgIGlmKCBPYmplY3Qua2V5cyh0aGlzLnBhY2thZ2UuZ2V0R2VvSnNvbigpKS5sZW5ndGggPiAwICkge1xuICAgICAgY291bnQrKztcbiAgICAgIGJyZWFrZG93bi5sb2NhdGlvbi5zY29yZSsrO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzY29yZTogY291bnQsXG4gICAgICB0b3RhbCA6IHRvdGFsLFxuICAgICAgYnJlYWtkb3duIDogYnJlYWtkb3duXG4gICAgfTtcbiAgfTtcbn07XG4iLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG52YXIgRGF0YXN0b3JlID0gcmVxdWlyZSgnLi9kYXRhc3RvcmUnKTtcbnZhciBDS0FOID0gcmVxdWlyZSgnLi9ja2FuJyk7XG52YXIgUGFja2FnZSA9IHJlcXVpcmUoJy4vcGFja2FnZScpO1xuXG5mdW5jdGlvbiBTREsoY29uZmlnKSB7XG4gIHRoaXMudXNlciA9IG51bGw7XG5cbiAgdGhpcy5kZWZhdWx0R3JvdXAgPSBjb25maWcuZGVmYXVsdEdyb3VwO1xuXG4gIHRoaXMubmV3UGFja2FnZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IFBhY2thZ2UoZGF0YSwgdGhpcyk7XG4gIH07XG5cbiAgdGhpcy5ja2FuID0gbmV3IENLQU4oe1xuICAgIGhvc3QgOiBjb25maWcuaG9zdCxcbiAgICBrZXkgOiBjb25maWcua2V5XG4gIH0pO1xuXG4gIHRoaXMuZHMgPSBuZXcgRGF0YXN0b3JlKHtcbiAgICBja2FuIDogdGhpcy5ja2FuLFxuICAgIHBhY2thZ2VfaWQgOiBjb25maWcucGFja2FnZV9pZCxcbiAgICBTREsgOiB0aGlzXG4gIH0pO1xuXG4gIC8vIHdpcmUgZXZlbnRzXG4gIHZhciBlZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgdGhpcy5vbiA9IGZ1bmN0aW9uKGUsIGZuKSB7XG4gICAgICAgZWUub24oZSwgZm4pO1xuICB9O1xuXG5cbiAgLy8gZ2V0IHRoZSB1c2VyIGFjY291bnRcbiAgdGhpcy5ja2FuLmdldEFjdGl2ZVVzZXIoZnVuY3Rpb24ocmVzcCl7XG4gICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICB0aGlzLnVzZXJMb2FkRXJyb3IgPSB0cnVlO1xuICAgIH1cblxuXG4gICAgdGhpcy51c2VyID0gcmVzcDtcbiAgICBlZS5lbWl0KCd1c2VyLWxvYWQnKTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICByZXF1aXJlKCcuL2xvZ2ljJykodGhpcyk7XG5cbiAgaWYoIGNvbmZpZy5wYWNrYWdlX2lkICkgdGhpcy5kcy5sb2FkKCk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNESztcbiIsInZhciBTREs7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2RrKSB7XG4gIFNESyA9IHNkaztcbiAgU0RLLmNyZWF0ZVBhY2thZ2UgPSBjcmVhdGVQYWNrYWdlO1xufTtcblxuZnVuY3Rpb24gY3JlYXRlUGFja2FnZShkYXRhLCBjYWxsYmFjaykge1xuXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFNESykge1xuICByZXF1aXJlKCcuL2NyZWF0ZVBhY2thZ2UnKShTREspO1xuICByZXF1aXJlKCcuL3ZlcmlmeScpKFNESyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihTREspIHtcbiAgU0RLLnZlcmlmeSA9IHtcbiAgICBuYW1lIDogcmVxdWlyZSgnLi9uYW1lJykoU0RLKVxuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU0RLKSB7XG4gIHJldHVybiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaykge1xuXG4gICAgU0RLLmNrYW4uZ2V0UGFja2FnZShuYW1lLCBmdW5jdGlvbihyZXNwKXtcbiAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2sodHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKGZhbHNlKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9O1xufTtcbiIsIi8vIGF0dHJpYnV0ZXMgdGhhdCBoYXZlIGEgZGlyZWN0IG1hcHBpbmcgdG8gQ0tBTiBzdGFuZGFyZCBhdHRyaWJ1dGVzLFxuLy8gc28gdGhleSBzaG91bGQgbm90IGJlIHdyYXBwZWQgdXAgaW4gdGhlICdleHRyYXMnIGZpZWxkcy4gIElFLCB1c2Vcbi8vIHRoZXNlIGZ1bmN0aW9ucy5cbnZhciBja2FuQXR0cml1dGVzID0gWydLZXl3b3JkcycsICdXZWJzaXRlJywgJ0F1dGhvcicsICdBdXRob3IgRW1haWwnLFxuJ01haW50YWluZXIgRW1haWwnLCAnTWFpbnRhaW5lciddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGF0dHJpYnV0ZSwgUGFja2FnZSkge1xuICBpZiggYXR0cmlidXRlLm5hbWUgPT09ICdLZXl3b3JkcycgfHwgYXR0cmlidXRlLm5hbWUgPT09ICdXZWJzaXRlJyApIHJldHVybjtcblxuICBpZiggYXR0cmlidXRlLmlucHV0ID09PSAnY29udHJvbGxlZCcgKSB7XG4gICAgY3JlYXRlQ29udHJvbGxlZElucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSk7XG4gIH0gZWxzZSBpZiggYXR0cmlidXRlLmlucHV0ID09PSAnc3BsaXQtdGV4dCcgKSB7XG4gICAgY3JlYXRlQ29udHJvbGxlZElucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSk7XG4gIH0gZWxzZSBpZiggYXR0cmlidXRlLmlucHV0ID09PSAnY29udHJvbGxlZC1zaW5nbGUnICkge1xuICAgIGNyZWF0ZVNpbmdsZUlucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSk7XG4gIH0gZWxzZSBpZiggYXR0cmlidXRlLmlucHV0ID09PSAndGV4dCcgfHwgYXR0cmlidXRlLmlucHV0ID09PSAnbGF0bG5nJyApIHtcbiAgICBjcmVhdGVJbnB1dChhdHRyaWJ1dGUsIFBhY2thZ2UpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVJbnB1dChhdHRyaWJ1dGUsIFBhY2thZ2UpIHtcbiAgdmFyIG5hbWUgPSBhdHRyaWJ1dGUubmFtZS5yZXBsYWNlKC8gL2csICcnKTtcblxuICBQYWNrYWdlLnByb3RvdHlwZVsnZ2V0JytuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKTtcbiAgfTtcblxuICBQYWNrYWdlLnByb3RvdHlwZVsnc2V0JytuYW1lXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgdmFsdWUrJycpO1xuICAgIHRoaXMuX29uVXBkYXRlKGF0dHJpYnV0ZS5uYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2luZ2xlSW5wdXQoYXR0cmlidXRlLCBQYWNrYWdlKSB7XG4gIHZhciBuYW1lID0gYXR0cmlidXRlLm5hbWUucmVwbGFjZSgvIC9nLCAnJyk7XG5cbiAgUGFja2FnZS5wcm90b3R5cGVbJ2dldCcrbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFeHRyYShhdHRyaWJ1dGUubmFtZSk7XG4gIH07XG5cbiAgUGFja2FnZS5wcm90b3R5cGVbJ3NldCcrbmFtZV0gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB0ID0gdG9rZW5pemUodmFsdWUpO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBhdHRyaWJ1dGUudm9jYWJ1bGFyeS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0b2tlbml6ZShhdHRyaWJ1dGUudm9jYWJ1bGFyeVtpXSkgPT09IHQgKSB7XG4gICAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsIGF0dHJpYnV0ZS52b2NhYnVsYXJ5W2ldKTtcbiAgICAgICAgdGhpcy5fb25VcGRhdGUoYXR0cmlidXRlLm5hbWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGF0dHJpYnV0ZS5hbGxvd090aGVyICkge1xuICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgJ090aGVyJyk7XG4gICAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKycgT3RoZXInLCB2YWx1ZSk7XG4gICAgICB0aGlzLl9vblVwZGF0ZShhdHRyaWJ1dGUubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsICcnKTtcbiAgICB9XG4gIH07XG5cbiAgaWYoIGF0dHJpYnV0ZS5hbGxvd090aGVyICkge1xuICAgIFBhY2thZ2UucHJvdG90eXBlWydnZXQnK25hbWUrJ090aGVyJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKycgT3RoZXInKTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRyb2xsZWRJbnB1dChhdHRyaWJ1dGUsIFBhY2thZ2UpIHtcbiAgdmFyIG5hbWUgPSBhdHRyaWJ1dGUubmFtZS5yZXBsYWNlKC8gL2csICcnKTtcblxuICBQYWNrYWdlLnByb3RvdHlwZVsnZ2V0JytuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhdHRyID0gdGhpcy5nZXRFeHRyYShhdHRyaWJ1dGUubmFtZSk7XG4gICAgaWYoICFhdHRyICkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhdHRyLnNwbGl0KCcsJykubWFwKGNsZWFuVGVybSk7XG4gIH07XG5cbiAgaWYoIGF0dHJpYnV0ZS5hbGxvd090aGVyICkge1xuICAgIFBhY2thZ2UucHJvdG90eXBlWydnZXQnK25hbWUrJ090aGVyJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhdHRyID0gdGhpcy5nZXRFeHRyYShhdHRyaWJ1dGUubmFtZSsnIE90aGVyJyk7XG4gICAgICBpZiggIWF0dHIgKSByZXR1cm4gW107XG4gICAgICByZXR1cm4gYXR0ci5zcGxpdCgnLCcpLm1hcChjbGVhblRlcm0pO1xuICAgIH07XG4gIH1cblxuICBQYWNrYWdlLnByb3RvdHlwZVsnc2V0JytuYW1lXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYoICF2YWx1ZSApIHtcbiAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsIG51bGwpO1xuICAgICAgaWYoIGF0dHJpYnV0ZS5hbGxvd090aGVyICkge1xuICAgICAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKycgT3RoZXInLCBudWxsKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fb25VcGRhdGUoYXR0cmlidXRlLm5hbWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0ZXJtcztcbiAgICBpZiggIUFycmF5LmlzQXJyYXkodmFsdWUpICkge1xuICAgICAgdmFsdWUgPSB2YWx1ZSsnJztcbiAgICAgIHRlcm1zID0gdmFsdWUuc3BsaXQoJywnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGVybXMgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICB0ZXJtcyA9IHRlcm1zLm1hcChjbGVhblRlcm0pO1xuXG4gICAgaWYoIGF0dHJpYnV0ZS5pbnB1dCA9PT0gJ2NvbnRyb2xsZWQnICkge1xuICAgICAgdmFyIHZhbHVlcyA9IGdldFZhbHVlcyh0ZXJtcywgYXR0cmlidXRlLnZvY2FidWxhcnkpO1xuXG4gICAgICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgJiYgdmFsdWVzLm90aGVyLmxlbmd0aCA+IDAgJiYgdmFsdWVzLnZhbGlkLmluZGV4T2YoJ090aGVyJykgPT0gLTEgKSB7XG4gICAgICAgIHZhbHVlcy52YWxpZC5wdXNoKCdPdGhlcicpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lLCB2YWx1ZXMudmFsaWQuam9pbignLCAnKSk7XG4gICAgICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgKSB7XG4gICAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUrJyBPdGhlcicsIHZhbHVlcy5vdGhlci5qb2luKCcsICcpKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiggYXR0cmlidXRlLmlucHV0ID09PSAnc3BsaXQtdGV4dCcgKSB7XG4gICAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lLCB0ZXJtcy5qb2luKCcsICcpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vblVwZGF0ZShhdHRyaWJ1dGUubmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsZWFuVGVybSh0eHQpIHtcbiAgcmV0dXJuIHR4dC50cmltKCk7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlcyh0ZXJtcywgdm9jYWJ1bGFyeSkge1xuICB2YXIgdmFsaWQgPSBbXTtcbiAgdmFyIG90aGVyID0gW107XG5cbiAgdmFyIG1hcCA9IHt9O1xuICB2b2NhYnVsYXJ5LmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG4gICAgbWFwW3Rva2VuaXplKG5hbWUpXSA9IG5hbWU7XG4gIH0pO1xuXG4gIHZhciB0O1xuICBmb3IoIHZhciBpID0gMDsgaSA8IHRlcm1zLmxlbmd0aDsgaSsrICkge1xuICAgIHQgPSB0b2tlbml6ZSh0ZXJtc1tpXSk7XG5cbiAgICBpZiggbWFwW3RdICkge1xuICAgICAgaWYoIHZhbGlkLmluZGV4T2YobWFwW3RdKSA9PT0gLTEgKSB7XG4gICAgICAgIHZhbGlkLnB1c2gobWFwW3RdKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIG90aGVyLmluZGV4T2YobWFwW3RdKSA9PT0gLTEgKSB7XG4gICAgICAgIG90aGVyLnB1c2godGVybXNbaV0udHJpbSgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHZhbGlkIDogdmFsaWQsXG4gICAgb3RoZXIgOiBvdGhlclxuICB9O1xufVxuXG5mdW5jdGlvbiB0b2tlbml6ZShuYW1lKSB7XG4gIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzL2csICcnKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oUGFja2FnZSl7XG4gIFBhY2thZ2UucHJvdG90eXBlLmNyZWF0ZSA9IGNyZWF0ZTtcbiAgUGFja2FnZS5wcm90b3R5cGUuZGVsZXRlID0gZGVsZXRlRm47XG4gIFBhY2thZ2UucHJvdG90eXBlLnNhdmUgPSBzYXZlO1xufTtcblxuXG5mdW5jdGlvbiBkZWxldGVGbihjYWxsYmFjaykge1xuICB0aGlzLlNESy5ja2FuLmRlbGV0ZVBhY2thZ2UodGhpcy5kYXRhLmlkLCBmdW5jdGlvbihyZXNwKSB7XG4gICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAvLyBFUlJPUiA1XG4gICAgICByZXNwLmNvZGUgPSA1O1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3ApO1xuICAgIH1cblxuICAgIGNhbGxiYWNrKHtzdWNjZXNzOiB0cnVlfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGUoY2FsbGJhY2spIHtcbiAgdGhpcy5TREsuY2thbi5jcmVhdGVQYWNrYWdlKHRoaXMuZGF0YSwgZnVuY3Rpb24ocmVzcCkge1xuICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgIC8vIEVSUk9SIDZcbiAgICAgICAgcmVzcC5jb2RlID0gNjtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgfVxuXG4gICAgICBpZiggIXJlc3AuaWQgKSB7XG4gICAgICAgIC8vIEVSUk9SIDdcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgICAgICBlcnJvciA6IHRydWUsXG4gICAgICAgICAgbWVzc2FnZSA6ICdGYWlsZWQgdG8gY3JlYXRlIGRhdGFzZXQnLFxuICAgICAgICAgIGNvZGUgOiA3XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayhyZXNwKTtcbiAgICB9LmJpbmQodGhpcylcbiAgKTtcbn1cblxudmFyIHNhdmVUaW1lciA9IC0xO1xuZnVuY3Rpb24gc2F2ZShjYWxsYmFjaykge1xuICB0aGlzLmVlLmVtaXQoJ3NhdmUtc3RhcnQnKTtcblxuICBpZiggc2F2ZVRpbWVyICE9PSAtMSApIHtcbiAgICBjbGVhclRpbWVvdXQoc2F2ZVRpbWVyKTtcbiAgfVxuXG4gIHNhdmVUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICBzYXZlVGltZXIgPSAtMTtcbiAgICBfc2F2ZSh0aGlzLCBjYWxsYmFjayk7XG4gIH0uYmluZCh0aGlzKSwgNTAwKTtcbn1cblxuZnVuY3Rpb24gX3NhdmUocmVmLCBjYWxsYmFjaykge1xuICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSB0aGUgY29ycmVjdCBwYWNrYWdlIHN0YXRlXG4gIC8vIGFsbCByZXNvdXJjZXMgbmVlZCB0byBiZSBpbmNsdWRlZCB3aGVuIHlvdSBtYWtlIGEgdXBkYXRlUGFja2FnZSBjYWxsXG4gIHJlZi5TREsuY2thbi5nZXRQYWNrYWdlKHJlZi5kYXRhLmlkLCBmdW5jdGlvbihyZXNwKSB7XG4gICAgICBpZiggcmVzcC5lcnJvciApIHtcbiAgICAgICAgcmVzcC5jb2RlID0gODtcbiAgICAgICAgcmVzcC5tZXNzYWdlICs9ICcuIEZhaWxlZCB0byBmZXRjaCBwYWNrYWdlIGZvciB1cGRhdGUuJztcbiAgICAgICAgcmVmLmVlLmVtaXQoJ3NhdmUtZW5kJywgcmVzcCk7XG4gICAgICAgIGlmKCBjYWxsYmFjayApIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBtZXRhZGF0YSA9IHJlc3A7XG4gICAgICBmb3IoIHZhciBrZXkgaW4gcmVmLmRhdGEgKSB7XG4gICAgICAgIG1ldGFkYXRhW2tleV0gPSByZWYuZGF0YVtrZXldO1xuICAgICAgfVxuXG4gICAgICByZWYuU0RLLmNrYW4udXBkYXRlUGFja2FnZShtZXRhZGF0YSxcbiAgICAgICAgZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICAgICAgLy8gRVJST1IgOVxuICAgICAgICAgICAgcmVzcC5jb2RlID0gOTtcbiAgICAgICAgICAgIHJlc3AubWVzc2FnZSArPSAnLiBGYWlsZWQgdG8gdXBkYXRlIGRhdGFzZXQuJztcbiAgICAgICAgICAgIHJlZi5lZS5lbWl0KCdzYXZlLWVuZCcsIHJlc3ApO1xuICAgICAgICAgICAgaWYoIGNhbGxiYWNrICkgY2FsbGJhY2socmVzcCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoICFyZXNwLmlkICkgIHtcbiAgICAgICAgICAgIHZhciBtc2cgPSB7XG4gICAgICAgICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICBtZXNzYWdlIDogJ0ZhaWxlZCB0byB1cGRhdGUgZGF0YXNldCcsXG4gICAgICAgICAgICAgIGNvZGUgOiAxMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlZi5lZS5lbWl0KCdzYXZlLWVuZCcsIG1zZyk7XG4gICAgICAgICAgICAvLyBFUlJPUiAxMFxuICAgICAgICAgICAgaWYoIGNhbGxiYWNrICkgY2FsbGJhY2sobXNnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZWYuZGF0YSA9IHJlc3A7XG5cbiAgICAgICAgICBpZiggY2FsbGJhY2sgKSBjYWxsYmFjayh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgIHJlZi5lZS5lbWl0KCdzYXZlLWVuZCcsIHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICApO1xufVxuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2V4dGVuZCcpO1xudmFyIHNjaGVtYSA9IHJlcXVpcmUoJy4uL3NjaGVtYScpO1xudmFyIGNyZWF0ZVNjaGVtYU1ldGhvZHMgPSByZXF1aXJlKCcuL2NyZWF0ZVNjaGVtYU1ldGhvZHMnKTtcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUnKTtcbnZhciBjcnVkID0gcmVxdWlyZSgnLi9jcnVkJyk7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5cblxudmFyIGlnbm9yZSA9IFsnU3BlY2llcycsICdEYXRlJ107XG5cbmZ1bmN0aW9uIFBhY2thZ2UoaW5pdGRhdGEsIFNESykge1xuXG4gIHRoaXMucmVzZXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYoIGRhdGEgKSB7XG4gICAgICB0aGlzLmRhdGEgPSBleHRlbmQodHJ1ZSwge30sIGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRhdGEgPSB7XG4gICAgICAgIGlkIDogJycsXG4gICAgICAgIHRpdGxlIDogJycsXG4gICAgICAgIG5hbWUgOiAnJyxcbiAgICAgICAgbm90ZXMgOiAnJyxcbiAgICAgICAgYXV0aG9yIDogJycsXG4gICAgICAgIGF1dGhvcl9lbWFpbCA6ICcnLFxuICAgICAgICBsaWNlbnNlX2lkIDogJycsXG4gICAgICAgIGxpY2Vuc2VfdGl0bGUgOiAnJyxcbiAgICAgICAgbWFpbnRhaW5lciA6ICcnLFxuICAgICAgICBtYWludGFpbmVyX2VtYWlsIDogJycsXG4gICAgICAgIHZlcnNpb24gOiAnJyxcbiAgICAgICAgb3duZXJfb3JnIDogJycsXG4gICAgICAgIHRhZ3MgOiBbXSxcbiAgICAgICAgcHJpdmF0ZSA6IGZhbHNlLFxuICAgICAgICBleHRyYXMgOiBbXVxuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy5yZXNldChpbml0ZGF0YSk7XG5cbiAgdGhpcy5lZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBpZiggIVNESyApIHtcbiAgICB0aHJvdyhuZXcgRXJyb3IoJ05vIFNESyBwcm92aWRlZCcpKTtcbiAgfVxuICB0aGlzLlNESyA9IFNESztcblxuICB0aGlzLm9uID0gZnVuY3Rpb24oZXZlbnQsIGZuKSB7XG4gICAgdGhpcy5lZS5vbihldmVudCwgZm4pO1xuICB9O1xuXG4gIHRoaXMuX29uVXBkYXRlID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHRoaXMuZWUuZW1pdCgndXBkYXRlJywge2F0dHJpYnV0ZTogbmFtZX0pO1xuXG4gICAgaWYoIHRoaXMubW9kZSAhPT0gJ2NyZWF0ZScgKSB7XG4gICAgICB0aGlzLnNhdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lZS5lbWl0KCd2YWx1ZS1zZXQtb24tY3JlYXRlJywge30pO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmdldElkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5pZCB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldFRpdGxlID0gZnVuY3Rpb24odGl0bGUsIGNhbGxiYWNrKSB7XG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9fL2csICcgJykudHJpbSgpO1xuXG4gICAgaWYoIHRpdGxlLmxlbmd0aCA+PSAxMDAgKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soe2Vycm9yOiB0cnVlLCBtZXNzYWdlOiAnSW52YWxpZCBuYW1lLiAgVGl0bGUgY2FuIGhhdmUgYXQgbW9zdCAxMDAgY2hhcmFjdGVycy4nfSk7XG4gICAgfVxuXG4gICAgaWYoIHRpdGxlLmxlbmd0aCA8PSA1ICkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjogdHJ1ZSwgbWVzc2FnZTogJ0ludmFsaWQgbmFtZS4gIFRpdGxlIG11c3QgaGF2ZSBhdCBsZWFzdCA1IGNoYXJhY3RlcnMuJ30pO1xuICAgIH1cblxuICAgIHZhciBuYW1lID0gdGl0bGUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0vZywnLScpO1xuXG4gICAgaWYoIHRoaXMuZGF0YS5uYW1lID09PSBuYW1lICkge1xuICAgICAgdGhpcy5kYXRhLnRpdGxlID0gdGl0bGU7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwge3RpdGxlOiB0aXRsZSwgbmFtZTogbmFtZX0pO1xuICAgIH1cblxuICAgIFNESy52ZXJpZnkubmFtZShuYW1lLCBmdW5jdGlvbih2YWxpZCkge1xuICAgICAgaWYoICF2YWxpZCApIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjogdHJ1ZSwgbWVzc2FnZTogJ0ludmFsaWQgbmFtZS4gIEEgZGF0YXNldCB3aXRoIHRoZSBuYW1lIFwiJytuYW1lKydcIiBhbHJlYWR5IGV4aXN0cyd9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kYXRhLnRpdGxlID0gdGl0bGU7XG4gICAgICB0aGlzLmRhdGEubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLl9vblVwZGF0ZSgnVGl0bGUnKTtcblxuICAgICAgY2FsbGJhY2sobnVsbCwge3RpdGxlOiB0aXRsZSwgbmFtZTogbmFtZX0pO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgdGhpcy5nZXROYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5uYW1lIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuZ2V0VGl0bGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnRpdGxlIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0RGVzY3JpcHRpb24gPSBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xuICAgIHRoaXMuZGF0YS5ub3RlcyA9IGRlc2NyaXB0aW9uO1xuICAgIHRoaXMuX29uVXBkYXRlKCdEZXNjcmlwdGlvbicpO1xuICB9O1xuXG4gIHRoaXMuZ2V0RGVzY3JpcHRpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLm5vdGVzIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuZ2V0S2V5d29yZHMgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmRhdGEudGFncyB8fCBbXTtcbiAgfTtcblxuICB0aGlzLnNldEtleXdvcmRzID0gZnVuY3Rpb24oa2V5d29yZHMpIHtcbiAgICBpZiggdHlwZW9mIGtleXdvcmRzID09PSAnc3RyaW5nJyApIHtcbiAgICAgIGtleXdvcmRzID0ga2V5d29yZHMuc3BsaXQoJywnKTtcbiAgICB9XG5cbiAgICBpZiggIUFycmF5LmlzQXJyYXkoa2V5d29yZHMpICkge1xuICAgICAgdGhyb3cobmV3IEVycm9yKCdLZXl3b3JkcyBtdXN0IGJ5IG9mIHR5cGUgc3RyaW5nIG9yIGFycmF5JykpO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YS50YWdzID0gW107XG4gICAga2V5d29yZHMuZm9yRWFjaCh0aGlzLmFkZEtleXdvcmQuYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgdGhpcy5hZGRLZXl3b3JkID0gZnVuY3Rpb24oa2V5d29yZCkge1xuICAgIGlmKCB0eXBlb2Yga2V5d29yZCA9PT0gJ29iamVjdCcgKSB7XG4gICAgICBrZXl3b3JkID0ga2V5d29yZC5uYW1lO1xuXG4gICAgfVxuXG4gICAga2V5d29yZCA9IGNsZWFuS2V5d29yZChrZXl3b3JkKycnKTtcblxuICAgIGlmKCBrZXl3b3JkLmxlbmd0aCA8IDIgKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmKCB0aGlzLmhhc0tleXdvcmQoa2V5d29yZCkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoICF0aGlzLmRhdGEudGFncyApIHtcbiAgICAgIHRoaXMuZGF0YS50YWdzID0gW107XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhLnRhZ3MucHVzaCh7XG4gICAgICBkaXNwbGF5X25hbWUgOiBrZXl3b3JkLFxuICAgICAgbmFtZSA6IGtleXdvcmRcbiAgICB9KTtcblxuICAgIHRoaXMuX29uVXBkYXRlKCdLZXl3b3JkcycpO1xuICB9O1xuXG4gIHRoaXMucmVtb3ZlS2V5d29yZCA9IGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICBpZiggIXRoaXMuZGF0YS50YWdzICkgcmV0dXJuO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEudGFncy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmRhdGEudGFnc1tpXS5uYW1lID09PSBrZXl3b3JkICkge1xuICAgICAgICB0aGlzLmRhdGEudGFncy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX29uVXBkYXRlKCdLZXl3b3JkcycpO1xuICB9O1xuXG4gIHRoaXMuaGFzS2V5d29yZCA9IGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICBpZiggIXRoaXMuZGF0YS50YWdzICkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLnRhZ3MubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5kYXRhLnRhZ3NbaV0ubmFtZSA9PT0ga2V5d29yZCApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIGNsZWFuS2V5d29yZCh0eHQpIHtcbiAgICByZXR1cm4gdHh0LnJlcGxhY2UoL1teQS1aYS16MC05LV8gXS9nLCAnJykudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gIH1cblxuICB0aGlzLnNldExpY2Vuc2UgPSBmdW5jdGlvbihpZCwgdGl0bGUpIHtcbiAgICB0aGlzLmRhdGEubGljZW5zZV9pZCA9IGlkO1xuICAgIHRoaXMuZGF0YS5saWNlbnNlX3RpdGxlID0gdGl0bGU7XG4gICAgdGhpcy5fb25VcGRhdGUoJ0xpY2Vuc2UnKTtcbiAgfTtcblxuICB0aGlzLmdldExpY2Vuc2VJZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEubGljZW5zZV9pZCB8fCAnJztcbiAgfTtcblxuICB0aGlzLmdldExpY2Vuc2VUaXRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEubGljZW5zZV90aXRsZSB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldE9yZ2FuaXphdGlvbiA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjaykge1xuICAgIGlmKCAhaWQgKSB7XG4gICAgICB0aGlzLmRhdGEub3duZXJfb3JnID0gJyc7XG4gICAgICBpZiggY2FsbGJhY2sgKSB7XG4gICAgICAgIGNhbGxiYWNrKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgU0RLLmNrYW4uZ2V0T3JnYW5pemF0aW9uKGlkLCBmdW5jdGlvbihyZXNwKXtcbiAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICBpZiggY2FsbGJhY2sgKSBjYWxsYmFjayhyZXNwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRhdGEub3duZXJfb3JnID0gcmVzcC5pZDtcbiAgICAgIHRoaXMuX29uVXBkYXRlKCdPcmdhbml6YXRpb24nKTtcblxuICAgICAgaWYoIGNhbGxiYWNrICkge1xuICAgICAgICBjYWxsYmFjayh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgdGhpcy5nZXRPcmdhbml6YXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLm93bmVyX29yZyB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldFZlcnNpb24gPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gICAgdGhpcy5kYXRhLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgIHRoaXMuX29uVXBkYXRlKCdWZXJzaW9uJyk7XG4gIH07XG5cbiAgdGhpcy5nZXRWZXJzaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS52ZXJzaW9uIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0V2Vic2l0ZSA9IGZ1bmN0aW9uKHdlYnNpdGUpIHtcbiAgICB0aGlzLnNldEV4dHJhKCdXZWJzaXRlJywgd2Vic2l0ZSk7XG4gICAgdGhpcy5fb25VcGRhdGUoJ1dlYnNpdGUnKTtcbiAgfTtcblxuICB0aGlzLmdldFdlYnNpdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFeHRyYSgnV2Vic2l0ZScpO1xuICB9O1xuXG4gIHRoaXMuc2V0QXV0aG9yID0gZnVuY3Rpb24oYXV0aG9yKSB7XG4gICAgdGhpcy5kYXRhLmF1dGhvciA9IGF1dGhvcjtcbiAgICB0aGlzLl9vblVwZGF0ZSgnQXV0aG9yJyk7XG4gIH07XG5cbiAgdGhpcy5nZXRBdXRob3IgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmF1dGhvciB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldEF1dGhvckVtYWlsID0gZnVuY3Rpb24oYXV0aG9yX2VtYWlsKSB7XG4gICAgdGhpcy5kYXRhLmF1dGhvcl9lbWFpbCA9IGF1dGhvcl9lbWFpbDtcbiAgICB0aGlzLl9vblVwZGF0ZSgnQXV0aG9yRW1haWwnKTtcbiAgfTtcblxuICB0aGlzLmdldEF1dGhvckVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5hdXRob3JfZW1haWwgfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5zZXRNYWludGFpbmVyID0gZnVuY3Rpb24obWFpbnRhaW5lcikge1xuICAgIHRoaXMuZGF0YS5tYWludGFpbmVyID0gbWFpbnRhaW5lcjtcbiAgICB0aGlzLl9vblVwZGF0ZSgnTWFpbnRhaW5lcicpO1xuICB9O1xuXG4gIHRoaXMuZ2V0TWFpbnRhaW5lciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEubWFpbnRhaW5lciB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldE1haW50YWluZXJFbWFpbCA9IGZ1bmN0aW9uKG1haW50YWluZXJfZW1haWwpIHtcbiAgICB0aGlzLmRhdGEubWFpbnRhaW5lcl9lbWFpbCA9IG1haW50YWluZXJfZW1haWw7XG4gICAgdGhpcy5fb25VcGRhdGUoJ01haW50YWluZXJFbWFpbCcpO1xuICB9O1xuXG4gIHRoaXMuZ2V0TWFpbnRhaW5lckVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5tYWludGFpbmVyX2VtYWlsIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0UHJpdmF0ZSA9IGZ1bmN0aW9uKHByaXZhdGUpIHtcbiAgICBpZiggdGhpcy5kYXRhLnByaXZhdGUgPT09IHByaXZhdGUgKSByZXR1cm47XG4gICAgdGhpcy5kYXRhLnByaXZhdGUgPSBwcml2YXRlO1xuICAgIHRoaXMuX29uVXBkYXRlKCdQcml2YXRlJyk7XG4gIH07XG5cbiAgdGhpcy5pc1ByaXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnByaXZhdGUgPyB0cnVlIDogZmFsc2U7XG4gIH07XG5cbiAgdGhpcy5zZXRMaW5rZWREYXRhID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBuZXdEYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgdmFyIG9sZERhdGEgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmdldExpbmtlZERhdGEoKSk7XG5cbiAgICBpZiggbmV3RGF0YSA9PT0gb2xkRGF0YSApIHJldHVybjtcblxuICAgIHRoaXMuc2V0RXh0cmEoJ0xpbmtlZERhdGEnLCBuZXdEYXRhKTtcblxuICAgIHRoaXMuZWUuZW1pdCgndXBkYXRlJywge2F0dHJpYnV0ZTogbmFtZX0pO1xuXG4gICAgaWYoIHRoaXMubW9kZSAhPT0gJ2NyZWF0ZScgKSB7XG4gICAgICB0aGlzLlNESy5ja2FuLnVwZGF0ZUxpbmtlZFJlc291cmNlcyh0aGlzLmRhdGEuaWQsIGRhdGEsIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lZS5lbWl0KCd2YWx1ZS1zZXQtb24tY3JlYXRlJywge30pO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmdldExpbmtlZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldEV4dHJhKCdMaW5rZWREYXRhJyk7XG4gICAgaWYoICF2YWx1ZSApIHJldHVybiBbXTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgcmV0dXJuIFtdO1xuICB9O1xuXG4gIHRoaXMucmVxdWVzdERvaSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkb2kgPSB0aGlzLmdldERvaSgpO1xuXG4gICAgaWYoIGRvaS5zdGF0dXMudmFsdWUgIT09ICdQZW5kaW5nIFJldmlzaW9uJyAmJiBkb2kuc3RhdHVzLnZhbHVlICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuc2V0RXh0cmEoJ0Vjb1NJUyBET0kgU3RhdHVzJywgSlNPTi5zdHJpbmdpZnkoe3ZhbHVlOidQZW5kaW5nIEFwcHJvdmFsJ30pKTtcbiAgICB0aGlzLl9vblVwZGF0ZSgnRWNvU0lTIERPSSBTdGF0dXMnKTtcbiAgICBcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgXG4gIHRoaXMuY2FuY2VsRG9pUmVxdWVzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkb2kgPSB0aGlzLmdldERvaSgpO1xuXG4gICAgaWYoIGRvaS5zdGF0dXMudmFsdWUgIT09ICdQZW5kaW5nIFJldmlzaW9uJyAmJiBkb2kuc3RhdHVzLnZhbHVlICE9PSAnUGVuZGluZyBBcHByb3ZhbCcgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRFeHRyYSgnRWNvU0lTIERPSSBTdGF0dXMnLCBKU09OLnN0cmluZ2lmeSh7fSkpO1xuICAgIHRoaXMuX29uVXBkYXRlKCdFY29TSVMgRE9JIFN0YXR1cycpO1xuICAgIFxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIHRoaXMuZ2V0RG9pID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuZ2V0RXh0cmEoJ0Vjb1NJUyBET0kgU3RhdHVzJyk7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5nZXRFeHRyYSgnRWNvU0lTIERPSScpO1xuICAgIFxuICAgIGlmKCBzdGF0dXMgJiYgc3RhdHVzLmxlbmd0aCA+IDAgKSB7XG4gICAgICBzdGF0dXMgPSBKU09OLnBhcnNlKHN0YXR1cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXR1cyA9IHt9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXMgOiBzdGF0dXMsXG4gICAgICB2YWx1ZSA6IHZhbHVlXG4gICAgfTtcbiAgfTtcblxuICB0aGlzLnNldFNvcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zZXRFeHRyYSgnc29ydCcsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB0aGlzLl9vblVwZGF0ZSgnc29ydCcpO1xuICB9O1xuXG4gIHRoaXMuZ2V0U29ydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0RXh0cmEoJ3NvcnQnKTtcbiAgICBpZiggIXZhbHVlICkgcmV0dXJuIFtdO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4ge307XG4gIH07XG5cbiAgdGhpcy5zZXRBbGlhc2VzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHRoaXMuc2V0RXh0cmEoJ2FsaWFzZXMnLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgdGhpcy5fb25VcGRhdGUoJ2FsaWFzZXMnKTtcbiAgfTtcblxuICB0aGlzLmdldEFsaWFzZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldEV4dHJhKCdhbGlhc2VzJyk7XG4gICAgaWYoICF2YWx1ZSApIHJldHVybiB7fTtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgdCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgLy8gaGFja1xuICAgICAgaWYoIEFycmF5LmlzQXJyYXkodCkgKSByZXR1cm4ge307XG4gICAgICByZXR1cm4gdDtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4ge307XG4gIH07XG5cbiAgdGhpcy5zZXRHZW9Kc29uID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmKCAhZGF0YSApIHtcbiAgICAgIHRoaXMuc2V0RXh0cmEoJ2dlb2pzb24nLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0RXh0cmEoJ2dlb2pzb24nLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fb25VcGRhdGUoJ2dlb2pzb24nKTtcbiAgfTtcblxuICB0aGlzLmdldEdlb0pzb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldEV4dHJhKCdnZW9qc29uJyk7XG4gICAgaWYoICF2YWx1ZSApIHJldHVybiB7fTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgcmV0dXJuIHt9O1xuICB9O1xuXG4gIHRoaXMuYWRkUmVzb3VyY2UgPSBmdW5jdGlvbihmaWxlLCBjYWxsYmFjaywgcHJvZ3Jlc3MpIHtcbiAgICBmdW5jdGlvbiBuZXh0KHJlc3ApIHtcbiAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICBTREsuY2thbi5wcm9jZXNzUmVzb3VyY2UoXG4gICAgICAgIHRoaXMuZGF0YS5pZCxcbiAgICAgICAgW3Jlc3AuaWRdLFxuICAgICAgICBudWxsLFxuICAgICAgICB7bGF5b3V0OiAnY29sdW1uJ30sXG4gICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGdldCBuZXcgd29ya3NwYWNlIHN0YXRlXG4gICAgICAgICAgLy8gVE9ETzogcHJvbHkgYSBiZXR0ZXIgd2F5IFRPRE8gdGhpcy5cbiAgICAgICAgICBTREsuY2thbi5nZXRXb3Jrc3BhY2UodGhpcy5kYXRhLmlkLCBmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAgICAgaWYoIHJlc3VsdC5lcnJvciApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBTREsuZHMucnVuQWZ0ZXJSZXNvdXJjZUFkZChyZXN1bHQpO1xuXG4gICAgICAgICAgICBjYWxsYmFjayh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgU0RLLmNrYW4uYWRkUmVzb3VyY2UodGhpcy5kYXRhLmlkLCBmaWxlLCBuZXh0LmJpbmQodGhpcyksIHByb2dyZXNzKTtcbiAgfTtcblxuICB0aGlzLmdldEV4dHJhID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYoICF0aGlzLmRhdGEuZXh0cmFzICkgcmV0dXJuICcnO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEuZXh0cmFzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YS5leHRyYXNbaV0ua2V5ID09PSBrZXkgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuZXh0cmFzW2ldLnZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfTtcblxuICB0aGlzLnNldEV4dHJhID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIGlmKCAhdGhpcy5kYXRhLmV4dHJhcyApIHRoaXMuZGF0YS5leHRyYXMgPSBbXTtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmV4dHJhcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmRhdGEuZXh0cmFzW2ldLmtleSA9PSBrZXkgKSB7XG4gICAgICAgIGlmKCB2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICB0aGlzLmRhdGEuZXh0cmFzLnNwbGljZShpLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmRhdGEuZXh0cmFzW2ldLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCB2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGEuZXh0cmFzLnB1c2goe1xuICAgICAga2V5IDoga2V5LFxuICAgICAgdmFsdWUgOiB2YWx1ZVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIFNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIHRlc3QgZGF0YSEhXG4gIHRoaXMuX3NldFRlc3RpbmcgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldEV4dHJhKCdfdGVzdGluZ18nLCB0cnVlKTtcbiAgfTtcblxufVxuXG4vLyBleHRlbmQgcGFja2FnZSBnZXR0ZXJzL3NldHRlcnMgYmFzZWQgb24gc2NoZW1hXG5mb3IoIHZhciBrZXkgaW4gc2NoZW1hICkge1xuICBpZiggaWdub3JlLmluZGV4T2Yoa2V5KSA+IC0xICkge1xuICAgIGNvbnRpbnVlO1xuICB9XG5cbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCBzY2hlbWFba2V5XS5sZW5ndGg7IGkrKyApe1xuICAgIGNyZWF0ZVNjaGVtYU1ldGhvZHMoc2NoZW1hW2tleV1baV0sIFBhY2thZ2UpO1xuICB9XG59XG5cbnRlbXBsYXRlKFBhY2thZ2UpO1xuY3J1ZChQYWNrYWdlKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhY2thZ2U7XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oUGFja2FnZSkge1xuICBQYWNrYWdlLnByb3RvdHlwZS5sb2FkRnJvbVRlbXBsYXRlID0gbG9hZEZyb21UZW1wbGF0ZTtcbn07XG5cbi8vIGxvYWQgZnJvbSBzZXJ2ZXIgcHJvdmlkZWQgdGVtcGxhdGVcbmZ1bmN0aW9uIGxvYWRGcm9tVGVtcGxhdGUoY2thblBhY2thZ2UsIHVzZXIsIGtlZXBEb2kpICB7XG4gIGZvciggdmFyIGtleSBpbiB0aGlzLmRhdGEgKSB7XG4gICAgaWYoIGtleSA9PT0gJ293bmVyX29yZycgfHwga2V5ID09PSAnaWQnICkgY29udGludWU7XG4gICAgaWYoIGNrYW5QYWNrYWdlW2tleV0gKSB0aGlzLmRhdGFba2V5XSA9IGNrYW5QYWNrYWdlW2tleV07XG4gIH1cblxuICBpZiggdXNlciAmJiB1c2VyLm9yZ2FuaXphdGlvbnMgJiYgY2thblBhY2thZ2Uub3duZXJfb3JnICkge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdXNlci5vcmdhbml6YXRpb25zLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHVzZXIub3JnYW5pemF0aW9uc1tpXS5pZCA9PT0gY2thblBhY2thZ2Uub3duZXJfb3JnICkge1xuICAgICAgICBkYXRhLm93bmVyX29yZyA9IGNrYW5QYWNrYWdlLm93bmVyX29yZztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYoIGNrYW5QYWNrYWdlLmV4dHJhcyApIHtcbiAgICBpZiggIWtlZXBEb2kgKSB7XG4gICAgICBpZiggY2thblBhY2thZ2UuZXh0cmFzWydFY29TSVMgRE9JJ10gKSB7XG4gICAgICAgIGRlbGV0ZSBja2FuUGFja2FnZS5leHRyYXNbJ0Vjb1NJUyBET0knXVxuICAgICAgfVxuICAgICAgaWYoIGNrYW5QYWNrYWdlLmV4dHJhc1snRWNvU0lTIERPSSBTdGF0dXMnXSApIHtcbiAgICAgICAgZGVsZXRlIGNrYW5QYWNrYWdlLmV4dHJhc1snRWNvU0lTIERPSSBTdGF0dXMnXVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBhcnIgPSBbXTtcbiAgICBmb3IoIHZhciBrZXkgaW4gY2thblBhY2thZ2UuZXh0cmFzICkge1xuICAgICAgYXJyLnB1c2goe1xuICAgICAgICBrZXkgOiBrZXksXG4gICAgICAgIHZhbHVlIDogY2thblBhY2thZ2UuZXh0cmFzW2tleV1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLmRhdGEuZXh0cmFzID0gYXJyO1xuICB9XG5cbiAgaWYoIGNrYW5QYWNrYWdlLnRhZ3MgKSB7XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgY2thblBhY2thZ2UudGFncy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGFyci5wdXNoKHtcbiAgICAgICAgbmFtZSA6IGNrYW5QYWNrYWdlLnRhZ3NbaV0sXG4gICAgICAgIGRpc3BsYXlfbmFtZSA6IGNrYW5QYWNrYWdlLnRhZ3NbaV1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLmRhdGEudGFncyA9IGFycjtcbiAgfVxuXG4gIGlmKCBja2FuUGFja2FnZS5tYXAgKSB7XG4gICAgdGhpcy5zZXRBbGlhc2VzKGNrYW5QYWNrYWdlLm1hcCk7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJNZWFzdXJlbWVudFwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQWNxdWlzaXRpb24gTWV0aG9kXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkNvbnRhY3RcIixcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIlBpeGVsXCIsXG4gICAgICAgIFwiUHJveGltYWxcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNaW5pbXVtIG1lYXN1cmVtZW50IHVuaXQgZm9yIHlvdXIgc3BlY3RyYSAoaS5lLiBjb250YWN0IHByb2JlLCBwcm94aW1hbCB3aXRoIFgtZGVncmVlIGZvcmVvcHRpYywgcGl4ZWwsIG90aGVyKS5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJTYW1wbGUgUGxhdGZvcm1cIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQWlycGxhbmVcIixcbiAgICAgICAgXCJCb29tXCIsXG4gICAgICAgIFwiU2F0ZWxsaXRlXCIsXG4gICAgICAgIFwiVG93ZXJcIixcbiAgICAgICAgXCJVQVZcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJQbGF0Zm9ybSBmcm9tIHdoaWNoIHRoZSBzcGVjdHJhbCBtZWFzdXJlbWVudHMgd2VyZSBtYWRlIChlLmcuIGhhbmRoZWxkLCBib29tLCB0cmFtLCBVQVYpLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNZWFzdXJlbWVudCBWZW51ZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJHcmVlbmhvdXNlXCIsXG4gICAgICAgIFwiTGFib3JhdG9yeVwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiT3V0ZG9vclwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNldHRpbmcgaW4gd2hpY2ggdGhlIHNwZWN0cmFsIG1lYXN1cmVtZW50cyB3ZXJlIG1hZGUuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVGFyZ2V0IFR5cGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQW5pbWFsXCIsXG4gICAgICAgIFwiQmFya1wiLFxuICAgICAgICBcIkJyYW5jaFwiLFxuICAgICAgICBcIkNhbm9weVwiLFxuICAgICAgICBcIkZsb3dlclwiLFxuICAgICAgICBcIkxlYWZcIixcbiAgICAgICAgXCJNaW5lcmFsXCIsXG4gICAgICAgIFwiTlBWXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJSZWZlcmVuY2VcIixcbiAgICAgICAgXCJSb2NrXCIsXG4gICAgICAgIFwiU29pbFwiLFxuICAgICAgICBcIldhdGVyXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRGVzY3JpYmVzIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWVhc3VyZW1lbnQgUXVhbnRpdHlcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQWJzb3JwdGFuY2VcIixcbiAgICAgICAgXCJETlwiLFxuICAgICAgICBcIkVtaXNzaXZpdHlcIixcbiAgICAgICAgXCJJbmRleFwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiUmFkaWFuY2VcIixcbiAgICAgICAgXCJSZWZsZWN0YW5jZVwiLFxuICAgICAgICBcIlRyYW5zZmxlY3RhbmNlXCIsXG4gICAgICAgIFwiVHJhbnNtaXR0YW5jZVwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNjYWxlIGZvciBzcGVjdHJhbCBpbnN0ZW5zaXR5IChlLmcuIEROLCByYWRpYW5jZSwgaXJyYWRpYW5jZSwgcmVmbGVjdGFuY2UpXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiSW5kZXggTmFtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWVhc3VyZW1lbnQgcXVhbnRpdHkncyBpbmRleCBuYW1lLiAgUGxlYXNlIHByb3ZpZGUgaWYgTWVhc3VyZW1lbnQgUXVhbnRpdHkgPSBcXFwiSW5kZXhcXFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1lYXN1cmVtZW50IFVuaXRzXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZC1zaW5nbGVcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCIlXCIsXG4gICAgICAgIFwiVy9tXjJcIixcbiAgICAgICAgXCJXL21eMi9IelwiLFxuICAgICAgICBcIlcvbV4yL25tXCIsXG4gICAgICAgIFwiVy9tXjIvdW1cIixcbiAgICAgICAgXCJXL3NyL21eMlwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1lYXN1cmVtbnQgdW5pdHNcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiV2F2ZWxlbmd0aCBVbml0c1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWQtc2luZ2xlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJVbml0bGVzc1wiLFxuICAgICAgICBcIm5tXCIsXG4gICAgICAgIFwidW1cIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXYXZlbGVuZ3RoIHVuaXRzIChlLmcuIG5tLCB1bSwgSHopXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVGFyZ2V0IFN0YXR1c1wiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJEcmllZFwiLFxuICAgICAgICBcIkZyZXNoXCIsXG4gICAgICAgIFwiR3JlZW5cIixcbiAgICAgICAgXCJHcm91bmRcIixcbiAgICAgICAgXCJMaXF1aWRcIixcbiAgICAgICAgXCJMaXZlXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJQYW5lbFwiLFxuICAgICAgICBcIlN0YW5kYXJkXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3RhdGUgb2YgdGhlIG1lYXN1cmVtZW50IHRhcmdldC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMaWdodCBTb3VyY2VcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTGFtcFwiLFxuICAgICAgICBcIkxhc2VyXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJTdW5cIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEZXNjcmlwdGlvbiBvZiB0aGUgbGlnaHQgc291cmNlIHVzZWQgZm9yIHlvdXIgc3BlY3RyYWwgbWVhc3VyZW1lbnRzXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTGlnaHQgU291cmNlIFNwZWNpZmljYXRpb25zXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwic3BsaXQtdGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRm9yZW9wdGljIFR5cGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQmFyZSBGaWJlclwiLFxuICAgICAgICBcIkNvbnRhY3QgUHJvYmVcIixcbiAgICAgICAgXCJDb3NpbmUgRGlmZnVzZXJcIixcbiAgICAgICAgXCJGb3Jlb3B0aWNcIixcbiAgICAgICAgXCJHZXJzaG9uIFR1YmVcIixcbiAgICAgICAgXCJJbnRlZ3JhdGluZyBTcGhlcmVcIixcbiAgICAgICAgXCJMZWFmIENsaXBcIixcbiAgICAgICAgXCJOb25lXCIsXG4gICAgICAgIFwiT3RoZXJcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEZXNjcmlwdGlvbiBvZiB0aGUgZm9yZW9wdGljIHVzZWQgdG8gbWFrZSB5b3VyIHNwZWN0cmFsIG1lYXN1cmVtZW50XCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRm9yZW9wdGljIEZpZWxkIG9mIFZpZXdcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiaW50ZWdlciBkZWdyZWVzXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGb3Jlb3B0aWMgU3BlY2lmaWNhdGlvbnNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIlByb2Nlc3NpbmcgSW5mb3JtYXRpb25cIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlByb2Nlc3NpbmcgQXZlcmFnZWRcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkLXNpbmdsZVwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIk5vXCIsXG4gICAgICAgIFwiWWVzXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSXMgdGhlIG1lYXN1cmVtZW50IGFuIGF2ZXJhZ2Ugb2YgbXVsdGlwbGUgbWVhc3VyZW1lbnRzP1wiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIEludGVycG9sYXRlZFwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWQtc2luZ2xlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTm9cIixcbiAgICAgICAgXCJZZXNcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJcyB0aGUgbWVhc3VyZW1lbnQgaW50ZXJwb2xhdGVkP1wiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIFJlc2FtcGxlZFwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWQtc2luZ2xlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTm9cIixcbiAgICAgICAgXCJZZXNcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJcyB0aGUgbWVhc3VyZW1lbnQgcmVzYW1wbGVkPyAoZS5nLiBhcmUgbXVsdGlwbGUgd2F2ZWxlbmd0aHMgYXZlcmFnZWQ/KVwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIEluZm9ybWF0aW9uIERldGFpbHNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk90aGVyIGRldGFpbHMgYWJvdXQgcHJvY2Vzc2luZyBhcmUgcHJvdmlkZWQgaGVyZS5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJJbnN0cnVtZW50XCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbnN0cnVtZW50IE1hbnVmYWN0dXJlclwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3BlY3Ryb21ldGVyIG1hbnVmYWN0dXJlci5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiSW5zdHJ1bWVudCBNb2RlbFwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3BlY3Ryb21ldGVyIG1vZGVsLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbnN0cnVtZW50IFNlcmlhbCBOdW1iZXJcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIlRoZW1lXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJUaGVtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBZ3JpY3VsdHVyZVwiLFxuICAgICAgICBcIkJpb2NoZW1pc3RyeVwiLFxuICAgICAgICBcIkVjb2xvZ3lcIixcbiAgICAgICAgXCJGb3Jlc3RcIixcbiAgICAgICAgXCJHbG9iYWwgQ2hhbmdlXCIsXG4gICAgICAgIFwiTGFuZCBDb3ZlclwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiUGhlbm9sb2d5XCIsXG4gICAgICAgIFwiUGh5c2lvbG9neVwiLFxuICAgICAgICBcIldhdGVyIFF1YWxpdHlcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJSZXNlYXJjaCBjb250ZXh0IGZvciB0aGUgdGhlIHNwZWN0cmFsIG1lYXN1cmVtZW50cy5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJLZXl3b3Jkc1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkVjb3N5c3RlbSBUeXBlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkFscGluZVwiLFxuICAgICAgICBcIkFudGFyY3RpY1wiLFxuICAgICAgICBcIkFxdWF0aWNcIixcbiAgICAgICAgXCJBcmN0aWNcIixcbiAgICAgICAgXCJBcmN0aWMgVHVuZHJhXCIsXG4gICAgICAgIFwiQ29hc3RhbFwiLFxuICAgICAgICBcIkNyb3BzXCIsXG4gICAgICAgIFwiRGVzZXJ0XCIsXG4gICAgICAgIFwiRXN0dWFyeVwiLFxuICAgICAgICBcIkZvcmVzdFwiLFxuICAgICAgICBcIkZyZXNod2F0ZXJcIixcbiAgICAgICAgXCJHcmFzc2xhbmRcIixcbiAgICAgICAgXCJMYWtlXCIsXG4gICAgICAgIFwiTWFyaW5lXCIsXG4gICAgICAgIFwiTW9udGFuZVwiLFxuICAgICAgICBcIk9jZWFuXCIsXG4gICAgICAgIFwiUG9uZFwiLFxuICAgICAgICBcIlJhaW5mb3Jlc3RcIixcbiAgICAgICAgXCJSaXZlclwiLFxuICAgICAgICBcIlNhdmFubmFcIixcbiAgICAgICAgXCJTY3J1YmxhbmRcIixcbiAgICAgICAgXCJTaHJ1YmxhbmRcIixcbiAgICAgICAgXCJTdGVwcGVcIixcbiAgICAgICAgXCJUdW5kcmFcIixcbiAgICAgICAgXCJVcmJhblwiLFxuICAgICAgICBcIldvb2RsYW5kXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk5BU0EgR0NNRCBLZXl3b3Jkc1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2VsZWN0IHNwZWN0cm9zY29weS1yZWxhdGVkIGtleXdvcmRzIGZyb20gdGhlIE5BU0EgR2xvYmFsIENoYW5nZSBNYXN0ZXIgRGlyZWN0b3J5J3MgY29udHJvbGxlZCBrZXl3b3JkIHZvY2FidWxhcmllcy4gKGh0dHA6Ly9nY21kLm5hc2EuZ292L2xlYXJuL2tleXdvcmRfbGlzdC5odG1sKVwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIkxvY2F0aW9uXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMYXRpdHVkZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImxhdGxuZ1wiLFxuICAgICAgXCJ1bml0c1wiOiBcImRlY2ltYWwgZGVncmVlXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMb25naXR1ZGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJsYXRsbmdcIixcbiAgICAgIFwidW5pdHNcIjogXCJkZWNpbWFsIGRlZ3JlZVwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiZ2VvanNvblwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImdlb2pzb25cIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiU3BlY3RyYVwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxvY2F0aW9uIE5hbWVcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIkRhdGVcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlNhbXBsZSBDb2xsZWN0aW9uIERhdGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJkYXRlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiSVNPIERhdGUgXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNZWFzdXJlbWVudCBEYXRlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiZGF0ZVwiLFxuICAgICAgXCJ1bml0c1wiOiBcIklTTyBEYXRlIFwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUGhlbm9sb2dpY2FsIFN0YXR1c1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiU3BlY2llc1wiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ29tbW9uIE5hbWVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkNvbW1vbiBuYW1lIG9mIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxhdGluIEdlbnVzXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMYXRpbiBnZW51cyBvZiB0aGUgdGFyZ2V0IHRoYXQgd2FzIG1lYXN1cmVkLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMYXRpbiBTcGVjaWVzXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMYXRpbiBzcGVjaWVzIG9mIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlVTREEgU3ltYm9sXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJVU0RBIGNvZGUgb2YgdGhlIHRhcmdldCB0aGF0IHdhcyBtZWFzdXJlZC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVmVnZXRhdGlvbiBUeXBlXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJDaXRhdGlvblwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ2l0YXRpb25cIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJDaXRhdGlvbiBET0lcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJXZWJzaXRlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQXV0aG9yXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQXV0aG9yIEVtYWlsXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWFpbnRhaW5lclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1haW50YWluZXIgRW1haWxcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGdW5kaW5nIFNvdXJjZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkZ1bmRpbmcgU291cmNlIEdyYW50IE51bWJlclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlllYXJcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdXG59IiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgdGhpcy5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgey8qKi99XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICgodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgfHwgdGFyZ2V0ID09IG51bGwpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyZWR1Y2UnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdDtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgeyAvLyBCcm93c2VyIHdpbmRvd1xuICByb290ID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gV2ViIFdvcmtlclxuICByb290ID0gc2VsZjtcbn0gZWxzZSB7IC8vIE90aGVyIGVudmlyb25tZW50c1xuICByb290ID0gdGhpcztcbn1cblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbnJlcXVlc3QuZ2V0WEhSID0gZnVuY3Rpb24gKCkge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdFxuICAgICAgJiYgKCFyb290LmxvY2F0aW9uIHx8ICdmaWxlOicgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbFxuICAgICAgICAgIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAobnVsbCAhPSBvYmpba2V5XSkge1xuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgb2JqW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogSGVscHMgJ3NlcmlhbGl6ZScgd2l0aCBzZXJpYWxpemluZyBhcnJheXMuXG4gKiBNdXRhdGVzIHRoZSBwYWlycyBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYWlyc1xuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKi9cblxuZnVuY3Rpb24gcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdmFsKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICByZXR1cm4gdmFsLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdik7XG4gICAgfSk7XG4gIH1cbiAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHBhaXI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBhcnRzID0gcGFpci5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG1pbWVgIGlzIGpzb24gb3IgaGFzICtqc29uIHN0cnVjdHVyZWQgc3ludGF4IHN1ZmZpeC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWltZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSlNPTihtaW1lKSB7XG4gIHJldHVybiAvW1xcLytdanNvblxcYi8udGVzdChtaW1lKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPSAoKHRoaXMucmVxLm1ldGhvZCAhPSdIRUFEJyAmJiAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8IHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnKVxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSlcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2UgJiYgc3RyICYmIChzdHIubGVuZ3RoIHx8IHN0ciBpbnN0YW5jZW9mIE9iamVjdClcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgc3RhdHVzID0gMjA0O1xuICB9XG5cbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5zdGF0dXNDb2RlID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBFbWl0dGVyLmNhbGwodGhpcyk7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTtcbiAgdGhpcy5faGVhZGVyID0ge307XG4gIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGVyciA9IG51bGw7XG4gICAgdmFyIHJlcyA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGU7XG4gICAgICAvLyBpc3N1ZSAjNjc1OiByZXR1cm4gdGhlIHJhdyByZXNwb25zZSBpZiB0aGUgcmVzcG9uc2UgcGFyc2luZyBmYWlsc1xuICAgICAgZXJyLnJhd1Jlc3BvbnNlID0gc2VsZi54aHIgJiYgc2VsZi54aHIucmVzcG9uc2VUZXh0ID8gc2VsZi54aHIucmVzcG9uc2VUZXh0IDogbnVsbDtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICB2YXIgbmV3X2VyciA9IG5ldyBFcnJvcihyZXMuc3RhdHVzVGV4dCB8fCAnVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2UnKTtcbiAgICBuZXdfZXJyLm9yaWdpbmFsID0gZXJyO1xuICAgIG5ld19lcnIucmVzcG9uc2UgPSByZXM7XG4gICAgbmV3X2Vyci5zdGF0dXMgPSByZXMuc3RhdHVzO1xuXG4gICAgc2VsZi5jYWxsYmFjayhuZXdfZXJyLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEZvcmNlIGdpdmVuIHBhcnNlclxuICpcbiAqIFNldHMgdGhlIGJvZHkgcGFyc2VyIG5vIG1hdHRlciB0eXBlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZm4pe1xuICB0aGlzLl9wYXJzZXIgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSB8fCBmaWxlLm5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAgYXMgdGhlIHJlcXVlc3QgYm9keSwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9JylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaiB8fCBpc0hvc3QoZGF0YSkpIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICBmbihlcnIsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdSZXF1ZXN0IGhhcyBiZWVuIHRlcm1pbmF0ZWRcXG5Qb3NzaWJsZSBjYXVzZXM6IHRoZSBuZXR3b3JrIGlzIG9mZmxpbmUsIE9yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4sIHRoZSBwYWdlIGlzIGJlaW5nIHVubG9hZGVkLCBldGMuJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG5cbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gdGhpcy5tZXRob2Q7XG4gIGVyci51cmwgPSB0aGlzLnVybDtcblxuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSByZXF1ZXN0LmdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcblxuICAgIC8vIEluIElFOSwgcmVhZHMgdG8gYW55IHByb3BlcnR5IChlLmcuIHN0YXR1cykgb2ZmIG9mIGFuIGFib3J0ZWQgWEhSIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gdGhlIGVycm9yIFwiQ291bGQgbm90IGNvbXBsZXRlIHRoZSBvcGVyYXRpb24gZHVlIHRvIGVycm9yIGMwMGMwMjNmXCJcbiAgICB2YXIgc3RhdHVzO1xuICAgIHRyeSB7IHN0YXR1cyA9IHhoci5zdGF0dXMgfSBjYXRjaChlKSB7IHN0YXR1cyA9IDA7IH1cblxuICAgIGlmICgwID09IHN0YXR1cykge1xuICAgICAgaWYgKHNlbGYudGltZWRvdXQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIHZhciBoYW5kbGVQcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgIGlmIChlLnRvdGFsID4gMCkge1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgIH1cbiAgICBlLmRpcmVjdGlvbiA9ICdkb3dubG9hZCc7XG4gICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICB9O1xuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB4aHIub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKHhoci51cGxvYWQgJiYgdGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIC8vIFJlcG9ydGVkIGhlcmU6XG4gICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy84MzcyNDUveG1saHR0cHJlcXVlc3QtdXBsb2FkLXRocm93cy1pbnZhbGlkLWFyZ3VtZW50LXdoZW4tdXNlZC1mcm9tLXdlYi13b3JrZXItY29udGV4dFxuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYudGltZWRvdXQgPSB0cnVlO1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCdHRVQnICE9IHRoaXMubWV0aG9kICYmICdIRUFEJyAhPSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSAmJiAhaXNIb3N0KGRhdGEpKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgdmFyIGNvbnRlbnRUeXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIHZhciBzZXJpYWxpemUgPSB0aGlzLl9wYXJzZXIgfHwgcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG5cbiAgLy8gSUUxMSB4aHIuc2VuZCh1bmRlZmluZWQpIHNlbmRzICd1bmRlZmluZWQnIHN0cmluZyBhcyBQT1NUIHBheWxvYWQgKGluc3RlYWQgb2Ygbm90aGluZylcbiAgLy8gV2UgbmVlZCBudWxsIGhlcmUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgeGhyLnNlbmQodHlwZW9mIGRhdGEgIT09ICd1bmRlZmluZWQnID8gZGF0YSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRmF1eCBwcm9taXNlIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsLCByZWplY3QpIHtcbiAgcmV0dXJuIHRoaXMuZW5kKGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgZXJyID8gcmVqZWN0KGVycikgOiBmdWxmaWxsKHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWwodXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxucmVxdWVzdFsnZGVsJ10gPSBkZWw7XG5yZXF1ZXN0WydkZWxldGUnXSA9IGRlbDtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbiJdfQ==
