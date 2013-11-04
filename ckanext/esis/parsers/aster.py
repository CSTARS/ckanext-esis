import re

class AsterParser:
    """ A class for parsing ASTER Spectral files
    """

    def __init__(self):
        self.object = {}

    def parse(self, content):
        content = content.replace("\r", "").replace("\t", " ").split("\n")

        self.object = {
            'data': []
        }
        for i in range(0, len(content)):
            line = content[i]

            # parse variable
            if not re.match(r'.*:.*', line) is None:
                parts = line.split(":")
                self.object[parts[0]] = parts[1].lstrip()


                # parse values that extend to more than one line
                # if the next line has a ':' or is '' return
                for j in range(i+1, len(content)):
                    if not re.match(r'.*:.*', content[j]) is None:
                        break
                    elif content[j] == '':
                        break
                    else:
                        self.object[parts[0]] = self.object[parts[0]]+content[j]
                        i += 1

            # if line matches number space number, we have started spectra data
            if re.match(r'\d*\.\d*\s*\d*\.\d*', line):
                parts = re.sub(r'\s+', ' ', line).split(" ")
                self.object['data'].append([float(parts[0]), float(parts[1])])


        print self.object