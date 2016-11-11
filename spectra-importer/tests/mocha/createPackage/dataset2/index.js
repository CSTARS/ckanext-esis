var assert = require('assert');

describe('Create Package - Dataset 2 (excel test)', function() {
  var data, SDK, pkg;

  before(function(){
    data = require('./data/datasetInfo');
    SDK = require('../../newSDK')();
    pkg = SDK.newPackage();
  });

  // test for invalid titles as well
  it('can set valid title', function(next){
    pkg.setTitle(data.title, function(err, resp){
      assert.equal(err, null);
      assert.equal(data.title, pkg.getTitle());
      assert.equal(data.name, pkg.getName());
      next();
    });
  });

  // IMPORTANT!
  it('can set testing flag', function(){
    pkg._setTesting();
    assert(pkg.getExtra('_testing_'), true);
  });

  it('can set valid description', function(){
    pkg.setDescription(data.description);
    assert.equal(data.description, pkg.getDescription());
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
    assert.equal(pkg.hasKeyword('zzzzzzz'), false);
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

  it('can set the Theme', function(){
    pkg.setTheme(data.Theme);
    assert.deepEqual(pkg.getTheme(), data.cleanTheme);
  });

  it('can set the Ecosystem Type', function(){
    pkg.setEcosystemType(data.EcosystemType);
    assert.deepEqual(pkg.getEcosystemType(), data.cleanEcosystemType);
  });

  it('can set the Sample Platform', function(){
    pkg.setSamplePlatform(data.SamplePlatform);
    assert.deepEqual(pkg.getSamplePlatform(), data.SamplePlatform);
  });

  it('can set the Author', function(){
    pkg.setAuthor(data.Author);
    assert.equal(pkg.getAuthor(), data.Author);
    assert.equal(pkg.data.author, data.Author);
  });

  it('can set the Author Email', function(){
    pkg.setAuthorEmail(data.AuthorEmail);
    assert.equal(pkg.getAuthorEmail(), data.AuthorEmail);
    assert.equal(pkg.data.author_email, data.AuthorEmail);
  });

  it('can set the Maintainer', function(){
    pkg.setMaintainer(data.Maintainer);
    assert.equal(pkg.getMaintainer(), data.Maintainer);
    assert.equal(pkg.data.maintainer, data.Maintainer);
  });

  it('can set the Maintainer Email', function(){
    pkg.setMaintainerEmail(data.MaintainerEmail);
    assert.equal(pkg.getMaintainerEmail(), data.MaintainerEmail);
    assert.equal(pkg.data.maintainer_email, data.MaintainerEmail);
  });

  it('can create dataset', function(next){
    this.timeout(10000);

    pkg.create(function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(typeof resp.id, 'string');
      next();
    });
  });

});

require('./process');
require('./search');
