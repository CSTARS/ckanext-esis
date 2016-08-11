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

/*
  Package.prototype['add'+name] = function(value) {
    if( typeof value !== 'string' ) {
      throw(new Error('value must be type string'));
    }

    var currentValue = this.getExtra(name).split(',').map(cleanTerm);
    var currentOther = this.getExtra(name+' Other').split(',').map(cleanTerm);

    if( attribute.type === 'controlled' ) {
      var t = tokenize(value);
      var valid = false;
      for( var i = 0; i < attribute.vocabulary.length; i++ ) {
        if( tokenize(attribute.vocabulary[i]) === t ) {
          t = attribute.vocabulary[i];
          valid = true;
          break;
        }
      }

      if( valid ) {
        currentValue.push(t);
        this.setExtra(attribute.name, currentValue.join(', '));
      } else if( attribute.allowOther ) {
        currentOther.push(t);
        this.setExtra(attribute.name, currentValue.join(', '));
      }
    }

  };
*/
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi9ja2FuL2FkZFJlc291cmNlLmpzIiwibGliL2NrYW4vaW5kZXguanMiLCJsaWIvZGF0YXN0b3JlLmpzIiwibGliL2luZGV4LmpzIiwibGliL2xvZ2ljL2NyZWF0ZVBhY2thZ2UuanMiLCJsaWIvbG9naWMvaW5kZXguanMiLCJsaWIvbG9naWMvdmVyaWZ5L2luZGV4LmpzIiwibGliL2xvZ2ljL3ZlcmlmeS9uYW1lLmpzIiwibGliL3BhY2thZ2UvY3JlYXRlU2NoZW1hTWV0aG9kcy5qcyIsImxpYi9wYWNrYWdlL2NydWQuanMiLCJsaWIvcGFja2FnZS9pbmRleC5qcyIsImxpYi9wYWNrYWdlL3RlbXBsYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsInV0aWxzL21ldGFkYXRhL3NjaGVtYS5qc29uIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZXF1ZXN0LCBrZXksIGhvc3Q7XG5cbi8vIFRPRE86IHRoaXMgbmVlZHMgdG8gYmUgdmVyaWZpZWQgOi9cbmZ1bmN0aW9uIGFkZFJlc291cmNlTm9kZShwa2dpZCwgZmlsZSwgY2FsbGJhY2spIHtcbiAgdmFyIHIgPSByZXF1ZXN0XG4gICAucG9zdChob3N0ICsgJy9hcGkvMy9hY3Rpb24vcmVzb3VyY2VfY3JlYXRlJylcbiAgIC53aXRoQ3JlZGVudGlhbHMoKVxuICAgLmZpZWxkKCdwYWNrYWdlX2lkJywgcGtnaWQpXG4gICAuZmllbGQoJ21pbWV0eXBlJywgZmlsZS5taW1ldHlwZSlcbiAgIC5maWVsZCgnbmFtZScsIGZpbGUuZmlsZW5hbWUpXG4gICAuZmllbGQoJ3VybCcsJ3VwbG9hZCcpXG4gICAuYXR0YWNoKCd1cGxvYWQnLCBmaWxlLnBhdGgpO1xuXG4gIGlmKCBrZXkgKSB7XG4gICAgci5zZXQoJ0F1dGhvcml6YXRpb24nLCBrZXkpO1xuICB9XG5cbiAgci5lbmQoY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBhZGRSZXNvdXJjZUJyb3dzZXIocGtnaWQsIGZpbGUsIGNhbGxiYWNrLCBwcm9ncmVzcykge1xuICAvLyBUT0RPOiBpZiB0aGlzIGZhaWxzLCB3ZSBoYXZlIGFuIGlzc3VlIG9uIG91ciBoYW5kc1xuICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICBmb3JtRGF0YS5hcHBlbmQoJ3BhY2thZ2VfaWQnLCBwa2dpZCk7XG4gIGZvcm1EYXRhLmFwcGVuZCgnbWltZXR5cGUnLCBmaWxlLm1pbWV0eXBlKTtcbiAgZm9ybURhdGEuYXBwZW5kKCduYW1lJywgZmlsZS5maWxlbmFtZSk7XG4gIGZvcm1EYXRhLmFwcGVuZCgndXJsJywgJ3VwbG9hZCcpO1xuICBmb3JtRGF0YS5hcHBlbmQoJ3VwbG9hZCcsIG5ldyBCbG9iKFtmaWxlLmNvbnRlbnRzXSwge3R5cGU6IGZpbGUubWltZXR5cGV9KSwgZmlsZS5maWxlbmFtZSk7XG5cbiAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICB2YXIgeGhyID0gJC5hamF4U2V0dGluZ3MueGhyKCk7XG4gIC8vIGF0dGFjaCBwcm9ncmVzcyBoYW5kbGVyIHRvIHRoZSBYTUxIdHRwUmVxdWVzdCBPYmplY3RcblxuICB0cnkge1xuICAgICAgaWYoIHByb2dyZXNzICkge1xuICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcInByb2dyZXNzXCIsIGZ1bmN0aW9uKGV2dCl7XG4gICAgICAgICAgICAgIGlmIChldnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICAgIHZhciBkaWZmID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lO1xuICAgICAgICAgICAgICAgIHZhciBzcGVlZCA9IChldnQubG9hZGVkIC8gMTAwMDAwMCkgLyAoZGlmZiAvIDEwMDApO1xuICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MoKChldnQubG9hZGVkIC8gZXZ0LnRvdGFsKSoxMDApLnRvRml4ZWQoMCksIHNwZWVkLnRvRml4ZWQoMikrJ01icHMnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgIH1cbiAgfSBjYXRjaChlKSB7fVxuXG4gICQuYWpheCh7XG4gICAgdXJsOiBob3N0ICsgJy9hcGkvMy9hY3Rpb24vcmVzb3VyY2VfY3JlYXRlJyxcbiAgICB0eXBlOiBcIlBPU1RcIixcbiAgICBkYXRhOiBmb3JtRGF0YSxcbiAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgIHhockZpZWxkczoge1xuICAgICAgd2l0aENyZWRlbnRpYWxzOiB0cnVlXG4gICAgfSxcbiAgICB4aHIgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHhocjtcbiAgICB9LFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgY2FsbGJhY2sobnVsbCwge1xuICAgICAgICBib2R5IDogcmVzcFxuICAgICAgfSk7XG4gICAgfSxcbiAgICBlcnJvciA6IGZ1bmN0aW9uKCkge1xuICAgICAgY2FsbGJhY2soe2Vycm9yOnRydWUsbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB4aHI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ociwgaCwgaywgaXNCcm93c2VyLCBoYW5kbGVSZXNwKSB7XG4gIHJlcXVlc3QgPSByO1xuICBrZXkgPSBrO1xuICBob3N0ID0gaDtcblxuICByZXR1cm4gZnVuY3Rpb24ocGtnaWQsIGZpbGUsIGNhbGxiYWNrLCBwcm9ncmVzcykge1xuICAgIGZ1bmN0aW9uIG5leHQoZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGlmKCBpc0Jyb3dzZXIgKSBhZGRSZXNvdXJjZUJyb3dzZXIocGtnaWQsIGZpbGUsIG5leHQsIHByb2dyZXNzKTtcbiAgICBlbHNlIGFkZFJlc291cmNlTm9kZShwa2dpZCwgZmlsZSwgbmV4dCk7XG4gIH07XG59O1xuIiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5cbi8vIGRlcGVuZHMgaWYgd2UgYXJlIHJ1bm5pbmcgZnJvbSBub2RlanMgb3IgYnJvd3NlclxudmFyIGFnZW50ID0gcmVxdWVzdC5hZ2VudCA/IHJlcXVlc3QuYWdlbnQoKSA6IHJlcXVlc3Q7XG52YXIgaXNCcm93c2VyID0gcmVxdWVzdC5hZ2VudCA/IGZhbHNlIDogdHJ1ZTtcbnZhciBrZXkgPSAnJztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICB0aGlzLmhvc3QgPSBjb25maWcuaG9zdCB8fCAnLyc7XG4gIGtleSA9IGNvbmZpZy5rZXkgfHwgJyc7XG4gIHRoaXMua2V5ID0ga2V5O1xuXG4gIHRoaXMucHJlcGFyZVdvcmtzcGFjZSA9IGZ1bmN0aW9uKHBrZ2lkLCBjYWxsYmFjaykge1xuICAgIGdldChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy93b3Jrc3BhY2UvcHJlcGFyZScsXG4gICAgICB7XG4gICAgICAgIGZvcmNlOiB0cnVlLFxuICAgICAgICBwYWNrYWdlX2lkOiBwa2dpZFxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCl7XG4gICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICB0aGlzLmdldFdvcmtzcGFjZSA9IGZ1bmN0aW9uKHBrZ2lkLCBjYWxsYmFjaykge1xuICAgIGdldChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy93b3Jrc3BhY2UvZ2V0JyxcbiAgICAgIHtcbiAgICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkXG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKXtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0QWN0aXZlVXNlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZ2V0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3VzZXIvZ2V0JyxcbiAgICAgIHt9LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIGEgcmVzb3VyY2UgdG8gYSBwYWNrYWdlIHVzaW5nIHRoZSBicm93c2VycyBGb3JtRGF0YSBvYmplY3QgaW4gYSBicm93c2VyXG4gICAqIG9yIHVzZXIgdGhlIHN1cGVyYWdlbnQgZm9yIE5vZGVKU1xuICAgKlxuICAgKiBwa2dpZDogaWQgb2YgdGhlIHBhY2thZ2UgdG8gYWRkIHRvXG4gICAqIGZpbGU6IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHRvIHJlc291cmNlIHRvIHVwbG9hZCBvciBpZiBOb2RlSlMgc3RyaW5nIHBhdGggdG8gZmlsZVxuICAgKiBjYWxsYmFjazogY2FsbGJhY2sgaGFuZGxlclxuICAgKiBwcm9ncmVzczogY2FsbGJhY2sgZm9yIHByb2dyZXNzIHVwZGF0ZSAobm90IHN1cHBvcnRlZCBpbiBOb2RlSlMpXG4gICAqKi9cbiAgdGhpcy5hZGRSZXNvdXJjZSA9IHJlcXVpcmUoJy4vYWRkUmVzb3VyY2UnKShyZXF1ZXN0LCBjb25maWcuaG9zdCwga2V5LCBpc0Jyb3dzZXIsIGhhbmRsZVJlc3ApO1xuXG5cbiAgdGhpcy5nZXREYXRhc2hlZXQgPSBmdW5jdGlvbihwa2dpZCwgcmlkLCBzaWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL2dldCcsXG4gICAgICB7XG4gICAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZCxcbiAgICAgICAgcmVzb3VyY2VfaWQgOiByaWQsXG4gICAgICAgIGRhdGFzaGVldF9pZCA6IHNpZFxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICk7XG4gIH07XG5cbiAgdGhpcy5nZXRNZXRhZGF0YUluZm8gPSBmdW5jdGlvbihwYWNrYWdlX2lkLCByZXNvdXJjZV9pZCwgc2hlZXRfaWQsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgcXVlcnkgPSB7XG4gICAgICAgIHBhY2thZ2VfaWQgOiBwYWNrYWdlX2lkLFxuICAgICAgICByZXNvdXJjZV9pZCA6IHJlc291cmNlX2lkXG4gICAgICB9O1xuICAgICAgaWYoIHNoZWV0X2lkICkge1xuICAgICAgICBxdWVyeS5zaGVldF9pZCA9IHNoZWV0X2lkO1xuICAgICAgfVxuXG4gICAgICBnZXQoXG4gICAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9nZXRNZXRhZGF0YUluZm8nLFxuICAgICAgICBxdWVyeSxcbiAgICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgfTtcblxuICB0aGlzLmdldE1ldGFkYXRhQ2h1bmsgPSBmdW5jdGlvbihwYWNrYWdlX2lkLCByZXNvdXJjZV9pZCwgc2hlZXRfaWQsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgdmFyIHF1ZXJ5ID0ge1xuICAgICAgICBwYWNrYWdlX2lkIDogcGFja2FnZV9pZCxcbiAgICAgICAgcmVzb3VyY2VfaWQgOiByZXNvdXJjZV9pZCxcbiAgICAgICAgaW5kZXggOiBpbmRleFxuICAgICAgfTtcbiAgICAgIGlmKCBzaGVldF9pZCApIHtcbiAgICAgICAgcXVlcnkuc2hlZXRfaWQgPSBzaGVldF9pZDtcbiAgICAgIH1cblxuICAgICAgZ2V0KFxuICAgICAgICB0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZ2V0TWV0YWRhdGFDaHVuaycsXG4gICAgICAgIHF1ZXJ5LFxuICAgICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0U3BlY3RyYSA9IGZ1bmN0aW9uKHBrZ2lkLCByaWQsIHNpZCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge1xuICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkLFxuICAgICAgaW5kZXggOiBpbmRleFxuICAgIH07XG5cbiAgICBpZiggcmlkICkge1xuICAgICAgcXVlcnkucmVzb3VyY2VfaWQgPSByaWQ7XG4gICAgfVxuICAgIGlmKCBzaWQgKSB7XG4gICAgICBxdWVyeS5zaGVldF9pZCA9IHNpZDtcbiAgICB9XG5cbiAgICBnZXQoXG4gICAgICB0aGlzLmhvc3QrJy9lY29zaXMvc3BlY3RyYS9nZXQnLFxuICAgICAgcXVlcnksXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0U3BlY3RyYUNvdW50ID0gZnVuY3Rpb24ocGtnaWQsIHJpZCwgc2lkLCBjYWxsYmFjaykge1xuICAgIHZhciBxdWVyeSA9IHtcbiAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZFxuICAgIH07XG5cbiAgICBpZiggcmlkICkge1xuICAgICAgcXVlcnkucmVzb3VyY2VfaWQgPSByaWQ7XG4gICAgfVxuICAgIGlmKCBzaWQgKSB7XG4gICAgICBxdWVyeS5zaGVldF9pZCA9IHNpZDtcbiAgICB9XG5cbiAgICBnZXQoXG4gICAgICB0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZ2V0U3BlY3RyYUNvdW50JyxcbiAgICAgIHF1ZXJ5LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuXG4gIHRoaXMucHJvY2Vzc1Jlc291cmNlID0gZnVuY3Rpb24ocGtnaWQsIHJlc291cmNlX2lkLCBzaGVldF9pZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkLFxuICAgICAgICBvcHRpb25zIDogSlNPTi5zdHJpbmdpZnkob3B0aW9ucylcbiAgICB9O1xuXG4gICAgLy8gYXBwbHkgdG8gbXVsdGlwbGUgcmVzb3VyY2VzLCBoZWxwZXIgZm9yIGZpcnN0IHVwbG9hZFxuICAgIGlmKCBBcnJheS5pc0FycmF5KHJlc291cmNlX2lkKSApIHtcbiAgICAgIGRhdGEucmVzb3VyY2VfaWRzID0gSlNPTi5zdHJpbmdpZnkocmVzb3VyY2VfaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXRhLnJlc291cmNlX2lkID0gcmVzb3VyY2VfaWQ7XG4gICAgICBkYXRhLnNoZWV0X2lkID0gc2hlZXRfaWQ7XG4gICAgfVxuXG4gICAgcG9zdChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9wcm9jZXNzJyxcbiAgICAgIGRhdGEsXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaWYoIGlzRXJyb3IoZXJyLCByZXNwKSApIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSwgbWVzc2FnZTonUmVxdWVzdCBFcnJvcid9KTtcblxuICAgICAgICAvLyB1cGRhdGUgaW5mbyBpbiB0aGUgZGF0YXN0b3JlIGlmIHdlIGhhdmUgb25lXG4gICAgICAgIGlmKCB0aGlzLmRzICkge1xuICAgICAgICAgIHRoaXMuZHMud2F2ZWxlbmd0aHMgPSByZXNwLndhdmVsZW5ndGhzIHx8IFtdO1xuICAgICAgICAgIHRoaXMuZHMuc2NoZW1hID0gW107XG4gICAgICAgICAgaWYoICFyZXNwLmF0dHJpYnV0ZXMgKSByZXR1cm47XG5cbiAgICAgICAgICBmb3IoIHZhciBhdHRyTmFtZSBpbiByZXNwLmF0dHJpYnV0ZXMgKSB7XG4gICAgICAgICAgICAgIHZhciBhdHRyID0gcmVzcC5hdHRyaWJ1dGVzW2F0dHJOYW1lXTtcbiAgICAgICAgICAgICAgYXR0ci5uYW1lID0gYXR0ck5hbWU7XG4gICAgICAgICAgICAgIHRoaXMuZHMuc2NoZW1hLnB1c2goYXR0cik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2socmVzcC5ib2R5KTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0TGljZW5zZUxpc3QgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vbGljZW5zZV9saXN0Jywge30sIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmdldFBhY2thZ2UgPSBmdW5jdGlvbihwa2dpZCwgY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL3BhY2thZ2Vfc2hvdycsIHtpZCA6IHBrZ2lkfSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuZ2V0T3JnYW5pemF0aW9uID0gZnVuY3Rpb24obmFtZU9ySWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9vcmdhbml6YXRpb25fc2hvdycsIHtpZCA6IG5hbWVPcklkfSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMudGFnU2VhcmNoID0gZnVuY3Rpb24ocXVlcnksIGxpbWl0LCBjYWxsYmFjaykge1xuICAgIC8vIHN1cHBvcnRpbmcgbXVsdGlwbGUgdmVyc2lvbnMgb2YgY2thbi4gIHdoeSB0aGV5IGNoYW5nZWQgdGhpcyBwYXJhbWV0ZXIuLi4gd2hvIGtub3dzLi4uXG5cbiAgICBxdWVyeSA9IHtcbiAgICAgIHF1ZXJ5IDogcXVlcnksXG4gICAgICBja2FuIDogcXVlcnksXG4gICAgICBsaW1pdCA6IGxpbWl0IHx8IDEwXG4gICAgfTtcblxuICAgIGdldCh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vdGFnX3NlYXJjaCcsIHF1ZXJ5LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgdG1wID0ge30sIGtleTtcbiAgICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHJlc3AucmVzdWx0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHJlc3AucmVzdWx0c1tpXS5uYW1lID0gcmVzcC5yZXN1bHRzW2ldLm5hbWUudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgICAgICAgICB0bXBbcmVzcC5yZXN1bHRzW2ldLm5hbWVdID0gcmVzcC5yZXN1bHRzW2ldO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3AucmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvcigga2V5IGluIHRtcCApIHtcbiAgICAgICAgICAgIHJlc3AucmVzdWx0cy5wdXNoKHRtcFtrZXldKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaChlKSB7fVxuXG4gICAgICAgIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy51cGRhdGVQYWNrYWdlID0gZnVuY3Rpb24ocGtnLCBjYWxsYmFjaykge1xuICAgIGlmKCBwa2cucHJpdmF0ZSApIHtcbiAgICAgIHRoaXMudmVyaWZ5UHJpdmF0ZShwa2cuaWQsXG4gICAgICAgIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVQYWNrYWdlKHBrZywgY2FsbGJhY2spO1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVBhY2thZ2UocGtnLCBjYWxsYmFjayk7XG4gIH07XG5cbiAgdGhpcy5fdXBkYXRlUGFja2FnZSA9IGZ1bmN0aW9uKHBrZywgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9wYWNrYWdlX3VwZGF0ZScsIHBrZywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMudXBkYXRlTGlua2VkUmVzb3VyY2VzID0gZnVuY3Rpb24oaWQsIHJlc291cmNlcywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGlkIDogaWQsXG4gICAgICBsaW5rZWRSZXNvdXJjZXMgOiByZXNvdXJjZXNcbiAgICB9XG5cbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2Vjb3Npcy9wYWNrYWdlL3VwZGF0ZUxpbmtlZFJlc291cmNlcycsIGRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLnZlcmlmeVByaXZhdGUgPSBmdW5jdGlvbihpZCwgY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL3BhY2thZ2Uvc2V0UHJpdmF0ZScsIHtpZDogaWR9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5kZWxldGVQYWNrYWdlID0gZnVuY3Rpb24ocGtnaWQsIGNhbGxiYWNrKSB7XG4gICAgcG9zdFJhdyh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vcGFja2FnZV9kZWxldGUnLCBKU09OLnN0cmluZ2lmeSh7aWQ6IHBrZ2lkfSksIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmNyZWF0ZVBhY2thZ2UgPSBmdW5jdGlvbihwa2csIGNhbGxiYWNrKSB7XG4gICAgcG9zdFJhdyh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vcGFja2FnZV9jcmVhdGUnLCBwa2csIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKnRoaXMuc2V0UGFja2FnZU9wdGlvbnMgPSBmdW5jdGlvbihwa2dpZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHBhY2thZ2VfaWQgOiBwa2dpZCxcbiAgICAgIG9wdGlvbnMgOiBKU09OLnN0cmluZ2lmeShvcHRpb25zKVxuICAgIH07XG5cbiAgICBwb3N0KHRoaXMuaG9zdCsnL2Vjb3Npcy9wYWNrYWdlL3NldE9wdGlvbnMnLCBkYXRhLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07Ki9cblxuICB0aGlzLnRvcFN1Z2dlc3RPdmVydmlldyA9IGZ1bmN0aW9uKGxpc3QsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBuYW1lcyA6IEpTT04uc3RyaW5naWZ5KGxpc3QpLFxuICAgIH07XG5cbiAgICBwb3N0KHRoaXMuaG9zdCsnL2Vjb3Npcy9zcGVjdHJhL3N1Z2dlc3RPdmVydmlldycsIGRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLnRvcFN1Z2dlc3QgPSBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvc3BlY3RyYS9zdWdnZXN0Jywge25hbWUgOm5hbWV9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5yZW1vdmVSZXNvdXJjZSA9IGZ1bmN0aW9uKHJlc291cmNlSWQsIGNhbGxiYWNrKSB7XG4gICAgcG9zdFJhdyh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vcmVzb3VyY2VfZGVsZXRlJywgSlNPTi5zdHJpbmdpZnkoe2lkIDogcmVzb3VyY2VJZCB9KSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuZGVsZXRlUmVzb3VyY2VzID0gZnVuY3Rpb24ocmVzb3VyY2VJZHMsIGNhbGxiYWNrKSB7XG4gICAgcG9zdFJhdyh0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZGVsZXRlTWFueScsIEpTT04uc3RyaW5naWZ5KHtpZHMgOiByZXNvdXJjZUlkcyB9KSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMucHVzaFRvU2VhcmNoID0gZnVuY3Rpb24ocGtnaWQsIGluY2x1ZGVFbWFpbCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcXVlcnkgPSB7XG4gICAgICBwYWNrYWdlX2lkIDogcGtnaWQsXG4gICAgICBlbWFpbCA6IGluY2x1ZGVFbWFpbCA/ICd0cnVlJyA6ICdmYWxzZSdcbiAgICB9O1xuXG4gICAgZ2V0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3dvcmtzcGFjZS9wdXNoJyxcbiAgICAgIHF1ZXJ5LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICB0aGlzLmdpdEluZm8gPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvZ2l0SW5mbycsIHt9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG59O1xuXG5cbmZ1bmN0aW9uIHBvc3QodXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICB2YXIgciA9IHJlcXVlc3RcbiAgIC5wb3N0KHVybClcbiAgIC53aXRoQ3JlZGVudGlhbHMoKVxuICAgLnR5cGUoJ2Zvcm0nKVxuICAgLnNlbmQoZGF0YSk7XG5cbiAgaWYoIGtleSApIHtcbiAgICByLnNldCgnQXV0aG9yaXphdGlvbicsIGtleSk7XG4gIH1cblxuICByLmVuZChjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIHBvc3RSYXcodXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICB2YXIgciA9IHJlcXVlc3RcbiAgIC5wb3N0KHVybClcbiAgIC53aXRoQ3JlZGVudGlhbHMoKVxuICAgLnNlbmQoZGF0YSk7XG5cbiAgIGlmKCBrZXkgKSB7XG4gICAgIHIuc2V0KCdBdXRob3JpemF0aW9uJywga2V5KTtcbiAgIH1cblxuICAgci5lbmQoY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBnZXQodXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICB2YXIgciA9IHJlcXVlc3RcbiAgICAuZ2V0KHVybClcbiAgICAucXVlcnkoZGF0YSB8fCB7fSlcbiAgICAud2l0aENyZWRlbnRpYWxzKCk7XG5cblxuICBpZigga2V5ICkge1xuICAgIHIuc2V0KCdBdXRob3JpemF0aW9uJywga2V5KTtcbiAgfVxuXG4gIHIuZW5kKGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKSB7XG4gIGlmKCBlcnIgKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ1JlcXVlc3QgRXJyb3InLFxuICAgICAgdHlwZSA6ICdodHRwJyxcbiAgICAgIGRldGFpbHM6IGVyclxuICAgIH0pO1xuICB9XG5cbiAgaWYoICFyZXNwICkge1xuICAgIHJldHVybiBjYWxsYmFjayh7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0IEVycm9yJyxcbiAgICAgIHR5cGUgOiAnaHR0cCcsXG4gICAgICBkZXRhaWxzOiAnU2VydmVyIGRpZCBub3Qgc2VuZCBhIHJlc3BvbnNlJ1xuICAgIH0pO1xuICB9XG5cbiAgaWYoICFyZXNwLmJvZHkgKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgbWVzc2FnZTogJ1JlcXVlc3QgRXJyb3InLFxuICAgICAgdHlwZSA6ICdodHRwJyxcbiAgICAgIGRldGFpbHM6ICdTZXJ2ZXIgZGlkIG5vdCBzZW5kIGEgcmVzcG9uc2UnXG4gICAgfSk7XG4gIH1cblxuICBpZiggcmVzcC5ib2R5LmVycm9yICkge1xuICAgIHJldHVybiBjYWxsYmFjayh7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0IEVycm9yJyxcbiAgICAgIHR5cGUgOiAnY2thbicsXG4gICAgICBkZXRhaWxzOiByZXNwID8gcmVzcC5ib2R5IDogJydcbiAgICB9KTtcbiAgfVxuXG4gIGlmKCByZXNwLmJvZHkuc3VjY2VzcyAmJiByZXNwLmJvZHkucmVzdWx0ICkge1xuICAgIGNhbGxiYWNrKHJlc3AuYm9keS5yZXN1bHQpO1xuICB9IGVsc2Uge1xuICAgIGNhbGxiYWNrKHJlc3AuYm9keSk7XG4gIH1cblxufVxuXG5mdW5jdGlvbiBpc0Vycm9yKGVyciwgcmVzcCkge1xuICBpZiggZXJyICkgcmV0dXJuIHRydWU7XG4gIGlmKCByZXNwICYmIHJlc3AuYm9keSAmJiByZXNwLmJvZHkuZXJyb3IgKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuIiwidmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoXCJldmVudHNcIikuRXZlbnRFbWl0dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICB0aGlzLmNrYW4gPSBjb25maWcuY2thbjtcbiAgdGhpcy5TREsgPSBjb25maWcuU0RLO1xuICBpZiggdGhpcy5ja2FuICkgdGhpcy5ja2FuLmRzID0gdGhpcztcblxuICAvLyBpcyB0aGlzIGFuIGV4aXN0aW5nIGRhdGFzZXRcbiAgdGhpcy5lZGl0TW9kZSA9IGNvbmZpZy5wYWNrYWdlX2lkID8gdHJ1ZSA6IGZhbHNlO1xuXG4gIC8vIGV4aXN0aW5nIHBhY2thZ2UgaWRcbiAgdGhpcy5wYWNrYWdlX2lkID0gY29uZmlnLnBhY2thZ2VfaWQ7XG5cbiAgdGhpcy5wYWNrYWdlID0gdGhpcy5TREsubmV3UGFja2FnZSgpO1xuICB0aGlzLnBhY2thZ2UubW9kZSA9IHRoaXMuZWRpdE1vZGUgPyAnZWRpdCcgOiAnY3JlYXRlJztcblxuICB0aGlzLm93bmVyX29yZ19uYW1lID0gJyc7XG5cbiAgdGhpcy5kYXRhc2V0QXR0cmlidXRlcyA9IHtcbiAgICAvL2dyb3VwX2J5IDogJycsXG4gICAgc29ydF9vbiA6ICcnLFxuICAgIHNvcnRfdHlwZSA6ICcnLFxuICAgIHNvcnRfZGVzY3JpcHRpb24gOiAnJ1xuICB9O1xuXG4gIC8vIGxpc3Qgb2YgYWxsIG5ldyByZXNvdXJjZXNcbiAgdGhpcy5yZXNvdXJjZXMgPSBbXTtcblxuICAvLyBoYXNoIG9mIGN1cnJlbnQgYXR0cmlidXRlIG5hbWUgbWFwcGluZ3NcbiAgLy8gIC0ga2V5OiBlY29zaXMgbmFtZVxuICAvLyAgLSB2YWx1ZTogZGF0YXNldCBuYW1lXG4gIHRoaXMuYXR0cmlidXRlTWFwID0ge307XG5cbiAgLy8gaW52ZXJzZSBsaXN0IG9mIGFib3ZlIG1hcCB3LyBrZXkgLyB2YWx1ZSBzd2l0Y2hlZFxuICB0aGlzLmludmVyc2VBdHRyaWJ1dGVNYXAgPSB7fTtcblxuICB0aGlzLm1ldGFkYXRhRGVmaW5pdGlvbnMgPSByZXF1aXJlKCcuL3NjaGVtYScpO1xuICB0aGlzLm1ldGFkYXRhTG9va3VwID0ge307XG4gIGZvciggdmFyIGNhdCBpbiB0aGlzLm1ldGFkYXRhRGVmaW5pdGlvbnMgKSB7XG4gICAgdmFyIGRlZnMgPSB0aGlzLm1ldGFkYXRhRGVmaW5pdGlvbnNbY2F0XTtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGRlZnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBkZWZzW2ldLmNhdGVnb3J5ID0gY2F0O1xuICAgICAgZGVmc1tpXS5mbGF0ID0gZGVmc1tpXS5uYW1lLnJlcGxhY2UoL1xccy9nLCcnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgZGVmc1tpXS5mbk5hbWUgPSBkZWZzW2ldLm5hbWUucmVwbGFjZSgvXFxzL2csJycpO1xuICAgICAgdGhpcy5tZXRhZGF0YUxvb2t1cFtkZWZzW2ldLm5hbWVdID0gZGVmc1tpXTtcbiAgICB9XG4gIH1cblxuICAvLyB0aGlzIGZsYWcgcHJldmVudHMgdXAgZnJvbSBtYWtpbmcgdXBkYXRlcyB3aGVuIHdlIGFyZSBpbml0aWFsbHlcbiAgLy8gc2V0dGluZyB0aGUgZGF0YVxuICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xuICB0aGlzLmxvYWRpbmdFcnJvciA9IGZhbHNlO1xuXG4gIC8vIHdpcmUgZXZlbnRzXG4gIHZhciBlZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgZWUuc2V0TWF4TGlzdGVuZXJzKDEwMCk7XG4gIHRoaXMub24gPSBmdW5jdGlvbihlLCBmbikge1xuICAgIC8vIGlmIHRoaW5ncyB3YW50IHRvIGtub3cgd2UgYXJlIGxvYWRlZCBhbmQgd2UgaGF2ZSBhbHJlYWR5IGZpcmVkLCBqdXN0IHRyaWdnZXIuXG4gICAgaWYoIGUgPT0gJ2xvYWQnICYmIHRoaXMubG9hZGVkICkge1xuICAgICAgc2V0VGltZW91dChmbiwgMjAwKTsgLy8gSEFDSzogbmVlZCB0byBmaXggc2V0VmFsdWVzKCkgb2YgZWNvc2lzLSotaW5wdXRcbiAgICAgIC8vcmV0dXJuXG4gICAgfVxuXG4gICAgZWUub24oZSwgZm4pO1xuICB9O1xuXG4gIHRoaXMubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2thbi5wcmVwYXJlV29ya3NwYWNlKHRoaXMucGFja2FnZV9pZCwgZnVuY3Rpb24ocmVzdWx0KXtcblxuICAgICAgaWYoIHJlc3VsdC5lcnJvciApIHtcbiAgICAgICAgdGhpcy5sb2FkaW5nRXJyb3IgPSByZXN1bHQ7XG4gICAgICAgIGVlLmVtaXQoJ2xvYWQtZXJyb3InLCByZXN1bHQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2thbi5nZXRXb3Jrc3BhY2UodGhpcy5wYWNrYWdlX2lkLCBmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICBpZiggcmVzdWx0LmVycm9yICkge1xuICAgICAgICAgIHRoaXMubG9hZGluZ0Vycm9yID0gcmVzdWx0O1xuICAgICAgICAgIGVlLmVtaXQoJ2xvYWQtZXJyb3InLCByZXN1bHQpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLl9zZXREYXRhKCk7XG5cbiAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICAgICAgICBlZS5lbWl0KCdsb2FkJyk7XG4gICAgICAgIHRoaXMuY2hlY2tDaGFuZ2VzKCk7XG5cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICB0aGlzLmxvYWRGcm9tVGVtcGxhdGUgPSBmdW5jdGlvbihja2FuUGFja2FnZSkge1xuICAgIHRoaXMucGFja2FnZS5yZXNldCgpO1xuICAgIHRoaXMucGFja2FnZS5tb2RlID0gJ2NyZWF0ZSc7XG5cbiAgICAvLyBzZXQgdGhlIGRlZmF1bHQgYXR0aXJidXRlcyBmb3IgdGhpcyBkYXRhc2V0XG4gICAgdGhpcy5wYWNrYWdlLmxvYWRGcm9tVGVtcGxhdGUoY2thblBhY2thZ2UsIHRoaXMuU0RLLnVzZXIpO1xuICAgIHRoaXMudXBkYXRlQWxpYXNMb29rdXAoKTtcblxuICAgIGVlLmVtaXQoJ2xvYWQnKTtcbiAgICB0aGlzLmZpcmVVcGRhdGUoKTtcbiAgfTtcblxuICB0aGlzLmNoZWNrQ2hhbmdlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKCAhdGhpcy5lZGl0TW9kZSB8fCAhdGhpcy5sYXN0UHVzaGVkICkgcmV0dXJuO1xuXG4gICAgdmFyIHQgPSBuZXcgRGF0ZSh0aGlzLnBhY2thZ2UuZGF0YS5tZXRhZGF0YV9tb2RpZmllZCkuZ2V0VGltZSgpO1xuXG4gICAgaWYoIHRoaXMuZGVsZXRlUmVzb3VyY2VUaW1lICkge1xuICAgICAgaWYoIHRoaXMuZGVsZXRlUmVzb3VyY2VUaW1lLmdldFRpbWUoKSA+IHQgKSB7XG4gICAgICAgIHQgPSB0aGlzLmRlbGV0ZVJlc291cmNlVGltZS5nZXRUaW1lKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlc3AgPSB7XG4gICAgICBsYXN0UHVzaGVkIDogdGhpcy5sYXN0UHVzaGVkLFxuICAgICAgbGFzdFVwZGF0ZWQgOiBuZXcgRGF0ZSh0KSxcbiAgICAgIHVucHVibGlzaGVkQ2hhbmdlcyA6ICh0aGlzLmxhc3RQdXNoZWQuZ2V0VGltZSgpIDwgbmV3IERhdGUodCkuZ2V0VGltZSgpKVxuICAgIH07XG5cbiAgICBlZS5lbWl0KCdjaGFuZ2VzJywgcmVzcCk7XG4gICAgcmV0dXJuIHJlc3A7XG4gIH0sXG5cbiAgLy8gaGVscGVyIGZvciB3aGVuIGRhdGEgbG9hZHNcbiAgdGhpcy5fc2V0RGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWRpdE1vZGUgPSB0cnVlO1xuXG4gICAgdGhpcy5sYXN0UHVzaGVkID0gdGhpcy5yZXN1bHQucHVzaGVkO1xuICAgIGlmKCB0aGlzLmxhc3RQdXNoZWQgKSB7XG4gICAgICB0aGlzLmxhc3RQdXNoZWQgPSBuZXcgRGF0ZSh0aGlzLmxhc3RQdXNoZWQpO1xuICAgIH1cblxuICAgIHZhciBja2FuUGFja2FnZSA9IHRoaXMucmVzdWx0LmNrYW4ucGFja2FnZTtcbiAgICB0aGlzLnBhY2thZ2VfaWQgPSBja2FuUGFja2FnZS5pZDtcblxuICAgIHRoaXMucGFja2FnZS5yZXNldChja2FuUGFja2FnZSk7XG4gICAgdGhpcy5wYWNrYWdlLmxvYWRGcm9tVGVtcGxhdGUoY2thblBhY2thZ2UsIG51bGwsIHRydWUpO1xuXG4gICAgdGhpcy5kYXRhc2hlZXRzID0gdGhpcy5yZXN1bHQucmVzb3VyY2VzO1xuXG4gICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSB7fTtcbiAgICB0aGlzLmludmVyc2VBdHRyaWJ1dGVNYXAgPSB7fTtcblxuICAgIGlmKCB0aGlzLnJlc3VsdC5wYWNrYWdlLm1hcCAmJiBPYmplY3QodGhpcy5wYWNrYWdlLmdldEFsaWFzZXMoKSkubGVuZ3RoID09PSAwICkge1xuICAgICAgdGhpcy5wYWNrYWdlLnNldEFsaWFzZXModGhpcy5yZXN1bHQucGFja2FnZS5tYXApO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlQWxpYXNMb29rdXAoKTtcblxuICAgIC8vIGNoZWNrIGZvciBiYWRuZXNzXG4gICAgaWYoIHRoaXMucmVzdWx0LnBhY2thZ2Uuc29ydCAmJiBPYmplY3QodGhpcy5wYWNrYWdlLmdldFNvcnQoKSkubGVuZ3RoID09PSAwICkge1xuICAgICAgdGhpcy5wYWNrYWdlLnNldFNvcnQodGhpcy5yZXN1bHQucGFja2FnZS5zb3J0KTtcbiAgICB9XG5cbiAgICB0aGlzLnJlc291cmNlcyA9IHRoaXMucmVzdWx0LmNrYW4ucmVzb3VyY2VzO1xuXG4gICAgdmFyIHppcHMgPSB7fTsgLy8gdXNlZCB0byBxdWlja2x5IGFkZCByZXNvdXJjZSBzdHVic1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5yZXNvdXJjZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5yZXNvdXJjZXNbaV0uZm9ybWF0LnRvTG93ZXJDYXNlKCkgPT09ICd6aXAnIHx8IHRoaXMucmVzb3VyY2VzW2ldLm5hbWUudG9Mb3dlckNhc2UoKS5tYXRjaCgvXFwuemlwJC8pICkge1xuICAgICAgICB6aXBzW3RoaXMucmVzb3VyY2VzW2ldLmlkXSA9IHRoaXMucmVzb3VyY2VzW2ldO1xuICAgICAgICB0aGlzLnJlc291cmNlc1tpXS5jaGlsZFJlc291cmNlcyA9IFtdO1xuICAgICAgICB0aGlzLnJlc291cmNlc1tpXS5pc1ppcCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICB0aGlzLnJlc291cmNlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgaWYoIGEubmFtZSA+IGIubmFtZSApIHJldHVybiAxO1xuICAgICAgaWYoIGEubmFtZSA8IGIubmFtZSApIHJldHVybiAtMTtcbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuXG5cbiAgICB0aGlzLnJlc291cmNlTG9va3VwID0ge307XG5cbiAgICAvLyBjcmVhdGUgZmFrZSBzdHVicyBmb3IgemlwIGZpbGUgcmVzb3VyY2VzXG4gICAgdmFyIGFscmVhZHlBZGRlZCA9IHt9O1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhc2hlZXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoICF0aGlzLmRhdGFzaGVldHNbaV0uZnJvbVppcCApIGNvbnRpbnVlO1xuICAgICAgaWYoIGFscmVhZHlBZGRlZFt0aGlzLmRhdGFzaGVldHNbaV0ucmVzb3VyY2VJZF0gKSBjb250aW51ZTtcblxuICAgICAgdmFyIHIgPSB0aGlzLmRhdGFzaGVldHNbaV07XG5cbiAgICAgIHZhciBzdHViID0ge1xuICAgICAgICBpZCA6IHIucmVzb3VyY2VJZCxcbiAgICAgICAgcGFja2FnZV9pZCA6IHIucGFja2FnZUlkLFxuICAgICAgICBmcm9tWmlwIDogdHJ1ZSxcbiAgICAgICAgemlwIDogci56aXAsXG4gICAgICAgIG5hbWUgOiByLm5hbWVcbiAgICAgIH1cblxuICAgICAgemlwc1tyLnppcC5yZXNvdXJjZUlkXS5jaGlsZFJlc291cmNlcy5wdXNoKHN0dWIpO1xuICAgICAgdGhpcy5yZXNvdXJjZXMucHVzaChzdHViKTtcblxuICAgICAgYWxyZWFkeUFkZGVkW3IucmVzb3VyY2VJZF0gPSAxOyAvLyB3aHk/XG4gICAgfVxuXG4gICAgLy8gbWFwIHJlc291cmNlcyB0byBkYXRhc2hlZXRzIGZvciBkYXN0ZXIgbG9va3VwXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnJlc291cmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHZhciBkYXRhc2hlZXRzID0gW107XG4gICAgICBmb3IoIHZhciBqID0gMDsgaiA8IHRoaXMuZGF0YXNoZWV0cy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgaWYoIHRoaXMuZGF0YXNoZWV0c1tqXS5yZXNvdXJjZUlkID09IHRoaXMucmVzb3VyY2VzW2ldLmlkICkge1xuICAgICAgICAgIGRhdGFzaGVldHMucHVzaCh0aGlzLmRhdGFzaGVldHNbal0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVzb3VyY2VMb29rdXBbdGhpcy5yZXNvdXJjZXNbaV0uaWRdID0gdGhpcy5yZXNvdXJjZXNbaV07XG4gICAgICB0aGlzLnJlc291cmNlc1tpXS5kYXRhc2hlZXRzID0gZGF0YXNoZWV0cztcbiAgICB9XG5cbiAgICB0aGlzLmZpcmVVcGRhdGUoKTtcbiAgfVxuXG4gIHRoaXMudXBkYXRlQWxpYXNMb29rdXAgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmF0dHJpYnV0ZU1hcCA9IHRoaXMucGFja2FnZS5nZXRBbGlhc2VzKCk7XG4gICAgZm9yKCB2YXIga2V5IGluIHRoaXMuYXR0cmlidXRlTWFwICkge1xuICAgICAgdGhpcy5pbnZlcnNlQXR0cmlidXRlTWFwW3RoaXMuYXR0cmlidXRlTWFwW2tleV1dID0ga2V5O1xuICAgIH1cbiAgfTtcblxuICB0aGlzLnNldFNoZWV0ID0gZnVuY3Rpb24oc2hlZXQpIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YXNoZWV0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmRhdGFzaGVldHNbaV0ucmVzb3VyY2VJZCA9PSBzaGVldC5yZXNvdXJjZUlkICYmXG4gICAgICAgICAgdGhpcy5kYXRhc2hlZXRzW2ldLnNoZWV0SWQgPT0gc2hlZXQuc2hlZXRJZCApIHtcblxuICAgICAgICAgIHRoaXMuZGF0YXNoZWV0c1tpXSA9IHNoZWV0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZXNvdXJjZSA9IHRoaXMucmVzb3VyY2VMb29rdXBbc2hlZXQucmVzb3VyY2VJZF07XG4gICAgaWYoICFyZXNvdXJjZSApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBdHRlbXB0aW5nIHRvIHNldCBzaGVldCB3aXRoIGEgcmVzb3VyY2VJZCB0aGF0IGRvZXMgbm90IGV4aXN0Jyk7XG4gICAgICBjb25zb2xlLmxvZyhzaGVldCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCByZXNvdXJjZS5kYXRhc2hlZXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHJlc291cmNlLmRhdGFzaGVldHNbaV0uc2hlZXRJZCA9PSBzaGVldC5zaGVldElkICkge1xuICAgICAgICAgIHJlc291cmNlLmRhdGFzaGVldHNbaV0gPSBzaGVldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNoZWNrQ2hhbmdlcygpO1xuICB9XG5cbiAgdGhpcy5maXJlVXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgZWUuZW1pdCgndXBkYXRlJyk7XG4gIH07XG5cbiAgdGhpcy5wYWNrYWdlLm9uKCdzYXZlLWVuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jaGVja0NoYW5nZXMoKTtcbiAgICB0aGlzLmZpcmVVcGRhdGUoKTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICB0aGlzLnBhY2thZ2Uub24oJ3ZhbHVlLXNldC1vbi1jcmVhdGUnLCBmdW5jdGlvbigpe1xuICAgIHRoaXMuZmlyZVVwZGF0ZSgpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIC8vIGFmdGVyIGEgcmVzb3VyY2UgaXMgYWRkZWQsIG91ciBlbnRpcmUgc3RhdGUgaXMgZGlmZmVyZW50XG4gIHRoaXMucnVuQWZ0ZXJSZXNvdXJjZUFkZCA9IGZ1bmN0aW9uKHdvcmtzcGFjZURhdGEpIHtcbiAgICB0aGlzLnJlc3VsdCA9IHdvcmtzcGFjZURhdGE7XG4gICAgdGhpcy5fc2V0RGF0YSgpO1xuICAgIHRoaXMuY2hlY2tDaGFuZ2VzKCk7XG4gIH07XG5cblxuICAvLyBnZXQgYWxsIGF0dGlyYnV0ZXMgZnJvbSBzaGVldHMgbWFya2VkIGFzIGRhdGFcbiAgdGhpcy5nZXREYXRhc2hlZXRBdHRyaWJ1dGVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF0dHJzID0ge30sIHNoZWV0LCBhdHRyO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGFzaGVldHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBzaGVldCA9IHRoaXMuZGF0YXNoZWV0c1tpXTtcbiAgICAgIGlmKCBzaGVldC5tZXRhZGF0YSApIGNvbnRpbnVlO1xuXG4gICAgICBmb3IoIHZhciBqID0gMDsgaiA8IHNoZWV0LmF0dHJpYnV0ZXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGF0dHIgPSBzaGVldC5hdHRyaWJ1dGVzW2pdO1xuICAgICAgICBhdHRyc1thdHRyXSA9IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGF0dHJzKTtcbiAgfTtcblxuICB0aGlzLmlzRWNvc2lzTWV0YWRhdGEgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvXFxzL2csICcnKS50b0xvd2VyQ2FzZSgpO1xuICAgIGZvciggdmFyIGtleSBpbiB0aGlzLm1ldGFkYXRhTG9va3VwICkge1xuICAgICAgaWYoIHRoaXMubWV0YWRhdGFMb29rdXBba2V5XS5mbGF0ID09IG5hbWUgKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIHRoaXMuZ2V0U2NvcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIHZhciB0b3RhbCA9IDc7XG5cbiAgICB2YXIgYnJlYWtkb3duID0ge1xuICAgICAgYmFzaWMgOiB7XG4gICAgICAgIHNjb3JlIDogMCxcbiAgICAgICAgdG90YWwgOiA1XG4gICAgICB9LFxuICAgICAgbGlua2VkIDoge1xuICAgICAgICBzY29yZSA6IDAsXG4gICAgICAgIHRvdGFsIDogMVxuICAgICAgfSxcbiAgICAgIGxvY2F0aW9uIDoge1xuICAgICAgICBzY29yZSA6IDAsXG4gICAgICAgIHRvdGFsIDogMVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBjaGVjayBkYXRhc2V0IGxldmVsIGVjb3NpcyBtZXRhZGF0YVxuICAgIHZhciBjYXQgPSAnJztcbiAgICBmb3IoIHZhciBrZXkgaW4gdGhpcy5tZXRhZGF0YUxvb2t1cCApIHtcbiAgICAgIGNhdCA9IHRoaXMubWV0YWRhdGFMb29rdXBba2V5XS5jYXRlZ29yeS50b0xvd2VyQ2FzZSgpO1xuICAgICAga2V5ID0ga2V5LnJlcGxhY2UoLyAvZywgJycpO1xuXG4gICAgICBpZiggIWJyZWFrZG93bltjYXRdICkge1xuICAgICAgICBicmVha2Rvd25bY2F0XSA9IHtcbiAgICAgICAgICBzY29yZSA6IDAsXG4gICAgICAgICAgdG90YWwgOiAwXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGlmKCBrZXkgPT09ICdMYXRpdHVkZScgfHwga2V5ID09PSAnTG9uZ2l0dWRlJyApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmKCB0aGlzLnBhY2thZ2VbJ2dldCcra2V5XSApIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5wYWNrYWdlWydnZXQnK2tleV0oKTtcbiAgICAgICAgaWYoIHZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgY291bnQrKztcblxuICAgICAgICAgIGlmKCBrZXkgPT09ICdLZXl3b3JkcycgfHwga2V5ID09PSAnV2Vic2l0ZScgKSB7XG4gICAgICAgICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWtkb3duW2NhdF0uc2NvcmUrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdG90YWwrKztcbiAgICAgICAgaWYoIGtleSA9PT0gJ0tleXdvcmRzJyB8fCBrZXkgPT09ICdXZWJzaXRlJyApIHtcbiAgICAgICAgICBicmVha2Rvd24uYmFzaWMudG90YWwrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVha2Rvd25bY2F0XS50b3RhbCsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIHRoaXMucGFja2FnZS5nZXRUaXRsZSgpICkge1xuICAgICAgY291bnQrKztcbiAgICAgIGJyZWFrZG93bi5iYXNpYy5zY29yZSsrO1xuICAgIH1cbiAgICBpZiggdGhpcy5wYWNrYWdlLmdldERlc2NyaXB0aW9uKCkgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmJhc2ljLnNjb3JlKys7XG4gICAgfVxuICAgIGlmKCBPYmplY3Qua2V5cyh0aGlzLnBhY2thZ2UuZ2V0TGlua2VkRGF0YSgpKS5sZW5ndGggPiAwICkge1xuICAgICAgY291bnQrKztcbiAgICAgIGJyZWFrZG93bi5saW5rZWQuc2NvcmUrKztcbiAgICB9XG4gICAgaWYoIHRoaXMucGFja2FnZS5nZXRPcmdhbml6YXRpb24oKSApIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICB9XG4gICAgaWYoIHRoaXMucGFja2FnZS5nZXRWZXJzaW9uKCkgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmJhc2ljLnNjb3JlKys7XG4gICAgfVxuICAgIGlmKCB0aGlzLnBhY2thZ2UuZ2V0TGljZW5zZUlkKCkgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmJhc2ljLnNjb3JlKys7XG4gICAgfVxuICAgIGlmKCBPYmplY3Qua2V5cyh0aGlzLnBhY2thZ2UuZ2V0R2VvSnNvbigpKS5sZW5ndGggPiAwICkge1xuICAgICAgY291bnQrKztcbiAgICAgIGJyZWFrZG93bi5sb2NhdGlvbi5zY29yZSsrO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzY29yZTogY291bnQsXG4gICAgICB0b3RhbCA6IHRvdGFsLFxuICAgICAgYnJlYWtkb3duIDogYnJlYWtkb3duXG4gICAgfTtcbiAgfTtcbn07XG4iLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG52YXIgRGF0YXN0b3JlID0gcmVxdWlyZSgnLi9kYXRhc3RvcmUnKTtcbnZhciBDS0FOID0gcmVxdWlyZSgnLi9ja2FuJyk7XG52YXIgUGFja2FnZSA9IHJlcXVpcmUoJy4vcGFja2FnZScpO1xuXG5mdW5jdGlvbiBTREsoY29uZmlnKSB7XG4gIHRoaXMudXNlciA9IG51bGw7XG5cbiAgdGhpcy5kZWZhdWx0R3JvdXAgPSBjb25maWcuZGVmYXVsdEdyb3VwO1xuXG4gIHRoaXMubmV3UGFja2FnZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IFBhY2thZ2UoZGF0YSwgdGhpcyk7XG4gIH07XG5cbiAgdGhpcy5ja2FuID0gbmV3IENLQU4oe1xuICAgIGhvc3QgOiBjb25maWcuaG9zdCxcbiAgICBrZXkgOiBjb25maWcua2V5XG4gIH0pO1xuXG4gIHRoaXMuZHMgPSBuZXcgRGF0YXN0b3JlKHtcbiAgICBja2FuIDogdGhpcy5ja2FuLFxuICAgIHBhY2thZ2VfaWQgOiBjb25maWcucGFja2FnZV9pZCxcbiAgICBTREsgOiB0aGlzXG4gIH0pO1xuXG4gIC8vIHdpcmUgZXZlbnRzXG4gIHZhciBlZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgdGhpcy5vbiA9IGZ1bmN0aW9uKGUsIGZuKSB7XG4gICAgICAgZWUub24oZSwgZm4pO1xuICB9O1xuXG5cbiAgLy8gZ2V0IHRoZSB1c2VyIGFjY291bnRcbiAgdGhpcy5ja2FuLmdldEFjdGl2ZVVzZXIoZnVuY3Rpb24ocmVzcCl7XG4gICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICB0aGlzLnVzZXJMb2FkRXJyb3IgPSB0cnVlO1xuICAgIH1cblxuXG4gICAgdGhpcy51c2VyID0gcmVzcDtcbiAgICBlZS5lbWl0KCd1c2VyLWxvYWQnKTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICByZXF1aXJlKCcuL2xvZ2ljJykodGhpcyk7XG5cbiAgaWYoIGNvbmZpZy5wYWNrYWdlX2lkICkgdGhpcy5kcy5sb2FkKCk7XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNESztcbiIsInZhciBTREs7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2RrKSB7XG4gIFNESyA9IHNkaztcbiAgU0RLLmNyZWF0ZVBhY2thZ2UgPSBjcmVhdGVQYWNrYWdlO1xufTtcblxuZnVuY3Rpb24gY3JlYXRlUGFja2FnZShkYXRhLCBjYWxsYmFjaykge1xuXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFNESykge1xuICByZXF1aXJlKCcuL2NyZWF0ZVBhY2thZ2UnKShTREspO1xuICByZXF1aXJlKCcuL3ZlcmlmeScpKFNESyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihTREspIHtcbiAgU0RLLnZlcmlmeSA9IHtcbiAgICBuYW1lIDogcmVxdWlyZSgnLi9uYW1lJykoU0RLKVxuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU0RLKSB7XG4gIHJldHVybiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaykge1xuXG4gICAgU0RLLmNrYW4uZ2V0UGFja2FnZShuYW1lLCBmdW5jdGlvbihyZXNwKXtcbiAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2sodHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKGZhbHNlKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9O1xufTtcbiIsIi8vIGF0dHJpYnV0ZXMgdGhhdCBoYXZlIGEgZGlyZWN0IG1hcHBpbmcgdG8gQ0tBTiBzdGFuZGFyZCBhdHRyaWJ1dGVzLFxuLy8gc28gdGhleSBzaG91bGQgbm90IGJlIHdyYXBwZWQgdXAgaW4gdGhlICdleHRyYXMnIGZpZWxkcy4gIElFLCB1c2Vcbi8vIHRoZXNlIGZ1bmN0aW9ucy5cbnZhciBja2FuQXR0cml1dGVzID0gWydLZXl3b3JkcycsICdXZWJzaXRlJywgJ0F1dGhvcicsICdBdXRob3IgRW1haWwnLFxuJ01haW50YWluZXIgRW1haWwnLCAnTWFpbnRhaW5lciddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGF0dHJpYnV0ZSwgUGFja2FnZSkge1xuICBpZiggYXR0cmlidXRlLm5hbWUgPT09ICdLZXl3b3JkcycgfHwgYXR0cmlidXRlLm5hbWUgPT09ICdXZWJzaXRlJyApIHJldHVybjtcblxuICBpZiggYXR0cmlidXRlLmlucHV0ID09PSAnY29udHJvbGxlZCcgKSB7XG4gICAgY3JlYXRlQ29udHJvbGxlZElucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSk7XG4gIH0gZWxzZSBpZiggYXR0cmlidXRlLmlucHV0ID09PSAnc3BsaXQtdGV4dCcgKSB7XG4gICAgY3JlYXRlQ29udHJvbGxlZElucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSk7XG4gIH0gZWxzZSBpZiggYXR0cmlidXRlLmlucHV0ID09PSAnY29udHJvbGxlZC1zaW5nbGUnICkge1xuICAgIGNyZWF0ZVNpbmdsZUlucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSk7XG4gIH0gZWxzZSBpZiggYXR0cmlidXRlLmlucHV0ID09PSAndGV4dCcgfHwgYXR0cmlidXRlLmlucHV0ID09PSAnbGF0bG5nJyApIHtcbiAgICBjcmVhdGVJbnB1dChhdHRyaWJ1dGUsIFBhY2thZ2UpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVJbnB1dChhdHRyaWJ1dGUsIFBhY2thZ2UpIHtcbiAgdmFyIG5hbWUgPSBhdHRyaWJ1dGUubmFtZS5yZXBsYWNlKC8gL2csICcnKTtcblxuICBQYWNrYWdlLnByb3RvdHlwZVsnZ2V0JytuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKTtcbiAgfTtcblxuICBQYWNrYWdlLnByb3RvdHlwZVsnc2V0JytuYW1lXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgdmFsdWUrJycpO1xuICAgIHRoaXMuX29uVXBkYXRlKGF0dHJpYnV0ZS5uYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2luZ2xlSW5wdXQoYXR0cmlidXRlLCBQYWNrYWdlKSB7XG4gIHZhciBuYW1lID0gYXR0cmlidXRlLm5hbWUucmVwbGFjZSgvIC9nLCAnJyk7XG5cbiAgUGFja2FnZS5wcm90b3R5cGVbJ2dldCcrbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFeHRyYShhdHRyaWJ1dGUubmFtZSk7XG4gIH07XG5cbiAgUGFja2FnZS5wcm90b3R5cGVbJ3NldCcrbmFtZV0gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciB0ID0gdG9rZW5pemUodmFsdWUpO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBhdHRyaWJ1dGUudm9jYWJ1bGFyeS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0b2tlbml6ZShhdHRyaWJ1dGUudm9jYWJ1bGFyeVtpXSkgPT09IHQgKSB7XG4gICAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsIGF0dHJpYnV0ZS52b2NhYnVsYXJ5W2ldKTtcbiAgICAgICAgdGhpcy5fb25VcGRhdGUoYXR0cmlidXRlLm5hbWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGF0dHJpYnV0ZS5hbGxvd090aGVyICkge1xuICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgJ090aGVyJyk7XG4gICAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKycgT3RoZXInLCB2YWx1ZSk7XG4gICAgICB0aGlzLl9vblVwZGF0ZShhdHRyaWJ1dGUubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsICcnKTtcbiAgICB9XG4gIH07XG5cbiAgaWYoIGF0dHJpYnV0ZS5hbGxvd090aGVyICkge1xuICAgIFBhY2thZ2UucHJvdG90eXBlWydnZXQnK25hbWUrJ090aGVyJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKycgT3RoZXInKTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRyb2xsZWRJbnB1dChhdHRyaWJ1dGUsIFBhY2thZ2UpIHtcbiAgdmFyIG5hbWUgPSBhdHRyaWJ1dGUubmFtZS5yZXBsYWNlKC8gL2csICcnKTtcblxuICBQYWNrYWdlLnByb3RvdHlwZVsnZ2V0JytuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhdHRyID0gdGhpcy5nZXRFeHRyYShhdHRyaWJ1dGUubmFtZSk7XG4gICAgaWYoICFhdHRyICkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhdHRyLnNwbGl0KCcsJykubWFwKGNsZWFuVGVybSk7XG4gIH07XG5cbiAgaWYoIGF0dHJpYnV0ZS5hbGxvd090aGVyICkge1xuICAgIFBhY2thZ2UucHJvdG90eXBlWydnZXQnK25hbWUrJ090aGVyJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhdHRyID0gdGhpcy5nZXRFeHRyYShhdHRyaWJ1dGUubmFtZSsnIE90aGVyJyk7XG4gICAgICBpZiggIWF0dHIgKSByZXR1cm4gW107XG4gICAgICByZXR1cm4gYXR0ci5zcGxpdCgnLCcpLm1hcChjbGVhblRlcm0pO1xuICAgIH07XG4gIH1cblxuICBQYWNrYWdlLnByb3RvdHlwZVsnc2V0JytuYW1lXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYoICF2YWx1ZSApIHtcbiAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsIG51bGwpO1xuICAgICAgaWYoIGF0dHJpYnV0ZS5hbGxvd090aGVyICkge1xuICAgICAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKycgT3RoZXInLCBudWxsKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fb25VcGRhdGUoYXR0cmlidXRlLm5hbWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0ZXJtcztcbiAgICBpZiggIUFycmF5LmlzQXJyYXkodmFsdWUpICkge1xuICAgICAgdmFsdWUgPSB2YWx1ZSsnJztcbiAgICAgIHRlcm1zID0gdmFsdWUuc3BsaXQoJywnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGVybXMgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICB0ZXJtcyA9IHRlcm1zLm1hcChjbGVhblRlcm0pO1xuXG4gICAgaWYoIGF0dHJpYnV0ZS5pbnB1dCA9PT0gJ2NvbnRyb2xsZWQnICkge1xuICAgICAgdmFyIHZhbHVlcyA9IGdldFZhbHVlcyh0ZXJtcywgYXR0cmlidXRlLnZvY2FidWxhcnkpO1xuXG4gICAgICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgJiYgdmFsdWVzLm90aGVyLmxlbmd0aCA+IDAgJiYgdmFsdWVzLnZhbGlkLmluZGV4T2YoJ090aGVyJykgPT0gLTEgKSB7XG4gICAgICAgIHZhbHVlcy52YWxpZC5wdXNoKCdPdGhlcicpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lLCB2YWx1ZXMudmFsaWQuam9pbignLCAnKSk7XG4gICAgICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgKSB7XG4gICAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUrJyBPdGhlcicsIHZhbHVlcy5vdGhlci5qb2luKCcsICcpKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiggYXR0cmlidXRlLmlucHV0ID09PSAnc3BsaXQtdGV4dCcgKSB7XG4gICAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lLCB0ZXJtcy5qb2luKCcsICcpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vblVwZGF0ZShhdHRyaWJ1dGUubmFtZSk7XG4gIH07XG5cbi8qXG4gIFBhY2thZ2UucHJvdG90eXBlWydhZGQnK25hbWVdID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiggdHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyApIHtcbiAgICAgIHRocm93KG5ldyBFcnJvcigndmFsdWUgbXVzdCBiZSB0eXBlIHN0cmluZycpKTtcbiAgICB9XG5cbiAgICB2YXIgY3VycmVudFZhbHVlID0gdGhpcy5nZXRFeHRyYShuYW1lKS5zcGxpdCgnLCcpLm1hcChjbGVhblRlcm0pO1xuICAgIHZhciBjdXJyZW50T3RoZXIgPSB0aGlzLmdldEV4dHJhKG5hbWUrJyBPdGhlcicpLnNwbGl0KCcsJykubWFwKGNsZWFuVGVybSk7XG5cbiAgICBpZiggYXR0cmlidXRlLnR5cGUgPT09ICdjb250cm9sbGVkJyApIHtcbiAgICAgIHZhciB0ID0gdG9rZW5pemUodmFsdWUpO1xuICAgICAgdmFyIHZhbGlkID0gZmFsc2U7XG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGF0dHJpYnV0ZS52b2NhYnVsYXJ5Lmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiggdG9rZW5pemUoYXR0cmlidXRlLnZvY2FidWxhcnlbaV0pID09PSB0ICkge1xuICAgICAgICAgIHQgPSBhdHRyaWJ1dGUudm9jYWJ1bGFyeVtpXTtcbiAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoIHZhbGlkICkge1xuICAgICAgICBjdXJyZW50VmFsdWUucHVzaCh0KTtcbiAgICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgY3VycmVudFZhbHVlLmpvaW4oJywgJykpO1xuICAgICAgfSBlbHNlIGlmKCBhdHRyaWJ1dGUuYWxsb3dPdGhlciApIHtcbiAgICAgICAgY3VycmVudE90aGVyLnB1c2godCk7XG4gICAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsIGN1cnJlbnRWYWx1ZS5qb2luKCcsICcpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcbiovXG59XG5cbmZ1bmN0aW9uIGNsZWFuVGVybSh0eHQpIHtcbiAgcmV0dXJuIHR4dC50cmltKCk7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlcyh0ZXJtcywgdm9jYWJ1bGFyeSkge1xuICB2YXIgdmFsaWQgPSBbXTtcbiAgdmFyIG90aGVyID0gW107XG5cbiAgdmFyIG1hcCA9IHt9O1xuICB2b2NhYnVsYXJ5LmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG4gICAgbWFwW3Rva2VuaXplKG5hbWUpXSA9IG5hbWU7XG4gIH0pO1xuXG4gIHZhciB0O1xuICBmb3IoIHZhciBpID0gMDsgaSA8IHRlcm1zLmxlbmd0aDsgaSsrICkge1xuICAgIHQgPSB0b2tlbml6ZSh0ZXJtc1tpXSk7XG5cbiAgICBpZiggbWFwW3RdICkge1xuICAgICAgaWYoIHZhbGlkLmluZGV4T2YobWFwW3RdKSA9PT0gLTEgKSB7XG4gICAgICAgIHZhbGlkLnB1c2gobWFwW3RdKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIG90aGVyLmluZGV4T2YobWFwW3RdKSA9PT0gLTEgKSB7XG4gICAgICAgIG90aGVyLnB1c2godGVybXNbaV0udHJpbSgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHZhbGlkIDogdmFsaWQsXG4gICAgb3RoZXIgOiBvdGhlclxuICB9O1xufVxuXG5mdW5jdGlvbiB0b2tlbml6ZShuYW1lKSB7XG4gIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzL2csICcnKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oUGFja2FnZSl7XG4gIFBhY2thZ2UucHJvdG90eXBlLmNyZWF0ZSA9IGNyZWF0ZTtcbiAgUGFja2FnZS5wcm90b3R5cGUuZGVsZXRlID0gZGVsZXRlRm47XG4gIFBhY2thZ2UucHJvdG90eXBlLnNhdmUgPSBzYXZlO1xufTtcblxuXG5mdW5jdGlvbiBkZWxldGVGbihjYWxsYmFjaykge1xuICB0aGlzLlNESy5ja2FuLmRlbGV0ZVBhY2thZ2UodGhpcy5kYXRhLmlkLCBmdW5jdGlvbihyZXNwKSB7XG4gICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAvLyBFUlJPUiA1XG4gICAgICByZXNwLmNvZGUgPSA1O1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3ApO1xuICAgIH1cblxuICAgIGNhbGxiYWNrKHtzdWNjZXNzOiB0cnVlfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGUoY2FsbGJhY2spIHtcbiAgdGhpcy5TREsuY2thbi5jcmVhdGVQYWNrYWdlKHRoaXMuZGF0YSwgZnVuY3Rpb24ocmVzcCkge1xuICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgIC8vIEVSUk9SIDZcbiAgICAgICAgcmVzcC5jb2RlID0gNjtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgfVxuXG4gICAgICBpZiggIXJlc3AuaWQgKSB7XG4gICAgICAgIC8vIEVSUk9SIDdcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgICAgICBlcnJvciA6IHRydWUsXG4gICAgICAgICAgbWVzc2FnZSA6ICdGYWlsZWQgdG8gY3JlYXRlIGRhdGFzZXQnLFxuICAgICAgICAgIGNvZGUgOiA3XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayhyZXNwKTtcbiAgICB9LmJpbmQodGhpcylcbiAgKTtcbn1cblxudmFyIHNhdmVUaW1lciA9IC0xO1xuZnVuY3Rpb24gc2F2ZShjYWxsYmFjaykge1xuICB0aGlzLmVlLmVtaXQoJ3NhdmUtc3RhcnQnKTtcblxuICBpZiggc2F2ZVRpbWVyICE9PSAtMSApIHtcbiAgICBjbGVhclRpbWVvdXQoc2F2ZVRpbWVyKTtcbiAgfVxuXG4gIHNhdmVUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICBzYXZlVGltZXIgPSAtMTtcbiAgICBfc2F2ZSh0aGlzLCBjYWxsYmFjayk7XG4gIH0uYmluZCh0aGlzKSwgNTAwKTtcbn1cblxuZnVuY3Rpb24gX3NhdmUocmVmLCBjYWxsYmFjaykge1xuICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSB0aGUgY29ycmVjdCBwYWNrYWdlIHN0YXRlXG4gIC8vIGFsbCByZXNvdXJjZXMgbmVlZCB0byBiZSBpbmNsdWRlZCB3aGVuIHlvdSBtYWtlIGEgdXBkYXRlUGFja2FnZSBjYWxsXG4gIHJlZi5TREsuY2thbi5nZXRQYWNrYWdlKHJlZi5kYXRhLmlkLCBmdW5jdGlvbihyZXNwKSB7XG4gICAgICBpZiggcmVzcC5lcnJvciApIHtcbiAgICAgICAgcmVzcC5jb2RlID0gODtcbiAgICAgICAgcmVzcC5tZXNzYWdlICs9ICcuIEZhaWxlZCB0byBmZXRjaCBwYWNrYWdlIGZvciB1cGRhdGUuJztcbiAgICAgICAgcmVmLmVlLmVtaXQoJ3NhdmUtZW5kJywgcmVzcCk7XG4gICAgICAgIGlmKCBjYWxsYmFjayApIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBtZXRhZGF0YSA9IHJlc3A7XG4gICAgICBmb3IoIHZhciBrZXkgaW4gcmVmLmRhdGEgKSB7XG4gICAgICAgIG1ldGFkYXRhW2tleV0gPSByZWYuZGF0YVtrZXldO1xuICAgICAgfVxuXG4gICAgICByZWYuU0RLLmNrYW4udXBkYXRlUGFja2FnZShtZXRhZGF0YSxcbiAgICAgICAgZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICAgICAgLy8gRVJST1IgOVxuICAgICAgICAgICAgcmVzcC5jb2RlID0gOTtcbiAgICAgICAgICAgIHJlc3AubWVzc2FnZSArPSAnLiBGYWlsZWQgdG8gdXBkYXRlIGRhdGFzZXQuJztcbiAgICAgICAgICAgIHJlZi5lZS5lbWl0KCdzYXZlLWVuZCcsIHJlc3ApO1xuICAgICAgICAgICAgaWYoIGNhbGxiYWNrICkgY2FsbGJhY2socmVzcCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoICFyZXNwLmlkICkgIHtcbiAgICAgICAgICAgIHZhciBtc2cgPSB7XG4gICAgICAgICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICBtZXNzYWdlIDogJ0ZhaWxlZCB0byB1cGRhdGUgZGF0YXNldCcsXG4gICAgICAgICAgICAgIGNvZGUgOiAxMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlZi5lZS5lbWl0KCdzYXZlLWVuZCcsIG1zZyk7XG4gICAgICAgICAgICAvLyBFUlJPUiAxMFxuICAgICAgICAgICAgaWYoIGNhbGxiYWNrICkgY2FsbGJhY2sobXNnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZWYuZGF0YSA9IHJlc3A7XG5cbiAgICAgICAgICBpZiggY2FsbGJhY2sgKSBjYWxsYmFjayh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgIHJlZi5lZS5lbWl0KCdzYXZlLWVuZCcsIHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICApO1xufVxuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2V4dGVuZCcpO1xudmFyIHNjaGVtYSA9IHJlcXVpcmUoJy4uL3NjaGVtYScpO1xudmFyIGNyZWF0ZVNjaGVtYU1ldGhvZHMgPSByZXF1aXJlKCcuL2NyZWF0ZVNjaGVtYU1ldGhvZHMnKTtcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUnKTtcbnZhciBjcnVkID0gcmVxdWlyZSgnLi9jcnVkJyk7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5cblxudmFyIGlnbm9yZSA9IFsnU3BlY2llcycsICdEYXRlJ107XG5cbmZ1bmN0aW9uIFBhY2thZ2UoaW5pdGRhdGEsIFNESykge1xuXG4gIHRoaXMucmVzZXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYoIGRhdGEgKSB7XG4gICAgICB0aGlzLmRhdGEgPSBleHRlbmQodHJ1ZSwge30sIGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRhdGEgPSB7XG4gICAgICAgIGlkIDogJycsXG4gICAgICAgIHRpdGxlIDogJycsXG4gICAgICAgIG5hbWUgOiAnJyxcbiAgICAgICAgbm90ZXMgOiAnJyxcbiAgICAgICAgYXV0aG9yIDogJycsXG4gICAgICAgIGF1dGhvcl9lbWFpbCA6ICcnLFxuICAgICAgICBsaWNlbnNlX2lkIDogJycsXG4gICAgICAgIGxpY2Vuc2VfdGl0bGUgOiAnJyxcbiAgICAgICAgbWFpbnRhaW5lciA6ICcnLFxuICAgICAgICBtYWludGFpbmVyX2VtYWlsIDogJycsXG4gICAgICAgIHZlcnNpb24gOiAnJyxcbiAgICAgICAgb3duZXJfb3JnIDogJycsXG4gICAgICAgIHRhZ3MgOiBbXSxcbiAgICAgICAgcHJpdmF0ZSA6IGZhbHNlLFxuICAgICAgICBleHRyYXMgOiBbXVxuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy5yZXNldChpbml0ZGF0YSk7XG5cbiAgdGhpcy5lZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBpZiggIVNESyApIHtcbiAgICB0aHJvdyhuZXcgRXJyb3IoJ05vIFNESyBwcm92aWRlZCcpKTtcbiAgfVxuICB0aGlzLlNESyA9IFNESztcblxuICB0aGlzLm9uID0gZnVuY3Rpb24oZXZlbnQsIGZuKSB7XG4gICAgdGhpcy5lZS5vbihldmVudCwgZm4pO1xuICB9O1xuXG4gIHRoaXMuX29uVXBkYXRlID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHRoaXMuZWUuZW1pdCgndXBkYXRlJywge2F0dHJpYnV0ZTogbmFtZX0pO1xuXG4gICAgaWYoIHRoaXMubW9kZSAhPT0gJ2NyZWF0ZScgKSB7XG4gICAgICB0aGlzLnNhdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lZS5lbWl0KCd2YWx1ZS1zZXQtb24tY3JlYXRlJywge30pO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmdldElkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5pZCB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldFRpdGxlID0gZnVuY3Rpb24odGl0bGUsIGNhbGxiYWNrKSB7XG4gICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC9fL2csICcgJykudHJpbSgpO1xuXG4gICAgaWYoIHRpdGxlLmxlbmd0aCA+PSAxMDAgKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soe2Vycm9yOiB0cnVlLCBtZXNzYWdlOiAnSW52YWxpZCBuYW1lLiAgVGl0bGUgY2FuIGhhdmUgYXQgbW9zdCAxMDAgY2hhcmFjdGVycy4nfSk7XG4gICAgfVxuXG4gICAgaWYoIHRpdGxlLmxlbmd0aCA8PSA1ICkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjogdHJ1ZSwgbWVzc2FnZTogJ0ludmFsaWQgbmFtZS4gIFRpdGxlIG11c3QgaGF2ZSBhdCBsZWFzdCA1IGNoYXJhY3RlcnMuJ30pO1xuICAgIH1cblxuICAgIHZhciBuYW1lID0gdGl0bGUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0vZywnLScpO1xuXG4gICAgaWYoIHRoaXMuZGF0YS5uYW1lID09PSBuYW1lICkge1xuICAgICAgdGhpcy5kYXRhLnRpdGxlID0gdGl0bGU7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwge3RpdGxlOiB0aXRsZSwgbmFtZTogbmFtZX0pO1xuICAgIH1cblxuICAgIFNESy52ZXJpZnkubmFtZShuYW1lLCBmdW5jdGlvbih2YWxpZCkge1xuICAgICAgaWYoICF2YWxpZCApIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjogdHJ1ZSwgbWVzc2FnZTogJ0ludmFsaWQgbmFtZS4gIEEgZGF0YXNldCB3aXRoIHRoZSBuYW1lIFwiJytuYW1lKydcIiBhbHJlYWR5IGV4aXN0cyd9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kYXRhLnRpdGxlID0gdGl0bGU7XG4gICAgICB0aGlzLmRhdGEubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLl9vblVwZGF0ZSgnVGl0bGUnKTtcblxuICAgICAgY2FsbGJhY2sobnVsbCwge3RpdGxlOiB0aXRsZSwgbmFtZTogbmFtZX0pO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgdGhpcy5nZXROYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5uYW1lIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuZ2V0VGl0bGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnRpdGxlIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0RGVzY3JpcHRpb24gPSBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xuICAgIHRoaXMuZGF0YS5ub3RlcyA9IGRlc2NyaXB0aW9uO1xuICAgIHRoaXMuX29uVXBkYXRlKCdEZXNjcmlwdGlvbicpO1xuICB9O1xuXG4gIHRoaXMuZ2V0RGVzY3JpcHRpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLm5vdGVzIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuZ2V0S2V5d29yZHMgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmRhdGEudGFncyB8fCBbXTtcbiAgfTtcblxuICB0aGlzLnNldEtleXdvcmRzID0gZnVuY3Rpb24oa2V5d29yZHMpIHtcbiAgICBpZiggdHlwZW9mIGtleXdvcmRzID09PSAnc3RyaW5nJyApIHtcbiAgICAgIGtleXdvcmRzID0ga2V5d29yZHMuc3BsaXQoJywnKTtcbiAgICB9XG5cbiAgICBpZiggIUFycmF5LmlzQXJyYXkoa2V5d29yZHMpICkge1xuICAgICAgdGhyb3cobmV3IEVycm9yKCdLZXl3b3JkcyBtdXN0IGJ5IG9mIHR5cGUgc3RyaW5nIG9yIGFycmF5JykpO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YS50YWdzID0gW107XG4gICAga2V5d29yZHMuZm9yRWFjaCh0aGlzLmFkZEtleXdvcmQuYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgdGhpcy5hZGRLZXl3b3JkID0gZnVuY3Rpb24oa2V5d29yZCkge1xuICAgIGlmKCB0eXBlb2Yga2V5d29yZCA9PT0gJ29iamVjdCcgKSB7XG4gICAgICBrZXl3b3JkID0ga2V5d29yZC5uYW1lO1xuXG4gICAgfVxuXG4gICAga2V5d29yZCA9IGNsZWFuS2V5d29yZChrZXl3b3JkKycnKTtcblxuICAgIGlmKCBrZXl3b3JkLmxlbmd0aCA8IDIgKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmKCB0aGlzLmhhc0tleXdvcmQoa2V5d29yZCkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoICF0aGlzLmRhdGEudGFncyApIHtcbiAgICAgIHRoaXMuZGF0YS50YWdzID0gW107XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhLnRhZ3MucHVzaCh7XG4gICAgICBkaXNwbGF5X25hbWUgOiBrZXl3b3JkLFxuICAgICAgbmFtZSA6IGtleXdvcmRcbiAgICB9KTtcblxuICAgIHRoaXMuX29uVXBkYXRlKCdLZXl3b3JkcycpO1xuICB9O1xuXG4gIHRoaXMucmVtb3ZlS2V5d29yZCA9IGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICBpZiggIXRoaXMuZGF0YS50YWdzICkgcmV0dXJuO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEudGFncy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmRhdGEudGFnc1tpXS5uYW1lID09PSBrZXl3b3JkICkge1xuICAgICAgICB0aGlzLmRhdGEudGFncy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX29uVXBkYXRlKCdLZXl3b3JkcycpO1xuICB9O1xuXG4gIHRoaXMuaGFzS2V5d29yZCA9IGZ1bmN0aW9uKGtleXdvcmQpIHtcbiAgICBpZiggIXRoaXMuZGF0YS50YWdzICkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLnRhZ3MubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5kYXRhLnRhZ3NbaV0ubmFtZSA9PT0ga2V5d29yZCApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIGNsZWFuS2V5d29yZCh0eHQpIHtcbiAgICByZXR1cm4gdHh0LnJlcGxhY2UoL1teQS1aYS16MC05LV8gXS9nLCAnJykudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gIH1cblxuICB0aGlzLnNldExpY2Vuc2UgPSBmdW5jdGlvbihpZCwgdGl0bGUpIHtcbiAgICB0aGlzLmRhdGEubGljZW5zZV9pZCA9IGlkO1xuICAgIHRoaXMuZGF0YS5saWNlbnNlX3RpdGxlID0gdGl0bGU7XG4gICAgdGhpcy5fb25VcGRhdGUoJ0xpY2Vuc2UnKTtcbiAgfTtcblxuICB0aGlzLmdldExpY2Vuc2VJZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEubGljZW5zZV9pZCB8fCAnJztcbiAgfTtcblxuICB0aGlzLmdldExpY2Vuc2VUaXRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEubGljZW5zZV90aXRsZSB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldE9yZ2FuaXphdGlvbiA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjaykge1xuICAgIGlmKCAhaWQgKSB7XG4gICAgICB0aGlzLmRhdGEub3duZXJfb3JnID0gJyc7XG4gICAgICBpZiggY2FsbGJhY2sgKSB7XG4gICAgICAgIGNhbGxiYWNrKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgU0RLLmNrYW4uZ2V0T3JnYW5pemF0aW9uKGlkLCBmdW5jdGlvbihyZXNwKXtcbiAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICBpZiggY2FsbGJhY2sgKSBjYWxsYmFjayhyZXNwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRhdGEub3duZXJfb3JnID0gcmVzcC5pZDtcbiAgICAgIHRoaXMuX29uVXBkYXRlKCdPcmdhbml6YXRpb24nKTtcblxuICAgICAgaWYoIGNhbGxiYWNrICkge1xuICAgICAgICBjYWxsYmFjayh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgdGhpcy5nZXRPcmdhbml6YXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLm93bmVyX29yZyB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldFZlcnNpb24gPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gICAgdGhpcy5kYXRhLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgIHRoaXMuX29uVXBkYXRlKCdWZXJzaW9uJyk7XG4gIH07XG5cbiAgdGhpcy5nZXRWZXJzaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS52ZXJzaW9uIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0V2Vic2l0ZSA9IGZ1bmN0aW9uKHdlYnNpdGUpIHtcbiAgICB0aGlzLnNldEV4dHJhKCdXZWJzaXRlJywgd2Vic2l0ZSk7XG4gICAgdGhpcy5fb25VcGRhdGUoJ1dlYnNpdGUnKTtcbiAgfTtcblxuICB0aGlzLmdldFdlYnNpdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFeHRyYSgnV2Vic2l0ZScpO1xuICB9O1xuXG4gIHRoaXMuc2V0QXV0aG9yID0gZnVuY3Rpb24oYXV0aG9yKSB7XG4gICAgdGhpcy5kYXRhLmF1dGhvciA9IGF1dGhvcjtcbiAgICB0aGlzLl9vblVwZGF0ZSgnQXV0aG9yJyk7XG4gIH07XG5cbiAgdGhpcy5nZXRBdXRob3IgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmF1dGhvciB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldEF1dGhvckVtYWlsID0gZnVuY3Rpb24oYXV0aG9yX2VtYWlsKSB7XG4gICAgdGhpcy5kYXRhLmF1dGhvcl9lbWFpbCA9IGF1dGhvcl9lbWFpbDtcbiAgICB0aGlzLl9vblVwZGF0ZSgnQXV0aG9yRW1haWwnKTtcbiAgfTtcblxuICB0aGlzLmdldEF1dGhvckVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5hdXRob3JfZW1haWwgfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5zZXRNYWludGFpbmVyID0gZnVuY3Rpb24obWFpbnRhaW5lcikge1xuICAgIHRoaXMuZGF0YS5tYWludGFpbmVyID0gbWFpbnRhaW5lcjtcbiAgICB0aGlzLl9vblVwZGF0ZSgnTWFpbnRhaW5lcicpO1xuICB9O1xuXG4gIHRoaXMuZ2V0TWFpbnRhaW5lciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEubWFpbnRhaW5lciB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldE1haW50YWluZXJFbWFpbCA9IGZ1bmN0aW9uKG1haW50YWluZXJfZW1haWwpIHtcbiAgICB0aGlzLmRhdGEubWFpbnRhaW5lcl9lbWFpbCA9IG1haW50YWluZXJfZW1haWw7XG4gICAgdGhpcy5fb25VcGRhdGUoJ01haW50YWluZXJFbWFpbCcpO1xuICB9O1xuXG4gIHRoaXMuZ2V0TWFpbnRhaW5lckVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5tYWludGFpbmVyX2VtYWlsIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0UHJpdmF0ZSA9IGZ1bmN0aW9uKHByaXZhdGUpIHtcbiAgICBpZiggdGhpcy5kYXRhLnByaXZhdGUgPT09IHByaXZhdGUgKSByZXR1cm47XG4gICAgdGhpcy5kYXRhLnByaXZhdGUgPSBwcml2YXRlO1xuICAgIHRoaXMuX29uVXBkYXRlKCdQcml2YXRlJyk7XG4gIH07XG5cbiAgdGhpcy5pc1ByaXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnByaXZhdGUgPyB0cnVlIDogZmFsc2U7XG4gIH07XG5cbiAgdGhpcy5zZXRMaW5rZWREYXRhID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBuZXdEYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgdmFyIG9sZERhdGEgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmdldExpbmtlZERhdGEoKSk7XG5cbiAgICBpZiggbmV3RGF0YSA9PT0gb2xkRGF0YSApIHJldHVybjtcblxuICAgIHRoaXMuc2V0RXh0cmEoJ0xpbmtlZERhdGEnLCBuZXdEYXRhKTtcblxuICAgIHRoaXMuZWUuZW1pdCgndXBkYXRlJywge2F0dHJpYnV0ZTogbmFtZX0pO1xuXG4gICAgaWYoIHRoaXMubW9kZSAhPT0gJ2NyZWF0ZScgKSB7XG4gICAgICB0aGlzLlNESy5ja2FuLnVwZGF0ZUxpbmtlZFJlc291cmNlcyh0aGlzLmRhdGEuaWQsIGRhdGEsIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lZS5lbWl0KCd2YWx1ZS1zZXQtb24tY3JlYXRlJywge30pO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmdldExpbmtlZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldEV4dHJhKCdMaW5rZWREYXRhJyk7XG4gICAgaWYoICF2YWx1ZSApIHJldHVybiBbXTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgcmV0dXJuIFtdO1xuICB9O1xuXG4gIHRoaXMucmVxdWVzdERvaSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkb2kgPSB0aGlzLmdldERvaSgpO1xuXG4gICAgaWYoIGRvaS5zdGF0dXMudmFsdWUgIT09ICdQZW5kaW5nIFJldmlzaW9uJyAmJiBkb2kuc3RhdHVzLnZhbHVlICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuc2V0RXh0cmEoJ0Vjb1NJUyBET0kgU3RhdHVzJywgSlNPTi5zdHJpbmdpZnkoe3ZhbHVlOidQZW5kaW5nIEFwcHJvdmFsJ30pKTtcbiAgICB0aGlzLl9vblVwZGF0ZSgnRWNvU0lTIERPSSBTdGF0dXMnKTtcbiAgICBcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgXG4gIHRoaXMuY2FuY2VsRG9pUmVxdWVzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkb2kgPSB0aGlzLmdldERvaSgpO1xuXG4gICAgaWYoIGRvaS5zdGF0dXMudmFsdWUgIT09ICdQZW5kaW5nIFJldmlzaW9uJyAmJiBkb2kuc3RhdHVzLnZhbHVlICE9PSAnUGVuZGluZyBBcHByb3ZhbCcgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRFeHRyYSgnRWNvU0lTIERPSSBTdGF0dXMnLCBKU09OLnN0cmluZ2lmeSh7fSkpO1xuICAgIHRoaXMuX29uVXBkYXRlKCdFY29TSVMgRE9JIFN0YXR1cycpO1xuICAgIFxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIHRoaXMuZ2V0RG9pID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuZ2V0RXh0cmEoJ0Vjb1NJUyBET0kgU3RhdHVzJyk7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5nZXRFeHRyYSgnRWNvU0lTIERPSScpO1xuICAgIFxuICAgIGlmKCBzdGF0dXMgJiYgc3RhdHVzLmxlbmd0aCA+IDAgKSB7XG4gICAgICBzdGF0dXMgPSBKU09OLnBhcnNlKHN0YXR1cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXR1cyA9IHt9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXMgOiBzdGF0dXMsXG4gICAgICB2YWx1ZSA6IHZhbHVlXG4gICAgfTtcbiAgfTtcblxuICB0aGlzLnNldFNvcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zZXRFeHRyYSgnc29ydCcsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB0aGlzLl9vblVwZGF0ZSgnc29ydCcpO1xuICB9O1xuXG4gIHRoaXMuZ2V0U29ydCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0RXh0cmEoJ3NvcnQnKTtcbiAgICBpZiggIXZhbHVlICkgcmV0dXJuIFtdO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4ge307XG4gIH07XG5cbiAgdGhpcy5zZXRBbGlhc2VzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHRoaXMuc2V0RXh0cmEoJ2FsaWFzZXMnLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgdGhpcy5fb25VcGRhdGUoJ2FsaWFzZXMnKTtcbiAgfTtcblxuICB0aGlzLmdldEFsaWFzZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldEV4dHJhKCdhbGlhc2VzJyk7XG4gICAgaWYoICF2YWx1ZSApIHJldHVybiB7fTtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgdCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgLy8gaGFja1xuICAgICAgaWYoIEFycmF5LmlzQXJyYXkodCkgKSByZXR1cm4ge307XG4gICAgICByZXR1cm4gdDtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4ge307XG4gIH07XG5cbiAgdGhpcy5zZXRHZW9Kc29uID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmKCAhZGF0YSApIHtcbiAgICAgIHRoaXMuc2V0RXh0cmEoJ2dlb2pzb24nLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0RXh0cmEoJ2dlb2pzb24nLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fb25VcGRhdGUoJ2dlb2pzb24nKTtcbiAgfTtcblxuICB0aGlzLmdldEdlb0pzb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldEV4dHJhKCdnZW9qc29uJyk7XG4gICAgaWYoICF2YWx1ZSApIHJldHVybiB7fTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgcmV0dXJuIHt9O1xuICB9O1xuXG4gIHRoaXMuYWRkUmVzb3VyY2UgPSBmdW5jdGlvbihmaWxlLCBjYWxsYmFjaywgcHJvZ3Jlc3MpIHtcbiAgICBmdW5jdGlvbiBuZXh0KHJlc3ApIHtcbiAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICBTREsuY2thbi5wcm9jZXNzUmVzb3VyY2UoXG4gICAgICAgIHRoaXMuZGF0YS5pZCxcbiAgICAgICAgW3Jlc3AuaWRdLFxuICAgICAgICBudWxsLFxuICAgICAgICB7bGF5b3V0OiAnY29sdW1uJ30sXG4gICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGdldCBuZXcgd29ya3NwYWNlIHN0YXRlXG4gICAgICAgICAgLy8gVE9ETzogcHJvbHkgYSBiZXR0ZXIgd2F5IFRPRE8gdGhpcy5cbiAgICAgICAgICBTREsuY2thbi5nZXRXb3Jrc3BhY2UodGhpcy5kYXRhLmlkLCBmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAgICAgaWYoIHJlc3VsdC5lcnJvciApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBTREsuZHMucnVuQWZ0ZXJSZXNvdXJjZUFkZChyZXN1bHQpO1xuXG4gICAgICAgICAgICBjYWxsYmFjayh7c3VjY2VzczogdHJ1ZX0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgU0RLLmNrYW4uYWRkUmVzb3VyY2UodGhpcy5kYXRhLmlkLCBmaWxlLCBuZXh0LmJpbmQodGhpcyksIHByb2dyZXNzKTtcbiAgfTtcblxuICB0aGlzLmdldEV4dHJhID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYoICF0aGlzLmRhdGEuZXh0cmFzICkgcmV0dXJuICcnO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEuZXh0cmFzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YS5leHRyYXNbaV0ua2V5ID09PSBrZXkgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEuZXh0cmFzW2ldLnZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfTtcblxuICB0aGlzLnNldEV4dHJhID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIGlmKCAhdGhpcy5kYXRhLmV4dHJhcyApIHRoaXMuZGF0YS5leHRyYXMgPSBbXTtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmV4dHJhcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmRhdGEuZXh0cmFzW2ldLmtleSA9PSBrZXkgKSB7XG4gICAgICAgIGlmKCB2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICB0aGlzLmRhdGEuZXh0cmFzLnNwbGljZShpLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmRhdGEuZXh0cmFzW2ldLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCB2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGEuZXh0cmFzLnB1c2goe1xuICAgICAga2V5IDoga2V5LFxuICAgICAgdmFsdWUgOiB2YWx1ZVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIFNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIHRlc3QgZGF0YSEhXG4gIHRoaXMuX3NldFRlc3RpbmcgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldEV4dHJhKCdfdGVzdGluZ18nLCB0cnVlKTtcbiAgfTtcbn1cblxuLy8gZXh0ZW5kIHBhY2thZ2UgZ2V0dGVycy9zZXR0ZXJzIGJhc2VkIG9uIHNjaGVtYVxuZm9yKCB2YXIga2V5IGluIHNjaGVtYSApIHtcbiAgaWYoIGlnbm9yZS5pbmRleE9mKGtleSkgPiAtMSApIHtcbiAgICBjb250aW51ZTtcbiAgfVxuXG4gIGZvciggdmFyIGkgPSAwOyBpIDwgc2NoZW1hW2tleV0ubGVuZ3RoOyBpKysgKXtcbiAgICBjcmVhdGVTY2hlbWFNZXRob2RzKHNjaGVtYVtrZXldW2ldLCBQYWNrYWdlKTtcbiAgfVxufVxuXG50ZW1wbGF0ZShQYWNrYWdlKTtcbmNydWQoUGFja2FnZSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWNrYWdlO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFBhY2thZ2UpIHtcbiAgUGFja2FnZS5wcm90b3R5cGUubG9hZEZyb21UZW1wbGF0ZSA9IGxvYWRGcm9tVGVtcGxhdGU7XG59O1xuXG4vLyBsb2FkIGZyb20gc2VydmVyIHByb3ZpZGVkIHRlbXBsYXRlXG5mdW5jdGlvbiBsb2FkRnJvbVRlbXBsYXRlKGNrYW5QYWNrYWdlLCB1c2VyLCBrZWVwRG9pKSAge1xuICBmb3IoIHZhciBrZXkgaW4gdGhpcy5kYXRhICkge1xuICAgIGlmKCBrZXkgPT09ICdvd25lcl9vcmcnIHx8IGtleSA9PT0gJ2lkJyApIGNvbnRpbnVlO1xuICAgIGlmKCBja2FuUGFja2FnZVtrZXldICkgdGhpcy5kYXRhW2tleV0gPSBja2FuUGFja2FnZVtrZXldO1xuICB9XG5cbiAgaWYoIHVzZXIgJiYgdXNlci5vcmdhbml6YXRpb25zICYmIGNrYW5QYWNrYWdlLm93bmVyX29yZyApIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHVzZXIub3JnYW5pemF0aW9ucy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB1c2VyLm9yZ2FuaXphdGlvbnNbaV0uaWQgPT09IGNrYW5QYWNrYWdlLm93bmVyX29yZyApIHtcbiAgICAgICAgZGF0YS5vd25lcl9vcmcgPSBja2FuUGFja2FnZS5vd25lcl9vcmc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKCBja2FuUGFja2FnZS5leHRyYXMgKSB7XG4gICAgaWYoICFrZWVwRG9pICkge1xuICAgICAgaWYoIGNrYW5QYWNrYWdlLmV4dHJhc1snRWNvU0lTIERPSSddICkge1xuICAgICAgICBkZWxldGUgY2thblBhY2thZ2UuZXh0cmFzWydFY29TSVMgRE9JJ11cbiAgICAgIH1cbiAgICAgIGlmKCBja2FuUGFja2FnZS5leHRyYXNbJ0Vjb1NJUyBET0kgU3RhdHVzJ10gKSB7XG4gICAgICAgIGRlbGV0ZSBja2FuUGFja2FnZS5leHRyYXNbJ0Vjb1NJUyBET0kgU3RhdHVzJ11cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgYXJyID0gW107XG4gICAgZm9yKCB2YXIga2V5IGluIGNrYW5QYWNrYWdlLmV4dHJhcyApIHtcbiAgICAgIGFyci5wdXNoKHtcbiAgICAgICAga2V5IDoga2V5LFxuICAgICAgICB2YWx1ZSA6IGNrYW5QYWNrYWdlLmV4dHJhc1trZXldXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5kYXRhLmV4dHJhcyA9IGFycjtcbiAgfVxuXG4gIGlmKCBja2FuUGFja2FnZS50YWdzICkge1xuICAgIHZhciBhcnIgPSBbXTtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNrYW5QYWNrYWdlLnRhZ3MubGVuZ3RoOyBpKysgKSB7XG4gICAgICBhcnIucHVzaCh7XG4gICAgICAgIG5hbWUgOiBja2FuUGFja2FnZS50YWdzW2ldLFxuICAgICAgICBkaXNwbGF5X25hbWUgOiBja2FuUGFja2FnZS50YWdzW2ldXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5kYXRhLnRhZ3MgPSBhcnI7XG4gIH1cblxuICBpZiggY2thblBhY2thZ2UubWFwICkge1xuICAgIHRoaXMuc2V0QWxpYXNlcyhja2FuUGFja2FnZS5tYXApO1xuICB9XG59XG4iLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICBmdW5jdGlvbiBvbigpIHtcbiAgICB0aGlzLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxudmFyIGlzQXJyYXkgPSBmdW5jdGlvbiBpc0FycmF5KGFycikge1xuXHRpZiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpO1xuXHR9XG5cblx0cmV0dXJuIHRvU3RyLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBpc1BsYWluT2JqZWN0ID0gZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcblx0aWYgKCFvYmogfHwgdG9TdHIuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBoYXNPd25Db25zdHJ1Y3RvciA9IGhhc093bi5jYWxsKG9iaiwgJ2NvbnN0cnVjdG9yJyk7XG5cdHZhciBoYXNJc1Byb3RvdHlwZU9mID0gb2JqLmNvbnN0cnVjdG9yICYmIG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgJiYgaGFzT3duLmNhbGwob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2lzUHJvdG90eXBlT2YnKTtcblx0Ly8gTm90IG93biBjb25zdHJ1Y3RvciBwcm9wZXJ0eSBtdXN0IGJlIE9iamVjdFxuXHRpZiAob2JqLmNvbnN0cnVjdG9yICYmICFoYXNPd25Db25zdHJ1Y3RvciAmJiAhaGFzSXNQcm90b3R5cGVPZikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuXHQvLyBpZiBsYXN0IG9uZSBpcyBvd24sIHRoZW4gYWxsIHByb3BlcnRpZXMgYXJlIG93bi5cblx0dmFyIGtleTtcblx0Zm9yIChrZXkgaW4gb2JqKSB7LyoqL31cblxuXHRyZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMF0sXG5cdFx0aSA9IDEsXG5cdFx0bGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9IGVsc2UgaWYgKCh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSB8fCB0YXJnZXQgPT0gbnVsbCkge1xuXHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbaV07XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmIChvcHRpb25zICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiIsIlxuLyoqXG4gKiBSZWR1Y2UgYGFycmAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TWl4ZWR9IGluaXRpYWxcbiAqXG4gKiBUT0RPOiBjb21iYXRpYmxlIGVycm9yIGhhbmRsaW5nP1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbiwgaW5pdGlhbCl7ICBcbiAgdmFyIGlkeCA9IDA7XG4gIHZhciBsZW4gPSBhcnIubGVuZ3RoO1xuICB2YXIgY3VyciA9IGFyZ3VtZW50cy5sZW5ndGggPT0gM1xuICAgID8gaW5pdGlhbFxuICAgIDogYXJyW2lkeCsrXTtcblxuICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgY3VyciA9IGZuLmNhbGwobnVsbCwgY3VyciwgYXJyW2lkeF0sICsraWR4LCBhcnIpO1xuICB9XG4gIFxuICByZXR1cm4gY3Vycjtcbn07IiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ3JlZHVjZScpO1xuXG4vKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbnZhciByb290O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7IC8vIEJyb3dzZXIgd2luZG93XG4gIHJvb3QgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykgeyAvLyBXZWIgV29ya2VyXG4gIHJvb3QgPSBzZWxmO1xufSBlbHNlIHsgLy8gT3RoZXIgZW52aXJvbm1lbnRzXG4gIHJvb3QgPSB0aGlzO1xufVxuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe307XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogVE9ETzogZnV0dXJlIHByb29mLCBtb3ZlIHRvIGNvbXBvZW50IGxhbmRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNIb3N0KG9iaikge1xuICB2YXIgc3RyID0ge30udG9TdHJpbmcuY2FsbChvYmopO1xuXG4gIHN3aXRjaCAoc3RyKSB7XG4gICAgY2FzZSAnW29iamVjdCBGaWxlXSc6XG4gICAgY2FzZSAnW29iamVjdCBCbG9iXSc6XG4gICAgY2FzZSAnW29iamVjdCBGb3JtRGF0YV0nOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxucmVxdWVzdC5nZXRYSFIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAmJiAoIXJvb3QubG9jYXRpb24gfHwgJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sXG4gICAgICAgICAgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCBvYmpba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBIZWxwcyAnc2VyaWFsaXplJyB3aXRoIHNlcmlhbGl6aW5nIGFycmF5cy5cbiAqIE11dGF0ZXMgdGhlIHBhaXJzIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhaXJzXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqL1xuXG5mdW5jdGlvbiBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2YWwpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgIHJldHVybiB2YWwuZm9yRWFjaChmdW5jdGlvbih2KSB7XG4gICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2KTtcbiAgICB9KTtcbiAgfVxuICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsKSk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgbWltZWAgaXMganNvbiBvciBoYXMgK2pzb24gc3RydWN0dXJlZCBzeW50YXggc3VmZml4LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNKU09OKG1pbWUpIHtcbiAgcmV0dXJuIC9bXFwvK11qc29uXFxiLy50ZXN0KG1pbWUpO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJhbXMoc3RyKXtcbiAgcmV0dXJuIHJlZHVjZShzdHIuc3BsaXQoLyAqOyAqLyksIGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLylcbiAgICAgICwga2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgLCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICAvLyByZXNwb25zZVRleHQgaXMgYWNjZXNzaWJsZSBvbmx5IGlmIHJlc3BvbnNlVHlwZSBpcyAnJyBvciAndGV4dCcgYW5kIG9uIG9sZGVyIGJyb3dzZXJzXG4gIHRoaXMudGV4dCA9ICgodGhpcy5yZXEubWV0aG9kICE9J0hFQUQnICYmICh0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICcnIHx8IHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnKSkgfHwgdHlwZW9mIHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgID8gdGhpcy54aHIucmVzcG9uc2VUZXh0XG4gICAgIDogbnVsbDtcbiAgdGhpcy5zdGF0dXNUZXh0ID0gdGhpcy5yZXEueGhyLnN0YXR1c1RleHQ7XG4gIHRoaXMuc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG4gIHRoaXMuYm9keSA9IHRoaXMucmVxLm1ldGhvZCAhPSAnSEVBRCdcbiAgICA/IHRoaXMucGFyc2VCb2R5KHRoaXMudGV4dCA/IHRoaXMudGV4dCA6IHRoaXMueGhyLnJlc3BvbnNlKVxuICAgIDogbnVsbDtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbihoZWFkZXIpe1xuICAvLyBjb250ZW50LXR5cGVcbiAgdmFyIGN0ID0gdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB0eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgdmFyIG9iaiA9IHBhcmFtcyhjdCk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHRoaXNba2V5XSA9IG9ialtrZXldO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIHJldHVybiBwYXJzZSAmJiBzdHIgJiYgKHN0ci5sZW5ndGggfHwgc3RyIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbihzdGF0dXMpe1xuICAvLyBoYW5kbGUgSUU5IGJ1ZzogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDA0Njk3Mi9tc2llLXJldHVybnMtc3RhdHVzLWNvZGUtb2YtMTIyMy1mb3ItYWpheC1yZXF1ZXN0XG4gIGlmIChzdGF0dXMgPT09IDEyMjMpIHtcbiAgICBzdGF0dXMgPSAyMDQ7XG4gIH1cblxuICB2YXIgdHlwZSA9IHN0YXR1cyAvIDEwMCB8IDA7XG5cbiAgLy8gc3RhdHVzIC8gY2xhc3NcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLnN0YXR1c0NvZGUgPSBzdGF0dXM7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IDEgPT0gdHlwZTtcbiAgdGhpcy5vayA9IDIgPT0gdHlwZTtcbiAgdGhpcy5jbGllbnRFcnJvciA9IDQgPT0gdHlwZTtcbiAgdGhpcy5zZXJ2ZXJFcnJvciA9IDUgPT0gdHlwZTtcbiAgdGhpcy5lcnJvciA9ICg0ID09IHR5cGUgfHwgNSA9PSB0eXBlKVxuICAgID8gdGhpcy50b0Vycm9yKClcbiAgICA6IGZhbHNlO1xuXG4gIC8vIHN1Z2FyXG4gIHRoaXMuYWNjZXB0ZWQgPSAyMDIgPT0gc3RhdHVzO1xuICB0aGlzLm5vQ29udGVudCA9IDIwNCA9PSBzdGF0dXM7XG4gIHRoaXMuYmFkUmVxdWVzdCA9IDQwMCA9PSBzdGF0dXM7XG4gIHRoaXMudW5hdXRob3JpemVkID0gNDAxID09IHN0YXR1cztcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gNDA2ID09IHN0YXR1cztcbiAgdGhpcy5ub3RGb3VuZCA9IDQwNCA9PSBzdGF0dXM7XG4gIHRoaXMuZm9yYmlkZGVuID0gNDAzID09IHN0YXR1cztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVxID0gdGhpcy5yZXE7XG4gIHZhciBtZXRob2QgPSByZXEubWV0aG9kO1xuICB2YXIgdXJsID0gcmVxLnVybDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgdXJsICsgJyAoJyArIHRoaXMuc3RhdHVzICsgJyknO1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZXJyID0gbnVsbDtcbiAgICB2YXIgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICAgIC8vIGlzc3VlICM2NzU6IHJldHVybiB0aGUgcmF3IHJlc3BvbnNlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICBlcnIucmF3UmVzcG9uc2UgPSBzZWxmLnhociAmJiBzZWxmLnhoci5yZXNwb25zZVRleHQgPyBzZWxmLnhoci5yZXNwb25zZVRleHQgOiBudWxsO1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyKTtcbiAgICB9XG5cbiAgICBzZWxmLmVtaXQoJ3Jlc3BvbnNlJywgcmVzKTtcblxuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICBpZiAocmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMCkge1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyLCByZXMpO1xuICAgIH1cblxuICAgIHZhciBuZXdfZXJyID0gbmV3IEVycm9yKHJlcy5zdGF0dXNUZXh0IHx8ICdVbnN1Y2Nlc3NmdWwgSFRUUCByZXNwb25zZScpO1xuICAgIG5ld19lcnIub3JpZ2luYWwgPSBlcnI7XG4gICAgbmV3X2Vyci5yZXNwb25zZSA9IHJlcztcbiAgICBuZXdfZXJyLnN0YXR1cyA9IHJlcy5zdGF0dXM7XG5cbiAgICBzZWxmLmNhbGxiYWNrKG5ld19lcnIsIHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYC5cbiAqL1xuXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aW1lb3V0IHRvIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKG1zKXtcbiAgdGhpcy5fdGltZW91dCA9IG1zO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xlYXIgcHJldmlvdXMgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fdGltZW91dCA9IDA7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuYWJvcnRlZCkgcmV0dXJuO1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICB0aGlzLnhoci5hYm9ydCgpO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihmaWVsZCwgdmFsKXtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBmaWVsZCkge1xuICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgaGVhZGVyIGBmaWVsZGAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmdldEhlYWRlciA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRm9yY2UgZ2l2ZW4gcGFyc2VyXG4gKlxuICogU2V0cyB0aGUgYm9keSBwYXJzZXIgbm8gbWF0dGVyIHR5cGUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihmbil7XG4gIHRoaXMuX3BhcnNlciA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdBY2NlcHQnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEF1dGhvcml6YXRpb24gZmllbGQgdmFsdWUgd2l0aCBgdXNlcmAgYW5kIGBwYXNzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IHBhc3NcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcyl7XG4gIHZhciBzdHIgPSBidG9hKHVzZXIgKyAnOicgKyBwYXNzKTtcbiAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIHN0cik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4qXG4qIEV4YW1wbGVzOlxuKlxuKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbipcbiogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4qIEBhcGkgcHVibGljXG4qL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB2YWwgPSBzZXJpYWxpemUodmFsKTtcbiAgaWYgKHZhbCkgdGhpcy5fcXVlcnkucHVzaCh2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAgZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiXG4gKiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZX0gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyByb290LkZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYGZpbGVuYW1lYC5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2gobmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oZmllbGQsIGZpbGUsIGZpbGVuYW1lKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQoZmllbGQsIGZpbGUsIGZpbGVuYW1lIHx8IGZpbGUubmFtZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCBhcyB0aGUgcmVxdWVzdCBib2R5LCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0nKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAgKiAgICAgICAgLnNlbmQoJ25hbWU9dG9iaScpXG4gICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgb2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuXG4gIC8vIG1lcmdlXG4gIGlmIChvYmogJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgIH1cbiAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgZGF0YSkge1xuICAgIGlmICghdHlwZSkgdGhpcy50eXBlKCdmb3JtJyk7XG4gICAgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAoJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgPT0gdHlwZSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RhdGFcbiAgICAgICAgPyB0aGlzLl9kYXRhICsgJyYnICsgZGF0YVxuICAgICAgICA6IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RhdGEgPSAodGhpcy5fZGF0YSB8fCAnJykgKyBkYXRhO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgfVxuXG4gIGlmICghb2JqIHx8IGlzSG9zdChkYXRhKSkgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIGZuKGVyciwgcmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1JlcXVlc3QgaGFzIGJlZW4gdGVybWluYXRlZFxcblBvc3NpYmxlIGNhdXNlczogdGhlIG5ldHdvcmsgaXMgb2ZmbGluZSwgT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiwgdGhlIHBhZ2UgaXMgYmVpbmcgdW5sb2FkZWQsIGV0Yy4nKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcblxuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSB0aGlzLm1ldGhvZDtcbiAgZXJyLnVybCA9IHRoaXMudXJsO1xuXG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0RXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3RpbWVvdXQgb2YgJyArIHRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnKTtcbiAgZXJyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndpdGhDcmVkZW50aWFscyA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB4aHIgPSB0aGlzLnhociA9IHJlcXVlc3QuZ2V0WEhSKCk7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuXG4gICAgLy8gSW4gSUU5LCByZWFkcyB0byBhbnkgcHJvcGVydHkgKGUuZy4gc3RhdHVzKSBvZmYgb2YgYW4gYWJvcnRlZCBYSFIgd2lsbFxuICAgIC8vIHJlc3VsdCBpbiB0aGUgZXJyb3IgXCJDb3VsZCBub3QgY29tcGxldGUgdGhlIG9wZXJhdGlvbiBkdWUgdG8gZXJyb3IgYzAwYzAyM2ZcIlxuICAgIHZhciBzdGF0dXM7XG4gICAgdHJ5IHsgc3RhdHVzID0geGhyLnN0YXR1cyB9IGNhdGNoKGUpIHsgc3RhdHVzID0gMDsgfVxuXG4gICAgaWYgKDAgPT0gc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi50aW1lZG91dCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm47XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgdmFyIGhhbmRsZVByb2dyZXNzID0gZnVuY3Rpb24oZSl7XG4gICAgaWYgKGUudG90YWwgPiAwKSB7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgfVxuICAgIGUuZGlyZWN0aW9uID0gJ2Rvd25sb2FkJztcbiAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gIH07XG4gIGlmICh0aGlzLmhhc0xpc3RlbmVycygncHJvZ3Jlc3MnKSkge1xuICAgIHhoci5vbnByb2dyZXNzID0gaGFuZGxlUHJvZ3Jlc3M7XG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAoeGhyLnVwbG9hZCAmJiB0aGlzLmhhc0xpc3RlbmVycygncHJvZ3Jlc3MnKSkge1xuICAgICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gaGFuZGxlUHJvZ3Jlc3M7XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICAvLyBBY2Nlc3NpbmcgeGhyLnVwbG9hZCBmYWlscyBpbiBJRSBmcm9tIGEgd2ViIHdvcmtlciwgc28ganVzdCBwcmV0ZW5kIGl0IGRvZXNuJ3QgZXhpc3QuXG4gICAgLy8gUmVwb3J0ZWQgaGVyZTpcbiAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzgzNzI0NS94bWxodHRwcmVxdWVzdC11cGxvYWQtdGhyb3dzLWludmFsaWQtYXJndW1lbnQtd2hlbi11c2VkLWZyb20td2ViLXdvcmtlci1jb250ZXh0XG4gIH1cblxuICAvLyB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc2VsZi50aW1lZG91dCA9IHRydWU7XG4gICAgICBzZWxmLmFib3J0KCk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICAvLyBxdWVyeXN0cmluZ1xuICBpZiAocXVlcnkpIHtcbiAgICBxdWVyeSA9IHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0KHF1ZXJ5KTtcbiAgICB0aGlzLnVybCArPSB+dGhpcy51cmwuaW5kZXhPZignPycpXG4gICAgICA/ICcmJyArIHF1ZXJ5XG4gICAgICA6ICc/JyArIHF1ZXJ5O1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICFpc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgY29udGVudFR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgdmFyIHNlcmlhbGl6ZSA9IHRoaXMuX3BhcnNlciB8fCByZXF1ZXN0LnNlcmlhbGl6ZVtjb250ZW50VHlwZSA/IGNvbnRlbnRUeXBlLnNwbGl0KCc7JylbMF0gOiAnJ107XG4gICAgaWYgKCFzZXJpYWxpemUgJiYgaXNKU09OKGNvbnRlbnRUeXBlKSkgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL2pzb24nXTtcbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yICh2YXIgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAobnVsbCA9PSB0aGlzLmhlYWRlcltmaWVsZF0pIGNvbnRpbnVlO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcblxuICAvLyBJRTExIHhoci5zZW5kKHVuZGVmaW5lZCkgc2VuZHMgJ3VuZGVmaW5lZCcgc3RyaW5nIGFzIFBPU1QgcGF5bG9hZCAoaW5zdGVhZCBvZiBub3RoaW5nKVxuICAvLyBXZSBuZWVkIG51bGwgaGVyZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICB4aHIuc2VuZCh0eXBlb2YgZGF0YSAhPT0gJ3VuZGVmaW5lZCcgPyBkYXRhIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBGYXV4IHByb21pc2Ugc3VwcG9ydFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdFxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKGZ1bGZpbGwsIHJlamVjdCkge1xuICByZXR1cm4gdGhpcy5lbmQoZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICBlcnIgPyByZWplY3QoZXJyKSA6IGZ1bGZpbGwocmVzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5yZXF1ZXN0LlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIElzc3VlIGEgcmVxdWVzdDpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICByZXF1ZXN0KCdHRVQnLCAnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJywgY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHVybCBvciBjYWxsYmFja1xuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmhlYWQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlbCh1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG5yZXF1ZXN0WydkZWwnXSA9IGRlbDtcbnJlcXVlc3RbJ2RlbGV0ZSddID0gZGVsO1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIk1lYXN1cmVtZW50XCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJBY3F1aXNpdGlvbiBNZXRob2RcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQ29udGFjdFwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiUGl4ZWxcIixcbiAgICAgICAgXCJQcm94aW1hbFwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1pbmltdW0gbWVhc3VyZW1lbnQgdW5pdCBmb3IgeW91ciBzcGVjdHJhIChpLmUuIGNvbnRhY3QgcHJvYmUsIHByb3hpbWFsIHdpdGggWC1kZWdyZWUgZm9yZW9wdGljLCBwaXhlbCwgb3RoZXIpLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlNhbXBsZSBQbGF0Zm9ybVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBaXJwbGFuZVwiLFxuICAgICAgICBcIkJvb21cIixcbiAgICAgICAgXCJTYXRlbGxpdGVcIixcbiAgICAgICAgXCJUb3dlclwiLFxuICAgICAgICBcIlVBVlwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlBsYXRmb3JtIGZyb20gd2hpY2ggdGhlIHNwZWN0cmFsIG1lYXN1cmVtZW50cyB3ZXJlIG1hZGUgKGUuZy4gaGFuZGhlbGQsIGJvb20sIHRyYW0sIFVBVikuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1lYXN1cmVtZW50IFZlbnVlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkdyZWVuaG91c2VcIixcbiAgICAgICAgXCJMYWJvcmF0b3J5XCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJPdXRkb29yXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2V0dGluZyBpbiB3aGljaCB0aGUgc3BlY3RyYWwgbWVhc3VyZW1lbnRzIHdlcmUgbWFkZS5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJUYXJnZXQgVHlwZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBbmltYWxcIixcbiAgICAgICAgXCJCYXJrXCIsXG4gICAgICAgIFwiQnJhbmNoXCIsXG4gICAgICAgIFwiQ2Fub3B5XCIsXG4gICAgICAgIFwiRmxvd2VyXCIsXG4gICAgICAgIFwiTGVhZlwiLFxuICAgICAgICBcIk1pbmVyYWxcIixcbiAgICAgICAgXCJOUFZcIixcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIlJlZmVyZW5jZVwiLFxuICAgICAgICBcIlJvY2tcIixcbiAgICAgICAgXCJTb2lsXCIsXG4gICAgICAgIFwiV2F0ZXJcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEZXNjcmliZXMgdGhlIHRhcmdldCB0aGF0IHdhcyBtZWFzdXJlZC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNZWFzdXJlbWVudCBRdWFudGl0eVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBYnNvcnB0YW5jZVwiLFxuICAgICAgICBcIkROXCIsXG4gICAgICAgIFwiRW1pc3Npdml0eVwiLFxuICAgICAgICBcIkluZGV4XCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJSYWRpYW5jZVwiLFxuICAgICAgICBcIlJlZmxlY3RhbmNlXCIsXG4gICAgICAgIFwiVHJhbnNmbGVjdGFuY2VcIixcbiAgICAgICAgXCJUcmFuc21pdHRhbmNlXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2NhbGUgZm9yIHNwZWN0cmFsIGluc3RlbnNpdHkgKGUuZy4gRE4sIHJhZGlhbmNlLCBpcnJhZGlhbmNlLCByZWZsZWN0YW5jZSlcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbmRleCBOYW1lXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwic3BsaXQtdGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNZWFzdXJlbWVudCBxdWFudGl0eSdzIGluZGV4IG5hbWUuICBQbGVhc2UgcHJvdmlkZSBpZiBNZWFzdXJlbWVudCBRdWFudGl0eSA9IFxcXCJJbmRleFxcXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWVhc3VyZW1lbnQgVW5pdHNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkLXNpbmdsZVwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIiVcIixcbiAgICAgICAgXCJXL21eMlwiLFxuICAgICAgICBcIlcvbV4yL0h6XCIsXG4gICAgICAgIFwiVy9tXjIvbm1cIixcbiAgICAgICAgXCJXL21eMi91bVwiLFxuICAgICAgICBcIlcvc3IvbV4yXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWVhc3VyZW1udCB1bml0c1wiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJXYXZlbGVuZ3RoIFVuaXRzXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZC1zaW5nbGVcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIlVuaXRsZXNzXCIsXG4gICAgICAgIFwibm1cIixcbiAgICAgICAgXCJ1bVwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIldhdmVsZW5ndGggdW5pdHMgKGUuZy4gbm0sIHVtLCBIeilcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJUYXJnZXQgU3RhdHVzXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkRyaWVkXCIsXG4gICAgICAgIFwiRnJlc2hcIixcbiAgICAgICAgXCJHcmVlblwiLFxuICAgICAgICBcIkdyb3VuZFwiLFxuICAgICAgICBcIkxpcXVpZFwiLFxuICAgICAgICBcIkxpdmVcIixcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIlBhbmVsXCIsXG4gICAgICAgIFwiU3RhbmRhcmRcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTdGF0ZSBvZiB0aGUgbWVhc3VyZW1lbnQgdGFyZ2V0LlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxpZ2h0IFNvdXJjZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJMYW1wXCIsXG4gICAgICAgIFwiTGFzZXJcIixcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIlN1blwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkRlc2NyaXB0aW9uIG9mIHRoZSBsaWdodCBzb3VyY2UgdXNlZCBmb3IgeW91ciBzcGVjdHJhbCBtZWFzdXJlbWVudHNcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMaWdodCBTb3VyY2UgU3BlY2lmaWNhdGlvbnNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGb3Jlb3B0aWMgVHlwZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJCYXJlIEZpYmVyXCIsXG4gICAgICAgIFwiQ29udGFjdCBQcm9iZVwiLFxuICAgICAgICBcIkNvc2luZSBEaWZmdXNlclwiLFxuICAgICAgICBcIkZvcmVvcHRpY1wiLFxuICAgICAgICBcIkdlcnNob24gVHViZVwiLFxuICAgICAgICBcIkludGVncmF0aW5nIFNwaGVyZVwiLFxuICAgICAgICBcIkxlYWYgQ2xpcFwiLFxuICAgICAgICBcIk5vbmVcIixcbiAgICAgICAgXCJPdGhlclwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkRlc2NyaXB0aW9uIG9mIHRoZSBmb3Jlb3B0aWMgdXNlZCB0byBtYWtlIHlvdXIgc3BlY3RyYWwgbWVhc3VyZW1lbnRcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGb3Jlb3B0aWMgRmllbGQgb2YgVmlld1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJpbnRlZ2VyIGRlZ3JlZXNcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkZvcmVvcHRpYyBTcGVjaWZpY2F0aW9uc1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiUHJvY2Vzc2luZyBJbmZvcm1hdGlvblwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUHJvY2Vzc2luZyBBdmVyYWdlZFwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWQtc2luZ2xlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTm9cIixcbiAgICAgICAgXCJZZXNcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJcyB0aGUgbWVhc3VyZW1lbnQgYW4gYXZlcmFnZSBvZiBtdWx0aXBsZSBtZWFzdXJlbWVudHM/XCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlByb2Nlc3NpbmcgSW50ZXJwb2xhdGVkXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZC1zaW5nbGVcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJOb1wiLFxuICAgICAgICBcIlllc1wiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIklzIHRoZSBtZWFzdXJlbWVudCBpbnRlcnBvbGF0ZWQ/XCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlByb2Nlc3NpbmcgUmVzYW1wbGVkXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZC1zaW5nbGVcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJOb1wiLFxuICAgICAgICBcIlllc1wiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIklzIHRoZSBtZWFzdXJlbWVudCByZXNhbXBsZWQ/IChlLmcuIGFyZSBtdWx0aXBsZSB3YXZlbGVuZ3RocyBhdmVyYWdlZD8pXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlByb2Nlc3NpbmcgSW5mb3JtYXRpb24gRGV0YWlsc1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiT3RoZXIgZGV0YWlscyBhYm91dCBwcm9jZXNzaW5nIGFyZSBwcm92aWRlZCBoZXJlLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIkluc3RydW1lbnRcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkluc3RydW1lbnQgTWFudWZhY3R1cmVyXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwic3BsaXQtdGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTcGVjdHJvbWV0ZXIgbWFudWZhY3R1cmVyLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbnN0cnVtZW50IE1vZGVsXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwic3BsaXQtdGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTcGVjdHJvbWV0ZXIgbW9kZWwuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkluc3RydW1lbnQgU2VyaWFsIE51bWJlclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiVGhlbWVcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlRoZW1lXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkFncmljdWx0dXJlXCIsXG4gICAgICAgIFwiQmlvY2hlbWlzdHJ5XCIsXG4gICAgICAgIFwiRWNvbG9neVwiLFxuICAgICAgICBcIkZvcmVzdFwiLFxuICAgICAgICBcIkdsb2JhbCBDaGFuZ2VcIixcbiAgICAgICAgXCJMYW5kIENvdmVyXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJQaGVub2xvZ3lcIixcbiAgICAgICAgXCJQaHlzaW9sb2d5XCIsXG4gICAgICAgIFwiVXJiYW5cIixcbiAgICAgICAgXCJXYXRlciBRdWFsaXR5XCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmVzZWFyY2ggY29udGV4dCBmb3IgdGhlIHRoZSBzcGVjdHJhbCBtZWFzdXJlbWVudHMuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiS2V5d29yZHNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJFY29zeXN0ZW0gVHlwZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBcXVhdGljXCIsXG4gICAgICAgIFwiQ29hc3RhbFwiLFxuICAgICAgICBcIkNyb3BzXCIsXG4gICAgICAgIFwiRm9yZXN0XCIsXG4gICAgICAgIFwiR3Jhc3NsYW5kXCIsXG4gICAgICAgIFwiV2V0bGFuZFwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIkxvY2F0aW9uXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMYXRpdHVkZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImxhdGxuZ1wiLFxuICAgICAgXCJ1bml0c1wiOiBcImRlY2ltYWwgZGVncmVlXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMb25naXR1ZGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJsYXRsbmdcIixcbiAgICAgIFwidW5pdHNcIjogXCJkZWNpbWFsIGRlZ3JlZVwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiZ2VvanNvblwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImdlb2pzb25cIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiU3BlY3RyYVwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxvY2F0aW9uIE5hbWVcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIkRhdGVcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlNhbXBsZSBDb2xsZWN0aW9uIERhdGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJkYXRlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiSVNPIERhdGUgXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNZWFzdXJlbWVudCBEYXRlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiZGF0ZVwiLFxuICAgICAgXCJ1bml0c1wiOiBcIklTTyBEYXRlIFwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUGhlbm9sb2dpY2FsIFN0YXR1c1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiU3BlY2llc1wiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ29tbW9uIE5hbWVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkNvbW1vbiBuYW1lIG9mIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxhdGluIEdlbnVzXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMYXRpbiBnZW51cyBvZiB0aGUgdGFyZ2V0IHRoYXQgd2FzIG1lYXN1cmVkLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMYXRpbiBTcGVjaWVzXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMYXRpbiBzcGVjaWVzIG9mIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlVTREEgU3ltYm9sXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJVU0RBIGNvZGUgb2YgdGhlIHRhcmdldCB0aGF0IHdhcyBtZWFzdXJlZC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVmVnZXRhdGlvbiBUeXBlXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJDaXRhdGlvblwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ2l0YXRpb25cIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJDaXRhdGlvbiBET0lcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJXZWJzaXRlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQXV0aG9yXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQXV0aG9yIEVtYWlsXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWFpbnRhaW5lclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1haW50YWluZXIgRW1haWxcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGdW5kaW5nIFNvdXJjZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkZ1bmRpbmcgU291cmNlIEdyYW50IE51bWJlclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlllYXJcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdXG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmICh0aGlzLl9ldmVudHMpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGV2bGlzdGVuZXIpKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoZXZsaXN0ZW5lcilcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gMDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIl19
