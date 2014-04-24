esis.extensions = {
	pdf : {
		type : 'resource',
		icon : 'fa-file-text-o',
		mime : 'application/pdf'
	},
	spectra : {
		type : 'data',
		parser : 'csv-tab',
		format : 'string',
		icon : 'fa-table',
		mime : 'text/plain'
	},
	zip : {
		type   : 'compressed',
		format : 'binary',
		type : 'resource',
		isZip  : true,
		mime : 'application/zip'
	},
	csv : {
		type : 'both',
		parser : 'csv-comma',
		format : 'string',
		icon : 'fa-table',
		mime : 'text/plain'
	},
	xlsx : {
		type : 'both',
		parser : 'excel',
		format : 'binary',
		icon : 'fa-table',
		mime : 'application/excel'
	},
	xls : {
		type : 'both',
		parser : 'excel',
		format : 'binary',
		icon : 'fa-table',
		mime : 'application/excel'
	},
	kml : {
		type : 'resource',
		icon : 'fa-globe',
		mime : 'application/vnd.google-earth.kml+xml'
	},
	kmz : {
		type : 'resource',
		icon : 'fa-globe',
		kmz  : 'application/vnd.google-earth.kmz'
	},
	xml : {
		type : 'resource',
		icon : 'fa-code',
		mime : 'text/xml'
	},
	html : {
		type : 'resource',
		icon : 'fa-code',
		mime : 'text/html'
	},
	rtf : {
		type : 'resource',
		icon : 'fa-file-text-o',
		mime : 'application/rtf'
	},
	jpg : {
		type : 'resource',
		icon : 'fa-picture-o',
		mime : 'image/jpeg'
	},
	jpeg : {
		type : 'resource',
		icon : 'fa-picture-o',
		mime : 'image/jpeg'
	},
	png : {
		type : 'resource',
		icon : 'fa-picture-o',
		mime : 'image/png'
	},
	gif : {
		type : 'resource',
		icon : 'fa-picture-o',
		mime : 'image/gif'
	},
	tiff : {
		type : 'resource',
		icon : 'fa-picture-o',
		mime : 'image/tiff'
	},
	tif : {
		type : 'resource',
		icon : 'fa-picture-o',
		mime : 'image/tiff'
	},
	txt : {
		format : 'string',
		type   : 'both',
		parser : 'csv-tab',
		mime   : 'text/plain'
	},
	doc : {
		icon : 'fa-file-text-o',
		mime : 'application/msword'
	},
	docx : {
		icon : 'fa-file-text-o',
		mime : 'application/msword'
	}
};