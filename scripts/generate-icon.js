/**
 * Generate a valid 16x16 .ico file for LATENCY game.
 * Dark background (#0a0e14) with a green "L" (#00ff88).
 * No external dependencies — pure Node.js Buffer manipulation.
 *
 * ICO format: ICONDIR header + ICONDIRENTRY + BMP (DIB) data
 */

const fs = require('fs');
const path = require('path');

const W = 16;
const H = 16;

// Colors (BGRA order for BMP)
const BG = [0x14, 0x0e, 0x0a, 0xff];   // #0a0e14
const FG = [0x88, 0xff, 0x00, 0xff];   // #00ff88

// Draw a simple "L" on a 16x16 grid
// L shape: vertical bar cols 3-5, rows 2-13; horizontal bar cols 3-12, rows 11-13
function getPixel(x, y) {
  // Vertical stroke of L
  if (x >= 3 && x <= 5 && y >= 2 && y <= 13) return FG;
  // Horizontal stroke of L
  if (x >= 3 && x <= 12 && y >= 11 && y <= 13) return FG;
  return BG;
}

// BMP rows are stored bottom-to-top in ICO DIB data
const pixelData = Buffer.alloc(W * H * 4);
for (let row = 0; row < H; row++) {
  for (let col = 0; col < W; col++) {
    const srcY = H - 1 - row; // flip vertically
    const color = getPixel(col, srcY);
    const offset = (row * W + col) * 4;
    pixelData[offset] = color[0];     // B
    pixelData[offset + 1] = color[1]; // G
    pixelData[offset + 2] = color[2]; // R
    pixelData[offset + 3] = color[3]; // A
  }
}

// AND mask: 1 bit per pixel, rows padded to 4 bytes. All 0 = fully opaque.
const andMaskRowBytes = Math.ceil(W / 8);
const andMaskRowPadded = Math.ceil(andMaskRowBytes / 4) * 4;
const andMask = Buffer.alloc(andMaskRowPadded * H, 0);

// BITMAPINFOHEADER (40 bytes)
const bih = Buffer.alloc(40);
bih.writeUInt32LE(40, 0);          // biSize
bih.writeInt32LE(W, 4);            // biWidth
bih.writeInt32LE(H * 2, 8);        // biHeight (doubled for ICO: includes AND mask)
bih.writeUInt16LE(1, 12);          // biPlanes
bih.writeUInt16LE(32, 14);         // biBitCount
bih.writeUInt32LE(0, 16);          // biCompression (BI_RGB)
bih.writeUInt32LE(pixelData.length + andMask.length, 20); // biSizeImage
bih.writeInt32LE(0, 24);           // biXPelsPerMeter
bih.writeInt32LE(0, 28);           // biYPelsPerMeter
bih.writeUInt32LE(0, 32);          // biClrUsed
bih.writeUInt32LE(0, 36);          // biClrImportant

const imageData = Buffer.concat([bih, pixelData, andMask]);

// ICONDIR (6 bytes)
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0);       // reserved
iconDir.writeUInt16LE(1, 2);       // type = 1 (ICO)
iconDir.writeUInt16LE(1, 4);       // count = 1 image

// ICONDIRENTRY (16 bytes)
const entry = Buffer.alloc(16);
entry.writeUInt8(W, 0);            // width (0 means 256, 16 = 16)
entry.writeUInt8(H, 1);            // height
entry.writeUInt8(0, 2);            // color palette count
entry.writeUInt8(0, 3);            // reserved
entry.writeUInt16LE(1, 4);         // color planes
entry.writeUInt16LE(32, 6);        // bits per pixel
entry.writeUInt32LE(imageData.length, 8);  // image data size
entry.writeUInt32LE(6 + 16, 12);   // offset to image data (after header + 1 entry)

const ico = Buffer.concat([iconDir, entry, imageData]);

const outPath = path.join(__dirname, '..', 'build-resources', 'icon.ico');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, ico);

console.log(`Created ${outPath} (${ico.length} bytes)`);
