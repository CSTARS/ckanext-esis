var ecosis = (function(){
  var host = window.location.host.indexOf(':3000') > -1 ? 'http://localhost:5000' : window.location.protocol+'//'+window.location.host;
  var pages = ['add-resources', 'current-resources', 'advanced', 'push', 'basic'];

  function getVar(variable) {
    var query = window.location.search.substring(1);
  	var vars = query.split("&");
  	for (var i = 0; i < vars.length; i++) {
     		var pair = vars[i].split("=");
     		if( pair[0] == variable ) return pair[1];
  	}
  	return null;
  }

  var currentPkg = getVar('id');
  var ecosis = new Ecosis({
    host : host,
    package_id : currentPkg
  });

  var currentPage = '';
  function updatePage() {
    var hash = window.location.hash.replace(/#/,'');
    if( hash == 'currentPage' ) return;

    $('.page').hide();

    if( pages.indexOf(hash) > -1 ) show(hash);
    else show('basic');
  }

  function show(hash) {
    var ele = $('#'+hash+'.page').css('display','block')[0];
    if( ele && ele.onShow ) ele.onShow();
  }

  // show splash screen
  $(document).ready(function(){
    $('.page').hide();


    if( !currentPkg ) {
      updatePage();
      return;
    }

    $('#splash').modal();
    ecosis.ds.on('load', function(){
      updatePage();
      $('#splash').modal('hide');

      setTimeout(function(){
        document.querySelector('ecosis-header').onScoreUpdated();
      }, 1000);
    });

    document.querySelector('#basic').addEventListener('score-update', function() {
      document.querySelector('ecosis-header').onScoreUpdated();
    });
  });


  $(window).on('hashchange', updatePage);


  return ecosis;
})();
