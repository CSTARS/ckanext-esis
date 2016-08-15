var request = require('superagent');
var csv = require("fast-csv");
var fs = require('fs');
var path = require('path');

var csvFile = path.join(__dirname, 'gcmd.csv');
var schemaFile = path.join(__dirname, 'gcmd.json');

var url = 'https://docs.google.com/spreadsheets/d/';
var sheetId = '1aEZWLKcRh1kp7KA9Asp5SSdlXA_cPE6bGPqYGuVyrvk';
var path = sheetId+'/export';
var params = {
  format : 'csv',
  id : 'sheetId'
}


function get() {
  request
    .get(`${url}${path}`)
    .query(params)
    .end(function(err, resp){
      if( err ) {
        return console.error(err);
      }

      fs.writeFileSync(csvFile, resp.text);
      parse();
    });
}

function parse() {
  var data = [];
  csv
    .fromPath(csvFile)
    .on('data', function(row){
        data.push(row);
    })
    .on('end', function(){
      data.splice(0, 2); // remove header
      toSchema(data);
    });
}

function toSchema(rows) {
  rows = rows.map(function(row){
    row = {
      id : row.pop(),
      keywords : row
    }

    for( var i = row.keywords.length-1; i >= 0; i-- ) {
      if( !row.keywords[i] ) row.keywords.splice(i, 1);
      else row.keywords[i] = row.keywords[i].toLowerCase();
    }

    return row;
  });

  fs.writeFileSync(schemaFile, JSON.stringify(rows));
}

get();