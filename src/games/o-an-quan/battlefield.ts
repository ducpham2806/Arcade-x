import type { TerrainId } from '../duel/BoardTerrain';
import type { FolkSeat, SkinItemDef } from '../folk-duel/types';

export type OaqTerrain = TerrainId<'o-an-quan'>;
export interface OaqBattlefield {
  terrain: Exclude<OaqTerrain, 'classic'>;
  units?: CanvasImageSource;
  terrains?: HTMLImageElement;
  impact?: HTMLImageElement;
}

export const OAQ_CAMPAIGN_IMAGES = {
  units: '/games/o-an-quan/campaign/units.webp',
  terrains: '/games/o-an-quan/campaign/terrains.webp',
  impact: '/games/xiangqi/battlefield/capture.webp',
};

const TERRAIN = {
  grass: { col: 0, row: 0, base: '#5b592e', edge: '#d6b870' },
  desert: { col: 1, row: 0, base: '#9c6936', edge: '#e9b96c' },
  mountain: { col: 0, row: 1, base: '#505b5b', edge: '#b3bdbd' },
  fortress: { col: 1, row: 1, base: '#644236', edge: '#dd9c78' },
};

export function drawCampaignGround(ctx: CanvasRenderingContext2D, field: OaqBattlefield, x: number, y: number, w: number, h: number) {
  const tile = TERRAIN[field.terrain];
  ctx.fillStyle = tile.base;
  ctx.fillRect(x, y, w, h);
  if (field.terrains) {
    const tileWidth = field.terrains.naturalWidth / 2;
    const tileHeight = field.terrains.naturalHeight / 2;
    ctx.drawImage(field.terrains, tile.col * tileWidth, tile.row * tileHeight, tileWidth, tileHeight, x, y, w, h);
  }
  ctx.fillStyle = '#15130c29';
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = 2;
  ctx.strokeStyle = tile.edge;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
}

export function drawCampaignUnit(
  ctx: CanvasRenderingContext2D, atlas: CanvasImageSource, seat: FolkSeat,
  x: number, y: number, size: number, commander = false, facing = 1, tilt = 0,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.fillStyle = '#170b0a69';
  ctx.beginPath();
  ctx.ellipse(0, size * .2, size * .29, size * .105, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.scale(facing, 1);
  ctx.rotate(tilt);
  ctx.drawImage(atlas, commander ? 96 : 0, seat === 'P1' ? 0 : 96, 96, 96, -size / 2, -size * .74, size, size);
  ctx.restore();
}

export function oppositeSeat(seat: FolkSeat): FolkSeat {
  return seat === 'P1' ? 'P2' : 'P1';
}

export function campaignFormation(x: number, y: number, index: number) {
  const stagger = Math.floor(index / 3) % 2 ? 4 : -4;
  return { x: x + (index % 3 - 1) * 20 + stagger, y: y + Math.floor(index / 3) * 17 };
}

export function campaignUniform(master: HTMLImageElement, skin: SkinItemDef): CanvasImageSource {
  if (skin.isDefault) return master;
  const canvas = document.createElement('canvas');
  canvas.width = master.naturalWidth;
  canvas.height = master.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return master;
  ctx.drawImage(master, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const tint = Number.parseInt(skin.palette.particle.slice(1), 16);
  const rgb = [tint >>> 16, (tint >>> 8) & 255, tint & 255];
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const dark = Math.min(r, g, b);
    const light = Math.max(r, g, b);
    const redCloth = r > g * 1.6 && g < 106 && r > b * 1.65;
    const blueCloth = g > r * 1.55 && b > r * 1.55;
    if (!redCloth && !blueCloth) continue;
    for (let channel = 0; channel < 3; channel++) {
      data[i + channel] = data[i + channel] * .78 + rgb[channel] * ((light - dark) / 255) * .22 + dark * .135;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}
