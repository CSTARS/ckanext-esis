esis.structures.Resource = function(resource) {
	var contents = null;
	var filename = '';
	var mimetype = '';
	var ext = '';
	var ele = null;

	var template = '<div class="card">' +
		'<h4 style="color:#888;white-space:nowrap"><i class="fa {{icon}}"></i> {{title}}</h4>' +
		'</div>'

	if( resource ) {
		if( resource.contents ) contents = resource.contents;
		if( resource.filename ) filename = resource.filename;
		if( resource.mimetype ) contents = resource.mimetype;
		if( resource.ext ) contents = resource.ext;
	}
	
	function init() {
		if( isFolder() || !resource ) return;
		ele = _createElement();
		$('#resources-body').append(ele);
	}

	function getFilename() {
		if( filename && filename.length > 0 ) return filename;
		if( resource.zipEntry ) return resource.zipEntry.name;
		return resource.info.name;
	}

	function setFilename(name) {
		filename = name;
	}

	function getMimetype() {
		if( mimetype && mimetype.length > 0 ) return mimetype;
		if( resource && resource.file ) return resource.file.type;
		if( resource && resource.info ) {
			if( esis.extensions[resource.info.ext] ) return esis.extensions[resource.info.ext].mime;
		}
		// give up for now
		return 'text/plain';
	}

	function setMimetype(mt) {
		mimetype = mt;
	}

	function getContents() {
		if( contents ) return contents;
		if( resource && resource.zipEntry ) return resource.zipEntry.asBinary();
		return '';
	}

	function setContents(c) {
		contents = c;
	}

	function isFolder() {
		if( resource && resource.zipEntry ) {
			if( resource.zipEntry.options.dir ) return true;
		}
		return false;
	}


	function _createElement() {
		var title;

		if( resource.zipEntry ) {
			title = resource.zipEntry.name.replace(/.*\//,'');
			if( title.length == 0 ) title = resource.zipEntry.name;
		} else {
			title = resource.info.name;
		}

		var t = template.replace(/\{\{title\}\}/, title);
		t = t.replace(/\{\{icon\}\}/, _getFileIcon());
		return t;
	}

	function _getFileIcon() {
		if( esis.extensions[resource.info.ext] ) return esis.extensions[resource.info.ext].icon;
		return 'fa-file-o';
	}

	init();

	return {
		getFilename : getFilename,
		getMimetype : getMimetype,
		getContents : getContents,
		setContents : setContents,
		setFilename : setFilename,
		setMimetype : setMimetype,
	}
}