/*var EsisUploadFile = (function() {

	var extensionMap = {
		pdf : {
			type : 'resource'
		},
		spectra : {
			type : 'data',
			parser : 'csv-tab',
			format : 'string'
		},
		zip : {
			type   : 'compressed',
			format : 'binary',
			type : 'resource',
			isZip  : true
		},
		csv : {
			type : 'both',
			parser : 'csv-comma',
			format : 'string' 
		},
		xlsx : {
			type : 'both',
			parser : 'excel',
			format : 'binary'
		},
		xls : {
			type : 'both',
			parser : 'excel',
			format : 'binary'
		},
		kml : {
			type : 'resource'
		},
		rtf : {
			type : 'resource'
		},
		jpg : {
			type : 'resource'
		},
		png : {
			type : 'resource'
		},
		txt : {
			format : 'string',
			type : 'both',
			parser : 'csv-tab'
		}
	};

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

	var template = '<div class="card">' +
		'<h4 style="color:#888;white-space:nowrap"><i class="fa {{icon}}"></i> {{title}}</h4>' +
		'<div>{{table}}</div>'



	// are we a zip file
	var isZip = false;
	// actaul file pointer from FileReader API
	var file;
	// element used to display on dom
	var ele;
	// supplementary info deduced about the file
	var info;
	// data parsed from the file (includes info object about)
	var data;
	// file index in the main array stored in esis.files
	var index = -1;
	// multideminsion array of data parsed from file
	var contents;
	// should we uncompress the zip file into individual resources for upload 
	// or leave intact
	var walkZip = false;
	// is this just spectra data (no metadata)
	var spectraOnly = false;
	// error msg
	var error;


	function init(f, parseZip) {
		index = esis.files.add(this);

		file = f;
		walkZip = parseZip;

		info = getInfo(file.name);

		var reader = new FileReader();
		reader.onerror = errorHandler;
		reader.onprogress = updateProgress;
		reader.onloadstart = function(e) {};
		reader.onload = function(e) {
			contents = e.target.result;
			if(  info.isZip ) {
				unzip(e.target.result);
				if( !parseZip ) onComplete();
			} else {
				parse();
			}
		}

		readAs(reader, info);
	}

	function readAs(reader, info) {
		if( info.hasData || info.isZip ) {
			if( info.format == 'binary' ) {
				//reader.readAsArrayBuffer(file);
				reader.readAsBinaryString(file);
			} else if( info.format == 'string' ) {
				reader.readAsText(file);
			} else {
				onComplete();
			}
		} else {
			onComplete();
		}

	}

	function updateProgress() {

	}

	function errorHandler() {

	}

	function getFileIcon() {
		name = info.name.split('.');
		if( name.length > 1 ) name = name[name.length-1];
		else name = name[0];

		if( iconMap[name] ) return iconMap[name];
		else if ( info.isDir ) return 'fa-folder-o';
		else return 'fa-file-o';
	}

	function createElement(isResourceList, subIndex) {
		var title = info.name.replace(/.*\//,'');
		if( title.length == 0 || title == ' ' ) title = info.name;

		var t = template.replace(/\{\{title\}\}/, (subIndex != null ? title+' ('+(subIndex+1)+')' : title));
		t = t.replace(/\{\{icon\}\}/, getFileIcon());

		var id = (subIndex != null) ? index+'-'+subIndex : index;
		var d = (subIndex != null) ? data[subIndex] : data;
		d.name = (subIndex != null) ? title+' ('+(subIndex+1)+')' : title;

		var innerHTML = '';
		if( info.hasData && !isResourceList ) {
			innerHTML += '<table class="table table-striped">';
			innerHTML += '<thead><tr><th>Parser</th><th>Status</th><th></th></tr></thead>';

			innerHTML += '<tr><td>'+createParserSelector(info.parser, id)+'</td>';


			if ( d.joindata ) {
				innerHTML += '<td><span class="label label-danger">Parsed</span></td>'+
							'<td style="font-size:12px">Linkable Metadata</td>';
			} else if( d && !d.error ) {
				innerHTML += '<td><span class="label label-success">Parsed</span></td>'+
							'<td><a class="btn btn-link" onclick="esis.files.show(\''+
							id+'\');">info</a></td>';
			} else {
				innerHTML += '<td><span class="label label-danger">'+(contents != null ? 'No Data' : 'Failed')+
					'</span></td><td style="color:red;font-size:12px">'+JSON.stringify(d.error)+'</td>';
			}
		}
		t = t.replace(/\{\{table\}\}/, innerHTML);

		var card = $(t);
		card.find('.select-parser').on('change', function(e){
			reparse(id, e.currentTarget.value);
		});

		return card;
	}

	function reparse(id, parser) {
		console.log(id+' '+parser);

		if( typeof id == 'string' ) {

		} else {

		}
	}

	function createParserSelector(parser, id) {
		if( !parser ) parser = '';

		if( parser == 'excel' ) return 'excel';

		var types = ['', 'excel', 'csv-tab', 'csv-comma', 'csv-2spaces', 'csv-4spaces'];

		var selector = '<select style="width:100px" class="select-parser" id="parser-'+id+'" >';
		for( var i = 0; i < types.length; i++ ) {
			selector += '<option value="'+types[i]+'" '+(parser==types[i] ? 'selected' : '')+'>'+types[i]+'</option>';
		}
		return selector += '</select>';
	}

	function getInfo(name) {
		var ext = getExtension(name);
		var info = extensionMap[ext];

		if( !info && name == '.' ) {
			info = {
				type : 'directory',
				isDir : true
			}
		} else if( !info ) {
			info = {
				type : 'both',
				parser : 'csv-4spaces'
			}
		}
		info.ext = ext;
		info.name = name;
		info.hasData = info.type == 'both' || info.type == 'data';
		return info;
	}

	function unzip(contents) {
		var zip = new JSZip(contents);

		$.each(zip.files, function (index, zipEntry) {
			var info = getInfo(zipEntry.name);
			if( zipEntry.options.dir ) {
				info.hasData = false;
				info.isDir = true;
			}

        	var filePanel = new EsisUploadFile();
        	var d = '';
        	if( info.hasData ) {
        		if( info.format == 'binary' ) d = zipEntry.asBinary();
        		else d = zipEntry.asText();
        	}

        	filePanel.set(d, info, esis.files.add(filePanel), walkZip);
        	filePanel.parse();
        });
	}

	function set(c, io, i, sp) {
		contents = c;

		spectraOnly = !sp;
		info = io;
		index = i;
	}

	var timer;
	function parse(reparse) {
		timer = new Date().getTime();

		if( info.ext == 'xlsx' ) {
			//try {
				wb = XLSX.read(contents, {type: 'binary'});

				wb.SheetNames.forEach(function(sheetName) {
					var csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
					$.csv.toArrays(csv, {}, function(err, data){
						if( err ) console.log(err);
						esis.extractor.run(data, function(err, resp){
							onComplete(resp, reparse);
						});
					});
				});
			//} catch(e) {
			//	error = e;
			//	onComplete(null, reparse);
			//}
		} else if( info.ext == 'xls' ) {
			try {
				wb = XLS.read(contents, {type: 'binary'});

				wb.SheetNames.forEach(function(sheetName) {
					var csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
					$.csv.toArrays(csv, {}, function(err, data){
						if( err ) console.log(err);
						esis.extractor.run(data, function(err, resp){
							onComplete(resp, reparse);
						});
					});
				});
			} catch(e) {
				error = e;
				onComplete();
			}
		} else if ( info.hasData ) {
			try {
				var options = {};
				if( info.parser == 'csv-tab' ) options.separator = '\t';
				if( info.parser == 'csv-4spaces' ) options.separator = '    ';
				if( info.parser == 'csv-2spaces' ) options.separator = '  ';

				$.csv.toArrays(contents, options, function(err, data){
					if( err ) console.log(err);
					esis.extractor.run(data, function(err, resp){
						if( err ) console.log(err);
						onComplete(resp, reparse);
					});
				});
			} catch(e) {
				error = e;
				onComplete(null, reparse);
			}
		} else {
			onComplete();
		}
	}

	function onComplete(d) {
		var multiple = false;
		
		if( !d ) {
			d = {
				metadata : [],
				spectra : [],
				error : 'File failed to parse'
			}
		}

		if( data ) {
			multiple = true;
			if( !Array.isArray(data) ) data = [data];
			data.push(d);
		} else {
			data = d;
		}	

		// TODO: UNCOMMENT ME!!!!!
		d.contents = contents;
		
		d.spectraOnly = spectraOnly;
		d.type = info.type;
		d.file = file;

		if( info.hasData ) {

			// set error if nothing was parsed
			if( !d.error && Object.keys(d.metadata).length == 0 && d.spectra.length == 0 && !d.joindata ) {
				d.error = 'File parsed but no metadata, or spectra found';
			}

			if( multiple ) {
				$('#data-body').append(createElement(false, data.length-1));
			} else {
				$('#data-body').append(createElement(false));
				if( !spectraOnly ) $('#resources-body').append(createElement(true));
			}
		} else if (info.type == 'resource' && !spectraOnly ) {
			$('#resources-body').append(createElement());
		} else if( !spectraOnly ){
			$('#unknown-body').append(createElement());
		}
	}

	function getExtension(filename) {
		var parts = filename.split('.');
		return parts[parts.length-1];
	}

	function hasData(ext) {
		return extensionMap[ext] && (extensionMap[ext].type == 'both' || extensionMap[ext].type == 'data');
	}

	function show(subIndex) {
		var d;
		if( Array.isArray(data) ) {
			if( subIndex ) d = data[subIndex];
			else d = data[0];
		} else {
			d = data;
		}

		var html = '<h3>File</h3>';
		html += '<div style="overflow:auto"><table class="table" style="font-size:14px">';
		for( var key in info ) {
			html += '<tr><td>'+key+'</td><td>'+info[key]+'</td></tr>';
		}
		html += '</table></div>';

		html += '<h3>Metadata</h3>';
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
				  var dt = new google.visualization.DataTable();
				  var rows = [];

				  for( var i = 0; i < d.spectra[0].length; i++ ) {
				  	if( i == 0 ) dt.addColumn('number', 'Wavelength');
				  	else dt.addColumn('number', ''+i);
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

	function get() {
		return data;
	}

	return {
		init : init,
		parse : parse,
		set : set,
		show : show,
		get : get
	}

});*/