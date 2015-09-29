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

  this.processResource = function(pkgid, resource_id, sheet_id, options, callback) {
    var data = {
        package_id : pkgid,
        resource_id : resource_id,
        sheet_id : sheet_id,
        options : JSON.stringify(options)
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

  this.getSpectra = function(pkgid, rid, sid, index, callback) {
    var params = '?package_id=' + pkgid +
      '&resource_id=' + rid +
      '&datasheet_id=' + sid +
      '&index='+index;

    get(this.host+'/ecosis/spectra/get'+params, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
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
