const fs = require('fs');
let code = fs.readFileSync('src/games/draw-a-shape/index.tsx', 'utf8');

code = code.replace(/const { addItemsToInventory } = useInventory\(\);/g, "const { addChest } = useInventory();");
code = code.replace(/const { addItems } = useInventory\(\);/g, "const { addChest } = useInventory();");

code = code.replace(/addItemsToInventory\(\[\{\s*id: `crate_\$\{rarity\}`,\s*name: `Rương \$\{rarity === 'epic' \? 'Sử Thi' : rarity === 'rare' \? 'Hiếm' : 'Thường'\}`,\s*type: 'crate',\s*rarity: rarity as any,\s*count: 1,\s*description: `Phần thưởng từ Draw a Shape`,\s*icon: '📦'\s*\}\]\);/g, "addChest(rarity as 'common' | 'rare' | 'epic', 1);");
code = code.replace(/addItems\(\[\{\s*id: `crate_\$\{rarity\}`,\s*name: `Rương \$\{rarity === 'epic' \? 'Sử Thi' : rarity === 'rare' \? 'Hiếm' : 'Thường'\}`,\s*type: 'crate',\s*rarity: rarity as any,\s*count: 1,\s*description: `Phần thưởng từ Draw a Shape`,\s*icon: '📦'\s*\}\]\);/g, "addChest(rarity as 'common' | 'rare' | 'epic', 1);");

fs.writeFileSync('src/games/draw-a-shape/index.tsx', code);
