esis.existingData = (function(){

	var spectraPkg;
    var resources = [];

	function _getKey() {
        var key = esis.key;
        if( window.__ckan_ && window.__ckan_.user ) key = __ckan_.user.apikey;
        return key;
    }

	function init() {
		$('#existing-spectra').html('Checking for exisiting spectra...');

		_findSpectraPackage();
	}

	function _findSpectraPackage() {
		$.ajax({
            url: esis.host + '/api/action/package_show?id='+esis.structures.importer.getPackageName(),
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', _getKey());
            },
            success: function(response) {
                if( response.success ) {
                	if( !response.result.resources ) {
                		return _done();
                	} else if ( response.result.resources.length == 0 ) {
                		return _done();
                	}

                	for( var i = 0; i < response.result.resources.length; i++ ) {
                		if( response.result.resources[i].name == 'esis_spectral_data.json' ) {
                			_getSpectraPackage(response.result.resources[i].id);
                		} else {
                            resources.push(response.result.resources[i]);
                        }
                	}
                } else {
                	_done();
                }
            }
        });
	}

	function _getSpectraPackage(id) {
		$('#existing-spectra').html('Spectra found, importing...');
		$.ajax({
            url: esis.host + '/spectra/get?id='+id,
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', _getKey());
            },
            success: function(response) {
            	if( typeof response == 'string' ) spectraPkg = JSON.parse(response);
            	else spectraPkg = JSON.parse(response);

                console.log(spectraPkg);
            	_done(); 
            }
        });
	}

    function _deleteResource(id, callback) {
         $.ajax({
            type: 'POST',
            url: esis.host + '/api/action/resource_delete',
            data : JSON.stringify({id : id}),
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', _getKey());
            },
            success: function(response) {
               callback(response);
            }
        });
    }

    function _updateSpectraAfterDelete(id, callback) {
        if( !spectraPkg ) callback();
        var update = false;

        var newArr = [];
        for( var i = 0; i < spectraPkg.dataset.data.length; i++ ) {
            if( spectraPkg.dataset.data[i].resource_id != id ) {
                newArr.push(spectraPkg.dataset.data[i]);
            } else {
                update = true;
            }
        }
        spectraPkg.dataset.data = newArr;

        newArr = [];
        for( var i = 0; i < spectraPkg.dataset.join.length; i++ ) {
            if( spectraPkg.dataset.join[i].resource_id != id ) {
                newArr.push(spectraPkg.dataset.join[i]);
            } else {
                update = true;
            }
        }

        if( !update ) return callback();

        var resource = new esis.structures.Resource();
        resource.setContents(JSON.stringify(spectraPkg.dataset));
        resource.setFilename('esis_spectral_data.json');
        resource.setMimetype('application/json');

        esis.uploader.uploadSpectraResource(
            esis.structures.importer.getPackageName(), 
            resource,
            null,
            function(){
                callback();
            }
        );
    }

    function _getFiles() {
        var files = {};
        for( var i = 0; i < resources.length; i++ ) {
            files[resources[i].id] = {
                id           : resources[i].id,
                name         : resources[i].name,
                spectraCount : 0
            }
        }

        if( spectraPkg ) {
            for( var i = 0; i < spectraPkg.dataset.data.length; i++ ) {
                if( files[spectraPkg.dataset.data[i].resource_id] ) {
                    files[spectraPkg.dataset.data[i].resource_id].spectraCount++;
                }
            }
            for( var i = 0; i < spectraPkg.dataset.join.length; i++ ) {
                if( files[spectraPkg.dataset.join[i].resource_id] ) {
                    var f = files[spectraPkg.dataset.join[i].resource_id];
                    f.join_id = spectraPkg.dataset.join[i].join_id;
                    f.joinon = spectraPkg.dataset.join[i].joinon;
                }
            }
        }

        return files;
    }

    function get() {
        return spectraPkg;
    }

    function hasData() {
        if( spectraPkg ) return true;
        return false;
    }

    function removeResource(id) {
        for( var i = 0; i < resources.length; i++ ) {
            if( resources[i].id == id ) {
                resources.splice(i, 1);
                break;
            }
        }
    }

    function _deleteAll(callback) {
        if( 0 == resources.length ) {

            // find latest spectra package resource and delete
            $.ajax({
                url: esis.host + '/api/action/package_show?id='+esis.structures.importer.getPackageName(),
                beforeSend: function (request) {
                    request.setRequestHeader('Authorization', _getKey());
                },
                success: function(response) {
                    if( response.success ) {
                        if( !response.result.resources ) {
                            return callback();
                        } else if ( response.result.resources.length == 0 ) {
                            return callback();
                        }

                        for( var i = 0; i < response.result.resources.length; i++ ) {
                            if( response.result.resources[i].name == 'esis_spectral_data.json' ) {
                                _deleteResource(response.result.resources[i].id, function(resp){
                                    callback();
                                });
                                return;
                            }
                        }
                    } else {
                        callback();
                    }
                }
            });
        } else {
            var id = resources[0].id;
            var ele = $('#remove-'+id);
            ele.html('Removing').addClass('disabled');

            _deleteResource(id, function(resp){
                if( !resp.success ) return alert('Error removing resource :(');

                removeResource(id);
                $('#existing-resource-count').text(resources.length);

                ele.parent().hide('slow');
                setTimeout(function(){
                    ele.parent().remove();
                }, 2000);

                _deleteAll(callback);
            });
        }
    }

	function _done() {
        if( spectraPkg || resources.length > 0 ) {
            var files = _getFiles();

            var html = 
                '<a class="btn btn-danger pull-right" id="delete-all">Delete All</a><a id="delete-all-cancel" class="btn btn-default pull-right" style="display:none;margin-right:15px">Cancel</a>'+
                '<h4>Current Resources: <span id="existing-resource-count">'+resources.length+'</span> <a style="font-size:14px;cursor:pointer" id="inspect-existing">inspect</a></h4>'+
                '<div style="margin:20px;border:1px solid #ccc;border-radius:6px;max-height: 300px; overflow:auto; display: none" id="existing-overflow">';

            for( var key in files ) {
                var f = files[key];
                html += '<div style="margin: 5px 10px"><a class="btn btn-danger remove-btn" id="remove-'+f.id+'"><i class="icon-remove icon-white"></i></a> <b>'+f.name+'</b>'+
                            '<div style="margin: 5px 50px">'+
                                (f.spectraCount > 0 ? 'Spectra: '+f.spectraCount : '')+
                                (f.join_id ? 'Join Data: on "'+f.join_id+'" using '+(f.joinon.length > 0 ? f.joinon : 'attribute') : '')+
                            '</div>'+
                        '</div>';
            }
            html += '</div>';

            $('#existing-spectra').html(html);

            $('#existing-spectra').find('a.remove-btn').on('click', function(){
                var ele = $(this);
                var id = ele.attr('id').replace(/^remove-/,'');

                if( confirm('Are you sure your want to remove: '+files[id].name+
                    '\n\nThis resource and all of it\'s parsed spectra will be removed') ) {

                    ele.html('Removing...').addClass('disabled');

                    _deleteResource(id, function(resp){
                        if( !resp.success ) return alert('Error removing resource :(');

                        ele.html('Updating Spectra Resource...');
                        _updateSpectraAfterDelete(id, function(){

                            removeResource(id);
                            $('#existing-resource-count').text(resources.length);

                            ele.parent().hide('slow');
                            setTimeout(function(){
                                ele.parent().remove();
                            }, 2000);

                        });
                    });
                }
            });

            $('#inspect-existing').on('click', function(){
                $("#existing-overflow").toggle('slow');
            });

            $('#delete-all').on('click', function(){
                var text = $(this).text();
                if( text == 'Delete All' ) {
                    $(this).text('Are you sure?!');
                    $('#delete-all-cancel').show();
                    $("#existing-overflow").show('slow');
                } else if( text == 'Are you sure?!' ) {
                    _deleteAll(function(){
                        alert('Done!');
                        $('#existing-spectra').hide();
                    });
                }
            });

            $('#delete-all-cancel').on('click', function(){
                $(this).hide();
                $('#delete-all').text('Delete All');
            });

        } else {
            $('#existing-spectra').html('<div class="alert alert-info">No exisiting spectra found.</div>');
        }

        $('#addResources').removeClass('disabled');
	}

	return {
		init : init,
        get  : get,
        hasData : hasData
	}

})();