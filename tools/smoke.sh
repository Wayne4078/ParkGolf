#!/bin/bash
# 전 코스 끝까지 자동 플레이(웹 + 가짜 토스). 필요: node + playwright. 하나라도 실패면 종료 코드 1.
# 주의: 이 시험은 '흐름' 시험이다 — 공이 안 들어가면 홀을 강제로 끝낸다(물리 검증 아님). 결제·저장·광고는 tools/verify_fixes.js가 본다.
cd "$(dirname "$0")/.."
python3 -m http.server 8765 >/dev/null 2>&1 & SRV=$!; sleep 1
RC=0
node tools/smoke.js web || RC=1
node tools/smoke.js toss || RC=1
kill $SRV 2>/dev/null
exit $RC
