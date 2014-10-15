function(key, item) {
    function bucketTest(attr, item) {
        var repeatCount = item._repeats[attr];
        var arr = item[attr];

        // if there are less than 10 items, we are good
        if( arr.length <= 10 ) {
            item._repeats[attr] = {
                count : repeatCount
            }
            return true;
        }

        // if we have at least 20% of the items in a bucket, we are fine
        if( Math.floor( item.ecosis.spectra_count * .20 ) <= repeatCount ) return true;

        return false;
    }

    for( var key in item ) {
        if( Array.isArray(item[key]) ) {
            if( !bucketTest(key, item) ) {
                delete item[key];
            }
        }
    }

    delete item._repeats;

    return item;
}