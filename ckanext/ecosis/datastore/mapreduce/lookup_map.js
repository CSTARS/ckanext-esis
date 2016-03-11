function() {
    var pkg = this.value;
    var keys = ['Keywords', 'Common Name', 'Latin Genus', 'Latin Species', 'Theme'];

    for( var i = 0; i < keys.length; i++ ) {
        if( !pkg[keys[i]] ) continue;

        var array = pkg[keys[i]];
        for( var j = 0; j < array.length; j++ ) {
            emit(keys[i]+'-'+array[j], {key: keys[i], value: array[j], count: 1})
        }
    }

    if( pkg.ecosis && pkg.ecosis.organization ) {
        emit('ecosis.organization-'+pkg.ecosis.organization, {key: 'ecosis.organization', value: pkg.ecosis.organization, count: 1});
    }
}