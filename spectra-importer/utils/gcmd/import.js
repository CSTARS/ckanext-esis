var MongoClient = require('mongodb').MongoClient;
var keywords = require('./gcmd');
var dbIndex = require('./dbIndex');
var async = require('async');

// Connection URL
var url = 'mongodb://localhost:27017/ecosis';
var database;

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  database = db;
  var collection = db.collection('gcmd');
  collection.remove({}, function(){
    insert(collection);
  });
});

function insert(collection) {
  collection.insert(keywords, {w: 1}, function(err){
      if( err ) {
        console.log(err);
      }
      
      collection.dropIndex('KeywordIndex', {w:1}, function(){
        dbIndex(collection, function(){
              database.close();
        });
      });
  });

  // async.eachSeries(
  //   traits,
  //   function(trait, next) {
  //     collection.insert(trait, {w: 1}, function(err){
  //         if( err ) {
  //           console.log(err);
  //         }
  //         next();
  //     });
  //   },
  //   function(err) {
  //     collection.dropIndex('TextIndex',{w:1}, function(){
  //       textIndex(collection, function(){
  //             database.close();
  //       });
  //     });
  //   }
  // );
}