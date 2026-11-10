#!/usr/bin/env node
/** Copies the approved logo exports into the Expo asset directory. */
"use strict";

const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "assets");
const LOGO_DIR = path.join(
  __dirname,
  "..",
  "..",
  "design",
  "logo",
  "final",
  "digital",
  "symbol",
);

const ASSETS = {
  "icon.png": "du-brut-au-net-symbol-app-icon-1024.png",
  "adaptive-icon.png": "du-brut-au-net-adaptive-foreground-1024.png",
  "favicon.png": "du-brut-au-net-symbol-app-icon-512.png",
  "splash-icon.png": "du-brut-au-net-adaptive-foreground-1024.png",
  "brand-symbol.png": "du-brut-au-net-symbol-mono-16a34a-512.png",
};

function copyAsset(destination, source) {
  const sourcePath = path.join(LOGO_DIR, source);
  const destinationPath = path.join(OUT_DIR, destination);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Logo export missing: ${sourcePath}`);
  }

  fs.copyFileSync(sourcePath, destinationPath);
  console.log(`✓ ${destination}`);
}

for (const [destination, source] of Object.entries(ASSETS)) {
  copyAsset(destination, source);
}

console.log("\nApproved Du Brut au Net assets copied.");
