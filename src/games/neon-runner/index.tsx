import { createFixedTicker } from './timing';
import { randomStep } from '../tile-2048/engine';
import { drawArenaBackdrop } from '../../visuals/arenaBackdrop';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameComponentProps } from '../../types';
import { ArrowUp, ArrowDown, Shield, Sparkles, AlertTriangle } from 'lucide-react';

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

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'laser_high' | 'drone' | 'barrier';
  color: string;
  passed?: boolean;
}

interface Collectible {
  x: number;
  y: number;
  baseY: number;
  size: number;
  type: 'coin' | 'shield' | 'multiplier' | 'gem';
  color: string;
  collected?: boolean;
}

export const NeonRunnerGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  onGameOver,
  initialState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [multiplierTimer, setMultiplierTimer] = useState<number>(0);

  const candidate = initialState !== undefined ? initialState : bridge.loadGameState<any>();
  const saved = candidate?.version === 1 && candidate.state && !candidate.state.isOver &&
    [candidate.state.score, candidate.state.distance, candidate.state.speed, candidate.state.playerY, candidate.state.groundY, candidate.state.rngState].every(Number.isFinite) &&
    Array.isArray(candidate.state.obstacles) && Array.isArray(candidate.state.collectibles) ? candidate.state : null;
  // Game state refs
  const stateRef = useRef({
    score: 0,
    distance: 0,
    speed: 3.6,
    baseSpeed: 3.6,
    multiplier: 1,
    multiplierTimer: 0,
    hasShield: false,
    isGrounded: true,
    isSliding: false,
    jumpCount: 0,
    slideTimer: 0,
    playerX: 80,
    playerY: 0,
    playerVy: 0,
    playerWidth: 32,
    playerHeight: 46,
    gravity: 0.65,
    jumpForce: -12.5,
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    trail: [] as { x: number; y: number; alpha: number; color: string }[],
    lastObstacleDist: 0,
    lastCollectibleDist: 0,
    isOver: false,
    groundY: 0,
    rngState: crypto.getRandomValues(new Uint32Array(1))[0],
    nextObstacleGap: 480,
    lastCheckpoint: 0,
    ...saved,
  });

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.isOver || isPaused) return;

    if (s.isGrounded || s.jumpCount < 2) {
      s.playerVy = s.jumpForce;
      s.isGrounded = false;
      s.isSliding = false;
      s.jumpCount += 1;
      bridge.playSound('jump');

      // Add jump burst particles
      for (let i = 0; i < 8; i++) {
        s.particles.push({
          x: s.playerX + s.playerWidth / 2,
          y: s.playerY + s.playerHeight,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 2 + 1,
          size: Math.random() * 4 + 2,
          color: '#38bdf8',
          alpha: 1,
          life: 0,
          maxLife: 20,
        });
      }
    }
  }, [bridge, isPaused]);

  const slide = useCallback(() => {
    const s = stateRef.current;
    if (s.isOver || isPaused) return;

    if (s.isGrounded) {
      s.isSliding = true;
      s.slideTimer = 30;
      bridge.playSound('click');
    } else {
      // Fast fall
      s.playerVy = 13;
    }
  }, [bridge, isPaused]);

  // Touch gesture & tap zone tracking on canvas
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !containerRef.current) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const end = e.changedTouches[0];
    if (!end) return;

    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    const dt = Date.now() - start.time;

    // Swipe gestures
    if (Math.abs(dy) > 30 && dt < 400) {
      if (dy < 0) {
        jump();
        return;
      } else {
        slide();
        return;
      }
    }

    // Tap zones: Left half = Slide, Right half = Jump
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = end.clientX - rect.left;
      if (relativeX < rect.width * 0.45) {
        slide();
      } else {
        jump();
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        jump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        slide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump, slide]);

  // Game loop
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

      // Ergonomic ground height: elevated on mobile to avoid blocking by bottom controls
      const isMobileView = rect.height > rect.width || rect.width < 640;
      const previousGround = stateRef.current.groundY;
      stateRef.current.groundY = isMobileView
        ? Math.floor(Math.min(rect.height - 125, Math.max(rect.height * 0.65, 260)))
        : rect.height - 85;

      const groundDelta = previousGround ? stateRef.current.groundY - previousGround : 0;
      stateRef.current.playerY += groundDelta;
      stateRef.current.obstacles.forEach(obstacle => { obstacle.y += groundDelta; });
      stateRef.current.collectibles.forEach(item => { item.y += groundDelta; item.baseY += groundDelta; });
      stateRef.current.playerX = Math.min(rect.width * 0.2, 90);

      if (stateRef.current.isGrounded) {
        stateRef.current.playerY = stateRef.current.groundY - stateRef.current.playerHeight;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Initial setup
    const s = stateRef.current;
    if (s.isGrounded) s.playerY = s.groundY - s.playerHeight;
    setScore(Math.floor(s.score)); setMultiplier(s.multiplier); setHasShield(s.hasShield); setMultiplierTimer(Math.ceil(s.multiplierTimer / 60));
    bridge.saveGameState({ version: 1, state: { ...s, particles: [], trail: [] } });

    const skin = bridge.getEquippedSkin();
    
    // Default Cyan
    let primaryColor = '#06b6d4';
    let accentColor = '#38bdf8';

    if (skin.includes('phantom') || skin.includes('mystic') || skin.includes('galactic')) {
      primaryColor = '#c084fc';
      accentColor = '#a855f7';
    } else if (skin.includes('overdrive') || skin.includes('golden')) {
      primaryColor = '#f59e0b';
      accentColor = '#fbbf24';
    } else if (skin.includes('retro') || skin.includes('magma') || skin.includes('lava')) {
      primaryColor = '#f97316';
      accentColor = '#fb923c';
    } else if (skin.includes('cyberpunk') || skin.includes('rainbow')) {
      primaryColor = '#ec4899';
      accentColor = '#f472b6';
    } else if (skin.includes('ice') || skin.includes('crystal') || skin.includes('quantum')) {
      primaryColor = '#38bdf8';
      accentColor = '#7dd3fc';
    } else if (skin.includes('forest')) {
      primaryColor = '#22c55e';
      accentColor = '#4ade80';
    } else if (skin.includes('ghost') || skin.includes('shadow') || skin.includes('pixel')) {
      primaryColor = '#94a3b8';
      accentColor = '#cbd5e1';
    }

    let gridOffset = 0;

    const ticker = createFixedTicker();
    const randomGameplay = () => { const next = randomStep(s.rngState); s.rngState = next.state; return next.value; };
    const updateAndDraw = (timestamp: number) => {
      const steps = ticker.advance(timestamp, !isPaused && !s.isOver);
      for (let tick = 0; tick < steps && !s.isOver; tick++) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        const isMobileView = height > width || width < 640;
        s.groundY = isMobileView
          ? Math.floor(Math.min(height - 125, Math.max(height * 0.65, 260)))
          : height - 85;

        // Smooth and fair speed curve: comfortable start at 3.6, scales slowly with distance
        s.distance += s.speed;
        s.speed = s.baseSpeed + Math.min(s.distance / 3500, 3.2);
        gridOffset = (gridOffset + s.speed) % 40;

        // Update score
        const pointsToAdd = s.speed * 0.08 * s.multiplier;
        s.score += pointsToAdd;
        setScore(Math.floor(s.score));

        // Check milestones for achievements
        if (s.score >= 500) bridge.reportProgress('ach-runner-500', Math.floor(s.score), true);
        if (s.score >= 2000) bridge.reportProgress('ach-runner-2000', Math.floor(s.score), true);

        // Update multiplier timer
        if (s.multiplierTimer > 0) {
          s.multiplierTimer -= 1;
          if (s.multiplierTimer <= 0) {
            s.multiplier = 1;
            setMultiplier(1);
          }
          setMultiplierTimer(Math.ceil(s.multiplierTimer / 60));
        }

        // Slide timer
        if (s.isSliding) {
          s.slideTimer -= 1;
          if (s.slideTimer <= 0) {
            s.isSliding = false;
          }
        }

        // Physics
        s.playerHeight = s.isSliding ? 24 : 46;
        s.playerY += s.playerVy;

        if (!s.isGrounded) {
          s.playerVy += s.gravity;
        }

        if (s.playerY + s.playerHeight >= s.groundY) {
          s.playerY = s.groundY - s.playerHeight;
          s.playerVy = 0;
          s.isGrounded = true;
          s.jumpCount = 0;
        }

        // Player trail
        s.trail.push({
          x: s.playerX,
          y: s.playerY,
          alpha: 0.6,
          color: primaryColor,
        });
        if (s.trail.length > 8) s.trail.shift();
        s.trail.forEach(t => t.alpha *= 0.85);

        // Fair obstacle spacing: at least 420-620px to allow ample reaction & recovery time
        const minObstacleGap = s.nextObstacleGap;
        if (s.distance - s.lastObstacleDist > minObstacleGap) {
          s.lastObstacleDist = s.distance;
          s.nextObstacleGap = Math.max(420, s.speed * 110) + randomGameplay() * 160;
          const types: ('spike' | 'laser_high' | 'drone' | 'barrier')[] = ['spike', 'laser_high', 'drone', 'barrier'];
          const type = types[Math.floor(randomGameplay() * types.length)];

          let obsWidth = 28;
          let obsHeight = 34;
          let obsY = s.groundY - obsHeight;

          if (type === 'laser_high') {
            obsWidth = 46;
            obsHeight = 22;
            obsY = s.groundY - 66; // High beam: Requires sliding underneath
          } else if (type === 'drone') {
            obsWidth = 32;
            obsHeight = 30;
            obsY = s.groundY - 76; // Flying hazard: can run under or jump over
          } else if (type === 'barrier') {
            obsWidth = 26;
            obsHeight = 38;
            obsY = s.groundY - obsHeight; // Cyber barrier: Requires jumping
          }

          s.obstacles.push({
            x: width + 30,
            y: obsY,
            width: obsWidth,
            height: obsHeight,
            type,
            color: '#ef4444',
          });
        }

        // Spawn collectibles: pleasant rewards placed logically
        if (s.distance - s.lastCollectibleDist > 220 + randomGameplay() * 220) {
          s.lastCollectibleDist = s.distance;
          const roll = randomGameplay();
          let cType: 'coin' | 'shield' | 'multiplier' | 'gem' = 'coin';
          let cColor = '#fbbf24';

          if (roll < 0.65) {
            cType = 'coin';
            cColor = '#f59e0b';
          } else if (roll < 0.8) {
            cType = 'multiplier';
            cColor = '#a855f7';
          } else if (roll < 0.92) {
            cType = 'shield';
            cColor = '#06b6d4';
          } else {
            cType = 'gem';
            cColor = '#ec4899';
          }

          const targetY = s.groundY - 36 - randomGameplay() * 45;
          s.collectibles.push({
            x: width + 30,
            y: targetY,
            baseY: targetY,
            size: cType === 'coin' ? 18 : 22,
            type: cType,
            color: cColor,
          });
        }

        // Move obstacles & collision
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.speed;

          // Hitbox collision check with forgiving inner bounds
          const pBox = {
            x: s.playerX + 6,
            y: s.playerY + 6,
            w: s.playerWidth - 12,
            h: s.playerHeight - 8,
          };
          const oBox = {
            x: obs.x + 4,
            y: obs.y + 4,
            w: obs.width - 8,
            h: obs.height - 6,
          };

          const isColliding =
            pBox.x < oBox.x + oBox.w &&
            pBox.x + pBox.w > oBox.x &&
            pBox.y < oBox.y + oBox.h &&
            pBox.y + pBox.h > oBox.y;

          if (isColliding) {
            if (s.hasShield) {
              // Shield absorbs hit
              s.hasShield = false;
              setHasShield(false);
              s.obstacles.splice(i, 1);
              bridge.playSound('powerup');

              // Burst particles on shield break
              for (let p = 0; p < 16; p++) {
                s.particles.push({
                  x: s.playerX + s.playerWidth / 2,
                  y: s.playerY + s.playerHeight / 2,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  size: Math.random() * 5 + 2,
                  color: '#a855f7',
                  alpha: 1,
                  life: 0,
                  maxLife: 30,
                });
              }
            } else {
              // Game Over
              s.isOver = true;
              bridge.playSound('gameOver');
              bridge.saveGameState({ version: 1, state: { ...s, isOver: true, particles: [], trail: [] } });
              onGameOver(Math.floor(s.score));
            }
          }

          if (obs.x < -60) {
            s.obstacles.splice(i, 1);
          }
        }

        // Move collectibles & pickup with smooth hover floating motion
        const now = Date.now();
        for (let i = s.collectibles.length - 1; i >= 0; i--) {
          const col = s.collectibles[i];
          col.x -= s.speed;
          // Smooth sine hover
          col.y = col.baseY + Math.sin(now / 200 + col.x / 40) * 4;

          const dist = Math.hypot(
            s.playerX + s.playerWidth / 2 - col.x,
            s.playerY + s.playerHeight / 2 - col.y
          );

          if (dist < 36 && !col.collected) {
            col.collected = true;
            if (col.type === 'coin') {
              s.score += 50 * s.multiplier;
              bridge.grantCoins(2);
              bridge.playSound('coin');
            } else if (col.type === 'multiplier') {
              s.multiplier = 2;
              s.multiplierTimer = 600; // 10s
              setMultiplier(2);
              bridge.playSound('powerup');
            } else if (col.type === 'shield') {
              s.hasShield = true;
              setHasShield(true);
              bridge.playSound('powerup');
            } else if (col.type === 'gem') {
              s.score += 150 * s.multiplier;
              bridge.grantGems(1);
              bridge.playSound('coin');
            }

            // Sparkle particles
            for (let p = 0; p < 10; p++) {
              s.particles.push({
                x: col.x,
                y: col.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 4 + 2,
                color: col.color,
                alpha: 1,
                life: 0,
                maxLife: 25,
              });
            }

            s.collectibles.splice(i, 1);
            continue;
          }

          if (col.x < -40) {
            s.collectibles.splice(i, 1);
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

      if (!s.isOver && s.distance - s.lastCheckpoint > 500 && s.isGrounded &&
          s.obstacles.every(obstacle => obstacle.x + obstacle.width < s.playerX || obstacle.x > s.playerX + 300)) {
        s.lastCheckpoint = s.distance;
        bridge.saveGameState({ version: 1, state: { ...s, particles: [], trail: [] } });
        bridge.updateSessionState?.({ score: s.score });
      }

      // RENDER
      const width = container.clientWidth;
      const height = container.clientHeight;

      const horizonY = s.groundY;
      drawArenaBackdrop(ctx, 'city', width, height, horizonY);

      // Floor
      ctx.fillStyle = '#080c16';
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Glowing Ground track line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Ground vertical grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      for (let x = -gridOffset; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, horizonY);
        ctx.lineTo(x - (horizonY - height) * 0.7, height);
        ctx.stroke();
      }

      // Draw player trail
      s.trail.forEach(t => {
        ctx.fillStyle = t.color;
        ctx.globalAlpha = t.alpha * 0.35;
        ctx.fillRect(t.x, t.y, s.playerWidth, s.playerHeight);
      });
      ctx.globalAlpha = 1;

      // Draw player
      ctx.save();
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 14;
      ctx.fillStyle = primaryColor;

      if (s.isSliding) {
        // Sliding posture
        ctx.beginPath();
        ctx.roundRect(s.playerX, s.playerY, s.playerWidth + 14, s.playerHeight, 6);
        ctx.fill();
        // Visor
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(s.playerX + s.playerWidth - 2, s.playerY + 6, 8, 4);
      } else {
        // Normal runner
        ctx.beginPath();
        ctx.roundRect(s.playerX, s.playerY, s.playerWidth, s.playerHeight, 8);
        ctx.fill();
        // Inner core
        ctx.fillStyle = accentColor;
        ctx.fillRect(s.playerX + 6, s.playerY + 12, s.playerWidth - 12, 16);
        const stride = s.isGrounded ? Math.sin(s.distance / 18) * 5 : 3;
        ctx.strokeStyle = accentColor; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s.playerX + 9, s.playerY + 32); ctx.lineTo(s.playerX + 8 + stride, s.playerY + 44);
        ctx.moveTo(s.playerX + 24, s.playerY + 32); ctx.lineTo(s.playerX + 24 - stride, s.playerY + 44); ctx.stroke();
        // Visor
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(s.playerX + 16, s.playerY + 8, 12, 5);
      }

      // Shield visual bubble
      if (s.hasShield) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(
          s.playerX + s.playerWidth / 2,
          s.playerY + s.playerHeight / 2,
          s.playerHeight * 0.7,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
      ctx.restore();

      // ==========================================
      // DRAW OBSTACLES (VẬT CẢN - NÉ TRÁNH!)
      // Clearly colored in DANGER RED / CRIMSON with HAZARD STRIPES & WARNING ICONS
      // ==========================================
      s.obstacles.forEach(obs => {
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;

        if (obs.type === 'spike') {
          // Sharp razor spikes on the ground
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width * 0.3, obs.y);
          ctx.lineTo(obs.x + obs.width * 0.5, obs.y + obs.height * 0.6);
          ctx.lineTo(obs.x + obs.width * 0.8, obs.y + 4);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();

          // Glowing danger tip highlight
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width * 0.3, obs.y + 3, 2.5, 0, Math.PI * 2);
          ctx.arc(obs.x + obs.width * 0.8, obs.y + 6, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'laser_high') {
          // High horizontal laser beam with emitter poles: REQUIRES SLIDE!
          // Left and right emitter nodes
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(obs.x, obs.y - 4, 8, obs.height + 8);
          ctx.fillRect(obs.x + obs.width - 8, obs.y - 4, 8, obs.height + 8);

          // Pulsing red laser core
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(obs.x + 4, obs.y + obs.height / 2 - 4, obs.width - 8, 8);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obs.x + 6, obs.y + obs.height / 2 - 1.5, obs.width - 12, 3);

          // Hazard label
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('⚡ TRƯỢT', obs.x + 4, obs.y - 6);
        } else if (obs.type === 'drone') {
          // Spiked hazard flying drone with blinking danger light
          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
          ctx.fill();

          // 4 Danger blades
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(obs.x - 3, obs.y + obs.height / 2);
          ctx.lineTo(obs.x + obs.width + 3, obs.y + obs.height / 2);
          ctx.moveTo(obs.x + obs.width / 2, obs.y - 3);
          ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height + 3);
          ctx.stroke();

          // Blinking red skull / eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Cyber Barrier with diagonal caution stripes (///)
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

          // Caution stripes
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          for (let sy = obs.y; sy < obs.y + obs.height; sy += 10) {
            ctx.beginPath();
            ctx.moveTo(obs.x, sy);
            ctx.lineTo(obs.x + obs.width, sy + 6);
            ctx.stroke();
          }
        }
        ctx.restore();
      });

      // ==========================================
      // DRAW COLLECTIBLES (VẬT PHẨM THƯỞNG - CẦN ĂN!)
      // Distinct glowing GOLD / CYAN / PURPLE colors, gentle hover, clear emblems
      // ==========================================
      s.collectibles.forEach(col => {
        ctx.save();
        ctx.shadowColor = col.color;
        ctx.shadowBlur = 16;

        if (col.type === 'coin') {
          // Golden Coin with outer ring and star ★
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(col.x, col.y, col.size / 2, 0, Math.PI * 2);
          ctx.fill();

          // Outer shiny ring
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Center Star icon
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', col.x, col.y + 0.5);
        } else if (col.type === 'gem') {
          // Sparkling Cyan Diamond Gem
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.moveTo(col.x, col.y - col.size / 2);
          ctx.lineTo(col.x + col.size / 2, col.y);
          ctx.lineTo(col.x, col.y + col.size / 2);
          ctx.lineTo(col.x - col.size / 2, col.y);
          ctx.closePath();
          ctx.fill();

          // Specular glint
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(col.x, col.y - col.size / 2);
          ctx.lineTo(col.x + col.size / 4, col.y - col.size / 6);
          ctx.lineTo(col.x, col.y);
          ctx.lineTo(col.x - col.size / 4, col.y - col.size / 6);
          ctx.closePath();
          ctx.fill();
        } else if (col.type === 'shield') {
          // Cyan Shield Bubble with shield emblem
          ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.beginPath();
          ctx.arc(col.x, col.y, col.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Inner shield icon
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', col.x, col.y);
        } else if (col.type === 'multiplier') {
          // Violet 2X Multiplier Orb
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(col.x, col.y, col.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e9d5ff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // 2X text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('2X', col.x, col.y);
        }
        ctx.restore();
      });

      // Draw Particles
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
      onTouchStart={handleCanvasTouchStart}
      onTouchEnd={handleCanvasTouchEnd}
      data-no-swipe="true"
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none touch-none"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top HUD: Score & Active Buffs */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 pointer-events-none z-10">
        <div className="arcade-combat-hud px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20">
          Điểm: {score.toLocaleString()}
        </div>

        {multiplier > 1 && (
          <div className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 backdrop-blur-md border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>x{multiplier} COMBO ({multiplierTimer}s)</span>
          </div>
        )}

        {hasShield && (
          <div className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 backdrop-blur-md border border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>KHIÊN</span>
          </div>
        )}
      </div>

      {/* Visual Legend Helper */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 hidden xs:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] pointer-events-none z-10 font-mono">
        <span className="text-amber-400 font-bold">● ĂN: Vàng/Ngọc</span>
        <span className="text-rose-400 font-bold">▲ NÉ: Đỏ/Gai</span>
      </div>

      {/* Non-intrusive Low-Profile Mobile Touch Controls Bar */}
      <div className="absolute bottom-2 inset-x-2 sm:bottom-3 sm:inset-x-4 flex justify-between items-center pointer-events-none z-20">
        {/* Slide Button (Bottom Left) */}
        <button
          id="btn-touch-slide"
          type="button"
          onTouchStart={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
          onPointerDown={e => { e.stopPropagation(); slide(); }}
          onClick={e => { if (e.detail === 0) slide(); }}
          className="pointer-events-auto h-12 sm:h-14 px-4 sm:px-6 rounded-xl bg-slate-900/60 active:bg-rose-950/70 backdrop-blur-md border border-rose-500/30 text-rose-300 active:scale-95 shadow-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowDown className="w-5 h-5 text-rose-400" />
          <div className="text-left">
            <div className="text-xs font-black tracking-wider leading-none">TRƯỢT</div>
            <div className="text-[8px] text-slate-400 font-mono mt-0.5">Chạm Trái / Vuốt ↓</div>
          </div>
        </button>

        {/* Jump Button (Bottom Right) */}
        <button
          id="btn-touch-jump"
          type="button"
          onTouchStart={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
          onPointerDown={e => { e.stopPropagation(); jump(); }}
          onClick={e => { if (e.detail === 0) jump(); }}
          className="pointer-events-auto h-12 sm:h-14 px-4 sm:px-6 rounded-xl bg-cyan-950/60 active:bg-cyan-900/70 backdrop-blur-md border border-cyan-400/40 text-cyan-200 active:scale-95 shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 text-cyan-300" />
          <div className="text-left">
            <div className="text-xs font-black tracking-wider leading-none">NHẢY</div>
            <div className="text-[8px] text-cyan-300/80 font-mono mt-0.5">Chạm Phải / Vuốt ↑</div>
          </div>
        </button>
      </div>
    </div>
  );
};

