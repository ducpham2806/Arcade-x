const fs = require('fs');
const file = 'src/services/matchmakingService.ts';
let code = fs.readFileSync(file, 'utf8');

// The duplicate updatePlayersEloInTransaction was inserted
// Let's remove the block if it exists twice.
code = code.replace(
  /updatePlayersEloInTransaction\(tx, db, room\.gameId, hostUid, guestUid, eloChange\);\n      \}\n      if \(status === 'ended' && eloChange\) \{\n        updatePlayersEloInTransaction\(tx, db, room\.gameId, hostUid, guestUid, eloChange\);/g,
  "updatePlayersEloInTransaction(tx, db, room.gameId, hostUid, guestUid, eloChange);"
);

code = code.replace(
  /updatePlayersEloInTransaction\(tx, db, room\.gameId, hostUid, guestUid, eloChange\);\n      updatePlayersEloInTransaction\(tx, db, room\.gameId, hostUid, guestUid, eloChange\);/g,
  "updatePlayersEloInTransaction(tx, db, room.gameId, hostUid, guestUid, eloChange);"
);

code = code.replace(
  /updatePlayersEloInTransaction\(tx, db, room\.gameId, hostUid, guestUid, eloChange\);\n        updatePlayersEloInTransaction\(tx, db, room\.gameId, hostUid, guestUid, eloChange\);/g,
  "updatePlayersEloInTransaction(tx, db, room.gameId, hostUid, guestUid, eloChange);"
);

fs.writeFileSync(file, code);
