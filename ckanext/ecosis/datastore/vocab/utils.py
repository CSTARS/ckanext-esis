import re

def flatten(name):
    return re.sub(r'\s', '', name).lower()