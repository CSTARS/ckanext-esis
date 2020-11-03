ARG CKAN_BASE
FROM ${CKAN_BASE}

RUN mkdir -p /ckan/src/ecosis
WORKDIR /ckan/src
COPY ./ ecosis/

RUN pip install -e /ckan/src/ecosis
RUN pip install -r /ckan/src/ecosis/requirements.txt