#! /bin/bash

cpFiles=( "index.html" )

rm -rf dist
poly-next -r app -m elements -n index -d app/elements

mkdir dist

for file in "${cpFiles[@]}"; do
    cp app/$file dist/
done

vulcanize --inline-scripts --strip-comments --inline-css app/require.html > dist/require.html

rm app/elements/index.html