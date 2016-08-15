module.exports = function(collection, callback) {
collection.createIndex(
   {
     preferredLabel : "text",
     alternativeLabel: "text",
     abbreviation: "text",
     relatedTerm: "text",
     label:"text",
   },
   {
     weights: {
       preferredLabel: 10,
       alternativeLabel: 3,
       abbreviation: 3,
       relatedTerm: 2,
       label: 1
     },
     name: "TextIndex",
     w : 1
   },
   callback
);

}
