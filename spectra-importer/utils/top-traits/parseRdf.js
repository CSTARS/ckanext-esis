var rdf = require('rdf');
var fs = require('fs');

var turtleParser = new rdf.TurtleParser();

module.exports = function(text, callback) {
  turtleParser.parse(text, function(resp) {
    var trees = toTrees(resp.indexSOP);
    callback(trees)
  });
}

function toTrees(index) {
  var roots = [];

  for( var key in index ) {
    if( !key.match(/^_:.*$/) ) {
      roots.push(index[key]);
    }
  }

  roots = roots.map((root) => {
    var tree = {};
    crawl(tree, root, index);
    return tree;
  });

  return roots;
}

function crawl(tree, branch, index) {
  for( var key in branch ) {
    if( key.match(/^_:.*$/) ) {
      var k = Object.keys(branch[key])[0];
      applyBranch(tree, k, index[key], index)
      // applyBranch(tree, key, branch, index);
    } else {
      applyValue(tree, branch[key], index);
    }
  }
}

function applyBranch(tree, key, branch, index) {
  var term = key.split('#')[1];

  tree[term] = {};
  crawl(tree[term], branch, index);
}

function applyValue(tree, obj, index) {
  var key = Object.keys(obj)[0];

  var term = key.split('#');
  if( term.length === 1 ) term = term[0];
  else term = term[1];

  var value = getValue(obj[key]);

  if( index['_:'+value] ) {
    tree[term] = {};
    applyBranch(tree[term], key, index['_:'+value], index);
  } else {
    if( tree[term] ) {
      if( typeof tree[term] === 'string' ) tree[term] = [tree[term]];
      tree[term].push(value);
    } else {
      tree[term] = value
    }
  }
}

function getValue(item) {
  var val = item.object ? item.object.nominalValue : item.nominalValue;
  if( val.match(/^http.*#.*/) ) {
    return val.split('#')[1];
  }
  return val;
}