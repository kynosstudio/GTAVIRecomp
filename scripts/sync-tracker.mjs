import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL = 'https://raw.githubusercontent.com/4lwayz/portwatch-vi/main/data/tracker.json';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = resolve(ROOT, 'data', 'tracker.json');

function recordKey(item) {
  if (!item || typeof item !== 'object') return '';
  return String(item.id || item.repo || item.url || item.link || item.name || item.title || '');
}

function isManualKynosEntry(item) {
  return Boolean(item && typeof item === 'object' && (
    item.trackerKynos === true
    || item.localOnly === true
    || item.manual === true
    || String(item.manualSource || item.source || '').toLowerCase() === 'kynos'
    || Number.isFinite(item.manualScore)
  ));
}

function preserveLocalKynosData(upstream, existing) {
  if (!existing || typeof existing !== 'object') return upstream;
  for (const key of ['trackerKynos', 'manualOverrides', 'localOverrides']) {
    if (Object.prototype.hasOwnProperty.call(existing, key)) upstream[key] = existing[key];
  }
  for (const field of ['efforts', 'news', 'changes', 'history', 'tools', 'candidates', 'flagged', 'headlines', 'dmca']) {
    if (!Array.isArray(upstream[field]) || !Array.isArray(existing[field])) continue;
    const manualEntries = existing[field].filter(isManualKynosEntry);
    if (!manualEntries.length) continue;
    const manualKeys = new Set(manualEntries.map(recordKey).filter(Boolean));
    upstream[field] = upstream[field].filter((item) => !manualKeys.has(recordKey(item)));
    upstream[field].push(...manualEntries);
  }
  return upstream;
}

let existing = null;
try {
  existing = JSON.parse(await readFile(TARGET, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const response = await fetch(`${URL}?t=${Date.now()}`, { cache: 'no-store' });
if (!response.ok) throw new Error(`Falha ao baixar tracker.json: HTTP ${response.status}`);

const payload = await response.json();
if (!payload || typeof payload !== 'object' || !Array.isArray(payload.efforts) || !Array.isArray(payload.news)) {
  throw new Error('O tracker remoto não contém os arrays esperados de esforços e notícias.');
}
preserveLocalKynosData(payload, existing);
await mkdir(dirname(TARGET), { recursive: true });
await writeFile(TARGET, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`tracker.json atualizado em ${TARGET}`);
