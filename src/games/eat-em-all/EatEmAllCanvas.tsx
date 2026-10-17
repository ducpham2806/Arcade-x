import { readableCanvasText } from '../../accessibility/canvasText';
import React, { useRef, useEffect, useCallback } from 'react';
import {
  ElementMode,
  ItemType,
  FallingItem,
  Particle,
  FloatingText,
  ActivePowerUps,
  BackgroundTheme,
  PowerUpType,
} from './types';
import { eatAudio } from './audio';
import type { CampaignStage } from './campaign';
import { planDrop } from './encounters';
import { getComboTier, THEME_CONFIGS } from './config';

interface EatEmAllCanvasProps {
  playerMode: ElementMode;
  onSwitchMode: () => void;
  isPaused: boolean;
  isGameOver: boolean;
  isMuted: boolean;
  lives: number;
  furyActive: boolean;
  speedMultiplier: number;
  spawnIntervalMs: number;
  bombChance: number;
  poisonChance: number;
  powerUpChance?: number;
  combo: number;
  comboMultiplier: number;
  comboDecayRatio: number;
  activePowerUps: ActivePowerUps;
  currentTheme: BackgroundTheme;
  onEatItem: (item: FallingItem) => void;
  onHitHazard: (item: FallingItem) => void;
  onCollectPowerUp: (type: PowerUpType) => void;
  onConsumeShield: () => void;
  targetItems?: Partial<Record<ItemType, number>>;
  remainingTargets?: Partial<Record<ItemType, number>>;
  skinId?: string;
  campaignStage?: CampaignStage;
  stageElapsed?: number;
}

export const EatEmAllCanvas: React.FC<EatEmAllCanvasProps> = ({
  playerMode,
  onSwitchMode,
  isPaused,
  isGameOver,
  isMuted,
  furyActive,
  speedMultiplier,
  spawnIntervalMs,
  bombChance,
  poisonChance,
  powerUpChance = 0.14,
  combo,
  comboMultiplier,
  comboDecayRatio,
  activePowerUps,
  currentTheme,
  onEatItem,
  onHitHazard,
  onCollectPowerUp,
  onConsumeShield,
  skinId = 'default',
  campaignStage,
  stageElapsed = 0,
  remainingTargets,
}) => {
  const liveRef = useRef({playerMode, isPaused, isGameOver, furyActive, speedMultiplier, spawnIntervalMs, bombChance, poisonChance, powerUpChance, combo, comboMultiplier, comboDecayRatio, activePowerUps, currentTheme, onEatItem, onHitHazard, onCollectPowerUp, onConsumeShield, campaignStage, remainingTargets, stageElapsed, skinId});
  liveRef.current = {playerMode, isPaused, isGameOver, furyActive, speedMultiplier, spawnIntervalMs, bombChance, poisonChance, powerUpChance, combo, comboMultiplier, comboDecayRatio, activePowerUps, currentTheme, onEatItem, onHitHazard, onCollectPowerUp, onConsumeShield, campaignStage, remainingTargets, stageElapsed, skinId};
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Player state
  const playerRef = useRef({
    x: 200,
    y: 450,
    targetX: 200,
    radius: 44,
    bob: 0,
    mouthOpen: 0,
    chewTimer: 0,
    hitShake: 0,
    blinkTimer: 100,
    isBlinking: false,
    eyeLookX: 0,
    eyeLookY: -1,
    ghostHistory: [] as { x: number; y: number; alpha: number }[],
    isTouching: false,
  });

  // Falling items, particles, float texts
  const itemsRef = useRef<FallingItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatTextsRef = useRef<FloatingText[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const sequenceRef = useRef(0);
  const stageClockRef = useRef(0);
  const warningRef = useRef<{x:number;until:number} | null>(null);
  const nextItemIdRef = useRef<number>(1);
  const nextTextIdRef = useRef<number>(1);

  // Screen shake
  const screenShakeRef = useRef<number>(0);

  // Theme change banner notification
  const prevThemeRef = useRef<BackgroundTheme>(currentTheme);
  const themeBannerRef = useRef<{ title: string; subtitle: string; icon: string; timer: number } | null>(null);

  // Combo display pop animation
  const prevComboRef = useRef<number>(combo);
  const comboPopRef = useRef<number>(1);

  // Detect theme change and trigger smooth banner
  useEffect(() => {
    if (prevThemeRef.current !== currentTheme) {
      const conf = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.day;
      themeBannerRef.current = {
        title: conf.name,
        subtitle: conf.subname,
        icon: conf.icon,
        timer: 3.5, // 3.5s display
      };
      prevThemeRef.current = currentTheme;
      eatAudio.playPowerUp();
    }
  }, [currentTheme]);

  // Detect combo increase and trigger punchy pop scale
  useEffect(() => {
    if (combo > prevComboRef.current) {
      comboPopRef.current = 1.35;
    }
    prevComboRef.current = combo;
  }, [combo]);

  // Sync mute
  useEffect(() => {
    eatAudio.setMuted(isMuted);
  }, [isMuted]);

  // Handle canvas resize
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      // Dynamically scale player radius for crisp, larger visibility (42px - 48px)
      const dynamicRadius = Math.max(42, Math.min(48, Math.round(width * 0.09)));
      playerRef.current.radius = dynamicRadius;

      // Position character significantly higher up (elevated by 125-150px from bottom)
      // This leaves ample room for the player's thumb / finger without blocking the character
      const bottomClearance = Math.max(65, Math.min(100, Math.round(height * 0.20)));
      playerRef.current.y = height - bottomClearance;

      if (playerRef.current.x > width || playerRef.current.x === 200) {
        playerRef.current.x = width / 2;
        playerRef.current.targetX = width / 2;
      }
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { window.removeEventListener('resize', resizeCanvas); observer.disconnect(); };
  }, [resizeCanvas]);

  // Touch & Pointer input (Smooth horizontal tracking, finger doesn't block character)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    playerRef.current.isTouching = true;
    playerRef.current.targetX = Math.max(
      playerRef.current.radius + 12,
      Math.min(canvas.width - playerRef.current.radius - 12, clientX)
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    playerRef.current.isTouching = true;
    handlePointerMove(e);
  };

  const handlePointerUp = () => {
    playerRef.current.isTouching = false;
  };

  const handlePointerLeave = () => {
    playerRef.current.isTouching = false;
  };

  // Keyboard controls
  useEffect(() => {
    const keysDown = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isGameOver || e.repeat) return;
      keysDown.add(e.code);

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        onSwitchMode();
        eatAudio.playSwitch();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(() => {
      if (isPaused || isGameOver) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const baseSpeed = activePowerUps.speedTimer > 0 ? 28 : 16;
      if (keysDown.has('ArrowLeft') || keysDown.has('KeyA')) {
        playerRef.current.targetX = Math.max(
          playerRef.current.radius + 10,
          playerRef.current.targetX - baseSpeed
        );
      }
      if (keysDown.has('ArrowRight') || keysDown.has('KeyD')) {
        playerRef.current.targetX = Math.min(
          canvas.width - playerRef.current.radius - 10,
          playerRef.current.targetX + baseSpeed
        );
      }
    }, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, [isPaused, isGameOver, onSwitchMode, activePowerUps.speedTimer > 0]);

  // Spawn an item (with Power-up chance)
  const spawnItem = (canvasWidth: number) => {
    const { campaignStage, remainingTargets, stageElapsed, speedMultiplier, powerUpChance, bombChance, poisonChance } = liveRef.current;
    const margin = 50;
    let spawnX = margin + Math.random() * (canvasWidth - margin * 2);

    let chosenType: ItemType = 'ice';
    const rand = Math.random();

    // Check Power-Up spawn chance
    const isPowerUpRoll = Math.random() < powerUpChance;
    if (isPowerUpRoll) {
      const pRoll = Math.random();
      if (pRoll < 0.28) {
        chosenType = 'power_shield';
      } else if (pRoll < 0.54) {
        chosenType = 'power_magnet';
      } else if (pRoll < 0.78) {
        chosenType = 'power_speed';
      } else {
        chosenType = 'power_slowmo';
      }
    } else if (rand < bombChance) {
      chosenType = 'bomb';
    } else if (rand < bombChance + poisonChance) {
      chosenType = 'poison';
    } else {
      const goodRoll = Math.random();
      if (goodRoll < 0.38) {
        chosenType = 'ice';
      } else if (goodRoll < 0.76) {
        chosenType = 'fire';
      } else if (goodRoll < 0.88) {
        chosenType = 'star';
      } else if (goodRoll < 0.94) {
        chosenType = 'gem';
      } else if (goodRoll < 0.98) {
        chosenType = 'fury_pill';
      } else {
        chosenType = 'heart';
      }
    }

    let drift = (Math.random() - 0.5) * 0.8;
    let baseVy = (2.6 + Math.random() * 1.8) * speedMultiplier;
    if (campaignStage) {
      const counts = Object.fromEntries(Object.entries(campaignStage.targetItems).map(([k,n]) => [k, (n || 0) - (remainingTargets?.[k as ItemType] || 0)]));
      const plan = planDrop(campaignStage, sequenceRef.current++, counts, stageElapsed);
      chosenType = plan.type;
      spawnX = margin + (canvasWidth - margin * 2) * plan.lane / 4;
      drift = plan.drift;
      // Keep flight readable on short mobile boards as well as desktop.
      baseVy = Math.max(1.1, ((canvasRef.current?.height || 500) - 100) / (3.1 * 60)) * plan.speed;
    }
    if (chosenType === 'bomb' || chosenType === 'poison') warningRef.current = { x: spawnX, until: stageClockRef.current + 1.2 };

    const newItem: FallingItem = {
      id: nextItemIdRef.current++,
      x: spawnX,
      y: -35,
      vx: drift,
      vy: baseVy,
      radius:
        chosenType === 'bomb'
          ? 24
          : chosenType.startsWith('power_')
          ? 22
          : chosenType === 'gem'
          ? 22
          : 20,
      type: chosenType,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.06,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.04 + Math.random() * 0.03,
      scale: 1,
      isEaten: false,
      alpha: 1,
    };

    itemsRef.current.push(newItem);
  };

  // Add floating text
  const addFloatText = (x: number, y: number, text: string, color: string, bold: boolean = false) => {
    floatTextsRef.current.push({
      id: nextTextIdRef.current++,
      x,
      y,
      vy: -1.6,
      text,
      color,
      alpha: 1,
      scale: bold ? 1.3 : 1,
      bold,
    });
  };

  // Add particle burst
  const addParticles = (
    x: number,
    y: number,
    color: string,
    count: number = 12,
    speed: number = 4
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.8 + 0.2) * speed;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1,
        color,
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: 20 + Math.random() * 20,
        alpha: 1,
        shape: Math.random() > 0.6 ? 'spark' : 'circle',
      });
    }
  };

  // Trigger screen shake
  const triggerShake = (intensity: number = 8) => {
    screenShakeRef.current = intensity;
  };

  // Main game loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      const {playerMode, isPaused, isGameOver, furyActive, speedMultiplier, spawnIntervalMs, bombChance, poisonChance, powerUpChance, combo, comboMultiplier, comboDecayRatio, activePowerUps, currentTheme, onEatItem, onHitHazard, onCollectPowerUp, onConsumeShield, campaignStage, remainingTargets, stageElapsed, skinId} = liveRef.current;
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Update screen shake
      if (screenShakeRef.current > 0) {
        screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
      }
      const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
      const shakeY = (Math.random() - 0.5) * screenShakeRef.current;

      // Decay combo pop scale
      if (comboPopRef.current > 1) {
        comboPopRef.current = Math.max(1, comboPopRef.current - dt * 2.5);
      }

      // Update theme banner timer
      if (themeBannerRef.current) {
        themeBannerRef.current.timer -= dt;
        if (themeBannerRef.current.timer <= 0) {
          themeBannerRef.current = null;
        }
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // ==========================================
      // DYNAMIC BACKGROUND RENDERING (THEMES)
      // ==========================================
      ctx.clearRect(0, 0, width, height);

      const theme = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.day;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);

      if (furyActive) {
        // Elemental Fury special fiery backdrop
        bgGrad.addColorStop(0, '#2d1400');
        bgGrad.addColorStop(0.5, '#1e0800');
        bgGrad.addColorStop(1, '#0c0200');
      } else {
        bgGrad.addColorStop(0, theme.topGradient);
        bgGrad.addColorStop(0.5, theme.midGradient);
        bgGrad.addColorStop(1, theme.botGradient);
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Theme-specific background scenery details
      if (!furyActive) {
        switch (currentTheme) {
          case 'day': {
            // Sun Halo in top-right
            const sunX = width - 70;
            const sunY = 70;
            const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 140);
            sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
            sunGlow.addColorStop(0.4, 'rgba(253, 224, 71, 0.15)');
            sunGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
            ctx.fill();

            // Drifting Fluffy Morning Clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            for (let c = 0; c < 3; c++) {
              const cx = ((c * 240 + currentTime * 0.015) % (width + 200)) - 100;
              const cy = 60 + c * 45;
              ctx.beginPath();
              ctx.arc(cx, cy, 26, 0, Math.PI * 2);
              ctx.arc(cx + 20, cy - 8, 32, 0, Math.PI * 2);
              ctx.arc(cx + 46, cy, 24, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          }

          case 'sunset': {
            // Twilight Setting Sun at Horizon
            const sunY = height * 0.72;
            const sunsetGlow = ctx.createRadialGradient(width / 2, sunY, 10, width / 2, sunY, 180);
            sunsetGlow.addColorStop(0, 'rgba(251, 146, 60, 0.4)');
            sunsetGlow.addColorStop(0.5, 'rgba(244, 63, 94, 0.2)');
            sunsetGlow.addColorStop(1, 'rgba(244, 63, 94, 0)');
            ctx.fillStyle = sunsetGlow;
            ctx.beginPath();
            ctx.arc(width / 2, sunY, 180, 0, Math.PI * 2);
            ctx.fill();

            // Mountain Ridge Silhouette at Bottom
            ctx.fillStyle = 'rgba(15, 6, 23, 0.55)';
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(0, height - 80);
            ctx.lineTo(width * 0.25, height - 120);
            ctx.lineTo(width * 0.55, height - 70);
            ctx.lineTo(width * 0.8, height - 130);
            ctx.lineTo(width, height - 90);
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();

            // Bioluminescent fireflies floating upwards
            ctx.fillStyle = 'rgba(253, 224, 71, 0.65)';
            for (let f = 0; f < 12; f++) {
              const fx = (f * 59 + Math.sin(currentTime * 0.002 + f) * 20) % width;
              const fy = height - ((currentTime * 0.02 + f * 47) % height);
              ctx.beginPath();
              ctx.arc(fx, fy, (f % 2) + 1.2, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          }

          case 'night': {
            // Twinkling Star Constellations
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            for (let s = 0; s < 25; s++) {
              const sx = (s * 83 + 37) % width;
              const sy = (s * 47 + 23) % (height * 0.7);
              const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(currentTime * 0.003 + s));
              ctx.globalAlpha = twinkle;
              ctx.beginPath();
              ctx.arc(sx, sy, (s % 3) * 0.7 + 0.8, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.globalAlpha = 1;

            // Aurora Borealis Waving Curtain
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 40);
            for (let x = 0; x <= width; x += 30) {
              const y = 50 + Math.sin(x * 0.015 + currentTime * 0.001) * 25;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(width, 0);
            ctx.lineTo(0, 0);
            ctx.closePath();
            const auroraGrad = ctx.createLinearGradient(0, 0, 0, 100);
            auroraGrad.addColorStop(0, 'rgba(52, 211, 153, 0.22)');
            auroraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = auroraGrad;
            ctx.fill();
            ctx.restore();
            break;
          }

          case 'space': {
            // Nebula spiral clouds
            const neb1 = ctx.createRadialGradient(width * 0.3, height * 0.35, 10, width * 0.3, height * 0.35, 140);
            neb1.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
            neb1.addColorStop(0.6, 'rgba(147, 51, 234, 0.1)');
            neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = neb1;
            ctx.beginPath();
            ctx.arc(width * 0.3, height * 0.35, 140, 0, Math.PI * 2);
            ctx.fill();

            const neb2 = ctx.createRadialGradient(width * 0.75, height * 0.6, 10, width * 0.75, height * 0.6, 160);
            neb2.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
            neb2.addColorStop(0.7, 'rgba(14, 116, 144, 0.08)');
            neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = neb2;
            ctx.beginPath();
            ctx.arc(width * 0.75, height * 0.6, 160, 0, Math.PI * 2);
            ctx.fill();

            // Cosmic stardust drifting diagonally
            ctx.fillStyle = '#ffffff';
            for (let s = 0; s < 30; s++) {
              const sx = (s * 67 + currentTime * 0.03) % width;
              const sy = (s * 97 + currentTime * 0.05) % height;
              ctx.beginPath();
              ctx.arc(sx, sy, (s % 3) * 0.6 + 0.8, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          }

          case 'solar': {
            // Solar flare corona ring
            const solarPulse = 1 + 0.08 * Math.sin(currentTime * 0.005);
            const solarGrad = ctx.createRadialGradient(width / 2, 40, 20, width / 2, 40, 160 * solarPulse);
            solarGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
            solarGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.2)');
            solarGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = solarGrad;
            ctx.beginPath();
            ctx.arc(width / 2, 40, 160 * solarPulse, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
        }
      }

      // Frost Vignette Overlay if Slow-Mo is Active
      if (activePowerUps.slowmoTimer > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, width - 6, height - 6);

        // Falling slow snowflakes
        ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
        for (let i = 0; i < 15; i++) {
          const fx = ((i * 79 + currentTime * 0.02) % width);
          const fy = ((i * 103 + currentTime * 0.03) % height);
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ==========================================
      // GAMEPLAY LOGIC & ITEM UPDATES
      // ==========================================
      if (!isPaused && !isGameOver) {
        // Player smooth lerp towards target
        const player = playerRef.current;
        const lerpFactor = activePowerUps.speedTimer > 0 ? 0.35 : 0.22;
        player.x += (player.targetX - player.x) * lerpFactor;
        player.bob += 0.08;

        // Player speed ghost trail recording (Always enabled for Neon Trails skin)
        const isNeonTrail = skinId === 'skin-eat-em-all-neon';
        const shouldRecordTrail = activePowerUps.speedTimer > 0 || isNeonTrail;
        if (shouldRecordTrail) {
          player.ghostHistory.push({ x: player.x, y: player.y, alpha: isNeonTrail ? 0.85 : 0.5 });
          const maxGhosts = isNeonTrail ? 10 : 5;
          if (player.ghostHistory.length > maxGhosts) {
            player.ghostHistory.shift();
          }
        } else {
          player.ghostHistory = [];
        }

        // Blinking logic
        player.blinkTimer--;
        if (player.blinkTimer <= 0) {
          player.isBlinking = true;
          if (player.blinkTimer <= -8) {
            player.isBlinking = false;
            player.blinkTimer = 120 + Math.random() * 150;
          }
        }

        // Chewing animation
        if (player.chewTimer > 0) {
          player.chewTimer -= dt;
          player.mouthOpen = Math.sin(player.chewTimer * Math.PI * 12) * 0.5 + 0.5;
        } else {
          // Detect nearest falling edible item above player
          let nearestDist = 999;
          let nearestY = 0;
          let nearestX = 0;

          for (const it of itemsRef.current) {
            const dy = (player.y - 40) - it.y;
            const dx = it.x - player.x;
            if (dy > 0 && dy < 180 && Math.abs(dx) < 60) {
              const d = Math.hypot(dx, dy);
              if (d < nearestDist) {
                nearestDist = d;
                nearestY = dy;
                nearestX = dx;
              }
            }
          }

          if (nearestDist < 160) {
            player.mouthOpen = Math.min(1, (160 - nearestDist) / 100);
            player.eyeLookX = Math.max(-1, Math.min(1, nearestX / 50));
            player.eyeLookY = -1;
          } else {
            player.mouthOpen = Math.max(0, player.mouthOpen - dt * 4);
            player.eyeLookX = 0;
            player.eyeLookY = -0.5;
          }
        }

        stageClockRef.current += dt;
        // Active time prevents a burst or timer jump after pausing.
        // Spawning logic
        const adjustedInterval = activePowerUps.slowmoTimer > 0 ? spawnIntervalMs * 1.5 : spawnIntervalMs;
        if (stageClockRef.current * 1000 - lastSpawnRef.current > adjustedInterval) {
          spawnItem(width);
          lastSpawnRef.current = stageClockRef.current * 1000;
        }

        // Update items (Fall, wobble, Magnet Vacuum Pull)
        const effectiveSpeed = activePowerUps.slowmoTimer > 0 ? 0.45 : 1.0;
        const py = player.y + Math.sin(player.bob) * 4;
        const px = player.x;

        for (let i = itemsRef.current.length - 1; i >= 0; i--) {
          const it = itemsRef.current[i];

          // Check Magnet (Item Vacuum) Effect
          if (activePowerUps.magnetTimer > 0) {
            const isEdible =
              furyActive ||
              it.type.startsWith('power_') ||
              it.type === 'star' ||
              it.type === 'gem' ||
              it.type === 'heart' ||
              it.type === 'fury_pill' ||
              (it.type === 'ice' && playerMode === 'ice') ||
              (it.type === 'fire' && playerMode === 'fire');

            if (isEdible) {
              const dx = px - it.x;
              const dy = py - it.y;
              const dist = Math.max(0.01, Math.hypot(dx, dy));
              if (dist < 260 && it.y < py + 20) {
                const pullPower = (1 - dist / 260) * 8 + 3.5;
                it.x += (dx / dist) * pullPower;
                it.y += (dy / dist) * pullPower;

                // Draw magnetic flux particles
                if (Math.random() < 0.25) {
                  particlesRef.current.push({
                    x: it.x,
                    y: it.y,
                    vx: (dx / dist) * 2,
                    vy: (dy / dist) * 2,
                    color: '#c084fc',
                    size: 2.5,
                    life: 0,
                    maxLife: 15,
                    alpha: 0.8,
                    shape: 'spark',
                  });
                }
              }
            }
          }

          const frame = dt * 60;
          it.y += it.vy * effectiveSpeed * frame;
          it.wobble += it.wobbleSpeed * frame;
          it.x = Math.max(35, Math.min(width - 35, it.x + (it.vx + Math.sin(it.wobble) * 0.25) * frame));
          it.rotation += it.rotSpeed;

          // Catching collision radius
          const dx = it.x - px;
          const dy = it.y - py;
          const dist = Math.hypot(dx, dy);
          const catchRadius = player.radius * 0.55 + it.radius * 0.65;

          if (!it.isEaten && dist < catchRadius && it.y >= py - 30) {
            it.isEaten = true;
            player.chewTimer = 0.25;

            // Check if Power-Up item
            if (it.type.startsWith('power_')) {
              eatAudio.playPowerUp();
              const pType = it.type.replace('power_', '') as PowerUpType;

              let pText = 'BỔ TRỢ!';
              let pColor = '#38bdf8';
              if (pType === 'shield') {
                pText = '🛡️ KHIÊN BẢO VỆ!';
                pColor = '#06b6d4';
              } else if (pType === 'magnet') {
                pText = '🧲 NAM CHÂM HÚT (8s)!';
                pColor = '#a855f7';
              } else if (pType === 'speed') {
                pText = '⚡ SIÊU TĂNG TỐC (8s)!';
                pColor = '#eab308';
              } else if (pType === 'slowmo') {
                pText = '❄️ ĐÓNG BĂNG THỜI GIAN (6s)!';
                pColor = '#38bdf8';
              }

              addParticles(it.x, it.y, pColor, 20, 5.5);
              addFloatText(px, py - 40, pText, pColor, true);
              onCollectPowerUp(pType);
            } else {
              // Food or Hazard
              let isHazard = false;
              if (furyActive) {
                isHazard = false;
              } else if (it.type === 'bomb' || it.type === 'poison') {
                isHazard = true;
              } else if (it.type === 'ice' && playerMode === 'fire') {
                isHazard = true;
              } else if (it.type === 'fire' && playerMode === 'ice') {
                isHazard = true;
              }

              if (isHazard) {
                // If Shield is active, shield absorbs damage and preserves combo!
                if (activePowerUps.shield) {
                  triggerShake(5);
                  eatAudio.playShieldBlock();
                  addParticles(it.x, it.y, '#06b6d4', 22, 6);
                  addFloatText(px, py - 40, '🛡️ KHIÊN CHẶN ĐÒN!', '#22d3ee', true);
                  onConsumeShield();
                } else {
                  // Hurt!
                  triggerShake(12);
                  eatAudio.playBomb();
                  addParticles(it.x, it.y, '#ef4444', 20, 6);
                  addFloatText(px, py - 40, '💥 -1 ❤️', '#f43f5e', true);
                  onHitHazard(it);
                }
              } else {
                // Successfully eaten!
                const isSuper = it.type === 'gem' || furyActive;
                eatAudio.playMunch(isSuper);

                let splashColor = '#38bdf8';
                let text = '+20';
                let textColor = '#38bdf8';

                if (furyActive) {
                  splashColor = '#fbbf24';
                  text = 'FURY ×5!';
                  textColor = '#fbbf24';
                } else if (it.type === 'fire') {
                  splashColor = '#f97316';
                  textColor = '#fb923c';
                  text = '+20';
                } else if (it.type === 'star') {
                  splashColor = '#eab308';
                  textColor = '#fde047';
                  text = '+50 ⭐';
                } else if (it.type === 'gem') {
                  splashColor = '#34d399';
                  textColor = '#6ee7b7';
                  text = '+100 💎';
                } else if (it.type === 'heart') {
                  splashColor = '#f43f5e';
                  textColor = '#fda4af';
                  text = '+1 ❤️';
                } else if (it.type === 'fury_pill') {
                  splashColor = '#a855f7';
                  textColor = '#d8b4fe';
                  text = '⚡ FURY +35%';
                }

                // Append multiplier text if combo > 1
                if (comboMultiplier > 1 && !furyActive) {
                  text += ` (x${comboMultiplier})`;
                }

                addParticles(it.x, it.y, splashColor, 15, 4.5);
                addFloatText(px, py - 40, text, textColor, isSuper || comboMultiplier >= 3);
                onEatItem(it);
              }
            }
          }

          // Remove items off-screen or eaten
          if (it.y > height + 50 || it.isEaten) {
            itemsRef.current.splice(i, 1);
          }
        }

        // Update particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12;
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          if (p.life >= p.maxLife) {
            particlesRef.current.splice(i, 1);
          }
        }

        // Update floating texts
        for (let i = floatTextsRef.current.length - 1; i >= 0; i--) {
          const ft = floatTextsRef.current[i];
          ft.y += ft.vy;
          ft.alpha -= dt * 1.4;
          if (ft.alpha <= 0) {
            floatTextsRef.current.splice(i, 1);
          }
        }
      }

      // ==========================================
      // DRAW FALLING ITEMS
      // ==========================================
      for (const it of itemsRef.current) {
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rotation);

        const r = it.radius;

        switch (it.type) {
          case 'ice': {
            const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 1.4);
            glow.addColorStop(0, '#ffffff');
            glow.addColorStop(0.5, '#38bdf8');
            glow.addColorStop(1, 'rgba(14, 165, 233, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
            ctx.fill();

            const sphere = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
            sphere.addColorStop(0, '#e0f2fe');
            sphere.addColorStop(0.7, '#0284c7');
            sphere.addColorStop(1, '#0369a1');
            ctx.fillStyle = sphere;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            for (let a = 0; a < 6; a++) {
              const ang = (a * Math.PI) / 3;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(Math.cos(ang) * (r * 0.8), Math.sin(ang) * (r * 0.8));
              ctx.stroke();
            }
            break;
          }

          case 'fire': {
            const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 1.4);
            glow.addColorStop(0, '#fef08a');
            glow.addColorStop(0.5, '#f97316');
            glow.addColorStop(1, 'rgba(234, 88, 12, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
            ctx.fill();

            const sphere = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
            sphere.addColorStop(0, '#fff7ed');
            sphere.addColorStop(0.5, '#ea580c');
            sphere.addColorStop(1, '#9a3412');
            ctx.fillStyle = sphere;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fef08a';
            ctx.font = `${r * 1.1}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '🔥', 0, 0);
            break;
          }

          case 'star': {
            ctx.fillStyle = '#facc15';
            ctx.shadowColor = '#fde047';
            ctx.shadowBlur = 15;
            ctx.font = `${r * 1.6}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '⭐', 0, 0);
            ctx.shadowBlur = 0;
            break;
          }

          case 'gem': {
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#34d399';
            ctx.shadowBlur = 18;
            ctx.font = `${r * 1.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '💎', 0, 0);
            ctx.shadowBlur = 0;
            break;
          }

          case 'heart': {
            ctx.fillStyle = '#f43f5e';
            ctx.shadowColor = '#fb7185';
            ctx.shadowBlur = 16;
            ctx.font = `${r * 1.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '❤️', 0, 0);
            ctx.shadowBlur = 0;
            break;
          }

          case 'bomb': {
            const bGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 1.4);
            bGlow.addColorStop(0, '#ef4444');
            bGlow.addColorStop(0.6, 'rgba(153, 27, 27, 0.4)');
            bGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = bGlow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#18181b';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(0, -r, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = `${r * 1.1}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '💣', 0, 1);
            break;
          }

          case 'poison': {
            ctx.font = `${r * 1.5}px sans-serif`;
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 15;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '☠️', 0, 0);
            ctx.shadowBlur = 0;
            break;
          }

          case 'fury_pill': {
            ctx.font = `${r * 1.5}px sans-serif`;
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 18;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '⚡', 0, 0);
            ctx.shadowBlur = 0;
            break;
          }

          // POWER-UP: Shield
          case 'power_shield': {
            const shGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 1.5);
            shGlow.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
            shGlow.addColorStop(0.6, 'rgba(14, 116, 144, 0.4)');
            shGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
            ctx.fillStyle = shGlow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Orb outline ring
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.font = `${r * 1.25}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '🛡️', 0, 0);
            break;
          }

          // POWER-UP: Magnet
          case 'power_magnet': {
            const mgGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 1.5);
            mgGlow.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
            mgGlow.addColorStop(0.6, 'rgba(126, 34, 206, 0.4)');
            mgGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
            ctx.fillStyle = mgGlow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.font = `${r * 1.25}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '🧲', 0, 0);
            break;
          }

          // POWER-UP: Speed Boost
          case 'power_speed': {
            const spGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 1.5);
            spGlow.addColorStop(0, 'rgba(234, 179, 8, 0.9)');
            spGlow.addColorStop(0.6, 'rgba(161, 98, 7, 0.4)');
            spGlow.addColorStop(1, 'rgba(234, 179, 8, 0)');
            ctx.fillStyle = spGlow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.font = `${r * 1.3}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '⚡', 0, 0);
            break;
          }

          // POWER-UP: Slow-Mo
          case 'power_slowmo': {
            const slGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 1.5);
            slGlow.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
            slGlow.addColorStop(0.6, 'rgba(3, 105, 161, 0.4)');
            slGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = slGlow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#7dd3fc';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.font = `${r * 1.25}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            readableCanvasText(ctx, '❄️', 0, 0);
            break;
          }
        }

        ctx.restore();
      }

      // ==========================================
      // DRAW PLAYER CHARACTER & POWER-UP AURAS
      // ==========================================
      const p = playerRef.current;
      const px = p.x;
      const py = p.y + Math.sin(p.bob) * 4;
      const r = p.radius;

      // Draw Ghost After-Images & Dynamic Trails
      const isNeonTrail = skinId === 'skin-eat-em-all-neon';
      const isDragonSkin = skinId === 'skin-eat-em-all-dragon';
      const isCyberSkin = skinId === 'skin-eat-em-all-cyber';

      if (isNeonTrail && p.ghostHistory.length > 1) {
        // Draw Connected Neon Laser Ribbon
        ctx.save();
        ctx.beginPath();
        for (let gi = 0; gi < p.ghostHistory.length; gi++) {
          const gh = p.ghostHistory[gi];
          if (gi === 0) ctx.moveTo(gh.x, gh.y);
          else ctx.lineTo(gh.x, gh.y);
        }
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Neon Glow Orbs along Trail
        for (let gi = 0; gi < p.ghostHistory.length; gi++) {
          const gh = p.ghostHistory[gi];
          const gAlpha = (gi + 1) / p.ghostHistory.length;
          const orbR = (r * 0.35) * gAlpha;
          ctx.fillStyle = gi % 2 === 0 ? `rgba(6, 182, 212, ${gAlpha * 0.7})` : `rgba(236, 72, 153, ${gAlpha * 0.7})`;
          ctx.shadowColor = gi % 2 === 0 ? '#06b6d4' : '#ec4899';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(gh.x, gh.y, orbR, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (activePowerUps.speedTimer > 0 && p.ghostHistory.length > 0) {
        for (let gi = 0; gi < p.ghostHistory.length; gi++) {
          const gh = p.ghostHistory[gi];
          const gAlpha = (gi + 1) / (p.ghostHistory.length * 3);
          ctx.save();
          ctx.translate(gh.x, gh.y);
          ctx.globalAlpha = gAlpha;
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ==========================================
      // TOUCH CONTROL GUIDANCE LANE & TRACK
      // ==========================================
      const touchLaneY = height - 42;
      ctx.save();
      // Subtle dashed tracking lane
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(30, touchLaneY);
      ctx.lineTo(width - 30, touchLaneY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Subtle touch zone prompt text
      ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.textAlign = 'center';
      readableCanvasText(ctx, '◄  CHẠM & KÉO TẠI ĐÂY ĐỂ DI CHUYỂN  ►', width / 2, touchLaneY + 16);

      // Interactive thumb tracking glow dot when touching
      if (p.isTouching) {
        ctx.fillStyle = furyActive ? 'rgba(251, 191, 36, 0.4)' : playerMode === 'ice' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(249, 115, 22, 0.35)';
        ctx.beginPath();
        ctx.arc(px, touchLaneY, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, touchLaneY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Vertical laser alignment guideline from thumb to character
        ctx.strokeStyle = furyActive ? 'rgba(251, 191, 36, 0.25)' : playerMode === 'ice' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(249, 115, 22, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py + r + 8);
        ctx.lineTo(px, touchLaneY - 8);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      ctx.save();
      ctx.translate(px, py);

      // Expanding Magnetic Wave Rings
      if (activePowerUps.magnetTimer > 0) {
        const ringRadius = r + ((currentTime * 0.08) % 60);
        const ringAlpha = Math.max(0, 1 - ringRadius / (r * 2.5));
        ctx.strokeStyle = `rgba(192, 132, 252, ${ringAlpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Player Aura Glow
      const aura = ctx.createRadialGradient(0, 0, r * 0.75, 0, 0, r * 1.8);
      if (furyActive) {
        aura.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
        aura.addColorStop(0.5, 'rgba(245, 158, 11, 0.5)');
        aura.addColorStop(1, 'rgba(217, 119, 6, 0)');
      } else if (playerMode === 'ice') {
        aura.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
        aura.addColorStop(0.6, 'rgba(14, 165, 233, 0.35)');
        aura.addColorStop(1, 'rgba(2, 132, 199, 0)');
      } else {
        aura.addColorStop(0, 'rgba(249, 115, 22, 0.75)');
        aura.addColorStop(0.6, 'rgba(234, 88, 12, 0.35)');
        aura.addColorStop(1, 'rgba(194, 65, 12, 0)');
      }
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Main Player Body Blob
      const bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 4, 0, 0, r);
      if (furyActive) {
        bodyGrad.addColorStop(0, '#fffbeb');
        bodyGrad.addColorStop(0.4, '#fbbf24');
        bodyGrad.addColorStop(1, '#b45309');
      } else if (playerMode === 'ice') {
        bodyGrad.addColorStop(0, '#f0f9ff');
        bodyGrad.addColorStop(0.35, '#38bdf8');
        bodyGrad.addColorStop(1, '#0369a1');
      } else {
        bodyGrad.addColorStop(0, '#fff7ed');
        bodyGrad.addColorStop(0.35, '#f97316');
        bodyGrad.addColorStop(1, '#9a3412');
      }

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Body rim stroke
      ctx.strokeStyle = furyActive ? '#fef08a' : playerMode === 'ice' ? '#bae6fd' : '#fed7aa';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Eyes (Proportionally scaled with r)
      const eyeOffsetX = r * 0.32;
      const eyeOffsetY = -r * 0.2;
      const eyeR = r * 0.17;

      const drawEye = (ex: number, ey: number) => {
        if (p.isBlinking) {
          ctx.strokeStyle = '#18181b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(ex - eyeR, ey);
          ctx.lineTo(ex + eyeR, ey);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex, ey, eyeR, 0, Math.PI * 2);
          ctx.fill();

          const pupilX = ex + p.eyeLookX * (eyeR * 0.45);
          const pupilY = ey + p.eyeLookY * (eyeR * 0.45);
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(pupilX, pupilY, eyeR * 0.55, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pupilX - eyeR * 0.18, pupilY - eyeR * 0.18, eyeR * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      drawEye(-eyeOffsetX, eyeOffsetY);
      drawEye(eyeOffsetX, eyeOffsetY);

      // Mouth (Scaled with r and mouthOpen)
      const mouthY = r * 0.26;
      const openAmount = p.mouthOpen;

      if (openAmount > 0.08) {
        const mouthW = r * 0.42 + openAmount * (r * 0.28);
        const mouthH = r * 0.18 + openAmount * (r * 0.48);

        ctx.fillStyle = '#3f1118';
        ctx.beginPath();
        ctx.ellipse(0, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#22080c';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(0, mouthY + mouthH * 0.45, mouthW * 0.65, mouthH * 0.45, 0, 0, Math.PI);
        ctx.fill();

        // Cute Little Top Tooth
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-r * 0.08, mouthY - mouthH * 0.7);
        ctx.lineTo(r * 0.08, mouthY - mouthH * 0.7);
        ctx.lineTo(0, mouthY - mouthH * 0.25);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, mouthY - 2, r * 0.2, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      // Rosy cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.54, eyeOffsetY + r * 0.26, r * 0.13, r * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(r * 0.54, eyeOffsetY + r * 0.26, r * 0.13, r * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top elemental indicator & Custom Skin Headpieces
      ctx.font = `${Math.round(r * 0.45)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (furyActive) {
        readableCanvasText(ctx, '⚡', 0, -r - 12);
      } else if (playerMode === 'ice') {
        readableCanvasText(ctx, '❄️', 0, -r - 12);
      } else {
        readableCanvasText(ctx, '🔥', 0, -r - 12);
      }

      // Skin Headpieces & Decorations
      if (isDragonSkin) {
        // Imperial Dragon Golden Horns & Ruby Gem
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        // Left horn
        ctx.moveTo(-r * 0.5, -r * 0.7);
        ctx.quadraticCurveTo(-r * 0.75, -r * 1.3, -r * 0.9, -r * 1.5);
        ctx.quadraticCurveTo(-r * 0.55, -r * 1.2, -r * 0.35, -r * 0.8);
        ctx.fill();
        // Right horn
        ctx.beginPath();
        ctx.moveTo(r * 0.5, -r * 0.7);
        ctx.quadraticCurveTo(r * 0.75, -r * 1.3, r * 0.9, -r * 1.5);
        ctx.quadraticCurveTo(r * 0.55, -r * 1.2, r * 0.35, -r * 0.8);
        ctx.fill();
        // Ruby Gem on forehead
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.6, r * 0.14, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (isCyberSkin) {
        // Cyber Hologram Visor
        ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(-r * 0.6, eyeOffsetY - r * 0.12, r * 1.2, r * 0.38, 4);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (isNeonTrail) {
        // Neon Cyber Halo Ring
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.88, r * 0.5, r * 0.14, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Forcefield Bubble Shield (If Active)
      if (activePowerUps.shield) {
        const shieldPulse = 1 + 0.05 * Math.sin(currentTime * 0.008);
        const shieldR = r * 1.4 * shieldPulse;

        ctx.save();
        const shBubble = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, shieldR);
        shBubble.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
        shBubble.addColorStop(0.85, 'rgba(34, 211, 238, 0.35)');
        shBubble.addColorStop(1, 'rgba(6, 182, 212, 0.75)');
        ctx.fillStyle = shBubble;
        ctx.beginPath();
        ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Orbiting shield nodes
        const rotAngle = currentTime * 0.003;
        for (let i = 0; i < 3; i++) {
          const a = rotAngle + (i * Math.PI * 2) / 3;
          const sx = Math.cos(a) * shieldR;
          const sy = Math.sin(a) * shieldR;
          ctx.fillStyle = '#67e8f9';
          ctx.beginPath();
          ctx.arc(sx, sy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();

      // ==========================================
      // DRAW PARTICLES & FLOATING TEXTS
      // ==========================================
      for (const pt of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const ft of floatTextsRef.current) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = `${ft.bold ? 'bold 18px' : 'bold 14px'} "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        readableCanvasText(ctx, ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // ==========================================
      // VISUAL COMBO METER HUD (ON CANVAS)
      // ==========================================
      if (combo > 1 && !isGameOver) {
        const tier = getComboTier(combo);
        const comboScale = comboPopRef.current;
        const barWidth = 140;
        const meterX = width / 2;
        const meterY = 28;

        ctx.save();
        ctx.translate(meterX, meterY);
        ctx.scale(comboScale, comboScale);

        // Combo badge container
        ctx.fillStyle = 'rgba(15, 15, 26, 0.85)';
        ctx.strokeStyle = tier.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-barWidth / 2 - 10, -18, barWidth + 20, 42, 12);
        ctx.fill();
        ctx.stroke();

        // Combo text with glowing shadow
        ctx.font = 'black 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = tier.color;
        ctx.shadowBlur = 10;
        readableCanvasText(ctx, `COMBO x${combo}`, 0, -4);
        ctx.shadowBlur = 0;

        // Multiplier & Tier icon tag
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = tier.color;
        readableCanvasText(ctx, `${tier.icon} ${tier.name} (x${comboMultiplier})`, 0, 12);

        // Combo decay bar
        const fillW = Math.max(0, barWidth * comboDecayRatio);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(-barWidth / 2, 17, barWidth, 3);

        ctx.fillStyle = tier.color;
        ctx.shadowColor = tier.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(-barWidth / 2, 17, fillW, 3);
        ctx.shadowBlur = 0;

        ctx.restore();
      }

      // ==========================================
      // DYNAMIC THEME TRANSITION BANNER
      // ==========================================
      if (themeBannerRef.current) {
        const banner = themeBannerRef.current;
        const bannerAlpha = Math.min(1, banner.timer * 1.5);
        ctx.save();
        ctx.globalAlpha = bannerAlpha;
        ctx.translate(width / 2, 85);

        // Backdrop pill
        ctx.fillStyle = 'rgba(10, 10, 18, 0.92)';
        ctx.strokeStyle = theme.accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-160, -22, 320, 44, 14);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = theme.accentColor;
        readableCanvasText(ctx, `${banner.icon} ${banner.title.toUpperCase()}`, 0, -5);

        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        readableCanvasText(ctx, banner.subtitle, 0, 12);
        ctx.restore();
      }

      // ==========================================
      // FURY MODE AMBIENT BORDER & BANNER
      // ==========================================
      if (furyActive) {
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, width, height);

        ctx.font = 'black 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 15;
        readableCanvasText(ctx, '🔥 FURY ×5 · NUỐT TẤT CẢ! 🔥', width / 2, height - 12);
        ctx.restore();
      }

      if (warningRef.current && warningRef.current.until > stageClockRef.current) {
        ctx.save();
        ctx.fillStyle = '#fda4af'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
        readableCanvasText(ctx, '⚠', warningRef.current.x, 30);
        ctx.restore();
      }
      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
  ]);

  return (
    <div
      ref={containerRef}
      className="arcade-board relative w-full h-full min-h-0 rounded-2xl overflow-hidden touch-none select-none bg-black flex items-center justify-center border border-white/10 shadow-2xl"
    >
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
        className="w-full h-full cursor-ew-resize block"
      />
    </div>
  );
};


