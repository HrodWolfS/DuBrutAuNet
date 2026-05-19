#!/usr/bin/env node
/**
 * Generates mobile/assets/icon.png and mobile/assets/adaptive-icon.png
 * Pure Node.js — zero npm dependencies (uses built-in zlib + fs).
 *
 * Design: green (#16A34A) background · white circle · green "€" symbol
 */
"use strict";

const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

// ── CRC32 (required for valid PNG chunks) ─────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcVal]);
}

// ── Pixel renderer ────────────────────────────────────────────────────────
function renderIcon(SIZE) {
  const pixels = Buffer.alloc(SIZE * SIZE * 3);

  const CX = SIZE / 2;
  const CY = SIZE / 2;

  // Geometry (all values relative to SIZE=1024, scale linearly)
  const S = SIZE / 1024;
  const WHITE_R = Math.round(350 * S);   // white circle radius
  const ARC_OUTER = Math.round(215 * S); // € arc outer radius
  const ARC_INNER = Math.round(155 * S); // € arc inner radius
  const GAP_ANGLE = Math.PI / 4;         // ±45° opening on right side

  // € horizontal bars (pixel coordinates in 1024 space, scaled)
  const BAR1_Y0 = Math.round(454 * S), BAR1_Y1 = Math.round(478 * S);
  const BAR2_Y0 = Math.round(546 * S), BAR2_Y1 = Math.round(570 * S);
  const BAR_X0  = Math.round(300 * S), BAR_X1  = Math.round(537 * S);

  // Colors
  const GREEN  = [22, 163, 74];
  const WHITE  = [255, 255, 255];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - CX;
      const dy = y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r, g, b;

      if (dist > WHITE_R) {
        // Background — green
        [r, g, b] = GREEN;
      } else {
        // Inside white circle — default white, then draw € symbol
        const onArc =
          dist >= ARC_INNER &&
          dist <= ARC_OUTER &&
          Math.abs(Math.atan2(dy, dx)) > GAP_ANGLE;

        const onBar =
          (y >= BAR1_Y0 && y <= BAR1_Y1 && x >= BAR_X0 && x <= BAR_X1) ||
          (y >= BAR2_Y0 && y <= BAR2_Y1 && x >= BAR_X0 && x <= BAR_X1);

        if (onArc || onBar) {
          [r, g, b] = GREEN;
        } else {
          [r, g, b] = WHITE;
        }
      }

      const i = (y * SIZE + x) * 3;
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
    }
  }
  return pixels;
}

// ── PNG builder ───────────────────────────────────────────────────────────
function buildPNG(width, height, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type RGB

  // Interleave filter-0 bytes before each scanline
  const rowSize = 1 + width * 3;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0; // filter None
    pixels.copy(raw, y * rowSize + 1, y * width * 3, (y + 1) * width * 3);
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdrData),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Generate files ────────────────────────────────────────────────────────
const OUT_DIR = path.join(__dirname, "..", "assets");

function generate(filename, size) {
  const pixels = renderIcon(size);
  const png = buildPNG(size, size, pixels);
  const dest = path.join(OUT_DIR, filename);
  fs.writeFileSync(dest, png);
  console.log(`✅  ${filename}  (${size}×${size}, ${(png.length / 1024).toFixed(0)} KB)`);
}

generate("icon.png", 1024);
generate("adaptive-icon.png", 1024);
generate("favicon.png", 196);

console.log("\nDone. Update app.json to reference these assets.");
