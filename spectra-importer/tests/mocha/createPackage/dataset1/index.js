var assert = require('assert');

describe('Create Package - Dataset 1', function() {
  var data, SDK, pkg;

  before(function(){
    data = require('./data/datasetInfo');
    SDK = require('../../newSDK')();
    pkg = SDK.newPackage();
  });

  // test for invalid titles as well
  it('can set valid title', function(next){

    pkg.setTitle('foo', function(err){
      assert.equal(err.error, true);
      assert.equal(err.message, 'Invalid name.  Title must have at least 5 characters.');
    });

    pkg.setTitle('This is my really long title, wow this is a such a long title, who would use a title this long, some people might try??', function(err){
      assert.equal(err.error, true);
      assert.equal(err.message, 'Invalid name.  Title can have at most 100 characters.');
    });

    pkg.setTitle(data.title, function(err, resp){
      assert.equal(err, null);
      assert.equal(data.title, pkg.getTitle());
      assert.equal(data.title.toLowerCase().replace(/[^a-z0-9]/g,'-'), pkg.getName());
      next();
    });

  });

  it('can set valid description', function(){
    pkg.setDescription(data.description);
    assert.equal(data.description, pkg.getDescription());
  });

  it('can check for keyword badness', function(){
    pkg.addKeyword('f');
    assert.equal(pkg.getKeywords().length, 0);

    pkg.addKeyword('f#*(&)');
    assert.equal(pkg.getKeywords().length, 0);
  });

  it('can clean and set keywords', function(){
    pkg.setKeywords(data.keywords);
    assert.deepEqual(pkg.getKeywords(), data.cleanKeywords);

    pkg.setKeywords([]);
    assert.deepEqual(pkg.getKeywords(), []);

    pkg.setKeywords(data.cleanKeywords);
    assert.deepEqual(pkg.getKeywords(), data.cleanKeywords);
  });

  it('can add keywords', function(){
    pkg.addKeyword('testing');
    assert.equal(pkg.hasKeyword('testing'), true);
    assert.equal(pkg.hasKeyword('zzzzzzz'), false); // verify hasKeyword is actually working
  });

  it('can remove keywords', function(){
    pkg.removeKeyword('testing');
    assert.equal(pkg.hasKeyword('testing'), false);
  });

  it('can set license', function(){
    pkg.setLicense(data.license.id, data.license.title);
    assert.equal(pkg.getLicenseId(), data.license.id);
    assert.equal(pkg.getLicenseTitle(), data.license.title);
  });

  it('can set organization via name', function(next){
    pkg.setOrganization(data.organization, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(resp.success, true);
      assert.notEqual(pkg.getOrganization(), '');
      next();
    });
  });

  it('can set organization via id', function(next){
    var id = pkg.getOrganization();

    // verify we can clear an org
    pkg.setOrganization('');
    assert.equal(pkg.getOrganization(), '');

    pkg.setOrganization(id, function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(resp.success, true);
      assert.equal(pkg.getOrganization(), id);
      next();
    });
  });

  it('can set version', function(){
    pkg.setVersion(data.version);
    assert.equal(pkg.getVersion(), data.version);
  });

  it('can set website', function(){
    pkg.setWebsite(data.website);
    assert.equal(pkg.getWebsite(), data.website);
  });

  it('can set the theme', function(){
    pkg.setTheme(data.Theme);
    assert.deepEqual(pkg.getTheme(), data.cleanTheme);
  });

  it('can set the Sample Platform', function(){
    pkg.setSamplePlatform(data.SamplePlatform);
    assert.deepEqual(pkg.getSamplePlatform(), data.SamplePlatform);
  });

  it('can set the Ecosystem Type', function(){
    pkg.setEcosystemType(data.EcosystemType);
    assert.deepEqual(pkg.getEcosystemType(), data.cleanEcosystemType);
  });

});
