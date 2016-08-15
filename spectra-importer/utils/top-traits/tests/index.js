var rdf = require('rdf');
var fs = require('fs');

var turtleParser = new rdf.TurtleParser();
var text = fs.readFileSync('./test.txt', 'utf-8');
turtleParser.parse(text, function(resp) {
  var t = resp.indexOPS[]
  console.log(resp.graphify());
  // console.log(JSON.stringify(resp.indexSOP, '  ', '  '));
  // console.log('----------');
  // console.log(JSON.stringify(resp.indexOPS, '  ', '  '));
});