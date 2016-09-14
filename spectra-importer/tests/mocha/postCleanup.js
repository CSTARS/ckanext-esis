var assert = require('assert');
var request = require('superagent');

// same as cleanup
describe('Post Cleanup Test Data', function() {
  var data, SDK, pkg;

  before(function(){
    SDK = require('./newSDK')();
    pkg = SDK.newPackage();
  });

  it('can cleanup test data', function(next){
    this.timeout(10000);

    request
      .get(SDK.ckan.host+'/ecosis/admin/cleanTests')
      .set('Authorization', SDK.ckan.key)
      .end(function(err, resp){
        assert(resp.body.success, true);
        next();
      });
  });

});
