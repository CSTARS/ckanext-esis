import controlled
import usda
import top

def init(schema, collections):
    controlled.init(schema)
    usda.init(collections)
    top.init(collections)
