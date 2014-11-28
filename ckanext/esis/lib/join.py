# logic for doing joins of data to matadata

class SheetJoin:

    # given a data array [[]] and the sheet configuration, set the matchValues for
    # for a given datasheet object
    def processMetadataSheet(self, data, sheetConfig, sheet):
        matchAttr = sheetConfig['matchAttribute']
        matchValues = []
        for i in range(len(data[0])):
            if data[0][i] == matchAttr:
                for j in range(len(data)):
                    matchValues.append(data[j][i])
                break
        sheet['matchValues'] = matchValues
        sheet['matchAttribute'] = sheetConfig['matchAttribute']

    # given a normal datasheet information, set the match count for all metadata sheets
    # - data: [[]] for resource
    # - ranges: parsed start/stop ranges for the data
    # - layout: row || column
    # - sheetInfo: the data sheets information, used for filename/sheetname matching
    # - metadataSheets: sheets that need to be processed
    def matchMetadataSheets(self, data, range, layout, sheetInfo, metadataSheets):
        for metaSheet in metadataSheets:
            self._matchMetadataSheet(data, range, layout, sheetInfo, metaSheet)

    def _matchMatadataSheet(self, data, range, layout, sheetInfo, metaSheet):
        # are we matching on filename
        if metaSheet['matchType'] == 'filename':

            if sheetInfo['name'] in metaSheet['matchValues']:
                return True
            else:
                return False
            # TODO: add exact match

        # are we matching to sheet name
        elif metaSheet['matchType'] == 'sheetname':

            if sheetInfo['name'] in metaSheet['matchValues']:
                return True
            else:
                return False

        elif metaSheet['matchType'] == 'attribute':
            self._attributeMatch(data, range, layout, sheetInfo, metaSheet)


    def _attributeMatch(self, data, dataRange, layout, sheetInfo, metaSheet):

        # first see if datasheet even has the match attribute
        index = -1
        if layout == 'row':
            for i in range(len(data[dataRange['start']])):
                if data[dataRange['start']][i] == metaSheet['matchAttribute']:
                    index = i
                    break
        else:
            for i in range(dataRange['start'], dataRange['stop']):
                if data[i][0] == metaSheet['matchAttribute']:
                    index = i
                    break

        id = self.getMatchId(sheetInfo)

        # this sheet doesn't even have the match attribute, quit out
        if index == -1:
            # remove any matches that may have existed
            self._removeIdFromMeta(metaSheet, id)
            return

        # now actually run match
        count = 0
        if layout == 'row':
            for i in range(dataRange['start']+1, dataRange['stop']):
                if data[i][index] in metaSheet['matchValue']:
                    count += 1
        else:
            for i in range(1, len(data[index])):
                if data[index][i] in metaSheet['matchValue']:
                    count += 1

        # if count is 0, just remove, otherwise set count
        if count == 0:
            self._removeIdFromMeta(metaSheet, id)
        else:
            if not 'matches' in metaSheet:
                metaSheet['matches'] = {}
            metaSheet['matches']['id'] = count


    ### HELPERS ###
    def _removeIdFromMeta(self, metaSheet, id):
        if 'matches' in metaSheet:
            if id in metaSheet['matches']:
                del metaSheet['matches'][id]

    def getMatchId(self, sheetInfo):
        if not 'sheet' in sheetInfo:
            return sheetInfo['id']
        else:
            return "%s-%s" % (sheetInfo['id'] % sheetInfo['sheet'])