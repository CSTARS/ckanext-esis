if( !window.esis ) window.esis = {};

esis.host = window.location.host.match(/.*localhost.*/) ? 'http://192.168.1.6:5000' : '';

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
    url : '/metadata.js',
    dataType : 'json',
    success :function(resp) {
        esis.metadata = resp;
    },
    error : function(err, err2) {
        console.log(err);
    }
});
