var csv = require('csv');

var delimiters = [',', '\t',  '  ','    '];

exports.parse = function(file, delimiter, callback) {
	if( delimiter == 'comma' ) delimiter = ',';
	else if( delimiter == 'tab' ) delimiter = '\t';

	try {
		csv().from(file, {comment: '#', delimiter : delimiter, trim: true})
			.to.array(function(data){
  				callback(null, data)
			});
	} catch (e) {
		callback(e);
	}
}