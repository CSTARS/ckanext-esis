(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Ecosis = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

},{}]},{},[4])(4)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi9ja2FuL2FkZFJlc291cmNlLmpzIiwibGliL2NrYW4vaW5kZXguanMiLCJsaWIvZGF0YXN0b3JlLmpzIiwibGliL2luZGV4LmpzIiwibGliL2xvZ2ljL2NyZWF0ZVBhY2thZ2UuanMiLCJsaWIvbG9naWMvaW5kZXguanMiLCJsaWIvbG9naWMvdmVyaWZ5L2luZGV4LmpzIiwibGliL2xvZ2ljL3ZlcmlmeS9uYW1lLmpzIiwibGliL3BhY2thZ2UvY3JlYXRlU2NoZW1hTWV0aG9kcy5qcyIsImxpYi9wYWNrYWdlL2NydWQuanMiLCJsaWIvcGFja2FnZS9pbmRleC5qcyIsImxpYi9wYWNrYWdlL3RlbXBsYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsInV0aWxzL21ldGFkYXRhL3NjaGVtYS5qc29uIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25tQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIHJlcXVlc3QsIGtleSwgaG9zdDtcblxuLy8gVE9ETzogdGhpcyBuZWVkcyB0byBiZSB2ZXJpZmllZCA6L1xuZnVuY3Rpb24gYWRkUmVzb3VyY2VOb2RlKHBrZ2lkLCBmaWxlLCBjYWxsYmFjaykge1xuICB2YXIgciA9IHJlcXVlc3RcbiAgIC5wb3N0KGhvc3QgKyAnL2FwaS8zL2FjdGlvbi9yZXNvdXJjZV9jcmVhdGUnKVxuICAgLndpdGhDcmVkZW50aWFscygpXG4gICAuZmllbGQoJ3BhY2thZ2VfaWQnLCBwa2dpZClcbiAgIC5maWVsZCgnbWltZXR5cGUnLCBmaWxlLm1pbWV0eXBlKVxuICAgLmZpZWxkKCduYW1lJywgZmlsZS5maWxlbmFtZSlcbiAgIC5maWVsZCgndXJsJywndXBsb2FkJylcbiAgIC5hdHRhY2goJ3VwbG9hZCcsIGZpbGUucGF0aCk7XG5cbiAgaWYoIGtleSApIHtcbiAgICByLnNldCgnQXV0aG9yaXphdGlvbicsIGtleSk7XG4gIH1cblxuICByLmVuZChjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGFkZFJlc291cmNlQnJvd3Nlcihwa2dpZCwgZmlsZSwgY2FsbGJhY2ssIHByb2dyZXNzKSB7XG4gIC8vIFRPRE86IGlmIHRoaXMgZmFpbHMsIHdlIGhhdmUgYW4gaXNzdWUgb24gb3VyIGhhbmRzXG4gIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXG4gIGZvcm1EYXRhLmFwcGVuZCgncGFja2FnZV9pZCcsIHBrZ2lkKTtcbiAgZm9ybURhdGEuYXBwZW5kKCdtaW1ldHlwZScsIGZpbGUubWltZXR5cGUpO1xuICBmb3JtRGF0YS5hcHBlbmQoJ25hbWUnLCBmaWxlLmZpbGVuYW1lKTtcbiAgZm9ybURhdGEuYXBwZW5kKCd1cmwnLCAndXBsb2FkJyk7XG4gIGZvcm1EYXRhLmFwcGVuZCgndXBsb2FkJywgbmV3IEJsb2IoW2ZpbGUuY29udGVudHNdLCB7dHlwZTogZmlsZS5taW1ldHlwZX0pLCBmaWxlLmZpbGVuYW1lKTtcblxuICB2YXIgdGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gIHZhciB4aHIgPSAkLmFqYXhTZXR0aW5ncy54aHIoKTtcbiAgLy8gYXR0YWNoIHByb2dyZXNzIGhhbmRsZXIgdG8gdGhlIFhNTEh0dHBSZXF1ZXN0IE9iamVjdFxuXG4gIHRyeSB7XG4gICAgICBpZiggcHJvZ3Jlc3MgKSB7XG4gICAgICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKFwicHJvZ3Jlc3NcIiwgZnVuY3Rpb24oZXZ0KXtcbiAgICAgICAgICAgICAgaWYgKGV2dC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpZmYgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRpbWU7XG4gICAgICAgICAgICAgICAgdmFyIHNwZWVkID0gKGV2dC5sb2FkZWQgLyAxMDAwMDAwKSAvIChkaWZmIC8gMTAwMCk7XG4gICAgICAgICAgICAgICAgICBwcm9ncmVzcygoKGV2dC5sb2FkZWQgLyBldnQudG90YWwpKjEwMCkudG9GaXhlZCgwKSwgc3BlZWQudG9GaXhlZCgyKSsnTWJwcycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgfVxuICB9IGNhdGNoKGUpIHt9XG5cbiAgJC5hamF4KHtcbiAgICB1cmw6IGhvc3QgKyAnL2FwaS8zL2FjdGlvbi9yZXNvdXJjZV9jcmVhdGUnLFxuICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgIGRhdGE6IGZvcm1EYXRhLFxuICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICBjb250ZW50VHlwZTogZmFsc2UsXG4gICAgeGhyRmllbGRzOiB7XG4gICAgICB3aXRoQ3JlZGVudGlhbHM6IHRydWVcbiAgICB9LFxuICAgIHhociA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geGhyO1xuICAgIH0sXG4gICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcCl7XG4gICAgICBjYWxsYmFjayhudWxsLCB7XG4gICAgICAgIGJvZHkgOiByZXNwXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGVycm9yIDogZnVuY3Rpb24oKSB7XG4gICAgICBjYWxsYmFjayh7ZXJyb3I6dHJ1ZSxtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHhocjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihyLCBoLCBrLCBpc0Jyb3dzZXIsIGhhbmRsZVJlc3ApIHtcbiAgcmVxdWVzdCA9IHI7XG4gIGtleSA9IGs7XG4gIGhvc3QgPSBoO1xuXG4gIHJldHVybiBmdW5jdGlvbihwa2dpZCwgZmlsZSwgY2FsbGJhY2ssIHByb2dyZXNzKSB7XG4gICAgZnVuY3Rpb24gbmV4dChlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgaWYoIGlzQnJvd3NlciApIGFkZFJlc291cmNlQnJvd3Nlcihwa2dpZCwgZmlsZSwgbmV4dCwgcHJvZ3Jlc3MpO1xuICAgIGVsc2UgYWRkUmVzb3VyY2VOb2RlKHBrZ2lkLCBmaWxlLCBuZXh0KTtcbiAgfTtcbn07XG4iLCJ2YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcblxuLy8gZGVwZW5kcyBpZiB3ZSBhcmUgcnVubmluZyBmcm9tIG5vZGVqcyBvciBicm93c2VyXG52YXIgYWdlbnQgPSByZXF1ZXN0LmFnZW50ID8gcmVxdWVzdC5hZ2VudCgpIDogcmVxdWVzdDtcbnZhciBpc0Jyb3dzZXIgPSByZXF1ZXN0LmFnZW50ID8gZmFsc2UgOiB0cnVlO1xudmFyIGtleSA9ICcnO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHRoaXMuaG9zdCA9IGNvbmZpZy5ob3N0IHx8ICcvJztcbiAga2V5ID0gY29uZmlnLmtleSB8fCAnJztcbiAgdGhpcy5rZXkgPSBrZXk7XG5cbiAgdGhpcy5wcmVwYXJlV29ya3NwYWNlID0gZnVuY3Rpb24ocGtnaWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3dvcmtzcGFjZS9wcmVwYXJlJyxcbiAgICAgIHtcbiAgICAgICAgZm9yY2U6IHRydWUsXG4gICAgICAgIHBhY2thZ2VfaWQ6IHBrZ2lkXG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKXtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0V29ya3NwYWNlID0gZnVuY3Rpb24ocGtnaWQsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3dvcmtzcGFjZS9nZXQnLFxuICAgICAge1xuICAgICAgICBwYWNrYWdlX2lkIDogcGtnaWRcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3Ape1xuICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICk7XG4gIH07XG5cbiAgdGhpcy5nZXRBY3RpdmVVc2VyID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBnZXQoXG4gICAgICB0aGlzLmhvc3QrJy9lY29zaXMvdXNlci9nZXQnLFxuICAgICAge30sXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgYSByZXNvdXJjZSB0byBhIHBhY2thZ2UgdXNpbmcgdGhlIGJyb3dzZXJzIEZvcm1EYXRhIG9iamVjdCBpbiBhIGJyb3dzZXJcbiAgICogb3IgdXNlciB0aGUgc3VwZXJhZ2VudCBmb3IgTm9kZUpTXG4gICAqXG4gICAqIHBrZ2lkOiBpZCBvZiB0aGUgcGFja2FnZSB0byBhZGQgdG9cbiAgICogZmlsZTogb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgdG8gcmVzb3VyY2UgdG8gdXBsb2FkIG9yIGlmIE5vZGVKUyBzdHJpbmcgcGF0aCB0byBmaWxlXG4gICAqIGNhbGxiYWNrOiBjYWxsYmFjayBoYW5kbGVyXG4gICAqIHByb2dyZXNzOiBjYWxsYmFjayBmb3IgcHJvZ3Jlc3MgdXBkYXRlIChub3Qgc3VwcG9ydGVkIGluIE5vZGVKUylcbiAgICoqL1xuICB0aGlzLmFkZFJlc291cmNlID0gcmVxdWlyZSgnLi9hZGRSZXNvdXJjZScpKHJlcXVlc3QsIGNvbmZpZy5ob3N0LCBrZXksIGlzQnJvd3NlciwgaGFuZGxlUmVzcCk7XG5cblxuICB0aGlzLmdldERhdGFzaGVldCA9IGZ1bmN0aW9uKHBrZ2lkLCByaWQsIHNpZCwgY2FsbGJhY2spIHtcbiAgICBnZXQoXG4gICAgICB0aGlzLmhvc3QrJy9lY29zaXMvcmVzb3VyY2UvZ2V0JyxcbiAgICAgIHtcbiAgICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkLFxuICAgICAgICByZXNvdXJjZV9pZCA6IHJpZCxcbiAgICAgICAgZGF0YXNoZWV0X2lkIDogc2lkXG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgKTtcbiAgfTtcblxuICB0aGlzLmdldE1ldGFkYXRhSW5mbyA9IGZ1bmN0aW9uKHBhY2thZ2VfaWQsIHJlc291cmNlX2lkLCBzaGVldF9pZCwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBxdWVyeSA9IHtcbiAgICAgICAgcGFja2FnZV9pZCA6IHBhY2thZ2VfaWQsXG4gICAgICAgIHJlc291cmNlX2lkIDogcmVzb3VyY2VfaWRcbiAgICAgIH07XG4gICAgICBpZiggc2hlZXRfaWQgKSB7XG4gICAgICAgIHF1ZXJ5LnNoZWV0X2lkID0gc2hlZXRfaWQ7XG4gICAgICB9XG5cbiAgICAgIGdldChcbiAgICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL2dldE1ldGFkYXRhSW5mbycsXG4gICAgICAgIHF1ZXJ5LFxuICAgICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICApO1xuICB9O1xuXG4gIHRoaXMuZ2V0TWV0YWRhdGFDaHVuayA9IGZ1bmN0aW9uKHBhY2thZ2VfaWQsIHJlc291cmNlX2lkLCBzaGVldF9pZCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgcXVlcnkgPSB7XG4gICAgICAgIHBhY2thZ2VfaWQgOiBwYWNrYWdlX2lkLFxuICAgICAgICByZXNvdXJjZV9pZCA6IHJlc291cmNlX2lkLFxuICAgICAgICBpbmRleCA6IGluZGV4XG4gICAgICB9O1xuICAgICAgaWYoIHNoZWV0X2lkICkge1xuICAgICAgICBxdWVyeS5zaGVldF9pZCA9IHNoZWV0X2lkO1xuICAgICAgfVxuXG4gICAgICBnZXQoXG4gICAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9nZXRNZXRhZGF0YUNodW5rJyxcbiAgICAgICAgcXVlcnksXG4gICAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gIH07XG5cbiAgdGhpcy5nZXRTcGVjdHJhID0gZnVuY3Rpb24ocGtnaWQsIHJpZCwgc2lkLCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICB2YXIgcXVlcnkgPSB7XG4gICAgICBwYWNrYWdlX2lkIDogcGtnaWQsXG4gICAgICBpbmRleCA6IGluZGV4XG4gICAgfTtcblxuICAgIGlmKCByaWQgKSB7XG4gICAgICBxdWVyeS5yZXNvdXJjZV9pZCA9IHJpZDtcbiAgICB9XG4gICAgaWYoIHNpZCApIHtcbiAgICAgIHF1ZXJ5LnNoZWV0X2lkID0gc2lkO1xuICAgIH1cblxuICAgIGdldChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy9zcGVjdHJhL2dldCcsXG4gICAgICBxdWVyeSxcbiAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICk7XG4gIH07XG5cbiAgdGhpcy5nZXRTcGVjdHJhQ291bnQgPSBmdW5jdGlvbihwa2dpZCwgcmlkLCBzaWQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge1xuICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkXG4gICAgfTtcblxuICAgIGlmKCByaWQgKSB7XG4gICAgICBxdWVyeS5yZXNvdXJjZV9pZCA9IHJpZDtcbiAgICB9XG4gICAgaWYoIHNpZCApIHtcbiAgICAgIHF1ZXJ5LnNoZWV0X2lkID0gc2lkO1xuICAgIH1cblxuICAgIGdldChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy9yZXNvdXJjZS9nZXRTcGVjdHJhQ291bnQnLFxuICAgICAgcXVlcnksXG4gICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICApO1xuICB9O1xuXG5cbiAgdGhpcy5wcm9jZXNzUmVzb3VyY2UgPSBmdW5jdGlvbihwa2dpZCwgcmVzb3VyY2VfaWQsIHNoZWV0X2lkLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgICBwYWNrYWdlX2lkIDogcGtnaWQsXG4gICAgICAgIG9wdGlvbnMgOiBKU09OLnN0cmluZ2lmeShvcHRpb25zKVxuICAgIH07XG5cbiAgICAvLyBhcHBseSB0byBtdWx0aXBsZSByZXNvdXJjZXMsIGhlbHBlciBmb3IgZmlyc3QgdXBsb2FkXG4gICAgaWYoIEFycmF5LmlzQXJyYXkocmVzb3VyY2VfaWQpICkge1xuICAgICAgZGF0YS5yZXNvdXJjZV9pZHMgPSBKU09OLnN0cmluZ2lmeShyZXNvdXJjZV9pZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGEucmVzb3VyY2VfaWQgPSByZXNvdXJjZV9pZDtcbiAgICAgIGRhdGEuc2hlZXRfaWQgPSBzaGVldF9pZDtcbiAgICB9XG5cbiAgICBwb3N0KFxuICAgICAgdGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL3Byb2Nlc3MnLFxuICAgICAgZGF0YSxcbiAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICBpZiggaXNFcnJvcihlcnIsIHJlc3ApICkgcmV0dXJuIGNhbGxiYWNrKHtlcnJvcjp0cnVlLCBtZXNzYWdlOidSZXF1ZXN0IEVycm9yJ30pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSBpbmZvIGluIHRoZSBkYXRhc3RvcmUgaWYgd2UgaGF2ZSBvbmVcbiAgICAgICAgaWYoIHRoaXMuZHMgKSB7XG4gICAgICAgICAgdGhpcy5kcy53YXZlbGVuZ3RocyA9IHJlc3Aud2F2ZWxlbmd0aHMgfHwgW107XG4gICAgICAgICAgdGhpcy5kcy5zY2hlbWEgPSBbXTtcbiAgICAgICAgICBpZiggIXJlc3AuYXR0cmlidXRlcyApIHJldHVybjtcblxuICAgICAgICAgIGZvciggdmFyIGF0dHJOYW1lIGluIHJlc3AuYXR0cmlidXRlcyApIHtcbiAgICAgICAgICAgICAgdmFyIGF0dHIgPSByZXNwLmF0dHJpYnV0ZXNbYXR0ck5hbWVdO1xuICAgICAgICAgICAgICBhdHRyLm5hbWUgPSBhdHRyTmFtZTtcbiAgICAgICAgICAgICAgdGhpcy5kcy5zY2hlbWEucHVzaChhdHRyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICAgICAgfVxuICAgICk7XG4gIH07XG5cbiAgdGhpcy5nZXRMaWNlbnNlTGlzdCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9saWNlbnNlX2xpc3QnLCB7fSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuZ2V0UGFja2FnZSA9IGZ1bmN0aW9uKHBrZ2lkLCBjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9hcGkvMy9hY3Rpb24vcGFja2FnZV9zaG93Jywge2lkIDogcGtnaWR9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5nZXRPcmdhbml6YXRpb24gPSBmdW5jdGlvbihuYW1lT3JJZCwgY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL29yZ2FuaXphdGlvbl9zaG93Jywge2lkIDogbmFtZU9ySWR9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy50YWdTZWFyY2ggPSBmdW5jdGlvbihxdWVyeSwgbGltaXQsIGNhbGxiYWNrKSB7XG4gICAgLy8gc3VwcG9ydGluZyBtdWx0aXBsZSB2ZXJzaW9ucyBvZiBja2FuLiAgd2h5IHRoZXkgY2hhbmdlZCB0aGlzIHBhcmFtZXRlci4uLiB3aG8ga25vd3MuLi5cblxuICAgIHF1ZXJ5ID0ge1xuICAgICAgcXVlcnkgOiBxdWVyeSxcbiAgICAgIGNrYW4gOiBxdWVyeSxcbiAgICAgIGxpbWl0IDogbGltaXQgfHwgMTBcbiAgICB9O1xuXG4gICAgZ2V0KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi90YWdfc2VhcmNoJywgcXVlcnksIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICBpZiggcmVzcC5lcnJvciApIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2socmVzcCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciB0bXAgPSB7fSwga2V5O1xuICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgcmVzcC5yZXN1bHRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgcmVzcC5yZXN1bHRzW2ldLm5hbWUgPSByZXNwLnJlc3VsdHNbaV0ubmFtZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICAgICAgICAgIHRtcFtyZXNwLnJlc3VsdHNbaV0ubmFtZV0gPSByZXNwLnJlc3VsdHNbaV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzcC5yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yKCBrZXkgaW4gdG1wICkge1xuICAgICAgICAgICAgcmVzcC5yZXN1bHRzLnB1c2godG1wW2tleV0pO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICAgICAgY2FsbGJhY2socmVzcCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLnVwZGF0ZVBhY2thZ2UgPSBmdW5jdGlvbihwa2csIGNhbGxiYWNrKSB7XG4gICAgaWYoIHBrZy5wcml2YXRlICkge1xuICAgICAgdGhpcy52ZXJpZnlQcml2YXRlKHBrZy5pZCxcbiAgICAgICAgZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZVBhY2thZ2UocGtnLCBjYWxsYmFjayk7XG4gICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlUGFja2FnZShwa2csIGNhbGxiYWNrKTtcbiAgfTtcblxuICB0aGlzLl91cGRhdGVQYWNrYWdlID0gZnVuY3Rpb24ocGtnLCBjYWxsYmFjaykge1xuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL3BhY2thZ2VfdXBkYXRlJywgcGtnLCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy51cGRhdGVMaW5rZWRSZXNvdXJjZXMgPSBmdW5jdGlvbihpZCwgcmVzb3VyY2VzLCBjYWxsYmFjaykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgaWQgOiBpZCxcbiAgICAgIGxpbmtlZFJlc291cmNlcyA6IHJlc291cmNlc1xuICAgIH1cblxuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvZWNvc2lzL3BhY2thZ2UvdXBkYXRlTGlua2VkUmVzb3VyY2VzJywgZGF0YSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMudmVyaWZ5UHJpdmF0ZSA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjaykge1xuICAgIGdldCh0aGlzLmhvc3QrJy9lY29zaXMvcGFja2FnZS9zZXRQcml2YXRlJywge2lkOiBpZH0sIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmRlbGV0ZVBhY2thZ2UgPSBmdW5jdGlvbihwa2dpZCwgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9wYWNrYWdlX2RlbGV0ZScsIEpTT04uc3RyaW5naWZ5KHtpZDogcGtnaWR9KSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuY3JlYXRlUGFja2FnZSA9IGZ1bmN0aW9uKHBrZywgY2FsbGJhY2spIHtcbiAgICBwb3N0UmF3KHRoaXMuaG9zdCsnL2FwaS8zL2FjdGlvbi9wYWNrYWdlX2NyZWF0ZScsIHBrZywgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qdGhpcy5zZXRQYWNrYWdlT3B0aW9ucyA9IGZ1bmN0aW9uKHBrZ2lkLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkLFxuICAgICAgb3B0aW9ucyA6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpXG4gICAgfTtcblxuICAgIHBvc3QodGhpcy5ob3N0KycvZWNvc2lzL3BhY2thZ2Uvc2V0T3B0aW9ucycsIGRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTsqL1xuXG4gIHRoaXMudG9wU3VnZ2VzdE92ZXJ2aWV3ID0gZnVuY3Rpb24obGlzdCwgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG5hbWVzIDogSlNPTi5zdHJpbmdpZnkobGlzdCksXG4gICAgfTtcblxuICAgIHBvc3QodGhpcy5ob3N0KycvZWNvc2lzL3NwZWN0cmEvc3VnZ2VzdE92ZXJ2aWV3JywgZGF0YSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMudG9wU3VnZ2VzdCA9IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgZ2V0KHRoaXMuaG9zdCsnL2Vjb3Npcy9zcGVjdHJhL3N1Z2dlc3QnLCB7bmFtZSA6bmFtZX0sIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmdjbWRTdWdnZXN0ID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL3NwZWN0cmEvZ2NtZCcsIHtxdWVyeTogbmFtZS50b0xvd2VyQ2FzZSgpfSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMucmVtb3ZlUmVzb3VyY2UgPSBmdW5jdGlvbihyZXNvdXJjZUlkLCBjYWxsYmFjaykge1xuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvYXBpLzMvYWN0aW9uL3Jlc291cmNlX2RlbGV0ZScsIEpTT04uc3RyaW5naWZ5KHtpZCA6IHJlc291cmNlSWQgfSksIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmRlbGV0ZVJlc291cmNlcyA9IGZ1bmN0aW9uKHJlc291cmNlSWRzLCBjYWxsYmFjaykge1xuICAgIHBvc3RSYXcodGhpcy5ob3N0KycvZWNvc2lzL3Jlc291cmNlL2RlbGV0ZU1hbnknLCBKU09OLnN0cmluZ2lmeSh7aWRzIDogcmVzb3VyY2VJZHMgfSksIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgaGFuZGxlUmVzcChlcnIsIHJlc3AsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLnB1c2hUb1NlYXJjaCA9IGZ1bmN0aW9uKHBrZ2lkLCBpbmNsdWRlRW1haWwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge1xuICAgICAgcGFja2FnZV9pZCA6IHBrZ2lkLFxuICAgICAgZW1haWwgOiBpbmNsdWRlRW1haWwgPyAndHJ1ZScgOiAnZmFsc2UnXG4gICAgfTtcblxuICAgIGdldChcbiAgICAgIHRoaXMuaG9zdCsnL2Vjb3Npcy93b3Jrc3BhY2UvcHVzaCcsXG4gICAgICBxdWVyeSxcbiAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICk7XG4gIH07XG5cbiAgdGhpcy5naXRJbmZvID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBnZXQodGhpcy5ob3N0KycvZWNvc2lzL2dpdEluZm8nLCB7fSwgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICBoYW5kbGVSZXNwKGVyciwgcmVzcCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9O1xufTtcblxuXG5mdW5jdGlvbiBwb3N0KHVybCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgdmFyIHIgPSByZXF1ZXN0XG4gICAucG9zdCh1cmwpXG4gICAud2l0aENyZWRlbnRpYWxzKClcbiAgIC50eXBlKCdmb3JtJylcbiAgIC5zZW5kKGRhdGEpO1xuXG4gIGlmKCBrZXkgKSB7XG4gICAgci5zZXQoJ0F1dGhvcml6YXRpb24nLCBrZXkpO1xuICB9XG5cbiAgci5lbmQoY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBwb3N0UmF3KHVybCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgdmFyIHIgPSByZXF1ZXN0XG4gICAucG9zdCh1cmwpXG4gICAud2l0aENyZWRlbnRpYWxzKClcbiAgIC5zZW5kKGRhdGEpO1xuXG4gICBpZigga2V5ICkge1xuICAgICByLnNldCgnQXV0aG9yaXphdGlvbicsIGtleSk7XG4gICB9XG5cbiAgIHIuZW5kKGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gZ2V0KHVybCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgdmFyIHIgPSByZXF1ZXN0XG4gICAgLmdldCh1cmwpXG4gICAgLnF1ZXJ5KGRhdGEgfHwge30pXG4gICAgLndpdGhDcmVkZW50aWFscygpO1xuXG5cbiAgaWYoIGtleSApIHtcbiAgICByLnNldCgnQXV0aG9yaXphdGlvbicsIGtleSk7XG4gIH1cblxuICByLmVuZChjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVJlc3AoZXJyLCByZXNwLCBjYWxsYmFjaykge1xuICBpZiggZXJyICkge1xuICAgIHJldHVybiBjYWxsYmFjayh7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0IEVycm9yJyxcbiAgICAgIHR5cGUgOiAnaHR0cCcsXG4gICAgICBkZXRhaWxzOiBlcnJcbiAgICB9KTtcbiAgfVxuXG4gIGlmKCAhcmVzcCApIHtcbiAgICByZXR1cm4gY2FsbGJhY2soe1xuICAgICAgZXJyb3I6IHRydWUsXG4gICAgICBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsXG4gICAgICB0eXBlIDogJ2h0dHAnLFxuICAgICAgZGV0YWlsczogJ1NlcnZlciBkaWQgbm90IHNlbmQgYSByZXNwb25zZSdcbiAgICB9KTtcbiAgfVxuXG4gIGlmKCAhcmVzcC5ib2R5ICkge1xuICAgIHJldHVybiBjYWxsYmFjayh7XG4gICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIG1lc3NhZ2U6ICdSZXF1ZXN0IEVycm9yJyxcbiAgICAgIHR5cGUgOiAnaHR0cCcsXG4gICAgICBkZXRhaWxzOiAnU2VydmVyIGRpZCBub3Qgc2VuZCBhIHJlc3BvbnNlJ1xuICAgIH0pO1xuICB9XG5cbiAgaWYoIHJlc3AuYm9keS5lcnJvciApIHtcbiAgICByZXR1cm4gY2FsbGJhY2soe1xuICAgICAgZXJyb3I6IHRydWUsXG4gICAgICBtZXNzYWdlOiAnUmVxdWVzdCBFcnJvcicsXG4gICAgICB0eXBlIDogJ2NrYW4nLFxuICAgICAgZGV0YWlsczogcmVzcCA/IHJlc3AuYm9keSA6ICcnXG4gICAgfSk7XG4gIH1cblxuICBpZiggcmVzcC5ib2R5LnN1Y2Nlc3MgJiYgcmVzcC5ib2R5LnJlc3VsdCApIHtcbiAgICBjYWxsYmFjayhyZXNwLmJvZHkucmVzdWx0KTtcbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjayhyZXNwLmJvZHkpO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gaXNFcnJvcihlcnIsIHJlc3ApIHtcbiAgaWYoIGVyciApIHJldHVybiB0cnVlO1xuICBpZiggcmVzcCAmJiByZXNwLmJvZHkgJiYgcmVzcC5ib2R5LmVycm9yICkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsInZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlcjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgdGhpcy5ja2FuID0gY29uZmlnLmNrYW47XG4gIHRoaXMuU0RLID0gY29uZmlnLlNESztcbiAgaWYoIHRoaXMuY2thbiApIHRoaXMuY2thbi5kcyA9IHRoaXM7XG5cbiAgLy8gaXMgdGhpcyBhbiBleGlzdGluZyBkYXRhc2V0XG4gIHRoaXMuZWRpdE1vZGUgPSBjb25maWcucGFja2FnZV9pZCA/IHRydWUgOiBmYWxzZTtcblxuICAvLyBleGlzdGluZyBwYWNrYWdlIGlkXG4gIHRoaXMucGFja2FnZV9pZCA9IGNvbmZpZy5wYWNrYWdlX2lkO1xuXG4gIHRoaXMucGFja2FnZSA9IHRoaXMuU0RLLm5ld1BhY2thZ2UoKTtcbiAgdGhpcy5wYWNrYWdlLm1vZGUgPSB0aGlzLmVkaXRNb2RlID8gJ2VkaXQnIDogJ2NyZWF0ZSc7XG5cbiAgdGhpcy5vd25lcl9vcmdfbmFtZSA9ICcnO1xuXG4gIHRoaXMuZGF0YXNldEF0dHJpYnV0ZXMgPSB7XG4gICAgLy9ncm91cF9ieSA6ICcnLFxuICAgIHNvcnRfb24gOiAnJyxcbiAgICBzb3J0X3R5cGUgOiAnJyxcbiAgICBzb3J0X2Rlc2NyaXB0aW9uIDogJydcbiAgfTtcblxuICAvLyBsaXN0IG9mIGFsbCBuZXcgcmVzb3VyY2VzXG4gIHRoaXMucmVzb3VyY2VzID0gW107XG5cbiAgLy8gaGFzaCBvZiBjdXJyZW50IGF0dHJpYnV0ZSBuYW1lIG1hcHBpbmdzXG4gIC8vICAtIGtleTogZWNvc2lzIG5hbWVcbiAgLy8gIC0gdmFsdWU6IGRhdGFzZXQgbmFtZVxuICB0aGlzLmF0dHJpYnV0ZU1hcCA9IHt9O1xuXG4gIC8vIGludmVyc2UgbGlzdCBvZiBhYm92ZSBtYXAgdy8ga2V5IC8gdmFsdWUgc3dpdGNoZWRcbiAgdGhpcy5pbnZlcnNlQXR0cmlidXRlTWFwID0ge307XG5cbiAgdGhpcy5tZXRhZGF0YURlZmluaXRpb25zID0gcmVxdWlyZSgnLi9zY2hlbWEnKTtcbiAgdGhpcy5tZXRhZGF0YUxvb2t1cCA9IHt9O1xuICBmb3IoIHZhciBjYXQgaW4gdGhpcy5tZXRhZGF0YURlZmluaXRpb25zICkge1xuICAgIHZhciBkZWZzID0gdGhpcy5tZXRhZGF0YURlZmluaXRpb25zW2NhdF07XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBkZWZzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZGVmc1tpXS5jYXRlZ29yeSA9IGNhdDtcbiAgICAgIGRlZnNbaV0uZmxhdCA9IGRlZnNbaV0ubmFtZS5yZXBsYWNlKC9cXHMvZywnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgIGRlZnNbaV0uZm5OYW1lID0gZGVmc1tpXS5uYW1lLnJlcGxhY2UoL1xccy9nLCcnKTtcbiAgICAgIHRoaXMubWV0YWRhdGFMb29rdXBbZGVmc1tpXS5uYW1lXSA9IGRlZnNbaV07XG4gICAgfVxuICB9XG5cbiAgLy8gdGhpcyBmbGFnIHByZXZlbnRzIHVwIGZyb20gbWFraW5nIHVwZGF0ZXMgd2hlbiB3ZSBhcmUgaW5pdGlhbGx5XG4gIC8vIHNldHRpbmcgdGhlIGRhdGFcbiAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcbiAgdGhpcy5sb2FkaW5nRXJyb3IgPSBmYWxzZTtcblxuICAvLyB3aXJlIGV2ZW50c1xuICB2YXIgZWUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIGVlLnNldE1heExpc3RlbmVycygxMDApO1xuICB0aGlzLm9uID0gZnVuY3Rpb24oZSwgZm4pIHtcbiAgICAvLyBpZiB0aGluZ3Mgd2FudCB0byBrbm93IHdlIGFyZSBsb2FkZWQgYW5kIHdlIGhhdmUgYWxyZWFkeSBmaXJlZCwganVzdCB0cmlnZ2VyLlxuICAgIGlmKCBlID09ICdsb2FkJyAmJiB0aGlzLmxvYWRlZCApIHtcbiAgICAgIHNldFRpbWVvdXQoZm4sIDIwMCk7IC8vIEhBQ0s6IG5lZWQgdG8gZml4IHNldFZhbHVlcygpIG9mIGVjb3Npcy0qLWlucHV0XG4gICAgICAvL3JldHVyblxuICAgIH1cblxuICAgIGVlLm9uKGUsIGZuKTtcbiAgfTtcblxuICB0aGlzLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNrYW4ucHJlcGFyZVdvcmtzcGFjZSh0aGlzLnBhY2thZ2VfaWQsIGZ1bmN0aW9uKHJlc3VsdCl7XG5cbiAgICAgIGlmKCByZXN1bHQuZXJyb3IgKSB7XG4gICAgICAgIHRoaXMubG9hZGluZ0Vycm9yID0gcmVzdWx0O1xuICAgICAgICBlZS5lbWl0KCdsb2FkLWVycm9yJywgcmVzdWx0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNrYW4uZ2V0V29ya3NwYWNlKHRoaXMucGFja2FnZV9pZCwgZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAgICAgaWYoIHJlc3VsdC5lcnJvciApIHtcbiAgICAgICAgICB0aGlzLmxvYWRpbmdFcnJvciA9IHJlc3VsdDtcbiAgICAgICAgICBlZS5lbWl0KCdsb2FkLWVycm9yJywgcmVzdWx0KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgdGhpcy5fc2V0RGF0YSgpO1xuXG4gICAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgZWUuZW1pdCgnbG9hZCcpO1xuICAgICAgICB0aGlzLmNoZWNrQ2hhbmdlcygpO1xuXG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgdGhpcy5sb2FkRnJvbVRlbXBsYXRlID0gZnVuY3Rpb24oY2thblBhY2thZ2UpIHtcbiAgICB0aGlzLnBhY2thZ2UucmVzZXQoKTtcbiAgICB0aGlzLnBhY2thZ2UubW9kZSA9ICdjcmVhdGUnO1xuXG4gICAgLy8gc2V0IHRoZSBkZWZhdWx0IGF0dGlyYnV0ZXMgZm9yIHRoaXMgZGF0YXNldFxuICAgIHRoaXMucGFja2FnZS5sb2FkRnJvbVRlbXBsYXRlKGNrYW5QYWNrYWdlLCB0aGlzLlNESy51c2VyKTtcbiAgICB0aGlzLnVwZGF0ZUFsaWFzTG9va3VwKCk7XG5cbiAgICBlZS5lbWl0KCdsb2FkJyk7XG4gICAgdGhpcy5maXJlVXBkYXRlKCk7XG4gIH07XG5cbiAgdGhpcy5jaGVja0NoYW5nZXMgPSBmdW5jdGlvbigpIHtcbiAgICBpZiggIXRoaXMuZWRpdE1vZGUgfHwgIXRoaXMubGFzdFB1c2hlZCApIHJldHVybjtcblxuICAgIHZhciB0ID0gbmV3IERhdGUodGhpcy5wYWNrYWdlLmRhdGEubWV0YWRhdGFfbW9kaWZpZWQpLmdldFRpbWUoKTtcblxuICAgIGlmKCB0aGlzLmRlbGV0ZVJlc291cmNlVGltZSApIHtcbiAgICAgIGlmKCB0aGlzLmRlbGV0ZVJlc291cmNlVGltZS5nZXRUaW1lKCkgPiB0ICkge1xuICAgICAgICB0ID0gdGhpcy5kZWxldGVSZXNvdXJjZVRpbWUuZ2V0VGltZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZXNwID0ge1xuICAgICAgbGFzdFB1c2hlZCA6IHRoaXMubGFzdFB1c2hlZCxcbiAgICAgIGxhc3RVcGRhdGVkIDogbmV3IERhdGUodCksXG4gICAgICB1bnB1Ymxpc2hlZENoYW5nZXMgOiAodGhpcy5sYXN0UHVzaGVkLmdldFRpbWUoKSA8IG5ldyBEYXRlKHQpLmdldFRpbWUoKSlcbiAgICB9O1xuXG4gICAgZWUuZW1pdCgnY2hhbmdlcycsIHJlc3ApO1xuICAgIHJldHVybiByZXNwO1xuICB9LFxuXG4gIC8vIGhlbHBlciBmb3Igd2hlbiBkYXRhIGxvYWRzXG4gIHRoaXMuX3NldERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVkaXRNb2RlID0gdHJ1ZTtcblxuICAgIHRoaXMubGFzdFB1c2hlZCA9IHRoaXMucmVzdWx0LnB1c2hlZDtcbiAgICBpZiggdGhpcy5sYXN0UHVzaGVkICkge1xuICAgICAgdGhpcy5sYXN0UHVzaGVkID0gbmV3IERhdGUodGhpcy5sYXN0UHVzaGVkKTtcbiAgICB9XG5cbiAgICB2YXIgY2thblBhY2thZ2UgPSB0aGlzLnJlc3VsdC5ja2FuLnBhY2thZ2U7XG4gICAgdGhpcy5wYWNrYWdlX2lkID0gY2thblBhY2thZ2UuaWQ7XG5cbiAgICB0aGlzLnBhY2thZ2UucmVzZXQoY2thblBhY2thZ2UpO1xuICAgIHRoaXMucGFja2FnZS5sb2FkRnJvbVRlbXBsYXRlKGNrYW5QYWNrYWdlLCBudWxsLCB0cnVlKTtcblxuICAgIHRoaXMuZGF0YXNoZWV0cyA9IHRoaXMucmVzdWx0LnJlc291cmNlcztcblxuICAgIHRoaXMuYXR0cmlidXRlTWFwID0ge307XG4gICAgdGhpcy5pbnZlcnNlQXR0cmlidXRlTWFwID0ge307XG5cbiAgICBpZiggdGhpcy5yZXN1bHQucGFja2FnZS5tYXAgJiYgT2JqZWN0KHRoaXMucGFja2FnZS5nZXRBbGlhc2VzKCkpLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHRoaXMucGFja2FnZS5zZXRBbGlhc2VzKHRoaXMucmVzdWx0LnBhY2thZ2UubWFwKTtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUFsaWFzTG9va3VwKCk7XG5cbiAgICAvLyBjaGVjayBmb3IgYmFkbmVzc1xuICAgIGlmKCB0aGlzLnJlc3VsdC5wYWNrYWdlLnNvcnQgJiYgT2JqZWN0KHRoaXMucGFja2FnZS5nZXRTb3J0KCkpLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHRoaXMucGFja2FnZS5zZXRTb3J0KHRoaXMucmVzdWx0LnBhY2thZ2Uuc29ydCk7XG4gICAgfVxuXG4gICAgdGhpcy5yZXNvdXJjZXMgPSB0aGlzLnJlc3VsdC5ja2FuLnJlc291cmNlcztcblxuICAgIHZhciB6aXBzID0ge307IC8vIHVzZWQgdG8gcXVpY2tseSBhZGQgcmVzb3VyY2Ugc3R1YnNcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMucmVzb3VyY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMucmVzb3VyY2VzW2ldLmZvcm1hdC50b0xvd2VyQ2FzZSgpID09PSAnemlwJyB8fCB0aGlzLnJlc291cmNlc1tpXS5uYW1lLnRvTG93ZXJDYXNlKCkubWF0Y2goL1xcLnppcCQvKSApIHtcbiAgICAgICAgemlwc1t0aGlzLnJlc291cmNlc1tpXS5pZF0gPSB0aGlzLnJlc291cmNlc1tpXTtcbiAgICAgICAgdGhpcy5yZXNvdXJjZXNbaV0uY2hpbGRSZXNvdXJjZXMgPSBbXTtcbiAgICAgICAgdGhpcy5yZXNvdXJjZXNbaV0uaXNaaXAgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuXG4gICAgdGhpcy5yZXNvdXJjZXMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgIGlmKCBhLm5hbWUgPiBiLm5hbWUgKSByZXR1cm4gMTtcbiAgICAgIGlmKCBhLm5hbWUgPCBiLm5hbWUgKSByZXR1cm4gLTE7XG4gICAgICByZXR1cm4gMDtcbiAgICB9KTtcblxuXG4gICAgdGhpcy5yZXNvdXJjZUxvb2t1cCA9IHt9O1xuXG4gICAgLy8gY3JlYXRlIGZha2Ugc3R1YnMgZm9yIHppcCBmaWxlIHJlc291cmNlc1xuICAgIHZhciBhbHJlYWR5QWRkZWQgPSB7fTtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YXNoZWV0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCAhdGhpcy5kYXRhc2hlZXRzW2ldLmZyb21aaXAgKSBjb250aW51ZTtcbiAgICAgIGlmKCBhbHJlYWR5QWRkZWRbdGhpcy5kYXRhc2hlZXRzW2ldLnJlc291cmNlSWRdICkgY29udGludWU7XG5cbiAgICAgIHZhciByID0gdGhpcy5kYXRhc2hlZXRzW2ldO1xuXG4gICAgICB2YXIgc3R1YiA9IHtcbiAgICAgICAgaWQgOiByLnJlc291cmNlSWQsXG4gICAgICAgIHBhY2thZ2VfaWQgOiByLnBhY2thZ2VJZCxcbiAgICAgICAgZnJvbVppcCA6IHRydWUsXG4gICAgICAgIHppcCA6IHIuemlwLFxuICAgICAgICBuYW1lIDogci5uYW1lXG4gICAgICB9XG5cbiAgICAgIHppcHNbci56aXAucmVzb3VyY2VJZF0uY2hpbGRSZXNvdXJjZXMucHVzaChzdHViKTtcbiAgICAgIHRoaXMucmVzb3VyY2VzLnB1c2goc3R1Yik7XG5cbiAgICAgIGFscmVhZHlBZGRlZFtyLnJlc291cmNlSWRdID0gMTsgLy8gd2h5P1xuICAgIH1cblxuICAgIC8vIG1hcCByZXNvdXJjZXMgdG8gZGF0YXNoZWV0cyBmb3IgZGFzdGVyIGxvb2t1cFxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5yZXNvdXJjZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB2YXIgZGF0YXNoZWV0cyA9IFtdO1xuICAgICAgZm9yKCB2YXIgaiA9IDA7IGogPCB0aGlzLmRhdGFzaGVldHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGlmKCB0aGlzLmRhdGFzaGVldHNbal0ucmVzb3VyY2VJZCA9PSB0aGlzLnJlc291cmNlc1tpXS5pZCApIHtcbiAgICAgICAgICBkYXRhc2hlZXRzLnB1c2godGhpcy5kYXRhc2hlZXRzW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnJlc291cmNlTG9va3VwW3RoaXMucmVzb3VyY2VzW2ldLmlkXSA9IHRoaXMucmVzb3VyY2VzW2ldO1xuICAgICAgdGhpcy5yZXNvdXJjZXNbaV0uZGF0YXNoZWV0cyA9IGRhdGFzaGVldHM7XG4gICAgfVxuXG4gICAgdGhpcy5maXJlVXBkYXRlKCk7XG4gIH1cblxuICB0aGlzLnVwZGF0ZUFsaWFzTG9va3VwID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSB0aGlzLnBhY2thZ2UuZ2V0QWxpYXNlcygpO1xuICAgIGZvciggdmFyIGtleSBpbiB0aGlzLmF0dHJpYnV0ZU1hcCApIHtcbiAgICAgIHRoaXMuaW52ZXJzZUF0dHJpYnV0ZU1hcFt0aGlzLmF0dHJpYnV0ZU1hcFtrZXldXSA9IGtleTtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy5zZXRTaGVldCA9IGZ1bmN0aW9uKHNoZWV0KSB7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGFzaGVldHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5kYXRhc2hlZXRzW2ldLnJlc291cmNlSWQgPT0gc2hlZXQucmVzb3VyY2VJZCAmJlxuICAgICAgICAgIHRoaXMuZGF0YXNoZWV0c1tpXS5zaGVldElkID09IHNoZWV0LnNoZWV0SWQgKSB7XG5cbiAgICAgICAgICB0aGlzLmRhdGFzaGVldHNbaV0gPSBzaGVldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmVzb3VyY2UgPSB0aGlzLnJlc291cmNlTG9va3VwW3NoZWV0LnJlc291cmNlSWRdO1xuICAgIGlmKCAhcmVzb3VyY2UgKSB7XG4gICAgICBjb25zb2xlLmxvZygnQXR0ZW1wdGluZyB0byBzZXQgc2hlZXQgd2l0aCBhIHJlc291cmNlSWQgdGhhdCBkb2VzIG5vdCBleGlzdCcpO1xuICAgICAgY29uc29sZS5sb2coc2hlZXQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgcmVzb3VyY2UuZGF0YXNoZWV0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCByZXNvdXJjZS5kYXRhc2hlZXRzW2ldLnNoZWV0SWQgPT0gc2hlZXQuc2hlZXRJZCApIHtcbiAgICAgICAgICByZXNvdXJjZS5kYXRhc2hlZXRzW2ldID0gc2hlZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jaGVja0NoYW5nZXMoKTtcbiAgfVxuXG4gIHRoaXMuZmlyZVVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGVlLmVtaXQoJ3VwZGF0ZScpO1xuICB9O1xuXG4gIHRoaXMucGFja2FnZS5vbignc2F2ZS1lbmQnLCBmdW5jdGlvbigpe1xuICAgIHRoaXMuY2hlY2tDaGFuZ2VzKCk7XG4gICAgdGhpcy5maXJlVXBkYXRlKCk7XG4gIH0uYmluZCh0aGlzKSk7XG5cbiAgdGhpcy5wYWNrYWdlLm9uKCd2YWx1ZS1zZXQtb24tY3JlYXRlJywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmZpcmVVcGRhdGUoKTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICAvLyBhZnRlciBhIHJlc291cmNlIGlzIGFkZGVkLCBvdXIgZW50aXJlIHN0YXRlIGlzIGRpZmZlcmVudFxuICB0aGlzLnJ1bkFmdGVyUmVzb3VyY2VBZGQgPSBmdW5jdGlvbih3b3Jrc3BhY2VEYXRhKSB7XG4gICAgdGhpcy5yZXN1bHQgPSB3b3Jrc3BhY2VEYXRhO1xuICAgIHRoaXMuX3NldERhdGEoKTtcbiAgICB0aGlzLmNoZWNrQ2hhbmdlcygpO1xuICB9O1xuXG5cbiAgLy8gZ2V0IGFsbCBhdHRpcmJ1dGVzIGZyb20gc2hlZXRzIG1hcmtlZCBhcyBkYXRhXG4gIHRoaXMuZ2V0RGF0YXNoZWV0QXR0cmlidXRlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhdHRycyA9IHt9LCBzaGVldCwgYXR0cjtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhc2hlZXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgc2hlZXQgPSB0aGlzLmRhdGFzaGVldHNbaV07XG4gICAgICBpZiggc2hlZXQubWV0YWRhdGEgKSBjb250aW51ZTtcblxuICAgICAgZm9yKCB2YXIgaiA9IDA7IGogPCBzaGVldC5hdHRyaWJ1dGVzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBhdHRyID0gc2hlZXQuYXR0cmlidXRlc1tqXTtcbiAgICAgICAgYXR0cnNbYXR0cl0gPSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBPYmplY3Qua2V5cyhhdHRycyk7XG4gIH07XG5cbiAgdGhpcy5pc0Vjb3Npc01ldGFkYXRhID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1xccy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICBmb3IoIHZhciBrZXkgaW4gdGhpcy5tZXRhZGF0YUxvb2t1cCApIHtcbiAgICAgIGlmKCB0aGlzLm1ldGFkYXRhTG9va3VwW2tleV0uZmxhdCA9PSBuYW1lICkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICB0aGlzLmdldFNjb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB2YXIgdG90YWwgPSA3O1xuXG4gICAgdmFyIGJyZWFrZG93biA9IHtcbiAgICAgIGJhc2ljIDoge1xuICAgICAgICBzY29yZSA6IDAsXG4gICAgICAgIHRvdGFsIDogNVxuICAgICAgfSxcbiAgICAgIGxpbmtlZCA6IHtcbiAgICAgICAgc2NvcmUgOiAwLFxuICAgICAgICB0b3RhbCA6IDFcbiAgICAgIH0sXG4gICAgICBsb2NhdGlvbiA6IHtcbiAgICAgICAgc2NvcmUgOiAwLFxuICAgICAgICB0b3RhbCA6IDFcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gY2hlY2sgZGF0YXNldCBsZXZlbCBlY29zaXMgbWV0YWRhdGFcbiAgICB2YXIgY2F0ID0gJyc7XG4gICAgZm9yKCB2YXIga2V5IGluIHRoaXMubWV0YWRhdGFMb29rdXAgKSB7XG4gICAgICBjYXQgPSB0aGlzLm1ldGFkYXRhTG9va3VwW2tleV0uY2F0ZWdvcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGtleSA9IGtleS5yZXBsYWNlKC8gL2csICcnKTtcblxuICAgICAgaWYoICFicmVha2Rvd25bY2F0XSApIHtcbiAgICAgICAgYnJlYWtkb3duW2NhdF0gPSB7XG4gICAgICAgICAgc2NvcmUgOiAwLFxuICAgICAgICAgIHRvdGFsIDogMFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpZigga2V5ID09PSAnTGF0aXR1ZGUnIHx8IGtleSA9PT0gJ0xvbmdpdHVkZScgKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0b2dnbGUgdG8gZW5hYmxlXG4gICAgICAvLyBpZigga2V5ID09PSAnTkFTQUdDTURLZXl3b3JkcycgKSBjb250aW51ZTtcblxuICAgICAgaWYoIHRoaXMucGFja2FnZVsnZ2V0JytrZXldICkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnBhY2thZ2VbJ2dldCcra2V5XSgpO1xuICAgICAgICBpZiggdmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgICAgaWYoIGtleSA9PT0gJ0tleXdvcmRzJyB8fCBrZXkgPT09ICdXZWJzaXRlJyApIHtcbiAgICAgICAgICAgIGJyZWFrZG93bi5iYXNpYy5zY29yZSsrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVha2Rvd25bY2F0XS5zY29yZSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0b3RhbCsrO1xuICAgICAgICBpZigga2V5ID09PSAnS2V5d29yZHMnIHx8IGtleSA9PT0gJ1dlYnNpdGUnICkge1xuICAgICAgICAgIGJyZWFrZG93bi5iYXNpYy50b3RhbCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrZG93bltjYXRdLnRvdGFsKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB3ZSBoYXZlIGVjb3NpcyBkb2ksIGFkZCB0byBDaXRhdGlvbiBzY29yZVxuICAgIGlmKCB0aGlzLnBhY2thZ2UuZ2V0RG9pKCkudmFsdWUgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmNpdGF0aW9uLnNjb3JlKys7XG4gICAgfVxuXG5cbiAgICBpZiggdGhpcy5wYWNrYWdlLmdldFRpdGxlKCkgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmJhc2ljLnNjb3JlKys7XG4gICAgfVxuICAgIGlmKCB0aGlzLnBhY2thZ2UuZ2V0RGVzY3JpcHRpb24oKSApIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICB9XG4gICAgaWYoIE9iamVjdC5rZXlzKHRoaXMucGFja2FnZS5nZXRMaW5rZWREYXRhKCkpLmxlbmd0aCA+IDAgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmxpbmtlZC5zY29yZSsrO1xuICAgIH1cbiAgICBpZiggdGhpcy5wYWNrYWdlLmdldE9yZ2FuaXphdGlvbigpICkge1xuICAgICAgY291bnQrKztcbiAgICAgIGJyZWFrZG93bi5iYXNpYy5zY29yZSsrO1xuICAgIH1cbiAgICBpZiggdGhpcy5wYWNrYWdlLmdldFZlcnNpb24oKSApIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICB9XG4gICAgaWYoIHRoaXMucGFja2FnZS5nZXRMaWNlbnNlSWQoKSApIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICBicmVha2Rvd24uYmFzaWMuc2NvcmUrKztcbiAgICB9XG4gICAgaWYoIE9iamVjdC5rZXlzKHRoaXMucGFja2FnZS5nZXRHZW9Kc29uKCkpLmxlbmd0aCA+IDAgKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgYnJlYWtkb3duLmxvY2F0aW9uLnNjb3JlKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNjb3JlOiBjb3VudCxcbiAgICAgIHRvdGFsIDogdG90YWwsXG4gICAgICBicmVha2Rvd24gOiBicmVha2Rvd25cbiAgICB9O1xuICB9O1xufTtcbiIsInZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlcjtcbnZhciBEYXRhc3RvcmUgPSByZXF1aXJlKCcuL2RhdGFzdG9yZScpO1xudmFyIENLQU4gPSByZXF1aXJlKCcuL2NrYW4nKTtcbnZhciBQYWNrYWdlID0gcmVxdWlyZSgnLi9wYWNrYWdlJyk7XG5cbmZ1bmN0aW9uIFNESyhjb25maWcpIHtcbiAgdGhpcy51c2VyID0gbnVsbDtcblxuICB0aGlzLmRlZmF1bHRHcm91cCA9IGNvbmZpZy5kZWZhdWx0R3JvdXA7XG5cbiAgdGhpcy5uZXdQYWNrYWdlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBuZXcgUGFja2FnZShkYXRhLCB0aGlzKTtcbiAgfTtcblxuICB0aGlzLmNrYW4gPSBuZXcgQ0tBTih7XG4gICAgaG9zdCA6IGNvbmZpZy5ob3N0LFxuICAgIGtleSA6IGNvbmZpZy5rZXlcbiAgfSk7XG5cbiAgdGhpcy5kcyA9IG5ldyBEYXRhc3RvcmUoe1xuICAgIGNrYW4gOiB0aGlzLmNrYW4sXG4gICAgcGFja2FnZV9pZCA6IGNvbmZpZy5wYWNrYWdlX2lkLFxuICAgIFNESyA6IHRoaXNcbiAgfSk7XG5cbiAgLy8gd2lyZSBldmVudHNcbiAgdmFyIGVlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICB0aGlzLm9uID0gZnVuY3Rpb24oZSwgZm4pIHtcbiAgICAgICBlZS5vbihlLCBmbik7XG4gIH07XG5cblxuICAvLyBnZXQgdGhlIHVzZXIgYWNjb3VudFxuICB0aGlzLmNrYW4uZ2V0QWN0aXZlVXNlcihmdW5jdGlvbihyZXNwKXtcbiAgICBpZiggcmVzcC5lcnJvciApIHtcbiAgICAgIHRoaXMudXNlckxvYWRFcnJvciA9IHRydWU7XG4gICAgfVxuXG5cbiAgICB0aGlzLnVzZXIgPSByZXNwO1xuICAgIGVlLmVtaXQoJ3VzZXItbG9hZCcpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHJlcXVpcmUoJy4vbG9naWMnKSh0aGlzKTtcblxuICBpZiggY29uZmlnLnBhY2thZ2VfaWQgKSB0aGlzLmRzLmxvYWQoKTtcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU0RLO1xuIiwidmFyIFNESztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZGspIHtcbiAgU0RLID0gc2RrO1xuICBTREsuY3JlYXRlUGFja2FnZSA9IGNyZWF0ZVBhY2thZ2U7XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVQYWNrYWdlKGRhdGEsIGNhbGxiYWNrKSB7XG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU0RLKSB7XG4gIHJlcXVpcmUoJy4vY3JlYXRlUGFja2FnZScpKFNESyk7XG4gIHJlcXVpcmUoJy4vdmVyaWZ5JykoU0RLKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFNESykge1xuICBTREsudmVyaWZ5ID0ge1xuICAgIG5hbWUgOiByZXF1aXJlKCcuL25hbWUnKShTREspXG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihTREspIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrKSB7XG5cbiAgICBTREsuY2thbi5nZXRQYWNrYWdlKG5hbWUsIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlKTtcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2soZmFsc2UpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG59O1xuIiwiLy8gYXR0cmlidXRlcyB0aGF0IGhhdmUgYSBkaXJlY3QgbWFwcGluZyB0byBDS0FOIHN0YW5kYXJkIGF0dHJpYnV0ZXMsXG4vLyBzbyB0aGV5IHNob3VsZCBub3QgYmUgd3JhcHBlZCB1cCBpbiB0aGUgJ2V4dHJhcycgZmllbGRzLiAgSUUsIHVzZVxuLy8gdGhlc2UgZnVuY3Rpb25zLlxudmFyIGNrYW5BdHRyaXV0ZXMgPSBbJ0tleXdvcmRzJywgJ1dlYnNpdGUnLCAnQXV0aG9yJywgJ0F1dGhvciBFbWFpbCcsXG4nTWFpbnRhaW5lciBFbWFpbCcsICdNYWludGFpbmVyJ107XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXR0cmlidXRlLCBQYWNrYWdlKSB7XG4gIGlmKCBhdHRyaWJ1dGUubmFtZSA9PT0gJ0tleXdvcmRzJyB8fCBhdHRyaWJ1dGUubmFtZSA9PT0gJ1dlYnNpdGUnICkgcmV0dXJuO1xuXG4gIGlmKCBhdHRyaWJ1dGUuaW5wdXQgPT09ICdjb250cm9sbGVkJyApIHtcbiAgICBjcmVhdGVDb250cm9sbGVkSW5wdXQoYXR0cmlidXRlLCBQYWNrYWdlKTtcbiAgfSBlbHNlIGlmKCBhdHRyaWJ1dGUuaW5wdXQgPT09ICdzcGxpdC10ZXh0JyApIHtcbiAgICBjcmVhdGVDb250cm9sbGVkSW5wdXQoYXR0cmlidXRlLCBQYWNrYWdlKTtcbiAgfSBlbHNlIGlmKCBhdHRyaWJ1dGUuaW5wdXQgPT09ICdjb250cm9sbGVkLXNpbmdsZScgKSB7XG4gICAgY3JlYXRlU2luZ2xlSW5wdXQoYXR0cmlidXRlLCBQYWNrYWdlKTtcbiAgfSBlbHNlIGlmKCBhdHRyaWJ1dGUuaW5wdXQgPT09ICd0ZXh0JyB8fCBhdHRyaWJ1dGUuaW5wdXQgPT09ICdsYXRsbmcnICkge1xuICAgIGNyZWF0ZUlucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUlucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSkge1xuICB2YXIgbmFtZSA9IGF0dHJpYnV0ZS5uYW1lLnJlcGxhY2UoLyAvZywgJycpO1xuXG4gIFBhY2thZ2UucHJvdG90eXBlWydnZXQnK25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RXh0cmEoYXR0cmlidXRlLm5hbWUpO1xuICB9O1xuXG4gIFBhY2thZ2UucHJvdG90eXBlWydzZXQnK25hbWVdID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lLCB2YWx1ZSsnJyk7XG4gICAgdGhpcy5fb25VcGRhdGUoYXR0cmlidXRlLm5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTaW5nbGVJbnB1dChhdHRyaWJ1dGUsIFBhY2thZ2UpIHtcbiAgdmFyIG5hbWUgPSBhdHRyaWJ1dGUubmFtZS5yZXBsYWNlKC8gL2csICcnKTtcblxuICBQYWNrYWdlLnByb3RvdHlwZVsnZ2V0JytuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKTtcbiAgfTtcblxuICBQYWNrYWdlLnByb3RvdHlwZVsnc2V0JytuYW1lXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHQgPSB0b2tlbml6ZSh2YWx1ZSk7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGF0dHJpYnV0ZS52b2NhYnVsYXJ5Lmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRva2VuaXplKGF0dHJpYnV0ZS52b2NhYnVsYXJ5W2ldKSA9PT0gdCApIHtcbiAgICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLnZvY2FidWxhcnlbaV0pO1xuICAgICAgICB0aGlzLl9vblVwZGF0ZShhdHRyaWJ1dGUubmFtZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgKSB7XG4gICAgICB0aGlzLnNldEV4dHJhKGF0dHJpYnV0ZS5uYW1lLCAnT3RoZXInKTtcbiAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUrJyBPdGhlcicsIHZhbHVlKTtcbiAgICAgIHRoaXMuX29uVXBkYXRlKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgJycpO1xuICAgIH1cbiAgfTtcblxuICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgKSB7XG4gICAgUGFja2FnZS5wcm90b3R5cGVbJ2dldCcrbmFtZSsnT3RoZXInXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RXh0cmEoYXR0cmlidXRlLm5hbWUrJyBPdGhlcicpO1xuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29udHJvbGxlZElucHV0KGF0dHJpYnV0ZSwgUGFja2FnZSkge1xuICB2YXIgbmFtZSA9IGF0dHJpYnV0ZS5uYW1lLnJlcGxhY2UoLyAvZywgJycpO1xuXG4gIFBhY2thZ2UucHJvdG90eXBlWydnZXQnK25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF0dHIgPSB0aGlzLmdldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICBpZiggIWF0dHIgKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGF0dHIuc3BsaXQoJywnKS5tYXAoY2xlYW5UZXJtKTtcbiAgfTtcblxuICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgKSB7XG4gICAgUGFja2FnZS5wcm90b3R5cGVbJ2dldCcrbmFtZSsnT3RoZXInXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGF0dHIgPSB0aGlzLmdldEV4dHJhKGF0dHJpYnV0ZS5uYW1lKycgT3RoZXInKTtcbiAgICAgIGlmKCAhYXR0ciApIHJldHVybiBbXTtcbiAgICAgIHJldHVybiBhdHRyLnNwbGl0KCcsJykubWFwKGNsZWFuVGVybSk7XG4gICAgfTtcbiAgfVxuXG4gIFBhY2thZ2UucHJvdG90eXBlWydzZXQnK25hbWVdID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiggIXZhbHVlICkge1xuICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSwgbnVsbCk7XG4gICAgICBpZiggYXR0cmlidXRlLmFsbG93T3RoZXIgKSB7XG4gICAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUrJyBPdGhlcicsIG51bGwpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9vblVwZGF0ZShhdHRyaWJ1dGUubmFtZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRlcm1zO1xuICAgIGlmKCAhQXJyYXkuaXNBcnJheSh2YWx1ZSkgKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlKycnO1xuICAgICAgdGVybXMgPSB2YWx1ZS5zcGxpdCgnLCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZXJtcyA9IHZhbHVlO1xuICAgIH1cblxuICAgIHRlcm1zID0gdGVybXMubWFwKGNsZWFuVGVybSk7XG5cbiAgICBpZiggYXR0cmlidXRlLmlucHV0ID09PSAnY29udHJvbGxlZCcgKSB7XG4gICAgICB2YXIgdmFsdWVzID0gZ2V0VmFsdWVzKHRlcm1zLCBhdHRyaWJ1dGUudm9jYWJ1bGFyeSk7XG5cbiAgICAgIGlmKCBhdHRyaWJ1dGUuYWxsb3dPdGhlciAmJiB2YWx1ZXMub3RoZXIubGVuZ3RoID4gMCAmJiB2YWx1ZXMudmFsaWQuaW5kZXhPZignT3RoZXInKSA9PSAtMSApIHtcbiAgICAgICAgdmFsdWVzLnZhbGlkLnB1c2goJ090aGVyJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsIHZhbHVlcy52YWxpZC5qb2luKCcsICcpKTtcbiAgICAgIGlmKCBhdHRyaWJ1dGUuYWxsb3dPdGhlciApIHtcbiAgICAgICAgdGhpcy5zZXRFeHRyYShhdHRyaWJ1dGUubmFtZSsnIE90aGVyJywgdmFsdWVzLm90aGVyLmpvaW4oJywgJykpO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIGlmKCBhdHRyaWJ1dGUuaW5wdXQgPT09ICdzcGxpdC10ZXh0JyApIHtcbiAgICAgIHRoaXMuc2V0RXh0cmEoYXR0cmlidXRlLm5hbWUsIHRlcm1zLmpvaW4oJywgJykpO1xuICAgIH1cblxuICAgIHRoaXMuX29uVXBkYXRlKGF0dHJpYnV0ZS5uYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xlYW5UZXJtKHR4dCkge1xuICByZXR1cm4gdHh0LnRyaW0oKTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVzKHRlcm1zLCB2b2NhYnVsYXJ5KSB7XG4gIHZhciB2YWxpZCA9IFtdO1xuICB2YXIgb3RoZXIgPSBbXTtcblxuICB2YXIgbWFwID0ge307XG4gIHZvY2FidWxhcnkuZm9yRWFjaChmdW5jdGlvbihuYW1lKXtcbiAgICBtYXBbdG9rZW5pemUobmFtZSldID0gbmFtZTtcbiAgfSk7XG5cbiAgdmFyIHQ7XG4gIGZvciggdmFyIGkgPSAwOyBpIDwgdGVybXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdCA9IHRva2VuaXplKHRlcm1zW2ldKTtcblxuICAgIGlmKCBtYXBbdF0gKSB7XG4gICAgICBpZiggdmFsaWQuaW5kZXhPZihtYXBbdF0pID09PSAtMSApIHtcbiAgICAgICAgdmFsaWQucHVzaChtYXBbdF0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggb3RoZXIuaW5kZXhPZihtYXBbdF0pID09PSAtMSApIHtcbiAgICAgICAgb3RoZXIucHVzaCh0ZXJtc1tpXS50cmltKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdmFsaWQgOiB2YWxpZCxcbiAgICBvdGhlciA6IG90aGVyXG4gIH07XG59XG5cbmZ1bmN0aW9uIHRva2VuaXplKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMvZywgJycpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQYWNrYWdlKXtcbiAgUGFja2FnZS5wcm90b3R5cGUuY3JlYXRlID0gY3JlYXRlO1xuICBQYWNrYWdlLnByb3RvdHlwZS5kZWxldGUgPSBkZWxldGVGbjtcbiAgUGFja2FnZS5wcm90b3R5cGUuc2F2ZSA9IHNhdmU7XG59O1xuXG5cbmZ1bmN0aW9uIGRlbGV0ZUZuKGNhbGxiYWNrKSB7XG4gIHRoaXMuU0RLLmNrYW4uZGVsZXRlUGFja2FnZSh0aGlzLmRhdGEuaWQsIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICBpZiggcmVzcC5lcnJvciApIHtcbiAgICAgIC8vIEVSUk9SIDVcbiAgICAgIHJlc3AuY29kZSA9IDU7XG4gICAgICByZXR1cm4gY2FsbGJhY2socmVzcCk7XG4gICAgfVxuXG4gICAgY2FsbGJhY2soe3N1Y2Nlc3M6IHRydWV9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZShjYWxsYmFjaykge1xuICB0aGlzLlNESy5ja2FuLmNyZWF0ZVBhY2thZ2UodGhpcy5kYXRhLCBmdW5jdGlvbihyZXNwKSB7XG4gICAgICBpZiggcmVzcC5lcnJvciApIHtcbiAgICAgICAgLy8gRVJST1IgNlxuICAgICAgICByZXNwLmNvZGUgPSA2O1xuICAgICAgICByZXR1cm4gY2FsbGJhY2socmVzcCk7XG4gICAgICB9XG5cbiAgICAgIGlmKCAhcmVzcC5pZCApIHtcbiAgICAgICAgLy8gRVJST1IgN1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soe1xuICAgICAgICAgIGVycm9yIDogdHJ1ZSxcbiAgICAgICAgICBtZXNzYWdlIDogJ0ZhaWxlZCB0byBjcmVhdGUgZGF0YXNldCcsXG4gICAgICAgICAgY29kZSA6IDdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKHJlc3ApO1xuICAgIH0uYmluZCh0aGlzKVxuICApO1xufVxuXG52YXIgc2F2ZVRpbWVyID0gLTE7XG5mdW5jdGlvbiBzYXZlKGNhbGxiYWNrKSB7XG4gIHRoaXMuZWUuZW1pdCgnc2F2ZS1zdGFydCcpO1xuXG4gIGlmKCBzYXZlVGltZXIgIT09IC0xICkge1xuICAgIGNsZWFyVGltZW91dChzYXZlVGltZXIpO1xuICB9XG5cbiAgc2F2ZVRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgIHNhdmVUaW1lciA9IC0xO1xuICAgIF9zYXZlKHRoaXMsIGNhbGxiYWNrKTtcbiAgfS5iaW5kKHRoaXMpLCA1MDApO1xufVxuXG5mdW5jdGlvbiBfc2F2ZShyZWYsIGNhbGxiYWNrKSB7XG4gIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIHRoZSBjb3JyZWN0IHBhY2thZ2Ugc3RhdGVcbiAgLy8gYWxsIHJlc291cmNlcyBuZWVkIHRvIGJlIGluY2x1ZGVkIHdoZW4geW91IG1ha2UgYSB1cGRhdGVQYWNrYWdlIGNhbGxcbiAgcmVmLlNESy5ja2FuLmdldFBhY2thZ2UocmVmLmRhdGEuaWQsIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgIGlmKCByZXNwLmVycm9yICkge1xuICAgICAgICByZXNwLmNvZGUgPSA4O1xuICAgICAgICByZXNwLm1lc3NhZ2UgKz0gJy4gRmFpbGVkIHRvIGZldGNoIHBhY2thZ2UgZm9yIHVwZGF0ZS4nO1xuICAgICAgICByZWYuZWUuZW1pdCgnc2F2ZS1lbmQnLCByZXNwKTtcbiAgICAgICAgaWYoIGNhbGxiYWNrICkgY2FsbGJhY2socmVzcCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIG1ldGFkYXRhID0gcmVzcDtcbiAgICAgIGZvciggdmFyIGtleSBpbiByZWYuZGF0YSApIHtcbiAgICAgICAgbWV0YWRhdGFba2V5XSA9IHJlZi5kYXRhW2tleV07XG4gICAgICB9XG5cbiAgICAgIHJlZi5TREsuY2thbi51cGRhdGVQYWNrYWdlKG1ldGFkYXRhLFxuICAgICAgICBmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgICAgICAvLyBFUlJPUiA5XG4gICAgICAgICAgICByZXNwLmNvZGUgPSA5O1xuICAgICAgICAgICAgcmVzcC5tZXNzYWdlICs9ICcuIEZhaWxlZCB0byB1cGRhdGUgZGF0YXNldC4nO1xuICAgICAgICAgICAgcmVmLmVlLmVtaXQoJ3NhdmUtZW5kJywgcmVzcCk7XG4gICAgICAgICAgICBpZiggY2FsbGJhY2sgKSBjYWxsYmFjayhyZXNwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiggIXJlc3AuaWQgKSAge1xuICAgICAgICAgICAgdmFyIG1zZyA9IHtcbiAgICAgICAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgICAgICAgIG1lc3NhZ2UgOiAnRmFpbGVkIHRvIHVwZGF0ZSBkYXRhc2V0JyxcbiAgICAgICAgICAgICAgY29kZSA6IDEwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVmLmVlLmVtaXQoJ3NhdmUtZW5kJywgbXNnKTtcbiAgICAgICAgICAgIC8vIEVSUk9SIDEwXG4gICAgICAgICAgICBpZiggY2FsbGJhY2sgKSBjYWxsYmFjayhtc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlZi5kYXRhID0gcmVzcDtcblxuICAgICAgICAgIGlmKCBjYWxsYmFjayApIGNhbGxiYWNrKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgICAgcmVmLmVlLmVtaXQoJ3NhdmUtZW5kJywge3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gICk7XG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgnZXh0ZW5kJyk7XG52YXIgc2NoZW1hID0gcmVxdWlyZSgnLi4vc2NoZW1hJyk7XG52YXIgY3JlYXRlU2NoZW1hTWV0aG9kcyA9IHJlcXVpcmUoJy4vY3JlYXRlU2NoZW1hTWV0aG9kcycpO1xudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZScpO1xudmFyIGNydWQgPSByZXF1aXJlKCcuL2NydWQnKTtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlcjtcblxuXG52YXIgaWdub3JlID0gWydTcGVjaWVzJywgJ0RhdGUnXTtcblxuZnVuY3Rpb24gUGFja2FnZShpbml0ZGF0YSwgU0RLKSB7XG5cbiAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiggZGF0YSApIHtcbiAgICAgIHRoaXMuZGF0YSA9IGV4dGVuZCh0cnVlLCB7fSwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGF0YSA9IHtcbiAgICAgICAgaWQgOiAnJyxcbiAgICAgICAgdGl0bGUgOiAnJyxcbiAgICAgICAgbmFtZSA6ICcnLFxuICAgICAgICBub3RlcyA6ICcnLFxuICAgICAgICBhdXRob3IgOiAnJyxcbiAgICAgICAgYXV0aG9yX2VtYWlsIDogJycsXG4gICAgICAgIGxpY2Vuc2VfaWQgOiAnJyxcbiAgICAgICAgbGljZW5zZV90aXRsZSA6ICcnLFxuICAgICAgICBtYWludGFpbmVyIDogJycsXG4gICAgICAgIG1haW50YWluZXJfZW1haWwgOiAnJyxcbiAgICAgICAgdmVyc2lvbiA6ICcnLFxuICAgICAgICBvd25lcl9vcmcgOiAnJyxcbiAgICAgICAgdGFncyA6IFtdLFxuICAgICAgICBwcml2YXRlIDogZmFsc2UsXG4gICAgICAgIGV4dHJhcyA6IFtdXG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICB0aGlzLnJlc2V0KGluaXRkYXRhKTtcblxuICB0aGlzLmVlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGlmKCAhU0RLICkge1xuICAgIHRocm93KG5ldyBFcnJvcignTm8gU0RLIHByb3ZpZGVkJykpO1xuICB9XG4gIHRoaXMuU0RLID0gU0RLO1xuXG4gIHRoaXMub24gPSBmdW5jdGlvbihldmVudCwgZm4pIHtcbiAgICB0aGlzLmVlLm9uKGV2ZW50LCBmbik7XG4gIH07XG5cbiAgdGhpcy5fb25VcGRhdGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdGhpcy5lZS5lbWl0KCd1cGRhdGUnLCB7YXR0cmlidXRlOiBuYW1lfSk7XG5cbiAgICBpZiggdGhpcy5tb2RlICE9PSAnY3JlYXRlJyApIHtcbiAgICAgIHRoaXMuc2F2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVlLmVtaXQoJ3ZhbHVlLXNldC1vbi1jcmVhdGUnLCB7fSk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuZ2V0SWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmlkIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0VGl0bGUgPSBmdW5jdGlvbih0aXRsZSwgY2FsbGJhY2spIHtcbiAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoL18vZywgJyAnKS50cmltKCk7XG5cbiAgICBpZiggdGl0bGUubGVuZ3RoID49IDEwMCApIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayh7ZXJyb3I6IHRydWUsIG1lc3NhZ2U6ICdJbnZhbGlkIG5hbWUuICBUaXRsZSBjYW4gaGF2ZSBhdCBtb3N0IDEwMCBjaGFyYWN0ZXJzLid9KTtcbiAgICB9XG5cbiAgICBpZiggdGl0bGUubGVuZ3RoIDw9IDUgKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soe2Vycm9yOiB0cnVlLCBtZXNzYWdlOiAnSW52YWxpZCBuYW1lLiAgVGl0bGUgbXVzdCBoYXZlIGF0IGxlYXN0IDUgY2hhcmFjdGVycy4nfSk7XG4gICAgfVxuXG4gICAgdmFyIG5hbWUgPSB0aXRsZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teYS16MC05XS9nLCctJyk7XG5cbiAgICBpZiggdGhpcy5kYXRhLm5hbWUgPT09IG5hbWUgKSB7XG4gICAgICB0aGlzLmRhdGEudGl0bGUgPSB0aXRsZTtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCB7dGl0bGU6IHRpdGxlLCBuYW1lOiBuYW1lfSk7XG4gICAgfVxuXG4gICAgU0RLLnZlcmlmeS5uYW1lKG5hbWUsIGZ1bmN0aW9uKHZhbGlkKSB7XG4gICAgICBpZiggIXZhbGlkICkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soe2Vycm9yOiB0cnVlLCBtZXNzYWdlOiAnSW52YWxpZCBuYW1lLiAgQSBkYXRhc2V0IHdpdGggdGhlIG5hbWUgXCInK25hbWUrJ1wiIGFscmVhZHkgZXhpc3RzJ30pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRhdGEudGl0bGUgPSB0aXRsZTtcbiAgICAgIHRoaXMuZGF0YS5uYW1lID0gbmFtZTtcbiAgICAgIHRoaXMuX29uVXBkYXRlKCdUaXRsZScpO1xuXG4gICAgICBjYWxsYmFjayhudWxsLCB7dGl0bGU6IHRpdGxlLCBuYW1lOiBuYW1lfSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICB0aGlzLmdldE5hbWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLm5hbWUgfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5nZXRUaXRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEudGl0bGUgfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5zZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgdGhpcy5kYXRhLm5vdGVzID0gZGVzY3JpcHRpb247XG4gICAgdGhpcy5fb25VcGRhdGUoJ0Rlc2NyaXB0aW9uJyk7XG4gIH07XG5cbiAgdGhpcy5nZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEubm90ZXMgfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5nZXRLZXl3b3JkcyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS50YWdzIHx8IFtdO1xuICB9O1xuXG4gIHRoaXMuc2V0S2V5d29yZHMgPSBmdW5jdGlvbihrZXl3b3Jkcykge1xuICAgIGlmKCB0eXBlb2Yga2V5d29yZHMgPT09ICdzdHJpbmcnICkge1xuICAgICAga2V5d29yZHMgPSBrZXl3b3Jkcy5zcGxpdCgnLCcpO1xuICAgIH1cblxuICAgIGlmKCAhQXJyYXkuaXNBcnJheShrZXl3b3JkcykgKSB7XG4gICAgICB0aHJvdyhuZXcgRXJyb3IoJ0tleXdvcmRzIG11c3QgYnkgb2YgdHlwZSBzdHJpbmcgb3IgYXJyYXknKSk7XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhLnRhZ3MgPSBbXTtcbiAgICBrZXl3b3Jkcy5mb3JFYWNoKHRoaXMuYWRkS2V5d29yZC5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICB0aGlzLmFkZEtleXdvcmQgPSBmdW5jdGlvbihrZXl3b3JkKSB7XG4gICAgaWYoIHR5cGVvZiBrZXl3b3JkID09PSAnb2JqZWN0JyApIHtcbiAgICAgIGtleXdvcmQgPSBrZXl3b3JkLm5hbWU7XG5cbiAgICB9XG5cbiAgICBrZXl3b3JkID0gY2xlYW5LZXl3b3JkKGtleXdvcmQrJycpO1xuXG4gICAgaWYoIGtleXdvcmQubGVuZ3RoIDwgMiApIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYoIHRoaXMuaGFzS2V5d29yZChrZXl3b3JkKSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiggIXRoaXMuZGF0YS50YWdzICkge1xuICAgICAgdGhpcy5kYXRhLnRhZ3MgPSBbXTtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGEudGFncy5wdXNoKHtcbiAgICAgIGRpc3BsYXlfbmFtZSA6IGtleXdvcmQsXG4gICAgICBuYW1lIDoga2V5d29yZFxuICAgIH0pO1xuXG4gICAgdGhpcy5fb25VcGRhdGUoJ0tleXdvcmRzJyk7XG4gIH07XG5cbiAgdGhpcy5yZW1vdmVLZXl3b3JkID0gZnVuY3Rpb24oa2V5d29yZCkge1xuICAgIGlmKCAhdGhpcy5kYXRhLnRhZ3MgKSByZXR1cm47XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS50YWdzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YS50YWdzW2ldLm5hbWUgPT09IGtleXdvcmQgKSB7XG4gICAgICAgIHRoaXMuZGF0YS50YWdzLnNwbGljZShpLCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fb25VcGRhdGUoJ0tleXdvcmRzJyk7XG4gIH07XG5cbiAgdGhpcy5oYXNLZXl3b3JkID0gZnVuY3Rpb24oa2V5d29yZCkge1xuICAgIGlmKCAhdGhpcy5kYXRhLnRhZ3MgKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEudGFncy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmRhdGEudGFnc1tpXS5uYW1lID09PSBrZXl3b3JkICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gY2xlYW5LZXl3b3JkKHR4dCkge1xuICAgIHJldHVybiB0eHQucmVwbGFjZSgvW15BLVphLXowLTktXyBdL2csICcnKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgfVxuXG4gIHRoaXMuc2V0TGljZW5zZSA9IGZ1bmN0aW9uKGlkLCB0aXRsZSkge1xuICAgIHRoaXMuZGF0YS5saWNlbnNlX2lkID0gaWQ7XG4gICAgdGhpcy5kYXRhLmxpY2Vuc2VfdGl0bGUgPSB0aXRsZTtcbiAgICB0aGlzLl9vblVwZGF0ZSgnTGljZW5zZScpO1xuICB9O1xuXG4gIHRoaXMuZ2V0TGljZW5zZUlkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5saWNlbnNlX2lkIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuZ2V0TGljZW5zZVRpdGxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5saWNlbnNlX3RpdGxlIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0T3JnYW5pemF0aW9uID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKSB7XG4gICAgaWYoICFpZCApIHtcbiAgICAgIHRoaXMuZGF0YS5vd25lcl9vcmcgPSAnJztcbiAgICAgIGlmKCBjYWxsYmFjayApIHtcbiAgICAgICAgY2FsbGJhY2soe3N1Y2Nlc3M6IHRydWV9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBTREsuY2thbi5nZXRPcmdhbml6YXRpb24oaWQsIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgIGlmKCBjYWxsYmFjayApIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZGF0YS5vd25lcl9vcmcgPSByZXNwLmlkO1xuICAgICAgdGhpcy5fb25VcGRhdGUoJ09yZ2FuaXphdGlvbicpO1xuXG4gICAgICBpZiggY2FsbGJhY2sgKSB7XG4gICAgICAgIGNhbGxiYWNrKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICB0aGlzLmdldE9yZ2FuaXphdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEub3duZXJfb3JnIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0VmVyc2lvbiA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgICB0aGlzLmRhdGEudmVyc2lvbiA9IHZlcnNpb247XG4gICAgdGhpcy5fb25VcGRhdGUoJ1ZlcnNpb24nKTtcbiAgfTtcblxuICB0aGlzLmdldFZlcnNpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnZlcnNpb24gfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5zZXRXZWJzaXRlID0gZnVuY3Rpb24od2Vic2l0ZSkge1xuICAgIHRoaXMuc2V0RXh0cmEoJ1dlYnNpdGUnLCB3ZWJzaXRlKTtcbiAgICB0aGlzLl9vblVwZGF0ZSgnV2Vic2l0ZScpO1xuICB9O1xuXG4gIHRoaXMuZ2V0V2Vic2l0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEV4dHJhKCdXZWJzaXRlJyk7XG4gIH07XG5cbiAgdGhpcy5zZXRBdXRob3IgPSBmdW5jdGlvbihhdXRob3IpIHtcbiAgICB0aGlzLmRhdGEuYXV0aG9yID0gYXV0aG9yO1xuICAgIHRoaXMuX29uVXBkYXRlKCdBdXRob3InKTtcbiAgfTtcblxuICB0aGlzLmdldEF1dGhvciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEuYXV0aG9yIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0QXV0aG9yRW1haWwgPSBmdW5jdGlvbihhdXRob3JfZW1haWwpIHtcbiAgICB0aGlzLmRhdGEuYXV0aG9yX2VtYWlsID0gYXV0aG9yX2VtYWlsO1xuICAgIHRoaXMuX29uVXBkYXRlKCdBdXRob3JFbWFpbCcpO1xuICB9O1xuXG4gIHRoaXMuZ2V0QXV0aG9yRW1haWwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmF1dGhvcl9lbWFpbCB8fCAnJztcbiAgfTtcblxuICB0aGlzLnNldE1haW50YWluZXIgPSBmdW5jdGlvbihtYWludGFpbmVyKSB7XG4gICAgdGhpcy5kYXRhLm1haW50YWluZXIgPSBtYWludGFpbmVyO1xuICAgIHRoaXMuX29uVXBkYXRlKCdNYWludGFpbmVyJyk7XG4gIH07XG5cbiAgdGhpcy5nZXRNYWludGFpbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5tYWludGFpbmVyIHx8ICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0TWFpbnRhaW5lckVtYWlsID0gZnVuY3Rpb24obWFpbnRhaW5lcl9lbWFpbCkge1xuICAgIHRoaXMuZGF0YS5tYWludGFpbmVyX2VtYWlsID0gbWFpbnRhaW5lcl9lbWFpbDtcbiAgICB0aGlzLl9vblVwZGF0ZSgnTWFpbnRhaW5lckVtYWlsJyk7XG4gIH07XG5cbiAgdGhpcy5nZXRNYWludGFpbmVyRW1haWwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLm1haW50YWluZXJfZW1haWwgfHwgJyc7XG4gIH07XG5cbiAgdGhpcy5zZXRQcml2YXRlID0gZnVuY3Rpb24ocHJpdmF0ZSkge1xuICAgIGlmKCB0aGlzLmRhdGEucHJpdmF0ZSA9PT0gcHJpdmF0ZSApIHJldHVybjtcbiAgICB0aGlzLmRhdGEucHJpdmF0ZSA9IHByaXZhdGU7XG4gICAgdGhpcy5fb25VcGRhdGUoJ1ByaXZhdGUnKTtcbiAgfTtcblxuICB0aGlzLmlzUHJpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEucHJpdmF0ZSA/IHRydWUgOiBmYWxzZTtcbiAgfTtcblxuICB0aGlzLnNldExpbmtlZERhdGEgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIG5ld0RhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB2YXIgb2xkRGF0YSA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0TGlua2VkRGF0YSgpKTtcblxuICAgIGlmKCBuZXdEYXRhID09PSBvbGREYXRhICkgcmV0dXJuO1xuXG4gICAgdGhpcy5zZXRFeHRyYSgnTGlua2VkRGF0YScsIG5ld0RhdGEpO1xuXG4gICAgdGhpcy5lZS5lbWl0KCd1cGRhdGUnLCB7YXR0cmlidXRlOiBuYW1lfSk7XG5cbiAgICBpZiggdGhpcy5tb2RlICE9PSAnY3JlYXRlJyApIHtcbiAgICAgIHRoaXMuU0RLLmNrYW4udXBkYXRlTGlua2VkUmVzb3VyY2VzKHRoaXMuZGF0YS5pZCwgZGF0YSwgZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVlLmVtaXQoJ3ZhbHVlLXNldC1vbi1jcmVhdGUnLCB7fSk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuZ2V0TGlua2VkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0RXh0cmEoJ0xpbmtlZERhdGEnKTtcbiAgICBpZiggIXZhbHVlICkgcmV0dXJuIFtdO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4gW107XG4gIH07XG5cbiAgdGhpcy5yZXF1ZXN0RG9pID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvaSA9IHRoaXMuZ2V0RG9pKCk7XG5cbiAgICBpZiggZG9pLnN0YXR1cy52YWx1ZSAhPT0gJ1BlbmRpbmcgUmV2aXNpb24nICYmIGRvaS5zdGF0dXMudmFsdWUgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRFeHRyYSgnRWNvU0lTIERPSSBTdGF0dXMnLCBKU09OLnN0cmluZ2lmeSh7dmFsdWU6J1BlbmRpbmcgQXBwcm92YWwnfSkpO1xuICAgIHRoaXMuX29uVXBkYXRlKCdFY29TSVMgRE9JIFN0YXR1cycpO1xuICAgIFxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICBcbiAgdGhpcy5jYW5jZWxEb2lSZXF1ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvaSA9IHRoaXMuZ2V0RG9pKCk7XG5cbiAgICBpZiggZG9pLnN0YXR1cy52YWx1ZSAhPT0gJ1BlbmRpbmcgUmV2aXNpb24nICYmIGRvaS5zdGF0dXMudmFsdWUgIT09ICdQZW5kaW5nIEFwcHJvdmFsJyApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnNldEV4dHJhKCdFY29TSVMgRE9JIFN0YXR1cycsIEpTT04uc3RyaW5naWZ5KHt9KSk7XG4gICAgdGhpcy5fb25VcGRhdGUoJ0Vjb1NJUyBET0kgU3RhdHVzJyk7XG4gICAgXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgdGhpcy5nZXREb2kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhdHVzID0gdGhpcy5nZXRFeHRyYSgnRWNvU0lTIERPSSBTdGF0dXMnKTtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLmdldEV4dHJhKCdFY29TSVMgRE9JJyk7XG4gICAgXG4gICAgaWYoIHN0YXR1cyAmJiBzdGF0dXMubGVuZ3RoID4gMCApIHtcbiAgICAgIHN0YXR1cyA9IEpTT04ucGFyc2Uoc3RhdHVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdHVzID0ge307XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1cyA6IHN0YXR1cyxcbiAgICAgIHZhbHVlIDogdmFsdWVcbiAgICB9O1xuICB9O1xuXG4gIHRoaXMuc2V0U29ydCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLnNldEV4dHJhKCdzb3J0JywgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIHRoaXMuX29uVXBkYXRlKCdzb3J0Jyk7XG4gIH07XG5cbiAgdGhpcy5nZXRTb3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5nZXRFeHRyYSgnc29ydCcpO1xuICAgIGlmKCAhdmFsdWUgKSByZXR1cm4gW107XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xuICAgIH0gY2F0Y2goZSkge31cblxuICAgIHJldHVybiB7fTtcbiAgfTtcblxuICB0aGlzLnNldEFsaWFzZXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zZXRFeHRyYSgnYWxpYXNlcycsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB0aGlzLl9vblVwZGF0ZSgnYWxpYXNlcycpO1xuICB9O1xuXG4gIHRoaXMuZ2V0QWxpYXNlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0RXh0cmEoJ2FsaWFzZXMnKTtcbiAgICBpZiggIXZhbHVlICkgcmV0dXJuIHt9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciB0ID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAvLyBoYWNrXG4gICAgICBpZiggQXJyYXkuaXNBcnJheSh0KSApIHJldHVybiB7fTtcbiAgICAgIHJldHVybiB0O1xuICAgIH0gY2F0Y2goZSkge31cblxuICAgIHJldHVybiB7fTtcbiAgfTtcblxuICB0aGlzLnNldEdlb0pzb24gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYoICFkYXRhICkge1xuICAgICAgdGhpcy5zZXRFeHRyYSgnZ2VvanNvbicsICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRFeHRyYSgnZ2VvanNvbicsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vblVwZGF0ZSgnZ2VvanNvbicpO1xuICB9O1xuXG4gIHRoaXMuZ2V0R2VvSnNvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0RXh0cmEoJ2dlb2pzb24nKTtcbiAgICBpZiggIXZhbHVlICkgcmV0dXJuIHt9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4ge307XG4gIH07XG5cbiAgdGhpcy5hZGRSZXNvdXJjZSA9IGZ1bmN0aW9uKGZpbGUsIGNhbGxiYWNrLCBwcm9ncmVzcykge1xuICAgIGZ1bmN0aW9uIG5leHQocmVzcCkge1xuICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcik7XG4gICAgICB9XG5cbiAgICAgIFNESy5ja2FuLnByb2Nlc3NSZXNvdXJjZShcbiAgICAgICAgdGhpcy5kYXRhLmlkLFxuICAgICAgICBbcmVzcC5pZF0sXG4gICAgICAgIG51bGwsXG4gICAgICAgIHtsYXlvdXQ6ICdjb2x1bW4nfSxcbiAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgaWYoIHJlc3AuZXJyb3IgKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2socmVzcCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gZ2V0IG5ldyB3b3Jrc3BhY2Ugc3RhdGVcbiAgICAgICAgICAvLyBUT0RPOiBwcm9seSBhIGJldHRlciB3YXkgVE9ETyB0aGlzLlxuICAgICAgICAgIFNESy5ja2FuLmdldFdvcmtzcGFjZSh0aGlzLmRhdGEuaWQsIGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgICAgICBpZiggcmVzdWx0LmVycm9yICkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2socmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFNESy5kcy5ydW5BZnRlclJlc291cmNlQWRkKHJlc3VsdCk7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKHtzdWNjZXNzOiB0cnVlfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBTREsuY2thbi5hZGRSZXNvdXJjZSh0aGlzLmRhdGEuaWQsIGZpbGUsIG5leHQuYmluZCh0aGlzKSwgcHJvZ3Jlc3MpO1xuICB9O1xuXG4gIHRoaXMuZ2V0RXh0cmEgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiggIXRoaXMuZGF0YS5leHRyYXMgKSByZXR1cm4gJyc7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5leHRyYXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5kYXRhLmV4dHJhc1tpXS5rZXkgPT09IGtleSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5leHRyYXNbaV0udmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gIHRoaXMuc2V0RXh0cmEgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgaWYoICF0aGlzLmRhdGEuZXh0cmFzICkgdGhpcy5kYXRhLmV4dHJhcyA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEuZXh0cmFzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuZGF0YS5leHRyYXNbaV0ua2V5ID09IGtleSApIHtcbiAgICAgICAgaWYoIHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIHRoaXMuZGF0YS5leHRyYXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZGF0YS5leHRyYXNbaV0udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YS5leHRyYXMucHVzaCh7XG4gICAgICBrZXkgOiBrZXksXG4gICAgICB2YWx1ZSA6IHZhbHVlXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gU2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgdGVzdCBkYXRhISFcbiAgdGhpcy5fc2V0VGVzdGluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0RXh0cmEoJ190ZXN0aW5nXycsIHRydWUpO1xuICB9O1xuXG59XG5cbi8vIGV4dGVuZCBwYWNrYWdlIGdldHRlcnMvc2V0dGVycyBiYXNlZCBvbiBzY2hlbWFcbmZvciggdmFyIGtleSBpbiBzY2hlbWEgKSB7XG4gIGlmKCBpZ25vcmUuaW5kZXhPZihrZXkpID4gLTEgKSB7XG4gICAgY29udGludWU7XG4gIH1cblxuICBmb3IoIHZhciBpID0gMDsgaSA8IHNjaGVtYVtrZXldLmxlbmd0aDsgaSsrICl7XG4gICAgY3JlYXRlU2NoZW1hTWV0aG9kcyhzY2hlbWFba2V5XVtpXSwgUGFja2FnZSk7XG4gIH1cbn1cblxudGVtcGxhdGUoUGFja2FnZSk7XG5jcnVkKFBhY2thZ2UpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFja2FnZTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihQYWNrYWdlKSB7XG4gIFBhY2thZ2UucHJvdG90eXBlLmxvYWRGcm9tVGVtcGxhdGUgPSBsb2FkRnJvbVRlbXBsYXRlO1xufTtcblxuLy8gbG9hZCBmcm9tIHNlcnZlciBwcm92aWRlZCB0ZW1wbGF0ZVxuZnVuY3Rpb24gbG9hZEZyb21UZW1wbGF0ZShja2FuUGFja2FnZSwgdXNlciwga2VlcERvaSkgIHtcbiAgZm9yKCB2YXIga2V5IGluIHRoaXMuZGF0YSApIHtcbiAgICBpZigga2V5ID09PSAnb3duZXJfb3JnJyB8fCBrZXkgPT09ICdpZCcgKSBjb250aW51ZTtcbiAgICBpZiggY2thblBhY2thZ2Vba2V5XSApIHRoaXMuZGF0YVtrZXldID0gY2thblBhY2thZ2Vba2V5XTtcbiAgfVxuXG4gIGlmKCB1c2VyICYmIHVzZXIub3JnYW5pemF0aW9ucyAmJiBja2FuUGFja2FnZS5vd25lcl9vcmcgKSB7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB1c2VyLm9yZ2FuaXphdGlvbnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdXNlci5vcmdhbml6YXRpb25zW2ldLmlkID09PSBja2FuUGFja2FnZS5vd25lcl9vcmcgKSB7XG4gICAgICAgIGRhdGEub3duZXJfb3JnID0gY2thblBhY2thZ2Uub3duZXJfb3JnO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiggY2thblBhY2thZ2UuZXh0cmFzICkge1xuICAgIGlmKCAha2VlcERvaSApIHtcbiAgICAgIGlmKCBja2FuUGFja2FnZS5leHRyYXNbJ0Vjb1NJUyBET0knXSApIHtcbiAgICAgICAgZGVsZXRlIGNrYW5QYWNrYWdlLmV4dHJhc1snRWNvU0lTIERPSSddXG4gICAgICB9XG4gICAgICBpZiggY2thblBhY2thZ2UuZXh0cmFzWydFY29TSVMgRE9JIFN0YXR1cyddICkge1xuICAgICAgICBkZWxldGUgY2thblBhY2thZ2UuZXh0cmFzWydFY29TSVMgRE9JIFN0YXR1cyddXG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGZvciggdmFyIGtleSBpbiBja2FuUGFja2FnZS5leHRyYXMgKSB7XG4gICAgICBhcnIucHVzaCh7XG4gICAgICAgIGtleSA6IGtleSxcbiAgICAgICAgdmFsdWUgOiBja2FuUGFja2FnZS5leHRyYXNba2V5XVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuZGF0YS5leHRyYXMgPSBhcnI7XG4gIH1cblxuICBpZiggY2thblBhY2thZ2UudGFncyApIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBja2FuUGFja2FnZS50YWdzLmxlbmd0aDsgaSsrICkge1xuICAgICAgYXJyLnB1c2goe1xuICAgICAgICBuYW1lIDogY2thblBhY2thZ2UudGFnc1tpXSxcbiAgICAgICAgZGlzcGxheV9uYW1lIDogY2thblBhY2thZ2UudGFnc1tpXVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuZGF0YS50YWdzID0gYXJyO1xuICB9XG5cbiAgaWYoIGNrYW5QYWNrYWdlLm1hcCApIHtcbiAgICB0aGlzLnNldEFsaWFzZXMoY2thblBhY2thZ2UubWFwKTtcbiAgfVxufVxuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgdGhpcy5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgey8qKi99XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICgodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgfHwgdGFyZ2V0ID09IG51bGwpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyZWR1Y2UnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdDtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgeyAvLyBCcm93c2VyIHdpbmRvd1xuICByb290ID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gV2ViIFdvcmtlclxuICByb290ID0gc2VsZjtcbn0gZWxzZSB7IC8vIE90aGVyIGVudmlyb25tZW50c1xuICByb290ID0gdGhpcztcbn1cblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbnJlcXVlc3QuZ2V0WEhSID0gZnVuY3Rpb24gKCkge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdFxuICAgICAgJiYgKCFyb290LmxvY2F0aW9uIHx8ICdmaWxlOicgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbFxuICAgICAgICAgIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAobnVsbCAhPSBvYmpba2V5XSkge1xuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgb2JqW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogSGVscHMgJ3NlcmlhbGl6ZScgd2l0aCBzZXJpYWxpemluZyBhcnJheXMuXG4gKiBNdXRhdGVzIHRoZSBwYWlycyBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYWlyc1xuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKi9cblxuZnVuY3Rpb24gcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdmFsKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICByZXR1cm4gdmFsLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdik7XG4gICAgfSk7XG4gIH1cbiAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHBhaXI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBhcnRzID0gcGFpci5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG1pbWVgIGlzIGpzb24gb3IgaGFzICtqc29uIHN0cnVjdHVyZWQgc3ludGF4IHN1ZmZpeC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWltZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSlNPTihtaW1lKSB7XG4gIHJldHVybiAvW1xcLytdanNvblxcYi8udGVzdChtaW1lKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPSAoKHRoaXMucmVxLm1ldGhvZCAhPSdIRUFEJyAmJiAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8IHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnKVxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSlcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2UgJiYgc3RyICYmIChzdHIubGVuZ3RoIHx8IHN0ciBpbnN0YW5jZW9mIE9iamVjdClcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgc3RhdHVzID0gMjA0O1xuICB9XG5cbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5zdGF0dXNDb2RlID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBFbWl0dGVyLmNhbGwodGhpcyk7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTtcbiAgdGhpcy5faGVhZGVyID0ge307XG4gIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGVyciA9IG51bGw7XG4gICAgdmFyIHJlcyA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGU7XG4gICAgICAvLyBpc3N1ZSAjNjc1OiByZXR1cm4gdGhlIHJhdyByZXNwb25zZSBpZiB0aGUgcmVzcG9uc2UgcGFyc2luZyBmYWlsc1xuICAgICAgZXJyLnJhd1Jlc3BvbnNlID0gc2VsZi54aHIgJiYgc2VsZi54aHIucmVzcG9uc2VUZXh0ID8gc2VsZi54aHIucmVzcG9uc2VUZXh0IDogbnVsbDtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICB2YXIgbmV3X2VyciA9IG5ldyBFcnJvcihyZXMuc3RhdHVzVGV4dCB8fCAnVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2UnKTtcbiAgICBuZXdfZXJyLm9yaWdpbmFsID0gZXJyO1xuICAgIG5ld19lcnIucmVzcG9uc2UgPSByZXM7XG4gICAgbmV3X2Vyci5zdGF0dXMgPSByZXMuc3RhdHVzO1xuXG4gICAgc2VsZi5jYWxsYmFjayhuZXdfZXJyLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEZvcmNlIGdpdmVuIHBhcnNlclxuICpcbiAqIFNldHMgdGhlIGJvZHkgcGFyc2VyIG5vIG1hdHRlciB0eXBlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZm4pe1xuICB0aGlzLl9wYXJzZXIgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSB8fCBmaWxlLm5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAgYXMgdGhlIHJlcXVlc3QgYm9keSwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9JylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaiB8fCBpc0hvc3QoZGF0YSkpIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICBmbihlcnIsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdSZXF1ZXN0IGhhcyBiZWVuIHRlcm1pbmF0ZWRcXG5Qb3NzaWJsZSBjYXVzZXM6IHRoZSBuZXR3b3JrIGlzIG9mZmxpbmUsIE9yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4sIHRoZSBwYWdlIGlzIGJlaW5nIHVubG9hZGVkLCBldGMuJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG5cbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gdGhpcy5tZXRob2Q7XG4gIGVyci51cmwgPSB0aGlzLnVybDtcblxuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSByZXF1ZXN0LmdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcblxuICAgIC8vIEluIElFOSwgcmVhZHMgdG8gYW55IHByb3BlcnR5IChlLmcuIHN0YXR1cykgb2ZmIG9mIGFuIGFib3J0ZWQgWEhSIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gdGhlIGVycm9yIFwiQ291bGQgbm90IGNvbXBsZXRlIHRoZSBvcGVyYXRpb24gZHVlIHRvIGVycm9yIGMwMGMwMjNmXCJcbiAgICB2YXIgc3RhdHVzO1xuICAgIHRyeSB7IHN0YXR1cyA9IHhoci5zdGF0dXMgfSBjYXRjaChlKSB7IHN0YXR1cyA9IDA7IH1cblxuICAgIGlmICgwID09IHN0YXR1cykge1xuICAgICAgaWYgKHNlbGYudGltZWRvdXQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIHZhciBoYW5kbGVQcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgIGlmIChlLnRvdGFsID4gMCkge1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgIH1cbiAgICBlLmRpcmVjdGlvbiA9ICdkb3dubG9hZCc7XG4gICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICB9O1xuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB4aHIub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKHhoci51cGxvYWQgJiYgdGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIC8vIFJlcG9ydGVkIGhlcmU6XG4gICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy84MzcyNDUveG1saHR0cHJlcXVlc3QtdXBsb2FkLXRocm93cy1pbnZhbGlkLWFyZ3VtZW50LXdoZW4tdXNlZC1mcm9tLXdlYi13b3JrZXItY29udGV4dFxuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYudGltZWRvdXQgPSB0cnVlO1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCdHRVQnICE9IHRoaXMubWV0aG9kICYmICdIRUFEJyAhPSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSAmJiAhaXNIb3N0KGRhdGEpKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgdmFyIGNvbnRlbnRUeXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIHZhciBzZXJpYWxpemUgPSB0aGlzLl9wYXJzZXIgfHwgcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG5cbiAgLy8gSUUxMSB4aHIuc2VuZCh1bmRlZmluZWQpIHNlbmRzICd1bmRlZmluZWQnIHN0cmluZyBhcyBQT1NUIHBheWxvYWQgKGluc3RlYWQgb2Ygbm90aGluZylcbiAgLy8gV2UgbmVlZCBudWxsIGhlcmUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgeGhyLnNlbmQodHlwZW9mIGRhdGEgIT09ICd1bmRlZmluZWQnID8gZGF0YSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRmF1eCBwcm9taXNlIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsLCByZWplY3QpIHtcbiAgcmV0dXJuIHRoaXMuZW5kKGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgZXJyID8gcmVqZWN0KGVycikgOiBmdWxmaWxsKHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWwodXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxucmVxdWVzdFsnZGVsJ10gPSBkZWw7XG5yZXF1ZXN0WydkZWxldGUnXSA9IGRlbDtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJNZWFzdXJlbWVudFwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQWNxdWlzaXRpb24gTWV0aG9kXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkNvbnRhY3RcIixcbiAgICAgICAgXCJPdGhlclwiLFxuICAgICAgICBcIlBpeGVsXCIsXG4gICAgICAgIFwiUHJveGltYWxcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNaW5pbXVtIG1lYXN1cmVtZW50IHVuaXQgZm9yIHlvdXIgc3BlY3RyYSAoaS5lLiBjb250YWN0IHByb2JlLCBwcm94aW1hbCB3aXRoIFgtZGVncmVlIGZvcmVvcHRpYywgcGl4ZWwsIG90aGVyKS5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJTYW1wbGUgUGxhdGZvcm1cIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQWlycGxhbmVcIixcbiAgICAgICAgXCJCb29tXCIsXG4gICAgICAgIFwiU2F0ZWxsaXRlXCIsXG4gICAgICAgIFwiVG93ZXJcIixcbiAgICAgICAgXCJVQVZcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJQbGF0Zm9ybSBmcm9tIHdoaWNoIHRoZSBzcGVjdHJhbCBtZWFzdXJlbWVudHMgd2VyZSBtYWRlIChlLmcuIGhhbmRoZWxkLCBib29tLCB0cmFtLCBVQVYpLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNZWFzdXJlbWVudCBWZW51ZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJHcmVlbmhvdXNlXCIsXG4gICAgICAgIFwiTGFib3JhdG9yeVwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiT3V0ZG9vclwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNldHRpbmcgaW4gd2hpY2ggdGhlIHNwZWN0cmFsIG1lYXN1cmVtZW50cyB3ZXJlIG1hZGUuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVGFyZ2V0IFR5cGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQW5pbWFsXCIsXG4gICAgICAgIFwiQmFya1wiLFxuICAgICAgICBcIkJyYW5jaFwiLFxuICAgICAgICBcIkNhbm9weVwiLFxuICAgICAgICBcIkZsb3dlclwiLFxuICAgICAgICBcIkxlYWZcIixcbiAgICAgICAgXCJNaW5lcmFsXCIsXG4gICAgICAgIFwiTlBWXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJSZWZlcmVuY2VcIixcbiAgICAgICAgXCJSb2NrXCIsXG4gICAgICAgIFwiU29pbFwiLFxuICAgICAgICBcIldhdGVyXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRGVzY3JpYmVzIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWVhc3VyZW1lbnQgUXVhbnRpdHlcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQWJzb3JwdGFuY2VcIixcbiAgICAgICAgXCJETlwiLFxuICAgICAgICBcIkVtaXNzaXZpdHlcIixcbiAgICAgICAgXCJJbmRleFwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiUmFkaWFuY2VcIixcbiAgICAgICAgXCJSZWZsZWN0YW5jZVwiLFxuICAgICAgICBcIlRyYW5zZmxlY3RhbmNlXCIsXG4gICAgICAgIFwiVHJhbnNtaXR0YW5jZVwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNjYWxlIGZvciBzcGVjdHJhbCBpbnN0ZW5zaXR5IChlLmcuIEROLCByYWRpYW5jZSwgaXJyYWRpYW5jZSwgcmVmbGVjdGFuY2UpXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiSW5kZXggTmFtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWVhc3VyZW1lbnQgcXVhbnRpdHkncyBpbmRleCBuYW1lLiAgUGxlYXNlIHByb3ZpZGUgaWYgTWVhc3VyZW1lbnQgUXVhbnRpdHkgPSBcXFwiSW5kZXhcXFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1lYXN1cmVtZW50IFVuaXRzXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZC1zaW5nbGVcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCIlXCIsXG4gICAgICAgIFwiVy9tXjJcIixcbiAgICAgICAgXCJXL21eMi9IelwiLFxuICAgICAgICBcIlcvbV4yL25tXCIsXG4gICAgICAgIFwiVy9tXjIvdW1cIixcbiAgICAgICAgXCJXL3NyL21eMlwiXG4gICAgICBdLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1lYXN1cmVtbnQgdW5pdHNcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiV2F2ZWxlbmd0aCBVbml0c1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWQtc2luZ2xlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJVbml0bGVzc1wiLFxuICAgICAgICBcIm5tXCIsXG4gICAgICAgIFwidW1cIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXYXZlbGVuZ3RoIHVuaXRzIChlLmcuIG5tLCB1bSwgSHopXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVGFyZ2V0IFN0YXR1c1wiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJEcmllZFwiLFxuICAgICAgICBcIkZyZXNoXCIsXG4gICAgICAgIFwiR3JlZW5cIixcbiAgICAgICAgXCJHcm91bmRcIixcbiAgICAgICAgXCJMaXF1aWRcIixcbiAgICAgICAgXCJMaXZlXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJQYW5lbFwiLFxuICAgICAgICBcIlN0YW5kYXJkXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3RhdGUgb2YgdGhlIG1lYXN1cmVtZW50IHRhcmdldC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMaWdodCBTb3VyY2VcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTGFtcFwiLFxuICAgICAgICBcIkxhc2VyXCIsXG4gICAgICAgIFwiT3RoZXJcIixcbiAgICAgICAgXCJTdW5cIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEZXNjcmlwdGlvbiBvZiB0aGUgbGlnaHQgc291cmNlIHVzZWQgZm9yIHlvdXIgc3BlY3RyYWwgbWVhc3VyZW1lbnRzXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTGlnaHQgU291cmNlIFNwZWNpZmljYXRpb25zXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwic3BsaXQtdGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRm9yZW9wdGljIFR5cGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiQmFyZSBGaWJlclwiLFxuICAgICAgICBcIkNvbnRhY3QgUHJvYmVcIixcbiAgICAgICAgXCJDb3NpbmUgRGlmZnVzZXJcIixcbiAgICAgICAgXCJGb3Jlb3B0aWNcIixcbiAgICAgICAgXCJHZXJzaG9uIFR1YmVcIixcbiAgICAgICAgXCJJbnRlZ3JhdGluZyBTcGhlcmVcIixcbiAgICAgICAgXCJMZWFmIENsaXBcIixcbiAgICAgICAgXCJOb25lXCIsXG4gICAgICAgIFwiT3RoZXJcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEZXNjcmlwdGlvbiBvZiB0aGUgZm9yZW9wdGljIHVzZWQgdG8gbWFrZSB5b3VyIHNwZWN0cmFsIG1lYXN1cmVtZW50XCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRm9yZW9wdGljIEZpZWxkIG9mIFZpZXdcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiaW50ZWdlciBkZWdyZWVzXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGb3Jlb3B0aWMgU3BlY2lmaWNhdGlvbnNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIlByb2Nlc3NpbmcgSW5mb3JtYXRpb25cIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlByb2Nlc3NpbmcgQXZlcmFnZWRcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJjb250cm9sbGVkLXNpbmdsZVwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIk5vXCIsXG4gICAgICAgIFwiWWVzXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSXMgdGhlIG1lYXN1cmVtZW50IGFuIGF2ZXJhZ2Ugb2YgbXVsdGlwbGUgbWVhc3VyZW1lbnRzP1wiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIEludGVycG9sYXRlZFwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWQtc2luZ2xlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTm9cIixcbiAgICAgICAgXCJZZXNcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJcyB0aGUgbWVhc3VyZW1lbnQgaW50ZXJwb2xhdGVkP1wiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIFJlc2FtcGxlZFwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWQtc2luZ2xlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBbXG4gICAgICAgIFwiTm9cIixcbiAgICAgICAgXCJZZXNcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJcyB0aGUgbWVhc3VyZW1lbnQgcmVzYW1wbGVkPyAoZS5nLiBhcmUgbXVsdGlwbGUgd2F2ZWxlbmd0aHMgYXZlcmFnZWQ/KVwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJQcm9jZXNzaW5nIEluZm9ybWF0aW9uIERldGFpbHNcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk90aGVyIGRldGFpbHMgYWJvdXQgcHJvY2Vzc2luZyBhcmUgcHJvdmlkZWQgaGVyZS5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJJbnN0cnVtZW50XCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbnN0cnVtZW50IE1hbnVmYWN0dXJlclwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3BlY3Ryb21ldGVyIG1hbnVmYWN0dXJlci5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiSW5zdHJ1bWVudCBNb2RlbFwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3BlY3Ryb21ldGVyIG1vZGVsLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJJbnN0cnVtZW50IFNlcmlhbCBOdW1iZXJcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIlRoZW1lXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJUaGVtZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImNvbnRyb2xsZWRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IFtcbiAgICAgICAgXCJBZ3JpY3VsdHVyZVwiLFxuICAgICAgICBcIkJpb2NoZW1pc3RyeVwiLFxuICAgICAgICBcIkVjb2xvZ3lcIixcbiAgICAgICAgXCJGb3Jlc3RcIixcbiAgICAgICAgXCJHbG9iYWwgQ2hhbmdlXCIsXG4gICAgICAgIFwiTGFuZCBDb3ZlclwiLFxuICAgICAgICBcIk90aGVyXCIsXG4gICAgICAgIFwiUGhlbm9sb2d5XCIsXG4gICAgICAgIFwiUGh5c2lvbG9neVwiLFxuICAgICAgICBcIldhdGVyIFF1YWxpdHlcIlxuICAgICAgXSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJSZXNlYXJjaCBjb250ZXh0IGZvciB0aGUgdGhlIHNwZWN0cmFsIG1lYXN1cmVtZW50cy5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJLZXl3b3Jkc1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInNwbGl0LXRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkVjb3N5c3RlbSBUeXBlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiY29udHJvbGxlZFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogW1xuICAgICAgICBcIkFscGluZVwiLFxuICAgICAgICBcIkFudGFyY3RpY1wiLFxuICAgICAgICBcIkFxdWF0aWNcIixcbiAgICAgICAgXCJBcmN0aWNcIixcbiAgICAgICAgXCJBcmN0aWMgVHVuZHJhXCIsXG4gICAgICAgIFwiQ29hc3RhbFwiLFxuICAgICAgICBcIkNyb3BzXCIsXG4gICAgICAgIFwiRGVzZXJ0XCIsXG4gICAgICAgIFwiRXN0dWFyeVwiLFxuICAgICAgICBcIkZvcmVzdFwiLFxuICAgICAgICBcIkZyZXNod2F0ZXJcIixcbiAgICAgICAgXCJHcmFzc2xhbmRcIixcbiAgICAgICAgXCJMYWtlXCIsXG4gICAgICAgIFwiTWFyaW5lXCIsXG4gICAgICAgIFwiTW9udGFuZVwiLFxuICAgICAgICBcIk9jZWFuXCIsXG4gICAgICAgIFwiUG9uZFwiLFxuICAgICAgICBcIlJhaW5mb3Jlc3RcIixcbiAgICAgICAgXCJSaXZlclwiLFxuICAgICAgICBcIlNhdmFubmFcIixcbiAgICAgICAgXCJTY3J1YmxhbmRcIixcbiAgICAgICAgXCJTaHJ1YmxhbmRcIixcbiAgICAgICAgXCJTdGVwcGVcIixcbiAgICAgICAgXCJUdW5kcmFcIixcbiAgICAgICAgXCJVcmJhblwiLFxuICAgICAgICBcIldvb2RsYW5kXCJcbiAgICAgIF0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk5BU0EgR0NNRCBLZXl3b3Jkc1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2VsZWN0IHNwZWN0cm9zY29weS1yZWxhdGVkIGtleXdvcmRzIGZyb20gdGhlIE5BU0EgR2xvYmFsIENoYW5nZSBNYXN0ZXIgRGlyZWN0b3J5J3MgY29udHJvbGxlZCBrZXl3b3JkIHZvY2FidWxhcmllcy4gKGh0dHA6Ly9nY21kLm5hc2EuZ292L2xlYXJuL2tleXdvcmRfbGlzdC5odG1sKVwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIkxvY2F0aW9uXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMYXRpdHVkZVwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImxhdGxuZ1wiLFxuICAgICAgXCJ1bml0c1wiOiBcImRlY2ltYWwgZGVncmVlXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMb25naXR1ZGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJsYXRsbmdcIixcbiAgICAgIFwidW5pdHNcIjogXCJkZWNpbWFsIGRlZ3JlZVwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiZ2VvanNvblwiLFxuICAgICAgXCJsZXZlbFwiOiAxLFxuICAgICAgXCJpbnB1dFwiOiBcImdlb2pzb25cIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiU3BlY3RyYVwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxvY2F0aW9uIE5hbWVcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJzcGxpdC10ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdLFxuICBcIkRhdGVcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlNhbXBsZSBDb2xsZWN0aW9uIERhdGVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJkYXRlXCIsXG4gICAgICBcInVuaXRzXCI6IFwiSVNPIERhdGUgXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkJvdGhcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNZWFzdXJlbWVudCBEYXRlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwiZGF0ZVwiLFxuICAgICAgXCJ1bml0c1wiOiBcIklTTyBEYXRlIFwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJCb3RoXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUGhlbm9sb2dpY2FsIFN0YXR1c1wiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiQm90aFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9XG4gIF0sXG4gIFwiU3BlY2llc1wiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ29tbW9uIE5hbWVcIixcbiAgICAgIFwibGV2ZWxcIjogMSxcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIlNwZWN0cmFcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkNvbW1vbiBuYW1lIG9mIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkxhdGluIEdlbnVzXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMYXRpbiBnZW51cyBvZiB0aGUgdGFyZ2V0IHRoYXQgd2FzIG1lYXN1cmVkLlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJMYXRpbiBTcGVjaWVzXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMYXRpbiBzcGVjaWVzIG9mIHRoZSB0YXJnZXQgdGhhdCB3YXMgbWVhc3VyZWQuXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlVTREEgU3ltYm9sXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJVU0RBIGNvZGUgb2YgdGhlIHRhcmdldCB0aGF0IHdhcyBtZWFzdXJlZC5cIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVmVnZXRhdGlvbiBUeXBlXCIsXG4gICAgICBcImxldmVsXCI6IDEsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJTcGVjdHJhXCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH1cbiAgXSxcbiAgXCJDaXRhdGlvblwiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ2l0YXRpb25cIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJDaXRhdGlvbiBET0lcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJXZWJzaXRlXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQXV0aG9yXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQXV0aG9yIEVtYWlsXCIsXG4gICAgICBcImxldmVsXCI6IDIsXG4gICAgICBcImlucHV0XCI6IFwidGV4dFwiLFxuICAgICAgXCJ1bml0c1wiOiBcIlwiLFxuICAgICAgXCJmb3JTY2hlbWFcIjogXCJEYXRhc2V0XCIsXG4gICAgICBcInZvY2FidWxhcnlcIjogbnVsbCxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICAgIFwiYWxsb3dPdGhlclwiOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWFpbnRhaW5lclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1haW50YWluZXIgRW1haWxcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJGdW5kaW5nIFNvdXJjZVwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkZ1bmRpbmcgU291cmNlIEdyYW50IE51bWJlclwiLFxuICAgICAgXCJsZXZlbFwiOiAyLFxuICAgICAgXCJpbnB1dFwiOiBcInRleHRcIixcbiAgICAgIFwidW5pdHNcIjogXCJcIixcbiAgICAgIFwiZm9yU2NoZW1hXCI6IFwiRGF0YXNldFwiLFxuICAgICAgXCJ2b2NhYnVsYXJ5XCI6IG51bGwsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiXCIsXG4gICAgICBcImFsbG93T3RoZXJcIjogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlllYXJcIixcbiAgICAgIFwibGV2ZWxcIjogMixcbiAgICAgIFwiaW5wdXRcIjogXCJ0ZXh0XCIsXG4gICAgICBcInVuaXRzXCI6IFwiXCIsXG4gICAgICBcImZvclNjaGVtYVwiOiBcIkRhdGFzZXRcIixcbiAgICAgIFwidm9jYWJ1bGFyeVwiOiBudWxsLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlwiLFxuICAgICAgXCJhbGxvd090aGVyXCI6IGZhbHNlXG4gICAgfVxuICBdXG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFIgPSB0eXBlb2YgUmVmbGVjdCA9PT0gJ29iamVjdCcgPyBSZWZsZWN0IDogbnVsbFxudmFyIFJlZmxlY3RBcHBseSA9IFIgJiYgdHlwZW9mIFIuYXBwbHkgPT09ICdmdW5jdGlvbidcbiAgPyBSLmFwcGx5XG4gIDogZnVuY3Rpb24gUmVmbGVjdEFwcGx5KHRhcmdldCwgcmVjZWl2ZXIsIGFyZ3MpIHtcbiAgICByZXR1cm4gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwodGFyZ2V0LCByZWNlaXZlciwgYXJncyk7XG4gIH1cblxudmFyIFJlZmxlY3RPd25LZXlzXG5pZiAoUiAmJiB0eXBlb2YgUi5vd25LZXlzID09PSAnZnVuY3Rpb24nKSB7XG4gIFJlZmxlY3RPd25LZXlzID0gUi5vd25LZXlzXG59IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgUmVmbGVjdE93bktleXMgPSBmdW5jdGlvbiBSZWZsZWN0T3duS2V5cyh0YXJnZXQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGFyZ2V0KVxuICAgICAgLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHRhcmdldCkpO1xuICB9O1xufSBlbHNlIHtcbiAgUmVmbGVjdE93bktleXMgPSBmdW5jdGlvbiBSZWZsZWN0T3duS2V5cyh0YXJnZXQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGFyZ2V0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gUHJvY2Vzc0VtaXRXYXJuaW5nKHdhcm5pbmcpIHtcbiAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS53YXJuKSBjb25zb2xlLndhcm4od2FybmluZyk7XG59XG5cbnZhciBOdW1iZXJJc05hTiA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbiBOdW1iZXJJc05hTih2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIEV2ZW50RW1pdHRlci5pbml0LmNhbGwodGhpcyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbm1vZHVsZS5leHBvcnRzLm9uY2UgPSBvbmNlO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50c0NvdW50ID0gMDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxudmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuZnVuY3Rpb24gY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIFwibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgRnVuY3Rpb24uIFJlY2VpdmVkIHR5cGUgJyArIHR5cGVvZiBsaXN0ZW5lcik7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50RW1pdHRlciwgJ2RlZmF1bHRNYXhMaXN0ZW5lcnMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIH0sXG4gIHNldDogZnVuY3Rpb24oYXJnKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgIT09ICdudW1iZXInIHx8IGFyZyA8IDAgfHwgTnVtYmVySXNOYU4oYXJnKSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBvZiBcImRlZmF1bHRNYXhMaXN0ZW5lcnNcIiBpcyBvdXQgb2YgcmFuZ2UuIEl0IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyLiBSZWNlaXZlZCAnICsgYXJnICsgJy4nKTtcbiAgICB9XG4gICAgZGVmYXVsdE1heExpc3RlbmVycyA9IGFyZztcbiAgfVxufSk7XG5cbkV2ZW50RW1pdHRlci5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgaWYgKHRoaXMuX2V2ZW50cyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICB0aGlzLl9ldmVudHMgPT09IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKS5fZXZlbnRzKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufTtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCBuIDwgMCB8fCBOdW1iZXJJc05hTihuKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgb2YgXCJuXCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlci4gUmVjZWl2ZWQgJyArIG4gKyAnLicpO1xuICB9XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gX2dldE1heExpc3RlbmVycyh0aGF0KSB7XG4gIGlmICh0aGF0Ll9tYXhMaXN0ZW5lcnMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gIHJldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnM7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gX2dldE1heExpc3RlbmVycyh0aGlzKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQodHlwZSkge1xuICB2YXIgYXJncyA9IFtdO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gIHZhciBkb0Vycm9yID0gKHR5cGUgPT09ICdlcnJvcicpO1xuXG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gIGlmIChldmVudHMgIT09IHVuZGVmaW5lZClcbiAgICBkb0Vycm9yID0gKGRvRXJyb3IgJiYgZXZlbnRzLmVycm9yID09PSB1bmRlZmluZWQpO1xuICBlbHNlIGlmICghZG9FcnJvcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAoZG9FcnJvcikge1xuICAgIHZhciBlcjtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKVxuICAgICAgZXIgPSBhcmdzWzBdO1xuICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAvLyBOb3RlOiBUaGUgY29tbWVudHMgb24gdGhlIGB0aHJvd2AgbGluZXMgYXJlIGludGVudGlvbmFsLCB0aGV5IHNob3dcbiAgICAgIC8vIHVwIGluIE5vZGUncyBvdXRwdXQgaWYgdGhpcyByZXN1bHRzIGluIGFuIHVuaGFuZGxlZCBleGNlcHRpb24uXG4gICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICB9XG4gICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuaGFuZGxlZCBlcnJvci4nICsgKGVyID8gJyAoJyArIGVyLm1lc3NhZ2UgKyAnKScgOiAnJykpO1xuICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgdGhyb3cgZXJyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICB9XG5cbiAgdmFyIGhhbmRsZXIgPSBldmVudHNbdHlwZV07XG5cbiAgaWYgKGhhbmRsZXIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgUmVmbGVjdEFwcGx5KGhhbmRsZXIsIHRoaXMsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBSZWZsZWN0QXBwbHkobGlzdGVuZXJzW2ldLCB0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2FkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIHByZXBlbmQpIHtcbiAgdmFyIG07XG4gIHZhciBldmVudHM7XG4gIHZhciBleGlzdGluZztcblxuICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcblxuICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRhcmdldC5fZXZlbnRzQ291bnQgPSAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICAgIGlmIChldmVudHMubmV3TGlzdGVuZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgICAgIC8vIFJlLWFzc2lnbiBgZXZlbnRzYCBiZWNhdXNlIGEgbmV3TGlzdGVuZXIgaGFuZGxlciBjb3VsZCBoYXZlIGNhdXNlZCB0aGVcbiAgICAgIC8vIHRoaXMuX2V2ZW50cyB0byBiZSBhc3NpZ25lZCB0byBhIG5ldyBvYmplY3RcbiAgICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICAgIH1cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIGlmIChleGlzdGluZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgICArK3RhcmdldC5fZXZlbnRzQ291bnQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBleGlzdGluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9XG4gICAgICAgIHByZXBlbmQgPyBbbGlzdGVuZXIsIGV4aXN0aW5nXSA6IFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIH0gZWxzZSBpZiAocHJlcGVuZCkge1xuICAgICAgZXhpc3RpbmcudW5zaGlmdChsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgbSA9IF9nZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtcbiAgICBpZiAobSA+IDAgJiYgZXhpc3RpbmcubGVuZ3RoID4gbSAmJiAhZXhpc3Rpbmcud2FybmVkKSB7XG4gICAgICBleGlzdGluZy53YXJuZWQgPSB0cnVlO1xuICAgICAgLy8gTm8gZXJyb3IgY29kZSBmb3IgdGhpcyBzaW5jZSBpdCBpcyBhIFdhcm5pbmdcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXN0cmljdGVkLXN5bnRheFxuICAgICAgdmFyIHcgPSBuZXcgRXJyb3IoJ1Bvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLmxlbmd0aCArICcgJyArIFN0cmluZyh0eXBlKSArICcgbGlzdGVuZXJzICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnYWRkZWQuIFVzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5jcmVhc2UgbGltaXQnKTtcbiAgICAgIHcubmFtZSA9ICdNYXhMaXN0ZW5lcnNFeGNlZWRlZFdhcm5pbmcnO1xuICAgICAgdy5lbWl0dGVyID0gdGFyZ2V0O1xuICAgICAgdy50eXBlID0gdHlwZTtcbiAgICAgIHcuY291bnQgPSBleGlzdGluZy5sZW5ndGg7XG4gICAgICBQcm9jZXNzRW1pdFdhcm5pbmcodyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB0cnVlKTtcbiAgICB9O1xuXG5mdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgaWYgKCF0aGlzLmZpcmVkKSB7XG4gICAgdGhpcy50YXJnZXQucmVtb3ZlTGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLndyYXBGbik7XG4gICAgdGhpcy5maXJlZCA9IHRydWU7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5hcHBseSh0aGlzLnRhcmdldCwgYXJndW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc3RhdGUgPSB7IGZpcmVkOiBmYWxzZSwgd3JhcEZuOiB1bmRlZmluZWQsIHRhcmdldDogdGFyZ2V0LCB0eXBlOiB0eXBlLCBsaXN0ZW5lcjogbGlzdGVuZXIgfTtcbiAgdmFyIHdyYXBwZWQgPSBvbmNlV3JhcHBlci5iaW5kKHN0YXRlKTtcbiAgd3JhcHBlZC5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICBzdGF0ZS53cmFwRm4gPSB3cmFwcGVkO1xuICByZXR1cm4gd3JhcHBlZDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgdGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4vLyBFbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWYgYW5kIG9ubHkgaWYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsaXN0LCBldmVudHMsIHBvc2l0aW9uLCBpLCBvcmlnaW5hbExpc3RlbmVyO1xuXG4gICAgICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgbGlzdCA9IGV2ZW50c1t0eXBlXTtcbiAgICAgIGlmIChsaXN0ID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3QubGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaXN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBvc2l0aW9uID0gLTE7XG5cbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fCBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgb3JpZ2luYWxMaXN0ZW5lciA9IGxpc3RbaV0ubGlzdGVuZXI7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gMClcbiAgICAgICAgICBsaXN0LnNoaWZ0KCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXG4gICAgICAgICAgZXZlbnRzW3R5cGVdID0gbGlzdFswXTtcblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIG9yaWdpbmFsTGlzdGVuZXIgfHwgbGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycywgZXZlbnRzLCBpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZXZlbnRzKTtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycyA9IGV2ZW50c1t0eXBlXTtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIGlmIChsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBMSUZPIG9yZGVyXG4gICAgICAgIGZvciAoaSA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5mdW5jdGlvbiBfbGlzdGVuZXJzKHRhcmdldCwgdHlwZSwgdW53cmFwKSB7XG4gIHZhciBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIFtdO1xuXG4gIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuICBpZiAoZXZsaXN0ZW5lciA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBbXTtcblxuICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHVud3JhcCA/IFtldmxpc3RlbmVyLmxpc3RlbmVyIHx8IGV2bGlzdGVuZXJdIDogW2V2bGlzdGVuZXJdO1xuXG4gIHJldHVybiB1bndyYXAgP1xuICAgIHVud3JhcExpc3RlbmVycyhldmxpc3RlbmVyKSA6IGFycmF5Q2xvbmUoZXZsaXN0ZW5lciwgZXZsaXN0ZW5lci5sZW5ndGgpO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIHRydWUpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnMgPSBmdW5jdGlvbiByYXdMaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLmxpc3RlbmVyQ291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZW1pdHRlci5saXN0ZW5lckNvdW50KHR5cGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBsaXN0ZW5lckNvdW50LmNhbGwoZW1pdHRlciwgdHlwZSk7XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGxpc3RlbmVyQ291bnQ7XG5mdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpIHtcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcblxuICBpZiAoZXZlbnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcblxuICAgIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmIChldmxpc3RlbmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3RPd25LZXlzKHRoaXMuX2V2ZW50cykgOiBbXTtcbn07XG5cbmZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLCBuKSB7XG4gIHZhciBjb3B5ID0gbmV3IEFycmF5KG4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gc3BsaWNlT25lKGxpc3QsIGluZGV4KSB7XG4gIGZvciAoOyBpbmRleCArIDEgPCBsaXN0Lmxlbmd0aDsgaW5kZXgrKylcbiAgICBsaXN0W2luZGV4XSA9IGxpc3RbaW5kZXggKyAxXTtcbiAgbGlzdC5wb3AoKTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gb25jZShlbWl0dGVyLCBuYW1lKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgZnVuY3Rpb24gZXJyb3JMaXN0ZW5lcihlcnIpIHtcbiAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIobmFtZSwgcmVzb2x2ZXIpO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZXIoKSB7XG4gICAgICBpZiAodHlwZW9mIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBlcnJvckxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuXG4gICAgZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsIG5hbWUsIHJlc29sdmVyLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgaWYgKG5hbWUgIT09ICdlcnJvcicpIHtcbiAgICAgIGFkZEVycm9ySGFuZGxlcklmRXZlbnRFbWl0dGVyKGVtaXR0ZXIsIGVycm9yTGlzdGVuZXIsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRFcnJvckhhbmRsZXJJZkV2ZW50RW1pdHRlcihlbWl0dGVyLCBoYW5kbGVyLCBmbGFncykge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgJ2Vycm9yJywgaGFuZGxlciwgZmxhZ3MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCBuYW1lLCBsaXN0ZW5lciwgZmxhZ3MpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKGZsYWdzLm9uY2UpIHtcbiAgICAgIGVtaXR0ZXIub25jZShuYW1lLCBsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVtaXR0ZXIub24obmFtZSwgbGlzdGVuZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gRXZlbnRUYXJnZXQgZG9lcyBub3QgaGF2ZSBgZXJyb3JgIGV2ZW50IHNlbWFudGljcyBsaWtlIE5vZGVcbiAgICAvLyBFdmVudEVtaXR0ZXJzLCB3ZSBkbyBub3QgbGlzdGVuIGZvciBgZXJyb3JgIGV2ZW50cyBoZXJlLlxuICAgIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmdW5jdGlvbiB3cmFwTGlzdGVuZXIoYXJnKSB7XG4gICAgICAvLyBJRSBkb2VzIG5vdCBoYXZlIGJ1aWx0aW4gYHsgb25jZTogdHJ1ZSB9YCBzdXBwb3J0IHNvIHdlXG4gICAgICAvLyBoYXZlIHRvIGRvIGl0IG1hbnVhbGx5LlxuICAgICAgaWYgKGZsYWdzLm9uY2UpIHtcbiAgICAgICAgZW1pdHRlci5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIHdyYXBMaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICBsaXN0ZW5lcihhcmcpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcImVtaXR0ZXJcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgRXZlbnRFbWl0dGVyLiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgZW1pdHRlcik7XG4gIH1cbn1cbiJdfQ==
