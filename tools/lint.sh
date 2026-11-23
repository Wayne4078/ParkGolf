#!/bin/bash
# 이름 틀린 코드·죽은 코드 검사. 줄 번호는 index.html 줄 번호 그대로. Error가 0개여야 통과(있으면 종료 코드 1).
cd "$(dirname "$0")"
python3 extract_js.py ../index.html game.js >/dev/null || exit 1
OUT=$(npx -y eslint@8.57.0 --no-eslintrc -c eslintrc.json game.js -f unix 2>/dev/null | sed 's#.*/game.js:#index.html:#')
echo "$OUT"
N=$(printf '%s\n' "$OUT" | grep -cE 'Error/|Parsing error' || true)
echo "Error 개수: $N"
[ "$N" = "0" ] || exit 1
