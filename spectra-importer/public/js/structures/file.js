esis.structures.File = function(fileObj, parseZip) {

	var datasheets = [];
	var resources = [];
	var parser = '';
	var info = {};
	var error = null;
	var reader = null;
	var contents = null;

	function init() {
		info = _getInfo(fileObj.name);

		reader = new FileReader();
		reader.onerror = function() {};
		reader.onprogress = function() {};
		reader.onloadstart = function(e) {};
		reader.onload = function(e) {
			contents = e.target.result;
			if(  info.isZip ) {
				_unzip(e.target.result);
			} else {
				esis.parser.parse(info, contents, function(arr){
					_onIngestComplete(arr);
        		});
			}
		}

		_readAs(reader);
	}

	function _readAs(reader) {
		if( info.hasData || info.isZip ) {
			if( info.format == 'binary' ) {
				//reader.readAsArrayBuffer(file);
				reader.readAsBinaryString(fileObj);
			} else if( info.format == 'string' ) {
				reader.readAsText(fileObj);
			}
			return;
		}
			
		_onIngestComplete([{
			name : info.name,
			info : info,
			file : fileObj
		}]);
	}

	function _unzip(contents) {
		var zip = new JSZip(contents);
		var arr = [];

		var c = 0;
		var total = Object.keys(zip.files).length;

		for( var file in zip.files ) {
			var zipEntry = zip.files[file];

			var linfo = _getInfo(zipEntry.name);

			// ignore directories
			if( zipEntry.options.dir ) {
				linfo.hasData = false;
				linfo.isDir = true;
			}

        	var contents = '';
        	if( linfo.hasData ) {
        		if( linfo.format == 'binary' ) contents = zipEntry.asBinary();
        		else contents = zipEntry.asText();

        		esis.parser.parse(linfo, contents, function(resp){
	        		for( var i = 0; i < resp.length; i++ ) {
	        			var d = resp[i];
	        			// do we need to add reference to the zip file to later relate the resource id?
	        			if( !parseZip ) d.info.zipFilename = info.name;
	        			arr.push(d);
	        		}

	        		c++;
	        		if( c == total ) _onIngestComplete(arr);
	        	});
        	} else if( parseZip && !info.isDir ) {
        		arr.push({
        			name : info.name,
					info : info,
					zipEntry : zipEntry
				});

        		c++;
	        	if( c == total ) _onIngestComplete(arr);
        	} else {
        		c++;
	        	if( c == total ) _onIngestComplete(arr);
        	}

        };
	}

	function _onIngestComplete(files) {

		// do we need to add the zip file?
		if( (!parseZip && info.isZip) || !info.isZip ) {
			files.push({
				name : info.name,
				info : info,
				file : fileObj,
				contents : contents
			});
		}

		var map = {};
		for( var i = 0; i < files.length; i++ ) {
			var f = files[i];

			if( f.info.type == 'data' ) {
				var datasheet = new esis.structures.Datasheet(f);
				var resourceName = f.info.zipFilename ? f.info.zipFilename : f.info.name;

				if( resourceName ) {
					if( !map[resourceName] ) map[resourceName] = [datasheet];
					else map[resourceName].push(datasheet);
				}
				datasheets.push(datasheet);
			} 
		}

		for( var i = 0; i < files.length; i++ ) {
			var f = files[i];
			if( f.info.type == 'resource' || f.info.type == 'both' ) {
				resources.push(new esis.structures.Resource(f, map[f.info.name]));
			}
		}

	}

	function _getInfo(name) {
		var i = {};
		var ext = _getExtension(name);
		var tmp = esis.extensions[ext];

		if( !tmp && name == '.' ) {
			tmp = {
				type : 'directory',
				isDir : true
			}
		} else if( !tmp ) {
			tmp = {
				type : 'both',
				parser : 'csv-4spaces'
			}
		}
		i = $.extend(true, {}, tmp);
		i.ext = ext;
		i.name = name;
		i.hasData = i.type == 'both' || i.type == 'data';	
		return i;
	}

	function _getExtension(filename) {
		var parts = filename.split('.');
		return parts[parts.length-1];
	}

	function getDatasheets() {
		return datasheets;
	}

	function addDatasheet(file) {
		datasheets.push(file);
	}

	function getResources() {
		return resources;
	}

	function addResource(file) {
		resources.push(file);
	}

	init();

	return {
		getDatasheets : getDatasheets,
		getResources : getResources,
		addDatasheet : addDatasheet,
		addResource : addResource
	}
}