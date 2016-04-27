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

module.exports = {
    getUserInfo : getUserInfo,
    getDoiPackages : getDoiPackages
}