import process, excel

# inject global dependencies
def init(collections, workspaceDir):
    process.init(collections)
    excel.init(workspaceDir)