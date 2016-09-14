var assert = require('assert');
var path = require('path');

describe('Add Resources & Configure - Dataset 1', function() {
  var data, SDK, pkg;

  var firstSpectraId = 'AK01_ACRU_B_LC_REFL';
  var joinField = 'spectra';
  var metadataAttributes = [
    "spectra","site","site_name","state","plot","species","height","age","height_age","measurement_type","measurement",
    "sample_name","sample_year","sample_type","instrumentation","calibration","wavelengths","column_units",
    "project","pi","affiliation"
  ];

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

  it('should prepare workspace for Dataset 1 by id via api', function(next){
    SDK.ckan.prepareWorkspace(pkg.getId(), function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(resp.prepared, true);
      assert.equal(resp.packageId, pkg.getId());

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

  it('should let you mark the metadata as metadata', function(next){
    var options = {
      layout : 'column',
      metadata: true
    };

    SDK.ckan.processResource(pkg.getId(), resources.metadata.id, null, options, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(typeof resp.result, 'object');

      resp = resp.result;
      if( Array.isArray(resp) ) {
        resp = resp[0];
      }

      assert.equal(resp.resourceId, resources.metadata.id);
      assert.equal(resp.layout, 'column');
      assert.equal(resp.metadata, true);

      // set the update
      SDK.ds.setSheet(resp);
      next();
    });
  });

  it('should let you join the metadata', function(next){
    this.timeout(5000);
    
    var options = {
      layout : 'row',
      metadata: true,
      joinOn : joinField
    };

    SDK.ckan.processResource(pkg.getId(), resources.metadata.id, null, options, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(typeof resp.result, 'object');
      
      resp = resp.result;
      if( Array.isArray(resp) ) {
        resp = resp[0];
      }

      assert.equal(resp.resourceId, resources.metadata.id);
      assert.equal(resp.layout, 'row');
      assert.equal(resp.joinOn, joinField);
      assert.equal(resp.metadata, true);
      assert.deepEqual(resp.attributes, metadataAttributes);

      // set the update
      SDK.ds.setSheet(resp);
      next();
    });
  });

  it('should let get spectra with joined data', function(next){
    SDK.ckan.getSpectra(pkg.getId(), resources.data.id, null, 0, function(resp){
      assert.equal(resp.plot, 'AK01');
      assert.equal(resp.spectra, 'AK01_ACRU_B_LC_REFL');
      assert.equal(resp.instrumentation, 'ASD FieldSpec 3');
      assert.equal(Object.keys(resp.datapoints).length, 2151);
      next();
    });
  });

  it('should lookup species info from USDA code', function(next){
    SDK.ckan.getSpectra(pkg.getId(), resources.data.id, null, 0, function(resp){
      assert.equal(resp['Latin Species'], 'rubrum');
      assert.equal(resp['USDA Symbol'], 'ACRU');
      assert.equal(Object.keys(resp.datapoints).length, 2151);
      next();
    });
  });

  it('let you push to search', function(next){
    SDK.ckan.pushToSearch(pkg.getId(), false, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(resp.emailing, false);

      next();
    });
  });

});
