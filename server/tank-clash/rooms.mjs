import { randomBytes, createHash } from 'node:crypto';
import { CONFIG, createState, step, neutral, validInput } from '../../src/games/tank-clash/engine.ts';
import { NET, packGame, quantize } from '../../src/games/tank-clash/protocol.ts';
const hash = value => createHash('sha256').update(value).digest('hex');
const id = () => randomBytes(16).toString('hex');
const code = () => Array.from(randomBytes(6), n => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n % 32]).join('');
const label = value => typeof value === 'string' ? value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 20) || 'Người chơi' : 'Người chơi';
export class RoomError extends Error { constructor(code) { super(code); this.code = code; } }
export class TankRooms {
  constructor({ review = false, now = () => performance.now(), graceMs = NET.graceMs, countdownMs = NET.countdownMs, maxRooms = 64 } = {}) {
    Object.assign(this, { review, now, graceMs, countdownMs, maxRooms });
    this.rooms = new Map(); this.tokens = new Map(); this.users = new Map();
    this.metrics = { rejectedInputs: 0, droppedTicks: 0, matches: 0 };
  }
  identity(user) { if (!this.review && !user?.userId) throw new RoomError('AUTH_REQUIRED'); return user?.userId || null; }
  admit(user) { const uid = this.identity(user); if (uid && this.users.has(uid)) throw new RoomError('ALREADY_IN_ROOM'); return uid; }
  add(room, user, name) {
    const uid = this.admit(user), playerId = room.seats.has('a') ? 'b' : 'a', token = randomBytes(32).toString('hex');
    const seat = { id: playerId, userId: uid, tokenHash: hash(token), name: label(name), connected: true, ready: false, rematch: false,
      connection: null, disconnectedAt: null, queue: [], receivedSeq: -1, ack: -1, wallAck: -1, receipts: new Map() };
    room.seats.set(playerId, seat); this.tokens.set(seat.tokenHash, { room, seat }); if (uid) this.users.set(uid, { room, seat });
    room.revision++; room.lastActive = this.now(); return { room, seat, token };
  }
  create(user, name) {
    this.admit(user); if (this.rooms.size >= this.maxRooms) throw new RoomError('SERVER_FULL');
    let key; do { key = code(); } while (this.rooms.has(key));
    const room = { code: key, host: 'a', seats: new Map(), phase: 'lobby', revision: 0, seq: 0, deadline: 0,
      reason: '', game: null, matchId: '', epoch: '', wallsRevision: 0, wallSignature: '', lastEvent: 0,
      lastActive: this.now(), lastAdvance: this.now(), accumulator: 0, roundDeadline: 0, phaseDeadline: 0 };
    this.rooms.set(key, room); return this.add(room, user, name);
  }
  join(user, roomCode, name) {
    const room = this.rooms.get(String(roomCode || '').trim().toUpperCase());
    if (!room) throw new RoomError('ROOM_MISSING');
    if (room.phase !== 'lobby') throw new RoomError('GAME_STARTED');
    if (room.seats.size >= 2) throw new RoomError('ROOM_FULL');
    return this.add(room, user, name);
  }
  resume(user, roomCode, token) {
    this.identity(user);
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw new RoomError('RESUME_EXPIRED');
    const entry = this.tokens.get(hash(token));
    if (!entry || entry.room.code !== roomCode || !this.rooms.has(roomCode) || entry.seat.userId !== (user?.userId || null)) throw new RoomError('RESUME_EXPIRED');
    if (entry.seat.disconnectedAt !== null && this.now() - entry.seat.disconnectedAt >= this.graceMs) throw new RoomError('RESUME_EXPIRED');
    const { room, seat } = entry; seat.connected = true; seat.disconnectedAt = null; seat.queue = []; seat.ack = seat.receivedSeq;
    seat.wallAck = -1; room.revision++; room.lastActive = this.now(); return { room, seat, token };
  }
  bind(session, connection) { const old = session.seat.connection; session.seat.connection = connection; return old; }
  disconnected({ room, seat }, connection) {
    if (seat.connection !== connection || !room.seats.has(seat.id)) return;
    seat.connected = false; seat.disconnectedAt = this.now(); seat.connection = null; this.clearInput(seat);
    if (room.phase === 'lobby' || room.phase === 'countdown') { room.phase = 'lobby'; room.game = null; room.deadline = 0; for (const s of room.seats.values()) s.ready = false; }
    room.revision++;
  }
  clearInput(seat) { seat.queue = []; seat.ack = seat.receivedSeq; }
  remove(room, seat) {
    this.tokens.delete(seat.tokenHash); if (seat.userId) this.users.delete(seat.userId); room.seats.delete(seat.id);
    if (room.host === seat.id && room.seats.size) room.host = [...room.seats.keys()][0];
    room.revision++;
    if (!room.seats.size) this.rooms.delete(room.code);
  }
  begin(room) {
    room.game = createState('duel'); room.game.tanks.forEach(t => t.kind = 'player'); room.matchId = id(); room.epoch = room.matchId + ':1';
    room.phase = 'countdown'; room.reason = ''; room.deadline = this.now() + this.countdownMs;
    room.wallsRevision++; room.wallSignature = JSON.stringify(room.game.walls); room.lastEvent = 0; room.revision++;
    for (const s of room.seats.values()) { s.queue = []; s.receivedSeq = s.ack = -1; s.rematch = false; s.wallAck = -1; }
    this.metrics.matches++;
  }
  finish(room, phase, reason, winner = null) {
    if (['finished','aborted'].includes(room.phase)) return;
    room.phase = phase; room.reason = reason; room.deadline = 0; room.revision++;
    if (room.game) { room.game.status = 'finished'; room.game.winner = winner; room.game.bullets = []; }
    for (const s of room.seats.values()) { s.rematch = false; s.ready = false; this.clearInput(s); }
  }
  command(session, opId, action, value) {
    const { room, seat } = session;
    if (typeof opId !== 'string' || !/^[a-zA-Z0-9_-]{8,80}$/.test(opId)) return { type:'ack', opId, ok:false, error:'BAD_COMMAND' };
    if (seat.receipts.has(opId)) return seat.receipts.get(opId);
    let error = '';
    if (!this.rooms.has(room.code) || room.seats.get(seat.id) !== seat) error = 'ROOM_MISSING';
    else if (action === 'ready' && room.phase === 'lobby' && typeof value === 'boolean') {
      seat.ready = value; room.revision++;
      if (room.seats.size === 2 && [...room.seats.values()].every(s=>s.connected && s.ready)) this.begin(room);
    } else if (action === 'rematch' && room.phase === 'finished' && typeof value === 'boolean') {
      seat.rematch = value; room.revision++;
      if (room.seats.size === 2 && [...room.seats.values()].every(s=>s.connected && s.rematch)) this.begin(room);
    } else if (action === 'lobby' && ['finished','aborted'].includes(room.phase)) {
      room.phase = 'lobby'; room.game = null; room.epoch = ''; room.reason = ''; room.revision++;
      for (const s of room.seats.values()) { s.ready = false; s.rematch = false; this.clearInput(s); }
    } else if (action === 'neutral') this.clearInput(seat);
    else if (action === 'leave') {
      if (['playing','countdown'].includes(room.phase)) this.finish(room, 'finished', 'forfeit', seat.id === 'a' ? 1 : 0);
      this.remove(room, seat);
    } else error = 'BAD_PHASE';
    room.lastActive = this.now();
    const ack = { type:'ack', opId, ok:!error, ...(error ? {error} : {}) };
    seat.receipts.set(opId, ack); if (seat.receipts.size > 128) seat.receipts.delete(seat.receipts.keys().next().value);
    return ack;
  }
  input(session, message) {
    const { room, seat } = session;
    if (room.phase !== 'playing' || !room.game || message.epoch !== room.epoch) return false;
    if (!Array.isArray(message.frames) || message.frames.length > NET.maxBatch || message.frames.length === 0) { this.metrics.rejectedInputs++; return false; }
    for (const f of message.frames) if (!f || !Number.isSafeInteger(f.seq) || f.seq < 0 || f.seq > seat.receivedSeq + NET.maxPending
      || !validInput(f.input) || Object.keys(f.input).some(k=>!['x','y','aim','fire','shield'].includes(k)) || Object.keys(f).some(k=>!['seq','input'].includes(k))) { this.metrics.rejectedInputs++; return false; }
    for (const f of message.frames) if (f.seq > seat.receivedSeq) {
      if (seat.queue.length >= 90) { this.metrics.rejectedInputs++; break; }
      seat.receivedSeq = f.seq; seat.queue.push({ ...f, receivedAt:this.now() });
    }
    if (Number.isSafeInteger(message.wallsAck) && message.wallsAck <= room.wallsRevision) seat.wallAck = message.wallsAck;
    return true;
  }
  advance() {
    const now = this.now();
    for (const room of this.rooms.values()) {
      const disconnected = [...room.seats.values()].filter(s=>!s.connected), expired = disconnected.filter(s=>now-s.disconnectedAt>=this.graceMs);
      if (['lobby','finished','aborted'].includes(room.phase)) for (const seat of expired) this.remove(room, seat);
      else if (['playing','countdown'].includes(room.phase) && expired.length) {
        const connected = [...room.seats.values()].filter(s=>s.connected);
        if (connected.length) this.finish(room, 'finished', 'disconnect', connected[0].id==='a'?0:1);
        else if (expired.length === room.seats.size) this.finish(room, 'aborted', 'both_disconnected');
      }
      if (!this.rooms.has(room.code)) continue;
      if (now - room.lastActive > NET.idleMs && room.phase !== 'playing') { this.closeRoom(room); continue; }
      if (room.phase === 'countdown' && now >= room.deadline) { room.phase = 'playing'; room.revision++; room.lastAdvance = now; room.accumulator = 0; room.roundDeadline = now + CONFIG.roundSeconds*1000; }
      if (room.phase !== 'playing' || !room.game || (expired.length && disconnected.length === room.seats.size)) continue;
      const elapsed = Math.max(0, now - room.lastAdvance); room.lastAdvance = now;
      room.accumulator += Math.min(elapsed, 250);
      let count = 0;
      while (room.accumulator >= 1000/CONFIG.hz && count++ < 8 && room.phase === 'playing') {
        const s = room.game, beforeRound = s.round, beforeStatus = s.status, inputs = {};
        if (s.status === 'playing') s.remaining = Math.min(s.remaining, Math.max(0,(room.roundDeadline-now)/1000+1/CONFIG.hz));
        if (s.status === 'roundEnd') s.phaseTime = Math.min(s.phaseTime, Math.max(0,(room.phaseDeadline-now)/1000));
        for (const seat of room.seats.values()) {
          while (seat.queue.length && now-seat.queue[0].receivedAt>NET.inputTTL) seat.ack=seat.queue.shift().seq;
          const frame = seat.connected ? seat.queue.shift() : null;
          if (frame) seat.ack = frame.seq;
          inputs[seat.id] = frame?.input || neutral(s.tanks.find(t=>t.id===seat.id)?.aim || 0);
        }
        step(s, inputs); s.tanks.forEach(t=>t.kind='player');
        room.accumulator -= 1000/CONFIG.hz;
        if (s.round !== beforeRound) {
          room.epoch = room.matchId+':'+s.round; room.roundDeadline=now+CONFIG.roundSeconds*1000; room.wallsRevision++;
          room.wallSignature=JSON.stringify(s.walls); room.revision++;
          for(const seat of room.seats.values()){seat.queue=[];seat.receivedSeq=seat.ack=-1;seat.wallAck=-1;}
        }
        if (s.status==='roundEnd' && beforeStatus!=='roundEnd') room.phaseDeadline=now+2000;
        if (s.status==='finished') this.finish(room,'finished','normal',s.winner);
      }
      if (room.accumulator > 1000/CONFIG.hz*8) { this.metrics.droppedTicks+=Math.floor(room.accumulator/(1000/CONFIG.hz));room.accumulator=0; }
      const signature=JSON.stringify(room.game.walls); if(signature!==room.wallSignature){room.wallSignature=signature;room.wallsRevision++;}
    }
  }
  view(room) { return { code:room.code,phase:room.phase,host:room.host,review:this.review,revision:room.revision,deadline:room.deadline,reason:room.reason,
    players:[...room.seats.values()].map(({id,name,connected,ready,rematch})=>({id,name,connected,ready,rematch})) }; }
  packet(room, seat, full=false) {
    const s=room.game;
    return { type:'state',seq:room.seq,serverNow:this.now(),epoch:room.epoch,room:this.view(room),ack:{a:room.seats.get('a')?.ack??-1,b:room.seats.get('b')?.ack??-1},
      game:s?packGame(s):null,wallsRevision:room.wallsRevision,
      ...(s&&(full||seat.wallAck!==room.wallsRevision)?{walls:s.walls.map(w=>[w.id,w.x,w.y,w.w,w.h,w.kind==='brick'?1:0,w.hp])}:{}),
      events:s?s.events.filter(e=>s.time-e.time<.35).slice(-16).map(e=>[e.id,e.type,quantize(e.x),quantize(e.y),quantize(e.time)]):[] };
  }
  closeRoom(room) { for(const seat of room.seats.values()){this.tokens.delete(seat.tokenHash);if(seat.userId)this.users.delete(seat.userId);}this.rooms.delete(room.code); }
}
