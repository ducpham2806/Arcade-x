-- Schema phòng 1vs1 dùng chung cho Ô Ăn Quan & Nhảy Lò Cò (Arcade-X Folk Duel)
-- Chỉ service_role truy cập trực tiếp qua Edge Function folk-duel-room

CREATE SCHEMA IF NOT EXISTS folk_duel;

REVOKE ALL ON SCHEMA folk_duel FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS folk_duel.rooms (
  room_id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  game_kind TEXT NOT NULL CHECK (game_kind IN ('o-an-quan', 'nhay-lo-co')),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL DEFAULT 1,
  phase TEXT NOT NULL CHECK (phase IN ('lobby', 'countdown', 'playing', 'finished')),
  host_seat TEXT NOT NULL CHECK (host_seat IN ('P1', 'P2')),
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  turn TEXT NOT NULL CHECK (turn IN ('P1', 'P2')),
  turn_number INTEGER NOT NULL DEFAULT 1,
  deadline_at TIMESTAMPTZ NOT NULL,
  rematch_deadline_at TIMESTAMPTZ,
  rematch_votes JSONB NOT NULL DEFAULT '[]'::jsonb,
  winner TEXT,
  finish_reason TEXT,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folk_duel_matchmaking
  ON folk_duel.rooms (game_kind, is_public, phase, created_at)
  WHERE is_public = TRUE AND phase = 'lobby';

CREATE TABLE IF NOT EXISTS folk_duel.match_receipts (
  receipt_key TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  game_kind TEXT NOT NULL,
  coins_granted INTEGER NOT NULL DEFAULT 0,
  candy_granted INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
