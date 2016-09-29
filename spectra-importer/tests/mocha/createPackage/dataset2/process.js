var assert = require('assert');
var path = require('path');

describe('Add Resources & Configure - Dataset 2', function() {
  var data, SDK, pkg;

  var firstSpectraId = 'P1';
  var joinField = 'Plant Number';
  var metadataAttributes = [
    "CARBON","LMA","Latin Genus","Plot Name","Common Name","Date","LIGNIN",
    "NITROGEN","USDA Code","Light Source","FIBER","CELLULOSE","Foreoptic",
    "Target Type","Spectrometer Company","CHLOROPHYLL_A","CHLOROPHYLL_B",
    "Foreoptic FOV ","CAROTENOIDS","Latin Species","Spectrometer Model",
    "Plant Number","Wavelength Units"
  ];

  var resource = null;
  var filename = 'spectra.xlsx';
  var sheets = ['Metadata', 'Traits', 'Spectra'];

  before(function(){
    data = require('./data/datasetInfo');
    SDK = require('../../newSDK')();
  });

  it('should get Dataset 2 by name via api', function(next){
    SDK.ckan.getPackage(data.name, function(resp){
      assert.equal(resp.error, undefined);
      pkg = SDK.newPackage(resp);
      assert.equal(pkg.getTitle(), data.title);
      next();
    });
  });

  it('should prepare workspace for Dataset 2 by id via api', function(next){
    SDK.ckan.prepareWorkspace(pkg.getId(), function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(resp.prepared, true);
      assert.equal(resp.packageId, pkg.getId());

      next();
    });
  });


  it('should add excel resource', function(next){
    this.timeout(5000);

    var file = {
      mimetype : 'application/vnd.ms-excel',
      filename : filename,
      path : path.join(__dirname, 'data', filename)
    };

    pkg.addResource(file, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(resp.success, true);
      next();
    });
  });


  it('should have the resource info in the datastore', function(){
    assert.equal(SDK.ds.resources.length, 1);

    resource = SDK.ds.resources[0];

    assert.equal(resource.name, filename);
  });

  it('should let you configure the 1st excel sheet', function(next){
    var options = {
      layout : 'row',
      joinOn : 'Plant Number',
      metadata : true
    };

    SDK.ckan.processResource(pkg.getId(), resource.id, resource.datasheets[0].sheetId, options, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(typeof resp.result, 'object');

      resp = resp.result[0];

      assert.equal(resp.resourceId, resource.id);
      assert.equal(resp.sheetId, resource.datasheets[0].sheetId);
      assert.equal(resp.layout, 'row');
      assert.equal(resp.metadata, true);

      // set the update
      SDK.ds.setSheet(resp);
      next();
    });
  });

  it('should let you configure the 2nd excel sheet', function(next){
    var options = {
      layout : 'row',
      joinOn : 'Plant Number',
      metadata : true
    };

    SDK.ckan.processResource(pkg.getId(), resource.id, resource.datasheets[1].sheetId, options, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(typeof resp.result, 'object');

      resp = resp.result[0];

      assert.equal(resp.resourceId, resource.id);
      assert.equal(resp.sheetId, resource.datasheets[1].sheetId);
      assert.equal(resp.layout, 'row');
      assert.equal(resp.metadata, true);

      // set the update
      SDK.ds.setSheet(resp);
      next();
    });
  });

  it('should let you configure the 3rd excel sheet', function(next){
    var options = {
      layout : 'row'
    };

    SDK.ckan.processResource(pkg.getId(), resource.id, resource.datasheets[2].sheetId, options, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(typeof resp.result, 'object');

      resp = resp.result[0];

      assert.equal(resp.resourceId, resource.id);
      assert.equal(resp.sheetId, resource.datasheets[2].sheetId);
      assert.equal(resp.layout, 'row');

      // set the update
      SDK.ds.setSheet(resp);
      next();
    });
  });


  it('should let get spectra with joined data', function(next){
    SDK.ckan.getSpectra(pkg.getId(), resource.id, resource.datasheets[2].sheetId, 0, function(resp){
      assert.equal(resp['Plant Number'], firstSpectraId);
      assert.equal(resp['Plot Name'], 'Walnut Street Greenhouse');
      assert.equal(resp['Common Name'], 'Soybean'); // USDA Join
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
