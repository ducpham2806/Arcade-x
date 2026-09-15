const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

// Add showVersusScreen state
if (!code.includes('const [showVersusScreen')) {
  code = code.replace(
    /const \[isMatchmakingOpen, setIsMatchmakingOpen\] = useState\(false\);/,
    "const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);\n  const [showVersusScreen, setShowVersusScreen] = useState(false);"
  );
}

// Add useEffect to trigger showVersusScreen
if (!code.includes('setShowVersusScreen(true)')) {
  code = code.replace(
    /\/\/ Synchronize board from Multiplayer Room/,
    `// Versus screen trigger
  useEffect(() => {
    if (roomState?.status === 'ready' && roomState.players.host && roomState.players.guest) {
      setShowVersusScreen(true);
      if (sounds.enabled) {
        sounds.playMove(); // play generic sound
      }
    }
  }, [roomState?.status]);

  // Synchronize board from Multiplayer Room`
  );
}

// Replace the VersusScreen rendering block
const searchStr = `{roomState?.status === 'ready' && roomState?.players.host && roomState?.players.guest && (
        <VersusScreen
          player1={roomState.players.host}
          player2={roomState.players.guest}
          gameTitle="Cờ Vua Xếp Hạng Online"
          onComplete={() => {}}
        />
      )}`;

const searchStrOld = `<VersusScreen
        isOpen={Boolean(roomState && roomState.status === 'ready')}
        hostPlayer={roomState?.players.host || null}
        guestPlayer={roomState?.players.guest || null}
        onCountdownEnd={() => {}}
      />`;

const replaceStr = `{showVersusScreen && roomState?.players.host && roomState?.players.guest && (
        <VersusScreen
          player1={roomState.players.host}
          player2={roomState.players.guest}
          gameTitle="Cờ Vua Xếp Hạng Online"
          onComplete={() => setShowVersusScreen(false)}
        />
      )}`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
} else if (code.includes(searchStrOld)) {
  code = code.replace(searchStrOld, replaceStr);
}

fs.writeFileSync('src/games/chess/index.tsx', code);
console.log("Updated chess index.tsx");
