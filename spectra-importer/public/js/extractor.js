esis.extractor = (function(){


	function run(contents, callback) {
		var resp = {
			metadata : {},
			spectra : []
		}

		var start = getDataStartRow(contents);

		// TODO: check if data is 'flipped'.  That means the data is in the format
        // header | header | header | header | header | header | header | header
		// meta   | meta   | meta   | wave   | data   | data   | data   | data
		// meta   | meta   | meta   | wave   | data   | data   | data   | data
		// 
		// vs the 'prefered'
		// header | meta | meta | meta | meta | meta
		// header | meta | meta | meta | meta | meta
		// header | meta | meta | meta | meta | meta
		// header | meta | meta | meta | meta | meta
		// wave   | data | data | data | data | data
		// wave   | data | data | data | data | data
		// wave   | data | data | data | data | data
		if( start == -1 ) {
			console.log('no start row found');
			var flipped = isFlipped(contents);
			if( flipped ) {
				alert('Data appears to be flipped.  Transposing...');
				contents = flipData(contents);
				start = getDataStartRow(contents);
			//	alert('data is flipped');
			//	return callback(null, resp);
			}
		}

		var headers = [];
		if( start > -1 ) {
			var spectra = getData(start, contents);

			headers = getHeaderData(start-1, resp.spectra.length > 0 ? resp.spectra[0].length : 0 , contents);

			var itemHeaders = [];
			if( headers.length > 0 ) {
				for( var j = 1; j < headers[0].length; j++ ) {
					var h = {};
					for( var i = 0; i < headers.length; i++ ) {
						h[headers[i][0]] = headers[i][j];
					}
					itemHeaders.push(h);
				}
			}

			var itemSpectra = [];
			if( spectra.length > 0 ) {
				for( var j = 1; j < spectra[0].length; j++ ) {
					var s = [];
					for( var i = 0; i < spectra.length; i++ ) {
						s.push([spectra[i][0], spectra[i][j]]);
					}
					itemSpectra.push(s);
				}
			}

			if( itemHeaders.length > 0 && itemSpectra.length > 0 ) {
				for( var i = 0; i < itemHeaders.length; i++ ) {
					resp.spectra.push({
						metadata : itemHeaders[i],
						data  : itemSpectra[i]
					});
				}
			} else if( itemSpectra.length > 0 ) {
				for( var i = 0; i < itemSpectra.length; i++ ) {
					resp.spectra.push({
						metadata : [],
						data  : itemSpectra[i]
					});
				}

			} else if( itemHeaders.length > 0 ) {
				for( var i = 0; i < itemHeaders.length; i++ ) {
					resp.spectra.push({
						metadata : itemHeaders[i],
						data  : itemSpectra[i]
					});
				}
			}

		}

		resp.metadata = getMetadata(start-headers.length, contents);

		if( Object.keys(resp.metadata).length == 0 && resp.spectra.length == 0 ) {
			if( contents.length > 1 ) {
				if( contents[0].length > 1 ) {
					resp.joindata = contents;
				} 
			}
		}

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

		console.log(metadata);

		var m = {};
		if( isTwoColMeta(metadata) ) {
			for( var i = 0; i < metadata.length; i++ ) {
				if( metadata[i][0] != '' ) {
					m[metadata[i][0]] = metadata[i][1];
				}	
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
			if( getRowLength(metadata[i]) == 1 ) return false;
			if( typeof metadata[i][0] != 'string' ) return false;
			if( metadata[i][0].length == 0 && i != (metadata.length-1)) return false;
		}
		return true;
	}

	// get the number off cells that have consecutive values
	function getRowLength(arr) {
		var c = 0;
		for( var i = 0; i < arr.length; i++ ) {
			if( arr[i] && arr[i] != '' ) c++;
			else return c;
		}
		return c;
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
			if( contents[i].length == 0 ) break;
			if( contents[i][0].length == 0 ) break;

			data.push(contents[i]);
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
				if( areCellsNumberic(r[0], r[1]) ) return startRow;
			}
		}
		return -1;
	}

	// go through the second row and see if you can find two where numberics run on
	function isFlipped(contents) {
		if( contents.length < 2 ) return false;

		var row = contents[1];
		for( var col = 0; col < contents.length-1; col++ ) {
			if( areCellsNumberic(row[col], row[col+1]) ) {
				return true;
			}
		}
		return false;
	}

	function flipData(contents) {
		var flipped = [], row;
		for(var i = 0; i < contents[0].length; i++ ) {
			row = [];
			for( var j = 0; j < contents.length; j++ ) {
				row.push(contents[j][i]);
			}
			flipped.push(row);
		}

		return flipped;
	}

	function areCellsNumberic(cell1, cell2) {
		if( !cell1 || !cell2 ) return false;

		try {
			var t1 = cell1.replace(/\s/g,'').match(/^\d+.?\d*$/);
			var t2 = cell2.replace(/\s/g,'').match(/^\d+.?\d*$/);

			// check they parse to floats
			if( t1 && t2 ) return true;
		} catch(e) {}
		
		return false;
	}

	return {
		run : run
	}

})();