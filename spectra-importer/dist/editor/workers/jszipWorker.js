importScripts('../components/jszip/dist/jszip.min.js');
postMessage({t:"ready"});

onmessage = function (oEvent) {
  var zip = new JSZip(oEvent.data.contents);
  postMessage({zip:zip});
};