const fs = require('fs');
const file = 'src/services/matchmakingService.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /tx\.update\(roomRef, \{\n        status: 'ended',\n        winner: claimantUid,\n        endReason: 'TIMEOUT',/,
  "updatePlayersEloInTransaction(tx, db, room.gameId, hostUid, guestUid, eloChange);\n      tx.update(roomRef, {\n        status: 'ended',\n        winner: claimantUid,\n        endReason: 'TIMEOUT',"
);

fs.writeFileSync(file, code);
