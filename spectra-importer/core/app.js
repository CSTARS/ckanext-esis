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
