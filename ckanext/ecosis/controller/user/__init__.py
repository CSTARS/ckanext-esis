from ckan.common import response, request
from ckan.lib.base import c, model
import ckan.logic as logic
import json, jwt
import pylons.config as config
import ckan.lib.authenticator as authenticator

from ckanext.ecosis.lib.auth import isAdmin

secret = config.get('ecosis.jwt.secret')

# get information about logged in user, including if they are logged in
def info():
    response.headers["Content-Type"] = "application/json"
    if len(c.user) == 0:
        return json.dumps({"loggedIn": False})

    context = {'model': model, 'user': c.user}

    # see line 604 of ckan/logic/action/get about params for this method
    orgs = logic.get_action('organization_list_for_user')(context,{"permission": "create_dataset"})

    user = {
        "loggedIn": True,
        "username": c.user,
        "organizations" : orgs
    }

    if isAdmin():
        user['isAdmin'] = True

    return json.dumps(user)

def jwtLogin():
    response.headers["Content-Type"] = "application/json"

    username = request.params.get('username')
    password = request.params.get('password')

    if len(c.user) != 0:
        return json.dumps(create_jwt(c.user))

    if username is None or password is None:
        return json.dumps({"loggedIn": False})


    identity = {
        'login' : username,
        'password' : password
    }

    auth = authenticator.UsernamePasswordAuthenticator()
    user = auth.authenticate(request.environ, identity)

    if user == None:
        return json.dumps({
            "loggedIn": True,
            "message": "invalid username or password",
        })


    return json.dumps(create_jwt(user))

def create_jwt(user):
    context = {'model': model, 'user': user}

    # see line 604 of ckan/logic/action/get about params for this method
    orgs = logic.get_action('organization_list_for_user')(context,{"permission": "create_dataset"})

    jwtuser = {
        "username": user,
        "organizations": orgs
    }
    if isAdmin():
        jwtuser['admin'] = True

    encoded = jwt.encode(jwtuser, secret, algorithm='HS256')

    user = {
        "loggedIn": True,
        "username": user,
        "organizations": orgs,
        "jwt": encoded
    }

    if isAdmin():
        user['isAdmin'] = True

    return user