// GET /api/live -> {"n": people on the site now, or null when there's nothing to show; "at": when it was counted}
// for the homepage's "watching now" pill. A Cloudflare Pages Function: pages.yml deploys it with the site
// (wrangler picks up ./functions from the repo root), and only /api/* runs it, so static files stay free.
//
// Visitors never call Supabase for this. The count is asked for at most once a minute per Cloudflare data
// centre: first this isolate's own copy, then the data centre's cache, then one call to live_viewers (which
// itself recounts at most once a minute). Failures are cached the same way, so an outage isn't hammered.
// On the free plan Functions get 100k requests a day; past that the call fails and the pill just stays hidden.
import { SUPABASE_URL, SUPABASE_KEY, STATS_PAUSED } from '../../assets/js/config.js';

const TTL_MS = 60_000;
let memo = null;     // { body, at } for this isolate
let pending = null;  // the one Supabase call in flight from this isolate

async function askDatabase() {
  if (STATS_PAUSED || !SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/live_viewers`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const n = await res.json();
    return Number.isInteger(n) ? n : null;
  } catch {
    return null;
  }
}

const reply = ({ body, at }) => new Response(body, {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    // Browsers and the data centre's cache keep it until the minute is up.
    'Cache-Control': `public, max-age=${Math.max(1, Math.ceil((at + TTL_MS - Date.now()) / 1000))}`,
  },
});

const fresh = (m) => m && Date.now() - m.at < TTL_MS;

export async function onRequestGet(context) {
  if (fresh(memo)) return reply(memo);

  const cache = globalThis.caches?.default;
  const key = new Request(new URL('/api/live', context.request.url).toString());
  try {
    const hit = cache && await cache.match(key);
    if (hit) {
      const body = await hit.text();
      const at = Number(JSON.parse(body).at);
      if (Number.isFinite(at)) {
        memo = { body, at };
        if (fresh(memo)) return reply(memo);
      }
    }
  } catch { /* a cache problem must not stop the answer */ }

  pending ??= askDatabase()
    .then((n) => { const at = Date.now(); return { body: JSON.stringify({ n, at }), at }; })
    .finally(() => { pending = null; });
  const result = await pending;
  memo = result;
  if (cache) context.waitUntil(cache.put(key, reply(result)).catch(() => {}));
  return reply(result);
}
