var dontSplit = ['Processing Information Details'];

module.exports = function(attribute, Package) {
  if( attribute.name === 'Keywords' || attribute.name === 'Website' ) return;

  if( attribute.input === 'controlled' ) {
    createControlledInput(attribute, Package);
  } else if( attribute.input === 'split-text' ) {
    createControlledInput(attribute, Package);
  }
};


function createControlledInput(attribute, Package) {
  var name = attribute.name.replace(/ /g, '');

  Package.prototype['get'+name] = function() {
    return this.getExtra(attribute.name).split(',').map(cleanTerm);
  };

  Package.prototype['set'+name] = function(value) {
    if( !value ) {
      this.setExtra(attribute.name, null);
      if( attribute.allowOther ) {
        this.setExtra(attribute.name+' Other', null);
      }
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

      this.setExtra(attribute.name, values.valid.join(', '));
      if( attribute.allowOther ) {
        this.setExtra(attribute.name+' Other', values.other.join(', '));
      }

    } else if( attribute.input === 'split-text' ) {
      this.setExtra(attribute.name, terms.join(', '));
    }
  };

/*
  Package.prototype['add'+name] = function(value) {
    if( typeof value !== 'string' ) {
      throw(new Error('value must be type string'));
    }

    var currentValue = this.getExtra(name).split(',').map(cleanTerm);
    var currentOther = this.getExtra(name+' Other').split(',').map(cleanTerm);

    if( attribute.type === 'controlled' ) {
      var t = tokenize(value);
      var valid = false;
      for( var i = 0; i < attribute.vocabulary.length; i++ ) {
        if( tokenize(attribute.vocabulary[i]) === t ) {
          t = attribute.vocabulary[i];
          valid = true;
          break;
        }
      }

      if( valid ) {
        currentValue.push(t);
        this.setExtra(attribute.name, currentValue.join(', '));
      } else if( attribute.allowOther ) {
        currentOther.push(t);
        this.setExtra(attribute.name, currentValue.join(', '));
      }
    }

  };
*/
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
