#!/bin/bash
# 토스용 묶음 만들기: index.html + art + voice + 연결부(ait-bridge.js)
set -e
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist
cp -r ../art ../voice ../amb ../fonts dist/
npx esbuild src/bridge.js --bundle --minify --format=iife --target=es2018 --outfile=dist/ait-bridge.js
# 토스판 표시(__AIT_BUILD)를 연결부보다 먼저 넣는다 — 연결부가 못 떠도 토스판에서 돈 없이 여는 시험 지급이 켜지지 않게(2026-11-22)
sed 's#<!--AIT-->#<script>window.__AIT_BUILD=1</script><script src="ait-bridge.js"></script>#' ../index.html > dist/index.html
grep -q 'ait-bridge.js' dist/index.html || { echo "AIT 자리표 없음"; exit 1; }
grep -q '__AIT_BUILD=1' dist/index.html || { echo "토스판 표시 없음"; exit 1; }
npx ait build
