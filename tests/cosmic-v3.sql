\set ON_ERROR_STOP on
begin;
create function public.cosmic_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',label;end if;raise notice 'PASS: %',label;end$$;
insert into auth.users(id) values('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
set local role anon;
select public.cosmic_assert(public.cosmic_ranking_v3()='[]'::jsonb,'Cosmic guest sees honest empty ranking');
do $$begin begin perform public.cosmic_start_v3('daily',1);raise exception 'Guest ranked';exception when insufficient_privilege then raise notice 'PASS: Cosmic guest cannot request ticket';end;end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.arcadex_save_identity('Cosmic Pilot','🚀');
select public.cosmic_start_v3('daily',1,auth.uid())->>'id' as ticket \gset
select set_config('test.cosmic_ticket',:'ticket',true);
select public.cosmic_assert((select count(*)=1 from public.cosmic_runs),'Cosmic owner reads own run');
select public.cosmic_assert((select pack_version=3 and (config->>'version')::int=3 from public.cosmic_runs),'Cosmic v3 ticket and config agree');
select public.cosmic_assert((select (config->'upgrades'->>'cannon')::integer=5 and config->'boosters'='[]'::jsonb and config->'mutators'='["fast"]'::jsonb from public.cosmic_runs),'Cosmic daily config has standard loadout and fixed mutator');
do $$begin begin update public.cosmic_runs set score=999999;raise exception 'Editable';exception when insufficient_privilege then raise notice 'PASS: Cosmic browser cannot edit score';end;end$$;
do $$begin begin perform public.cosmic_accept(current_setting('test.cosmic_ticket')::uuid,auth.uid(),5400,999999,true,'');raise exception 'Public accept';exception when insufficient_privilege then raise notice 'PASS: Cosmic browser cannot bypass replay verifier';end;end$$;
do $$begin begin perform public.cosmic_start_v3('daily',1,'00000000-0000-4000-8000-000000000002');raise exception 'Account mismatch';exception when insufficient_privilege then raise notice 'PASS: Cosmic expected owner checked';end;end$$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.cosmic_assert((select count(*)=0 from public.cosmic_runs),'Cosmic RLS hides other account runs');
reset role;
update public.cosmic_runs set started_at=clock_timestamp()-interval '100 seconds' where id=current_setting('test.cosmic_ticket')::uuid;
set local role service_role;
select public.cosmic_assert((public.cosmic_accept(current_setting('test.cosmic_ticket')::uuid,'00000000-0000-4000-8000-000000000001',5400,25000,true,'AA==')->>'verified')::boolean,'Cosmic trusted verifier publishes checked score');
select public.cosmic_assert((public.cosmic_accept(current_setting('test.cosmic_ticket')::uuid,'00000000-0000-4000-8000-000000000001',5400,99999,true,'AA==')->>'score')::integer=25000,'Cosmic duplicate accept is idempotent');
reset role;
set local role anon;
select public.cosmic_assert(public.cosmic_ranking_v3()->0->>'name'='Cosmic Pilot','Cosmic ranking joins canonical account identity');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.cosmic_start_v3('daily',1,auth.uid());select public.cosmic_start_v3('daily',1,auth.uid());
do $$begin begin perform public.cosmic_start_v3('daily',1,auth.uid());raise exception 'Fourth daily';exception when program_limit_exceeded then raise notice 'PASS: Cosmic server enforces 3 daily attempts';end;end$$;
select public.cosmic_start_v3('endless',91,auth.uid())->>'id' as endless \gset
select set_config('test.cosmic_endless',:'endless',true);
select public.cosmic_assert((select (config->'upgrades'->>'cannon')::integer=7 and (config->'upgrades'->>'core')::integer=6 from public.cosmic_runs where mode='endless'),'Cosmic endless loadout totals SL40');
reset role;
set local role service_role;
do $$begin begin perform public.cosmic_accept(current_setting('test.cosmic_endless')::uuid,'00000000-0000-4000-8000-000000000001',36000,50000,true,'');raise exception 'Impossible wall time';exception when invalid_parameter_value then raise notice 'PASS: Cosmic server rejects replay faster than wall time';end;end$$;
reset role;
-- Legacy scores remain stored and isolated from v3.
insert into public.cosmic_runs(owner_id,mode,period,level,pack_version,config,finished_at,score,frames)
select owner_id,mode,period,level,2,jsonb_set(config,'{version}','2'),clock_timestamp(),999999,5400
from public.cosmic_runs where id=current_setting('test.cosmic_ticket')::uuid;
select public.cosmic_assert((public.cosmic_ranking_v3()->0->>'score')::integer=25000,'v3 ranking excludes legacy score');
select public.cosmic_assert((public.cosmic_ranking()->0->>'score')::integer=999999,'v2 ranking retains legacy score');
rollback;
