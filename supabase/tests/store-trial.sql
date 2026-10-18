begin;
-- test-step
insert into auth.users(id,is_anonymous) values('20000000-0000-4000-8000-000000000001',false),('20000000-0000-4000-8000-000000000002',false),('20000000-0000-4000-8000-000000000003',false),('20000000-0000-4000-8000-000000000004',true);
-- test-step
insert into launcher_private.admins(user_id) values('20000000-0000-4000-8000-000000000001');
-- test-step
insert into public.launcher_games(id,engine_key,title,status,access_model) values('tile-2048','tile-2048','2048','published','premium'),('store-other','store-other','Other','published','premium') on conflict(id) do update set status='published',access_model='premium';
-- test-step
create function public.store_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',label;end if;end$$;
-- test-step
set local role authenticated;
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
-- test-step
select public.launcher_admin_command('mode','{"mode":"pilot"}','QA store pilot');
-- test-step
select public.launcher_admin_command('pilot','{"user_id":"20000000-0000-4000-8000-000000000002","enabled":true}','QA store pilot');
-- test-step
select public.launcher_admin_command('pilot','{"user_id":"20000000-0000-4000-8000-000000000003","enabled":true}','QA store pilot');
-- test-step
select public.launcher_admin_configure_trial(true,1,'QA trial enabled');
-- test-step
select public.launcher_admin_save_offer(null,'QA Game','game',array['tile-2048'],'7d',12345,true,'QA create');
-- test-step
select public.launcher_admin_save_offer(null,'QA Bundle','bundle',array['tile-2048','store-other'],'3m',23456,true,'QA create');
-- test-step
select public.launcher_admin_save_offer(null,'QA Pass','all','{}','1y',34567,false,'QA draft');
-- test-step
do $$begin
 begin perform public.launcher_admin_save_offer(null,'Bad bundle','bundle',array['tile-2048'],'7d',1,true,'QA invalid');raise exception 'FAIL invalid bundle';exception when check_violation then null;end;
 begin perform public.launcher_admin_save_offer(null,'Bad games','bundle',array['tile-2048','tile-2048'],'7d',1,true,'QA invalid');raise exception 'FAIL duplicates';exception when invalid_parameter_value then null;end;
 begin perform public.launcher_admin_save_offer(null,'Bad price','all','{}','7d',0,true,'QA invalid');raise exception 'FAIL zero price';exception when check_violation then null;end;
 begin perform public.launcher_admin_save_offer(null,'Bad term','all','{}','2d',1,true,'QA invalid');raise exception 'FAIL bad term';exception when check_violation then null;end;
end$$;
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
-- test-step
select public.store_assert(jsonb_array_length(public.launcher_store_catalog()->'offers')=2,'hide drafts');
-- test-step
select public.store_assert(public.launcher_store_catalog()->>'checkoutEnabled'='false','checkout never enabled');
-- test-step
select set_config('qa.run',public.launcher_trial_start('tile-2048',auth.uid())->>'id',true);
-- test-step
select public.store_assert(public.launcher_trial_start('tile-2048',auth.uid())->>'id'=current_setting('qa.run'),'retry start reuses run');
-- test-step
select public.store_assert(public.launcher_trial_save(current_setting('qa.run')::uuid,0,'{"version":1,"gameMode":"classic","score":4}')=1,'first save');
-- test-step
select public.store_assert(public.launcher_trial_save(current_setting('qa.run')::uuid,0,'{"version":1,"gameMode":"classic","score":4}')=1,'lost response retry idempotent');
-- test-step
do $$begin
 begin perform public.launcher_trial_save(current_setting('qa.run')::uuid,0,'{"version":1,"gameMode":"classic","score":8}');raise exception 'FAIL stale save';exception when serialization_failure then null;end;
 begin perform public.launcher_trial_save(current_setting('qa.run')::uuid,1,'{"version":1,"gameMode":"rush"}');raise exception 'FAIL mode escape';exception when invalid_parameter_value then null;end;
 begin perform public.launcher_trial_start('tile-2048','20000000-0000-4000-8000-000000000003');raise exception 'FAIL wrong owner';exception when insufficient_privilege then null;end;
 begin perform public.launcher_store_admin();raise exception 'FAIL nonadmin read';exception when insufficient_privilege then null;end;
 begin perform public.launcher_admin_configure_trial(true,10,'QA bad actor');raise exception 'FAIL nonadmin write';exception when insufficient_privilege then null;end;
 begin perform 1 from launcher_private.trial_runs;raise exception 'FAIL direct read';exception when insufficient_privilege then null;end;
end$$;
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000003',true);
-- test-step
do $$begin
 begin perform public.launcher_trial_save(current_setting('qa.run')::uuid,1,'{"version":1,"gameMode":"classic"}');raise exception 'FAIL cross user save';exception when insufficient_privilege then null;end;
 begin perform public.launcher_trial_finish(current_setting('qa.run')::uuid);raise exception 'FAIL cross user finish';exception when insufficient_privilege then null;end;
end$$;
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
-- test-step
select public.launcher_admin_command('maintenance','{"game_id":"tile-2048","status":"maintenance"}','QA maintenance');
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
-- test-step
select public.store_assert(jsonb_array_length(public.launcher_store_catalog()->'offers')=0,'hide offers during maintenance');
-- test-step
select public.store_assert(jsonb_array_length(public.launcher_store_catalog()->'trials')=0,'hide trial during maintenance');
-- test-step
do $$begin begin perform public.launcher_trial_start('tile-2048',auth.uid());raise exception 'FAIL maintenance resume';exception when insufficient_privilege then null;end;end$$;
-- test-step
select public.store_assert(public.launcher_trial_save(current_setting('qa.run')::uuid,1,'{"version":1,"gameMode":"classic","score":8}')=2,'maintenance still allows saving active board');
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
-- test-step
select public.launcher_admin_command('maintenance','{"game_id":"tile-2048","status":"published"}','QA reopen');
-- test-step
select public.launcher_admin_command('block','{"user_id":"20000000-0000-4000-8000-000000000003","game_id":"tile-2048"}','QA blocked trial');
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000003',true);
-- test-step
do $$begin begin perform public.launcher_trial_start('tile-2048',auth.uid());raise exception 'FAIL blocked trial';exception when insufficient_privilege then null;end;end$$;
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
-- test-step
select public.launcher_trial_finish(current_setting('qa.run')::uuid);
-- test-step
select public.launcher_trial_finish(current_setting('qa.run')::uuid);
-- test-step
do $$begin
 begin perform public.launcher_trial_start('tile-2048',auth.uid());raise exception 'FAIL quota exceeded';exception when invalid_parameter_value then null;end;
 begin perform public.launcher_trial_save(current_setting('qa.run')::uuid,2,'{"version":1,"gameMode":"classic"}');raise exception 'FAIL save ended';exception when insufficient_privilege then null;end;
end$$;
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000004',true);
-- test-step
do $$begin begin perform public.launcher_store_catalog();raise exception 'FAIL anonymous account';exception when insufficient_privilege then null;end;end$$;
-- test-step
reset role;
-- test-step
select public.store_assert((select count(*)=1 from launcher_private.trial_runs),'only one consumed run');
-- test-step
select public.store_assert((select count(*)=0 from public.launcher_entitlements),'trial grants no full entitlement');
-- test-step
select public.store_assert((select count(*)=3 from launcher_private.audit where action='offer_save'),'offer edits audited');
-- test-step
update launcher_private.trial_runs set finished_at=null,resume_until=now()-interval '1 second';
-- test-step
set local role authenticated;
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
-- test-step
do $$begin begin perform public.launcher_trial_start('tile-2048',auth.uid());raise exception 'FAIL expired trial reopened';exception when invalid_parameter_value then null;end;end$$;
-- test-step
select public.store_assert(public.launcher_trial_save(current_setting('qa.run')::uuid,2,'{"version":1,"gameMode":"classic","score":12}')=3,'expired resume window still preserves active game save');
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
-- test-step
select public.launcher_admin_command('mode','{"mode":"off"}','QA stop pilot');
-- test-step
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
-- test-step
select public.store_assert(jsonb_array_length(public.launcher_store_catalog()->'offers')=0,'off hides store offers');
-- test-step
do $$begin begin perform public.launcher_trial_start('tile-2048',auth.uid());raise exception 'FAIL pilot off bypass';exception when insufficient_privilege then null;end;end$$;
-- test-step
rollback;
