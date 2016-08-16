module.exports = function(collection, callback) {
  collection.createIndex(
    {
      keywords : 1
    },
    {
      name: "KeywordIndex",
      w : 1
    },
    callback
  );
}
