from . import process
from . import excel

# inject global dependencies
def init(collections, workspaceDir):
    process.init(collections)
    excel.init(workspaceDir)