#!/usr/bin/env python3
"""index.html 안의 <script> 본문만 뽑아 game.js로 저장. 줄 번호는 index.html과 똑같이 맞춤(밖은 빈 줄)."""
import re, sys, os
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'index.html')
out_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), 'game.js')
out = []; inside = False
for line in open(src, encoding='utf-8').read().split('\n'):
    if not inside:
        m = re.search(r'<script(?![^>]*src)[^>]*>', line)
        if m and '</script>' not in line[m.end():]:
            inside = True; out.append(''); continue
        out.append('')
    else:
        if '</script>' in line: inside = False; out.append(line.split('</script>')[0])
        else: out.append(line)
open(out_path, 'w', encoding='utf-8').write('\n'.join(out))
print(out_path)
