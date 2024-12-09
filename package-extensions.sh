#!/bin/sh
# chmod a+x package-extensions.sh

ver="$(cat manifest.json | jq -r '.version')" #need installed - jq
# need after git push
# ver="$(git show HEAD:manifest.json | grep '"version"' | cut -d\" -f4)"
filename="/tmp/nova-extensions_v${ver}.zip"
# TODAY=$(date)

echo "Zipping extension..."
rm $filename
zip -q -r $filename \
                  _locales \
                  css/libs/*/*.css \
                  css/*/*.css \
                  css/*.css \
                  html/*.html \
                  icons/16.png \
                  icons/48.png \
                  icons/128.png \
                  icons/favicon.ico \
                  js/*.js \
                  js/*/*.js \
                  manifest.json \
                  plugins/*.js \
                  plugins/*/*.js \
                  images/*.png \
 --exclude="*/-*.*" \
 --exclude='plugins/plugin_example.js'
#  -x \*.DS_Store
# -z $TODAY

echo "Compressed $filename"
