# from ckan.common import response
import subprocess, json, re, os

path = os.path.dirname(os.path.abspath(__file__))

# grab git info using command line git commands
def info():
    response.headers["Content-Type"] = "application/json"
    resp = {}

    cmd = "git describe --tags"
    process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=path)
    resp["version"] = process.communicate()[0]

    cmd = "git branch"
    process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=path)
    resp["branch"] = process.communicate()[0].split("\n")
    for branch in resp["branch"]:
        if "*" in branch:
            resp["branch"] = branch.replace("* ","")
            break

    cmd = "git log -1"
    process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, cwd=path)
    resp["commit"] = re.sub(r'\n.*', '', process.communicate()[0]).replace("commit ","")

    return json.dumps(resp)
