import re

with open('src/utils/rarity.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if "export const RarityBadge =" not in content:
    content += """
export const RarityBadge = ({ rarity }: { rarity: Rarity }) => {
  const info = getRarityInfo(rarity);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-sm"
      style={{
        backgroundColor: info.badgeBg,
        color: info.badgeText,
        borderColor: info.badgeBorder,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: info.hex }}
      />
      <span className="font-mono text-[9px] font-black opacity-90">{info.shortHand}</span>
      <span>{info.nameVi}</span>
    </span>
  );
};
"""
    with open('src/utils/rarity.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
