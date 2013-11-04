import re
import xml.etree.ElementTree as etree
from pylons.i18n import _

from ckan import model

import ckan.plugins as p
from ckan.common import c
import ckan.lib.helpers as h
from ckan.lib.base import BaseController, render

import logging
log = logging.getLogger(__name__)

class ViewController(BaseController):

    not_auth_message = p.toolkit._('Not authorized to see this page')

    def __before__(self, action, **params):

        super(ViewController,self).__before__(action, **params)


    def spectral_search(self):
        return render('spectral/search.html')