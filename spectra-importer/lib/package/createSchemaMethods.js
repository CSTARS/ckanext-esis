// attributes that have a direct mapping to CKAN standard attributes,
// so they should not be wrapped up in the 'extras' fields.  IE, use
// these functions.
var ckanAttriutes = ['Keywords', 'Website', 'Author', 'Author Email',
'Maintainer Email', 'Maintainer'];

module.exports = function(attribute, Package) {
  if( attribute.name === 'Keywords' || attribute.name === 'Website' ) return;
if(attribute.name === 'NASA GCMD Science & Services Keywords') debugger;
  if( attribute.input === 'controlled' ) {
    createControlledInput(attribute, Package);
  } else if( attribute.input === 'split-text' ) {
    createControlledInput(attribute, Package);
  } else if( attribute.input === 'controlled-single' ) {
    createSingleInput(attribute, Package);
  } else if( attribute.input === 'text' || attribute.input === 'latlng' ) {
    createInput(attribute, Package);
  }
};

function createInput(attribute, Package) {
  var name = attribute.name.replace(/ /g, '');

  Package.prototype['get'+name] = function() {
    return this.getExtra(attribute.name);
  };

  Package.prototype['set'+name] = function(value) {
    this.setExtra(attribute.name, value+'');
    this._onUpdate(attribute.name);
  };
}

function createSingleInput(attribute, Package) {
  var name = attribute.name.replace(/ /g, '');

  Package.prototype['get'+name] = function() {
    return this.getExtra(attribute.name);
  };

  Package.prototype['set'+name] = function(value) {
    var t = tokenize(value);

    for( var i = 0; i < attribute.vocabulary.length; i++ ) {
      if( tokenize(attribute.vocabulary[i]) === t ) {
        this.setExtra(attribute.name, attribute.vocabulary[i]);
        this._onUpdate(attribute.name);
        return;
      }
    }

    if( attribute.allowOther ) {
      this.setExtra(attribute.name, 'Other');
      this.setExtra(attribute.name+' Other', value);
      this._onUpdate(attribute.name);
    } else {
      this.setExtra(attribute.name, '');
    }
  };

  if( attribute.allowOther ) {
    Package.prototype['get'+name+'Other'] = function() {
      return this.getExtra(attribute.name+' Other');
    };
  }
}

function createControlledInput(attribute, Package) {
  var name = attribute.name.replace(/ /g, '');

  Package.prototype['get'+name] = function() {
    var attr = this.getExtra(attribute.name);
    if( !attr ) return [];
    return attr.split(',').map(cleanTerm);
  };

  if( attribute.allowOther ) {
    Package.prototype['get'+name+'Other'] = function() {
      var attr = this.getExtra(attribute.name+' Other');
      if( !attr ) return [];
      return attr.split(',').map(cleanTerm);
    };
  }

  Package.prototype['set'+name] = function(value) {
    if( !value ) {
      this.setExtra(attribute.name, null);
      if( attribute.allowOther ) {
        this.setExtra(attribute.name+' Other', null);
      }

      this._onUpdate(attribute.name);
      return;
    }

    var terms;
    if( !Array.isArray(value) ) {
      value = value+'';
      terms = value.split(',');
    } else {
      terms = value;
    }

    terms = terms.map(cleanTerm);

    if( attribute.input === 'controlled' ) {
      var values = getValues(terms, attribute.vocabulary);

      if( attribute.allowOther && values.other.length > 0 && values.valid.indexOf('Other') == -1 ) {
        values.valid.push('Other');
      }

      this.setExtra(attribute.name, values.valid.join(', '));
      if( attribute.allowOther ) {
        this.setExtra(attribute.name+' Other', values.other.join(', '));
      }

    } else if( attribute.input === 'split-text' ) {
      this.setExtra(attribute.name, terms.join(', '));
    }

    this._onUpdate(attribute.name);
  };
}

function cleanTerm(txt) {
  return txt.trim();
}

function getValues(terms, vocabulary) {
  var valid = [];
  var other = [];

  var map = {};
  vocabulary.forEach(function(name){
    map[tokenize(name)] = name;
  });

  var t;
  for( var i = 0; i < terms.length; i++ ) {
    t = tokenize(terms[i]);

    if( map[t] ) {
      if( valid.indexOf(map[t]) === -1 ) {
        valid.push(map[t]);
      }
    } else {
      if( other.indexOf(map[t]) === -1 ) {
        other.push(terms[i].trim());
      }
    }
  }

  return {
    valid : valid,
    other : other
  };
}

function tokenize(name) {
  return name.toLowerCase().replace(/\s/g, '');
}
