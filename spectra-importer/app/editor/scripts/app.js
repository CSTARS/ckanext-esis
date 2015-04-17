var ecosis = (function(){
  var host = window.location.host.indexOf(':3000') > -1 ? 'http://192.168.1.4:5000' : '';

  function getVar(variable) {
    var query = window.location.search.substring(1);
  	var vars = query.split("&");
  	for (var i = 0; i < vars.length; i++) {
     		var pair = vars[i].split("=");
     		if( pair[0] == variable ) return pair[1];
  	}
  	return null;
  }

  var ecosis = new Ecosis({
    host : host,
    package_id : getVar('id')
  });

  return ecosis;
})();
