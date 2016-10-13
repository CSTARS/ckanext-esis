var assert = require('assert');
var request = require('superagent');

describe('Search - Dataset 1', function() {
  var config, data, pkg;

  before(function(){
    config = require('/etc/ecosis/testingConf');
    data = require('./data/datasetInfo');
  });

  it('just wait a sec and let Mongo do it\'s thing', function(next){
    this.timeout(10000);
    setTimeout(function(){
      assert(true);
      next();
    }, 9000);
  });

  it('should find the dataset in search', function(next){
    var query = {
      text : '',
      filters : JSON.stringify([{'ecosis.package_title': data.title}]),
      start : 0,
      stop : 6
    };

    request
      .get(config.search+'/mqe/query')
      .query(query)
      .end(function(err, resp){
        assert.equal(err, null);
        resp = resp.body;

        assert.equal(resp.items.length, 1);
        pkg = resp.items[0];

        assert.equal(pkg.ecosis.package_title, data.title);
        next();
      });
  });

  it('should get the dataset via api', function(next){
    var query = {
      package_id : pkg._id
    };

    request
      .get(config.search+'/mqe/get')
      .query(query)
      .end(function(err, resp){
        assert.equal(err, null);
        resp = resp.body;

        assert.deepEqual(resp.Keywords, pkg.Keywords);
        assert.equal(resp.ecosis.spectra_count, 31);
        assert.equal(resp.ecosis.title, pkg.ecosis.title);

        pkg = resp;

        next();
      });
  });

  it('should get spectra via api', function(next){
    var query = {
      package_id : pkg.ecosis.package_id,
      start : 0,
      stop : 1
    };

    request
      .get(config.search+'/spectra/query')
      .query(query)
      .end(function(err, resp){
        assert.equal(err, null);
        assert.equal(resp.body.items.length, 1);
        assert.equal(resp.body.start, 0);
        assert.equal(resp.body.stop, 1);
        assert.equal(resp.body.total, 31);
        resp = resp.body.items[0];

        assert.equal(resp.plot, 'AK01');
        assert.equal(resp.spectra, 'AK01_ACRU_B_LC_REFL');
        assert.equal(resp.instrumentation, 'ASD FieldSpec 3');
        assert.equal(resp['Latin Species'], 'rubrum');
        assert.equal(resp['USDA Symbol'], 'ACRU');
        assert.equal(Object.keys(resp.datapoints).length, 2151);

        next();
      });
  });

});
