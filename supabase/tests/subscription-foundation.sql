begin;
insert into auth.users(id) values('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002'),('00000000-0000-4000-8000-000000000003');
insert into launcher_private.admins values('00000000-0000-4000-8000-000000000001');
insert into public.launcher_games(id,engine_key,title,status,access_model) values('test-paid','test-paid','Paid','published','premium'),('test-free','test-free','Free','published','free');
create function public.test_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',label;end if;end$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.test_assert(not public.launcher_is_admin(),'ordinary user not admin');
do $$begin
 begin perform public.launcher_admin_state();raise exception 'FAIL state exposed';exception when insufficient_privilege then null;end;
 begin perform public.launcher_admin_command('grant','{}','test');raise exception 'FAIL user grant';exception when insufficient_privilege then null;end;
 begin perform public.launcher_admin_check_access('00000000-0000-4000-8000-000000000001','test-paid');raise exception 'FAIL user inspect';exception when insufficient_privilege then null;end;
 begin insert into launcher_private.admins values(auth.uid());raise exception 'FAIL self admin';exception when insufficient_privilege then null;end;
 begin insert into public.launcher_entitlements(owner_id,game_id,source) values(auth.uid(),'test-paid','admin');raise exception 'FAIL direct grant';exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claims','{"user_metadata":{"role":"admin"}}',true);
select public.test_assert(not public.launcher_is_admin(),'user metadata cannot elevate role');
select set_config('request.jwt.claims','{}',true);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.test_assert(public.launcher_is_admin(),'admin membership works');
select public.launcher_admin_command('grant','{"user_id":"00000000-0000-4000-8000-000000000002","game_id":"test-paid","term":"7d"}','QA manual grant');
select public.test_assert((public.launcher_admin_check_access('00000000-0000-4000-8000-000000000002','test-paid')->>'allowed')::boolean,'manual grant permits premium');
select public.test_assert(not (public.launcher_admin_check_access('00000000-0000-4000-8000-000000000003','test-paid')->>'allowed')::boolean,'owner isolation');
select public.launcher_admin_command('grant','{"user_id":"00000000-0000-4000-8000-000000000002","all_games":true,"term":"3m"}','QA second scope');
select public.launcher_admin_command('revoke',jsonb_build_object('id',(public.launcher_admin_state('00000000-0000-4000-8000-000000000002')->'entitlements'->0->>'id')),'QA revoke one grant');
select public.test_assert((public.launcher_admin_check_access('00000000-0000-4000-8000-000000000002','test-paid')->>'allowed')::boolean,'other valid grant survives revocation');
select public.launcher_admin_command('block','{"user_id":"00000000-0000-4000-8000-000000000002","game_id":"test-paid"}','QA blocked game');
select public.test_assert(public.launcher_admin_check_access('00000000-0000-4000-8000-000000000002','test-paid')->>'reason'='game_blocked','block overrides grant');
select public.test_assert((public.launcher_admin_check_access('00000000-0000-4000-8000-000000000002','test-free')->>'allowed')::boolean,'game block does not block other games');
select public.launcher_admin_command('unblock',jsonb_build_object('id',public.launcher_admin_state('00000000-0000-4000-8000-000000000002')->'blocks'->0->>'id'),'QA unblock');
select public.launcher_admin_command('maintenance','{"game_id":"test-paid","status":"maintenance"}','QA maintenance');
select public.test_assert(not (public.launcher_admin_check_access('00000000-0000-4000-8000-000000000002','test-paid')->>'allowed')::boolean,'maintenance overrides all grants');
select public.launcher_admin_command('maintenance','{"game_id":"test-paid","status":"published"}','QA restore');
select public.test_assert((public.launcher_admin_check_access('00000000-0000-4000-8000-000000000002','test-paid')->>'allowed')::boolean,'restore retains valid grants');
select public.launcher_admin_command('block','{"user_id":"00000000-0000-4000-8000-000000000002"}','QA account block');
select public.launcher_admin_command('mode','{"mode":"pilot"}','QA pilot mode');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.test_assert((public.launcher_check_access_v2('test-free')->>'allowed')::boolean,'nonpilot behavior preserved');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.launcher_admin_command('pilot','{"user_id":"00000000-0000-4000-8000-000000000002","enabled":true}','QA enable pilot');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.test_assert(public.launcher_check_access_v2('test-free')->>'reason'='account_blocked','pilot block applies even to free game');
do $$begin begin perform public.launcher_session_start('test-free',gen_random_uuid());raise exception 'FAIL blocked session';exception when insufficient_privilege then null;end;end$$;
select public.test_assert((select count(*)=2 from public.launcher_entitlements),'own entitlements visible');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',true);
select public.test_assert((select count(*)=0 from public.launcher_entitlements),'RLS isolates entitlement rows');
reset role;
update launcher_private.blocks set revoked_at=now();
update public.launcher_entitlements set starts_at=now()-interval '2 days',expires_at=now() where revoked_at is null;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.test_assert(not (public.launcher_check_access_v2('test-paid')->>'allowed')::boolean,'expiry boundary denies immediately without scheduler');
reset role;
update public.launcher_entitlements set starts_at=now()+interval '1 day',expires_at=now()+interval '8 days' where revoked_at is null;
set local role authenticated;
select public.test_assert(not (public.launcher_check_access_v2('test-paid')->>'allowed')::boolean,'future grant not active');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$begin
 begin perform public.launcher_admin_command('mode','{"mode":"live"}','QA forbidden mode');raise exception 'FAIL live mode';exception when invalid_parameter_value then null;end;
 begin perform public.launcher_admin_command('grant','{"user_id":"00000000-0000-4000-8000-000000000002","game_id":"test-paid","term":"bad"}','QA invalid term');raise exception 'FAIL invalid term';exception when invalid_parameter_value then null;end;
 begin perform public.launcher_admin_command('mode','{"mode":"off"}','');raise exception 'FAIL empty reason';exception when invalid_parameter_value then null;end;
 begin perform public.launcher_admin_command('grant','{"user_id":"00000000-0000-4000-8000-000000000002","game_id":"test-paid","all_games":true,"term":"7d"}','QA invalid scope');raise exception 'FAIL invalid scope';exception when invalid_parameter_value then null;end;
end$$;
select public.test_assert(jsonb_array_length(public.launcher_admin_state()->'audit')=10,'successful changes audited, rejected commands atomic');
-- All requested terms use server time and calendar months, never client-provided expiry.
do $$declare t text;expected timestamptz;r jsonb;e jsonb;begin
 foreach t in array array['7d','14d','30d','3m','6m','1y'] loop
  r:=public.launcher_admin_command('grant',jsonb_build_object('user_id','00000000-0000-4000-8000-000000000003','game_id','test-paid','term',t),'QA all periods');
  select x into e from jsonb_array_elements(public.launcher_admin_state('00000000-0000-4000-8000-000000000003')->'entitlements') x where x->>'id'=r->>'id';
  expected:=case t when '7d' then now()+interval '168 hours' when '14d' then now()+interval '336 hours' when '30d' then now()+interval '720 hours'
   when '3m' then ((now() at time zone 'Asia/Ho_Chi_Minh')+interval '3 months') at time zone 'Asia/Ho_Chi_Minh'
   when '6m' then ((now() at time zone 'Asia/Ho_Chi_Minh')+interval '6 months') at time zone 'Asia/Ho_Chi_Minh'
   when '1y' then ((now() at time zone 'Asia/Ho_Chi_Minh')+interval '1 year') at time zone 'Asia/Ho_Chi_Minh' end;
  perform public.test_assert((e->>'expires_at')::timestamptz=expected,'term '||t);
 end loop;
end$$;
select public.launcher_admin_command('mode','{"mode":"off"}','QA disable rollout');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.launcher_session_start('test-free','aaaaaaaa-aaaa-4000-8000-000000000001');
select public.launcher_session_start('test-free','aaaaaaaa-aaaa-4000-8000-000000000001');
select public.test_assert((select count(*)=1 from public.launcher_sessions),'legacy free session remains idempotent');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"is_anonymous":true}',true);
select public.test_assert(not public.launcher_is_admin(),'anonymous claim cannot administer');
reset role;
set local role anon;
do $$begin
 begin perform public.launcher_admin_state();raise exception 'FAIL anon state';exception when insufficient_privilege then null;end;
 begin perform public.launcher_admin_command('mode','{"mode":"off"}','QA guest');raise exception 'FAIL anon command';exception when insufficient_privilege then null;end;
end$$;
reset role;
select public.test_assert(not (select commerce_enabled from public.launcher_settings where id),'commerce remains disabled');
select public.test_assert((select bool_and(relrowsecurity) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='launcher_private' and c.relkind='r'),'RLS enabled on every new table');
rollback;
