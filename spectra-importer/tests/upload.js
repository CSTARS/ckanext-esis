var Browser = require('zombie');
var assert  = require('assert');



Browser.visit("http://localhost:3000/test.html", { 
    debug: true, runScripts: true, waitFor : '10s', maxWait : '10s' ,
        'function' : function(arg1, arg2, arg3, arg4) {
            return arg1;
        }
    },
             function (e, browser, status) {
    

    /*assert.ifError(e);
    console.log(status);*/

    browser.window.document.addEventListener('polymer-ready', function(){
        console.log('Polymer is READY!!!')
    });


    browser.wait('15s', function(){
        console.log('I am done waiting...');
        setTimeout(function(){
            console.log('Where we at?');

        }.bind(this), 5000);
    });

    
});