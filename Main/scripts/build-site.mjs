// Deploy-time build, run by .github/workflows/pages.yml after the site files are copied:
//   node scripts/build-site.mjs _site
// Writes the article pages, news archive, RSS feed, sitemap and IndexNow key into the site folder.
// It also compares the new sitemap with the one that's live now and, if any URL is new or changed,
// writes indexnow.json (outside the site folder) for the workflow to send once the deploy is live.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { buildSite, changedUrls, indexNowPayload, SITE_URL } from './lib/site-build.mjs';

const out = process.argv[2] || '_site';
const data = JSON.parse(await readFile('data/tracker.json', 'utf8'));
const { files, entries } = buildSite(data);

for (const [path, content] of Object.entries(files)) {
  const target = join(out, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

let previous = null;
try {
  const res = await fetch(`${SITE_URL}sitemap.xml`, { signal: AbortSignal.timeout(15000) });
  if (res.ok) previous = await res.text();
} catch (err) {
  console.log(`Couldn't read the live sitemap (${err.message}); treating every URL as new.`);
}
const urls = changedUrls(previous, entries);
if (urls.length) await writeFile('indexnow.json', JSON.stringify(indexNowPayload(urls)));

console.log(`Wrote ${Object.keys(files).length} files to ${out}/.`);
console.log(urls.length ? `New or changed since the last deploy:\n  ${urls.join('\n  ')}` : 'No URL changed since the last deploy.');
