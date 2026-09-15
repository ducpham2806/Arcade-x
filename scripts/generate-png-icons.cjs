const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPNG(width, height, renderPixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Scanlines
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Pixel renderer for ArcadeX brand icon
function arcadePixelRenderer(maskable = false) {
  return (x, y, w, h) => {
    // Normalization (-1 to +1)
    const scale = maskable ? 0.72 : 0.88;
    const nx = (x / (w - 1) * 2 - 1) / scale;
    const ny = (y / (h - 1) * 2 - 1) / scale;

    // Dark high-tech background
    const distCenter = Math.sqrt(nx * nx + ny * ny);
    let bgR = 15, bgG = 12, bgB = 27, bgA = 255;
    
    // Subtle purple glow from center
    if (distCenter < 1.4) {
      const glow = Math.max(0, 1 - distCenter / 1.4);
      bgR = Math.min(255, Math.floor(bgR + glow * 40));
      bgG = Math.min(255, Math.floor(bgG + glow * 25));
      bgB = Math.min(255, Math.floor(bgB + glow * 80));
    }

    // Game Controller body geometry
    // Controller shape: two lobes connected in middle
    const leftLobe = Math.hypot(nx + 0.42, ny - 0.05);
    const rightLobe = Math.hypot(nx - 0.42, ny - 0.05);
    const isInController = (leftLobe < 0.42 || rightLobe < 0.42 || (Math.abs(nx) <= 0.42 && ny >= -0.32 && ny <= 0.28));

    if (isInController) {
      // Controller body gradient
      const ctrlGrad = 0.5 + ny * 0.5;
      let cr = 24 + Math.floor(ctrlGrad * 20);
      let cg = 22 + Math.floor(ctrlGrad * 22);
      let cb = 38 + Math.floor(ctrlGrad * 45);

      // Neon outline highlight
      const edge = Math.min(
        Math.abs(leftLobe - 0.42),
        Math.abs(rightLobe - 0.42),
        Math.abs(ny + 0.32),
        Math.abs(ny - 0.28)
      );
      if (edge < 0.04) {
        cr = 99; cg = 102; cb = 241; // Indigo glow border
      }

      // Left D-Pad cross
      const dpadX = nx + 0.42;
      const dpadY = ny - 0.02;
      const inDpadHoriz = Math.abs(dpadX) < 0.16 && Math.abs(dpadY) < 0.055;
      const inDpadVert = Math.abs(dpadX) < 0.055 && Math.abs(dpadY) < 0.16;
      if (inDpadHoriz || inDpadVert) {
        cr = 165; cg = 180; cb = 252; // Soft electric blue
      }

      // Right action buttons (A, B, X, Y cluster)
      const btnX = nx - 0.42;
      const btnY = ny - 0.02;
      // Top (Y) red
      if (Math.hypot(btnX, btnY + 0.11) < 0.048) { cr = 239; cg = 68; cb = 68; }
      // Right (B) amber
      if (Math.hypot(btnX - 0.11, btnY) < 0.048) { cr = 245; cg = 158; cb = 11; }
      // Bottom (A) green
      if (Math.hypot(btnX, btnY - 0.11) < 0.048) { cr = 16; cg = 185; cb = 129; }
      // Left (X) cyan
      if (Math.hypot(btnX + 0.11, btnY) < 0.048) { cr = 59; cg = 130; cb = 246; }

      // Center glowing "X" star
      const starDist = Math.hypot(nx, ny + 0.02);
      if (starDist < 0.08) {
        const star = Math.max(0, 1 - starDist / 0.08);
        cr = Math.min(255, Math.floor(cr + star * 255));
        cg = Math.min(255, Math.floor(cg + star * 180));
        cb = Math.min(255, Math.floor(cb + star * 240));
      }

      return [cr, cg, cb, 255];
    }

    // Border radius clipping for regular icons (if not maskable)
    if (!maskable) {
      const radius = 0.88;
      const cornerX = Math.abs(nx) - (1 - 0.28);
      const cornerY = Math.abs(ny) - (1 - 0.28);
      if (cornerX > 0 && cornerY > 0) {
        if (Math.hypot(cornerX, cornerY) > 0.28) {
          return [0, 0, 0, 0]; // Transparent outside squircle
        }
      }
    }

    return [bgR, bgG, bgB, bgA];
  };
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// 1. 192x192 PNG
const png192 = createPNG(192, 192, arcadePixelRenderer(false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('Created public/pwa-192x192.png');

// 2. 512x512 PNG
const png512 = createPNG(512, 512, arcadePixelRenderer(false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('Created public/pwa-512x512.png');

// 3. 512x512 Maskable PNG (full bleed background, inner padding)
const pngMaskable512 = createPNG(512, 512, arcadePixelRenderer(true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);
console.log('Created public/pwa-maskable-512x512.png');

// 4. Apple Touch Icon 180x180 PNG
const pngApple = createPNG(180, 180, arcadePixelRenderer(true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);
console.log('Created public/apple-touch-icon.png');

// 5. 64x64 Favicon PNG (can be saved as favicon.ico or favicon.png)
const pngFavicon = createPNG(64, 64, arcadePixelRenderer(false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pngFavicon);
console.log('Created public/favicon.ico');
