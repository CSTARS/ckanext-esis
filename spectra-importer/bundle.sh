#! /bin/bash

# --debug: adds sourcemaps
# --standalone: creates exposed namespace
browserify --debug \
    core/app --standalone Ecosis \
    -o app/editor/scripts/bundle.js
