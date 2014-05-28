esis.existingData = (function(){

	var data;

	function _getKey() {
        var key = esis.key;
        if( window.__ckan_ && window.__ckan_.user ) key = __ckan_.user.apikey;
        return key;
    }

	function init() {
		$('#existing-spectra').html('Checking for exisiting spectra...');

		_findSpectraPackage();
	}

	function _findSpectraPackage() {
		$.ajax({
            url: esis.host + '/api/action/package_show?id='+esis.structures.importer.getPackageName(),
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', _getKey());
            },
            success: function(response) {
                if( response.success ) {
                	if( !response.result.resources ) {
                		return _done();
                	} else if ( response.result.resources.length == 0 ) {
                		return _done();
                	}

                	for( var i = 0; i < response.result.resources.length; i++ ) {
                		if( response.result.resources[i].name == 'esis_spectral_data.json' ) {
                			return _getSpectraPackage(response.result.resources[i].id);
                		}
                	}
                } else {
                	_done();
                }
            }
        });
	}

	function _getSpectraPackage(id) {
		$('#existing-spectra').html('Spectra found, importing...');
		$.ajax({
            url: esis.host + '/spectra/get?id='+id,
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', _getKey());
            },
            success: function(response) {
            	if( typeof response == 'string' ) data = JSON.parse(response);
            	else data = JSON.parse(response);

            	console.log(data);
            	_done(); 
            }
        });
	}

	function _done() {
		$('#existing-spectra').html('Done.');
	}

	return {
		init : init
	}

})();