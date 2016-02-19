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
      assert.equal(data.name, pkg.getName());
      next();
    });
  });

  it('can set testing flag', function(){
    pkg._setTesting();
    assert(pkg.getExtra('_testing_'), true);
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

  it('can set the Theme', function(){
    pkg.setTheme(data.Theme);
    assert.deepEqual(pkg.getTheme(), data.cleanTheme);
    assert.deepEqual(pkg.getThemeOther(), data.cleanThemeOther);
  });

  it('can set the Ecosystem Type', function(){
    pkg.setEcosystemType(data.EcosystemType);
    assert.deepEqual(pkg.getEcosystemType(), data.cleanEcosystemType);
  });

  it('can set the Acquisition Method', function(){
    pkg.setAcquisitionMethod(data.AcquisitionMethod);
    assert.deepEqual(pkg.getAcquisitionMethod(), data.cleanAcquisitionMethod);
    assert.deepEqual(pkg.getAcquisitionMethodOther(), data.cleanAcquisitionMethodOther);
  });

  it('can set the Sample Platform', function(){
    pkg.setSamplePlatform(data.SamplePlatform);
    assert.deepEqual(pkg.getSamplePlatform(), data.SamplePlatform);
  });

  it('can set the Measurement Venue', function(){
    pkg.setMeasurementVenue(data.MeasurementVenue);
    assert.deepEqual(pkg.getMeasurementVenue(), data.cleanMeasurementVenue);
    assert.deepEqual(pkg.getMeasurementVenueOther(), []);
  });

  it('can set the Measurement Venue', function(){
    pkg.setMeasurementVenue(data.MeasurementVenue);
    assert.deepEqual(pkg.getMeasurementVenue(), data.cleanMeasurementVenue);
    assert.deepEqual(pkg.getMeasurementVenueOther(), []);
  });

  it('can set the Target Type', function(){
    pkg.setTargetType(data.TargetType);
    assert.deepEqual(pkg.getTargetType(), data.cleanTargetType);
    assert.deepEqual(pkg.getTargetTypeOther(), []);
  });

  it('can set the Index Name', function(){
    pkg.setIndexName(data.IndexName);
    assert.deepEqual(pkg.getIndexName(), data.cleanIndexName);
  });

  it('can set the Measurement Units', function(){
    pkg.setMeasurementUnits(data.MeasurementUnits);
    assert.equal(pkg.getMeasurementUnits(), data.MeasurementUnits);

    pkg.setMeasurementUnits('foobar');
    assert.equal(pkg.getMeasurementUnits(), '');

    pkg.setMeasurementUnits(data.MeasurementUnits);
  });

  it('can set the Target Status', function(){
    pkg.setTargetStatus(data.TargetStatus);
    assert.deepEqual(pkg.getTargetStatus(), data.cleanTargetStatus);
  });

  it('can set the Light Source Specifications', function(){
    pkg.setLightSourceSpecifications(data.LightSourceSpecifications);
    assert.deepEqual(pkg.getLightSourceSpecifications(), data.LightSourceSpecifications);
  });

  it('can set the Foreoptic Type', function(){
    pkg.setForeopticType(data.ForeopticType);
    assert.deepEqual(pkg.getForeopticType(), data.cleanForeopticType);
    assert.deepEqual(pkg.getForeopticTypeOther(), data.cleanForeopticTypeOther);
  });

  it('can set the Foreoptic Field of View', function(){
    pkg.setForeopticFieldofView(data.ForeopticFieldofView);
    assert.deepEqual(pkg.getForeopticFieldofView(), data.cleanForeopticFieldofView);
  });

  it('can set the Foreoptic Specifications', function(){
    pkg.setForeopticSpecifications(data.ForeopticSpecifications);
    assert.deepEqual(pkg.getForeopticSpecifications(), [data.ForeopticSpecifications]);
  });

  it('can set the Processing Averaged', function(){
    pkg.setProcessingAveraged(data.ProcessingAveraged);
    assert.deepEqual(pkg.getProcessingAveraged(), data.cleanProcessingAveraged);
  });

  it('can set the Processing Interpolated', function(){
    pkg.setProcessingInterpolated(data.ProcessingInterpolated);
    assert.deepEqual(pkg.getProcessingInterpolated(), data.cleanProcessingInterpolated);
  });

  it('can set the Processing Resampled', function(){
    pkg.setProcessingResampled(data.ProcessingResampled);
    assert.deepEqual(pkg.getProcessingResampled(), data.cleanProcessingResampled);
  });

  it('can set the Processing Information Details', function(){
    pkg.setProcessingInformationDetails(data.ProcessingInformationDetails);
    assert.equal(pkg.getProcessingInformationDetails(), data.ProcessingInformationDetails);
  });

  it('can set the Instrument Manufacturer', function(){
    pkg.setInstrumentManufacturer(data.InstrumentManufacturer);
    assert.deepEqual(pkg.getInstrumentManufacturer(), data.cleanInstrumentManufacturer);
  });

  it('can set the Instrument Model', function(){
    pkg.setInstrumentModel(data.InstrumentModel);
    assert.deepEqual(pkg.getInstrumentModel(), [data.InstrumentModel]);
  });

  it('can set the Instrument Serial Number', function(){
    pkg.setInstrumentSerialNumber(data.InstrumentSerialNumber);
    assert.deepEqual(pkg.getInstrumentSerialNumber(), data.cleanInstrumentSerialNumber);
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

  it('can set private', function(){
    pkg.setPrivate(true);
    assert.equal(pkg.isPrivate(), true);

    pkg.setPrivate(false);
    assert.equal(pkg.isPrivate(), false);
  });

  it('can create dataset', function(next){
    pkg.create(function(resp){
      assert.equal(resp.error, undefined);
      assert.equal(resp.success, true);
      next();
    });
  });

});

require('./process');
require('./search');
