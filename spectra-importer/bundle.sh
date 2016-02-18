#! /bin/bash

# --debug: adds sourcemaps
# --standalone: creates exposed namespace
browserify --debug \
    lib/index.js --standalone Ecosis \
    -o app/import/scripts/bundle.js
