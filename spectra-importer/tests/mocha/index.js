var conf = require('/etc/ecosis/testingConf');
var SDK = require('../../lib');

var app = new SDK(conf);

app.on('user-load', function(){
  console.log(app.user);
});
