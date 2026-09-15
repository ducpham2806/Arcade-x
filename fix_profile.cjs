const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf-8');

code = code.replace(
  '<div className="p-3 rounded-2xl bg-[#141414] border border-white/5 text-center">',
  '<div onClick={() => setActiveModal("achievements")} className="p-3 rounded-2xl bg-[#141414] border border-white/5 text-center cursor-pointer hover:bg-white/10 transition-colors">'
);

fs.writeFileSync('src/components/ProfileModal.tsx', code);
