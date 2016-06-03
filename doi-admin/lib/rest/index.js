var request = require('superagent');
var config = require('../config');
var handleResponse = require('./handleResponse');

// new change
function getUserInfo(callback) {
    request
        .get(config.ckan.host+'/ecosis/user/get')
        .withCredentials()
        .end(handleResponse(callback));
}

function getDoiPackages(query, callback) {
    request
        .get(config.ckan.host+'/ecosis/admin/doi/query')
        .query(query)
        .withCredentials()
        .end(handleResponse(callback));
}

function setDoiStatus(package_id, value, callback) {
    getPackage(package_id, function(resp){
        if( resp.error ) {
            return callback(resp);
        }
        
        var status = JSON.parse(getExtra(resp, 'EcoSIS DOI Status'));
        status.value = value;
        
        setExtra(resp, 'EcoSIS DOI Status', JSON.stringify(status));
        updatePackage(resp, callback);
    });
}

function updatePackage(pkg, callback) {
    request
        .post(config.ckan.host+'/api/3/action/package_update')
        .withCredentials()
        .send(pkg)
        .end(handleResponse(callback));
}

function getPackage(package_id, callback) {
    request
        .get(config.ckan.host+'/api/3/action/package_show')
        .query({id: package_id})
        .withCredentials()
        .end(handleResponse(callback));
}

function getExtra(pkg, key) {
    if( !pkg.extras ) return null;

    for( var i = 0; i < pkg.extras.length; i++ ) {
      if( pkg.extras[i].key == key ) {
          return pkg.extras[i].value;
      }
    }

    return null;
}

function setExtra(pkg, key, value) {
    if( !pkg.extras ) pkg.extras = [];

    for( var i = 0; i < pkg.extras.length; i++ ) {
      if( pkg.extras[i].key == key ) {
        if( value === '' || value === null || value === undefined ) {
          pkg.extras.splice(i, 1);
        } else {
          pkg.extras[i].value = value;
        }
        return;
      }
    }

    if( value === '' || value === null || value === undefined ) {
      return;
    }

    pkg.extras.push({
      key : key,
      value : value
    });
};

module.exports = {
    getUserInfo : getUserInfo,
    getDoiPackages : getDoiPackages,
    setDoiStatus : setDoiStatus,
    getExtra : getExtra
}