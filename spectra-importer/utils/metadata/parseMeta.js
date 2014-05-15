var fs = require('fs');

var contents = fs.readFileSync('./metadata.csv','utf-8');
contents = contents.split('\n');

var json = {};
for( var i = 1; i < contents.length; i++ ) {
    var c = contents[i].replace(/%/g,'Percent').split(',');
    json[c[1]] = {
        cat  : c[3],
        type : c[6].replace(/_val/,'')
    };
}

fs.writeFileSync('../../public/metadata.js', 'esis.metadata='+JSON.stringify(json));


var byCat = {};
for( var key in json ) {
	var item = json[key];

	if( !byCat[item.cat] ) byCat[item.cat] = [];
	byCat[item.cat].push(key);
}

var template = '';
for( var key in byCat ) {
	template += key+'\n';
	for( var i = 0; i < byCat[key].length; i++ ) {
		template += byCat[key][i]+'=\n';
	}
	template += '\n';
}
fs.writeFileSync('../../public/metadata_map', template);
