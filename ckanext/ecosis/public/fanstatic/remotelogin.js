function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

(function() {

    var controllerUrl = '/ecosis/user/jwtLogin';
    var username = $('#field-login');
    var password = $('#field-password');
    var loginBtn = $('button[type="submit"]').removeAttr('type');
    $('form[action]').removeAttr('action').removeAttr('method');


    var returnTo = getParameterByName('returnTo');
    $('.remote-site-label').html(getParameterByName('label'));
    window.document.title = getParameterByName('label')+' Login';

    loginBtn.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        $.post(
            controllerUrl,
            {
                username : username.val(),
                password : password.val()
            },
            function(data) {
                if( data.loggedIn ) {
                    window.location = returnTo+'?jwt='+data.jwt;
                } else {
                    alert('Invalid username or password');
                }
            }
        );
    });


//    $.get(controllerUrl, function(data) {
//        if( data.loggedIn ) {
//            window.location = returnTo+'?jwt='+data.jwt;
//        }
//    });
})();

