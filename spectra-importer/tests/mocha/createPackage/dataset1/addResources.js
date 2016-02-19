var assert = require('assert');
var path = require('path');

describe('Add Resources - Dataset 1', function() {
  var data, SDK, pkg;

  var firstSpectraId = 'AK01_ACRU_B_LC_REFL';

  var resources = {
    data : null,
    metadata : null
  };
  var files = {
    data : 't_data.csv',
    metadata : 't_meta.csv'
  };

  before(function(){
    data = require('./data/datasetInfo');
    SDK = require('../../newSDK')();
  });

  it('should get Dataset 1 by name via api', function(next){
    SDK.ckan.getPackage(data.name, function(resp){
      assert.equal(resp.error, undefined);
      pkg = SDK.newPackage(resp);
      assert.equal(pkg.getTitle(), data.title);

      next();
    });
  });

  it('should add spectra data csv', function(next){
    this.timeout(5000);

    var file = {
      mimetype : 'text/csv',
      filename : files.data,
      path : path.join(__dirname, 'data', files.data)
    };

    pkg.addResource(file, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(resp.success, true);
      next();
    });
  });

  it('should add spectra metadata csv', function(next){
    this.timeout(5000);

    var file = {
      mimetype : 'text/csv',
      filename : files.metadata,
      path : path.join(__dirname, 'data', files.metadata)
    };

    pkg.addResource(file, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(resp.success, true);
      next();
    });
  });

  it('should have the resource info in the datastore', function(){
    assert.equal(SDK.ds.resources.length, 2);

    resources.data = SDK.ds.resources[0];
    resources.metadata = SDK.ds.resources[1];

    assert.equal(resources.data.name, files.data);
    assert.equal(resources.metadata.name, files.metadata);
  });

  it('should have valid initial spectra query states', function(next){
    SDK.ckan.getSpectraCount(pkg.getId(), resources.data.id, null, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(resp.total, 31);

      SDK.ckan.getSpectraCount(pkg.getId(), resources.metadata.id, null, function(resp){
        assert.equal(resp.error, undefined);
        assert.equal(resp.total, 20);

        SDK.ckan.getSpectra(pkg.getId(), resources.data.id, null, 0, function(resp){
          assert.equal(resp.error, undefined);
          assert.equal(resp.spectra, firstSpectraId);

          SDK.ckan.getSpectra(pkg.getId(), resources.metadata.id, null, 0, function(resp){
            assert.equal(resp.error, undefined);
            assert.equal(typeof resp[firstSpectraId], 'string');
            next();
          });
        });
      });
    });
  });

});
