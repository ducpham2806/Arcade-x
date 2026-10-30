// Docker-free twin of tests/run-supabase.sh: applies every migration in supabase/migrations to an
// in-process PostgreSQL (PGlite) with the same auth stubs, then runs the same SQL suites,
// including the subscription/commerce foundation used by VITE_ACCESS_CONTROL_V2.
// The two-connection race check needs real concurrent sessions and stays in run-supabase.sh.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';

const db = new PGlite(); await db.waitReady;
await db.exec(`
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create schema auth;
create table auth.users(id uuid primary key, is_anonymous boolean default false);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
grant usage on schema auth to authenticated,anon;
grant execute on function auth.uid() to authenticated,anon;
`);
// psql sends statements one by one (each autocommits unless inside BEGIN); a multi-statement
// string would run as one implicit transaction with a frozen now(). Split like psql does,
// respecting quotes, dollar quotes and comments.
function statements(sql) {
  const out = []; let cur = '', i = 0;
  while (i < sql.length) {
    const rest = sql.slice(i);
    const dollar = rest.match(/^\$[A-Za-z_]*\$/);
    if (rest.startsWith('--')) { const end = sql.indexOf('\n', i); i = end < 0 ? sql.length : end; continue; }
    if (rest.startsWith('/*')) { const end = sql.indexOf('*/', i + 2); i = end < 0 ? sql.length : end + 2; continue; }
    if (dollar) { const end = sql.indexOf(dollar[0], i + dollar[0].length); const stop = end < 0 ? sql.length : end + dollar[0].length; cur += sql.slice(i, stop); i = stop; continue; }
    if (sql[i] === "'") { let j = i + 1; while (j < sql.length && !(sql[j] === "'" && sql[j + 1] !== "'")) j += sql[j] === "'" ? 2 : 1; cur += sql.slice(i, j + 1); i = j + 1; continue; }
    if (sql[i] === ';') { if (cur.trim()) out.push({ text: cur.trim() }); cur = ''; i++; continue; }
    if (rest.startsWith('\\gset')) { out.push({ text: cur.trim(), gset: true }); cur = ''; i += 5; continue; }
    cur += sql[i++];
  }
  if (cur.trim()) out.push({ text: cur.trim() });
  return out;
}
// psql variables: `query \gset` stores the row's columns; :'name' / :name interpolate them.
const vars = {};
const interpolate = text => text.replace(/(?<!:):'(\w+)'|(?<!:):(\w+)\b/g, (m, quoted, raw) => {
  const name = quoted ?? raw;
  if (!(name in vars)) return m;
  return quoted ? `'${String(vars[name]).replace(/'/g, "''")}'` : String(vars[name]);
});
// `\set ON_ERROR_STOP on` is psql-only; this runner stops at the first error anyway.
const run = async (label, sql) => {
  try {
    for (const { text, gset } of statements(sql.replace(/^\\set ON_ERROR_STOP on\s*$/gm, ''))) {
      const statement = interpolate(text);
      try {
        if (gset) { const r = await db.query(statement); for (const [k, v] of Object.entries(r.rows[0])) vars[k] = v instanceof Date ? v.toISOString() : v !== null && typeof v === 'object' ? JSON.stringify(v) : v; }
        else await db.exec(statement);
      } catch (e) { e.statement = statement; throw e; }
    } console.log('PASS', label); }
  catch (e) { console.error(`FAIL ${label}: ${e.message}`); if (e.statement) console.error(e.statement.slice(0, 400)); process.exit(1); }
};
for (const file of readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort()) await run(`migration ${file}`, readFileSync(`supabase/migrations/${file}`, 'utf8'));
const suites = ['tests/supabase.sql', 'tests/identity.sql', 'tests/launcher.sql', 'supabase/tests/subscription-foundation.sql', 'supabase/tests/starter-gifts.sql', 'supabase/tests/store-trial.sql', 'tests/car-escape.sql', 'tests/word-cross-fixtures.sql', 'tests/word-cross.sql', 'tests/cosmic.sql'];
for (const file of suites) await run(file, readFileSync(file, 'utf8'));
// psql's \ir include is resolved here, as run-supabase.sh does inside the container.
await run('tests/shikaku.sql', readFileSync('tests/shikaku.sql', 'utf8').replace(/^\\ir shikaku-fixtures\.sql$/m, readFileSync('tests/shikaku-fixtures.sql', 'utf8')));
console.log('supabase SQL (PGlite): migrations and suites passed');
