function(key, item) {
    var data = [];
    for( var key in item.data_keys__ ) {
        data.push(key);
    }
    item.data_keys__ = data;


    for( var key in item ) {

        if( key == 'data_keys__' ) continue;

        // if at any point we want to level counts, this hash actually has them
        if( typeof item[key] === 'object' ) {
            var tmp = [];
            for( var k2 in item[key] ) {
                tmp.push(k2)
            }
            item[key] = tmp;
        } else {
            item[key] = [item[key]];
        }

    }

    return item;
}