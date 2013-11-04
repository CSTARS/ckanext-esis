// hack for header menu. make sure correct menu is set
var path = window.location.pathname.split("/");
if( path.length > 1 ) {
    if( path[1] == "dataset" ) {
        $("header.masthead nav li a[href='/spectral']").parent().removeClass("active");
    } else if ( path[1] == "spectral" ) {
        $("header.masthead nav li a[href='/dataset']").parent().removeClass("active");
    }
}