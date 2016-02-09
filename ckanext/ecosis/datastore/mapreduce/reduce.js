function(key, spectra){
        var searchObj = {
            'data_keys__' : {}
        };

        if( typeof scope !== 'undefined' ) {
            searchObj.scope = Object.keys(scope.schema)
        }
        
        var ignoreList = ['_id','datapoints', 'ecosis'];

        // this is only for non-datapoints.  datapoint keys were already cleaned in push
        function cleanKey(key) {
            return key.replace(/\./g, '_');
        }

        function setValue(measurement, key) {
            var value = measurement[key];

            if( typeof value === 'object' ) {
                var values = value;

                if( !searchObj[key] ) searchObj[key] = {};

                for( var vkey in values ) {
                   if( searchObj[key][vkey] ) searchObj[key][vkey] += values[key];
                   else searchObj[key][vkey] = 1;
                }

            } else {
                // is this new or are we pushing to an array?
                if( value === null ) return;
                if( value === '' ) return;

                // don't include values that have over 100 characters.  Assume not good filter
                if( typeof value == 'string' && value.length > 100 ) return;

                key = cleanKey(key);

                if( !searchObj[key] ) searchObj[key] = {};

                if( searchObj[key][value] ) searchObj[key][value] += 1;
                else searchObj[key][value] = 1;
            }
        }

        var i, j, measurement, key, arr;
        for( i = 0; i < spectra.length; i++ ) {
            measurement = spectra[i];

            // TODO: figure out bubbling of geojson
            //if( measurement.ecosis && measurement.ecosis.geojson ) {
            //    setValue(measurement.ecosis, 'geojson');
            //}

            if( measurement.data_keys__ ) {
                for( var key in measurement.data_keys__ ) {
                    searchObj['data_keys__'][key] = 1;
                }
            } else if ( measurement.datapoints ) {
                for( key in measurement.datapoints ) {
                    searchObj['data_keys__'][key] = 1;
                }
            }

            for( key in measurement ) {
                if( ignoreList.indexOf(key) != -1 ) continue;

                // it's a re-reduce
                setValue(measurement, key);
            }
        }

        return searchObj;
}