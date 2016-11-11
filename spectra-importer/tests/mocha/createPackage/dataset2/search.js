var assert = require('assert');
var request = require('superagent');

describe('Search - Dataset 2', function() {
  var config, data, pkg;

  before(function(){
    config = require('/etc/ecosis/testingConf');
    data = require('./data/datasetInfo');
  });

  it('just wait a sec and let Mongo do it\'s thing', function(next){
    this.timeout(15000);
    setTimeout(function(){
      assert(true);
      next();
    }, 14000);
  });

  it('should find dataset 2 in search', function(next){
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

  it('should get dataset 2 via api', function(next){
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
        assert.equal(resp.ecosis.spectra_count, 20);
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
        assert.equal(resp.body.total, 20);
        resp = resp.body.items[0];

        assert.equal(resp['Plant Number'], 'P1');
        assert.equal(resp['Plot Name'], 'Walnut Street Greenhouse');
        assert.equal(resp['Common Name'], 'Soybean'); // USDA Join
        assert.equal(Object.keys(resp.datapoints).length, 2151);

        next();
      });
  });

});
