const fs = require('fs');

const fileContent = fs.readFileSync('src/data/shopThemes.ts', 'utf8');

// Find the export const SHOP_THEMES = [
const startIndex = fileContent.indexOf('export const SHOP_THEMES: ShopTheme[] = [');
const preText = fileContent.substring(0, startIndex + 41);

const games = [
  { id: 'blocker', title: 'Block Puzzle', icon: '🧩' },
  { id: 'caro-gomoku', title: 'Caro Gomoku', icon: '⭕' },
  { id: 'cosmic-defense', title: 'Cosmic Defense', icon: '🛸' },
  { id: 'cyber-slice', title: 'Cyber Slice', icon: '⚔️' },
  { id: 'eat-em-all', title: "Eat 'Em All", icon: '😋' },
  { id: 'neon-runner', title: 'Neon Runner', icon: '🏃' },
  { id: 'scoodoku', title: 'Scoodoku', icon: '🔢' },
  { id: 'shikaku', title: 'Shikaku', icon: '🔲' }
];

const themes = [
  { name: 'Neon', desc: 'Rực rỡ với ánh sáng neon', color: '#ff00ff', rarity: 'rare', icon: '✨' },
  { name: 'Retro', desc: 'Phong cách cổ điển', color: '#ffcc00', rarity: 'uncommon', icon: '🕹️' },
  { name: 'Cyberpunk', desc: 'Đến từ tương lai', color: '#00ffff', rarity: 'epic', icon: '🤖' },
  { name: 'Lava', desc: 'Nóng bỏng như dung nham', color: '#ff3300', rarity: 'rare', icon: '🌋' },
  { name: 'Ice', desc: 'Lạnh lẽo như băng giá', color: '#00ccff', rarity: 'uncommon', icon: '❄️' },
  { name: 'Forest', desc: 'Hòa mình vào thiên nhiên', color: '#33cc33', rarity: 'common', icon: '🌲' },
  { name: 'Crystal', desc: 'Lấp lánh như pha lê', color: '#cc99ff', rarity: 'epic', icon: '💎' },
  { name: 'Golden', desc: 'Sang trọng và quý phái', color: '#ffdf00', rarity: 'legendary', icon: '👑' },
  { name: 'Ghost', desc: 'Bóng ma mờ ảo', color: '#ffffff', rarity: 'rare', icon: '👻' },
  { name: 'Rainbow', desc: 'Đa sắc màu', color: '#ff00aa', rarity: 'epic', icon: '🌈' },
  { name: 'Pixel', desc: 'Điểm ảnh truyền thống', color: '#888888', rarity: 'uncommon', icon: '👾' },
  { name: 'Galactic', desc: 'Hành trình dải ngân hà', color: '#6600cc', rarity: 'legendary', icon: '🌌' },
  { name: 'Quantum', desc: 'Năng lượng lượng tử', color: '#00ffcc', rarity: 'epic', icon: '⚛️' },
  { name: 'Mystic', desc: 'Huyền bí', color: '#9900ff', rarity: 'rare', icon: '🔮' },
  { name: 'Shadow', desc: 'Bóng tối vô tận', color: '#111111', rarity: 'legendary', icon: '🌑' },
  { name: 'Magma', desc: 'Dòng chảy magma', color: '#ff6600', rarity: 'rare', icon: '🔥' },
  { name: 'Ocean', desc: 'Đại dương xanh thẳm', color: '#0066cc', rarity: 'uncommon', icon: '🌊' },
  { name: 'Desert', desc: 'Sa mạc khô cằn', color: '#cc9966', rarity: 'common', icon: '🏜️' }
];

let itemsCode = '';
let count = 0;

for (const game of games) {
  for (let i = 0; i < 16; i++) {
    const theme = themes[i];
    const itemId = `skin-${game.id}-${theme.name.toLowerCase()}`;
    const price = theme.rarity === 'legendary' ? 5000 : theme.rarity === 'epic' ? 2000 : theme.rarity === 'rare' ? 1000 : theme.rarity === 'uncommon' ? 500 : 200;
    
    // determine tag based on rarity
    let tag = '';
    if (theme.rarity === 'legendary') tag = "tag: 'EXCLUSIVE',";
    else if (theme.rarity === 'epic') tag = "tag: 'HOT',";
    else if (theme.rarity === 'rare') tag = "tag: 'POPULAR',";
    
    itemsCode += `  {
    id: '${itemId}',
    name: 'Giao diện ${theme.name}',
    gameId: '${game.id}',
    gameTitle: '${game.title}',
    gameIcon: '${game.icon}',
    priceCoins: ${price},
    rarity: '${theme.rarity}',
    ${tag}
    description: '${theme.desc}',
    fullDescription: 'Khám phá giao diện ${theme.name} độc quyền cho ${game.title}. ${theme.desc} mang đến trải nghiệm hoàn toàn mới.',
    features: [
      'Đổi màu giao diện thành ${theme.name}',
      'Hiệu ứng hạt ${theme.desc.toLowerCase()}',
      'Âm thanh nền đặc biệt'
    ],
    icon: '${theme.icon}',
    previewType: '${game.id}-${theme.name.toLowerCase()}',
    accentColor: '${theme.color}',
    bgGradient: 'from-[${theme.color}]/20 to-[${theme.color}]/5',
    badgeBg: 'bg-[${theme.color}]/20 text-[${theme.color}] border-[${theme.color}]/30',
  },
`;
    count++;
  }
}

const finalCode = preText + '\n' + itemsCode + '];\n';
fs.writeFileSync('src/data/shopThemes.ts', finalCode);
console.log(`Generated ${count} items.`);
