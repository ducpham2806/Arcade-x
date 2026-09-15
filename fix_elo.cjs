const fs = require('fs');
const file = 'src/services/matchmakingService.ts';
let code = fs.readFileSync(file, 'utf8');

const helperFunc = `
export function updatePlayersEloInTransaction(tx: any, db: any, gameId: string, hostUid: string, guestUid: string, eloChange: { newHostElo: number, newGuestElo: number }) {
  if (hostUid) {
    tx.set(doc(db, 'players', hostUid), {
      stats: { highScores: { [\`\${gameId}-elo\`]: eloChange.newHostElo } }
    }, { merge: true });
  }
  if (guestUid) {
    tx.set(doc(db, 'players', guestUid), {
      stats: { highScores: { [\`\${gameId}-elo\`]: eloChange.newGuestElo } }
    }, { merge: true });
  }
}
`;

if (!code.includes('updatePlayersEloInTransaction')) {
  code = code.replace(/export const ELO_K_FACTOR = 32;/, helperFunc + '\nexport const ELO_K_FACTOR = 32;');
}

// 1. executeMove
code = code.replace(
  /if \(winCheckResult\?\.isDraw\) \{([\s\S]*?)\}/,
  "if (winCheckResult?.isDraw) {$1}\n      if (status === 'ended' && eloChange) {\n        updatePlayersEloInTransaction(tx, db, room.gameId, hostUid, guestUid, eloChange);\n      }"
);

// 2. surrender
code = code.replace(
  /const forfeiterName = forfeitUid === hostUid \? room.players.host.name : room.players.guest\?\.name;/,
  "updatePlayersEloInTransaction(tx, db, room.gameId, hostUid, guestUid, eloChange);\n      const forfeiterName = forfeitUid === hostUid ? room.players.host.name : room.players.guest?.name;"
);

// 3. claimTimeout
code = code.replace(
  /tx\.update\(roomRef, \{\n        status: 'ended',\n        winner,\n        endReason: 'TIMEOUT',/,
  "updatePlayersEloInTransaction(tx, db, room.gameId, hostUid, guestUid, eloChange);\n      tx.update(roomRef, {\n        status: 'ended',\n        winner,\n        endReason: 'TIMEOUT',"
);

// 4. respondDraw
code = code.replace(
  /tx\.update\(roomRef, \{\n          status: 'ended',\n          winner: 'DRAW',\n          endReason: 'DRAW_AGREEMENT',/,
  "updatePlayersEloInTransaction(tx, db, room.gameId, hostUid, guestUid, eloChange);\n        tx.update(roomRef, {\n          status: 'ended',\n          winner: 'DRAW',\n          endReason: 'DRAW_AGREEMENT',"
);

fs.writeFileSync(file, code);
console.log('Done');
