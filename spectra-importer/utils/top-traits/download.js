var request = require('superagent');
var async = require('async');
var fs = require('fs');
var rdfParser = require('./parseRdf');
var path = require('path');

var url = 'http://top-thesaurus.org/searchApi';

getList((text) => {
  rdfParser(text, run);
});

function run(traits) {
  console.log('Processing traits...\n');

  var results = [];
  var count = 0;

  async.eachSeries(
    traits,
    (trait, next) => {

      getTrait(trait.prefLabel, (text) => {
        rdfParser(text, (traitInfo) => {
          count++;

          if( traitInfo.length === 0 ) {
            return next();
          }

          process.stdout.clearLine();  // clear current text
          process.stdout.cursorTo(0);
          process.stdout.write(`${count} of ${traits.length}`);

          munge(trait.prefLabel, traitInfo);
          results.push(traitInfo);
          next();
        });
      });

    },
    (err) => {
      var outfile = path.join(__dirname, 'traits.json');
      fs.writeFileSync(outfile, JSON.stringify(results));
      console.log(`\ndone.  Results written to: ${outfile}`);
    }
  )
}

function munge(trait, traitInfo) {
  traitInfo = traitInfo[0];
  traitInfo.trait = trait;
  
  if( traitInfo.prefLabel ) {
    if( traitInfo.prefLabel.literalForm ) {
      traitInfo.preferredLabel = traitInfo.prefLabel.literalForm;
    }
    delete traitInfo.prefLabel;
  }
  
  if( traitInfo.altLabel ) {
    if( traitInfo.altLabel.literalForm ) {
      traitInfo.alternativeLabel = traitInfo.altLabel.literalForm;
    }
    delete traitInfo.altLabel;
  }
}

function getTrait(trait, callback) {
  request
    .get(url)
    .query({trait: trait})
    .end(function(err, resp){
      callback(resp.text);
    });
}

function getList(callback) {
  console.log(`Downloading trait list from: ${url}`);
  request
    .get(url)
    .query({allTraits: true})
    .end(function(err, resp){
      callback(resp.text);
    });
}