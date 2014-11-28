var assert = require('assert'),
    test = require('selenium-webdriver/testing'),
    webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;

var url = 'http://192.168.1.4:5000/';

test.describe('CKAN Dataset Editor', function() {
    var driver;
    this.timeout(9999999);

    test.before(function(){
        driver = new webdriver.Builder().
               withCapabilities(webdriver.Capabilities.chrome()).
               build();
    });

    /*test.it('get to login page', function() {
        driver.get(url+'user/login');
        driver.wait(until.titleIs('Login - CKAN'), 1000);
    });

    test.it('should login', function() {
        driver.findElement(By.id('field-login')).sendKeys('jrmerz');
        driver.findElement(By.id('field-password')).sendKeys('');

        driver.findElement(By.css('button.btn[type="submit"]')).then(function(el){
            el.click();
        });
    });

    test.it('is logged in', function(done) {
        driver.executeScript('return document.title').then(function(title){
            assert.equal(title, 'Manage - jrmerz - Users - CKAN');
            done();
        });
    });*/

    test.it('should redirect to editor', function(){
        driver.get(url+'dataset/new');
        driver.wait(until.titleIs('Ecosis Dataset Editor'), 2000);
    });

    test.it('should fill in title', function(done){
        // give some time to load
        driver.sleep(3000);



        driver.executeScript('return document.querySelector(\'esis-scaffold /deep/ paper-input-decorator [label="Title"] input\')').then(function(el){
            assert.notEqual(null, el);
            //el.sendKeys('mocha-tests');
            //assert.equal(el.getAttribute("value"), 'mocha-tests');
            //assert.equal(-1, 1);
        });

    });

    test.after(function() { 
        driver.quit(); 
    });
});