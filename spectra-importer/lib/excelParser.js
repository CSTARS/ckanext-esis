var parseXlsx = require('excel');

exports.parse = function(file, callback) {
	try {
		parseXlsx(file, callback);
	} catch (e) {
		callback(e);
	}
}
