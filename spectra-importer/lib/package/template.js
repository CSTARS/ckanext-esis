
module.exports = function(Package) {
  Package.prototype.loadFromTemplate = loadFromTemplate;
};

// load from server provided template
function loadFromTemplate(ckanPackage)  {
  for( var key in this.data ) {
    if( ckanPackage[key] ) this.data[key] = ckanPackage[key];
  }

  if( ckanPackage.extras ) {
    var arr = [];
    for( var key in ckanPackage.extras ) {
      arr.push({
        key : key,
        value : ckanPackage.extras[key]
      });
    }
    this.data.extras = arr;
  }

  if( ckanPackage.tags ) {
    var arr = [];
    for( var i = 0; i < ckanPackage.tags.length; i++ ) {
      arr.push({
        name : ckanPackage.tags[i],
        display_name : ckanPackage.tags[i]
      });
    }
    this.data.tags = arr;
  }
}
