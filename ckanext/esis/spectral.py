from pylons import config
from pylons import request, response

from ckan.lib.base import BaseController, c, request, render, config, h, abort
import ckan.logic as logic



class SpectralController(BaseController):

    def upload(self):
        filename = request.POST['file'].filename

        # ``input_file`` contains the actual file data which needs to be
        # stored somewhere.

        input_file = request.POST['file'].file

        # Note that we are generating our own filename instead of trusting
        # the incoming filename since that might result in insecure paths.
        # Please note that in a real application you would not use /tmp,
        # and if you write to an untrusted location you will need to do
        # some extra work to prevent symlink attacks.

        file_path = os.path.join('/tmp', '%s' % uuid.uuid4())

        # We first write to a temporary file to prevent incomplete files from
        # being used.

        temp_file_path = file_path + '~'
        output_file = open(temp_file_path, 'wb')

        # Finally write the data to a temporary file
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
        print f.read()