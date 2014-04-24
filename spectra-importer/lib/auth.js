var ckan = require('node-ckan');
var fs = require('fs');

var server = 'http://esis.casil.ucdavis.edu';

try {
	users = require(__dirname + '/../sessions.json');
} catch (e) {
	users = {};
}

ckan.setServer(server);


var sessionInfo = ['apikey', 'display_name', 'name', 'sysadmin', 'email', 'fullname', 'id'];

exports.login = function(req, callback) {
	var username = req.body.username;
	var password = req.body.password;

	if( !username || !password ) return callback({error:true, message:'Please provide a username and password'});

	var session = req.session;
	ckan.login(username, password, function(err){
		if( err ) return callback(err);
		getUser(username, session, callback);
	});
} 

exports.loginWithKey = function(req, callback) {
	ckan.setKey(req.body.key);
	getUser(req.body.username, req.session, callback);	
}

function getUser(username, session, callback) {
	ckan.exec('user_show', {id: username}, function(err, response){
		if( err ) return callback(err);

		if( response.success ) {

			session.userid = response.result.id;
			users[response.result.id] = {};
			for( var i = 0; i < sessionInfo.length; i++ ) {
				users[response.result.id][sessionInfo[i]] = response.result[sessionInfo[i]];
			}

			fs.writeFile(__dirname + '/../sessions.json', JSON.stringify(users) , function(err) {}); 

			callback({success:true});
		} else {
			callback({error:true, message:'Login Failed'});
		}
	});
} 

exports.getUser = function(req) {
	return users[req.session.userid];
}

exports.isLoggedIn = function(req) {
	if( !req.session ) return false;
	if( req.session.userid && users[req.session.userid] ) return true;
	return false;
}

exports.logout = function(req) {
	delete users[req.session.userid];
	req.session = null;
	fs.writeFile(__dirname + '/../sessions.json', JSON.stringify(users) , function(err) {}); 
}
