import { readableCanvasText } from '../../accessibility/canvasText';
import { FruitDef, FruitKind, BossId } from './types';

export const FRUIT_DICTIONARY: Record<FruitKind, FruitDef> = {
  watermelon: {
    kind: 'watermelon',
    name: 'Dưa Hấu',
    icon: '🍉',
    points: 15,
    feverEnergy: 8,
    radius: 32,
    juiceColor: '#ef4444',
    splatterColor: 'rgba(239, 68, 68, 0.45)',
  },
  pineapple: {
    kind: 'pineapple',
    name: 'Dứa Khóm',
    icon: '🍍',
    points: 20,
    feverEnergy: 10,
    radius: 34,
    juiceColor: '#f59e0b',
    splatterColor: 'rgba(245, 158, 11, 0.45)',
  },
  banana: {
    kind: 'banana',
    name: 'Chuối Tiêu',
    icon: '🍌',
    points: 12,
    feverEnergy: 7,
    radius: 28,
    juiceColor: '#fde047',
    splatterColor: 'rgba(253, 224, 71, 0.45)',
  },
  orange: {
    kind: 'orange',
    name: 'Cam Sành',
    icon: '🍊',
    points: 15,
    feverEnergy: 8,
    radius: 28,
    juiceColor: '#f97316',
    splatterColor: 'rgba(249, 115, 22, 0.45)',
  },
  apple_red: {
    kind: 'apple_red',
    name: 'Táo Đỏ',
    icon: '🍎',
    points: 12,
    feverEnergy: 7,
    radius: 27,
    juiceColor: '#dc2626',
    splatterColor: 'rgba(220, 38, 38, 0.45)',
  },
  apple_green: {
    kind: 'apple_green',
    name: 'Táo Xanh',
    icon: '🍏',
    points: 12,
    feverEnergy: 7,
    radius: 27,
    juiceColor: '#84cc16',
    splatterColor: 'rgba(132, 204, 22, 0.45)',
  },
  strawberry: {
    kind: 'strawberry',
    name: 'Dâu Tây',
    icon: '🍓',
    points: 18,
    feverEnergy: 9,
    radius: 25,
    juiceColor: '#f43f5e',
    splatterColor: 'rgba(244, 63, 94, 0.45)',
  },
  kiwi: {
    kind: 'kiwi',
    name: 'Kiwi Xanh',
    icon: '🥝',
    points: 18,
    feverEnergy: 9,
    radius: 26,
    juiceColor: '#22c55e',
    splatterColor: 'rgba(34, 197, 94, 0.45)',
  },
  coconut: {
    kind: 'coconut',
    name: 'Dừa Xiêm',
    icon: '🥥',
    points: 25,
    feverEnergy: 12,
    radius: 30,
    juiceColor: '#f8fafc',
    splatterColor: 'rgba(255, 255, 255, 0.5)',
  },
  lemon: {
    kind: 'lemon',
    name: 'Chanh Vàng',
    icon: '🍋',
    points: 14,
    feverEnergy: 8,
    radius: 26,
    juiceColor: '#eab308',
    splatterColor: 'rgba(234, 179, 8, 0.45)',
  },
  pomegranate: {
    kind: 'pomegranate',
    name: 'Lựu Đỏ',
    icon: '🫐',
    points: 22,
    feverEnergy: 11,
    radius: 28,
    juiceColor: '#be123c',
    splatterColor: 'rgba(190, 18, 60, 0.45)',
  },
  golden_fruit: {
    kind: 'golden_fruit',
    name: 'Trái Hoàng Kim',
    icon: '⭐',
    points: 50,
    feverEnergy: 30,
    radius: 32,
    juiceColor: '#fbbf24',
    splatterColor: 'rgba(251, 191, 36, 0.7)',
  },
  freeze_fruit: {
    kind: 'freeze_fruit',
    name: 'Trái Đóng Băng',
    icon: '❄️',
    points: 25,
    feverEnergy: 15,
    radius: 30,
    juiceColor: '#38bdf8',
    splatterColor: 'rgba(56, 189, 248, 0.6)',
  },
  frenzy_fruit: {
    kind: 'frenzy_fruit',
    name: 'Trái Bão Táp',
    icon: '🌪️',
    points: 30,
    feverEnergy: 25,
    radius: 30,
    juiceColor: '#c084fc',
    splatterColor: 'rgba(192, 132, 252, 0.6)',
  },
};

/**
 * Draws whole fruit on canvas at (0, 0) with radius r.
 * Matches styling and colors of the user-provided 3D fruit pack asset!
 */
export function drawWholeFruit(ctx: CanvasRenderingContext2D, kind: FruitKind, r: number) {
  ctx.save();

  switch (kind) {
    case 'watermelon': {
      // Outer striped green rind
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#4ade80');
      grad.addColorStop(0.7, '#15803d');
      grad.addColorStop(1, '#052e16');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Dark green melon stripes
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = r * 0.14;
      ctx.lineCap = 'round';
      for (let angle = -0.8; angle <= 0.8; angle += 0.4) {
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.9, r * Math.sin(Math.abs(angle) + 0.3), angle, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3D specular shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.3, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'pineapple': {
      // Golden oval textured body
      const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, r * 0.1, r * 0.85, r * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pineapple diamond lattice
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.45)';
      ctx.lineWidth = 2;
      for (let i = -r * 0.6; i <= r * 0.6; i += r * 0.3) {
        ctx.beginPath();
        ctx.moveTo(i, -r * 0.6);
        ctx.lineTo(i + r * 0.6, r * 0.7);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i, r * 0.7);
        ctx.lineTo(i + r * 0.6, -r * 0.6);
        ctx.stroke();
      }

      // Spiky green pineapple leaves on top
      ctx.fillStyle = '#15803d';
      for (let angle of [-0.4, -0.2, 0, 0.2, 0.4]) {
        ctx.save();
        ctx.translate(0, -r * 0.75);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(r * 0.1, -r * 0.4, 0, -r * 0.6);
        ctx.quadraticCurveTo(-r * 0.1, -r * 0.4, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'banana': {
      // Crescent curved banana
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.arc(0, 0, r * 0.9, -0.2, Math.PI * 0.8);
      ctx.arc(r * 0.2, r * 0.1, r * 0.75, Math.PI * 0.8, -0.2, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Stem tips
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(-r * 0.1, -r * 0.95, r * 0.2, r * 0.2);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-r * 0.8, r * 0.5, r * 0.15, r * 0.15);

      // Specular shine
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.82, 0.1, Math.PI * 0.6);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'orange': {
      // Vibrant orange sphere
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#fed7aa');
      grad.addColorStop(0.4, '#fb923c');
      grad.addColorStop(0.8, '#ea580c');
      grad.addColorStop(1, '#9a3412');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Green stem & leaf
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(r * 0.2, -r * 0.85, r * 0.25, r * 0.12, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -r * 0.95, 4, 6);

      // Specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.35, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'apple_red': {
      // Apple shape with indentation
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#fca5a5');
      grad.addColorStop(0.4, '#ef4444');
      grad.addColorStop(0.8, '#b91c1c');
      grad.addColorStop(1, '#450a0a');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(-r * 0.35, 0, r * 0.65, 0, Math.PI * 2);
      ctx.arc(r * 0.35, 0, r * 0.65, 0, Math.PI * 2);
      ctx.arc(0, r * 0.3, r * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Stem & green leaf
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -r * 0.9, 4, r * 0.35);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(r * 0.25, -r * 0.8, r * 0.3, r * 0.12, -Math.PI / 5, 0, Math.PI * 2);
      ctx.fill();

      // Gloss
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.35, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'apple_green': {
      // Fresh green apple
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#bef264');
      grad.addColorStop(0.4, '#84cc16');
      grad.addColorStop(0.8, '#4d7c0f');
      grad.addColorStop(1, '#1a2e05');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(-r * 0.35, 0, r * 0.65, 0, Math.PI * 2);
      ctx.arc(r * 0.35, 0, r * 0.65, 0, Math.PI * 2);
      ctx.arc(0, r * 0.3, r * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Stem & leaf
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -r * 0.9, 4, r * 0.35);
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(r * 0.25, -r * 0.8, r * 0.3, r * 0.12, -Math.PI / 5, 0, Math.PI * 2);
      ctx.fill();

      // Gloss
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.35, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'strawberry': {
      // Heart-conical red body
      const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#fda4af');
      grad.addColorStop(0.4, '#f43f5e');
      grad.addColorStop(0.8, '#be123c');
      grad.addColorStop(1, '#4c0519');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(0, r * 0.95);
      ctx.bezierCurveTo(-r * 0.9, r * 0.3, -r * 0.85, -r * 0.7, 0, -r * 0.65);
      ctx.bezierCurveTo(r * 0.85, -r * 0.7, r * 0.9, r * 0.3, 0, r * 0.95);
      ctx.fill();

      // Yellow seeds
      ctx.fillStyle = '#fef08a';
      for (let y = -r * 0.4; y <= r * 0.6; y += r * 0.25) {
        for (let x = -r * 0.5; x <= r * 0.5; x += r * 0.28) {
          if (Math.hypot(x, y) < r * 0.7) {
            ctx.beginPath();
            ctx.ellipse(x, y, 1.5, 2.5, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Green crown leaf
      ctx.fillStyle = '#16a34a';
      for (let a of [-0.6, -0.3, 0, 0.3, 0.6]) {
        ctx.save();
        ctx.translate(0, -r * 0.65);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.2, r * 0.1, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'kiwi': {
      // Fuzzy brown oval skin
      const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#d97706');
      grad.addColorStop(0.6, '#b45309');
      grad.addColorStop(1, '#451a03');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fuzzy skin bristles
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        const ang = (i / 20) * Math.PI * 2;
        const x = Math.cos(ang) * r * 0.92;
        const y = Math.sin(ang) * r * 0.82;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x * 1.06, y * 1.06);
        ctx.stroke();
      }
      break;
    }

    case 'coconut': {
      // Fibrous brown shell
      const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#a16207');
      grad.addColorStop(0.6, '#713f12');
      grad.addColorStop(1, '#3b1c04');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Three distinct coconut eyes
      ctx.fillStyle = '#1c0e02';
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.2, r * 0.1, 0, Math.PI * 2);
      ctx.arc(r * 0.25, -r * 0.2, r * 0.1, 0, Math.PI * 2);
      ctx.arc(0, -r * 0.45, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'lemon': {
      // Sunny yellow oval with pointed ends
      const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#facc15');
      grad.addColorStop(1, '#a16207');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(-r * 1.1, 0);
      ctx.bezierCurveTo(-r * 0.8, -r * 0.8, r * 0.8, -r * 0.8, r * 1.1, 0);
      ctx.bezierCurveTo(r * 0.8, r * 0.8, -r * 0.8, r * 0.8, -r * 1.1, 0);
      ctx.fill();

      // Specular shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.3, -r * 0.25, r * 0.3, r * 0.15, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'pomegranate': {
      // Ruby crimson sphere with crown
      const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#f43f5e');
      grad.addColorStop(0.5, '#be123c');
      grad.addColorStop(1, '#4c0519');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Pomegranate crown blossom
      ctx.fillStyle = '#9f1239';
      ctx.beginPath();
      ctx.moveTo(-r * 0.25, -r * 0.8);
      ctx.lineTo(0, -r * 1.15);
      ctx.lineTo(r * 0.25, -r * 0.8);
      ctx.lineTo(r * 0.1, -r * 0.7);
      ctx.lineTo(-r * 0.1, -r * 0.7);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'golden_fruit': {
      // Golden star apple with radiant glow
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 20;

      const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#fef08a');
      grad.addColorStop(0.8, '#f59e0b');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Golden star motif
      ctx.fillStyle = '#ffffff';
      ctx.font = `${r * 0.9}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      readableCanvasText(ctx, '⭐', 0, 0);
      break;
    }

    case 'freeze_fruit': {
      // Cyan ice crystal berry
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;

      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#e0f2fe');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#0369a1');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Snowflake
      ctx.fillStyle = '#ffffff';
      ctx.font = `${r * 0.85}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      readableCanvasText(ctx, '❄️', 0, 0);
      break;
    }

    case 'frenzy_fruit': {
      // Purple electric storm berry
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 18;

      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#f3e8ff');
      grad.addColorStop(0.5, '#c084fc');
      grad.addColorStop(1, '#581c87');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Tornado / Lightning symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = `${r * 0.85}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      readableCanvasText(ctx, '⚡', 0, 0);
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws one half of a sliced fruit, displaying exposed fruit interior.
 */
export function drawSlicedHalf(
  ctx: CanvasRenderingContext2D,
  kind: FruitKind,
  r: number,
  half: 'left' | 'right'
) {
  ctx.save();
  // Clip to half circle
  ctx.beginPath();
  if (half === 'left') {
    ctx.arc(0, 0, r, Math.PI / 2, (Math.PI * 3) / 2);
  } else {
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
  }
  ctx.closePath();
  ctx.clip();

  // Background rind/skin
  drawWholeFruit(ctx, kind, r);

  // Interior flesh overlay
  switch (kind) {
    case 'watermelon': {
      // White inner rind then bright ruby red pulp
      ctx.fillStyle = '#dcfce7';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Black watermelon seeds
      ctx.fillStyle = '#111827';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const sx = Math.cos(a) * r * 0.5;
        const sy = Math.sin(a) * r * 0.5;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 2, 3.5, a, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'pineapple': {
      // Golden yellow radial segments with center core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'orange':
    case 'lemon': {
      const isLemon = kind === 'lemon';
      // White pith ring
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Citrus wedges
      ctx.fillStyle = isLemon ? '#eab308' : '#ea580c';
      const wedges = 8;
      for (let w = 0; w < wedges; w++) {
        const aStart = (w * Math.PI * 2) / wedges + 0.08;
        const aEnd = ((w + 1) * Math.PI * 2) / wedges - 0.08;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r * 0.76, aStart, aEnd);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'apple_red':
    case 'apple_green': {
      // Pale cream meat with center core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2);
      ctx.fill();

      // Brown seeds at center
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(-3, 0, 2, 4, 0.2, 0, Math.PI * 2);
      ctx.ellipse(3, 0, 2, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'kiwi': {
      // Emerald green meat with bright white core & seed ring
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
      ctx.fill();

      // White sunburst core
      ctx.fillStyle = '#f0fdf4';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Black seeds ring
      ctx.fillStyle = '#0f172a';
      for (let s = 0; s < 14; s++) {
        const a = (s / 14) * Math.PI * 2;
        const kx = Math.cos(a) * r * 0.52;
        const ky = Math.sin(a) * r * 0.52;
        ctx.beginPath();
        ctx.arc(kx, ky, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'coconut': {
      // Pure white coconut meat and hollow center
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
      ctx.fill();

      // Water hollow center
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    default: {
      // Bright translucent juice center
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

/**
 * Renders the LETHAL CYBER BOMB.
 * Visually completely unmistakable from fruits:
 * - Spiked heavy dark titanium mechanical sphere
 * - Pulsating red warning aura ring
 * - Bright glowing RED SKULL ☠️
 * - Sizzling burning spark fuse on top
 * - "BOMB! TRÁNH XA" danger tag
 */
export function drawCyberBomb(ctx: CanvasRenderingContext2D, r: number, timeTick: number) {
  ctx.save();

  // 1. Pulsating Hazard Alert Halo
  const pulse = (Math.sin(timeTick * 0.015) + 1) * 0.5; // 0..1
  const haloR = r * (1.25 + pulse * 0.35);

  const auraGrad = ctx.createRadialGradient(0, 0, r * 0.7, 0, 0, haloR);
  auraGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
  auraGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.15)');
  auraGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(0, 0, haloR, 0, Math.PI * 2);
  ctx.fill();

  // Outer dashed hazard warning ring
  ctx.strokeStyle = pulse > 0.5 ? '#ef4444' : '#b91c1c';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Mechanical Spikes around bomb
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  const numSpikes = 8;
  for (let s = 0; s < numSpikes; s++) {
    const angle = (s / numSpikes) * Math.PI * 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, -r * 0.9);
    ctx.lineTo(0, -r * 1.25);
    ctx.lineTo(r * 0.15, -r * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 3. Dark Titanium Body
  const bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  bodyGrad.addColorStop(0, '#64748b');
  bodyGrad.addColorStop(0.3, '#1e293b');
  bodyGrad.addColorStop(0.8, '#0f172a');
  bodyGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Red danger seam/ring
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Burning Spark Fuse on Top
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-r * 0.18, -r * 1.15, r * 0.36, r * 0.25);

  // Sizzling Sparks
  const sparkX = 0 + (Math.random() - 0.5) * 8;
  const sparkY = -r * 1.25 + (Math.random() - 0.5) * 6;
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 15;
  ctx.fillStyle = Math.random() > 0.5 ? '#fbbf24' : '#ef4444';
  ctx.beginPath();
  ctx.arc(sparkX, sparkY, 4 + Math.random() * 3, 0, Math.PI * 2);
  ctx.fill();

  // 5. Glowing LETHAL SKULL Symbol in Center
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(r * 0.95)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  readableCanvasText(ctx, '☠️', 0, 1);

  // 6. "TRÁNH!" Danger Pill below
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(-r * 0.75, r * 0.55, r * 1.5, r * 0.45, 4);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `black 9px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  readableCanvasText(ctx, 'BOM TRÁNH', 0, r * 0.78);

  ctx.restore();
}

/**
 * Draws legendary Cyber Bosses in Boss Rush Mode
 */
export function drawCyberBoss(
  ctx: CanvasRenderingContext2D,
  bossId: BossId,
  r: number,
  hp: number,
  maxHp: number,
  timeTick: number,
  hitFlashTimer: number
) {
  ctx.save();

  // 1. Hit Flash Shockwave Aura
  if (hitFlashTimer > 0) {
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 35;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Orbiting Satellite Rings / Shields
  const orbitAngle = timeTick * 0.05;
  const numSatellites = bossId === 'emperor_coconut' ? 4 : 3;
  for (let s = 0; s < numSatellites; s++) {
    const ang = orbitAngle + (s * Math.PI * 2) / numSatellites;
    const satDist = r * 1.35;
    const satX = Math.cos(ang) * satDist;
    const satY = Math.sin(ang) * (satDist * 0.55);

    ctx.save();
    ctx.fillStyle =
      bossId === 'dragon_melon'
        ? '#10b981'
        : bossId === 'mecha_pineapple'
        ? '#fbbf24'
        : '#c084fc';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(satX, satY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. Boss Body by Type
  if (bossId === 'dragon_melon') {
    // Cyber Dragon Melon
    const melonGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    melonGrad.addColorStop(0, '#10b981');
    melonGrad.addColorStop(0.5, '#059669');
    melonGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = melonGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Dragon cyber stripes
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(i * (r * 0.28), 0, r * 0.2, r * 0.92, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crimson Cyber Horns
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    // Left Horn
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, -r * 0.7);
    ctx.quadraticCurveTo(-r * 0.8, -r * 1.45, -r * 0.25, -r * 1.3);
    ctx.quadraticCurveTo(-r * 0.4, -r * 0.9, -r * 0.2, -r * 0.7);
    ctx.fill();

    // Right Horn
    ctx.beginPath();
    ctx.moveTo(r * 0.45, -r * 0.7);
    ctx.quadraticCurveTo(r * 0.8, -r * 1.45, r * 0.25, -r * 1.3);
    ctx.quadraticCurveTo(r * 0.4, -r * 0.9, r * 0.2, -r * 0.7);
    ctx.fill();

    // Dragon Glowing Visor Eyes
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.15, r * 0.22, r * 0.1, -0.2, 0, Math.PI * 2);
    ctx.ellipse(r * 0.3, -r * 0.15, r * 0.22, r * 0.1, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (bossId === 'mecha_pineapple') {
    // Mecha Pineapple Golem
    const armorGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
    armorGrad.addColorStop(0, '#fef08a');
    armorGrad.addColorStop(0.4, '#eab308');
    armorGrad.addColorStop(0.85, '#ca8a04');
    armorGrad.addColorStop(1, '#713f12');
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.85, r, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mechanical honeycomb / diamond armor grid
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 8;
    for (let dy = -0.7; dy <= 0.7; dy += 0.35) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, dy * r);
      ctx.lineTo(r * 0.7, dy * r);
      ctx.stroke();
    }

    // Laser Crown Spinning Blades
    ctx.save();
    ctx.translate(0, -r * 0.95);
    ctx.rotate(timeTick * 0.08);
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 14;
    for (let c = 0; c < 5; c++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-r * 0.2, -r * 0.55);
      ctx.lineTo(0, -r * 0.75);
      ctx.lineTo(r * 0.2, -r * 0.55);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Central Nuclear Eye Reactor
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Titan Aurora Coconut
    const darkGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
    darkGrad.addColorStop(0, '#4c1d95');
    darkGrad.addColorStop(0.6, '#2e1065');
    darkGrad.addColorStop(1, '#090514');
    ctx.fillStyle = darkGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Electric purple neon rings
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
    ctx.stroke();

    // Electric lightning aura cracks
    ctx.beginPath();
    for (let a = 0; a < 6; a++) {
      const ang = (a * Math.PI) / 3 + Math.sin(timeTick * 0.2 + a) * 0.3;
      const x1 = Math.cos(ang) * (r * 0.4);
      const y1 = Math.sin(ang) * (r * 0.4);
      const x2 = Math.cos(ang) * (r * 0.85);
      const y2 = Math.sin(ang) * (r * 0.85);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    // Emperor Golden Crown with Purple Gem
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.8);
    ctx.lineTo(-r * 0.65, -r * 1.4);
    ctx.lineTo(-r * 0.25, -r * 1.05);
    ctx.lineTo(0, -r * 1.55);
    ctx.lineTo(r * 0.25, -r * 1.05);
    ctx.lineTo(r * 0.65, -r * 1.4);
    ctx.lineTo(r * 0.55, -r * 0.8);
    ctx.closePath();
    ctx.fill();

    // Center Amethyst Gem on Crown
    ctx.fillStyle = '#d946ef';
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, -r * 1.15, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. In-Canvas Mini Health Gauge under the Boss
  const barWidth = r * 1.6;
  const barHeight = 8;
  const barY = r + 14;
  const hpPercent = Math.max(0, hp / maxHp);

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(-barWidth / 2 - 2, barY - 2, barWidth + 4, barHeight + 4, 4);
  ctx.fill();

  // Color transitions: Emerald -> Amber -> Crimson
  const hpColor = hpPercent > 0.5 ? '#10b981' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
  ctx.fillStyle = hpColor;
  ctx.shadowColor = hpColor;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(-barWidth / 2, barY, barWidth * hpPercent, barHeight, 3);
  ctx.fill();

  // Boss HP Text
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  readableCanvasText(ctx, `${hp}/${maxHp} HP`, 0, barY + barHeight + 2);

  ctx.restore();
}


