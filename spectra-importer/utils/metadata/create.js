var fs = require('fs');

var schema = fs.readFileSync(__dirname+'/../../../../ecosis-data-tool/app/schema.json');
fs.writeFileSync(__dirname+'/../../core/schema.json', schema, 'utf-8');

schema = JSON.parse(schema);
var map = '';

for( var key in schema ) {
    map += key+'\n';
    
    for( var i = 0; i < schema[key].length; i++ ) {
        map += schema[key][i].name+'=\n';
    }
    map += '\n';
}

fs.writeFileSync(__dirname+'/../../app/metadata_map', map, 'utf-8');
