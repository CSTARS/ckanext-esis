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

      callback({success: true});
    }.bind(this)
  );
}

function save(callback) {
  // make sure we have the correct package state
  // all resources need to be included when you make a updatePackage call
  this.SDK.ckan.getPackage(this.data.id,
    function(resp) {
      if( resp.error ) {
        resp.code = 8;
        resp.message += '. Failed to fetch package for update.';
        return callback(resp);
      }

      var metadata = resp;
      for( var key in this.data ) {
        metadata[key] = this.data[key];
      }

      this.SDK.ckan.updatePackage(metadata,
        function(resp) {
          if( resp.error ) {
            // ERROR 9
            resp.code = 9;
            resp.message += '. Failed to update dataset.';
            return callback(resp);
          }

          if( !resp.id )  {
            // ERROR 10
            return callback({
              error: true,
              message : 'Failed to update dataset',
              code : 10
            });
          }

          callback({success: true});

        }.bind(this)
      );
    }.bind(this)
  );
}
