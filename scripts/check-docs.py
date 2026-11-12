#!/usr/bin/env python3
"""Check the maintained session inputs and pinned Studio snapshot; stdlib only."""
import hashlib
import re
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
LIMITS = {
    'AGENTS.md': 5000,
    'project.md': 3000,
    'docs/SESSION-HANDOFF.md': 3000,
    'docs/PROJECT-PLAN.md': 6500,
    'docs/WORKLOG.md': 4500,
    'docs/COMPLETED.md': 6500,
}
LINK = re.compile(r'\[[^\]]*\]\(([^)]+)\)')
errors = []
cards = sorted((ROOT / 'docs/plans').glob('*.md'))
expected_cards = {
    'ADS', 'COMMERCE', 'DUEL', 'GAME-POLISH', 'MAINTENANCE',
    'SNAKE', 'TANK-CLASH', 'WORD-CHAIN',
}
if {card.stem for card in cards} != expected_cards:
    errors.append('Module cards differ from the required eight: ' + ', '.join(sorted(expected_cards)))
for card in cards:
    LIMITS[card.relative_to(ROOT).as_posix()] = 6500

inputs = [ROOT / name for name in LIMITS]
inputs += [ROOT / name for name in (
    'README.md', 'CLAUDE.md', 'docs/INDEX.md', 'docs/WORKFLOW.md',
    'docs/templates/TASK.md', 'docs/studio/INDEX.md',
    'docs/studio/INSTALLATION.md', 'docs/OWNER-TODO.md',
    'docs/PENDING-DECISIONS.md', 'docs/TESTING.md',
    'docs/GRAPHIFY.md', 'docs/CONTINUATION-2026-11-11.md', 'docs/ads/GOOGLE-ADS-PLAN.md',
    'docs/ads/PLACEMENTS.md', 'docs/ads/READINESS-2026-11-11.md', 'docs/ads/POLICY-LOADER-2026-11-11.md', 'docs/qa/MERGE-AUDIT-2026-11-11.md', 'docs/qa/SNAKE-R0A-2026-11-12.md', 'docs/qa/SNAKE-R0B-2026-11-12.md',
    'docs/qa/SNAKE-R1A-2026-11-12.md', 'docs/snake/UI-SAVE-RUNBOOK.md',
    '.agents/skills/arcadex-studio/SKILL.md',
)]
for file in inputs:
    if not file.is_file() or file.suffix != '.md':
        errors.append(f'Missing Markdown input: {file.relative_to(ROOT)}')
        continue
    content = file.read_text()
    name = file.relative_to(ROOT).as_posix()
    if name in LIMITS and len(content) > LIMITS[name]:
        errors.append(f'{name}: {len(content)} characters > {LIMITS[name]}')
    # Links in fenced examples are not active document routes.
    prose = re.sub(r'```.*?```', '', content, flags=re.S)
    for target in LINK.findall(prose):
        if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', target) or target.startswith('#'):
            continue
        target = unquote(target.strip('<>').split('#')[0].split('?')[0])
        if target and not (file.parent / target).exists():
            errors.append(f'{name}: broken link {target}')

log = (ROOT / 'docs/WORKLOG.md').read_text()
entries = re.findall(r'^## ', log, flags=re.M)
if not 1 <= len(entries) <= 3:
    errors.append(f'WORKLOG: expected 1–3 entries, found {len(entries)}')

studio = ROOT / '.agents/game-studio'
for pattern, expected in [('skills/*/SKILL.md', 116), ('agents/*/*.md', 21),
                          ('rules/*.md', 4), ('templates/*.md', 6)]:
    found = len(list(studio.glob(pattern)))
    if found != expected:
        errors.append(f'Studio {pattern}: {found}, expected {expected}')

manifest = ROOT / 'docs/studio/SOURCE-MANIFEST.md'
rows = re.findall(r'^\| `([^`]+)` \| `([^`]+)` \| `([a-f0-9]{40})` \|$',
                  manifest.read_text(), flags=re.M)
if len(rows) != 297 or len({row[1] for row in rows}) != 297:
    errors.append('Studio manifest must contain 297 unique installed files')
for source, installed, expected in rows:
    path = ROOT / installed
    if not path.is_file():
        errors.append(f'Missing Studio source file: {installed}')
        continue
    data = path.read_bytes()
    actual = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
    if actual != expected:
        errors.append(f'Studio file differs from pinned source: {installed} ({source})')

if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f'PASS: {len(inputs)} Markdown inputs; budgets; {len(entries)} log entries; '
      f'116 skills / 21 roles / 4 rules / 6 templates; 297 source blobs')
for name in ('AGENTS.md', 'docs/SESSION-HANDOFF.md', 'docs/PROJECT-PLAN.md'):
    print(f'{name}: {len((ROOT / name).read_text())}/{LIMITS[name]} characters')
