# Battleship maintenance

`battleship_reversible_maintenance_v1` adds owner-only `battleship_private.maintain()` and the hourly `battleship-maintenance` cron at minute 17 (UTC). The existing 10-second timeout worker is unchanged.

Each run archives up to 500 rooms that are both inactive and closed and whose last gameplay update is older than seven days. Full state/version/receipts are retained in `room_archive` before the hot row is removed. This is a seven-day hot resume/replay window; there is no UI for archived games. It never archives an active room, even if old. Row locks, skip-locked selection and a transaction advisory lock protect overlapping runs. Existing archive-ID conflicts preserve the hot room for inspection.

Up to 5,000 completed cron records older than seven days are moved into `cron_archive`, limited to Battleship's timeout and maintenance job names. Other games, unfinished runs and recent records are preserved. Up to 5,000 expired request-budget counters older than one day are removed; these are transient limits, not account/match history. Archives have RLS and no browser/service-role grants; the function is invoker and owner-only. No new Edge route, service credential or Auth access is needed.

This bounds the active tables' normal working set, subject to backlog/rate limits; archives still occupy database disk. Archive export and permanent purge need a separate retention policy. No automatic irreversible purge is configured.

## Monitor / pause

```sql
select jobname,schedule,active from cron.job where jobname in ('battleship-room-timeouts','battleship-maintenance');
select status,start_time,end_time,return_message from cron.job_run_details
where jobid=(select jobid from cron.job where jobname='battleship-maintenance') order by start_time desc limit 10;
select cron.alter_job((select jobid from cron.job where jobname='battleship-maintenance'),active:=false);
```

## Restore a closed room (owner only)

Check the exact ID and ensure its room code has not been reused. Restore does not reopen gameplay. A conflict intentionally makes no change. Keep the archive for audit.

```sql
insert into battleship_private.rooms(id,code,version,active,doc,updated_at)
select id,code,version,false,doc,updated_at from battleship_private.room_archive
where id='EXACT_ARCHIVED_ROOM_ID'
on conflict do nothing;
```

Closed match restoration is for diagnosis; it does not award rewards, reset clocks or recreate Auth accounts. No permanent deletion tool is exposed to players.
