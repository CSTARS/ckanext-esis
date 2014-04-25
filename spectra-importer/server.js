var express = require('express');
var app = express();
var auth = require('./lib/auth.js');
var fs = require('fs');
var uploadParser = require('./lib/uploadParser.js');


var server = {
    //host : 'http://192.168.1.128',
    host : 'http://localhost',
    port : 3000
}

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
}

var checkAuth = function(req, res, next) {
    var isLoggedIn = auth.isLoggedIn(req);

    if( !isLoggedIn && (req.path == '/' || req.path.match(/index.html.*/)) ) {
    	return res.redirect('/login.html');
    } else if ( !isLoggedIn && req.path == '/rest/submit' ) {
        if( req.body.key ) {
            auth.loginWithKey(req, function(response) {
                if( response && response.body && typeof response.body == 'string' ) {
                    response.body = JSON.parse(response.body);
                }

                if( response && response.body &&response.body.error ) {
                    res.send(401);
                } else {
                    next();
                }
            });
        } else {
            res.send(401);
        }
        return;
    } else if ( isLoggedIn && req.path == '/login.html' ) {
    	return res.redirect('/');
    }
    next();
};

app.use(allowCrossDomain);
app.use(express.bodyParser({limit: '50mb'}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser('S3CRE7'));
app.use(express.cookieSession());
//app.use(checkAuth);
app.use(app.router);

app.use(express.static(__dirname + '/public'));

app.get('/rest/getShim', function(req, res){
    var shim = fs.readFileSync(__dirname+'/public/resource_shim.html', 'utf8');
    res.send(shim.replace('{{host}}', server.host+':'+server.port));
});

app.post('/rest/login', function(req, res) {
	auth.login(req, function(response) {
		res.send(response);
	});
});

app.post('/rest/submit', function(req, res) {
	uploadParser.parse(req, res, auth.getUser(req));
});

app.post('/rest/addResources', function(req, res) {
    console.log(req.body.data);
    console.log(req.body.package);
});



app.listen(server.port);