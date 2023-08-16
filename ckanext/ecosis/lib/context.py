from typing import cast
from ckan.common import current_user
import ckan.model as model
from ckan.types import Context

def get_context():
    context = cast(Context, {
        'model': model,
        'user': current_user.name})
    return context  

def get_auth_context():
  # context = cast(Context, {'model': model, 'session': model.Session,
  #                      'api_version': 3, 'for_edit': True,
  #                      'user': c.user or c.author, 'auth_user_obj': c.userobj}
  context = cast(Context, {
    'model': model, 
    'session': model.Session,
    'api_version': 3, 
    'for_edit': True,
    'user': current_user.name, 
    'auth_user_obj': current_user
  })
  return context