var request = require('superagent');

// depends if we are running from nodejs or browser
var agent = request.agent ? request.agent() : request;
var isBrowser = request.agent ? true : false;

module.exports = function(config) {
  this.host = config.host || '/';

  this.processWorkspace = function(pkgid, callback) {
    get(this.host+'/workspace/process?package_id='+pkgid, function(err, resp){
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body);
    });
  }

  this.getActiveUser = function(callback) {
    get(this.host+'/ecosis/userInfo', function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
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
     .attach('upload', file.mimetype)
     .end(callback);
  }

  this._addResourceBrowser = function(pkgid, file, callback, progress) {
    // TODO: if this fails, we have an issue on our hands
    var formData = new FormData();

    formData.append('package_id', pkgid);
    formData.append('mimetype', file.mimetype);
    formData.append('name', file.filename);
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
      success: function(response, status) {
        if( response.success || !response.error ) {
        callback(null, response);
        } else {
            callback(response);
        }
      },
      error : function() {
          callback({error:true,message:'Request Error'});
      }
    });

    return xhr;
  }

  this.getLayoutOverview = function(pkgid, rid, sid, callback) {
    var params = '?package_id=' + pkgid +
      '&resource_id=' + rid +
      '&datasheet_id=' + sid;

    get(this.host+'/workspace/getLayoutOverview'+params, function(err, resp) {
      if( isError(err, resp) ) return callback({error:true, message:'Request Error'});
      callback(resp.body)
    });
  }


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
