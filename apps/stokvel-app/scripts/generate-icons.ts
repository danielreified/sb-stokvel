/**
 * Generates PWA icons from public/icon.svg using @resvg/resvg-js.
 * Run once after cloning: bun run generate-icons
 * Re-run whenever icon.svg changes.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const rootDir = resolve(import.meta.dir, '..');
const svg = readFileSync(resolve(rootDir, 'public/icon.svg'), 'utf-8');

const sizes: Array<{ name: string; size: number; maskable?: boolean }> = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
  { name: 'icon-180.png', size: 180 },
];

for (const { name, size, maskable } of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    // maskable icons need full bleed (no rounded corners)
    ...(maskable ? {} : {}),
  });

  const png = resvg.render().asPng();
  const outPath = resolve(rootDir, 'public', name);
  writeFileSync(outPath, png);
  console.log(`✓ ${name} (${size}×${size})`);
}
