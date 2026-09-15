const fs = require('fs');
let code = fs.readFileSync('src/services/audio.ts', 'utf-8');

const craftSound = `
        case 'craft': {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sawtooth';
          osc1.frequency.setValueAtTime(400, now);
          osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
          osc2.frequency.setValueAtTime(200, now);
          osc2.frequency.exponentialRampToValueAtTime(800, now + 0.4);
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.exponentialRampToValueAtTime(0.4, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.masterGain);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.6);
          osc2.stop(now + 0.6);
          break;
        }
`;

code = code.replace("case 'claim': {", craftSound + "        case 'claim': {");

fs.writeFileSync('src/services/audio.ts', code);
