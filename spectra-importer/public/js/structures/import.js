esis.structures.importer = (function() {

	var files = [];
	var TEST_PACKAGE = 'test-upload-5';

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
  		var html = '';

  		for( var i = 0; i < spectra.length; i++ ) {
			html += _createCard(spectra[i], i, spectra.length);
    	}

  		$('#spectra-status-content').html(
  			'<h2>'+spectra.length+' Spectra Found</h2>'+
            '<div>'+
              '<span class="label label-success">File Level Metadata</span> ' +
              '<span class="label label-info">Spectra Level Metadata</span> ' +
              '<span class="label label-warning">Linked Metadata</span> ' +
            '</div>'+
            '<div class="pagination"><ul id="paging-btns" ></ul></div>'+
  			html
  		);

  		updatePaging(0, spectra.length);
  	}

  	function _createCard(spectra, index, total) {
  		var card = '<div class="card spectra-card" id="card-'+index+'-'+total+'" style="display:none" ><h4><span style="color:#888">From -</span> '+spectra.getFilename()+'</h4>'+
                '<div style=""><table class="table" style="font-size:12px">';

        var metadata = spectra.getMetadata();

        var c = 0;

  		// add global metadata
  		for( var key in metadata.file ) {
  			card += '<tr><td><span class="label label-success">'+key+'</span></td><td>'+metadata.file[key]+'</td></tr>';
  			c++;
  		}
  		for( var key in metadata.joined ) {
  			card += '<tr><td><span class="label label-warning">'+key+'</span></td><td>'+metadata.joined[key]+'</td></tr>';
  			c++;
  		}
  		for( var key in metadata.spectra ) {
  			card += '<tr><td><span class="label label-info">'+key+'</span></td><td>'+metadata.spectra[key]+'</td></tr>';
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
			panel.append($('<li><a '+_createPagingClick(cPage-1, numPages)+'>&#171;</a></li>'));
		}

		for( var i = startBtn; i < endBtn; i++ ) {
			var label = i+1;

			var btn = $("<li><a "+_createPagingClick(i, numPages)+">"+label+"</a></li>");
			if( cPage == i ) btn.addClass('active');
			panel.append(btn);
		}

		// add next button
		if(  cPage != numPages-1 && numPages != 0 ) {
			panel.append($("<li><a "+_createPagingClick(cPage+1, numPages)+">&#187;</a></li>"));
		}

		$('.spectra-card').hide();
		$('#card-'+cPage+'-'+numPages).show();
	}

	function _createPagingClick(page, total) {
		return 'onclick="esis.structures.importer.updatePaging('+page+','+total+');"';
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
		updatePaging : updatePaging
	}
})();