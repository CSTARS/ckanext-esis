## Importing Spectra

The idea is that this module can operate standalone without any CKAN code allowing
for faster development and debugging.  The __init__.py contains a sample script
for importing spectra and then querying by package_id and index.

## Data Flow

To add spectra to the system, first resources should be added to a package, just
like any other CKAN dataset.  Once the files are added and exist both in PostgreSQL
and the filesystem, you can the spectra to the importer, passing the full path
to the file, the package_id and the resource_id.  You can also pass options the
options are as follows:

```
{
  // this file is not to be parsed
  "ignore" : Boolean,

  // is this tabular data file laid out by column or row?
  "layout" : [row/column],

  // is this sheet joinable metadata?
  "metadata" : Boolean,

  // if this sheet is joinable metadata, what is the join key?
  "joinOn" : String,
}
```

Assuming the file is a supported tabular type.  Currently:
 - csv
 - tsv
 - xls
 - xlsx
 - spectra (parsed as tsv)
 - zip (extracted and crawled for above filetypes)

The files will be parsed and added to the spectra workspace collection.  This
collection contains 'chunks' for spectra based on the current parse information.
These chunks look like:

```
{
  "package_id" : String,
  "resource_id" : String,

  // if it came from excel, the sheet is remembered
  "sheetId" : String,

  // did this come from a joinable metadata file or a data file
  "type" : [metadata/data],

  // the parsed column or row
  spectra : {}
}
```

Meanwhile the resource file info will be saved in the resource workspace collection.
This collection contains the 'options' provided above as well as:
```
{
  // full path to the file
  "file" : String,

  "package_id" : String,
  "resource_id" : String,
  "sheet_id" : String,

  // flag that this a from a ckan resource that was a zip file
  // the importer is then faking as a new resource that CKAN is unaware of
  "fromZip" : Boolean,

  // if this resource is from a zipfile, keep track of the 'parent' zipfile info
  "zip" : {
    // zip file name
    "name" : String,
    // zip file resource id (known to CKAN)
    "resource_id" : String
  },

  // the tabular data parser figures out where the data actually starts and stops.
  // so if the first row with data is row 8, then start would be 8.
  "localRange" : {
    "start" : Number,
    "stop" : Number
  },

  // just like 'localRange' but for the global key/value pairs at the top of the
  // file.  This is optional.
  "globalRange" : {}

  // every attribute that is found is stored here so we know what the schema
  // for the datasheet actually is
  "attributes" : [{
    // everything is metadata unless the attribute name is really a number (wavelength)
    // then the attribute is marked as data
    "type" : [metadata/data],

    // original name found in file
    "originalName" : String

    // the attribute name may contain units, it also my be a close match to a
    // EcoSIS standard name but have a different case or extra spaces.  If this
    // is the case, the name is 'cleaned', the units are stripped out and/or the
    // name is set to the EcoSIS standard name.
    "name" : String,

    // any units that are found in the originalName, formatted by (UNITS), ex:
    // 'attr_in_meters (m)', will be stored here
    "units" : String,

    // id containing the row and column for where the attribute can be found in
    // the datasheet
    "pos" : "[row]-[column]"
  }]
}
```

Now all spectra data is parsed and ready to be inspected by the user.

## Querying Spectra in Import Data stored

Once the spectra is in place, users can ask to inspect spectra and see what the
final product will look like once it is pushed to EcoSIS search.  This query lets
the user select a package_id and optionally a resource_id and then a specific index.
You can think of the spectra being stored in an array with default MongoDB sort
order.

When a query is preformed the following occurs:
- the 'data' chunk is retrieved from the spectra workspace collection
- the 'data' chunk is joined with any metadata junks.  This process happens as follows
  - All metadata resources for the package are retrieved from the resource workspace collection.
  - if the 'data' chunk has the 'joinOn' attribute for this metadata resource, a query is preformed to see if any metadata chunk for this resource as the same key/value pair.
  - if a match is found, all attributes from the metadata chunk are added to the data chunk
- Once the join is completed, all wavelengths are moved to the 'datapoints' attribute.
- Then all custom attribute name mappings are preformed
- all USDA plant code information is looked up and added, if provided
- controlled vocabularies are enforced.
  - if an attribute is a controlled vocab and it's value is not allowed the value is either moved to 'Other [Attribute Name]' if other is allowed, or the attribute value is removed completely.
- the ecosis namespace is add.  A description of this is below
- the sort value is set to the EcoSIS namespace.
  - if a sort value is specified for the dataset and this spectra has the attribute the attribute will be placed in ecosis.sort.  The catch is that that the attribute will be parsed as either a String, Number or Date depending on the sort_type.
- the location information is assigned.
  - if there is a geojson attribute it is parsed as JSON and assigned to ecosis.location.
  - if a latitude and a longitude are provided, a new GeoJSON object is created and assigned to the ecosis.location.

Now the spectra object is ready to be either inserted into search or inspected by
the user.

Here is what the ecosis namespace contains for a spectra:
```
{
  package_id : String,
  resource_id : String,
  datasheet_id : String,

  // just the uploaded filename
  filename : String,

  // current title for the package
  package_title : String,

  // link to dataset in search,
  dataset_link : String,

  // link to dataset in API
  dataset_api_link : String,

  // organization name
  organization : String,

  // if provided
  sort : [String|Number|Date],

  // if provided
  geojson : {}
}
```


 TODO: finish this..
