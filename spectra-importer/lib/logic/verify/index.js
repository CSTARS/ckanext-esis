module.exports = function(SDK) {
  SDK.verify = {
    name : require('./name')(SDK)
  };
};
