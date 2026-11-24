// Optional news desk: Claude searches the web for meaningful developments (takedowns, bans,
// confirmed leaks, legal news, scams, official announcements) and writes short original
// articles with sources. Enabled when ANTHROPIC_API_KEY is set. Node only.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5-5';
const MAX_ARTICLES = 2;
const CATEGORIES = ['Leak', 'Takedown', 'Legal', 'Security', 'Official', 'Port'];
const UA = 'Mozilla/5.0 (compatible; PortWatchVI-news/1.0)';

const SYSTEM = `You are the news desk for PortWatch VI, a fan-run tracker of community efforts to run the leaked Xbox Series build of Grand Theft Auto VI on PC.

Find meaningful developments from roughly the last three days and write short news articles about them. Meaningful means things like: Rockstar or Take-Two takedowns, DMCA notices, account bans or lawsuits; new leaks confirmed by reputable outlets; court cases; scams and malware aimed at people looking for the game; official announcements (a PC version, statements about the leak); a port project reaching a real milestone that reputable outlets have reported.

Rules:
- Search the web first. Use only facts from pages you actually found, and cite them as sources. Prefer established news outlets and primary documents such as court filings or the GitHub DMCA repository.
- Skip rumours, single social posts, opinion pieces and anything already covered in the list of existing articles.
- Write in your own words. Don't copy sentences, and quote at most a few words. Each article has a headline under 90 characters, a one-sentence standfirst, and 3 or 4 short paragraphs (120 to 220 words in total) in a plain, factual tone for gamers.
- Never link to, name or describe ways to obtain leaked files, executables, keys or torrents. Don't name private individuals unless they are public figures or named parties in public court cases.
- If nothing new qualifies, record an empty list. That's a normal outcome.

When done, call record_news exactly once.`;

const str = { type: 'string' };
const RECORD = {
  name: 'record_news',
  description: 'Record the finished news articles (possibly none). Call exactly once.',
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['articles'],
    properties: {
      articles: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['category', 'date', 'title', 'dek', 'body', 'sources', 'image_source_url'],
          properties: {
            category: { type: 'string', enum: CATEGORIES },
            date: { type: 'string', description: 'Date of the event, YYYY-MM-DD.' },
            title: str,
            dek: str,
            body: { type: 'array', items: str },
            sources: {
              type: 'array',
              items: { type: 'object', additionalProperties: false, required: ['outlet', 'title', 'url'], properties: { outlet: str, title: str, url: str } },
            },
            image_source_url: { type: 'string', description: 'URL of the source page whose preview image best fits the article.' },
          },
        },
      },
    },
  },
};

export async function writeNews({ existing = [], today, log = console.log, apiKey } = {}) {
  const client = new Anthropic(apiKey ? { apiKey } : undefined);
  const covered = existing.slice(0, 30).map((n) => `- ${n.date}: ${n.title} (${(n.sources || []).map((s) => s.url).join(', ')})`).join('\n') || '- none yet';
  const messages = [{
    role: 'user',
    content: `Today is ${today}.\n\nExisting articles (don't repeat these):\n${covered}\n\nFind what's new and meaningful, then call record_news.`,
  }];
  const seen = new Set(); // every URL the web search returned, so citations can be checked

  for (let turn = 0; turn < 6; turn++) {
    let res;
    try {
      res = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'high' },
        system: SYSTEM,
        tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }, RECORD],
        tool_choice: { type: 'auto' },
        messages,
      });
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) log('  ! News: Claude rate limited; skipping today');
      else if (err instanceof Anthropic.APIError) log(`  ! News: Claude API error ${err.status}: ${err.message}`);
      else throw err;
      return [];
    }

    for (const block of res.content) {
      if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
        for (const r of block.content) if (r.url) seen.add(normUrl(r.url));
      }
    }
    if (res.stop_reason === 'refusal') { log('  ! News: request declined'); return []; }
    const call = res.content.find((b) => b.type === 'tool_use' && b.name === 'record_news');
    if (call) return finalize(call.input.articles || [], { seen, existing, today, log });

    messages.push({ role: 'assistant', content: res.content });
    if (res.stop_reason === 'pause_turn') continue; // server tool loop paused; resume it
    messages.push({ role: 'user', content: 'Please call record_news now with your result (an empty list if nothing qualifies).' });
  }
  log('  ! News: no result after several turns');
  return [];
}

const normUrl = (u) => String(u || '').replace(/#.*$/, '').replace(/\/$/, '').toLowerCase();
const short = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

async function finalize(articles, { seen, existing, today, log }) {
  const knownUrls = new Set(existing.flatMap((n) => (n.sources || []).map((s) => normUrl(s.url))));
  const knownTitles = existing.map((n) => n.title.toLowerCase());
  const out = [];
  for (const a of articles) {
    const sources = (a.sources || []).filter((s) => /^https:\/\//.test(s.url) && seen.has(normUrl(s.url))).slice(0, 4);
    if (!sources.length) { log(`  - News: dropped "${short(a.title, 60)}" (no verifiable source)`); continue; }
    if (sources.some((s) => knownUrls.has(normUrl(s.url))) || knownTitles.includes(String(a.title).toLowerCase())) continue;
    const body = (a.body || []).map((p) => short(p, 900)).filter(Boolean).slice(0, 5);
    if (body.length < 2 || !CATEGORIES.includes(a.category)) continue;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(a.date) && a.date <= today ? a.date : today;
    const imgFrom = sources.find((s) => normUrl(s.url) === normUrl(a.image_source_url)) || sources[0];
    const image = await previewImage(imgFrom.url).catch(() => null);
    out.push({
      id: `${date}-${short(a.title, 40).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      date,
      category: a.category,
      title: short(a.title, 110),
      dek: short(a.dek, 240),
      body,
      sources: sources.map((s) => ({ outlet: short(s.outlet, 60), title: short(s.title, 160), url: s.url })),
      image: image ? { url: image, credit: short(imgFrom.outlet, 60), link: imgFrom.url } : null,
      by: 'claude',
    });
    if (out.length >= MAX_ARTICLES) break;
  }
  return out;
}

// The page's own social preview image (og:image), shown as a credited thumbnail linking back.
export async function previewImage(pageUrl) {
  const res = await fetch(pageUrl, { headers: { 'User-Agent': UA, Accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
  if (!res.ok) return null;
  const html = (await res.text()).slice(0, 400_000);
  const tag = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*>/i)?.[0] || '';
  const url = tag.match(/content=["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&');
  return url && /^https:\/\//.test(url) ? url : null;
}
