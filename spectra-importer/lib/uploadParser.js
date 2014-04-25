/* unzip and walk upload */
var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');
var excelParser = require('./excelParser');
var csvParser = require('./csvParser');
var dataExtractor = require('./dataExtractor');

var root = __dirname+'/../data';

var extensionMap = {
	pdf : {
		type : 'metadata'
	},
	spectra : {
		type : 'data',
		parser : 'csv-tab'
	},
	zip : {
		type : 'compressed'
	},
	csv : {
		type : 'both',
		parser : 'csv-comma'
	},
	xlsx : {
		type : 'both',
		parser : 'excel'
	},
	kml : {
		type : 'metadata'
	},
	rtf : {
		type : 'metadata'
	},
	jpg : {
		type : 'metadata'
	},
	png : {
		type : 'metadata'
	},
	txt : {
		type : 'both',
		parser : 'csv-tab'
	}
}

exports.parse = function(req, res, user) {
	console.log(user);

	if( req.files && req.files.file ) {

		var info = {
			user : user,
			file : req.files.file,
			root : root+'/'+user.id
		};

		run(['clean', 'mv', 'unzip', 'walk', 'parse', 'extract'], info, function(err){
			if( err ) res.send(err);
			res.send(info);
		});
	}
}

function run(workflow, info, done) {
	async.eachSeries(workflow,
		function(op, callback) {
			ops[op](info, callback);
		},
		function(err){
			done(err);
		}
	);	
}


var ops = {
	// clean users directory
	clean : function(info, next) {
		checkOrCreate(root);
		checkOrCreate(info.root);

		child = exec('rm -rf '+info.root+'/*', 
		  function (error, stdout, stderr) {
		    next(); 
		});
	},

	// unzip package and remove zip if that's what they uploaded
	unzip : function(info, next) {
		var f = info.file;
		if( f.originalFilename.match(/.*\.zip$/) ) {
			child = exec('cd '+info.root+' && unzip '+f.originalFilename.replace(/\s/g,'\ '), 
			  function (error, stdout, stderr) {
			  	fs.unlink(info.root+'/'+f.originalFilename);
			    next(); 
			});
		} else {
			next();
		}
	},

	// move file from tmp to user directory
	mv : function(info, next) {
		fs.renameSync(info.file.path, info.root+'/'+info.file.originalFilename);
		next();
	},

	// walk the files and see what we have
	walk : function(info, next) {
		child = exec('cd '+info.root+' && find . ', 
		  function (error, stdout, stderr) {

		    var allFiles = stdout.split('\n');
		    var files = [];

		    for( var i = 0; i < allFiles.length; i++ ) {
		    	allFiles[i] = allFiles[i].replace(/^\.\//,'');

		    	if( allFiles[i].length == 0 || allFiles[i].match(/^\..*$/) ) continue;

		    	var path = allFiles[i].split('/'), file;
		    	if( path.length > 1 ) {
		    		file = path.splice(path.length-1, 1)[0];
		    		path = './'+path.join('/');
		    	} else {
		    		file = path[0];
		    		path = './';
		    	}

		    	var parts = file.split('.');
		    	var type = 'unknown';
		    	var parser = 'unknown';

		    	var ext = extensionMap[parts[parts.length-1]];
		    	if( parts.length > 0 && ext ) {
		    		type = ext.type;
		    		if( ext.parser ) parser = ext.parser;
		    	}

		    	files.push({
		    		path : path,
		    		file : file,
		    		type : type,
		    		parser : parser
		    	});
		    }
		    info.data = files;

		    next();
		});
	},

	parse : function(info, next) {
		async.eachSeries(info.data,
			function(file, callback) {
				runParser(file, info.user, callback);
			},
			function(err){
				next();
			}
		);
	},

	extract : function(info, next) {
		async.eachSeries(info.data,
			function(file, callback) {
				runExtracter(file, callback);
			},
			function(err){
				next();
			}
		);
	}
}

function runExtracter(file, callback) {
	if( !file.contents ) return callback();
	dataExtractor.extract(file, {}, function(err, contents) {
		file.contents = contents;
		callback();
	});
}

function runParser(file, user, callback) {
	if( !file.parser ) return callback();
	if( file.parser == 'unknown' ) return callback();

	if( file.parser.match(/csv-.*/) ) {
		csvParser.parse(root+'/'+user.id+'/'+file.path+'/'+file.file, file.parser.split('-')[1], function(err, data){
			if( err ) file.error = err;
			else file.contents = data;
			callback();
		});
	} else if ( file.parser == 'excel' ) {
		excelParser.parse(root+'/'+user.id+'/'+file.path+'/'+file.file, function(err, data){
			if( err ) file.error = err;
			else file.contents = data;
			callback();
		});
	} else {
		callback();
	}
}


//  Directory upload functions
function checkOrCreate(dir) {
	if (!fs.existsSync(dir)) {
    	fs.mkdirSync(dir);
	}
}

