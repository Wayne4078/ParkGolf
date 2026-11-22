#!/usr/bin/env python3
"""HTML id 중복, 코드가 부르는데 HTML에 없는 id를 찾음."""
import re, collections, os
h = open(os.path.join(os.path.dirname(__file__), '..', 'index.html'), encoding='utf-8').read()
ids = re.findall(r'\sid="([^"]+)"', h)
refs = set(re.findall(r"\$\('([A-Za-z0-9_-]+)'\)", h)) | set(re.findall(r"getElementById\('([A-Za-z0-9_-]+)'\)", h))
dyn = set(re.findall(r"\.id\s*=\s*'([^']+)'", h))
print('중복 id:', [k for k, v in collections.Counter(ids).items() if v > 1])
print('HTML에 없는 id:', sorted(r for r in refs if r not in ids and r not in dyn))
