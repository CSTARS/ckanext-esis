from multiprocessing import Process, Queue
from ckan.lib.email_notifications import send_notification
from ckan.common import config
import ckan.logic as logic
from ckan.lib.base import c, model
import traceback

from ckanext.ecosis.datastore import mapreduce
from ckanext.ecosis.datastore import query
from ckanext.ecosis.datastore import delete as deleteUtils
from ckanext.ecosis.datastore.mapreduce.lookup import update as updateLookup
from ckanext.ecosis.lib.utils import getPackageExtra, setPackageExtra

spectraCollection = None

'''
This module handles 'pushing' or 'publishing' a dataset from the dataset administration (CKAN)
to search (ecosis.org)
'''

# inject global dependencies
def init(collections):
    global spectraCollection

    spectraCollection = collections.get('search_spectra')

# this will run the main worker on a separate thread so we can send a HTTP response, then email
# user when push is complete
class Push:

    def run(self, ckanPackage, emailOnComplete=False, emailAddress="", username=""):
        # first clean out data
        deleteUtils.cleanFromSearch(ckanPackage.get('id'))

        # we don't want to push private datasets to public search
        if ckanPackage.get('private') == True:
            raise Exception('This dataset is private')

        # set the citation field
        setCitation(ckanPackage)
        context = {'model': model, 'user': c.user}
        ckanPackage = logic.get_action('package_update')(context, ckanPackage)

        # start our new thread
        q = Queue()
        p = Process(target=sub_run, args=(q, ckanPackage, emailOnComplete, emailAddress, username))
        p.start()

        return {'success': True, 'emailing': emailOnComplete, 'email': emailAddress}


# run the new push
def sub_run(q, ckanPackage, emailOnComplete, emailAddress, username):
    try:
        # calculate bounding box from spectra (lat/lng was provided)
        total = query.total(ckanPackage.get('id')).get('total')
        bbox = {
            "maxlat" : -9999,
            "minlat" : 9999,
            "maxlng" : -9999,
            "minlng" : 9999,
            "use" : False
        }

        # grab each spectra and insert into public EcoSIS search
        for i in range(0, total):
            spectra = query.get(ckanPackage.get('id'), index=i, must_be_valid=True, clean_wavelengths=False)
            if not 'datapoints' in spectra:
                continue
            if len(spectra['datapoints']) == 0:
                continue

            # TODO: make sure species attributes are lower case

            # update search
            spectraCollection.insert(spectra)
            # update the bounding box if the spectra has a lat/lng
            updateBbox(spectra, bbox)

        # see if we found a bounding box from the spectra
        if bbox["maxlat"] != -9999 and bbox["maxlng"] != -9999 and bbox["minlng"] != 9999 and bbox["minlat"] != -9999:
            bbox["use"] = True

        # max sure all of the spectra points were not in the same position
        # this cause the geojson index mongo to break
        if bbox["maxlat"] == bbox["minlat"]:
            bbox["maxlat"] += 0.00001
        if bbox["maxlng"] == bbox["minlng"]:
            bbox["maxlng"] += 0.00001

        # mapreduce the dataset package data
        mapreduce.mapreducePackage(ckanPackage, bbox)

        # alert (email user) or quit
        if not emailOnComplete:
            updateLookup()
            return

        try:
            send_notification(
                {
                    "email" : emailAddress,
                    "display_name" : username
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
            print("Failed to send email: %s" % emailAddress)

        updateLookup()

    except Exception as e:
        try:
            print('ERROR pushing to search: %s' % ckanPackage.get('id'))

            # if badness, remove from search
            deleteUtils.cleanFromSearch(ckanPackage.get('id'))

            print(e)
            traceback.print_exc()

            if not emailOnComplete:
                return

            send_notification(
                {
                    "email" : emailAddress,
                    "display_name" : username
                },
                {
                    "subject" : "EcoSIS Push Failed",
                    "body" : ("Your recent push to search for '%s' has failed.  "
                              "You can try again or contact help@ecosis.org.  "
                              "We apologize for the inconvenience\n\n-The EcoSIS Team") % (ckanPackage["title"])
                }
            )
        except Exception as e:
            print(e)
            traceback.print_exc()

# update bounding box built from spectra given either a lat/lng coordinate or geojson
def updateBbox(spectra, bbox):
    if 'ecosis' not in spectra:
        return
    if 'geojson' not in spectra['ecosis']:
        return

    geojson = spectra['ecosis']['geojson']

    if geojson.get('type') != 'Point':
        return
    if 'coordinates' not in geojson:
        return
    if len(geojson['coordinates']) < 2:
        return

    if bbox['maxlat'] < geojson['coordinates'][1]:
        bbox['maxlat'] = geojson['coordinates'][1]
    if bbox['minlat'] > geojson['coordinates'][1]:
        bbox['minlat'] = geojson['coordinates'][1]

    if bbox['maxlng'] < geojson['coordinates'][0]:
        bbox['maxlng'] = geojson['coordinates'][0]
    if bbox['minlng'] > geojson['coordinates'][0]:
        bbox['minlng'] = geojson['coordinates'][0]

# TODO: this needs to stay in sync with the Importer UI :/
# Auto build the citiation field when data is pushed
def setCitation(pkg):
    citation = []

    title = pkg.get('title')
    authors = pkg.get('author')
    year = getPackageExtra('Year', pkg)

    doi = getPackageExtra('EcoSIS DOI', pkg)
    if doi is None or doi == '':
        doi = getPackageExtra('Citation DOI', pkg)

    if authors is not None:
        authors = authors.encode('ascii', 'ignore').decode("utf-8").split(',')
        # authors = map(unicode.strip, authors)
        if len(authors) == 1:
            citation.append(authors[0])
        elif len(authors) == 2:
            citation.append(' and '.join(authors))
        elif len(authors) > 2:
            last = authors.pop()
            citation.append('%s and %s' % (', '.join(authors), last))

    if year is not None:
        citation.append(year)

    if title is not None:
        citation.append(title)

    citation.append('Data set. Available on-line [http://ecosis.org] from the Ecological Spectral Information System (EcoSIS)')

    if doi is not None:
        citation.append(doi)

    citation = '. '.join(citation)
    setPackageExtra('Citation', citation, pkg)