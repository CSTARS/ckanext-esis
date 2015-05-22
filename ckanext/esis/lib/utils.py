
def getMergedResources(resourceId, resources, workspacePackage, removeValues=True):
    resource = getById(resources, resourceId)
    if resource == None:
        return {"error":True,"message":"resource not found"}

    workspaceResource = getById(workspacePackage['resources'], resourceId)
    if workspaceResource == None:
        workspaceResource = {"datasheets":[]}

    for datasheet in resource['datasheets']:
        workspaceDs = getById(workspaceResource['datasheets'], datasheet['id'])
        if workspaceDs != None:
            for key, value in workspaceDs.iteritems():
                datasheet[key] = value
            if 'matchValues' in datasheet and removeValues:
                del datasheet['matchValues']

    return resource

# given an array of objects that have an id attribute, get one by id
def getById(arr, id):
    if arr == None:
        return None

    for obj in arr:
        if obj.get('id') == id:
            return obj
    return None