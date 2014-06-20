if( !window.esis ) window.esis = {};
var data;

esis.host = '';

if( window.location.host == 'localhost:3000' ) {
	esis.host = 'http://192.168.1.109:5000';
	esis.key = '66f67802-f4b4-4f07-979b-9a22e2e193ae';
}

esis.structures = {};

esis.app = (function(){

	var iconMap = {
		rtf : 'fa-file-text-o',
		pdf : 'fa-file-text-o',
		doc : 'fa-file-text-o',
		docx : 'fa-file-text-o',
		jpeg : 'fa-picture-o',
		png  : 'fa-picture-o',
		jpg : 'fa-picture-o',
		gif : 'fa-picture-o',
		tiff : 'fa-picture-o',
		tiff : 'fa-picture-o',
		kml : 'fa-globe',
		kmz : 'fa-globe',
		xml : 'fa-code',
		html : 'fa-code',
		csv : 'fa-table',
		xls : 'fa-table',
		xlsx : 'fa-table',
		spectra : 'fa-table'
	}

	var metadataMap = {};
	var inverseMap = {};

	function init() {
		_initNav();

		$('#Modal').modal({show:false});

		$("#submit").on('click', function(){
			$(this).addClass('disabled').html('Processing...');
			var formData = new FormData($('#resource-upload-form')[0]);
			$.ajax({
		        url: (esis.host ? esis.host : '')+'/rest/submit',  //Server script to process data
		        type: 'POST',
		        success: function(resp){
		        	$('#submit').removeClass('disabled').html('Submit');
		        	setInputs(resp);
		        	renderTable(resp);
		        	
		        	$('#spectra-start').hide();
		        	$('#spectra-modify').show();
		        },
		        error: function(resp){
		        	$('#submit').removeClass('disabled').html('Submit');
		        	alert('upload failed');
		        	console.log(resp);
		        },
		        // Form data
		        data: formData,
		        //Options to tell jQuery not to process data or worry about content-type.
		        cache: false,
		        contentType: false,
		        processData: false
		    });
		});

		$('#addResources').on('click', function() {
			esis.structures.importer.addToCkan($(this));
		});

		$('#show-status').on('click', function(){
			esis.structures.importer.showSpectra();
			$('.nav-panel').hide();
			$('#spectra-status').show();
		});

		$('.back').on('click', function(){
			$('.nav-panel').hide();
			$('#data-body').show();
		});

		var dropZone = document.getElementById('drop_zone');
		dropZone.addEventListener('dragover', _handleDragOver, false);
		dropZone.addEventListener('drop', _handleFileSelect, false);

		$('#file').on('change', _handleFileSelect);
		$('#map').on('change', _setMetadataMap);

		$('#nav-groupby-body').on('click', function(){
			esis.app.groupBy.update();
		});	

		// double check this made it into the window scope
		// if not xlsx parser will crap out
		if( !window.jszip ) {
			window.jszip = JSZip;
		}

		// if there is an api key, set it
		if( window.__ckan_ && window.__ckan_.user ) {
			esis.key = __ckan_.user.apikey;
		}

		esis.existingData.init();
		esis.app.groupBy.init();
	}

	function _initNav() {
		$('#spectra-start').show();
		$('#upload-nav a').on('click', function(){
			$('#upload-nav a').parent().removeClass('active');
			$(this).parent().addClass('active');

			var id = $(this).attr('id').replace(/nav-/, '');
			$('.nav-panel').hide();
			$('#'+id).show();
		});
	}

	function _setMetadataMap(e) {
		e.stopPropagation();
		e.preventDefault();

		var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
		if( files.length == 0 ) return;

		var reader = new FileReader();
		var contents, parts;
		reader.onerror = function() {};
		reader.onprogress = function() {};
		reader.onloadstart = function(e) {};
		reader.onload = function(e) {
			contents = e.target.result.split('\n');
			for( var i = 0; i < contents.length; i++ ) {
				if( contents[i].indexOf('=') > -1 ) {
					parts = contents[i].split('=');
					metadataMap[parts[0]] = parts[1];
					if( parts[1].length > 0 ) inverseMap[parts[1]] = parts[0];
				}
			}
			_updateMetadataMapUI();
			$('#map').val('');
		}
		reader.readAsText(files[0]);
	}

	function _updateMetadataMapUI() {
		var html = 
			'<div class="row-fluid" style="display:block">'+
				'<div id="cmap-col1" class="span6">'+
				'</div>'+
				'<div id="cmap-col2" class="span6">'+
				'</div>'+
			'</div>';

		$('#current-metadata-map').show().html(html);

		var col1 = $('#cmap-col1');
		var col2 = $('#cmap-col2');
		var c = 0;
		for( var key in metadataMap ) {
			if( metadataMap[key] && metadataMap[key] != '' ) {
				if( c % 2 == 0 ) col1.append($('<div><b>'+key+':</b> '+metadataMap[key]+'</div>'));
				else col2.append($('<div><b>'+key+':</b> '+metadataMap[key]+'</div>'));
				c++;
			}
		}

	}

	function _disabledMapInput() {
		$('#metadata-map-block').hide();
		$('#current-metadata-map').show();
		$('#metadata-map-block-help').hide();
	}

	function setMetadataMap(map) {
		inverseMap = map;

		for( var key in map ) {
			metadataMap[map[key]] = key;
		}

		if( Object.keys(map).length > 0 ) {
			_updateMetadataMapUI();
			_disabledMapInput();
		} else {
			$('#metadata-map-block').show();
			$('#current-metadata-map').hide();
			$('#metadata-map-block-help').show();
		}
	}

	function getMetadataMap() {
		return inverseMap;
	}

	function mapMetadata(key) {
		return inverseMap[key];
	}

	function isEcosisMetadata(key) {
		if( esis.metadata[key] != null ) return true;
		return false;
	}

	function _handleFileSelect(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();

	    $('.file-select-group').hide();
	    $('#processing').show();

	    setTimeout(function(){
	    	var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files; // FileList object.
		    for (var i = 0, f; f = files[i]; i++) {
	            esis.structures.importer.addFile(f, $('#parseZip').is(':checked'));
		    }

		    setTimeout(function(){
		    	$('.file-select-group').show();
	    		$('#processing').hide();
	    		$('#file').val('');
		    }, 300);
	    }, 150);

	    
	    // once they add spectra, we only want them to update the spectra.json file
	    // via the add resources button and not the special 'update group by' button.
	    esis.app.groupBy.hideUpdateButton();
  	}

  	function _handleDragOver(evt) {
  		evt.stopPropagation();
  		evt.preventDefault();
  		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  	}

	function setInputs(resp) {
		$('#package_name').val(resp.file.originalFilename);
	}

	function render(data) {
		$('#data-body').html('');
		$('#metadata-body').html('');
		$('#unknown-body').html('');

		var dataList = $('<ul class="list-group"><ul>');
		var metadataList = $('<ul class="list-group"><ul>');
		var unknownList = $('<ul class="list-group"><ul>');
		var d;

		for( var i = 0; i < resp.data.length; i++ ) {
			d = resp.data[i];
			if( d.type == 'data' || d.type == 'both' ) append(dataList, d, i);
			else if( d.type == 'metadata' ) append(metadataList, d, i);
			else if( d.type == 'unknown' ) append(unknownList, d, i);
		}

		$('#data-body').append(dataList)
		$('#metadata-body').append(metadataList);
		$('#unknown-body').append(unknownList);
	}

	function getFileIcon(name) {
		name = name.split('.');
		if( name.length > 1 ) name = name[name.length-1];
		else name = name[0];

		if( iconMap[name] ) return iconMap[name];
		else return 'fa-file-o'
	}

	function append(list, fileInfo, index) {
		var info = '<i class="fa '+getFileIcon(fileInfo.file)+'"></i> <span style="color:#666"">'+fileInfo.file+'</span>';

		//if( fileInfo.type == 'data' || fileInfo.type == 'both' ) info += ' '+createParserSelector(fileInfo.parser);
		if( fileInfo.type == 'data' || fileInfo.type == 'both' ) info += ' '+fileInfo.parser;
		if( fileInfo.contents ) info += ' <span class="label label-success">Parsed</span> <a class="btn btn-link" onclick="esis.app.show('+index+');">info</a>';

		list.append($('<li class="list-group-item">'+info+'</li>'))
	}

	function createParserSelector(parser) {
		if( !parser ) parser = '';
		var types = ['', 'excel', 'csv-tab', 'csv-comma', 'csv-2spaces', 'csv-4spaces'];

		var selector = '<select>';
		for( var i = 0; i < types.length; i++ ) {
			selector += '<option value="'+types[i]+'" '+(parser==types[i] ? 'selected' : '')+'>'+types[i]+'</option>';
		}
		return selector += '</select>';
	}

	function show(index) {
		var d = data[index].contents;

		var html = '<h3>Metadata</h3>';
		if( Object.keys(d.metadata).length == 0 ) {
			html += '<div class="alert alert-info">No Metadata Found</div>';
		} else {
			html += '<table class="table" style="font-size:14px">';
			for( var key in d.metadata ) {
				html += '<tr><td><b>'+key+'</b></td><td>'+d.metadata[key]+'</td></tr>';
			}
			html += '</table>';
		}

		html += '<h3>Headers</h3>';
		if( d.headers.length == 0 ) {
			html += '<div class="alert alert-info">No Headers Found</div>';
		} else {
			html += '<div style="overflow:auto"><table class="table" style="font-size:14px">';
			for( var i = 0; i < d.headers.length; i++ ) {
				html += '<tr>';
				for( var j = 0; j < d.headers[i].length; j++ ) {
					html += '<td>'+d.headers[i][j]+'</td>';
				}
				html += '</tr>';
			}
			html += '</table></div>';
		}

		html += '<h3>Spectra</h3>';
		if( d.spectra.length == 0 ) {
			html += '<div class="alert alert-info">No Spectra Found</div>';
		} else {
			html += '<div id="chart-placeholder"></div>';

			setTimeout(function() {
				  var data = new google.visualization.DataTable();
				  var rows = [];

				  for( var i = 0; i < d.spectra[0].length; i++ ) {
				  	if( i == 0 ) data.addColumn('number', 'Wavelength');
				  	else data.addColumn('number', ''+i);
				  }

				  for( var i = 0; i < d.spectra.length; i++ ) {
				  		var row = [];
				  		var addRow = true;
				  		for( var j = 0; j < d.spectra[i].length; j++ ) {

				  			var f = parseFloat(d.spectra[i][j]);
				  			if( isNaN(f) ) f = 0;
				  			if(  j == 0 && f == 0 ) {
				  				addRow = false;
				  				break;
				  			}

				  			row.push(f);
				  		}
				  		if( addRow ) rows.push(row);
				  }

				  rows.sort(function(a, b){
			       		if( a[0] > b[0] ) return 1;
			       		if( a[0] < b[0] ) return -1;
			       		return 0;
			       });

			      data.addRows(rows);

			      // Set chart options
			      var options = {
			            width : $('#chart-placeholder').width(),
			            height : 550,
			            legend : {
			            	position : 'none'
			            }
			      };

			      // Instantiate and draw our chart, passing in some options.
			      var chart = new google.visualization.LineChart(document.getElementById('chart-placeholder'));
			      chart.draw(data, options);
			}, 500);
		}

		$('.modal-body').html(html);
		

		$('#Modal').modal('show');
	}

	return {
		init : init,
		show : show,
		render : render,
		mapMetadata : mapMetadata,
		isEcosisMetadata : isEcosisMetadata,
		getMetadataMap : getMetadataMap,
		setMetadataMap : setMetadataMap
	}

})();