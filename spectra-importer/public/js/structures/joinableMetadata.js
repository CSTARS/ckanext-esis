esis.structures.JoinableMetadata = function(file) {
	var metadata = [];
	var joinId = '';
	var joinCol = 0;
	var filenameMatch = false;

	if( file.metadata ) metadata = file.joindata;
	if( file.joinId ) joinId = file.joinId;
	
	function getMetadata() {
		return metadata;
	}

	function setMetadata(md) {
		metadata = md;
	}

	function getJoinId() {
		return joinId;
	}

	function setJoinId(jid) {
		joinId = jid;
		_updateJoinRow();
	}

	function useFilename(use) {
		filenameMatch = use;
	}

	function _updateJoinRow() {
		if( metadata.length == 0 ) return;
		
		for( var i = 0; i < metadata[0].length; i++ ) {
			if( metadata[0][i] == joinId ) {
				joinCol = i;
				return;
			}
		}
	}

	// spectra should be of type Spectra
	function join(spectra) {
		var row = _getRow(spectra);
		if( row == -1 ) return;

		for( var j = 0; j < metadata[0].length; j++ ) {
			if( j == joinCol ) continue;
			spectra.setMetadata('joined', metadata[0][j], metadata[row][j]);
		}
		return;
	}

	function _getRow(spectra) {
		if( filenameMatch ) {
			var regex;
			for( var i = 1; i < metadata.length; i++ ) {
				regex = new RegExp('.*'+metadata[i][joinCol]+'.*');
				if( regex.test(spectra.getFilename()) ) {
					return i;
				}
			}
		} else {
			for( var i = 1; i < metadata.length; i++ ) {
				if( metadata[i][joinCol] == spectra.getMetadata().spectra[joinId] ) {
					return i;
				}
			}
		}
		return -1;
	}

	_updateJoinRow();

	return {
		getJoinId : getJoinId,
		setJoinId : setJoinId,
		getMetadata : getMetadata,
		useFilename : useFilename,
		join : join
	}


}