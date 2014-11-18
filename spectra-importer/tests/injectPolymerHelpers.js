/* add calls for webcomponents / polymer
    these should be named the same as: http://webdriver.io/api/action/setValue.html
    with 'polymer' prefixed
*/
var fs = require('fs');
var async = require('async');

exports.init = function(client) {
    client.addCommand("setHash", function(hash, cb) {
        this.execute(function(hash){
            window.location.hash = hash;
        }, hash, cb);
    });

    // note, this will directly set a value via css query and path
    client.addCommand("polymerSetValue", function(query, path, value, cb) {
        this.execute(function(query, path, value){
            var obj = document.querySelector(query);
            if( obj === null ) return;

            path = path.split('.');
            for( var i = 0; i < path.length-1; i++ ) obj = obj[path[i]];
            obj[path[path.length-1]] = value;
        }, query, path, value, function(err, resp){
            onComplete(err, resp, cb);
        });
    });
    
    client.addCommand("polymerGetValue", function(query, path, cb) {
        this.execute(function(query, path){
            var obj = document.querySelector(query);
            if( obj === null ) return;

            path = path.split('.');
            for( var i = 0; i < path.length-1; i++ ) obj = obj[path[i]];
            return obj[path[path.length-1]];
        }, query, path, function(err, resp){
            onComplete(err, resp, cb);
        });
    });
}

function onComplete(error, response, callback) {
    if( error ) return callback(error);
    if( response.state == 'success') return callback(null, response.value);
    callback({error:true, message: response});
}