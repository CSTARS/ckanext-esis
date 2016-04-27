var rest = require('../../../lib/rest');

Polymer({
    is: 'app-header',
    ready : function() {
        rest.getUserInfo(function(resp){
            console.log(resp);
        });
    }
});
