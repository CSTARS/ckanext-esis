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
        $('#existing-count').html(' <i style="color:#888"> - checking...</i>');

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

                    var found = false;
                	for( var i = 0; i < response.result.resources.length; i++ ) {
                		if( response.result.resources[i].name == 'esis_spectral_data.zip' ) {
                			_getSpectraPackage(response.result.resources[i].id);
                            found = true;
                		} else {
                            resources.push(response.result.resources[i]);
                        }
                	}
                    if( !found ) _done();
                } else {
                    $('#existing-count').html(' <i style="color:red"> - Failed</i>');
                    $('#existing-spectra').html('Failed to load exisiting spectra');

                	_done();
                }
            },
            error : function() {
                $('#existing-count').html(' <i style="color:#888"> - Failed</i>');
                $('#existing-spectra').html('Failed to load exisiting spectra');
            }
        });
	}

	function _getSpectraPackage(id) {
		$('#existing-spectra').html('Spectra found, importing...');
        $('#existing-count').html(' <i style="color:#888"> - loading... ');
        


        var xhr = $.ajaxSettings.xhr();
        // attach progress handler to the XMLHttpRequest Object
        try {
            xhr.addEventListener("progress", function(evt){
                if (evt.lengthComputable) {  
                    var percentComplete = ((evt.loaded / evt.total)*100).toFixed(0);
                    $('#existing-count').html(' <i style="color:#888"> - loading... '+percentComplete+'%</i>');
                }
            }, false); 
        } catch(e) {}


		$.ajax({
            url: esis.host + '/spectra/get?compressed=false&id='+id,
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', _getKey());
            },
            xhr : function() {
                return xhr;
            },
            mimeType:'text/plain; charset=x-user-defined',
            success: function(response) {
                /* if we can get the zip import working;
                var zip;

                try {
                    zip = new JSZip();
                    zip.load(response);
                } catch (e) {
                    alert('Error extracting spectral zip file');
                    spectraPkg = {
                        data : [],
                        join : []
                    };
                    _done();
                    return;
                }

                var contents = '{"data":[],"join":[]}';

                for( var file in zip.files ) {
                    var zipEntry = zip.files[file];
                    if( zipEntry.name == 'esis_spectral_data.json' ) {
                        contents = zipEntry.asText();
                        break;
                    }
                }*/
                //delete zip;

            	spectraPkg = JSON.parse(response);
                console.log(spectraPkg);

                
            	_done(); 
            },
            error: function() {
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
        if( !spectraPkg ) return callback();
        var update = false;

        var newArr = [];
        if( spectraPkg.data ) {
            for( var i = 0; i < spectraPkg.data.length; i++ ) {
                if( spectraPkg.data[i].resource_id != id ) {
                    newArr.push(spectraPkg.data[i]);
                } else {
                    update = true;
                }
            }
        }
        spectraPkg.data = newArr;

        newArr = [];
        if( spectraPkg.join ) {
            for( var i = 0; i < spectraPkg.join.length; i++ ) {
                if( spectraPkg.join[i].resource_id != id ) {
                    newArr.push(spectraPkg.join[i]);
                } else {
                    update = true;
                }
            }
        }

        if( !update ) return callback();

        var resource = new esis.structures.Resource();
        resource.setContents(JSON.stringify(spectraPkg));
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
            for( var i = 0; i < spectraPkg.data.length; i++ ) {
                if( files[spectraPkg.data[i].resource_id] ) {
                    files[spectraPkg.data[i].resource_id].spectraCount++;
                }
            }
            for( var i = 0; i < spectraPkg.join.length; i++ ) {
                if( files[spectraPkg.join[i].resource_id] ) {
                    var f = files[spectraPkg.join[i].resource_id];
                    f.join_id = spectraPkg.join[i].join_id;
                    f.joinon = spectraPkg.join[i].joinon;
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
                            if( response.result.resources[i].name == 'esis_spectral_data.zip' ) {
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
                $('#existing-count').text(' ('+resources.length+')');

                ele.parent().parent().hide('slow');
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

            var html = '<table class="table table-stripped"><tr><th>Remove</th><th>Resource</th></tr>';

            for( var key in files ) {

                var f = files[key];
                html += '<tr><td><a class="btn btn-danger remove-btn" id="remove-'+f.id+'"><i class="icon-remove icon-white"></i></a></td>'+
                            '<td>'+
                                '<div><b>'+f.name+'</b></div>'+
                                (f.spectraCount > 0 ? 'Spectra: '+f.spectraCount : '')+
                                (f.join_id ? 'Join Data: on "'+f.join_id+'" using '+(f.joinon.length > 0 ? f.joinon : 'attribute') : '')+
                            '</td>'+
                        '</tr>';
            }
            html += '</table>'
            html += '<div style="height:50px">'+
                        '<a class="btn btn-primary" href="'+esis.host + '/spectra/download?id='+esis.structures.importer.getPackageName()+'" target="_blank">Download All</a>'+
                        '<a id="delete-all-cancel" class="btn btn-default pull-right" style="display:none;margin-left:15px">Cancel</a>'+
                        '<a class="btn btn-danger pull-right" id="delete-all">Delete All</a>'+
                    '</div>';

            $('#existing-count').html(' ('+resources.length+')');

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
                            $('#existing-count').text(' ('+resources.length+')');

                            ele.parent().parent().hide('slow');
                            setTimeout(function(){
                                ele.parent().remove();
                            }, 2000);

                        });
                    });
                }
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
                        $('#nav-spectra-start').trigger('click');
                        $('#existing-count').html(' (0)');
                    });
                }
            });

            $('#delete-all-cancel').on('click', function(){
                $(this).hide();
                $('#delete-all').text('Delete All');
            });

            esis.app.setMetadataMap(spectraPkg.map);

            esis.app.groupBy.set(spectraPkg.group_by);
            esis.app.groupBy.showUpdateButton();

        } else {
            esis.app.setMetadataMap({});
            $('#existing-count').html(' (0)');
            $('#existing-spectra').html('<div class="alert alert-info">No exisiting spectra found.</div>');
            esis.app.groupBy.hideUpdateButton();
        }

        $('#addResources').removeClass('disabled');
	}

	return {
		init : init,
        get  : get,
        hasData : hasData
	}

})();