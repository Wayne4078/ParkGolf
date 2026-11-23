#!/bin/bash
# 전체 검사 한 바퀴(번호 = SEED). 서버 8765가 켜져 있어야 함. 결과: 검사이름 통과/실패 한 줄씩, 끝에 합계
cd "$(dirname "$0")/.."; export SEED=${1:-1}; bad=0
run(){ local name=$1; shift; local out; out=$("$@" 2>&1); local rc=$?; local last=$(echo "$out" | grep -E "모두 통과|실패 [0-9]+개|PASS|FAIL|Error 개수|errors" | tail -1)
  if [ $rc -ne 0 ]; then bad=$((bad+1)); echo "실패 $name :: $last"; echo "$out" | grep -E "^실패|FAIL|Error" | head -5 | sed 's/^/    /'; else echo "통과 $name :: $last"; fi; }
run lint bash tools/lint.sh
run ids python3 tools/ids_check.py
run smoke bash tools/smoke.sh
for t in verify_fixes bm87_check bonus_ad_check ss_check ss_extra_check fold_check; do run $t timeout 900 node tools/$t.js; done
echo "== 바퀴 $SEED: 실패한 검사 $bad개"; exit $bad
