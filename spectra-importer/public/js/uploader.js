esis.uploader = (function(){

    function _getKey() {
        var key = esis.key;
        if( window.__ckan_ && window.__ckan_.user ) key = __ckan_.user.apikey;
        return key;
    }


	function upload(pkg, resource, callback, isSpectra) {
        // TODO: if this fails, we have an issue on our hands
    	var formData = new FormData();

        if( window.__ckan_ && __ckan_.package ) pkg = __ckan_.package.id;

        var filename = resource.getFilename().replace(/.*\//,'');
        if( filename.length == 0 ) {
            callback();
            return;
        }

    	formData.append('package_id', pkg);
    	formData.append('mimetype',resource.getMimetype());
    	formData.append('name', filename);
    	formData.append('upload', new Blob([resource.getContents()], {type: resource.getMimetype()}), filename);

    	$.ajax({
		    url: esis.host + (isSpectra ? '/spectra/add' : '/api/action/resource_create'),
		    type: "POST",
		    data: formData,
		    processData: false,
		    contentType: false,
		    beforeSend: function (request) {
                request.setRequestHeader('Authorization', _getKey());
          	},
		    success: function(response, status) {
                if( response.success ) {
                    if( response.result.name != 'esis_spectral_data.zip' ) {
                        resource.setCkanId(response.result.id);
                    }
		            callback();
                } else {
                    callback(true);
                }
		    },
		    error : function(resp) {
		        callback(true);
		    }
		});
    }

    // clean spectra first
    function uploadSpectraResource(pkg, resource, btn, callback) {
        if( btn ) btn.html('cleaning old spectral data...');
        $.ajax({
            url: esis.host + '/api/action/package_show?id='+pkg,
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', _getKey());
            },
            success: function(response) {
                _removeSpectraResources(0, response.result.resources, function(){
                    if( btn ) btn.html('uploading new spectral data...');

                    // now upload
                    upload(pkg, resource, callback, true);
                });
            }
        });
    }

    function _removeSpectraResources(index, resources, callback) {
        if( index == resources.length ) {
            callback();
        } else if ( resources[index].name == 'esis_spectral_data.zip' ) {
            $.ajax({
                type: 'POST',
                url: esis.host + '/api/action/resource_delete',
                data : JSON.stringify({id : resources[index].id }),
                beforeSend: function (request) {
                    request.setRequestHeader('Authorization', _getKey());
                },
                success: function(response) {
                    index++;
                    _removeSpectraResources(index, resources, callback);
                }
            });
        } else {
            index++;
            _removeSpectraResources(index, resources, callback);
        }
    }

    return {
        upload : upload,
        uploadSpectraResource : uploadSpectraResource
    }

})();