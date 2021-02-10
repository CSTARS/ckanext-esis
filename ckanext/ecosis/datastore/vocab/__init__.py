from . import controlled, usda, top, gcmd

# inject global dependencies
def init(schema, collections):
    controlled.init(schema)
    usda.init(collections)
    top.init(collections)
    gcmd.init(collections)
