#!/usr/bin/env sh
rm -rf release.zip
zip -r9 release.zip _locales back icon* inject jquery-1.6.2.min.js manifest.json popup
