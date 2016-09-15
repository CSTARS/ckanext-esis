import re

# a 'flat' name is when the name is in lower case with no spaces
def flatten(name):
    return re.sub(r'\s', '', name).lower()