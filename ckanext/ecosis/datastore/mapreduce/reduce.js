function(key, spectra){
        var searchObj = {
            tmp__schema__ : {
                wavelengths : {},
                metadata : {}
            }
        };
        
        var ignoreList = ['_id','datapoints', 'ecosis', 'tmp__schema__'];

        // this is only for non-datapoints.  datapoint keys were already cleaned in push
        function cleanValue(val) {
            return val.replace(/\./g, '_').trim().toLowerCase();
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

                if( key !== 'geojson' && key !== 'Citation') {
                    value = cleanValue(value);
                }

                if( value === '' ) return;

                if( !searchObj[key] ) searchObj[key] = {};

                if( searchObj[key][value] ) searchObj[key][value] += 1;
                else searchObj[key][value] = 1;
            }
        }

        var i, j, measurement, key, arr;
        for( i = 0; i < spectra.length; i++ ) {
            measurement = spectra[i];

            // key track of all metadata attribute and wavelengths
            if( measurement.tmp__schema__ ) {

                for( var key in measurement.tmp__schema__.wavelengths ) {
                    searchObj.tmp__schema__.wavelengths[key] = 1;
                }
                for( var key in measurement.tmp__schema__.metadata ) {
                    searchObj.tmp__schema__.metadata[key] = 1;
                }

            } else if ( measurement.datapoints ) {

                for( key in measurement.datapoints ) {
                    searchObj.tmp__schema__.wavelengths[key] = 1;
                }

            }

            for( key in measurement ) {
                if( ignoreList.indexOf(key) != -1 ) continue;

                searchObj.tmp__schema__.metadata[key] = 1;

                if( mapReduceAttribute.indexOf(key) == -1 ) {
                    continue;
                }

                // it's a re-reduce
                setValue(measurement, key);
            }
        }

        return searchObj;
}