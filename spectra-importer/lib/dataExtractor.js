
exports.extract = function(file, options, callback) {
	if( !file.contents ) return callback(null, {});
	run(file, callback);
};

function run(file, callback) {
	var resp = {
		metadata : {},
		headers : [],
		spectra : []
	}

	var start = getDataStartRow(file.contents);
	if( start > -1 ) {
		resp.spectra = getData(start, file.contents);
		resp.headers = getHeaderData(start-1, resp.spectra.length > 0 ? resp.spectra[0].length : 0 , file.contents);
	}
	
	resp.metadata = getMetadata(start-resp.headers.length, file.contents);
	callback(null, resp);
}

function getMetadata(max, contents) {
	var metadata = [];
	for( var i = 0; i < max; i++ ) {
		if ( contents[i].length > 0 && typeof contents[i][0] == 'string' && contents[i][0].length >= 0 ) {
			metadata.push(contents[i]);
		}
	}
	return parseMetadata(metadata);
}

function parseMetadata(metadata) {
	if( metadata.length == 0 ) return {};

	var m = {};
	if( isTwoColMeta(metadata) ) {
		for( var i = 0; i < metadata.length; i++ ) {
			m[metadata[0]] = m[metadata[1]];
		}
		return m;
	}

	if( isColonSplit(metadata) ) {
		return parseColonSplitMeta(metadata);
	}

	var m = {};
	for( var i = 0; i < metadata.length; i++ ) {
		m['field'+i] = metadata[i][0];
	}
	return m;
}

function parseColonSplitMeta(metadata) {
	var cKey, cVal, m = {}, r, p;
	for( var i = 0; i < metadata.length; i++ ) {
		r = metadata[i][0];
		p = r.split(': ');
		if( p.length > 1 ) {
			cKey = p[0];
			m[cKey] = p[1].replace(/^\s*/,'');
		} else if( typeof r == 'string' && r.length > 0 ) {
			m[cKey] = m[cKey]+r;
		}
	}
	return m;
}

function isTwoColMeta(metadata) {
	for( var i = 0; i < metadata.length; i++ ) {
		if( metadata[i].length < 2 ) return false;
		if( typeof metadata[i][0] != 'string' ) return false;
		if( metadata[i][0].length == 0 ) return false;
	}
	return true;
}

function isColonSplit(metadata) {
	if( metadata[0].length == 0 ) return false;
	if( typeof metadata[0][0] != 'string' ) return false;
	if( metadata[0][0].match(/.*:\s.*/ ) ) return true;
	return false;
}



function getData(start, contents) {
	var data = [];
	for( var i = start; i < contents.length; i++ ) {
		if( contents[i].length > 0 ) {
			data.push(contents[i]);
		}
	}
	return data;
}


// loop back, while you have text, keep looping
function getHeaderData(start, dataLength, contents) {
	var headers = [];
	for( var i = start; i >= 0; i-- ) {		
		if( contents[i].length == 0 || contents[i].length < dataLength) {
			return headers;
		} else if ( typeof contents[i][0] == 'string' && contents[i][0].length == 0 ) {
			return headers;
		} else if( typeof contents[i][0] == 'string' ) {
			headers.push(contents[i]);
		}
	}
	return headers;
}

function getDataStartRow(contents) {
	// if the first two numbers parse as floats, we have hit the data
	var startRow, r;
	for( startRow = 0; startRow < contents.length; startRow++ ) {
		if( contents[startRow].length > 0 ) {
			r = contents[startRow];
			try {
				if( !isNaN(parseFloat(r[0])) && !isNaN(parseFloat(r[1])) ) {
					return startRow;
				}
			} catch(e) {};
		}
	}
	return -1;
}