import { LeaderboardEntry } from '../types';

export interface AchievedRankInfo {
  rankText: string;
  tierBadge: string;
  tierName: string;
  tierIcon: string;
  tierColor: string;
  isTopServer: boolean;
}

/**
 * Computes the player's achieved rank based on game score and global leaderboard
 */
export function calculateAchievedRank(
  gameId: string,
  score: number,
  leaderboards?: Record<string, LeaderboardEntry[]>
): AchievedRankInfo {
  const entries = (leaderboards && leaderboards[gameId]) || [];

  if (entries.length > 0) {
    const sorted = [...entries].sort((a, b) => b.score - a.score);
    const topScore = sorted[0]?.score || 1;

    if (score >= topScore) {
      return {
        rankText: 'Hạng #1 Toàn Server (Quán Quân)',
        tierBadge: '👑 TOP #1 SERVER',
        tierName: 'Top #1 Server',
        tierIcon: '👑',
        tierColor: '#f59e0b',
        isTopServer: true,
      };
    }

    if (sorted[1] && score >= sorted[1].score) {
      return {
        rankText: 'Hạng #2 Toàn Server (Á Quân)',
        tierBadge: '🥈 TOP #2 SERVER',
        tierName: 'Top #2 Server',
        tierIcon: '🥈',
        tierColor: '#e2e8f0',
        isTopServer: true,
      };
    }

    if (sorted[2] && score >= sorted[2].score) {
      return {
        rankText: 'Hạng #3 Toàn Server (Quý Quân)',
        tierBadge: '🥉 TOP #3 SERVER',
        tierName: 'Top #3 Server',
        tierIcon: '🥉',
        tierColor: '#fb923c',
        isTopServer: true,
      };
    }

    // Check if within top 5
    for (let i = 3; i < Math.min(sorted.length, 5); i++) {
      if (score >= sorted[i].score) {
        return {
          rankText: `Top 5 Server (Hạng #${i + 1})`,
          tierBadge: `🏆 TOP #${i + 1} SERVER`,
          tierName: `Top #${i + 1} Server`,
          tierIcon: '🏆',
          tierColor: '#a855f7',
          isTopServer: true,
        };
      }
    }
  }

  // Tier ranking based on score
  if (score >= 10000) {
    return {
      rankText: 'Hạng Thần Thoại (Tier S+)',
      tierBadge: '⭐ THẦN THOẠI',
      tierName: 'Thần Thoại',
      tierIcon: '⭐',
      tierColor: '#ec4899',
      isTopServer: false,
    };
  }
  if (score >= 5000) {
    return {
      rankText: 'Hạng Kim Cương (Tier S)',
      tierBadge: '💎 KIM CƯƠNG',
      tierName: 'Kim Cương',
      tierIcon: '💎',
      tierColor: '#38bdf8',
      isTopServer: false,
    };
  }
  if (score >= 2500) {
    return {
      rankText: 'Hạng Bạch Kim (Tier A)',
      tierBadge: '✨ BẠCH KIM',
      tierName: 'Bạch Kim',
      tierIcon: '✨',
      tierColor: '#818cf8',
      isTopServer: false,
    };
  }
  if (score >= 1000) {
    return {
      rankText: 'Hạng Vàng (Tier B)',
      tierBadge: '🥇 HẠNG VÀNG',
      tierName: 'Hạng Vàng',
      tierIcon: '🥇',
      tierColor: '#eab308',
      isTopServer: false,
    };
  }
  if (score >= 400) {
    return {
      rankText: 'Hạng Bạc (Tier C)',
      tierBadge: '🥈 HẠNG BẠC',
      tierName: 'Hạng Bạc',
      tierIcon: '🥈',
      tierColor: '#94a3b8',
      isTopServer: false,
    };
  }

  return {
    rankText: 'Hạng Đồng (Tân Binh)',
    tierBadge: '🥉 HẠNG ĐỒNG',
    tierName: 'Hạng Đồng',
    tierIcon: '🥉',
    tierColor: '#d97706',
    isTopServer: false,
  };
}

export interface RecapImageParams {
  gameTitle: string;
  gameId: string;
  score: number;
  achievedRank: string;
  rankBadge: string;
  timestamp: string;
  playerName: string;
  playerAvatar: string;
  playerTitle: string;
  playerLevel: number;
  coinsEarned: number;
  expEarned: number;
  isHighScore: boolean;
}

/**
 * Generates an ultra-crisp, cyber-arcade styled shareable image card
 * using an HTML5 Canvas and returns a PNG Data URL.
 */
export async function generateGameRecapCardImage(params: RecapImageParams): Promise<string> {
  const width = 1200;
  const height = 675;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0c16');
  bgGrad.addColorStop(0.5, '#121426');
  bgGrad.addColorStop(1, '#080910');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Radial Glows
  const topGlow = ctx.createRadialGradient(width * 0.85, 80, 10, width * 0.85, 80, 420);
  topGlow.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
  topGlow.addColorStop(0.6, 'rgba(124, 58, 237, 0.1)');
  topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, height);

  const botGlow = ctx.createRadialGradient(150, height - 100, 10, 150, height - 100, 460);
  botGlow.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
  botGlow.addColorStop(0.6, 'rgba(14, 165, 233, 0.08)');
  botGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = botGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Grid Pattern Overlay
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Futuristic Neon Frame
  ctx.save();
  const pad = 36;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  const radius = 28;

  // Frame path
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, cardH, radius);
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.restore();

  // Corner Accent Brackets
  const cornerLen = 35;
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 12;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(pad + radius + cornerLen, pad);
  ctx.lineTo(pad + radius, pad);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(width - pad - radius - cornerLen, pad);
  ctx.lineTo(width - pad - radius, pad);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(pad + radius, height - pad);
  ctx.lineTo(pad + radius + cornerLen, height - pad);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(width - pad - radius - cornerLen, height - pad);
  ctx.lineTo(width - pad - radius, height - pad);
  ctx.stroke();
  ctx.restore();

  // 5. Header: Logo & Recap Tag
  const contentX = pad + 40;
  let cursorY = pad + 65;

  // ArcadeX Brand Text
  ctx.font = '900 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('ARCADEX', contentX, cursorY);

  const brandWidth = ctx.measureText('ARCADEX').width;
  ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('INSTANT GAMES', contentX + brandWidth + 12, cursorY);

  // Top Right: Timestamp & Recap Pill
  ctx.save();
  const recapPillText = '⚡ GAME RECAP SUMMARY';
  ctx.font = '800 13px "JetBrains Mono", monospace';
  const pillW = ctx.measureText(recapPillText).width + 24;
  const pillX = width - pad - 40 - pillW;

  ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
  ctx.beginPath();
  ctx.roundRect(pillX, cursorY - 22, pillW, 30, 15);
  ctx.fill();
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#d8b4fe';
  ctx.fillText(recapPillText, pillX + 12, cursorY - 3);
  ctx.restore();

  // 6. Game Title & High Score Badge
  cursorY += 65;
  ctx.font = '900 46px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(params.gameTitle.toUpperCase(), contentX, cursorY);

  if (params.isHighScore) {
    const titleWidth = ctx.measureText(params.gameTitle.toUpperCase()).width;
    ctx.save();
    const hsX = contentX + titleWidth + 24;
    const hsText = '🔥 KỶ LỤC MỚI!';
    ctx.font = '800 16px "Plus Jakarta Sans", system-ui, sans-serif';
    const hsW = ctx.measureText(hsText).width + 24;

    ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
    ctx.beginPath();
    ctx.roundRect(hsX, cursorY - 32, hsW, 38, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.fillText(hsText, hsX + 12, cursorY - 7);
    ctx.restore();
  }

  // 7. Giant Score Showcase (Hero Section)
  cursorY += 95;
  ctx.save();
  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
  ctx.fillText('ĐIỂM SỐ CHUNG CUỘC • FINAL SCORE', contentX, cursorY);

  cursorY += 75;
  ctx.font = '900 84px "JetBrains Mono", monospace';
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = 'rgba(234, 179, 8, 0.65)';
  ctx.shadowBlur = 30;
  const scoreStr = (params.score || 0).toLocaleString();
  ctx.fillText(scoreStr, contentX, cursorY);
  ctx.restore();

  // 8. Achieved Rank Banner Box
  cursorY += 65;
  const rankBoxW = width - pad * 2 - 80;
  const rankBoxH = 68;

  ctx.save();
  const rankGrad = ctx.createLinearGradient(contentX, cursorY, contentX + rankBoxW, cursorY);
  rankGrad.addColorStop(0, 'rgba(30, 27, 75, 0.8)');
  rankGrad.addColorStop(0.5, 'rgba(23, 23, 48, 0.9)');
  rankGrad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
  ctx.fillStyle = rankGrad;
  ctx.beginPath();
  ctx.roundRect(contentX, cursorY, rankBoxW, rankBoxH, 18);
  ctx.fill();

  ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rank Pill inside box
  const badgeX = contentX + 20;
  const badgeY = cursorY + 16;
  ctx.font = '900 15px "Plus Jakarta Sans", system-ui, sans-serif';
  const badgeW = ctx.measureText(params.rankBadge).width + 24;

  ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, 36, 10);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.fillText(params.rankBadge, badgeX + 12, badgeY + 24);

  // Full Rank text
  ctx.font = '700 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(params.achievedRank, badgeX + badgeW + 20, cursorY + 41);

  ctx.restore();

  // 9. Footer: Player Profile & Exact Timestamp
  const footerY = height - pad - 42;

  // Player Avatar & Info
  ctx.save();
  ctx.font = '36px sans-serif';
  ctx.fillText(params.playerAvatar || '🎮', contentX, footerY + 8);

  ctx.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(params.playerName, contentX + 50, footerY - 5);

  ctx.font = '600 14px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#a5b4fc';
  ctx.fillText('ArcadeX • Chơi theo cách của bạn', contentX + 50, footerY + 16);

  // Timestamp on the Right
  const timeX = width - pad - 40;
  ctx.textAlign = 'right';
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`🕒 ${params.timestamp}`, timeX, footerY - 5);

  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText('VERIFIED ARCADEX MATCH • arcadex.instant', timeX, footerY + 16);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

