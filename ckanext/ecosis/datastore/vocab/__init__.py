import controlled
import usda
import top, gcmd

def init(schema, collections):
    controlled.init(schema)
    usda.init(collections)
    top.init(collections)
    gcmd.init(collections)
