#! /bin/bash

cpFiles=( "index.html" )
dist=dist/doi-admin

rm -rf dist
poly-next -r app -m elements -n index -d app/elements

mkdir -p $dist

for file in "${cpFiles[@]}"; do
    cp app/$file $dist
done

vulcanize --inline-scripts --strip-comments --inline-css app/require.html > $dist/require.html

rm app/elements/index.html