-- Run against a disposable Supabase database AFTER the migration. Rolls back all test data.
\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values
 ('00000000-0000-4000-8000-000000000001'),
 ('00000000-0000-4000-8000-000000000002'),
 ('00000000-0000-4000-8000-000000000003');
create function public.arcadex_test_assert(ok boolean, label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function public.arcadex_test_denied(statement text, label text) returns void language plpgsql as $$
begin
  begin execute statement;
  exception when insufficient_privilege then raise notice 'PASS: %',label; return; end;
  raise exception 'FAIL: % was allowed',label;
end $$;
grant execute on function public.arcadex_test_assert(boolean,text), public.arcadex_test_denied(text,text) to authenticated,anon;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.arcadex_bind_player('test_player_a');
select public.arcadex_commit('[
 {"path":"players/test_player_a","operation":"set","data":{"id":"test_player_a","username":"A","coins":200,"gems":25,"exp":10,"stats":{"highScores":{"2048":80}}}},
 {"path":"players/test_player_a/inventory_data/main","operation":"set","data":{"items":[{"id":"rare"}],"chestCounts":{"rare":2}}},
 {"path":"players/test_player_a/game_sessions/current","operation":"set","data":{"status":"suspended","gameId":"tile-2048","gameStateData":{"grid":[[2,4]]}}},
 {"path":"chat_messages/test_chat","operation":"set","data":{"senderId":"test_player_a","text":"Hello","likes":0,"likedBy":[],"timestamp":{"__arcadex_transform":"timestamp"}}},
 {"path":"leaderboards/tile-2048/scores/test_score","operation":"set","data":{"playerId":"test_player_a","playerName":"A","score":80}},
 {"path":"daily_challenges/test_daily","operation":"set","data":{"userId":"test_player_a","score":50}}
]');
select public.arcadex_test_assert((select data->'gameStateData'='{"grid":[[2,4]]}'::jsonb from public.arcadex_read('players/test_player_a/game_sessions','current')), 'paused state round trip');
select public.arcadex_commit('[{"path":"players/test_player_a","operation":"set","merge":true,"data":{"stats":{"highScores":{"xiangqi":1200}},"coins":{"__arcadex_transform":"increment","amount":5}}}]');
select public.arcadex_test_assert((select data#>>'{stats,highScores,2048}'='80' and data#>>'{stats,highScores,xiangqi}'='1200' and data->>'coins'='205' from public.arcadex_read('players','test_player_a')), 'nested merge preserves siblings and increment');
select public.arcadex_test_denied('insert into public.arcadex_documents(path,data,owner_id) values (''players/evil'',''{}'',''00000000-0000-4000-8000-000000000001'')','direct inserts denied');
select public.arcadex_test_assert(not has_function_privilege('authenticated','public.arcadex_check_write(text,jsonb,jsonb,uuid,jsonb)','EXECUTE'), 'internal validator not callable');

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.arcadex_bind_player('test_player_b');
select public.arcadex_commit('[{"path":"players/test_player_b","operation":"set","data":{"id":"test_player_b","username":"B","stats":{"highScores":{}}}}]');
select public.arcadex_test_denied('select public.arcadex_bind_player(''test_player_a'')','another identity cannot claim existing player');
select public.arcadex_test_assert((select count(*)=0 from public.arcadex_read('players/test_player_a/inventory_data','main')), 'inventory private across users');
select public.arcadex_test_assert((select count(*)=0 from public.arcadex_read('players/test_player_a/game_sessions','current')), 'saved game private across users');
select public.arcadex_test_assert((select not data ? 'coins' and not data ? 'gems' and data->>'username'='A' from public.arcadex_read('players','test_player_a')), 'public player directory redacts currency');
select public.arcadex_test_denied($s$select public.arcadex_commit('[{"path":"players/test_player_a","operation":"update","data":{"coins":999}}]')$s$, 'other player writes denied');
select public.arcadex_test_denied($s$select public.arcadex_commit('[{"path":"chat_messages/spoof","operation":"set","data":{"senderId":"test_player_a","text":"Fake","likes":0,"likedBy":[]}}]')$s$, 'chat sender spoof denied');
select public.arcadex_commit('[{"path":"chat_messages/test_chat","operation":"update","data":{"likedBy":{"__arcadex_transform":"union","values":["test_player_b"]},"likes":{"__arcadex_transform":"increment","amount":1}}}]');
select public.arcadex_test_assert((select data->>'likes'='1' from public.arcadex_read('chat_messages','test_chat')), 'remote chat like');
select public.arcadex_test_denied($s$select public.arcadex_commit('[{"path":"chat_messages/test_chat","operation":"update","data":{"text":"Edited"}}]')$s$, 'cannot edit other chat text');
select public.arcadex_test_denied($s$select public.arcadex_commit('[{"path":"chat_messages/test_chat","operation":"update","data":{"likedBy":["test_player_a"],"likes":1}}]')$s$, 'cannot like as another player');

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.arcadex_commit('[{"path":"game_rooms/test_room","operation":"set","data":{"roomId":"test_room","roomCode":"TESTAA","gameId":"xiangqi","isPrivate":true,"status":"waiting","players":{"host":{"uid":"test_player_a","elo":1200,"color":"RED"},"guest":null},"currentTurn":"test_player_a","turnDuration":45,"turnDeadline":9999999999999,"boardState":{},"moveHistory":[],"messages":[]}}]');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.arcadex_commit('[{"path":"game_rooms/test_room","operation":"update","data":{"players.guest":{"uid":"test_player_b","elo":1200,"color":"BLACK"},"status":"ready","messages":{"__arcadex_transform":"union","values":[{"text":"joined"}]}}}]');
select public.arcadex_test_assert((select data#>>'{players,host,uid}'='test_player_a' and data#>>'{players,guest,uid}'='test_player_b' from public.arcadex_read('game_rooms','test_room')), 'dotted guest join preserves host');
select public.arcadex_test_denied($s$select public.arcadex_commit('[{"path":"game_rooms/test_room","operation":"update","data":{"boardState":{"move":"B"},"currentTurn":"test_player_a"}}]')$s$, 'wrong turn denied on server');
select public.arcadex_test_denied($s$select public.arcadex_commit('[{"path":"game_rooms/test_room","operation":"update","data":{"players.host.elo":9999}}]')$s$, 'cannot forge opponent ELO');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',true);
select public.arcadex_bind_player('test_player_c');
select public.arcadex_test_assert((select count(*)=0 from public.arcadex_read('game_rooms','test_room')), 'active room private to participants');
select public.arcadex_test_denied($s$select public.arcadex_commit('[{"path":"game_rooms/test_room","operation":"update","data":{"status":"ended","winner":"test_player_c"}}]')$s$, 'spectator cannot end room');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.arcadex_commit('[{"path":"game_rooms/test_room","operation":"update","data":{"boardState":{"move":"A"},"currentTurn":"test_player_b","status":"playing"}}]');
-- Read versions prevent stale callbacks from overwriting a newer room.
do $$ begin
  begin
    perform public.arcadex_commit('[{"path":"game_rooms/test_room","operation":"update","data":{"status":"ended","winner":"test_player_a"}}]', '[{"path":"game_rooms/test_room","version":0}]');
  exception when serialization_failure then raise notice 'PASS: stale transaction rejected'; return; end;
  raise exception 'FAIL: stale transaction allowed';
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.arcadex_commit('[{"path":"game_rooms/test_room","operation":"update","data":{"status":"ended","winner":"test_player_a","endReason":"SURRENDER"}}]');
select public.arcadex_test_assert((select data#>>'{stats,highScores,xiangqi-elo}'='1216' from public.arcadex_read('players','test_player_a')), 'host ELO updated in same commit');
select public.arcadex_test_assert((select data#>>'{stats,highScores,xiangqi-elo}'='1184' from public.arcadex_read('players','test_player_b')), 'guest ELO updated in same commit');
select public.arcadex_commit('[{"path":"game_rooms/test_room","operation":"update","data":{"updatedAt":123}}]');
select public.arcadex_test_assert((select data#>>'{stats,highScores,xiangqi-elo}'='1216' from public.arcadex_read('players','test_player_a')), 'terminal room update does not award ELO again');

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.arcadex_commit('[{"path":"players/test_player_a","operation":"set","merge":true,"data":{"stats":{"highScores":{"xiangqi-elo":9000}}}}]');
select public.arcadex_test_assert((select data#>>'{stats,highScores,xiangqi-elo}'='1216' from public.arcadex_read('players','test_player_a')), 'profile sync cannot overwrite server ELO');

-- Queue pairing commits a room and claims the other queue entry together.
select public.arcadex_commit('[{"path":"matchmaking_queue/test_queue","operation":"set","data":{"uid":"test_player_a","gameId":"chess","status":"waiting","matchedRoomId":null}}]');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
select public.arcadex_commit('[
 {"path":"game_rooms/test_match","operation":"set","data":{"roomId":"test_match","roomCode":"TESTBB","gameId":"chess","status":"ready","players":{"host":{"uid":"test_player_a","elo":1200},"guest":{"uid":"test_player_b","elo":1200}},"currentTurn":"test_player_a","boardState":{}}},
 {"path":"matchmaking_queue/test_queue","operation":"update","data":{"status":"matched","matchedRoomId":"test_match"}}
]');
select public.arcadex_test_assert((select data->>'status'='ready' from public.arcadex_read('game_rooms','test_match')), 'atomic matchmaking pair');
select public.arcadex_commit('[{"path":"friend_challenges/test_invite","operation":"set","data":{"senderUid":"test_player_b","targetUid":"test_player_a","status":"pending","expiresAt":9999999999999}}]');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select public.arcadex_commit('[{"path":"friend_challenges/test_invite","operation":"update","data":{"status":"accepted","respondedAt":123}}]');
select public.arcadex_test_assert((select data->>'status'='accepted' from public.arcadex_read('friend_challenges','test_invite')), 'friend challenge response');

set local role anon;
select set_config('request.jwt.claim.sub','',true);
select public.arcadex_test_denied('select public.arcadex_read(''players'')','unauthenticated cloud access denied');
rollback;
