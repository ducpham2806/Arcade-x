import React from "react";
import manifest from "./data/manifest.json" with { type: "json" };
import { PLANETS } from "./content";
import type { Simulation, CosmicSave } from "./types";
export const ASSET_ROOT = "/games/cosmic-defense/";
type Meta = {
  sheet: string;
  x: number;
  y: number;
  w: number;
  h: number;
  frames: number;
  stride: number;
  fps: number;
  pivot: number[];
};
export const SPRITES = manifest.sprites as Record<string, Meta>;
export function Sprite({
  name,
  scale = 2,
  className = "",
}: {
  name: string;
  scale?: number;
  className?: string;
}) {
  const m = SPRITES[name];
  if (!m) return null;
  return (
    <span
      className={`cd-sprite ${className}`}
      aria-hidden="true"
      style={{
        width: m.w * scale,
        height: m.h * scale,
        backgroundImage: `url(${ASSET_ROOT + m.sheet})`,
        backgroundSize: `${manifest.sheets[m.sheet.split("/")[1].replace(".png", "")].size[0] * scale}px auto`,
        backgroundPosition: `-${m.x * scale}px -${m.y * scale}px`,
      }}
    />
  );
}
export type Art = Record<string, CanvasImageSource>;
export async function loadArt(): Promise<Art> {
  const paths = [
    ...Object.values(manifest.sheets).map((m) => m.file),
    ...Object.keys(manifest.backgrounds).map((n) => "backgrounds/" + n),
  ];
  const loaded = await Promise.all(
    paths.map(
      (path) =>
        new Promise<[string, HTMLImageElement]>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve([path, img]);
          img.onerror = () => reject(new Error("Không tải được " + path));
          img.src = ASSET_ROOT + path;
        }),
    ),
  );
  return Object.fromEntries(loaded);
}
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  art: Art,
  name: string,
  x: number,
  y: number,
  time: number,
  scale = 1,
  frame?: number,
) {
  const m = SPRITES[name],
    img = m && art[m.sheet];
  if (!m || !img) return;
  const f =
    frame === undefined
      ? Math.floor(time * m.fps) % m.frames
      : frame % m.frames;
  ctx.drawImage(
    img,
    m.x + f * m.stride,
    m.y,
    m.w,
    m.h,
    Math.round(x - (m.w * scale) / 2),
    Math.round(y - (m.h * scale) / 2),
    m.w * scale,
    m.h * scale,
  );
}
const prefixes = [
  "boss01_grindjaw",
  "boss02_sporemother",
  "boss03_cryowyrm",
  "boss04_ignarok",
  "boss05_abyssal_maw",
  "boss06_overseer",
  "boss07_veilweaver",
  "boss08_thunderhead",
  "boss09_prism",
  "boss10_xarkul",
];
export function drawGame(
  ctx: CanvasRenderingContext2D,
  art: Art,
  s: Simulation,
  settings: CosmicSave["settings"],
  ghost?: { x: number; y: number },
  skin = "nova",
) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 180, 320);
  ctx.fillStyle = "#0B1020";
  ctx.fillRect(0, 0, 180, 320);
  const p = s.boss?.planet || Math.ceil(s.config.level / 10),
    key = PLANETS[p - 1].key,
    t = s.frame / 60;
  for (const [i, layer] of ["far", "mid", "near"].entries()) {
    const filename = `backgrounds/bg_${String(p).padStart(2, "0")}_${key}_${layer}.png`,
      img = art[filename];
    if (!img) continue;
    const y =
      Math.floor(t * [2, 4, 10][i] * (settings.reducedMotion ? 0.2 : 1)) % 720;
    ctx.drawImage(img, 0, y - 720);
    ctx.drawImage(img, 0, y);
  }
  ctx.fillStyle = `rgba(11,16,32,${settings.backgroundDim})`;
  ctx.fillRect(0, 0, 180, 320);
  for (const h of s.hazards) {
    const active = s.frame >= h.start;
    ctx.globalAlpha = active ? 0.7 : 0.28;
    ctx.fillStyle =
      h.kind === "slow"
        ? "#2DE2A8"
        : h.kind === "gravity"
          ? "#7A3CFF"
          : active
            ? "#FFD23F"
            : "#FF3D81";
    ctx.fillRect(
      Math.round(h.x - h.w / 2),
      Math.round(h.y - h.h / 2),
      h.w,
      h.h,
    );
    ctx.globalAlpha = 1;
    ctx.strokeStyle = active ? "#FFFFFF" : "#FF3D81";
    ctx.lineWidth = 1;
    ctx.setLineDash(active ? [] : [3, 3]);
    ctx.strokeRect(
      Math.round(h.x - h.w / 2),
      Math.round(h.y - h.h / 2),
      h.w,
      h.h,
    );
    ctx.setLineDash([]);
  }
  const b = s.boss;
  if (b) {
    const prefix = prefixes[b.planet - 1];
    let name =
      b.planet === 3
        ? prefix + "_head"
        : b.planet === 9
          ? prefix + "_face_" + ["R", "Y", "V", "U"][Math.floor(t / 3) % 4]
          : b.planet === 10
            ? prefix + "_p" + b.phase
            : prefix +
              (b.weak > s.frame
                ? "_weak"
                : b.phase === 3
                  ? "_d2"
                  : b.phase === 2
                    ? "_d1"
                    : "_idle");
    if (b.planet === 3)
      for (let i = 9; i >= 0; i--)
        drawSprite(
          ctx,
          art,
          prefix + "_segment",
          90 + Math.sin((t - i * 0.12) * 1.2) * 60,
          55 + i * 4,
          t,
          0.75,
        );
    drawSprite(ctx, art, name, b.x, b.y, t, b.planet === 10 ? 0.75 : 1);
    for (const part of b.parts) {
      const sprite =
        part.kind === "turret"
          ? prefix + (part.hp > 0 ? "_turret" : "_turret_dead")
          : part.kind === "rod"
            ? prefix + (part.hp > 0 ? "_rod" : "_rod_dead")
            : part.kind === "tentacle"
              ? prefix + "_tentacle"
              : part.kind === "decoy"
                ? prefix + "_decoy"
                : prefix + "_shard";
      if (part.hp <= 0 && !["turret", "rod"].includes(part.kind)) continue;
      drawSprite(ctx, art, sprite, part.x, part.y, t, 0.7);
      if (part.hp > 0) {
        ctx.fillStyle = "#FFD23F";
        ctx.fillRect(part.x - 10, part.y + 12, (20 * part.hp) / part.maxHp, 1);
      }
    }
    if (b.weak > s.frame) {
      ctx.strokeStyle = "#FFD23F";
      ctx.beginPath();
      ctx.arc(b.x, b.y + 12, 7, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  for (const e of s.enemies) {
    const name =
      e.kind === "generator"
        ? "drone"
        : e.kind === "prism"
          ? "drone"
          : e.kind === "meteor"
            ? "mine"
            : e.kind;
    ctx.globalAlpha =
      e.kind === "wraith" && Math.floor((s.frame - e.born) / 120) % 2 ? 0.3 : 1;
    drawSprite(ctx, art, name, e.x, e.y, t);
    ctx.globalAlpha = 1;
    if (e.kind === "mantis")
      drawSprite(
        ctx,
        art,
        "mantis_shield",
        e.x,
        e.y,
        t,
        1,
        Math.floor(t * 2) % 8,
      );
    if (e.kind === "cicada")
      drawSprite(ctx, art, "heal_ring", e.x, e.y, t, 1.5);
    if (e.kind === "commander") drawSprite(ctx, art, "buff_ring", e.x, e.y, t);
    if (e.tele > s.frame) {
      ctx.strokeStyle = "#FF3D81";
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.aimX, e.aimY);
      ctx.stroke();
      ctx.setLineDash([]);
      drawSprite(ctx, art, "lock_ring", e.x, e.y, t);
    }
    if (e.kind === "generator" || e.kind === "commander") {
      ctx.fillStyle = "#FF3D81";
      ctx.fillRect(
        e.x - e.radius,
        e.y - e.radius - 4,
        (2 * e.radius * e.hp) / e.maxHp,
        2,
      );
    }
  }
  for (const pickup of s.pickups)
    drawSprite(
      ctx,
      art,
      pickup.kind === "star" ? "star_core" : "item_" + pickup.kind,
      pickup.x,
      pickup.y,
      t,
    );
  for (const bullet of s.bullets)
    drawSprite(
      ctx,
      art,
      bullet.player
        ? bullet.kind === "missile"
          ? "bullet_missile"
          : s.weapon >= 4
            ? "bullet_plasma_big"
            : "bullet_plasma"
        : bullet.kind === "aimed"
          ? "bullet_aimed"
          : bullet.kind === "shard"
            ? "bullet_shard"
            : bullet.kind === "bomb"
              ? "bullet_bomb"
              : bullet.kind === "mine"
                ? "mine"
                : "bullet_enemy",
      bullet.x,
      bullet.y,
      t,
    );
  if (s.laser > 0)
    for (let y = s.y - 15; y > 0; y -= 8)
      drawSprite(
        ctx,
        art,
        "beam_tile",
        s.x,
        y,
        t,
        s.itemLevels.laser >= 3 ? 2 : 1,
      );
  if (s.config.mutators.includes("blackout") || p === 7) {
    ctx.fillStyle = "rgba(11,16,32,.5)";
    ctx.fillRect(0, 0, 180, Math.max(0, s.y - 75));
  }
  if (ghost) {
    ctx.globalAlpha = 0.25;
    drawSprite(ctx, art, "aegis_lv3_c", ghost.x, ghost.y, t);
    ctx.globalAlpha = 1;
  }
  const shipArt =
    skin !== "nova" && art["skin/" + skin]
      ? { ...art, "sprites/ship.png": art["skin/" + skin] }
      : art;
  if (s.hp > 0) {
    ctx.globalAlpha =
      s.cloak > 0 ? 0.4 : s.invincible > 0 ? 0.6 + 0.3 * Math.sin(t * 6) : 1;
    drawSprite(
      ctx,
      shipArt,
      `aegis_lv${s.weapon}_${Math.abs(s.targetX - s.x) < 3 ? "c" : s.targetX < s.x ? "l" : "r"}`,
      s.x,
      s.y,
      t,
    );
    if (s.hp <= 3) drawSprite(ctx, shipArt, "aegis_dmg" + s.hp, s.x, s.y, t);
    if (s.shield > 0) drawSprite(ctx, art, "aegis_shield", s.x, s.y, t);
    ctx.globalAlpha = 1;
    if (settings.hitbox) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y) - 1, 3, 3);
      ctx.strokeStyle = "#27E3FF";
      ctx.strokeRect(Math.round(s.x) - 2, Math.round(s.y) - 2, 5, 5);
    }
  }
  for (const e of s.effects)
    drawSprite(ctx, art, e.kind, e.x, e.y, (s.frame - e.born) / 60);
}
export function addPaletteSkins(art: Art) {
  const original = art["sprites/ship.png"] as HTMLImageElement;
  for (const [name, swaps] of Object.entries(manifest.palette_swaps.skins)) {
    const c = document.createElement("canvas");
    c.width = original.width;
    c.height = original.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(original, 0, 0);
    const pixels = ctx.getImageData(0, 0, c.width, c.height);
    const rgb = (hex: string) =>
      [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const map = Object.entries(swaps).map(([from, to]) => [
      rgb(manifest.palette[from]),
      rgb(manifest.palette[to]),
    ]);
    for (let i = 0; i < pixels.data.length; i += 4)
      for (const [from, to] of map)
        if (from.every((v, j) => pixels.data[i + j] === v)) {
          to.forEach((v, j) => (pixels.data[i + j] = v));
          break;
        }
    ctx.putImageData(pixels, 0, 0);
    art["skin/" + name] = c;
  }
}
