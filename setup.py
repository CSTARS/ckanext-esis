from setuptools import setup, find_packages
import sys, os

version = '0.1'

setup(
        name='ckanext-ecosis',
        version=version,
        description="EcoSIS extension adding additional fields and controls for spectral data",
        long_description="""\
        """,
        classifiers=[], # Get strings from http://pypi.python.org/pypi?%3Aaction=list_classifiers
        keywords='',
        author='Justin Merz',
        author_email='jrmerz@ucdavis.edu',
        url='http://www.ucdavis.edu',
        license='',
        packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
        namespace_packages=['ckanext', 'ckanext.ecosis'],
        include_package_data=True,
        zip_safe=False,
        install_requires=[
                # -*- Extra requirements: -*-
        ],
        entry_points=\
        """
        [ckan.plugins]
        # Add plugins here, eg
        ecosis=ckanext.ecosis.plugin:EcosisPlugin
        """,
)
