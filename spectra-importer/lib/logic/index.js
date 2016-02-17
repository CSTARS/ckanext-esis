module.exports = function(SDK) {
  require('./createPackage')(SDK);
  require('./verify')(SDK);
};
