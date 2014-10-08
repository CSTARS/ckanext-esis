function(key, item) {
    for( var key in item ) {
        if( Array.isArray(item[key]) && item[key].length == item.ecosis.spectra_count && item.ecosis.spectra_count > 50) {
            delete item[key];
        }
    }
    return item;
}