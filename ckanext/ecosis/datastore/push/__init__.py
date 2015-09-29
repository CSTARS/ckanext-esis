from multiprocessing import Process, Queue

import insert
import ecosis.datastore.mapreduce as mapreduce
import ecosis.datastore.query as query
import ecosis.datastore.delete as deleteUtils



# grrrrr
from ckan.lib.email_notifications import send_notification
from pylons import config

def init(collections):
    insert.init(collections)

class Push:

    def run(self, ckanPackage, email=False, user={}):
        # first clean out data
        deleteUtils.cleanFromSearch(ckanPackage.get('id'))

        if ckanPackage.get('private') == True:
            raise Exception('This dataset is private')

        q = Queue()
        p = Process(target=sub_run, args=(q, ckanPackage, email, user))
        p.start()

        return {'success': True, 'emailing': email, 'email': user.get('email')}


def sub_run(q, ckanPackage, email, user):
    try:
        total = query.total(ckanPackage.get('id'))

        for i in range(0, total):
            spectra = query.get(ckanPackage.get('id'), index=i)
            insert.insert(spectra)

        mapreduce.mapreducePackage(ckanPackage)

        if not email:
            return

        send_notification(
            {
                "email" : user.get('email'),
                "display_name" : user.get('display_name')
            },
            {
                "subject" : "EcoSIS Push Successful",
                "body" : ("Your dataset '%s' has been pushed to EcoSIS Search.  "
                            "You can view your dataset here:  %s#result/%s"
                            "\n\n-The EcoSIS Team") %
                         (ckanPackage.get('title'), config.get('ecosis.search_url'), ckanPackage.get("id"))
            }
        )

    except Exception as e:
        try:
            # if badness, remove from search
            deleteUtils.cleanFromSearch(ckanPackage.get('id'))

            print e
            if not email:
                return

            send_notification(
                {
                    "email" : user.get('email'),
                    "display_name" : user.get('display_name')
                },
                {
                    "subject" : "EcoSIS Push Failed",
                    "body" : ("Your recent push to search for '%s' has failed.  "
                              "You can try again or contact help@ecospectra.org.  "
                              "We apologize for the inconvenience\n\n-The EcoSIS Team") % (ckanPackage["title"])
                }
            )
        except:
            pass