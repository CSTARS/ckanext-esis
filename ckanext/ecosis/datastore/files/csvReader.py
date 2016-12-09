import csv, re
import codecs

# parse a csv file
def read(file, separator):
    data = []
    with open(file, 'rU') as csvfile:
        # open will csv files
        reader = csv.reader(csvfile, delimiter=separator, quotechar='"')

        for row in reader:
            # stip no unicode characters: http://stackoverflow.com/questions/26541968/delete-every-non-utf-8-symbols-froms-string
            # TODO: is there a better way todo this?
            for i in range(0, len(row)):
                try:
                    row[i] = unicode(row[i], 'utf-8').encode("utf-8", "ignore")
                except Exception as e:
                    # HACK, remove bad characters
                    try:
                        row[i]  = re.sub(r'[^\x00-\x7F]+',' ', row[i]).encode("utf-8", "ignore")
                    except Exception as e:
                        row[i] = '__invalid_utf-8_characters__'

            data.append(row)
        csvfile.close()
    return data