const fs = require('fs');
const file = 'src/services/multiplayer.ts';
let code = fs.readFileSync(file, 'utf8');

const helperFunc = `
export function updatePlayersEloInMultiplayerTx(tx: any, db: any, gameId: string, hostUid: string, guestUid: string, eloChange: EloCalculationResult) {
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

if (!code.includes('updatePlayersEloInMultiplayerTx')) {
  code = code.replace(/export const K_FACTOR = 32;/, helperFunc + '\nexport const K_FACTOR = 32;');
}

// 1. makeMove (inside `// Atomic Update` block)
code = code.replace(
  /(\/\/ Atomic Update\s+transaction\.update\(roomRef, \{)/,
  "if (newStatus === 'finished' && eloChange) {\n        updatePlayersEloInMultiplayerTx(transaction, db, room.gameId, room.hostPlayer.uid, room.guestPlayer?.uid || '', eloChange);\n      }\n\n      $1"
);

// 2. claimTimeoutVictory
code = code.replace(
  /const eloChange = calculateEloChange\(hostElo, guestElo, claimantRole\);\n\n      transaction\.update\(roomRef, \{/,
  "const eloChange = calculateEloChange(hostElo, guestElo, claimantRole);\n      updatePlayersEloInMultiplayerTx(transaction, db, room.gameId, room.hostPlayer.uid, room.guestPlayer?.uid || '', eloChange);\n\n      transaction.update(roomRef, {"
);

// 3. forfeitMatch
code = code.replace(
  /const eloChange = calculateEloChange\(hostElo, guestElo, winnerRole\);\n      const now = Date\.now\(\);\n\n      const forfeiterName = forfeitRole === 'host' \? room\.hostPlayer\.displayName : room\.guestPlayer\?\.displayName;\n\n      transaction\.update\(roomRef, \{/,
  "const eloChange = calculateEloChange(hostElo, guestElo, winnerRole);\n      const now = Date.now();\n\n      const forfeiterName = forfeitRole === 'host' ? room.hostPlayer.displayName : room.guestPlayer?.displayName;\n      updatePlayersEloInMultiplayerTx(transaction, db, room.gameId, room.hostPlayer.uid, room.guestPlayer?.uid || '', eloChange);\n\n      transaction.update(roomRef, {"
);

// 4. respondToDraw
code = code.replace(
  /const eloChange = calculateEloChange\(hostElo, guestElo, 'draw'\);\n\n        transaction\.update\(roomRef, \{/,
  "const eloChange = calculateEloChange(hostElo, guestElo, 'draw');\n        updatePlayersEloInMultiplayerTx(transaction, db, room.gameId, room.hostPlayer.uid, room.guestPlayer?.uid || '', eloChange);\n\n        transaction.update(roomRef, {"
);

fs.writeFileSync(file, code);
console.log('Done');
