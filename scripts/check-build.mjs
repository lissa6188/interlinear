import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url);
const rootPath = root.pathname.replace(/^\/(.:\/)/, '$1');
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}

function targetExists(url) {
  const pathname = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  const relativePath = pathname.replace(/^\//, '');
  const direct = join(rootPath, relativePath);
  if (existsSync(direct) && extname(direct)) return true;
  return existsSync(join(direct, 'index.html'));
}

walk(rootPath);
const errors = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const label = relative(rootPath, file);
  if (!/<\/html>\s*$/i.test(html)) errors.push(`${label}: </html> 뒤에 콘텐츠가 있습니다.`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  for (const id of new Set(ids)) {
    if (ids.filter((candidate) => candidate === id).length > 1) errors.push(`${label}: id="${id}"가 중복됩니다.`);
  }

  for (const match of html.matchAll(/\s(?:href|src|srcset)="([^"]+)"/g)) {
    const url = match[1].trim().split(/\s+/, 1)[0];
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    if (!targetExists(url)) errors.push(`${label}: 내부 경로가 없습니다 — ${url}`);
  }
}

const home = readFileSync(join(rootPath, 'index.html'), 'utf8');
if (/\sdata-(?:body|haystack)=/.test(home)) errors.push('index.html: 전체 검색 색인이 HTML data 속성에 남아 있습니다.');
const searchIndexPath = join(rootPath, 'search-index.json');
if (!existsSync(searchIndexPath)) errors.push('search-index.json: 검색 색인 파일이 생성되지 않았습니다.');
else {
  try {
    const index = JSON.parse(readFileSync(searchIndexPath, 'utf8'));
    if (!Array.isArray(index) || index.some((item) => !item.href || !item.haystack || typeof item.body !== 'string')) {
      errors.push('search-index.json: 색인 구조가 올바르지 않습니다.');
    }
    const cardHrefs = [...home.matchAll(/\sdata-href="([^"]+)"/g)].map((match) => match[1]).sort();
    const indexHrefs = index.map((item) => item.href).sort();
    if (JSON.stringify(cardHrefs) !== JSON.stringify(indexHrefs)) {
      errors.push('search-index.json: 홈 카드와 검색 색인의 URL 목록이 일치하지 않습니다.');
    }
  } catch {
    errors.push('search-index.json: 유효한 JSON이 아닙니다.');
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`정적 검증 통과: HTML ${htmlFiles.length}개, 문서 경계·중복 ID·내부 경로 정상`);
}
