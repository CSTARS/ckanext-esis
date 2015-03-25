if( !window.esis ) window.esis = {};

esis.host = window.location.host.indexOf(':3000') > -1 ? 'http://192.168.1.2:5000' : '';

// load user info, if not logged in, redirect to login page
esis.activeUser = {};
$.ajax({
    type : 'GET',
    url : esis.host+'/ecosis/userInfo',
    dataType : 'json',
    xhrFields: {
        withCredentials: true
    },
    success :function(resp) {
        esis.activeUser = resp;
        if( !esis.activeUser.loggedIn ) {
            window.location = esis.host+'/user/login';
        }
    },
    error : function(err, err2) {
        alert('Error retrieving user info :(');
    }
});

$.ajax({
    type : 'GET',
    url : '/schema.json',
    dataType : 'json',
    success :function(resp) {
        esis.schema = resp;

        esis.schemaMap = {};
        for( var key in esis.schema ) {
            for( var i = 0; i < esis.schema[key].length; i++ ) {
                esis.schemaMap[esis.schema[key][i].name] = esis.schema[key][i];
            }
        }
    },
    error : function(err, err2) {
        console.log(err);
    }
});
