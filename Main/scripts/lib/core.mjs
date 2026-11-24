// Source adapters and heuristics for the scout.
// Uses only fetch + Web Crypto so it runs in Node 20+ and in a browser (for local testing).

export const UA = 'PortWatchVI-scout/1.0 (+https://github.com)';
const IN_NODE = typeof window === 'undefined';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class RateLimitError extends Error {
  constructor(resetEpoch) {
    super(`GitHub rate limit hit; resets at ${resetEpoch ? new Date(resetEpoch * 1000).toISOString() : 'unknown'}`);
    this.resetEpoch = resetEpoch;
  }
}

/* ---------- GitHub ---------- */
export function makeGitHub({ token } = {}) {
  let calls = 0;
  async function req(path, { accept = 'application/vnd.github+json', raw = false } = {}) {
    const url = path.startsWith('http') ? path : `https://api.github.com${path}`;
    const headers = { Accept: accept, 'X-GitHub-Api-Version': '2022-11-28' };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (IN_NODE) headers['User-Agent'] = UA;
    calls++;
    const res = await fetch(url, { headers });
    if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
      throw new RateLimitError(+res.headers.get('x-ratelimit-reset'));
    }
    // 404 = deleted/private, 451 = blocked (DMCA). Both mean "gone".
    if (res.status === 404 || res.status === 451 || res.status === 409) return { status: res.status, data: null };
    if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
    return { status: res.status, data: raw ? await res.text() : await res.json() };
  }

  const toMeta = (d) => ({
    fullName: d.full_name,
    name: d.name,
    owner: d.owner?.login,
    description: d.description || '',
    language: d.language || null,
    size: d.size || 0,
    stars: d.stargazers_count || 0,
    forks: d.forks_count || 0,
    openIssues: d.open_issues_count || 0,
    createdAt: d.created_at,
    pushedAt: d.pushed_at,
    defaultBranch: d.default_branch,
    fork: !!d.fork,
    archived: !!d.archived,
    topics: d.topics || [],
    url: d.html_url,
  });

  return {
    get calls() { return calls; },
    toMeta,
    async repo(full) {
      const r = await req(`/repos/${full}`);
      return r.data ? toMeta(r.data) : { missing: true, status: r.status };
    },
    async commitsSince(full, branch, sinceIso) {
      const q = new URLSearchParams({ since: sinceIso, per_page: '100' });
      if (branch) q.set('sha', branch);
      const r = await req(`/repos/${full}/commits?${q}`);
      return Array.isArray(r.data) ? r.data.length : null;
    },
    async recentCommits(full, branch, n = 25) {
      const q = new URLSearchParams({ per_page: String(n) });
      if (branch) q.set('sha', branch);
      const r = await req(`/repos/${full}/commits?${q}`);
      return Array.isArray(r.data)
        ? r.data.map((c) => ({ date: c.commit?.author?.date, message: (c.commit?.message || '').split('\n')[0].slice(0, 200) }))
        : [];
    },
    async readme(full, branch) {
      const q = branch ? `?ref=${encodeURIComponent(branch)}` : '';
      const r = await req(`/repos/${full}/readme${q}`, { accept: 'application/vnd.github.raw+json', raw: true });
      return r.data;
    },
    async search(q, perPage = 50) {
      const p = new URLSearchParams({ q, sort: 'updated', order: 'desc', per_page: String(perPage) });
      const r = await req(`/search/repositories?${p}`);
      return (r.data?.items || []).map(toMeta);
    },
  };
}

/* ---------- Hacker News (Algolia, no key) ---------- */
export async function hnSearch(query, sinceEpoch) {
  const p = new URLSearchParams({ query, tags: 'story', hitsPerPage: '50' });
  if (sinceEpoch) p.set('numericFilters', `created_at_i>${sinceEpoch}`);
  const res = await fetch(`https://hn.algolia.com/api/v1/search_by_date?${p}`);
  if (!res.ok) throw new Error(`HN ${res.status}`);
  const json = await res.json();
  return (json.hits || []).map((h) => ({
    source: 'Hacker News',
    title: h.title || '',
    text: `${h.title || ''} ${h.url || ''} ${h.story_text || ''}`,
    link: `https://news.ycombinator.com/item?id=${h.objectID}`,
    score: h.points || 0,
  }));
}

/* ---------- Reddit (OAuth app-only if keys are set, else public JSON) ---------- */
export async function redditToken(clientId, clientSecret) {
  if (!clientId || !clientSecret) return null;
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(IN_NODE ? { 'User-Agent': UA } : {}),
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`Reddit auth ${res.status}`);
  return (await res.json()).access_token;
}

export async function redditSearch({ subreddit, query, token }) {
  const p = new URLSearchParams({ q: query, sort: 'new', t: 'week', limit: '50', raw_json: '1' });
  if (subreddit) p.set('restrict_sr', '1');
  const path = subreddit ? `/r/${subreddit}/search` : '/search';
  const url = token ? `https://oauth.reddit.com${path}?${p}` : `https://www.reddit.com${path}.json?${p}`;
  const headers = IN_NODE ? { 'User-Agent': UA } : {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Reddit ${res.status}`);
  const json = await res.json();
  return (json.data?.children || []).map(({ data: d }) => ({
    source: `r/${d.subreddit}`,
    title: d.title || '',
    text: `${d.title || ''} ${d.url || ''} ${d.selftext || ''}`,
    link: `https://www.reddit.com${d.permalink}`,
    score: d.score || 0,
  }));
}

/* ---------- 4chan (free read-only JSON API, no key; max 1 request per second) ---------- */
const decode4 = (html) => String(html || '')
  .replace(/<wbr>/gi, '') // 4chan inserts <wbr> inside long URLs
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')
  .replace(/\[\.\]|\(dot\)|\s+dot\s+(?=com\b)/gi, '.'); // "github[.]com" style obfuscation

const CHAN_GTA = /(gta ?(vi|6)|grand theft|scarlett|leonida|xbox series)/i;
const CHAN_PORT = /(recomp|emulat|\bport\b|\.exe|executable|leak|\bbuild\b|github|scarlett|leonida|cyberle+k)/i;
const CHAN_GENERAL = /\/(gtag|emugen)\//i;

export async function fourchanSearch(board, { maxThreads = 8 } = {}) {
  const headers = IN_NODE ? { 'User-Agent': UA } : {};
  const res = await fetch(`https://a.4cdn.org/${board}/catalog.json`, { headers });
  if (!res.ok) throw new Error(`4chan /${board}/ ${res.status}`);
  const threads = (await res.json()).flatMap((p) => p.threads || []);
  const picked = threads
    .filter((t) => {
      const sub = decode4(t.sub || '');
      if (/^\s*\/\w+\/\s*-/.test(sub)) return CHAN_GENERAL.test(sub); // other "/xyz/ - General" threads: skip
      const s = `${sub} ${decode4(t.com || '')}`;
      return CHAN_GTA.test(s) && CHAN_PORT.test(s);
    })
    .sort((a, b) => (b.replies || 0) - (a.replies || 0))
    .slice(0, maxThreads);
  const out = [];
  for (const t of picked) {
    await sleep(1100);
    const tr = await fetch(`https://a.4cdn.org/${board}/thread/${t.no}.json`, { headers });
    if (!tr.ok) continue;
    const posts = (await tr.json()).posts || [];
    out.push({
      source: `4chan /${board}/`,
      title: decode4(t.sub || t.com || '').slice(0, 120),
      text: posts.map((p) => decode4(p.com)).join(' '),
      link: `https://boards.4chan.org/${board}/thread/${t.no}`,
      score: t.replies || 0,
    });
  }
  return out;
}

/* ---------- Bluesky (public AppView search, no key) ---------- */
export async function blueskySearch(query) {
  const p = new URLSearchParams({ q: query, sort: 'latest', limit: '50' });
  const res = await fetch(`https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?${p}`, { headers: IN_NODE ? { 'User-Agent': UA } : {} });
  if (!res.ok) throw new Error(`Bluesky ${res.status}`);
  return ((await res.json()).posts || []).map((post) => ({
    source: 'Bluesky',
    title: String(post.record?.text || '').slice(0, 120),
    text: JSON.stringify([post.record, post.embed]), // links live in facets and embeds
    link: `https://bsky.app/profile/${post.author?.handle}/post/${String(post.uri || '').split('/').pop()}`,
    score: (post.likeCount || 0) + (post.repostCount || 0),
  }));
}

/* ---------- Mastodon (public hashtag timelines, no key) ---------- */
export async function mastodonTag(tag, instance = 'mastodon.social') {
  const res = await fetch(`https://${instance}/api/v1/timelines/tag/${encodeURIComponent(tag)}?limit=40`, { headers: IN_NODE ? { 'User-Agent': UA } : {} });
  if (!res.ok) throw new Error(`Mastodon #${tag} ${res.status}`);
  return ((await res.json()) || []).map((s) => ({
    source: 'Mastodon',
    title: decode4(s.content).slice(0, 120),
    text: `${decode4(s.content)} ${s.card?.url || ''}`,
    link: s.url,
    score: (s.favourites_count || 0) + (s.reblogs_count || 0),
  }));
}

/* ---------- Lemmy (public search, no key) ---------- */
export async function lemmySearch(query, instance = 'lemmy.world') {
  const p = new URLSearchParams({ q: query, type_: 'Posts', sort: 'New', limit: '30' });
  const res = await fetch(`https://${instance}/api/v3/search?${p}`, { headers: IN_NODE ? { 'User-Agent': UA } : {} });
  if (!res.ok) throw new Error(`Lemmy ${res.status}`);
  return ((await res.json()).posts || []).map(({ post, counts }) => ({
    source: 'Lemmy',
    title: post.name || '',
    text: `${post.name || ''} ${post.url || ''} ${post.body || ''}`,
    link: post.ap_id,
    score: counts?.score || 0,
  }));
}

/* ---------- GitLab (public project search, no key) — where projects go after a GitHub takedown ---------- */
export async function gitlabSearch(query, sinceIso) {
  const p = new URLSearchParams({ search: query, order_by: 'last_activity_at', per_page: '30', simple: 'true' });
  if (sinceIso) p.set('last_activity_after', sinceIso);
  const res = await fetch(`https://gitlab.com/api/v4/projects?${p}`, { headers: IN_NODE ? { 'User-Agent': UA } : {} });
  if (!res.ok) throw new Error(`GitLab ${res.status}`);
  return ((await res.json()) || []).map((pr) => ({
    host: 'gitlab',
    id: pr.id,
    fullName: pr.path_with_namespace,
    name: pr.path,
    description: pr.description || '',
    stars: pr.star_count || 0,
    createdAt: pr.created_at,
    pushedAt: pr.last_activity_at,
    defaultBranch: pr.default_branch || 'main',
    url: pr.web_url,
  }));
}
export async function gitlabReadme(meta) {
  for (const f of ['README.md', 'readme.md', 'README']) {
    const res = await fetch(`https://gitlab.com/api/v4/projects/${meta.id}/repository/files/${encodeURIComponent(f)}/raw?ref=${encodeURIComponent(meta.defaultBranch)}`, { headers: IN_NODE ? { 'User-Agent': UA } : {} });
    if (res.ok) return res.text();
  }
  return '';
}

/* ---------- News headlines (Google News + Bing News RSS, no key) ---------- */
const xmlText = (s) => String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '')
  .replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').trim();
const tagOf = (block, tag) => block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))?.[1] || '';

export async function newsFeed(url, feedName) {
  const res = await fetch(url, { headers: IN_NODE ? { 'User-Agent': 'Mozilla/5.0 (compatible; PortWatchVI/1.0)' } : {} });
  if (!res.ok) throw new Error(`${feedName} ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(([, b]) => {
    let title = xmlText(tagOf(b, 'title'));
    let outlet = xmlText(tagOf(b, 'source')) || xmlText(tagOf(b, 'News:Source'));
    if (!outlet && / - [^-]{2,40}$/.test(title)) outlet = title.split(' - ').pop();
    if (outlet && title.endsWith(` - ${outlet}`)) title = title.slice(0, -(outlet.length + 3));
    let link = xmlText(tagOf(b, 'link'));
    // Bing wraps links in a click-tracker; the real article URL is in its "url" parameter.
    try { const real = new URL(link).searchParams.get('url'); if (/bing\.com\/news\/apiclick/i.test(link) && real) link = real; } catch {}
    link = link.replace(/^http:\/\//i, 'https://');
    const t = Date.parse(xmlText(tagOf(b, 'pubDate')));
    return { title, outlet: outlet || feedName, link, date: Number.isFinite(t) ? new Date(t).toISOString() : null, via: feedName };
  }).filter((h) => /^https:\/\//.test(h.link) && h.title && h.date);
}
// Keep only headlines about the leak, ports, takedowns, scams or official news.
const HEADLINE_RE = /(gta ?(vi|6)|grand theft auto (vi|6)).*(leak|pc\b|port|emulat|recomp|dmca|take-two|takedown|lawsuit|rockstar|cyberle+k|hack|malware|scam|fake|executable|xbox build|ban)|(leak|pc\b|port|emulat|recomp|dmca|take-two|takedown|lawsuit|cyberle+k|hack|malware|scam|fake|executable|xbox build|ban).*(gta ?(vi|6)|grand theft auto (vi|6))/i;
export const isLeakHeadline = (h) => HEADLINE_RE.test(h.title);

/* ---------- GitHub DMCA notices (github/dmca repo) ---------- */
const DMCA_FILE = /(take-?two|rockstar|2k-games)/i;
export async function dmcaNotices(gh, sinceIso, token) {
  const headers = { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(IN_NODE ? { 'User-Agent': UA } : {}) };
  const res = await fetch(`https://api.github.com/repos/github/dmca/commits?since=${encodeURIComponent(sinceIso)}&per_page=60`, { headers });
  if (!res.ok) throw new Error(`DMCA log ${res.status}`);
  const commits = await res.json();
  const notices = [];
  for (const c of commits) {
    const msg = c.commit?.message || '';
    // Commit messages normally name the notice file; only open the ones that look like Take-Two / Rockstar.
    if (!DMCA_FILE.test(msg)) continue;
    const d = await fetch(`https://api.github.com/repos/github/dmca/commits/${c.sha}`, { headers });
    if (!d.ok) continue;
    for (const f of (await d.json()).files || []) {
      if (!DMCA_FILE.test(f.filename) || !/\.md$/.test(f.filename) || f.status === 'removed') continue;
      const raw = await fetch(`https://raw.githubusercontent.com/github/dmca/master/${f.filename.split('/').map(encodeURIComponent).join('/')}`);
      const body = raw.ok ? await raw.text() : '';
      notices.push({
        path: f.filename,
        url: `https://github.com/github/dmca/blob/master/${f.filename}`,
        date: (f.filename.match(/\d{4}-\d{2}-\d{2}/) || [c.commit?.author?.date?.slice(0, 10)])[0],
        repos: extractGithubRepos(body),
        gta6: /(gta ?(vi|6)|grand theft auto (vi|6))/i.test(body),
      });
    }
  }
  return notices;
}

/* ---------- X (needs a paid API bearer token) ---------- */
export async function xSearch(query, bearer) {
  if (!bearer) return [];
  const p = new URLSearchParams({ query, max_results: '100', 'tweet.fields': 'entities,public_metrics,created_at' });
  const res = await fetch(`https://api.x.com/2/tweets/search/recent?${p}`, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!res.ok) throw new Error(`X ${res.status}`);
  const json = await res.json();
  return (json.data || []).map((t) => ({
    source: 'X',
    title: (t.text || '').slice(0, 120),
    text: `${t.text || ''} ${(t.entities?.urls || []).map((u) => u.expanded_url).join(' ')}`,
    link: `https://x.com/i/status/${t.id}`,
    score: (t.public_metrics?.like_count || 0) + (t.public_metrics?.retweet_count || 0),
  }));
}

/* ---------- Helpers ---------- */
const RESERVED_OWNERS = new Set(['features', 'topics', 'sponsors', 'orgs', 'settings', 'marketplace', 'apps', 'login', 'about', 'pricing', 'collections', 'trending', 'search', 'notifications', 'explore', 'issues', 'pulls', 'site', 'contact', 'enterprise', 'readme']);

export function extractGithubRepos(text) {
  const out = new Set();
  const re = /github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9_.-]{1,100})/g;
  for (const m of String(text || '').matchAll(re)) {
    const ownerName = m[1];
    let repo = m[2].replace(/\.git$/i, '').replace(/[.,;:)!?]+$/, '');
    if (!repo || RESERVED_OWNERS.has(ownerName.toLowerCase())) continue;
    out.add(`${ownerName}/${repo}`);
  }
  return [...out];
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const normDesc = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const SPAM_NAME = /(switch[-_ ]?version|pc[-_ ]?emulator[-_ ]?20\d\d|free[-_ ]?download|crack(ed)?\b|installer|torrent|\bapk\b|keygen|repack|full[-_ ]?game|unlocked)/i;
const SPAM_DESC = /(free download|download (now|free|here|link)|installer hub|full version|no survey|cracked|unlock(ed)? all|working 100%|pc installer)/i;

export function spamCheck(meta, descCounts) {
  const name = `${meta.name || ''}`;
  if (/switch[-_ ]?version.*emulator/i.test(name)) return { cluster: 'switch-emulator-network', reason: 'Clone of the "Switch Version PC Emulator" network' };
  if (SPAM_NAME.test(name)) return { cluster: 'auto-download-lures', reason: 'Name matches a download-lure pattern' };
  const d = normDesc(meta.description);
  if (d.length > 25 && (descCounts.get(d) || 0) >= 3) return { cluster: 'auto-clone-networks', reason: 'Same description on three or more different repos' };
  if (SPAM_DESC.test(meta.description || '')) return { cluster: 'auto-download-lures', reason: 'Description promotes a download' };
  return null;
}

const TECH = ['pe loader', 'pe32+', 'imports', 'd3d12', 'd3d12_xs', 'xgameruntime', 'kernelx', 'xmem', 'gdk', 'rdna2', 'rdna 2', 'spir-v', 'spirv', 'dxil', 'hlsl', 'shader', 'recompil', 'relink', 'vulkan', 'directstorage', 'bcpack', 'xma2', 'swizzle', 'tiling', 'unicorn', 'hle', 'iat', 'tls', 'relocation', 'command list', 'descriptor', 'pipeline', 'rpf9', 'ttpf', 'awc', 'bink'];
// Relevant = clearly about GTA VI, or substantially about Xbox Series/GDK rather than another console.
// (A single "Xbox Series" mention in, say, an Xbox 360 port's button-prompt list doesn't count.)
const STRONG_REL = /(gta ?(vi|6)|grand theft auto (vi|6)|leonida|rpf9|cyberle+k)/i;
const XS_REL = /(scarlett|xbox series|series x\|s|series x|\bgdk\b|game ?core|d3d12_xs|xgameruntime|kernelx|gen9)/gi;
const OTHER_CONSOLE = /(xbox 360|xenon|\bxex\b|playstation 3|\bps3\b|\bps4\b|\bps2\b|wii u|\bwii\b|nintendo switch|gamecube|\bn64\b)/gi;
export function isRelevant(meta, readme = '') {
  const blob = `${meta.name || ''} ${meta.fullName || ''} ${meta.description || ''} ${readme}`;
  if (STRONG_REL.test(blob)) return true;
  const xs = (blob.match(XS_REL) || []).length;
  const other = (blob.match(OTHER_CONSOLE) || []).length;
  return xs >= 3 && xs >= other;
}
const TOOLISH = /(extract|explorer|archive|viewer|asset|rpf9|ttpf|awc|texture|decoder|format notes)/i;
const RUNTIMEISH = /(loader|d3d12_xs|xgameruntime|kernelx|compatibility layer|translation layer|emulat|recompil|relink|runtime|hle)/i;

export function substance(meta, readme = '', commits7d = null) {
  const text = String(readme || '').toLowerCase();
  const signals = [];
  let score = 0;
  if (meta.language) { score += 10; signals.push(meta.language); }
  if (meta.size > 300) score += 8;
  if (meta.size > 2000) score += 6;
  if (text.length > 1500) score += 8;
  if (text.length > 6000) score += 6;
  const hits = TECH.filter((k) => text.includes(k));
  score += Math.min(30, hits.length * 3);
  if (hits.length >= 3) signals.push(`${hits.length} technical terms`);
  if (/✅|❌|🟡|\|\s*(status|state|progress)\s*\|/i.test(readme)) { score += 8; signals.push('status table'); }
  if (/(\d+\s*\/\s*\d+\s*(tests|checks|passing))|tests? passing|ctest|cargo test|pytest|unit tests/i.test(readme)) { score += 7; signals.push('tests'); }
  if (commits7d != null) { score += Math.min(15, commits7d); if (commits7d) signals.push(`${commits7d >= 100 ? '100+' : commits7d} commits/7d`); }
  if (/(download|installer)/i.test(text) && hits.length < 3) score -= 25;
  if (/(ai hallucination|doesn'?t work|does not work|joke repo|meme)/i.test(text)) score -= 20;
  const blob = `${meta.name} ${meta.description} ${readme}`;
  const relevant = isRelevant(meta, readme);
  const kind = TOOLISH.test(blob) && !RUNTIMEISH.test(blob) ? 'tool' : 'effort';
  return { score: Math.max(0, Math.min(100, score)), signals, relevant, kind };
}

// Spot new milestone claims for GTA VI in a README, ignoring negated or future-tense lines.
const GTA = '(gta ?(vi|6)|grand theft auto (vi|6))';
const CLAIMS = [
  { milestone: 'stability', re: new RegExp(`${GTA}[^\\n]{0,140}(stable|no crashes|hours without crash)`, 'i') },
  { milestone: 'perf', re: new RegExp(`${GTA}[^\\n]{0,140}\\b([3-9]\\d|1\\d\\d)\\s?fps`, 'i') },
  { milestone: 'playable', re: new RegExp(`${GTA}[^\\n]{0,140}(gameplay|playable|driving|walk(ing)? around|pad input|controller input|pause menu)`, 'i') },
  { milestone: 'world', re: new RegExp(`${GTA}[^\\n]{0,140}(in[- ]game|story mode|the world|open world|prologue|first mission)`, 'i') },
  { milestone: 'menu', re: new RegExp(`${GTA}[^\\n]{0,140}(main menu|title screen|start screen)`, 'i') },
  { milestone: 'boots', re: new RegExp(`${GTA}[^\\n]{0,140}(boots|first frame|intro|logos|loading screen|splash)`, 'i') },
  { milestone: 'loads', re: new RegExp(`${GTA}[^\\n]{0,140}(entry ?point (runs|reached)|executable (loads|runs)|imports resolve)`, 'i') },
];
const NEGATED = /(\bno\b|\bnot\b|n't\b|\bnever\b|❌|blocked|\buntil\b|\bonce\b|\bwhen\b|\bwill\b|\bplan|todo|\bgoal\b|\bwaiting\b|\bmissing\b|\bif\b|\bcan(not)?\b)/i;
// Tracks (perf, stability) sit after Playable: claims about them matter once a build plays.
const ORDER = ['groundwork', 'loads', 'boots', 'menu', 'world', 'playable', 'perf', 'stability', 'complete'];

export function detectClaims(readme, reachedKey = 'groundwork') {
  const reachedIdx = ORDER.indexOf(reachedKey);
  const out = [];
  for (const line of String(readme || '').split('\n')) {
    if (line.length > 400 || NEGATED.test(line)) continue;
    for (const c of CLAIMS) {
      if (ORDER.indexOf(c.milestone) <= reachedIdx) continue;
      if (c.re.test(line)) {
        out.push({ milestone: c.milestone, text: line.replace(/[#*|`>_[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220) });
        break;
      }
    }
  }
  return out.slice(0, 3);
}

// README similarity: share of 5-word shingles in common, relative to the shorter text.
// Catches re-uploads of tracked projects even when renamed or lightly edited.
export function shingles(text) {
  const w = String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean);
  const s = new Set();
  for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(' '));
  return s;
}
export function overlap(a, b) {
  if (!a?.size || !b?.size) return 0;
  let n = 0;
  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  for (const x of small) if (big.has(x)) n++;
  return n / small.size;
}

// Original fan-made games (e.g. AI-agent game bounties) mention GTA 6 but aren't ports.
// (Deliberately narrow: ports routinely say "original game files", so generic phrases don't count.)
const FAN_GAME = /(open[- ]world crime game|bounty entry|make\.fun|built by an ai agent|three\.js[^\n]{0,60}\bgame\b|\bgame\b[^\n]{0,60}three\.js)/i;
export function isFanGame(meta, readme = '') {
  return FAN_GAME.test(`${meta.description || ''} ${String(readme).slice(0, 1500)}`);
}

export { sleep };
