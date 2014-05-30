esis.structures.Datasheet = function(parseFile) {

	var file = {};
	var ele = null;
	var spectra = [];
	var joinableMetadata = null;
	var ckanId = "";

	var template = '<div class="card">' +
		'<h4 style="color:#888;white-space:nowrap"><i class="fa {{icon}}"></i> {{title}}</h4>' +
		'<div>{{table}}</div></div>';

	if( parseFile ) file = parseFile;

	function init() {
		if( file.spectra ) {
			for( var i = 0; i < file.spectra.length; i++ ) {
				var sp = new esis.structures.Spectra(file.spectra[i], file.info.name, file.sheetName);

				if( file.metadata ) {
					for( var key in file.metadata ) {
						sp.setMetadata('file', key, file.metadata[key]);
					}
				}
				spectra.push(sp);
			}
		}
		if( file.joindata ) {
			joinableMetadata = new esis.structures.JoinableMetadata(file);
		}

		ele = _createElement();
		$('#data-body').append(ele);
	}

	function getJoinableMetadata() {
		return joinableMetadata;
	}

	function getSpectra() {
		return spectra;
	}

	function addSpectra(spectra) {
		spectra.push(spectra);
	}

	function _getTitle() {
		var name = file.name || file.info.name;
		var title = name.replace(/.*\//,'');
		if( title.length == 0 || title == ' ' ) title = name;
		return title;
	}

	function _createElement() {
		var title = _getTitle();

		var t = template.replace(/\{\{title\}\}/, title);
		t = t.replace(/\{\{icon\}\}/, _getFileIcon());

		
		var innerHTML = '';
		innerHTML += '<table class="table table-striped" style="table-layout:initial">';
		innerHTML += '<thead><tr><th>Parser</th><th>Status</th><th></th></tr></thead>';

		//innerHTML += '<tr><td>'+_createParserSelector(file.info.parser, "")+'</td>';
		innerHTML += '<tr><td>'+file.info.parser+'</td>';
		var id = '';

		if ( file.joindata ) {
			innerHTML += '<td><span class="label label-danger">Parsed</span></td>'+
						'<td style="font-size:12px"><b>Linkable Metadata</b>'+_createLinkSelector()+'</td>';
		} else if( !file.error || file.warning ) {
			innerHTML += '<td><span class="label label-success">Parsed</span></td>'+
						'<td><a class="btn btn-link btn-show">info</a></td>';
		} else if( file.error ) {
			innerHTML += '<td><span class="label label-danger"> Failed'+
				'</span></td><td style="color:red;font-size:12px">'+JSON.stringify(file.error)+'</td>';
		} else if( file.warning ) {
			innerHTML += '<td><span class="label label-danger"> No Data'+
				'</span></td><td style="color:red;font-size:12px">'+JSON.stringify(file.warning)+'</td>';
		}

		t = t.replace(/\{\{table\}\}/, innerHTML);

		var card = $(t);
		card.find('.select-parser').on('change', function(e){
			reparse(id, e.currentTarget.value);
		});

		card.find('.btn-show').on('click', function(){
			show();
		});

		card.find('input[type=checkbox]').on('click', function(){
			if( $(this).is(':checked') ) {
				card.find('input[type=checkbox]').removeAttr('checked');
				$(this).prop('checked', true);
			}
		});

		card.find('.link-selector').on('change', function(e){
			joinableMetadata.setJoinId($(this).val());
		});
		card.find('.filename-match').on('change', function(e){
			joinableMetadata.useFilename($(this).is(':checked'));
		});
		card.find('.worksheetname-match').on('change', function(e){
			joinableMetadata.useWorksheetName($(this).is(':checked'));
		});

		return card;
	}

	function _createLinkSelector() {
		var html = '<div class="form-horizontal">'+
			'<div class="control-group">'+
				'<label class="control-label">Join On: </label>'+
				'<div class="controls">'+
				'<select class="link-selector form-control" style="display:block-inline">'+
					'<option></option>';
		for( var i = 0; i < file.joindata[0].length; i++ ) {
			var val = file.joindata[0][i];
			html += '<option value="'+val+'">'+val+'</option>';
		}
		html += '</select></div></div>'+
			'<div class="control-group">'+
				'<div class="controls">'+
					'<div class="checkbox">'+
						'<input type="checkbox" class="filename-match" /> Match on Filename';

		if( file.sheetName != null) {
			html += '</div></div></div>'+
				'<div class="control-group">'+
					'<div class="controls">'+
						'<div class="checkbox">'+
							'<input type="checkbox" class="worksheetname-match" /> Match on Worksheet Name';
		}


		html +=	'</div></div></div></div>';
		return html;
	}

	/*function _createParserSelector(parser, id) {
		if( !parser ) parser = '';

		if( parser == 'excel' ) return 'excel';

		var types = ['', 'excel', 'csv-tab', 'csv-comma', 'csv-2spaces', 'csv-4spaces'];

		var selector = '<select style="width:100px" class="select-parser" id="parser-'+id+'" >';
		for( var i = 0; i < types.length; i++ ) {
			selector += '<option value="'+types[i]+'" '+(parser==types[i] ? 'selected' : '')+'>'+types[i]+'</option>';
		}
		return selector += '</select>';
	}*/

	function _getFileIcon() {
		if( esis.extensions[file.info.ext] ) return esis.extensions[file.info.ext].icon;
		else if ( info.isDir ) return 'fa-folder-o';
		else return 'fa-file-o';
	}

	function show() {
		var html = '<h3>File: <span style="color:#888">'+parseFile.name+'</span></h3>';

		html += '<h4>File Level Metadata</h4>';
		if( Object.keys(parseFile.metadata).length == 0 ) {
			html += '<div class="alert alert-info">No Metadata Found</div>';
		} else {
			html += '<table class="table" style="font-size:14px">';
			for( var key in parseFile.metadata ) {
				html += '<tr><td><b>'+key+'</b></td><td>'+parseFile.metadata[key]+'</td></tr>';
			}
			html += '</table>';
		}

		var spectraMetadata = [];
		if( parseFile.spectra && parseFile.spectra.length > 0 ) {
			spectraMetadata = Object.keys(parseFile.spectra[0].metadata);
		}

		html += '<h4>Spectra Level Metadata Fields</h4>';
		if( spectraMetadata.length == 0 ) {
			html += '<div class="alert alert-info">No Spectra Level Metadata Found</div>';
		} else {
			html += '<div style="overflow:auto"><table class="table" style="font-size:14px">';
			for( var i = 0; i < spectraMetadata.length; i++ ) {
				html += '<tr><td>'+spectraMetadata[i]+'</td></tr>';
			}
			html += '</table></div>';
		}

		html += '<h4>Spectra</h4>';
		if( parseFile.spectra.length == 0 ) {
			html += '<div class="alert alert-info">No Spectra Found</div>';
		} else {
			html += '<div id="chart-placeholder"></div>';

			setTimeout(function() {
				  var dt = new google.visualization.DataTable();
				  var rows = [];

				  dt.addColumn('number', 'Wavelength');
				  for( var i = 0; i < parseFile.spectra.length; i++ ) {
				     dt.addColumn('number', ''+i);
				  }

				  for( var i = 0; i < parseFile.spectra[0].data.length; i++ ) {
				  		// add the wavelength
				  		var row = [parseFloat(parseFile.spectra[0].data[i][0])];
				  		var addRow = true;

				  		for( var j = 0; j < parseFile.spectra.length; j++ ) {
				  			var f = parseFloat(parseFile.spectra[j].data[i][1]);
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

			      dt.addRows(rows);

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
			      chart.draw(dt, options);
			}, 500);
		}

		$('.modal-body').html(html);

		$('#Modal').modal('show');
	}

	function getCkanId() {
		return ckanId;
	}

	function setCkanId(id) {
		ckanId = id;
		for( var i = 0; i < spectra.length; i++ ) {
			spectra[i].setCkanId(id);
		}
		if( joinableMetadata ) joinableMetadata.setCkanId(id);
	}

	init();

	return {
		getJoinableMetadata : getJoinableMetadata,
		getSpectra : getSpectra,
		addSpectra : addSpectra,
		setCkanId  : setCkanId,
		getCkanId  : getCkanId
	}

}