\set ON_ERROR_STOP on
begin;
create function public.car_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',label;end if;raise notice 'PASS: %',label;end$$;
select public.car_assert((select count(*)=100 and min(optimal_moves)>=5 and max(optimal_moves)>20 from public.car_escape_levels),'100 server boards have certified difficulty');
insert into auth.users(id) values('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
set local role anon;
select public.car_assert(public.car_escape_ranking(1)='[]'::jsonb,'guest reads empty ranking without fake users');
do $$begin begin perform public.car_escape_start(1);raise exception 'Guest started ranked run';exception when insufficient_privilege then raise notice 'PASS: guest cannot start ranked run';end;end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.arcadex_save_identity('Car Driver','🎮');
select public.car_escape_start(1) as run_id \gset
select set_config('test.car_run',:'run_id',true);
select public.car_assert((select count(*)=1 from public.car_escape_runs),'owner can read own ticket');
do $$begin begin update public.car_escape_runs set score=99999;raise exception 'Editable score';exception when insufficient_privilege then raise notice 'PASS: client cannot edit ranked score';end;end$$;
do $$begin begin perform public.car_escape_submit(current_setting('test.car_run')::uuid,'[]',0,0);raise exception 'Unsolved accepted';exception when invalid_parameter_value then raise notice 'PASS: unsolved / too-short replay rejected';end;end$$;
do $$begin begin perform public.car_escape_start(1,'00000000-0000-4000-8000-000000000002');raise exception 'Account mismatch accepted';exception when insufficient_privilege then raise notice 'PASS: changed account cannot start';end;end$$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.car_assert((select count(*)=0 from public.car_escape_runs),'run RLS isolates other account');
do $$begin begin perform public.car_escape_submit(current_setting('test.car_run')::uuid,'[]',0,0);raise exception 'Hijack accepted';exception when insufficient_privilege then raise notice 'PASS: cannot submit another owner run';end;end$$;
reset role;
-- Campaign solution stored in test-only setting; source comes from generated frontend bank.
select set_config('test.car_solution','[{"vehicleId":1,"to":3},{"vehicleId":7,"to":0},{"vehicleId":5,"to":0},{"vehicleId":2,"to":0},{"vehicleId":0,"to":4}]',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.car_assert((public.car_escape_submit(current_setting('test.car_run')::uuid,current_setting('test.car_solution')::jsonb,1000,0)->>'stars')::integer=3,'valid optimal replay earns 3 stars');
select public.car_assert((select jsonb_array_length(public.car_escape_ranking(1,false)))=1,'verified run appears in pure ranking');
select public.car_assert(public.car_escape_ranking(1,true)='[]'::jsonb,'pure run does not pollute hint ranking');
select public.car_escape_submit(current_setting('test.car_run')::uuid,current_setting('test.car_solution')::jsonb,1000,0);
select public.car_assert((select count(*)=1 from public.car_escape_runs where finished_at is not null),'duplicate submit is idempotent');
select public.car_escape_start(1) as hint_id \gset
select public.car_assert((public.car_escape_submit(:'hint_id',current_setting('test.car_solution')::jsonb,1000,1)->>'stars')::integer=1,'assisted solve caps stars at one');
select public.car_assert(jsonb_array_length(public.car_escape_ranking(1,true))=1,'hint result has separate ranking');
select public.car_escape_start(1) as invalid_id \gset
select set_config('test.invalid_run',:'invalid_id',true);
do $$begin begin perform public.car_escape_submit(current_setting('test.invalid_run')::uuid,'[{"vehicleId":0,"to":4},{"vehicleId":0,"to":4},{"vehicleId":0,"to":4},{"vehicleId":0,"to":4},{"vehicleId":0,"to":4}]'::jsonb,1000,0);raise exception 'Bad replay accepted';exception when invalid_parameter_value then raise notice 'PASS: collision / no-op replay rejected';end;end$$;
do $$begin begin perform public.car_escape_submit(current_setting('test.invalid_run')::uuid,'[{"vehicleId":0,"to":null},{"vehicleId":0,"to":4},{"vehicleId":0,"to":4},{"vehicleId":0,"to":4},{"vehicleId":0,"to":4}]'::jsonb,1000,0);raise exception 'Null move accepted';exception when invalid_parameter_value then raise notice 'PASS: null / malformed move rejected';end;end$$;
do $$begin begin perform public.car_escape_submit(current_setting('test.invalid_run')::uuid,current_setting('test.car_solution')::jsonb,1000,0,'00000000-0000-4000-8000-000000000002');raise exception 'Changed account submitted';exception when insufficient_privilege then raise notice 'PASS: changed account cannot submit';end;end$$;
reset role;
-- A ranked countdown uses trusted wall time, even if the client reports a shorter duration.
update public.car_escape_runs set level=11,started_at=clock_timestamp()-interval '3 minutes' where id=current_setting('test.invalid_run')::uuid;
select set_config('test.timed_solution','[{"vehicleId":12,"to":3},{"vehicleId":0,"to":0},{"vehicleId":3,"to":1},{"vehicleId":1,"to":0},{"vehicleId":2,"to":0},{"vehicleId":3,"to":0},{"vehicleId":0,"to":4}]',true);
set local role authenticated;
do $$begin begin perform public.car_escape_submit(current_setting('test.invalid_run')::uuid,current_setting('test.timed_solution')::jsonb,1000,0);raise exception 'Expired timer accepted';exception when invalid_parameter_value then raise notice 'PASS: server clock rejects expired countdown';end;end$$;
reset role;
rollback;
