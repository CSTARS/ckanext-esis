var rest = require('./rest');

var EventEmitter = require("events").EventEmitter;
var ee = new EventEmitter();




rest.getUserInfo(function(resp){
    console.log(resp);
});


var app = {
    rest : rest,
    on : function(e, fn) {
        ee.on(e, fn);
    }
}

module.exports = app;