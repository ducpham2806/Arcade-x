\set ON_ERROR_STOP on
begin;
create function public.wc_assert(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',label;end if;raise notice 'PASS: %',label;end$$;
select public.wc_assert((select jsonb_array_length(lexicon->'common')+jsonb_array_length(lexicon->'extended')=117597 from public.word_cross_packs where version=1),'offline dictionary contains 117597 forms');
do $$declare f record;begin for f in select * from public.word_cross_testfixtures loop if public.word_cross_generate(f.level,f.seed,f.avoid)<>f.puzzle then raise exception 'Generator mismatch level %, seed %',f.level,f.seed;end if;end loop;raise notice 'PASS: SQL and frontend generators agree on all 33 golden boards';end$$;
insert into auth.users(id) values('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
set local role anon;
select public.wc_assert(public.word_cross_ranking()='[]'::jsonb,'guest reads empty Word Cross ranking');
do $$begin begin perform public.word_cross_start(1);raise exception 'Guest started';exception when insufficient_privilege then raise notice 'PASS: guest cannot create ranked Word Cross run';end;end$$;
do $$begin begin perform public.word_cross_generate(1,0);raise exception 'Guest generated';exception when insufficient_privilege then raise notice 'PASS: internal generator not callable by guests';end;end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.arcadex_save_identity('Word Finder','🎮');
select public.word_cross_start(1) as ticket \gset
select set_config('test.wc_ticket',(:'ticket'::jsonb->>'id'),true);
select public.wc_assert((select count(*)=1 from public.word_cross_runs),'owner reads own Word Cross ticket');
do $$begin begin update public.word_cross_runs set score=999999;raise exception 'Editable';exception when insufficient_privilege then raise notice 'PASS: client cannot edit Word Cross points';end;end$$;
do $$begin begin perform public.word_cross_submit(current_setting('test.wc_ticket')::uuid,'[]',1000,0);raise exception 'Incomplete accepted';exception when invalid_parameter_value then raise notice 'PASS: incomplete word replay rejected';end;end$$;
do $$begin begin perform public.word_cross_submit(current_setting('test.wc_ticket')::uuid,'[{"sr":-1,"sc":0,"er":1,"ec":1}]',1000,0);raise exception 'Bad coordinates accepted';exception when invalid_parameter_value then raise notice 'PASS: out-of-grid selection rejected';end;end$$;
do $$begin begin perform public.word_cross_submit(current_setting('test.wc_ticket')::uuid,'[null]',1000,0);raise exception 'Null accepted';exception when invalid_parameter_value then raise notice 'PASS: null selection rejected';end;end$$;
do $$begin begin perform public.word_cross_submit(current_setting('test.wc_ticket')::uuid,'[{"sr":0,"sc":0,"er":2,"ec":1}]',1000,0);raise exception 'Bent accepted';exception when invalid_parameter_value then raise notice 'PASS: non-straight selection rejected';end;end$$;
do $$begin begin perform public.word_cross_start(1,'00000000-0000-4000-8000-000000000002');raise exception 'Wrong owner accepted';exception when insufficient_privilege then raise notice 'PASS: Word Cross start checks expected account';end;end$$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.wc_assert((select count(*)=0 from public.word_cross_runs),'Word Cross RLS hides another account');
do $$begin begin perform public.word_cross_submit(current_setting('test.wc_ticket')::uuid,'[]',1000,0);raise exception 'Hijacked';exception when insufficient_privilege then raise notice 'PASS: another account cannot submit Word Cross ticket';end;end$$;
reset role;
create function public.wc_test_solution(p_id uuid) returns jsonb language sql security definer set search_path=public as $$select jsonb_agg(jsonb_build_object('sr',w->'path'->0->'r','sc',w->'path'->0->'c','er',w->'path'->(jsonb_array_length(w->'path')-1)->'r','ec',w->'path'->(jsonb_array_length(w->'path')-1)->'c') order by ord) from public.word_cross_runs r cross join lateral jsonb_array_elements(r.puzzle->'words') with ordinality e(w,ord) where r.id=p_id$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.wc_assert((public.word_cross_submit(current_setting('test.wc_ticket')::uuid,public.wc_test_solution(current_setting('test.wc_ticket')::uuid),1000,0)->>'stars')::integer=3,'valid Word Cross replay earns three server stars');
select public.wc_assert(jsonb_array_length(public.word_cross_ranking('level',1,false))=1,'verified words appear in pure level ranking');
select public.wc_assert(public.word_cross_ranking('level',1,true)='[]'::jsonb,'unassisted result excluded from hint group');
select public.wc_assert((public.word_cross_ranking()->0->>'stars')::integer=3,'campaign ranking sums verified best stars');
select public.wc_assert((public.word_cross_submit(current_setting('test.wc_ticket')::uuid,'[]',999,4)->>'stars')::integer=3,'Word Cross duplicate submit is idempotent');
select public.word_cross_start(1) as ticket2 \gset
select set_config('test.wc_second',(:'ticket2'::jsonb->>'id'),true);
select public.wc_assert(not exists(select 1 from public.word_cross_runs a join public.word_cross_runs b on b.id=current_setting('test.wc_second')::uuid cross join lateral jsonb_array_elements(a.puzzle->'words') aw cross join lateral jsonb_array_elements(b.puzzle->'words') bw where a.id=current_setting('test.wc_ticket')::uuid and aw->>'word'=bw->>'word'),'new server board avoids recent target words');
select public.wc_assert((public.word_cross_submit(current_setting('test.wc_second')::uuid,public.wc_test_solution(current_setting('test.wc_second')::uuid),1000,1)->>'stars')::integer=1,'Word Cross hint caps server stars at one');
select public.word_cross_start(91,null,true) as daily \gset
select set_config('test.wc_daily',(:'daily'::jsonb->>'id'),true);
reset role;
select public.wc_assert((select puzzle=public.word_cross_generate(91,replace(to_char(now() at time zone 'UTC','YYYY-MM-DD'),'-','')::bigint) from public.word_cross_runs where id=current_setting('test.wc_daily')::uuid),'daily server board matches offline UTC daily seed');
update public.word_cross_runs set started_at=clock_timestamp()-interval '1 hour' where id=current_setting('test.wc_daily')::uuid;
set local role authenticated;
do $$begin begin perform public.word_cross_submit(current_setting('test.wc_daily')::uuid,public.wc_test_solution(current_setting('test.wc_daily')::uuid),1000,0);raise exception 'Expired accepted';exception when invalid_parameter_value then raise notice 'PASS: real server time rejects expired daily run';end;end$$;
reset role;
-- Reject a solved precision board with too many invalid attempts.
insert into public.word_cross_runs(owner_id,level,puzzle) values('00000000-0000-4000-8000-000000000001',6,public.word_cross_generate(6,50)) returning id as precision_ticket \gset
select set_config('test.wc_precision',:'precision_ticket',true);
set local role authenticated;
do $$declare bad jsonb='[]';s jsonb;begin select jsonb_build_object('sr',r,'sc',c,'er',r,'ec',c+1) into s from generate_series(0,5) r cross join generate_series(0,4) c where not exists(select 1 from public.word_cross_runs t cross join lateral jsonb_array_elements(t.puzzle->'words') w where t.id=current_setting('test.wc_precision')::uuid and w->>'word' in ((t.puzzle->'grid'->r->>c)||(t.puzzle->'grid'->r->>(c+1)),(t.puzzle->'grid'->r->>(c+1))||(t.puzzle->'grid'->r->>c))) limit 1;bad=jsonb_build_array(s,s,s);begin perform public.word_cross_submit(current_setting('test.wc_precision')::uuid,bad||public.wc_test_solution(current_setting('test.wc_precision')::uuid),1000,0);raise exception 'Too many errors accepted';exception when invalid_parameter_value then raise notice 'PASS: precision mistake budget enforced server-side';end;end$$;
rollback;
