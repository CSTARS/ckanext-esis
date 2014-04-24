from pylons import config
from pylons import request, response

import os
import uuid

from ckan.lib.base import BaseController, c, request, render, config, h, abort
import ckan.logic as logic

from ckanext.esis.parsers import AsterParser


class SpectralController(BaseController):

    def __init__(self):
        self.parsers = {
            "aster": AsterParser()
        }


    def upload(self):
        print "here"

        type = request.POST['type']

        filename = request.POST['file'].filename
        input_file = request.POST['file'].file

        # write to temp dir
        file_path = os.path.join('/tmp', '%s' % uuid.uuid4())

        temp_file_path = file_path + '~'
        output_file = open(temp_file_path, 'wb')

        input_file.seek(0)
        while True:
            data = input_file.read(2<<16)
            if not data:
                break
            output_file.write(data)

        # If your data is really critical you may want to force it to disk first
        # using output_file.flush(); os.fsync(output_file.fileno())

        output_file.close()

        f = open(temp_file_path, 'r')
        data = f.read()

        if self.parsers[type] is not None:
            data = self.parsers[type].parse(data)


        asterParser = AsterParser()
        data = asterParser.parse(data)

        print type
        print data