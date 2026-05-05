import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(import.meta.dir, '../dist/assets');
const MAX_INITIAL_JS_GZ_BYTES = 200 * 1024;
const MAX_TOTAL_GZ_BYTES = 500 * 1024;

// Rough gzip estimate: ~30% of raw size for minified JS/CSS
const GZ_RATIO = 0.3;

async function run(): Promise<void> {
  let files: string[];
  try {
    files = readdirSync(DIST);
  } catch {
    console.error('dist/assets not found — run vite build first');
    process.exit(1);
  }

  let initialJsGz = 0;
  let totalGz = 0;

  for (const file of files) {
    const filePath = join(DIST, file);
    const bunFile = Bun.file(filePath);
    const size = bunFile.size;
    const estimatedGz = Math.round(size * GZ_RATIO);

    if (file.endsWith('.js')) {
      initialJsGz += estimatedGz;
      totalGz += estimatedGz;
    } else if (file.endsWith('.css')) {
      totalGz += estimatedGz;
    }
  }

  console.log(`Initial JS (estimated gzip): ${Math.round(initialJsGz / 1024)} KB`);
  console.log(`Total transfer (estimated gzip): ${Math.round(totalGz / 1024)} KB`);

  const errors: string[] = [];
  if (initialJsGz > MAX_INITIAL_JS_GZ_BYTES) {
    errors.push(
      `Initial JS ${Math.round(initialJsGz / 1024)} KB exceeds budget of ${MAX_INITIAL_JS_GZ_BYTES / 1024} KB`,
    );
  }
  if (totalGz > MAX_TOTAL_GZ_BYTES) {
    errors.push(
      `Total transfer ${Math.round(totalGz / 1024)} KB exceeds budget of ${MAX_TOTAL_GZ_BYTES / 1024} KB`,
    );
  }

  if (errors.length > 0) {
    for (const err of errors) console.error(`BUDGET EXCEEDED: ${err}`);
    process.exit(1);
  }

  console.log('Bundle size budget OK.');
}

run();
