-- Private, reversible cold storage. No hard purge is performed by this job.
create table if not exists battleship_private.room_archive (
 id text primary key, code text not null, version integer not null,
 doc jsonb not null, updated_at timestamptz not null,
 archived_at timestamptz not null default clock_timestamp()
);
create table if not exists battleship_private.cron_archive (
 runid bigint primary key, doc jsonb not null,
 archived_at timestamptz not null default clock_timestamp()
);
alter table battleship_private.room_archive enable row level security;
alter table battleship_private.cron_archive enable row level security;
revoke all on battleship_private.room_archive,battleship_private.cron_archive from public,anon,authenticated;
-- Maintenance is owner-only, not another service/browser RPC.
create or replace function battleship_private.maintain() returns jsonb
language plpgsql security invoker set search_path='' as $$
declare moved_rooms integer; moved_logs integer; budgets integer;
begin
 if not pg_try_advisory_xact_lock(hashtextextended('battleship-maintenance',0)) then return '{"busy":true}'::jsonb; end if;
 with candidates as (
  select * from battleship_private.rooms where not active and doc->>'status'='closed'
  and updated_at<clock_timestamp()-interval '7 days'
  order by updated_at limit 500 for update skip locked
 ), archived as (
  insert into battleship_private.room_archive(id,code,version,doc,updated_at)
  select id,code,version,doc,updated_at from candidates on conflict(id) do nothing returning id
 ) delete from battleship_private.rooms r using archived a where r.id=a.id;
 get diagnostics moved_rooms=row_count;
 with candidates as (
  select d.* from cron.job_run_details d join cron.job j on j.jobid=d.jobid
  where j.jobname in ('battleship-room-timeouts','battleship-maintenance')
  and d.end_time<clock_timestamp()-interval '7 days'
  and d.status in ('succeeded','failed')
  order by d.end_time limit 5000 for update of d skip locked
 ), archived as (
  insert into battleship_private.cron_archive(runid,doc)
  select runid,to_jsonb(c) from candidates c on conflict(runid) do nothing returning runid
 ) delete from cron.job_run_details d using archived a where d.runid=a.runid;
 get diagnostics moved_logs=row_count;
 -- Rate windows are transient counters, not match/account records. Preserve today's.
 with old as (select uid,kind from battleship_private.request_budget where window_start<clock_timestamp()-interval '1 day' limit 5000 for update skip locked)
 delete from battleship_private.request_budget b using old o where b.uid=o.uid and b.kind=o.kind;
 get diagnostics budgets=row_count;
 return jsonb_build_object('rooms_archived',moved_rooms,'cron_runs_archived',moved_logs,'expired_budgets',budgets);
end;$$;
revoke all on function battleship_private.maintain() from public,anon,authenticated,service_role;
create index if not exists bs_rooms_closed_age on battleship_private.rooms(updated_at) where not active;
-- Cron owner executes directly. No additional Edge/admin route or credentials.
select cron.schedule('battleship-maintenance','17 * * * *','select battleship_private.maintain();');
