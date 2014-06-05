esis.structures.importer = (function() {

	var files = [];
	var TEST_PACKAGE = 'test-upload-5';

	var currentSpectra = [];

	function getPackageName() {
		return window.__ckan_ ? window.__ckan_.package.name : TEST_PACKAGE;
	}

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
				for( var z = 0; z < arr.length; z++ ) {
					arr[z].setCkanId(datasheets[j].getCkanId());
					spectra.push(arr[z]);
				}
			}
		}

		// get existing join data
		if( esis.existingData.hasData() ) {
			var spectraPkg = esis.existingData.get();
			for( var i = 0; i < spectraPkg.join.length; i++ ) {
				var jd = new esis.structures.JoinableMetadata();
				jd.setMetadata(spectraPkg.join[i].metadata);
				jd.setJoinId(spectraPkg.join[i].join_id);

				if( spectraPkg.join[i].joinon == 'filename' ) jd.useFilename(true);
				else if( spectraPkg.join[i].joinon == 'sheetname' ) jd.useWorksheetName(true);

				joindata.push(jd);
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

	function _getJoinableData() {
		var arr = [];
		for( var i = 0; i < files.length; i++ ) {
			var datasheets = files[i].getDatasheets();

			for( var j = 0; j < datasheets.length; j++ ) {
				var jd = datasheets[j].getJoinableMetadata();
				if( !jd ) continue;

				arr.push({
					metadata : jd.getMetadata(),
					filename : jd.getFilename(),
					join_id : jd.getJoinId(),
					joinon : jd.getJoinType(),
					resource_id : jd.getCkanId()
				});
			}
		}
		return arr;
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
            '<div class="pull-right" style="margin-top: 5px"><select id="paging-select"></select></div>'+
            '<div class="pagination" style="margin:0px"><ul id="paging-btns" ></ul></div>'+
  			html
  		);

  		updatePaging(index, currentSpectra.length);
  	}

  	function _createCard(spectra, index, total) {
  		var card = '<div class="card spectra-card" id="card-'+index+'-'+total+'" style="display:none" ><h4><span style="color:#888">From -</span> '+
  			spectra.getFilename()+(spectra.getSheetname() ? ' ('+spectra.getSheetname()+')': '')+'</h4>'+
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

  		card += '<div style="margin:10px;" id="card-chart"></div>';

  		_createChart(spectra.getData());

  		card += '</div>';
  		return card;
    }

    function _createChart(spectra) {
    	setTimeout(function() {
			  var data = new google.visualization.DataTable();
			  var rows = [];

			  data.addColumn('number', 'Wavelength');
			  data.addColumn('number', '')

			  for( var i = 0; i < spectra.length; i++ ) {
			  		rows.push([
			  			parseFloat(spectra[i][0]),
			  			parseFloat(spectra[i][1])
			  		]);
			  }

			  rows.sort(function(a, b){
		       		if( a[0] > b[0] ) return 1;
		       		if( a[0] < b[0] ) return -1;
		       		return 0;
		      });

		      data.addRows(rows);

		      // Set chart options
		      var options = {
		            width : $('#card-chart').width(),
		            height : 400,
		            legend : {
		            	position : 'none'
		            }
		      };

		      // Instantiate and draw our chart, passing in some options.
		      var chart = new google.visualization.LineChart(document.getElementById('card-chart'));
		      chart.draw(data, options);
		}, 100);
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
		btn.addClass('disabled').html('Preparing Upload...');

		setTimeout(function(){
			var resources = _getCkanResources();

			var data = _createSpectraJsonResource();
			// verify verify everything is ok
			// if not, quit
			// you can't use this for upload though! it will not have the resource id assign
			// since the resources have to be uploaded first!

			btn.html('Adding...');

			_addResourceToCkan(0, getPackageName(), resources, btn);
		}, 100);
	}

	function _addResourceToCkan(index, pkg, resources, btn) {
		if( index == resources.length ) {

			btn.addClass('disabled').html('Creating spectra resource...');

			setTimeout(function(){
				esis.uploader.uploadSpectraResource(pkg, _createSpectraJsonResource(true), btn, function() {
					btn.removeClass('disabled').html('Add Resources');
					if( window.__ckan_ ) window.location = "/dataset/new_metadata/"+pkg;
				});
			}, 100);

		} else {
			var name = resources[index].getFilename().replace(/.*\//,'');
			btn.html('Uploading '+name+'... ');
	
			esis.uploader.upload(pkg, resources[index], {
				oncomplete: function() {
					index++;
					_addResourceToCkan(index, pkg, resources, btn);
				},
				onprogress: function(progress) {
					btn.html('Uploading '+name+'... '+(progress*100).toFixed(0)+'%');
				}
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

	function _createSpectraJsonResource(zip) {
		var spectra = _getAndJoinSpectra();

		var data = [];
		for( var i = 0; i < spectra.length; i++ ) {
			var d = {
				metadata : spectra[i].getJoinedMetadata(),
				spectra_id : md5(JSON.stringify(spectra[i].getData())),
				spectra : spectra[i].getData(),
				filename : spectra[i].getFilename(),
				sheetname : spectra[i].getSheetname(),
				resource_id : spectra[i].getCkanId(),
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

		var dataset;
		if( esis.existingData.hasData() ) {
			dataset = esis.existingData.get();

			for( var i = 0; i < data.length; i++ ) dataset.data.push(data[i]);

			var joindata = _getJoinableData();
			for( var i = 0; i < joindata.length; i++ ) dataset.join.push(joindata[i]);
		} else {
			dataset = {
				data : data,
				map  : esis.app.getMetadataMap(),
				join : _getJoinableData()
			}
		};

		

		// we need to clean all of the attribute here ...
		for( var i = 0; i < dataset.data.length; i++ ) {
			var metadata = dataset.data[i].metadata;
			for( var key in metadata ) {
				var tmp = key.replace(/[^A-Za-z0-9\s_-]/g, '');
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
		resource.setContents(JSON.stringify(dataset));
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
		$('#addResources').show();

		var info = "";
		var sCount = 0;
		var rCount = 0;
		var jCount = 0;

		for( var i = 0; i < files.length; i++ ) {
			var datasheets = files[i].getDatasheets();
			rCount += files[i].getResources().length;

			for( var j = 0; j < datasheets.length; j++ ) {
				if( datasheets[j].hasJoinableMetadata() ) jCount++;
				sCount += datasheets[j].getSpectra().length;
			}
		}

		$('#upload-nav li').show();
		$('#parsed-count').text(' ('+sCount+')');
		$('#join-count').text(' ('+jCount+')');
		$('#resource-count').text(' ('+rCount+')');
		$('#nav-data-body').trigger('click');
	}


	return {
		getFiles : getFiles,
		addFile : addFile,
		showSpectra : showSpectra,
		addToCkan : addToCkan,
		updateInfo : updateInfo,
		createSpectraElement : createSpectraElement,
		getPackageName : getPackageName
	}
})();