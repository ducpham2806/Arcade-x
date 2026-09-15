const fs = require('fs');
let content = fs.readFileSync('src/components/InventoryModal.tsx', 'utf8');
content = content.replace(/      <\/div>\n  \);\n};\n?$/, '      </div>\n    </div>\n  </div>\n  );\n};\n');
fs.writeFileSync('src/components/InventoryModal.tsx', content);
