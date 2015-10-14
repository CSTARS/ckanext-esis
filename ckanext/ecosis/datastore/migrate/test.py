import hashlib

def test():
    package_name = "dry-spectra-excel-test"
    resource_id = "ed5a4e00-bc28-46ca-9104-753aaf5df142"
    resource_name = "FFTdryspectrav2.xlsx"
    sheet_name = "NASA_FFT_DS_Refl_Spectra_v2.csv"

    path = _getFile(package_name, resource_id)
    print path
    name = "%s-%s" % (resource_name, sheet_name)
    print name
    print _getFileId(resource_id, path, name)

def _getFile(packageName, resourceId):
    return  "/%s/%s/files/" % (packageName, resourceId)

def _getFileId(rid, path, name):
    m = hashlib.md5()
    m.update("%s%s%s" % (rid, path, name))
    return m.hexdigest()


if __name__ == "__main__":
    test()
