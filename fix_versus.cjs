const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

// replace the VersusScreen block
const searchStr = `<VersusScreen
        isOpen={Boolean(roomState && roomState.status === 'ready')}
        hostPlayer={roomState?.players.host || null}
        guestPlayer={roomState?.players.guest || null}
        onCountdownEnd={() => {}}
      />`;

const replaceStr = `{roomState?.status === 'ready' && roomState?.players.host && roomState?.players.guest && (
        <VersusScreen
          player1={roomState.players.host}
          player2={roomState.players.guest}
          gameTitle="Cờ Vua Xếp Hạng Online"
          onComplete={() => {}}
        />
      )}`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/games/chess/index.tsx', code);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find the string to replace!");
}
