#!/usr/bin/env python3
"""Build a scoped, local AST graph for QA; never dispatch semantic/LLM work."""
import json
import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
SCOPES = (
    'tests/helpers', 'tests/tank-clash', 'tests/word-chain', 'tests/smoke',
    'src/games/tank-clash', 'src/games/word-chain', 'server/tank-clash-room',
    'src/services/pwaLifecycle.ts', 'src/services/supabaseClient.ts',
    'src/context/AuthContext.tsx', 'playwright.config.ts',
    'scripts/export-tank-review.mjs', 'scripts/word-chain-preview.mjs',
)
CODE = {'.ts', '.tsx', '.js', '.mjs', '.cjs', '.py'}


def included(path):
    return any(path == scope or path.startswith(scope + '/') for scope in SCOPES)


def exclusions(directory):
    result = []
    for child in sorted(directory.iterdir()):
        rel = child.relative_to(ROOT).as_posix()
        if included(rel):
            if child.is_symlink() or child.name == 'node_modules':
                result.append(rel)
            elif child.is_dir():
                result.extend(exclusions(child))
            elif child.suffix not in CODE:
                result.append(rel)
        elif child.is_dir() and not child.is_symlink() and any(s.startswith(rel + '/') for s in SCOPES):
            result.extend(exclusions(child))
        else:
            result.append(rel)
    return result


binary = os.environ.get('GRAPHIFY_BIN') or shutil.which('graphify')
if not binary:
    raise SystemExit('Install graphifyy==0.9.106 in a local venv and set GRAPHIFY_BIN; see docs/GRAPHIFY.md.')
args = [binary, 'extract', str(ROOT), '--code-only', '--no-cluster', '--max-workers', '2']
for pattern in exclusions(ROOT):
    args.extend(['--exclude', pattern])
subprocess.run(args, cwd=ROOT, check=True)
out = ROOT / 'graphify-out'
out.mkdir(exist_ok=True)
version = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
(out / 'QA-SCOPE.json').write_text(json.dumps({'source_commit': version, 'working_tree_changes': subprocess.run(
    ['git', 'diff', '--quiet'], cwd=ROOT).returncode != 0, 'scope': SCOPES,
    'mode': 'local AST only; no LLM; no source upload', 'query_budget': 700}, indent=2) + '\n')
print('QA graph ready. Query with --budget 700 --depth 1; read only the referenced source ranges.')
