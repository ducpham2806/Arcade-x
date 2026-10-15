# Arcade Community 2.10.0

The Community button opens global chat, per-game channels, private inbox and online friends. Player names in chat open their public profile. Search by name or exact player ID, send a request and let the recipient accept or decline. Removing, cancelling, blocking and unblocking are supported. Inbox works across devices with the same account; guests retain their identity only on the current browser. Bio and favorite game are editable in Profile. Presence uses a 50-second heartbeat and expires after two minutes.

Caro, chess and Xiangqi expose a collapsible chat panel when connected to an online room. The server checks the actor's exact player ID against the room participants. Chat does not mutate board state. Messages are plain text, up to 1000 characters, with at most eight sends per ten seconds per cloud identity (including its player aliases). Public chat is visible to authenticated cloud identities, including guests. Direct messages are readable only in the caller's own conversation. Blocking stops future DMs and filters the blocked sender from channel reads. Existing conversation history is retained. Public profiles never return account emails.

`supabase/social/schema.sql` is the idempotent schema source registered as the `arcadex_social_community` migration and applied to the connected project. Tables are in the unexposed `arcadex_social` schema with RLS and no direct client table grants. A public SECURITY INVOKER RPC delegates to a private checked function with fixed empty search_path and explicit authenticated-only EXECUTE. Private helper profile access is revoked. The database authorizes every operation using auth.uid and the existing player binding, rather than trusting the client actor string. Pair advisory locks prevent crossed duplicate friendships; per-sender locks enforce the message rate limit.

Chat refreshes every 1.8 seconds and friend/inbox lists every five seconds while open. Focus and reconnect refresh immediately. Polls are sequential, and disposal ignores late responses. Sending failures keep the draft. No fabricated players, simulated replies, synthetic online counts or chat notification tones remain in the Community UI. The old local DM history is not uploaded or treated as real conversations.

Music is now opt-in. The old autoplay music preference is reset once for the beep fix; users can enable music in Settings. Muting music stops its scheduler and game entry respects mute. Master mute disables music and effects; notification sounds are absent. Hidden tabs do not accumulate music steps to replay on focus.

## Validation

- `npm run lint` and `npm run build`.
- `node tests/social/audio.mjs`: music default, unlock, opt-in start, stop on mute, game mute guard, master mute persistence.
- `node tests/social/ui.cjs`: React DOM community dialog, chat render, recipient acceptance, inbox and game channel routing (Linkedom, not a visual browser test).
- `node tests/social/live.mjs --live`: isolated anonymous identities, bilateral friends, private messages, channels, room access, profile privacy, blocking and denied forged actors. Live audit creates data; run only deliberately and clean the recorded `/tmp/arcade-social-cleanup.json` exact IDs afterward.

No website deploy is part of this change. Browser/mobile visual and touch QA still needs a device. Polling is intentional for this version; websocket presence, read receipts, attachments and moderation tools are not implemented.

All checks listed above passed on 2026-10-15. Additional database tests covered all three room schemas and rejected a ninth message inside ten seconds. Both audit attempts were cleaned by their exact temporary identities; the final check found zero remaining audit users, bindings, documents, messages or relations. Security advisors reported the private tables as RLS-with-no-policy, intentional deny-by-default with no direct client grants. Existing unrelated public RPC advisories were not changed.
