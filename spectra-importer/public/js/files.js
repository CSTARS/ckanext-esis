/*
esis.files = (function(){

	var filePanels = [];

	function init() {
		var dropZone = document.getElementById('drop_zone');
		dropZone.addEventListener('dragover', _handleDragOver, false);
		dropZone.addEventListener('drop', _handleFileSelect, false);

		document.getElementById('file').addEventListener('change', _handleFileSelect, false);

		// double check this made it into the window scope
		// if not xlsx parser will crap out
		if( !window.jszip ) {
			window.jszip = JSZip;
		}
	}

	function _handleFileSelect(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();

	    var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files; // FileList object.
	    for (var i = 0, f; f = files[i]; i++) {
            esis.structures.importer.addFile(f, $('#parseZip').is(':checked'));
	    	//var filePanel = new EsisUploadFile();
	    	//filePanel.init(f, $('#parseZip').is(':checked'));
	    }

	    $('#spectra-modify').show();
  	}

  	function _handleDragOver(evt) {
  		evt.stopPropagation();
  		evt.preventDefault();
  		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  	}

  	function add(filePanel) {
  		filePanels.push(filePanel);
  		return filePanels.length-1;
  	}

  	function show(index) {
  		var subIndex;
  		if( typeof index == 'string' ) {
  			var parts = index.split('-');
  			index = parseInt(parts[0]);
  			subIndex = parseInt(parts[1]);
  		}
  		if( index < 0 || index > filePanels.length ) return;
  		filePanels[index].show(subIndex);
  	}

  	function showStatus() {
  		var row1 = '';
  		var row2 = '';

  		var c = 0;
  		for( var i = 0; i < filePanels.length; i++ ) {
  			var d = filePanels[i].get();
            if( !d ) continue;

            if( d.error ) continue;
      		if( Array.isArray(d) ) {
    			for( var z = 0; z < d.length; z++ ) {
    	  			var item = d[z];

                    if( item.error ) continue;

    	  			for( var j = 0; j < item.spectra.length; j++ ) {
    	  				var card = createCard(item, j);

    		  			if( c % 2 == 0 ) row1 += card;
    		  			else row2 += card; 
    		  			c++;
    	  			}	  			
    		  	}
      		} else {
      			for( var j = 0; j < d.spectra.length; j++ ) {
    	  			var card = createCard(d, j);

    				if( c % 2 == 0 ) row1 += card;
    				else row2 += card; 
    				c++;
    	  		}
      		}		
    	}

  		$('#spectra-status-content').html(
  			'<h2>'+c+' Spectra Found</h2>'+
            '<div>'+
              '<span class="label label-success">File Level Metadata</span> ' +
              '<span class="label label-info">Spectra Level Metadata</span> ' +
              '<span class="label label-warning">Linked Metadata</span> ' +
            '</div>'+
  			'<div class="row-fluid">' +
  				'<div class="span6">'+row1+'</div>'+
  				'<div class="span6">'+row2+'</div>'+
  			'</div>'
  		);
  	}

  	function createCard(item, index) {
  		var s = item.spectra[index];
  		var card = '<div class="card"><h4>'+item.file+'</h4>'+
                '<table class="table">';

  		// add global metadata
  		for( var key in item.metadata ) {
  			card += '<tr><td><span class="label label-success">'+key+'</span></td><td>'+item.metadata[key]+'</td></tr>';
  		}

  		// add local metadata
  		for( var key in s.metadata ) {
  			card += '<tr><td><span class="label label-info">'+key+'</span></td><td>'+s.metadata[key]+'</td></tr>';
  		}
  		card += '</table>';

  		card += '<div style="margin:10px;max-height:300px;overflow:auto">'+JSON.stringify(s.data)+'</div>';

  		card += '</div>';
  		return card;
    }

    function addToCkan(callbacks) {
        var uploads = {
            files : [],
            spectra : []
        }

         if( d.spectra.length > 0 ) {
            _joinMetadata(d, joindata);

            uploads.spectra.push({
                metadata : d.metadata,
                spectra : d.spectra
            });
        } else if ( !d.spectraOnly && d.type == 'resource' ) {
            uploads.files.push(d);
        }
        

        var contents = JSON.stringify(uploads.spectra);
        uploads.files.push({
            file : {
                name : 'esis-spectral-data.json',
                type : 'application/json',
                size : contents.length
            },
            contents : contents
        });
        uploadFile(0, uploads.files, callbacks);
    }

    function _join() {
        // find all join data metadata
        var joindata = [];
        for( var i = 0; i < filePanels.length; i++ ) {
            if( filePanels[i].get().joindata ) {
                joindata.push(filePanels[i].get());
            }
        }
      
        for( var i = 0; i < filePanels.length; i++ ) {
            var d = filePanels[i].get();
            if( d.spectra.length > 0 ) {
                _joinMetadata(d, joindata);

                uploads.spectra.push({
                    metadata : d.metadata,
                    spectra : d.spectra
                });
            } else if ( !d.spectraOnly && d.type == 'resource' ) {
                uploads.files.push(d);
            }
        }
    }

    function _getJoinRow(file) {
        if( !file.joinId ) file.joinId = 'plotsample_id';
        for( var i = 0; i < file.joindata[0].length; i++ ) {
            if( joindata[0][i] == file.joinId ) return i;
        }
        alert('Metadata Join ID: '+file.joinId+' Not Found');
        return 0;
    }

    function _joinMetadata(data, joindata, row) {
        for( var z = 0; z < joindata.length; z++ ) {
            var row = _getJoinRow(joindata);

            for( var i = 0; i < joindata[z].length; i++ ) {
                var re = new RegExp(joindata[z][i][row]);
                if( data.name.match(re) ){
                    for( var j = 0; j < metadata[0].length; j++ ) {
                        data.metadata[metadata[0][j]] = metadata[i][j];
                    }
                    return;
                }
            }
        }
    }

    function uploadFile(index, list, callbacks) {
        if( list.length == index ) {
                callbacks.onComplete();
        } else {

            esis.uploader.upload(list[index], function(){
                index++;
                uploadFile(index, list, callbacks);
            }, callbacks);
        }
    }

  	return {
  		init : init,
  		add  : add,
  		show : show,
  		showStatus : showStatus,
        addToCkan : addToCkan
  	}

})();*/