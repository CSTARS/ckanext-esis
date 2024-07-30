ARG CKAN_BASE
FROM ${CKAN_BASE}

RUN mkdir -p /ckan/src/ckanext-ecosis
WORKDIR /ckan/src
COPY ./ ckanext-ecosis/

RUN pip install -U setuptools[core]

RUN pip install -e /ckan/src/ckanext-ecosis
RUN pip install -r /ckan/src/ckanext-ecosis/requirements.txt

ENV WTF_CSRF_ENABLED=False