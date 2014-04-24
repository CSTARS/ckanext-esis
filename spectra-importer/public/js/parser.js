esis.parser = (function(){

	function parse(info, contents, callback) {
		var arr = [];

		if( info.ext == 'xlsx' ) {
			try {
				wb = XLSX.read(contents, {type: 'binary'});
				var count = 0;

				console.log(wb.SheetNames);
				wb.SheetNames.forEach(function(sheetName) {
					var csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
					$.csv.toArrays(csv, {}, function(err, data){
						if( err ) {
							count++;
							onComplete(err, null, info, count, wb.SheetNames.length, arr, callback);
							return;
						}

						esis.extractor.run(data, function(err, resp){
							count++;
							resp.sheetName = sheetName;
							onComplete(null, resp, info, count, wb.SheetNames.length, arr, callback);
						});
					});
				});
			} catch(e) {
				onComplete(e, null, info, 1, 1, arr, callback);
			}
		} else if( info.ext == 'xls' ) {
			try {
				wb = XLS.read(contents, {type: 'binary'});

				var count = wb.SheetNames.length;
				wb.SheetNames.forEach(function(sheetName) {
					var csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
					$.csv.toArrays(csv, {}, function(err, data){
						if( err ) {
							count++;
							onComplete(err, null, info, count, wb.SheetNames.length, arr, callback);
							return;
						}

						esis.extractor.run(data, function(err, resp){
							count++;
							resp.sheetName = sheetName;
							onComplete(null, resp, info, count, wb.SheetNames.length, arr, callback);
						});
					});
				});
			} catch(e) {
				onComplete(e, null, info, 1, 1, arr, callback);
			}
		} else if ( info.hasData ) {
			try {
				var options = {};
				if( info.parser == 'csv-tab' ) options.separator = '\t';
				if( info.parser == 'csv-4spaces' ) options.separator = '    ';
				if( info.parser == 'csv-2spaces' ) options.separator = '  ';

				$.csv.toArrays(contents, options, function(err, data){
					if( err ) return onComplete(err, null, info, 1, 1, arr, callback);

					esis.extractor.run(data, function(err, resp){
						if( err ) onComplete(err, null, info, 1, 1, arr, callback);
						else onComplete(null, resp, info, 1, 1, arr, callback);
					});
				});
			} catch(e) {
				onComplete(e, null, info, 1, 1, arr, callback);
			}
		} else {
			onComplete(null, null, info, 1, 1, arr, callback);
		}
	}

	function onComplete(err, data, info, index, total, arr, callback) {
		if( err ) {
			data = {
				error : err
			}
		} else if( !data ) {
			data = {
				error : 'Unknown parse error'
			}
		} else if( data.spectra.length == 0 && 
			Object.keys(data.metadata).length == 0 &&
			!data.joindata ) {
			data.warning = 'No metadata or spectra found';
		}

		if( total > 1 ) {
			if( data.sheetName ) {
				data.name = info.name + ' - ' + data.sheetName;
			} else {
				data.name = info.name + ' - ' + index;
			}
		}

		data.info = $.extend(true, {}, info);
		// don't want to add worksheets as resources
		data.info.type = 'data';

		arr.push(data);

		if( index == total ) callback(arr);
	}

	return {
		parse : parse
	}

})();