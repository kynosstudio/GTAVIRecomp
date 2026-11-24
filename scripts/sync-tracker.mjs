import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL = 'https://raw.githubusercontent.com/4lwayz/portwatch-vi/main/data/tracker.json';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = resolve(ROOT, 'data', 'tracker.json');

const response = await fetch(`${URL}?t=${Date.now()}`, { cache: 'no-store' });
if (!response.ok) throw new Error(`Falha ao baixar tracker.json: HTTP ${response.status}`);

const payload = await response.json();
await mkdir(dirname(TARGET), { recursive: true });
await writeFile(TARGET, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`tracker.json atualizado em ${TARGET}`);
