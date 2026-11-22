#!/bin/bash
# 이름 틀린 코드·죽은 코드 검사. 줄 번호는 index.html 줄 번호 그대로. Error가 0개여야 통과.
set -e; cd "$(dirname "$0")"
python3 extract_js.py ../index.html game.js >/dev/null
npx -y eslint@8.57.0 --no-eslintrc -c eslintrc.json game.js -f unix | sed 's#.*/game.js:#index.html:#' || true
echo "Error 개수: $(npx -y eslint@8.57.0 --no-eslintrc -c eslintrc.json game.js -f unix | grep -c 'Error/' || true)"
