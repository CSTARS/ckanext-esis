function() {
    var pkg = this.value;
    var keys = ['Keywords', 'Common Name', 'Latin Genus', 'Latin Species'];

    for( var i = 0; i < keys.length; i++ ) {
        if( !pkg[keys[i]] ) continue;

        var array = pkg[keys[i]];
        for( var j = 0; j < array.length; j++ ) {
            emit(keys[i]+'-'+array[j], {key: keys[i], value: array[j], count: 1})
        }
    }
}