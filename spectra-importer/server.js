var express = require('express');
var app = express();

var dir = __dirname + '/dist';
process.argv.forEach(function(val){
    if( val == '--dev' ) dir = __dirname + '/app';
    else if( val == '--tutorial' ) dir = __dirname + '/../tutorial';
});

app.use(express.static(dir));
app.listen(3000);

console.log('Serving '+dir+' @ http://localhost:3000');
