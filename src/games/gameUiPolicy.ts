// Games with authored worlds retain their palette, typography and native menus.
export const AUTHORED_GAME_UI = new Set(['neon-runner','dungeon-tap','battleship','brick-breaker','boom-buddies','rainbow-blocks','hex-match','cosmic-defense','blocker','car-escape','word-cross','shikaku']);
export const usesLauncherUi = (gameId:string) => !AUTHORED_GAME_UI.has(gameId);

