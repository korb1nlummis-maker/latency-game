#!/usr/bin/env node
/**
 * generate-steam-icon.js
 * Generates a 256x256 cyberpunk game icon for LATENCY.
 * Outputs PNG and ICO files using only Node.js built-ins.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 256, H = 256;

// --- Color helpers ---
function hexToRGB(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

function lerpColor(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

// --- Pixel buffer (RGBA) ---
const pixels = Buffer.alloc(W * H * 4);

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = a;
}

function getPixel(x, y) {
  if (x < 0 || x >= W || y < 0 || y >= H) return [0,0,0,0];
  const i = (y * W + x) * 4;
  return [pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]];
}

function blendPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const [er, eg, eb, ea] = getPixel(x, y);
  const alpha = a / 255;
  setPixel(x, y,
    lerp(er, r, alpha),
    lerp(eg, g, alpha),
    lerp(eb, b, alpha),
    Math.min(255, ea + a)
  );
}

// =============================================
// 1. Background gradient
// =============================================
const bgTop = hexToRGB('#0a0e14');
const bgBot = hexToRGB('#0d1520');

for (let y = 0; y < H; y++) {
  const t = y / (H - 1);
  const [r, g, b] = lerpColor(bgTop, bgBot, t);
  for (let x = 0; x < W; x++) {
    setPixel(x, y, r, g, b);
  }
}

// =============================================
// 4. Circuit-board dot pattern (behind everything)
// =============================================
const dotColor = hexToRGB('#0a1a12');
const dotSpacing = 12;
for (let y = dotSpacing; y < H; y += dotSpacing) {
  for (let x = dotSpacing; x < W; x += dotSpacing) {
    setPixel(x, y, dotColor[0], dotColor[1], dotColor[2]);
    // small cross pattern
    setPixel(x-1, y, dotColor[0], dotColor[1], dotColor[2]);
    setPixel(x+1, y, dotColor[0], dotColor[1], dotColor[2]);
    setPixel(x, y-1, dotColor[0], dotColor[1], dotColor[2]);
    setPixel(x, y+1, dotColor[0], dotColor[1], dotColor[2]);
  }
}

// Add thin circuit trace lines connecting some dots
const traceColor = hexToRGB('#071510');
for (let y = dotSpacing; y < H - dotSpacing; y += dotSpacing * 2) {
  for (let x = dotSpacing; x < W - dotSpacing; x += dotSpacing) {
    // horizontal trace
    if ((x / dotSpacing + y / dotSpacing) % 3 === 0) {
      for (let dx = 0; dx < dotSpacing; dx++) {
        setPixel(x + dx, y, traceColor[0], traceColor[1], traceColor[2]);
      }
    }
    // vertical trace
    if ((x / dotSpacing + y / dotSpacing) % 5 === 0) {
      for (let dy = 0; dy < dotSpacing; dy++) {
        setPixel(x, y + dy, traceColor[0], traceColor[1], traceColor[2]);
      }
    }
  }
}

// =============================================
// 2. Stylized "L" letter — pixel-art, bold
// =============================================
// The L: a vertical bar + horizontal bar at bottom
// Positioned roughly centered
const lColor = hexToRGB('#00ff88');
const lX = 78;   // left edge of the L
const lY = 58;   // top edge of the L
const lHeight = 140;
const lWidth = 100;
const barThick = 28; // thickness of the L strokes

// Vertical bar of L
function fillRect(rx, ry, rw, rh, color) {
  for (let y = ry; y < ry + rh; y++) {
    for (let x = rx; x < rx + rw; x++) {
      setPixel(x, y, color[0], color[1], color[2]);
    }
  }
}

fillRect(lX, lY, barThick, lHeight, lColor);
// Horizontal bar of L (bottom)
fillRect(lX, lY + lHeight - barThick, lWidth, barThick, lColor);

// Add a subtle bevel/highlight to the top and left edges of the L
const highlightColor = hexToRGB('#33ffaa');
// Top edge of vertical bar
for (let x = lX; x < lX + barThick; x++) {
  setPixel(x, lY, highlightColor[0], highlightColor[1], highlightColor[2]);
  setPixel(x, lY + 1, highlightColor[0], highlightColor[1], highlightColor[2]);
}
// Left edge of vertical bar
for (let y = lY; y < lY + lHeight; y++) {
  setPixel(lX, y, highlightColor[0], highlightColor[1], highlightColor[2]);
  setPixel(lX + 1, y, highlightColor[0], highlightColor[1], highlightColor[2]);
}

// Add inner shadow on bottom-right edges
const shadowColor = hexToRGB('#009955');
// Right edge of vertical bar (above horizontal)
for (let y = lY; y < lY + lHeight - barThick; y++) {
  setPixel(lX + barThick - 1, y, shadowColor[0], shadowColor[1], shadowColor[2]);
  setPixel(lX + barThick - 2, y, shadowColor[0], shadowColor[1], shadowColor[2]);
}
// Bottom edge of horizontal bar
for (let x = lX; x < lX + lWidth; x++) {
  setPixel(x, lY + lHeight - 1, shadowColor[0], shadowColor[1], shadowColor[2]);
  setPixel(x, lY + lHeight - 2, shadowColor[0], shadowColor[1], shadowColor[2]);
}
// Right edge of horizontal bar
for (let y = lY + lHeight - barThick; y < lY + lHeight; y++) {
  setPixel(lX + lWidth - 1, y, shadowColor[0], shadowColor[1], shadowColor[2]);
  setPixel(lX + lWidth - 2, y, shadowColor[0], shadowColor[1], shadowColor[2]);
}

// =============================================
// 5. Glow effect around the "L"
// =============================================
const glowColor = hexToRGB('#005533');
const glowRadius = 6;

// We'll create a mask of where the L is, then paint glow around it
const lMask = Buffer.alloc(W * H);
// Mark L pixels
for (let y = lY; y < lY + lHeight; y++) {
  for (let x = lX; x < lX + barThick; x++) lMask[y * W + x] = 1;
}
for (let y = lY + lHeight - barThick; y < lY + lHeight; y++) {
  for (let x = lX; x < lX + lWidth; x++) lMask[y * W + x] = 1;
}

// Paint glow: for each non-L pixel near an L pixel, blend glow
for (let y = Math.max(0, lY - glowRadius); y < Math.min(H, lY + lHeight + glowRadius); y++) {
  for (let x = Math.max(0, lX - glowRadius); x < Math.min(W, lX + lWidth + glowRadius); x++) {
    if (lMask[y * W + x]) continue; // skip L pixels
    // Find distance to nearest L pixel
    let minDist = glowRadius + 1;
    for (let dy = -glowRadius; dy <= glowRadius; dy++) {
      for (let dx = -glowRadius; dx <= glowRadius; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && lMask[ny * W + nx]) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) minDist = dist;
        }
      }
    }
    if (minDist <= glowRadius) {
      const intensity = 1 - (minDist / glowRadius);
      const alpha = Math.round(intensity * 180);
      blendPixel(x, y, glowColor[0], glowColor[1], glowColor[2], alpha);
    }
  }
}

// =============================================
// 3. Green border/frame (2px)
// =============================================
const borderColor = hexToRGB('#00cc66');
for (let i = 0; i < 2; i++) {
  for (let x = 0; x < W; x++) {
    setPixel(x, i, borderColor[0], borderColor[1], borderColor[2]);
    setPixel(x, H - 1 - i, borderColor[0], borderColor[1], borderColor[2]);
  }
  for (let y = 0; y < H; y++) {
    setPixel(i, y, borderColor[0], borderColor[1], borderColor[2]);
    setPixel(W - 1 - i, y, borderColor[0], borderColor[1], borderColor[2]);
  }
}

// Corner accents — small bright squares at each corner
const cornerSize = 8;
const cornerColor = hexToRGB('#00ff88');
for (let i = 0; i < cornerSize; i++) {
  for (let j = 0; j < 2; j++) {
    // top-left
    setPixel(i, j + 2, cornerColor[0], cornerColor[1], cornerColor[2]);
    setPixel(j + 2, i, cornerColor[0], cornerColor[1], cornerColor[2]);
    // top-right
    setPixel(W - 1 - i, j + 2, cornerColor[0], cornerColor[1], cornerColor[2]);
    setPixel(W - 1 - j - 2, i, cornerColor[0], cornerColor[1], cornerColor[2]);
    // bottom-left
    setPixel(i, H - 1 - j - 2, cornerColor[0], cornerColor[1], cornerColor[2]);
    setPixel(j + 2, H - 1 - i, cornerColor[0], cornerColor[1], cornerColor[2]);
    // bottom-right
    setPixel(W - 1 - i, H - 1 - j - 2, cornerColor[0], cornerColor[1], cornerColor[2]);
    setPixel(W - 1 - j - 2, H - 1 - i, cornerColor[0], cornerColor[1], cornerColor[2]);
  }
}

// =============================================
// 6. Scan line effect (bottom half-ish)
// =============================================
for (let y = Math.floor(H * 0.6); y < H - 2; y++) {
  if (y % 2 === 0) {
    for (let x = 2; x < W - 2; x++) {
      const [r, g, b, a] = getPixel(x, y);
      // Slightly brighten even rows
      setPixel(x, y, Math.min(255, r + 3), Math.min(255, g + 5), Math.min(255, b + 3), a);
    }
  } else {
    for (let x = 2; x < W - 2; x++) {
      const [r, g, b, a] = getPixel(x, y);
      // Slightly darken odd rows
      setPixel(x, y, Math.max(0, r - 2), Math.max(0, g - 3), Math.max(0, b - 2), a);
    }
  }
}

// =============================================
// PNG encoding
// =============================================
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([len, typeBytes, data, crc]);
}

function encodePNG(width, height, rgbaPixels) {
  // Build raw image data with filter byte (0 = None) per row
  const rawRows = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawRows[rowOffset] = 0; // filter: None
    rgbaPixels.copy(rawRows, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawRows, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', iend)
  ]);
}

const pngData = encodePNG(W, H, pixels);

// =============================================
// ICO encoding (single 256x256 PNG entry)
// =============================================
function encodeICO(pngBuffer) {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);    // reserved
  header.writeUInt16LE(1, 2);    // type: ICO
  header.writeUInt16LE(1, 4);    // 1 image

  // Directory entry: 16 bytes
  const entry = Buffer.alloc(16);
  entry[0] = 0;   // width (0 = 256)
  entry[1] = 0;   // height (0 = 256)
  entry[2] = 0;   // color palette
  entry[3] = 0;   // reserved
  entry.writeUInt16LE(1, 4);     // color planes
  entry.writeUInt16LE(32, 6);    // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8);  // image size
  entry.writeUInt32LE(6 + 16, 12);           // offset to image data

  return Buffer.concat([header, entry, pngBuffer]);
}

const icoData = encodeICO(pngData);

// =============================================
// Write files
// =============================================
const outputs = [
  path.join('D:', 'Latency', 'Steam Setup', 'icons', 'icon-256.png'),
  path.join('D:', 'Latency', 'Steam Setup', 'icons', 'icon.ico'),
  path.join('D:', 'Latency', 'build-resources', 'icon.ico'),
];

for (const outPath of outputs) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const data = outPath.endsWith('.png') ? pngData : icoData;
  fs.writeFileSync(outPath, data);
  console.log(`Written: ${outPath} (${data.length} bytes)`);
}

console.log('Done.');
