esis.structures.importer = (function() {

	var files = [];
	var TEST_PACKAGE = 'test-upload-5';

	var currentSpectra = [];

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
		currentSpectra = _getAndJoinSpectra();
		createSpectraElement(0);
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

	function createSpectraElement(index) {
  		var html = _createCard(currentSpectra[index], index, currentSpectra.length);


  		$('#spectra-status-content').html(
  			'<h2>'+currentSpectra.length+' Spectra Found</h2>'+
            '<div>'+
              '<span class="label label-success">File Level Metadata</span> ' +
              '<span class="label label-info">Spectra Level Metadata</span> ' +
              '<span class="label label-warning">Linked Metadata</span> ' +
              '<br /><span style="color:#888;text-size:12px">* = Custom field, custom fields will still be stored, but if the field maps to an Ecosis Attribute, please fill out'+
              ' and upload a metadata map on the previous screen.</span>' +
            '</div>'+
            '<div class="pull-right"><select id="paging-select"></select></div>'+
            '<div class="pagination"><ul id="paging-btns" ></ul></div>'+
  			html
  		);

  		updatePaging(index, currentSpectra.length);
  	}

  	function _createCard(spectra, index, total) {
  		var card = '<div class="card spectra-card" id="card-'+index+'-'+total+'" style="display:none" ><h4><span style="color:#888">From -</span> '+spectra.getFilename()+'</h4>'+
                '<div style=""><table class="table" style="font-size:12px">';

        var metadata = spectra.getMetadata();

        var c = 0;

  		// add global metadata
  		for( var key in metadata.file ) {
  			var keyname = key;
  			var mappedKey = esis.app.mapMetadata(key);
  			if( mappedKey && mappedKey != key ) keyname = mappedKey+' ('+key+')';
  			else if( !esis.app.isEcosisMetadata(key) ) keyname = '* '+key;
  			card += '<tr><td><span class="label label-success">'+keyname+'</span></td><td>'+metadata.file[key]+'</td></tr>';
  			c++;
  		}
  		for( var key in metadata.joined ) {
  			var keyname = key;
  			var mappedKey = esis.app.mapMetadata(key);
  			if( mappedKey && mappedKey != key ) keyname = mappedKey+' ('+key+')';
  			else if( !esis.app.isEcosisMetadata(key) ) keyname = '* '+key;
  			card += '<tr><td><span class="label label-warning">'+keyname+'</span></td><td>'+metadata.joined[key]+'</td></tr>';
  			c++;
  		}
  		for( var key in metadata.spectra ) {
  			var keyname = key;
  			var mappedKey = esis.app.mapMetadata(key);
  			if( mappedKey && mappedKey != key ) keyname = mappedKey+' ('+key+')';
  			else if( !esis.app.isEcosisMetadata(key) ) keyname = '* '+key;
  			card += '<tr><td><span class="label label-info">'+keyname+'</span></td><td>'+metadata.spectra[key]+'</td></tr>';
  			c++;
  		}

  		if( c == 0) {
  			card += '<tr><td colspan="2"><div class="alert alert-info">No Metadata</div></td></tr>';
  		}

  		card += '</table></div>';

  		card += '<div style="margin:10px;max-height:300px;overflow:auto">'+
  				JSON.stringify(spectra.getData()).replace(/],/g,'],<br />')+'</div>';

  		card += '</div>';
  		return card;
    }

    function updatePaging(cPage, numPages) {
		var buttons = [];

		// going to show 7 buttons
		var startBtn = cPage - 3;
		var endBtn = cPage + 3;

		if( endBtn > numPages ) {
			startBtn = numPages-7;
			endBtn = numPages;
		}
		if( startBtn < 0 ) {
			startBtn = 0;
			endBtn = 6;
			if( endBtn > numPages ) endBtn = numPages;
		}

		var panel = $("#paging-btns");
		panel.html("");

		// add back button
		if( cPage != 0 ) {
			panel.append($('<li><a '+_createPagingClick(cPage-1)+'>&#171;</a></li>'));
		}

		for( var i = startBtn; i < endBtn; i++ ) {
			var label = i+1;

			var btn = $("<li><a "+_createPagingClick(i)+">"+label+"</a></li>");
			if( cPage == i ) btn.addClass('active');
			panel.append(btn);
		}

		// add next button
		if(  cPage != numPages-1 && numPages != 0 ) {
			panel.append($("<li><a "+_createPagingClick(cPage+1)+">&#187;</a></li>"));
		}

		var select = $("#paging-select");
		for( var i = 0; i < numPages; i++ ) {
			select.append('<option value="'+i+'" '+(i == cPage ? 'selected' : '')+'>'+(i+1)+'</option>');
		}
		select.on('change', function(e){
			esis.structures.importer.createSpectraElement($(this).val());
		});

		$('.spectra-card').hide();
		$('#card-'+cPage+'-'+numPages).show();
	}

	function _createPagingClick(page, total) {
		return 'onclick="esis.structures.importer.createSpectraElement('+page+');"';
	}
	
	function addToCkan(btn) {
		var resources = _getCkanResources();
		resources.push(_createSpectraJsonResource());

		btn.addClass('disabled').html('Adding...');
		_addResourceToCkan(0, TEST_PACKAGE, resources, btn);
	}

	function _addResourceToCkan(index, pkg, resources, btn) {
		if( index == resources.length ) {
			btn.removeClass('disabled').html('Add Resources');
			window.location = "/dataset/new_metadata/"+__ckan_.package.name;
		} else {
			btn.html('Uploading '+resources[index].getFilename().replace(/.*\//,'')+'... ');

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

		var data = [];
		for( var i = 0; i < spectra.length; i++ ) {
			var d = {
				metadata : spectra[i].getJoinedMetadata(),
				spectra_id : md5(JSON.stringify(spectra[i].getData())),
				spectra : spectra[i].getData(),
				ecosis : {}
			};

			// now set the ecosis attributes
			for( var key in d.metadata ) {
				if( esis.app.isEcosisMetadata(key) ) {
					d.ecosis[key] = d.metadata[key];
					// in this case their value is our value, so delete their value
					delete d.metadata[key];
				} else if( esis.app.mapMetadata(key) ) {
					var ecosisKey = esis.app.mapMetadata(key);
					d.ecosis[ecosisKey] = d.metadata[key];
				}
			}

			data.push(d);
		}

		data = {
			data : data,
			map  : esis.app.getMetadataMap()
		}

		// we need to clean all of the attribute here ...
		for( var i = 0; i < data.data.length; i++ ) {
			var metadata = data.data[i].metadata;
			for( var key in metadata ) {
				var tmp = key.replace(/[^A-Za-z\s_-]/g, '');
				if( tmp != key ) {
					if( metadata[tmp] ) {
						alert('Metadata Error: the attribute "'+key+'" has illegal characters.  Attempted to clean up key to "'+
							tmp+'" but this key already exists.');
						return;
					}

					metadata[tmp] = metadata[key];
					delete metadata[key];
				}
			}
		}

		// TODO: if you find spectra with the same id, user needs to 
		// define a disambiguator field

		var resource = new esis.structures.Resource();
		resource.setContents(JSON.stringify(data));
		resource.setFilename('esis_spectral_data.json');
		resource.setMimetype('application/json');
		return resource;
	}

	var infoTimer = -1;
	function updateInfo() {
		if( infoTimer != -1 ) {
			clearTimeout(infoTimer);
		}

		infoTimer = setTimeout(function(){
			infoTimer = -1;
			_runUpdateInfo();
		}, 300);
	}

	function _runUpdateInfo() {
		var info = "";
		var sCount = 0;
		var rCount = 0;

		for( var i = 0; i < files.length; i++ ) {
			var datasheets = files[i].getDatasheets();
			rCount += files[i].getResources().length;

			for( var j = 0; j < datasheets.length; j++ ) {
				sCount += datasheets[j].getSpectra().length;
			}
		}

		$('#stats').html('<h4>Upload Information</h4>'+
			'<div>Spectra: '+sCount+'</div>'+
			'<div>Resources: '+rCount+'</div>').show('slow');
	}


	return {
		getFiles : getFiles,
		addFile : addFile,
		showSpectra : showSpectra,
		addToCkan : addToCkan,
		updateInfo : updateInfo,
		createSpectraElement : createSpectraElement
	}
})();