#!/usr/bin/env python3
"""Pre-push guard: every image the page references must exist on disk."""
import re, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
html = open('index.html').read()
refs = sorted(set(re.findall(r'(?:img|fonts)/[\w./-]+\.(?:avif|jpg|png|woff2)', html)))
missing = [r for r in refs if not os.path.exists(r)]
if missing:
    print("FAIL — %d referenced asset(s) missing:" % len(missing))
    for m in missing: print("   ", m)
    sys.exit(1)
print("OK — all %d referenced assets present" % len(refs))
