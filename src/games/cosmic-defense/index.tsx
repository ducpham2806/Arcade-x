import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameComponentProps } from '../../types';
import { Bomb, Shield, Zap, Sparkles, Heart } from 'lucide-react';

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  color: string;
  size: number;
  damage: number;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  type: 'scout' | 'fighter' | 'cruiser' | 'boss' | 'meteor';
  color: string;
  speedY: number;
  speedX: number;
  shootCooldown: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

export const CosmicDefenseGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [hp, setHp] = useState<number>(3);
  const [empBombs, setEmpBombs] = useState<number>(2);
  const [weaponLevel, setWeaponLevel] = useState<number>(1);
  const [bossHp, setBossHp] = useState<{ current: number; max: number } | null>(null);

  const stateRef = useRef({
    score: 0,
    hp: 3,
    empBombs: 2,
    weaponLevel: 1,
    playerX: 0,
    playerY: 0,
    targetX: 0,
    targetY: 0,
    playerRadius: 18,
    isOver: false,
    invincibleTimer: 0,
    shootTimer: 0,
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    stars: [] as Star[],
    waveTimer: 0,
    bossActive: false,
    keys: { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, KeyA: false, KeyD: false, KeyW: false, KeyS: false },
  });

  const triggerEmpBomb = useCallback(() => {
    const s = stateRef.current;
    if (s.isOver || isPaused || s.empBombs <= 0) return;

    s.empBombs -= 1;
    setEmpBombs(s.empBombs);
    bridge.playSound('explosion');

    // Clear enemy bullets
    s.bullets = s.bullets.filter(b => b.isPlayer);

    // Damage all enemies
    s.enemies.forEach(e => {
      e.hp -= 20;
    });

    // Flash particles across screen
    if (containerRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      for (let i = 0; i < 40; i++) {
        s.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          size: Math.random() * 6 + 2,
          color: '#38bdf8',
          alpha: 1,
          life: 0,
          maxLife: 40,
        });
      }
    }
  }, [bridge, isPaused]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        triggerEmpBomb();
      }
      if (e.code in stateRef.current.keys) {
        stateRef.current.keys[e.code as keyof typeof stateRef.current.keys] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code in stateRef.current.keys) {
        stateRef.current.keys[e.code as keyof typeof stateRef.current.keys] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerEmpBomb]);

  // Mouse & Touch drag tracking with ergonomic touch offset for mobile
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || stateRef.current.isOver || isPaused) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touchOffsetY = e.pointerType === 'touch' ? 50 : 0;
    stateRef.current.targetX = e.clientX - rect.left;
    stateRef.current.targetY = Math.max(30, e.clientY - rect.top - touchOffsetY);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Initial player placement
    const s = stateRef.current;
    s.playerX = container.clientWidth / 2;
    s.playerY = container.clientHeight - 80;
    s.targetX = s.playerX;
    s.targetY = s.playerY;

    // Generate stars
    s.stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * container.clientWidth,
      y: Math.random() * container.clientHeight,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
    }));

    const skin = bridge.getEquippedSkin();
    if (skin.includes('apex')) {
      s.empBombs = 3;
      setEmpBombs(3);
    }

    let shipColor = '#06b6d4';
    if (skin.includes('apex') || skin.includes('mystic') || skin.includes('galactic')) {
      shipColor = '#c084fc';
    } else if (skin.includes('phoenix') || skin.includes('magma') || skin.includes('lava') || skin.includes('retro')) {
      shipColor = '#f97316';
    } else if (skin.includes('golden') || skin.includes('quantum')) {
      shipColor = '#fbbf24';
    } else if (skin.includes('cyberpunk') || skin.includes('rainbow')) {
      shipColor = '#ec4899';
    } else if (skin.includes('ice') || skin.includes('crystal')) {
      shipColor = '#38bdf8';
    } else if (skin.includes('forest')) {
      shipColor = '#22c55e';
    } else if (skin.includes('ghost') || skin.includes('shadow') || skin.includes('pixel')) {
      shipColor = '#cbd5e1';
    }

    const updateAndDraw = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!isPaused && !s.isOver) {
        // Move stars
        s.stars.forEach(st => {
          st.y += st.speed;
          if (st.y > height) {
            st.y = 0;
            st.x = Math.random() * width;
          }
        });

        // Keyboard arrow movement
        const speed = 7;
        if (s.keys.ArrowLeft || s.keys.KeyA) s.targetX -= speed;
        if (s.keys.ArrowRight || s.keys.KeyD) s.targetX += speed;
        if (s.keys.ArrowUp || s.keys.KeyW) s.targetY -= speed;
        if (s.keys.ArrowDown || s.keys.KeyS) s.targetY += speed;

        // Smooth ship positioning towards target
        s.targetX = Math.max(20, Math.min(width - 20, s.targetX));
        s.targetY = Math.max(40, Math.min(height - 40, s.targetY));
        s.playerX += (s.targetX - s.playerX) * 0.22;
        s.playerY += (s.targetY - s.playerY) * 0.22;

        if (s.invincibleTimer > 0) s.invincibleTimer -= 1;

        // Auto shooting
        s.shootTimer += 1;
        const shootInterval = skin.includes('phoenix') ? 8 : 10;
        if (s.shootTimer >= shootInterval) {
          s.shootTimer = 0;
          bridge.playSound('laser');

          if (s.weaponLevel === 1) {
            s.bullets.push({
              x: s.playerX,
              y: s.playerY - 20,
              vx: 0,
              vy: -12,
              isPlayer: true,
              color: '#38bdf8',
              size: 4,
              damage: 1,
            });
          } else if (s.weaponLevel === 2) {
            s.bullets.push(
              { x: s.playerX - 10, y: s.playerY - 18, vx: 0, vy: -12, isPlayer: true, color: '#38bdf8', size: 4, damage: 1 },
              { x: s.playerX + 10, y: s.playerY - 18, vx: 0, vy: -12, isPlayer: true, color: '#38bdf8', size: 4, damage: 1 }
            );
          } else {
            // Level 3+ spread
            s.bullets.push(
              { x: s.playerX, y: s.playerY - 20, vx: 0, vy: -13, isPlayer: true, color: '#c084fc', size: 5, damage: 1.5 },
              { x: s.playerX - 12, y: s.playerY - 16, vx: -2, vy: -12, isPlayer: true, color: '#38bdf8', size: 4, damage: 1 },
              { x: s.playerX + 12, y: s.playerY - 16, vx: 2, vy: -12, isPlayer: true, color: '#38bdf8', size: 4, damage: 1 }
            );
          }
        }

        // Spawn Enemy Waves
        s.waveTimer += 1;
        if (s.waveTimer % 45 === 0 && !s.bossActive) {
          const roll = Math.random();
          if (roll < 0.5) {
            // Scout
            s.enemies.push({
              x: Math.random() * (width - 40) + 20,
              y: -30,
              width: 24,
              height: 24,
              hp: 2,
              maxHp: 2,
              type: 'scout',
              color: '#f43f5e',
              speedY: 2.5 + Math.random() * 1.5,
              speedX: (Math.random() - 0.5) * 1.5,
              shootCooldown: 60 + Math.random() * 40,
            });
          } else if (roll < 0.8) {
            // Fighter
            s.enemies.push({
              x: Math.random() * (width - 60) + 30,
              y: -40,
              width: 32,
              height: 32,
              hp: 4,
              maxHp: 4,
              type: 'fighter',
              color: '#fb923c',
              speedY: 1.8,
              speedX: Math.sin(Date.now() / 300) * 2,
              shootCooldown: 40,
            });
          } else {
            // Meteor
            s.enemies.push({
              x: Math.random() * (width - 40) + 20,
              y: -50,
              width: 42,
              height: 42,
              hp: 8,
              maxHp: 8,
              type: 'meteor',
              color: '#94a3b8',
              speedY: 2.8,
              speedX: (Math.random() - 0.5) * 0.8,
              shootCooldown: 9999,
            });
          }
        }

        // Spawn Boss when score >= 1200
        if (s.score >= 1200 && !s.bossActive && s.enemies.filter(e => e.type === 'boss').length === 0) {
          s.bossActive = true;
          s.enemies.push({
            x: width / 2,
            y: -100,
            width: 90,
            height: 70,
            hp: 60,
            maxHp: 60,
            type: 'boss',
            color: '#dc2626',
            speedY: 1,
            speedX: 2,
            shootCooldown: 25,
          });
          setBossHp({ current: 60, max: 60 });
        }

        // Update enemies & enemy shooting
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const e = s.enemies[i];

          if (e.type === 'boss') {
            if (e.y < 80) {
              e.y += e.speedY;
            } else {
              e.x += e.speedX;
              if (e.x < 60 || e.x > width - 60) e.speedX *= -1;
            }
            setBossHp({ current: Math.max(0, e.hp), max: e.maxHp });
          } else {
            e.y += e.speedY;
            e.x += e.speedX;
          }

          // Enemy shooting
          e.shootCooldown -= 1;
          if (e.shootCooldown <= 0 && e.type !== 'meteor') {
            e.shootCooldown = e.type === 'boss' ? 22 : 65 + Math.random() * 40;
            if (e.type === 'boss') {
              s.bullets.push(
                { x: e.x - 25, y: e.y + 35, vx: -1.5, vy: 5, isPlayer: false, color: '#f43f5e', size: 5, damage: 1 },
                { x: e.x, y: e.y + 40, vx: 0, vy: 5.5, isPlayer: false, color: '#f43f5e', size: 5, damage: 1 },
                { x: e.x + 25, y: e.y + 35, vx: 1.5, vy: 5, isPlayer: false, color: '#f43f5e', size: 5, damage: 1 }
              );
            } else {
              s.bullets.push({
                x: e.x,
                y: e.y + e.height / 2,
                vx: 0,
                vy: 4.5,
                isPlayer: false,
                color: '#fb7185',
                size: 4,
                damage: 1,
              });
            }
          }

          // Enemy collision with player
          const distToPlayer = Math.hypot(e.x - s.playerX, e.y - s.playerY);
          if (distToPlayer < s.playerRadius + e.width / 2 && s.invincibleTimer <= 0) {
            s.hp -= 1;
            setHp(s.hp);
            s.invincibleTimer = 60;
            bridge.playSound('hit');

            if (s.hp <= 0) {
              s.isOver = true;
              bridge.playSound('gameOver');
              onGameOver(s.score);
            }
          }

          // Dead enemy
          if (e.hp <= 0) {
            bridge.playSound('explosion');
            const points = e.type === 'boss' ? 800 : e.type === 'cruiser' ? 150 : 50;
            s.score += points;
            setScore(s.score);

            if (e.type === 'boss') {
              bridge.reportProgress('ach-cosmic-boss', 1500, true);
              s.bossActive = false;
              setBossHp(null);
            }

            // Chance to upgrade weapon
            if (Math.random() < 0.25 && s.weaponLevel < 3) {
              s.weaponLevel += 1;
              setWeaponLevel(s.weaponLevel);
              bridge.playSound('powerup');
            }

            // Explosion particles
            for (let p = 0; p < (e.type === 'boss' ? 30 : 12); p++) {
              s.particles.push({
                x: e.x,
                y: e.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 5 + 2,
                color: e.color,
                alpha: 1,
                life: 0,
                maxLife: 30,
              });
            }

            s.enemies.splice(i, 1);
            continue;
          }

          if (e.y > height + 50) {
            s.enemies.splice(i, 1);
          }
        }

        // Update bullets
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          if (b.isPlayer) {
            // Check collision with enemies
            for (const enemy of s.enemies) {
              const d = Math.hypot(b.x - enemy.x, b.y - enemy.y);
              if (d < enemy.width / 2 + b.size) {
                enemy.hp -= b.damage;
                b.vy = 9999; // destroy bullet
                break;
              }
            }
          } else {
            // Check collision with player
            const d = Math.hypot(b.x - s.playerX, b.y - s.playerY);
            if (d < s.playerRadius + b.size && s.invincibleTimer <= 0) {
              s.hp -= b.damage;
              setHp(s.hp);
              s.invincibleTimer = 60;
              b.vy = 9999;
              bridge.playSound('hit');

              if (s.hp <= 0) {
                s.isOver = true;
                bridge.playSound('gameOver');
                onGameOver(s.score);
              }
            }
          }

          if (b.y < -20 || b.y > height + 20 || b.x < -20 || b.x > width + 20) {
            s.bullets.splice(i, 1);
          }
        }

        // Update particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life += 1;
          p.alpha = 1 - p.life / p.maxLife;
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }
      }

      // RENDER
      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, width, height);

      // Render stars
      s.stars.forEach(st => {
        ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
        ctx.fillRect(st.x, st.y, st.size, st.size);
      });

      // Render player bullets
      s.bullets.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Enemies
      s.enemies.forEach(e => {
        ctx.save();
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 10;

        if (e.type === 'boss') {
          // Dreadnought Boss Shape
          ctx.beginPath();
          ctx.moveTo(e.x, e.y + 35);
          ctx.lineTo(e.x - 45, e.y - 15);
          ctx.lineTo(e.x - 25, e.y - 35);
          ctx.lineTo(e.x + 25, e.y - 35);
          ctx.lineTo(e.x + 45, e.y - 15);
          ctx.closePath();
          ctx.fill();
          // Boss Core
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(e.x, e.y, 14, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'scout') {
          ctx.beginPath();
          ctx.moveTo(e.x, e.y + 12);
          ctx.lineTo(e.x - 12, e.y - 12);
          ctx.lineTo(e.x + 12, e.y - 12);
          ctx.closePath();
          ctx.fill();
        } else if (e.type === 'fighter') {
          ctx.beginPath();
          ctx.moveTo(e.x, e.y + 16);
          ctx.lineTo(e.x - 16, e.y - 8);
          ctx.lineTo(e.x, e.y - 16);
          ctx.lineTo(e.x + 16, e.y - 8);
          ctx.closePath();
          ctx.fill();
        } else {
          // Meteor
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Render Player Ship
      if (s.invincibleTimer % 4 < 2) {
        ctx.save();
        ctx.shadowColor = shipColor;
        ctx.shadowBlur = 16;
        ctx.fillStyle = shipColor;

        // Triangle starfighter
        ctx.beginPath();
        ctx.moveTo(s.playerX, s.playerY - 22);
        ctx.lineTo(s.playerX - 18, s.playerY + 16);
        ctx.lineTo(s.playerX, s.playerY + 8);
        ctx.lineTo(s.playerX + 18, s.playerY + 16);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.playerX, s.playerY - 4, 4, 0, Math.PI * 2);
        ctx.fill();

        // Engine Thruster Flame
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(s.playerX - 6, s.playerY + 12);
        ctx.lineTo(s.playerX, s.playerY + 22 + Math.random() * 6);
        ctx.lineTo(s.playerX + 6, s.playerY + 12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Render Particles
      s.particles.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(updateAndDraw);
    };

    animId = requestAnimationFrame(updateAndDraw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [bridge, isPaused, onGameOver]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair touch-none"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top HUD: HP & EMP */}
      <div className="absolute top-4 left-4 flex items-center gap-2.5 pointer-events-none z-10">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-mono font-bold text-sm shadow-lg shadow-cyan-500/20">
          Điểm: {score.toLocaleString()}
        </div>

        {/* Lives */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-rose-500/40">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 ${i < hp ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`}
            />
          ))}
        </div>

        {/* Weapon Level */}
        <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          <span>Lv.{weaponLevel}</span>
        </div>
      </div>

      {/* Boss Health Bar */}
      {bossHp && (
        <div className="absolute top-16 inset-x-6 max-w-md mx-auto z-20 pointer-events-none">
          <div className="flex justify-between items-center text-xs font-bold text-rose-300 mb-1">
            <span>🛸 HẠM TRƯỞNG MẸ LIÊN NGÂN HÀ</span>
            <span>{Math.round((bossHp.current / bossHp.max) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full border border-rose-500/50 overflow-hidden shadow-lg shadow-rose-500/30">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-100"
              style={{ width: `${(bossHp.current / bossHp.max) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Touch EMP Trigger Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          id="btn-trigger-emp"
          type="button"
          onClick={triggerEmpBomb}
          disabled={empBombs <= 0}
          className={`w-18 h-18 rounded-2xl flex flex-col items-center justify-center border shadow-2xl transition-all active:scale-95 ${
            empBombs > 0
              ? 'bg-rose-600/30 active:bg-rose-600/60 border-rose-400 text-rose-200 shadow-rose-600/30'
              : 'bg-slate-800/40 border-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Bomb className="w-6 h-6 animate-pulse" />
          <span className="text-[11px] font-extrabold mt-1">EMP ({empBombs})</span>
        </button>
      </div>
    </div>
  );
};
