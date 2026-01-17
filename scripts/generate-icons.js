#!/usr/bin/env node
/**
 * PWA Icon Generator Script
 * Generates PNG icons from an SVG template using sharp.
 * Run: node scripts/generate-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgTemplate = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#FDFBF7"/>
  <g transform="translate(${size * 0.1875}, ${size * 0.234375}) scale(${size / 512})">
    <path d="M40 0 L280 0 L320 40 L320 232 L280 272 L40 272 L0 232 L0 40 Z" fill="#333333"/>
    <rect x="60" y="60" width="200" height="12" rx="4" fill="#F15060"/>
    <rect x="60" y="100" width="180" height="12" rx="4" fill="#0078BF"/>
    <rect x="60" y="140" width="160" height="12" rx="4" fill="#00A95C"/>
    <rect x="60" y="180" width="140" height="12" rx="4" fill="#FF6C2F"/>
    <rect x="210" y="180" width="8" height="28" fill="#F15060"/>
  </g>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

const icons = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
];

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  for (const { name, size } of icons) {
    const svg = svgTemplate(size);
    const filepath = path.join(publicDir, name);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(filepath);

    console.log(`Created: ${name} (${size}x${size})`);
  }

  // Also save the favicon SVG
  const faviconSvg = svgTemplate(512);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
  console.log('Created: favicon.svg');

  console.log('\nDone! PWA icons generated successfully.');
}

generateIcons().catch(console.error);
