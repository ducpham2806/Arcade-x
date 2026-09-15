const fs = require('fs');
let code = fs.readFileSync('src/context/InventoryContext.tsx', 'utf-8');

// Replace chestOpen with craft
code = code.replace(
  "soundEngine.play('chestOpen');\n    confetti({\n      particleCount: 100",
  "soundEngine.play('craft');\n    confetti({\n      particleCount: 100"
);

fs.writeFileSync('src/context/InventoryContext.tsx', code);
