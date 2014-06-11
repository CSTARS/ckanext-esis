esis.app.groupBy = (function(){

	var attribute = '';
	var sort = '';
	var description = '';

	var current;
	var existingData;

	function init() {
		$('#groupby-attr-input').on('change', function(){
			attribute = $(this).val();
			_updateGroup();
		});
		$('#groupby-sort-input').on('change', function(){
			sort = $(this).val();
		});
		$('#groupby-description-input').on('change', function(){
			description = $(this).val();
		});

		$('#groupby-update-btn').on('click', function(){
			_updateJsonPackage($(this).addClass('disabled').html('Updating...'));
		});
	}

	function _getKey() {
        var key = esis.key;
        if( window.__ckan_ && window.__ckan_.user ) key = __ckan_.user.apikey;
        return key;
    }

	function _updateJsonPackage(btn) {
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
                                
                            	esis.uploader.uploadSpectraResource(
						            esis.structures.importer.getPackageName(), 
						            esis.structures.importer.createSpectraJsonResource(),
						            null,
						            function(){
						                alert('Updated!');
						                btn.removeClass('disabled').html('Update');
						            }
						        );

                            });
                            return;
                        }
                    }
                } else {
                    callback();
                }
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

	function showUpdateButton() {
		$('#groupby-update-btn').show();
	}

	function hideUpdateButton() {
		$('#groupby-update-btn').hide();
	}

	function update() {
		// find all metadata elements
		var fields = {};

		current = esis.structures.importer.createSpectraJsonResource(true);
		_joinFields(current, fields);

		existingData = esis.existingData.get();
		if( existingData ) _joinFields(existingData, fields);
		
		var ele = $('#groupby-sort-input');
		ele.html('<option></option>');
		for( var key in fields ) {
			ele.append($('<option value="'+fields[key]+'" '+(fields[key] == sort ? 'selected' : '')+'>'+key+'</option>'));
		}

		ele = $('#groupby-attr-input');
		ele.html('<option></option>');
		for( var key in fields ) {
			ele.append($('<option value="'+fields[key]+'" '+(fields[key] == attribute ? 'selected' : '')+'>'+key+'</option>'));
		}

		if( attribute && attribute != '' ) {
			_updateGroup();
		}
	}

	function _updateGroup() {
		var parts = attribute.split('.');
		var groups = {};

		_groupBy(parts[0], parts[1], current.data, groups);
		if( existingData ) _groupBy(parts[0], parts[1], existingData.data, groups);


		var ul = '<ul>';
		for( var key in groups ) ul += '<li><b>'+key+':</b> '+groups[key]+'</li>';
		$('#groupby-info').html('<h4>Groups</h4>'+ul+'</ul>');
	}

	function _groupBy(type, attribute, data, groups) {
		var val;
		for( var i = 0; i < data.length; i++ ) {
			if( data[i][type] && data[i][type][attribute] ) {
				val = data[i][type][attribute];
				if( !groups[val] ) groups[val] = 1;
				else groups[val]++;
			}
		}
	}

	function _joinFields(dataset, fields) {
		if( !dataset ) return;

		for( var i = 0; i < dataset.data.length; i++ ) {
			var d = dataset.data[i];
			for( var key in d.ecosis ) {
				if( !fields[key] ) fields[key] = 'ecosis.'+key;
			}
			for( var key in d.metadata ) {
				if( !fields[key] ) fields[key] = 'metadata.'+key;
			}
		}
	}

	function get() {
		console.log(attribute);
		return {
			attribute : attribute,
			sort : sort,
			description : description
		}
	}

	function set(vals) {
		if( !vals ) return;

		attribute = vals.attribute;
		sort = vals.sort;
		description = vals.description;
	}

	return {
		update : update,
		init : init,
		get : get,
		set : set,
		showUpdateButton : showUpdateButton,
		hideUpdateButton : hideUpdateButton
	}

})();