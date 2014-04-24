esis.structures.importer = (function() {

	var files = [];

	function getFiles() {
		return files;
	}

	// fileObj - FileReader file object
	// parseZip - boolean, parse zip into sepreate resource files if found
	function addFile(fileObj, parseZip) {
		var file = new esis.structures.File(fileObj, parseZip);
		files.push(file);
	}

	function showSpectra() {
		_createSpectraElements(_getAndJoinSpectra());
	}

	function _getAndJoinSpectra() {
		var spectra = [];
		var joindata = [];

		// gather all spectra and join data
		for( var i = 0; i < files.length; i++ ) {
			var datasheets = files[i].getDatasheets();

			for( var j = 0; j < datasheets.length; j++ ) {
				var arr = datasheets[j].getSpectra();
				var jd = datasheets[j].getJoinableMetadata();
				if( jd ) joindata.push(jd);

				for( var z = 0; z < arr.length; z++ ) spectra.push(arr[z]);
			}
		}

		// join metadata
		for( var i = 0; i < joindata.length; i++ ) {
			for( var j = 0; j < spectra.length; j++ ) {
				joindata[i].join(spectra[j]);
			}
		}
		return spectra;
	}

	function _createSpectraElements(spectra) {
  		var row1 = '';
  		var row2 = '';

  		var c = 0;
  		for( var i = 0; i < spectra.length; i++ ) {
			var card = _createCard(spectra[i]);

			if( c % 2 == 0 ) row1 += card;
			else row2 += card; 
			c++;
    	}

  		$('#spectra-status-content').html(
  			'<h2>'+c+' Spectra Found</h2>'+
            '<div>'+
              '<span class="label label-success">File Level Metadata</span> ' +
              '<span class="label label-info">Spectra Level Metadata</span> ' +
              '<span class="label label-warning">Linked Metadata</span> ' +
            '</div>'+
  			'<div class="row-fluid">' +
  				'<div class="span6">'+row1+'</div>'+
  				'<div class="span6">'+row2+'</div>'+
  			'</div>'
  		);
  	}

  	function _createCard(spectra) {
  		var card = '<div class="card"><h4><span style="color:#888">From -</span> '+spectra.getFilename()+'</h4>'+
                '<div style="max-height:300px;overflow:auto"><table class="table" style="font-size:12px">';

        var metadata = spectra.getMetadata();

  		// add global metadata
  		for( var key in metadata.file ) {
  			card += '<tr><td><span class="label label-success">'+key+'</span></td><td>'+metadata.file[key]+'</td></tr>';
  		}
  		for( var key in metadata.joined ) {
  			card += '<tr><td><span class="label label-warning">'+key+'</span></td><td>'+metadata.joined[key]+'</td></tr>';
  		}
  		for( var key in metadata.spectra ) {
  			card += '<tr><td><span class="label label-info">'+key+'</span></td><td>'+metadata.spectra[key]+'</td></tr>';
  		}

  		card += '</table></div>';

  		card += '<div style="margin:10px;max-height:300px;overflow:auto">'+
  				JSON.stringify(spectra.getData()).replace(/],/g,'],<br />')+'</div>';

  		card += '</div>';
  		return card;
    }
	
	function addToCkan(btn) {
		var resources = _getCkanResources();
		resources.push(_createSpectraJsonResource());

		btn.addClass('disabled').html('Adding...');
		_addResourceToCkan(0, 'test-upload-5', resources, btn);
	}

	function _addResourceToCkan(index, pkg, resources, btn) {
		if( index == resources.length ) {
			btn.removeClass('disabled').html('Add Resources');
		} else {
			btn.html('Uploading '+resources[index].getFilename()+'... ');

			esis.uploader.upload(pkg, resources[index], function() {
				index++;
				_addResourceToCkan(index, pkg, resources, btn);
			});
		}
	}

	function _getCkanResources() {
		var resources = [], arr;

		for( var i = 0; i < files.length; i++ ) {
			arr = files[i].getResources();
			for( var j = 0; j < arr.length; j++ ) resources.push(arr[j]);
		}

		return resources;				
	}

	function _createSpectraJsonResource() {
		var spectra = _getAndJoinSpectra();

		var data = [], metadata;
		for( var i = 0; i < spectra.length; i++ ) {
			data.push({
				metadata : spectra[i].getJoinedMetadata(),
				spectra : spectra[i].getData(),
			})
		}

		var resource = new esis.structures.Resource();
		resource.setContents(JSON.stringify(data));
		resource.setFilename('esis_spectral_data.json');
		resource.setMimetype('application/json');
		return resource;
	}

	return {
		getFiles : getFiles,
		addFile : addFile,
		showSpectra : showSpectra,
		addToCkan : addToCkan
	}
})();