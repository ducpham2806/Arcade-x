// Structure of the Claude Code agents and skills in .claude/ (adapted from Claude Code Game
// Studios, see .claude/CCGS-NOTICE.md): valid front matter, unique names that do not shadow
// built-in skills, no leftovers of the engine-specific upstream setup, and every agent or npm
// script a file refers to actually exists.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const BUILT_IN = new Set(['code-review', 'security-review', 'simplify', 'init', 'run', 'review', 'loop']);
const LEFTOVER = /Godot|Unity|Unreal|GDScript|project\.yaml|yaml-helper|production\/|design\/gdd|\.claude\/docs|\.claude\/rules|director-gates|May I write/;
// Upstream agents that were not imported; prose must not hand work to them.
const ABSENT = /\b(lead-programmer|technical-director|ai-programmer|engine-programmer|devops-engineer|network-programmer|tools-programmer|audio-director|world-builder|analytics-engineer|live-ops-designer|release-manager|localization-lead|community-manager|prototyper)\b|Technical Director|Audio Director/;
const ROLE = /`([a-z]+(?:-[a-z]+)*-(?:designer|director|programmer|artist|analyst|engineer|specialist|lead|tester)|writer|producer)`/g;

function frontMatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(m, `${file}: missing front matter`);
  const fields = Object.fromEntries(m[1].split('\n').map(l => l.match(/^([a-zA-Z-]+):\s*(.*)$/)).filter(Boolean).map(x => [x[1], x[2].replace(/^"|"$/g, '')]));
  return { text, fields };
}

const agentDir = path.join(root, '.claude/agents'), skillDir = path.join(root, '.claude/skills');
const agents = fs.readdirSync(agentDir).filter(f => f.endsWith('.md')).map(f => ({ id: f.slice(0, -3), file: path.join(agentDir, f) }));
const skills = fs.readdirSync(skillDir).map(d => ({ id: d, file: path.join(skillDir, d, 'SKILL.md') }));
const agentNames = new Set(agents.map(a => a.id));
const seen = new Set();
const checks = [...agents.map(a => ({ ...a, kind: 'agent' })), ...skills.map(s => ({ ...s, kind: 'skill' }))];

for (const item of checks) {
  const { text, fields } = frontMatter(item.file);
  assert.equal(fields.name, item.id, `${item.file}: name must match its ${item.kind === 'agent' ? 'file' : 'folder'}`);
  assert.ok(fields.description && fields.description.length > 20, `${item.file}: description missing`);
  assert.ok(!seen.has(`${item.kind}:${item.id}`), `duplicate ${item.kind} ${item.id}`); seen.add(`${item.kind}:${item.id}`);
  if (item.kind === 'skill') assert.ok(!BUILT_IN.has(item.id), `skill ${item.id} shadows a built-in skill`);
  if (item.kind === 'agent') {
    assert.equal(fields.model, 'inherit', `${item.id}: model must be inherit`);
    assert.ok(!('memory' in fields), `${item.id}: agent memory is not used in this repo`);
    assert.match(text, /Working in ArcadeX/, `${item.id}: missing ArcadeX context`);
    const listed = (fields.skills || '').replace(/[[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    for (const s of listed) assert.ok(skills.some(k => k.id === s), `${item.id}: preloads unknown skill ${s}`);
  }
  const leftover = text.match(LEFTOVER);
  assert.ok(!leftover, `${item.file}: upstream leftover "${leftover && leftover[0]}"`);
  const absent = text.match(ABSENT);
  assert.ok(!absent, `${item.file}: refers to agent "${absent && absent[0]}" that was not imported`);
  for (const m of text.matchAll(/`\/([a-z][a-z-]*)/g)) assert.ok(skills.some(k => k.id === m[1]), `${item.file}: refers to missing skill /${m[1]}`);
  for (const m of text.matchAll(ROLE)) assert.ok(agentNames.has(m[1]), `${item.file}: refers to missing agent ${m[1]}`);
}

for (const file of [...checks.map(c => c.file), path.join(root, 'CLAUDE.md')]) {
  for (const m of fs.readFileSync(file, 'utf8').matchAll(/(?:npm run(?: -s)? |`)((?:test|perf|analyze):[a-z-]+)/g)) {
    assert.ok(pkg.scripts[m[1]], `${file}: npm script ${m[1]} does not exist`);
  }
}
assert.match(fs.readFileSync(path.join(root, '.claude/CCGS-NOTICE.md'), 'utf8'), /MIT License[\s\S]*Copyright \(c\) 2026 Donchitos/);
console.log(JSON.stringify({ agents: agents.length, skills: skills.length, status: 'pass' }));
