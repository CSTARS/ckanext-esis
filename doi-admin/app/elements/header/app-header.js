var rest = require('../../../lib/rest');

Polymer({
    is: 'app-header',
    ready : function() {
        rest.getUserInfo(function(resp){
            if( !resp.loggedIn ) {
                window.location = '/user/login';
            } else if( !resp.isAdmin ) {
                alert('Nope');
                window.location = '/';
            }
        });
    }
});
