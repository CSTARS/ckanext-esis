var EventEmitter = require("events").EventEmitter;

module.exports = function(config) {
  this.ckan = config.ckan;
  if( this.ckan ) this.ckan.ds = this;

  // is this an existing dataset
  this.editMode = config.package_id ? true : false;

  // existing package id
  this.package_id = config.package_id;

  // information about exsiting resources
  this.existing = {
    resources : [],
    metadata  : [],
    data      : []
  };

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

  //this.schema = [];
  //wavelengths : [],

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

  this.metadataDefinitions = require('./schema.json');
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
    if( e == 'load' && this.loaded ) return fn();

    ee.on(e, fn);
  };

  this.load = function() {
    this.ckan.processWorkspace(this.package_id, function(result){

      if( result.error ) {
        this.loadingError = true;
        ee.emit('error', {message : result});
        return callback();
      }

      this.result = result;
      this._setData();


      this.loaded = true;
      ee.emit('load');
    }.bind(this));
  };

  // helper for when data loads
  this._setData = function() {
    this.editMode = true;
    this.package_id = this.result.package.id;

    // set the default attirbutes for this dataset
    for( var key in this.data ) {
      if( this.result.package[key] ) this.data[key] = this.result.package[key];
    }

    this.schema = [];
    for( var attrName in this.result.attributes ) {
      var attr = this.result.attributes[attrName];
      attr.name = attrName;
      this.schema.push(attr);
    }

    this.wavelengths = this.result.wavelengths;

    if( this.result.datasetAttributes ) {
      this.datasetAttributes = this.result.datasetAttributes;
    }

    if( this.result.attributeMap ) {
      this.attributeMap = this.result.attributeMap;
      for( var key in this.result.attributeMap ) {
        this.inverseAttributeMap[this.result.attributeMap[key]] = key;
      }
    }

    this.result.resources.sort(function(a, b){
      if( a.name > b.name ) return 1;
      if( a.name < b.name ) return -1;
      return 0;
    });
    this.resources = this.result.resources;

    this.fireUpdate();
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

  this.isEcosisMetadata = function(name) {
    name = name.replace(/\s/g, '').toLowerCase();
    for( var key in this.metadataLookup ) {
      if( this.metadataLookup[key].flat == name ) return true;
    }
    return false;
  }
}
