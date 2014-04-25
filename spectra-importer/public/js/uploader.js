esis.uploader = (function(){


	function upload(pkg, resource, callback) {
        // TODO: if this fails, we have an issue on our hands
    	var formData = new FormData();

        if( __ckan_ && __ckan_.package ) pkg = __ckan_.package.id;

    	formData.append('package_id', pkg);
    	formData.append('mimetype',resource.getMimetype());
    	formData.append('name', resource.getFilename());
    	formData.append('upload', new Blob([resource.getContents()], {type: resource.getMimetype()}), resource.getFilename());

        var key = esis.key;
        if( __ckan_ && __ckan_.user ) key = __ckan_.user.apikey;

    	$.ajax({
		    url: (esis.server ? esis.server : '') + '/api/action/resource_create',
		    type: "POST",
		    data: formData,
		    processData: false,
		    contentType: false,
		    beforeSend: function (request) {
                request.setRequestHeader('Authorization', key);
          	},
		    success: function() {
		        callback();
		    },
		    error : function(resp) {
                statusCallback.onFileError(f.file.name);
		        callback(true);
		    }
		});
    }

    return {
        upload : upload
    }

})();