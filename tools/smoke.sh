#!/bin/bash
# 전 코스 끝까지 자동 플레이(웹 + 가짜 토스). 필요: node + playwright(require('playwright')).
cd "$(dirname "$0")/.."
python3 -m http.server 8765 >/dev/null 2>&1 & SRV=$!; sleep 1
node tools/smoke.js web; node tools/smoke.js toss
kill $SRV
