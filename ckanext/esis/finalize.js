function(key, item) {
    for( var key in item ) {
        if( Array.isArray(item[key]) && item[key].length == item.count && item.count > 50) {
            delete item[key];
        }
    }
    return item;
}