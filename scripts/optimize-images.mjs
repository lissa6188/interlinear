import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const roots = ['public/captures', 'public/cards'];
const candidates = [];

function walk(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.(png|jpe?g)$/i.test(entry.name) && !entry.name.endsWith('.optimized.webp')) candidates.push(path);
  }
}

for (const root of roots) walk(root);

let generated = 0;
let originalBytes = 0;
let optimizedBytes = 0;

for (const source of candidates) {
  const output = source.replace(/\.(png|jpe?g)$/i, '.optimized.webp');
  const sourceStat = statSync(source);
  if (!existsSync(output) || statSync(output).mtimeMs < sourceStat.mtimeMs) {
    await sharp(source)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(output);
    generated += 1;
  }
  originalBytes += sourceStat.size;
  optimizedBytes += statSync(output).size;
}

const saved = originalBytes ? Math.round((1 - optimizedBytes / originalBytes) * 100) : 0;
console.log(`이미지 최적화: ${candidates.length}개 확인, ${generated}개 생성, ${saved}% 절감`);
