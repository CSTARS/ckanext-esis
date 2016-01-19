var ecosis = (function(){
  var host = window.location.host.indexOf(':3000') > -1 ? 'http://192.168.2.138:5000' : window.location.protocol+'//'+window.location.host;
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

  function onLoad(){
    updatePage();
    $('#splash').modal('hide');

    setTimeout(function(){
      document.querySelector('ecosis-header').onScoreUpdated();
    }, 1000);
  }

  // show splash screen
  $(document).ready(function(){

    ecosis.errorPopup = document.querySelector('ecosis-error-popup');
    $('.page').hide();

    if( !currentPkg ) {
      updatePage();
      return;
    }

    setTimeout(function(){
      if( ecosis.ds.loaded || ecosis.ds.loadingError ) {
        if( ecosis.ds.loadingError ) {
          // ERROR 1
          ecosis.ds.loadingError.code = 1;
          ecosis.errorPopup.show(ecosis.ds.loadingError);
        } else {
          onLoad();
        }
      } else {
        $('#splash').modal();
        ecosis.ds.on('load-error', function(e){
          $('#splash').modal('hide');

          // ERROR 2
          e.code = 2;
          ecosis.errorPopup.show(e);
        });

        ecosis.ds.on('load', onLoad);
      }

      document.querySelector('#basic').addEventListener('score-update', function() {
        document.querySelector('ecosis-header').onScoreUpdated();
      });
    }, 1000);

  });


  $(window).on('hashchange', updatePage);


  return ecosis;
})();
