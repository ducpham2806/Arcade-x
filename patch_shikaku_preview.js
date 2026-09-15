const fs = require('fs');
const file = './src/components/ArcadeShopModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const shikakuPreviewCode = `
// ========================================================
// SHIKAKU THEME LIVE PREVIEW
// ========================================================
const ShikakuThemeLivePreview: React.FC<{ theme: ShopTheme }> = ({ theme }) => {
  const isNeon = theme.id === 'skin-shikaku-neon';
  const isPastel = theme.id === 'skin-shikaku-pastel';

  const bgClass = isNeon ? 'bg-[#0a0a1a] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 
                  (isPastel ? 'bg-[#fdf2f8] border-pink-200' : 'bg-slate-200 border-slate-400');

  const rects = [
    { id: '1', r: 0, c: 0, w: 2, h: 2, color: isNeon ? '#06b6d4' : (isPastel ? '#f9a8d4' : '#60a5fa'), hint: 4 },
    { id: '2', r: 0, c: 2, w: 2, h: 1, color: isNeon ? '#ec4899' : (isPastel ? '#fcd34d' : '#f472b6'), hint: 2 },
    { id: '3', r: 1, c: 2, w: 2, h: 3, color: isNeon ? '#10b981' : (isPastel ? '#86efac' : '#34d399'), hint: 6 },
    { id: '4', r: 2, c: 0, w: 2, h: 2, color: isNeon ? '#8b5cf6' : (isPastel ? '#d8b4fe' : '#a78bfa'), hint: 4 },
  ];

  return (
    <div className={\`relative w-full max-w-[200px] aspect-square rounded-xl border-4 overflow-hidden \${bgClass} p-0\`}>
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className={\`border \${isNeon ? 'border-cyan-900/30' : (isPastel ? 'border-pink-300/30' : 'border-slate-300/80')}\`} />
        ))}
      </div>
      
      {rects.map(r => (
        <div key={r.id} className="absolute flex items-center justify-center font-black text-xl" style={{
          top: \`\${(r.r / 4) * 100}%\`,
          left: \`\${(r.c / 4) * 100}%\`,
          width: \`\${(r.w / 4) * 100}%\`,
          height: \`\${(r.h / 4) * 100}%\`,
          backgroundColor: r.color,
          opacity: 0.9,
          border: isNeon ? '2px solid rgba(255,255,255,0.7)' : (isPastel ? '3px solid rgba(255,255,255,0.8)' : '2px solid rgba(0,0,0,0.3)'),
          borderRadius: isPastel ? '8px' : '4px',
          boxShadow: isNeon ? \`0 0 10px \${r.color}\` : 'none',
          color: isPastel ? 'white' : 'white',
          textShadow: isNeon ? '0 0 4px rgba(255,255,255,0.5)' : '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          {r.hint}
        </div>
      ))}
    </div>
  );
};
`;

content = content.replace(
  "// ========================================================\n// GENERIC THEME PREVIEW",
  shikakuPreviewCode + "\n// ========================================================\n// GENERIC THEME PREVIEW"
);

fs.writeFileSync(file, content);
console.log("Patch applied.");
