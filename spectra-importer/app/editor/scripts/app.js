if( !window.esis ) window.esis = {};

esis.host = window.location.host.match(/.*localhost.*/) ? 'http://192.168.2.109:5000' : '';

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
