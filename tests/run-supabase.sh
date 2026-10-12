#!/usr/bin/env bash
# Disposable PostgreSQL test database; no production URL or keys are used.
set -euo pipefail
repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
test_container="arcadex-sql-test-$$"
trap 'docker rm -f "$test_container" >/dev/null 2>&1 || true' EXIT
# This password is for the isolated test container only; no ports are published.
docker run --name "$test_container" -e POSTGRES_PASSWORD=local-test-only -d postgres:16-alpine >/dev/null
for attempt in $(seq 1 40); do
  if docker exec "$test_container" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then break; fi
  sleep 0.5
done
docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 <<'SQL'
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
grant usage on schema auth to authenticated,anon;
grant execute on function auth.uid() to authenticated,anon;
SQL
for migration in "$repo_dir"/supabase/migrations/*.sql; do
  docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 < "$migration"
done
docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 < "$repo_dir/tests/supabase.sql"

docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 < "$repo_dir/tests/identity.sql"
docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 < "$repo_dir/tests/launcher.sql"
docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 < "$repo_dir/tests/car-escape.sql"
docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 < "$repo_dir/tests/word-cross-fixtures.sql"
docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 < "$repo_dir/tests/word-cross.sql"
docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 < "$repo_dir/tests/cosmic.sql"
# psql resolves the golden fixture include inside the container.
docker cp "$repo_dir/tests/shikaku-fixtures.sql" "$test_container:/tmp/shikaku-fixtures.sql" >/dev/null
sed 's@\\ir shikaku-fixtures.sql@\\ir /tmp/shikaku-fixtures.sql@' "$repo_dir/tests/shikaku.sql" | docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1
# Two PostgreSQL transactions really contend for the same normalized unique key.
docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 <<'SQL'
insert into auth.users(id) values ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
SQL
race_log_a="$(mktemp)"
race_log_b="$(mktemp)"
docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 > "$race_log_a" 2>&1 <<'SQL' &
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.arcadex_save_identity('SQL Race Hero','🎮');
select pg_sleep(1);
commit;
SQL
race_pid_a=$!
docker exec -i "$test_container" psql -U postgres -q -v ON_ERROR_STOP=1 > "$race_log_b" 2>&1 <<'SQL' &
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.arcadex_save_identity('sql race hero','🤖');
select pg_sleep(1);
commit;
SQL
race_pid_b=$!
set +e
wait "$race_pid_a"; race_status_a=$?
wait "$race_pid_b"; race_status_b=$?
set -e
if { [ "$race_status_a" -eq 0 ] && [ "$race_status_b" -ne 0 ]; } || { [ "$race_status_b" -eq 0 ] && [ "$race_status_a" -ne 0 ]; }; then
  if rg -q 'duplicate key value violates unique constraint' "$race_log_a" "$race_log_b"; then
    echo 'PASS: concurrent PostgreSQL claims yield exactly one winner'
  else
    cat "$race_log_a" "$race_log_b"; exit 1
  fi
else
  cat "$race_log_a" "$race_log_b"; exit 1
fi
rm -f "$race_log_a" "$race_log_b"
