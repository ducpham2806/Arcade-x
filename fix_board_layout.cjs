const fs = require('fs');
let code = fs.readFileSync('src/components/games/BoardLayout.tsx', 'utf-8');

code = code.replace("colorTheme?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'blue';", "colorTheme?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'blue' | 'cyan';");

code = code.replace(`
  blue: {
    border: 'border-blue-400/50',
    shadow: 'shadow-blue-900/20',
    bgBadge: 'bg-blue-500',
    textHighlight: 'text-blue-400',
    timerBg: 'border-blue-500/30',
  }`, `
  blue: {
    border: 'border-blue-400/50',
    shadow: 'shadow-blue-900/20',
    bgBadge: 'bg-blue-500',
    textHighlight: 'text-blue-400',
    timerBg: 'border-blue-500/30',
  },
  cyan: {
    border: 'border-cyan-400/50',
    shadow: 'shadow-cyan-900/20',
    bgBadge: 'bg-cyan-500',
    textHighlight: 'text-cyan-400',
    timerBg: 'border-cyan-500/30',
  }`);

fs.writeFileSync('src/components/games/BoardLayout.tsx', code);
