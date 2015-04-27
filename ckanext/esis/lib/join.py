# logic for doing joins of data to matadata
import re, time

class SheetJoin:

    # given a spectra object, add join attributes
    def joinOnSpectra(self, datasheet, spectra, metadata, dataarray):
        rowIndex = -1

        # if .index() fails, python throws an exception
        # I hate python...
        try:
            if not 'matchType' in metadata and 'matchValues' in metadata and 'matchAttribute' in metadata:
                rowIndex = metadata['matchValues'].index(spectra[metadata['matchAttribute']])

            elif metadata.get('matchType') == 'attribute':
                rowIndex = metadata['matchValues'].index(spectra[metadata['matchAttribute']])

            elif metadata.get('matchType') == 'filename':
                if metadata.get('looseMatch') == True:
                    for index, val in enumerate(metadata['matchValues']):
                        reg = r".*%s.*" % val
                        if re.match(reg, datasheet['name']):
                            rowIndex = index
                else:
                    rowIndex = metadata['matchValues'].index(datasheet['name'])

            elif metadata('matchType') == 'sheetname' and 'sheetname' in datasheet:
                rowIndex = metadata['matchValues'].index(datasheet['sheetname'])
        except:
            pass

        if rowIndex == -1:
            return

        rowIndex = rowIndex + 1 + metadata['localRange']['start']
        for attr in metadata['attributes']:
            if attr.get('type') == 'metadata' or attr.get('type') == 'data':
                col = int(attr['pos'].split('-')[1])
                if dataarray[rowIndex][col]:
                    val = dataarray[rowIndex][col]
                    spectra[attr['name']] = dataarray[rowIndex][col]


    # given a data array [[]] and the sheet configuration, set the matchValues for
    # for a given datasheet object
    def processMetadataSheet(self, data, sheetConfig, sheet):
        matchAttr = sheetConfig.get('matchAttribute')

        # badness
        if matchAttr == None:
            sheetConfig['matchAttribute'] = '';
            matchAttr = '';

        matchValues = []
        for i in range(0, len(data[0])):
            if data[0][i] == matchAttr:
                for j in range(1, len(data)):
                    matchValues.append(data[j][i])
                break

        sheet['matchValues'] = matchValues
        sheet['matchAttribute'] = sheetConfig['matchAttribute']

        # reset counts
        sheet['matches'] = {}

        # make sure we save this


    # given a normal datasheet information, set the match count for all metadata sheets
    # - data: [[]] for resource
    # - ranges: parsed start/stop ranges for the data
    # - layout: row || column
    # - sheetInfo: the data sheets information, used for filename/sheetname matching
    # - metadataSheets: sheets that need to be processed
    def matchMetadataSheets(self, data, range, layout, sheetInfo, metadataSheets):
        for metaSheet in metadataSheets:
            self._matchMetadataSheet(data, range, layout, sheetInfo, metaSheet)

    def _matchMetadataSheet(self, data, range, layout, sheetInfo, metaSheet):
        config = metaSheet['config']

        if not 'matches' in metaSheet['datasheet']:
            metaSheet['datasheet']['matches'] = {}

        # are we matching on filename
        if config.get('matchType') == 'filename':

            if config.get('looseMatch') == True:
                return self._looseMatch(sheetInfo['id'], sheetInfo['name'], metaSheet['datasheet'])
            else:
                if sheetInfo['name'] in metaSheet['datasheet']['matchValues']:
                    if metaSheet['datasheet']['matches'].get(sheetInfo['id']) != 1:
                        self._markForSave(metaSheet['datasheet'])
                        metaSheet['datasheet']['matches'][sheetInfo['id']] = 1
                else:
                    self._removeIdFromMeta(metaSheet['datasheet'], sheetInfo['id'])

        # are we matching to sheet name
        elif config.get('matchType') == 'sheetname':

            if config['looseMatch']:
                return self._looseMatch(sheetInfo['id'], sheetInfo['sheetname'], metaSheet['datasheet'])
            else:
                if sheetInfo.get('sheetname') in metaSheet['datasheet']['matchValues']:
                    if metaSheet['datasheet']['matches'].get(sheetInfo['id']) != 1:
                        self._markForSave(metaSheet['datasheet'])
                        metaSheet['datasheet']['matches'][sheetInfo['id']] = 1
                else:
                    self._removeIdFromMeta(metaSheet['datasheet'], sheetInfo['id'])

        elif config.get('matchType') == 'attribute':
            self._attributeMatch(data, range, layout, sheetInfo, metaSheet)

    def _attributeMatch(self, data, dataRange, layout, sheetInfo, metaSheet):

        # first see if datasheet even has the match attribute
        index = -1
        if layout == 'row':
            for i in range(len(data[dataRange['start']])):
                if data[dataRange['start']][i] == metaSheet['config']['matchAttribute']:
                    index = i
                    break
        else:
            for i in range(dataRange['start'], dataRange['stop']):
                if data[i][0] == metaSheet['config']['matchAttribute']:
                    index = i
                    break

        id = self.getMatchId(sheetInfo)

        # this sheet doesn't even have the match attribute, quit out
        if index == -1:
            # remove any matches that may have existed
            self._removeIdFromMeta(metaSheet['datasheet'], id)
            return

        # now actually run match
        count = 0
        if layout == 'row':
            for i in range(dataRange['start']+1, dataRange['stop']):
                if data[i][index] in metaSheet['datasheet']['matchValues']:
                    count += 1
        else:
            for i in range(1, len(data[index])):
                if data[index][i] in metaSheet['datasheet']['matchValues']:
                    count += 1

        # if count is 0, just remove, otherwise set count
        if count == 0:
            self._removeIdFromMeta(metaSheet['datasheet'], id)
        else:
            if metaSheet['datasheet']['matches'].get(id) != count:
                self._markForSave(metaSheet['datasheet'])
                metaSheet['datasheet']['matches'][id] = count


    ### HELPERS ###
    def _removeIdFromMeta(self, datasheet, id):
        if 'matches' in datasheet:
            if id in datasheet['matches']:
                self._markForSave(datasheet)
                del datasheet['matches'][id]

    # if we detect a change in the match of a metadata sheet, mark for saving
    def _markForSave(self, sheet):
        sheet['changed'] = True

    def getMatchId(self, sheetInfo):
        if not 'sheetname' in sheetInfo:
            return sheetInfo['id']
        else:
            return "%s-%s" % (sheetInfo['id'], sheetInfo['sheetname'])

    def _looseMatch(self, id, name, datasheet):
        for val in datasheet['matchValues']:
            reg = r".*%s.*" % val
            if re.match(reg, name):
                if datasheet['matches'].get(id) != 1:
                    self._markForSave(datasheet)
                    datasheet['matches'][id] = 1
                return
        self._removeIdFromMeta(datasheet, id)