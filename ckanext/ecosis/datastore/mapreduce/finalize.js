function(key, item) {
    var data = [];

    item.tmp__schema__.wavelengths = Object.keys(item.tmp__schema__.wavelengths);
    item.tmp__schema__.metadata = Object.keys(item.tmp__schema__.metadata);

    for( var key in item ) {

        if( key == 'tmp__schema__' ) continue;

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