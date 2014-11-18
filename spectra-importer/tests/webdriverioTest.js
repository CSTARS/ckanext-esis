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

    it('should add testing datasheet',function(done) {
        client
            .setHash('#new-resources')
            .pause(500)
            .chooseFile('#addFileTesting', 
                './sampleData/t_data.csv',
                done
            );
    });

    after(function(done) {
        //client.end(done);
        done();
    });
});