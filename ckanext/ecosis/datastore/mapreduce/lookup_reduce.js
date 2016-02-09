function(key, values){
        var result = {
            key : '',
            count : 0,
            value : ''
        };

        var v;
        for( i = 0; i < values.length; i++ ) {
            v = values[i];

            // key track of all metadata attribute and wavelengths
            if( v.count !== undefined) {
                result.count += v.count;
                result.key = v.key;
                result.value = v.value;
            }
        }

        return result;
}