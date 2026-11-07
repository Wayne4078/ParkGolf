#!/bin/bash
# 토스용 묶음 만들기: index.html + art + voice + 연결부(ait-bridge.js)
set -e
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist
cp -r ../art ../voice dist/
npx esbuild src/bridge.js --bundle --minify --format=iife --target=es2018 --outfile=dist/ait-bridge.js
sed 's#<!--AIT-->#<script src="ait-bridge.js"></script>#' ../index.html > dist/index.html
grep -q 'ait-bridge.js' dist/index.html || { echo "AIT 자리표 없음"; exit 1; }
npx ait build
