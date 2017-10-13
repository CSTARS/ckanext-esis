from ckan.common import response
from ckan.lib.base import c, model
import ckan.logic as logic
import json
import jwt
import pylons.config as config

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

    if len(c.user) != 0:
        return json.dumps(jwt(c.user))

    identity = {
        username : '',
        password : ''
    }
    
    auth = authenticator.UsernamePasswordAuthenticator()
    user = auth.authenticate(request.environ, identity)


    return json.dumps(jwt(user))

def jwt(user):
    context = {'model': model, 'user': user}

    # see line 604 of ckan/logic/action/get about params for this method
    orgs = logic.get_action('organization_list_for_user')(context,{"permission": "create_dataset"})

    jwtuser = {
        "username": c.user,
        "organizations": orgs
    }
    if isAdmin():
        jwtuser['admin'] = True

    encoded = jwt.encode(jwtuser, secret, algorithm='HS256')

    user = {
        "loggedIn": True,
        "username": c.user,
        "organizations": orgs,
        "jwt": encoded
    }

    if isAdmin():
        user['isAdmin'] = True

    return user