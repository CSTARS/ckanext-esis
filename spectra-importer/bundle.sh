#! /bin/bash

# --debug: adds sourcemaps
# --standalone: creates exposed namespace
browserify --debug \
    core/app --standalone Ecosis \
    -o app/import/scripts/bundle.js
