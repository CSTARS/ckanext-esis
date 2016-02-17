var SDK = require('../../lib');
var config = require('/etc/ecosis/testingConf');

module.exports = function() {
  return new SDK(config);
};
