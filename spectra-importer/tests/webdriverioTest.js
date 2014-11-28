var webdriverio = require('webdriverio'),
    assert      = require('assert');

var ckanUrl = 'http://192.168.1.4:5000/';
var devUrl = 'http://localhost:3000/';

describe('CKAN Dataset Importer Tests', function(){

    this.timeout(99999999);
    var client = {};

    before(function(done){
        client = webdriverio.remote({ desiredCapabilities: {browserName: 'chrome'} });
        require('./injectPolymerHelpers').init(client);
        client.init(done);
    });

    before(function(done){
        // inject selenium ns
        client.execute(function(){
            window.selenium = {};
        }, done);
    });

    it('should redirect to editor',function(done) {
        client.url(devUrl+'editor')            
            .getTitle(function(err, title) {
                assert(err === undefined);
                assert(title === 'Ecosis Dataset Editor');
            })
            .call(done);
    });

    it('should fill in dataset title',function(done) {
        client
            .pause(2000)
            .polymerSetValue('esis-datastore', 'data.title', 'mocha-testing')
            .polymerGetValue('esis-datastore', 'data.title',
                function(err, value){
                    assert(err == null);
                    assert(value == 'mocha-testing');
                }
            ).call(done);
    });

    // TODO: need to figure out how to set license 
    it('should fill in dataset attributes',function(done) {
        client
            .polymerSetValue('esis-datastore', 'data.notes', 'mocha-testing description')
            .polymerSetValue('esis-datastore', 'data.author', 'mocha')
            .polymerSetValue('esis-datastore', 'data.author_email', 'mocha@email.internet')
            .polymerSetValue('esis-datastore', 'data.maintainer', 'webdriverio')
            .polymerSetValue('esis-datastore', 'data.maintainer_email', 'webdriverio@email.internet')
            
            .polymerGetValue('esis-datastore', 'data.notes',
                function(err, value){
                    assert(err == null);
                    assert(value == 'mocha-testing description');
                }
            )
            .polymerGetValue('esis-datastore', 'data.author',
                function(err, value){
                    assert(err == null);
                    assert(value == 'mocha');
                }
            )
            .polymerGetValue('esis-datastore', 'data.author_email',
                function(err, value){
                    assert(err == null);
                    assert(value == 'mocha@email.internet');
                }
            )
            .polymerGetValue('esis-datastore', 'data.maintainer',
                function(err, value){
                    assert(err == null);
                    assert(value == 'webdriverio');
                }
            )
            .polymerGetValue('esis-datastore', 'data.maintainer_email',
                function(err, value){
                    assert(err == null);
                    assert(value == 'webdriverio@email.internet');
                }
            )
            .call(done);
    });

    // TODO: need to set group information for public / private


    it('should add testing datasheet',function(done) {
        client
            .setHash('#new-resources')
            .pause(500)
            .chooseFile('#addFileTesting', './sampleData/t_data.csv')
            .call(done);
    });

    it('should add testing metadata',function(done) {
        client
            .pause(500)
            .chooseFile('#addFileTesting', './sampleData/t_meta.csv')
            .call(done)
    });

    it('should select the metadata sheet and set as metadata and join info',function(done) {
        client
            .pause(1000)
            .polymerSetValue('html /deep/ esis-add-resource', 'selectedSheetIndex', 1)
            .pause(500)
            .polymerSetValue('html /deep/ esis-add-resource /deep/ esis-ui-datasheet', 'datasheet.isMetadata', true)
            .pause(700)
            .polymerSetValue('html /deep/ esis-add-resource /deep/ esis-ui-datasheet', 'datasheet.metadata.joinId', 'spectra')
            .call(done)
    });

    it('should add attribute map',function(done) {
        client
            .chooseFile('#addAttrMap', './sampleData/t_map')
            .call(done);
    });

    it('verify all dataset information is correct',function(done) {
        client
            .pause(1000)
            .timeoutsAsyncScript(20000)
            .executeAsync(function(callback){
                document.querySelector('esis-dataset-creator')
                    ._createMeasurementJson('mocha-testing', callback);
            }, function(err, resp){
                var arr = resp.value;

                assert(arr.length == 31);
                assert(arr[0].datapoints.length == 2151);
                assert(arr[0].spectra == 'AK01_ACRU_B_LC_REFL');
                assert(arr[1]['Common Name'] == 'red maple');
            })
            .call(done)
    });

    after(function(done) {
        client.end(done);
        //done();
    });
});