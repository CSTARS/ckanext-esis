var EventEmitter = require("events").EventEmitter;

module.exports = function(config) {
  this.ckan = config.ckan;
  if( this.ckan ) this.ckan.ds = this;

  // is this an existing dataset
  this.editMode = config.package_id ? true : false;

  // existing package id
  this.package_id = config.package_id;

  this.data = {
    title : '',
    name : '',
    notes : '',
    author : '',
    author_email : '',
    license_id : '',
    license_title : '',
    maintainer : '',
    maintainer_email : '',
    version : '',
    owner_org : '',
    tags : [],
    private : false,
    extras : []
  };

  this.owner_org_name = '';

  this.datasetAttributes = {
    //group_by : '',
    sort_on : '',
    sort_type : '',
    sort_description : ''
  };

  // list of all new resources
  this.resources = [];

  // hash of current attribute name mappings
  //  - key: ecosis name
  //  - value: dataset name
  this.attributeMap = {};
  // inverse list of above map w/ key / value switched
  this.inverseAttributeMap = {};

  this.metadataDefinitions = require('./schema');
  this.metadataLookup = {};
  for( var cat in this.metadataDefinitions ) {
    var defs = this.metadataDefinitions[cat];
    for( var i = 0; i < defs.length; i++ ) {
      defs[i].category = cat;
      defs[i].flat = defs[i].name.replace(/\s/g,'').toLowerCase();
      this.metadataLookup[defs[i].name] = defs[i];
    }
  }

  // this flag prevents up from making updates when we are initially
  // setting the data
  this.loaded = false;
  this.loadingError = false;

  // wire events
  var ee = new EventEmitter();
  ee.setMaxListeners(100);
  this.on = function(e, fn) {
    // if things want to know we are loaded and we have already fired, just trigger.
    if( e == 'load' && this.loaded ) {
      setTimeout(fn, 200); // HACK: need to fix setValues() of ecosis-*-input
      //return
    }

    ee.on(e, fn);
  };

  this.load = function() {
    this.ckan.prepareWorkspace(this.package_id, function(result){

      if( result.error ) {
        this.loadingError = result;
        ee.emit('load-error', result);
        return;
      }

      this.ckan.getWorkspace(this.package_id, function(result){
        if( result.error ) {
          this.loadingError = result;
          ee.emit('load-error', result);
          return;
        }

        this.result = result;
        this._setData();

        this.loaded = true;
        ee.emit('load');

      }.bind(this));
    }.bind(this));
  };

  this.loadFromTemplate = function(ckanPackage) {
    // set the default attirbutes for this dataset
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

    if( ckanPackage.map ) {
      this.attributeMap = {};
      this.inverseAttributeMap = {};

      this.attributeMap = ckanPackage.map;
      for( var key in ckanPackage.map ) {
        this.inverseAttributeMap[ckanPackage.map[key]] = key;
      }
    }

    ee.emit('load');
  };

  // helper for when data loads
  this._setData = function() {
    this.editMode = true;

    var ckanPackage = this.result.ckan.package;
    this.package_id = ckanPackage.id;

    // set the default attirbutes for this dataset
    for( var key in this.data ) {
      if( ckanPackage[key] ) this.data[key] = ckanPackage[key];
    }

    if( this.data.extras && !Array.isArray(this.data.extras) ) {
      var arr = [];
      for( var key in this.data.extras) {
        arr.push({
          key : key,
          value : this.data.extras[key]
        });
      }
      this.data.extras = arr;
    }

    if( this.data.tags ) {
      var arr = [];
      for( var i = 0; i < this.data.tags.length; i++ ) {
        arr.push({
          name : this.data.tags[i],
          display_name : this.data.tags[i]
        });
      }
      this.data.tags = arr;
    }

    this.datasheets = this.result.resources;

    this.attributeMap = {};
    this.inverseAttributeMap = {};
    if( this.result.package.map ) {
      this.attributeMap = this.result.package.map;
      for( var key in this.result.package.map ) {
        this.inverseAttributeMap[this.result.package.map[key]] = key;
      }
    }

    this.sort = {};
    if( this.result.package.sort ) {
      this.sort = this.result.package.sort;
    }

    this.resources = this.result.ckan.resources;

    var zips = {}; // used to quickly add resource stubs
    for( var i = 0; i < this.resources.length; i++ ) {
      if( this.resources[i].format.toLowerCase() === 'zip' || this.resources[i].name.toLowerCase().match(/\.zip$/) ) {
        zips[this.resources[i].id] = this.resources[i];
        this.resources[i].childResources = [];
        this.resources[i].isZip = true;
      }
    }


    this.resources.sort(function(a, b){
      if( a.name > b.name ) return 1;
      if( a.name < b.name ) return -1;
      return 0;
    });


    this.resourceLookup = {};

    // create fake stubs for zip file resources
    var alreadyAdded = {};
    for( var i = 0; i < this.datasheets.length; i++ ) {
      if( !this.datasheets[i].fromZip ) continue;
      if( alreadyAdded[this.datasheets[i].resourceId] ) continue;

      var r = this.datasheets[i];

      var stub = {
        id : r.resourceId,
        package_id : r.packageId,
        fromZip : true,
        zip : r.zip,
        name : r.name
      }

      zips[r.zip.resourceId].childResources.push(stub);
      this.resources.push(stub);

      alreadyAdded[r.resourceId] = 1; // why?
    }

    // map resources to datasheets for daster lookup
    for( var i = 0; i < this.resources.length; i++ ) {
      var datasheets = [];
      for( var j = 0; j < this.datasheets.length; j++ ) {
        if( this.datasheets[j].resourceId == this.resources[i].id ) {
          datasheets.push(this.datasheets[j]);
        }
      }

      this.resourceLookup[this.resources[i].id] = this.resources[i];
      this.resources[i].datasheets = datasheets;
    }

    this.fireUpdate();
  }

  this.setSheet = function(sheet) {
    for( var i = 0; i < this.datasheets.length; i++ ) {
      if( this.datasheets[i].resourceId == sheet.resourceId &&
          this.datasheets[i].sheetId == sheet.sheetId ) {

          this.datasheets[i] = sheet;
          break;
      }
    }

    var resource = this.resourceLookup[sheet.resourceId];
    if( !resource ) {
      console.log('Attempting to set sheet with a resourceId that does not exist');
      console.log(sheet);
      return;
    }

    for( var i = 0; i < resource.datasheets.length; i++ ) {
      if( resource.datasheets[i].sheetId == sheet.sheetId ) {
          resource.datasheets[i] = sheet;
          break;
      }
    }
  }

  this.fireUpdate = function() {
    ee.emit('update');
  }

  // after a resource is added, our entire state is different
  this.runAfterResourceAdd = function(workspaceData) {
    this.result = workspaceData;
    this._setData();
  }

  this.getDatasetExtra = function(key) {
    if( !this.data.extras ) return null;

    for( var i = 0; i < this.data.extras.length; i++ ) {
      if( this.data.extras[i].key == key ) return this.data.extras[i];
    }
    return {};
  }

  this.setDatasetExtra = function(key, value) {
    if( !this.data.extras ) this.data.extras = [];

    for( var i = 0; i < this.data.extras.length; i++ ) {
      if( this.data.extras[i].key == key ) {
        this.data.extras[i].value = value;
        return;
      }
    }

    this.data.extras.push({
      key : key,
      value : value
    });
  }

  // get all attirbutes from sheets marked as data
  this.getDatasheetAttributes = function() {
    var attrs = {}, sheet, attr;

    for( var i = 0; i < this.datasheets.length; i++ ) {
      sheet = this.datasheets[i];
      if( sheet.metadata ) continue;

      for( var j = 0; j < sheet.attributes.length; j++ ) {
        attr = sheet.attributes[j];
        attrs[attr] = 1;
      }
    }

    return Object.keys(attrs);
  }

  this.isEcosisMetadata = function(name) {
    name = name.replace(/\s/g, '').toLowerCase();
    for( var key in this.metadataLookup ) {
      if( this.metadataLookup[key].flat == name ) return true;
    }
    return false;
  }

  this.getScore = function() {
    var count = 0;

    var map = {
      'Keywords' : 'tags',
      'Author' : 'author',
      'Author Email' : 'author_email',
      'Maintainer' : 'maintainer',
      'Maintainer Email' : 'maintainer_email'
    };

    // check dataset level ecosis metadata
    for( var key in this.metadataLookup ) {
      if( map[key] && this.data[map[key]] ) {
        count++;
      } else if( this.getDatasetExtra(key).value ) {
        count++;
      }
    }

    if( this.data.notes ) count++;
    if( this.data.owner_org ) count++;


    return count;
  };
};
