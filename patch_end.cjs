const fs = require('fs');
let content = fs.readFileSync('src/components/InventoryModal.tsx', 'utf8');
const expectedEnd = `        )}
      </div>
    </div>
  </div>
  );
};
`;
// find the last index of `        )}`
const index = content.lastIndexOf('        )}');
content = content.substring(0, index) + expectedEnd;
fs.writeFileSync('src/components/InventoryModal.tsx', content);
