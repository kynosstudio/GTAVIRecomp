// Private dashboard: live visitors, view stats and board moderation. Run locally (tools/serve.ps1),
// then open http://localhost:8080/dashboard/. Never deployed; everything is gated by admin-only
// database rules, so the page shows nothing without the admin's sign-in.
import { SUPABASE_URL, SUPABASE_KEY } from '../assets/js/config.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => new Intl.NumberFormat().format(n || 0);
const ago = (iso) => {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

let sb;

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    $('#db-login').hidden = false;
    $('#db-login').innerHTML = '<h1>Not connected yet</h1><p>Fill in assets/js/config.js with the Supabase project URL and publishable key first.</p>';
    return;
  }
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, detectSessionInUrl: true, storageKey: 'pw-dashboard' } });

  $('#login-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = ev.target.elements.email.value.trim();
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}${location.pathname}` } });
    $('#login-note').textContent = error ? error.message : 'Check your inbox and open the link in this browser.';
  });
  $('#db-signout').addEventListener('click', async () => { await sb.auth.signOut(); location.reload(); });
  sb.auth.onAuthStateChange((_e, session) => { if (session && $('#db-app').hidden) start(session); });

  const { data: { session } } = await sb.auth.getSession();
  if (session) start(session); else { $('#db-login').hidden = false; }
}

let started = false;
async function start(session) {
  if (started) return;
  started = true;
  $('#db-login').hidden = true;
  $('#db-signout').hidden = false;
  const { data: isAdmin, error } = await sb.rpc('claim_admin');
  if (error || !isAdmin) {
    $('#db-status').textContent = 'Signed in, but not the admin';
    $('#db-login').hidden = false;
    $('#db-login').innerHTML = `<h1>Not authorised</h1><p>${esc(session.user.email)} isn't the admin of this site. Only the first account to sign in becomes admin.</p>`;
    return;
  }
  $('#db-status').textContent = `Signed in as admin`;
  $('#db-app').hidden = false;
  watchFeed();
  await Promise.all([loadLive(), loadStats(), loadQueue(), loadRecent()]);
  // The backend is on the free plan (0.5 GB of RAM): on 2026-11-23 this page's 20 s / 60 s polling was about
  // half of the database's work and helped push it into swap. Refresh slowly, and not while the tab is hidden.
  every(60_000, loadLive);
  every(5 * 60_000, loadStats);
  every(120_000, () => { loadQueue(); loadRecent(); });
}

// Runs fn every `ms` while the tab is visible, and once on return if it missed a turn while hidden.
function every(ms, fn) {
  let last = Date.now();
  const run = () => { last = Date.now(); fn(); };
  setInterval(() => { if (!document.hidden) run(); }, ms);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - last >= ms) run(); });
}

/* ---------- People on the site right now ----------
   Counted from page views: everyone who opened a page in the last 5 minutes (one per browser tab).
   The database does the counting (admin_live); fetching every recent page view to count them here
   moved thousands of rows a minute under heavy traffic. */
const LIVE_WINDOW_MIN = 5;
async function loadLive() {
  const { data, error } = await sb.rpc('admin_live', { p_minutes: LIVE_WINDOW_MIN });
  if (error) { $('#live-note').textContent = `Couldn't count live visitors: ${error.message}`; return; }
  $('#live-count').textContent = fmt(data.total);
  $('#live-note').textContent = `active in the last ${LIVE_WINDOW_MIN} minutes · ${new Date().toLocaleTimeString()}`;
  $('#live-pages').innerHTML = (data.pages || []).map((p) => `<li>${esc(p.page)} · ${fmt(p.n)}</li>`).join('');
}

/* ---------- Numbers and charts ---------- */
async function loadStats() {
  const { data: s, error } = await sb.rpc('admin_stats');
  if (error) { $('#db-status').textContent = `Stats error: ${error.message}`; return; }
  const t = s.totals || {};
  const b = s.board || {};
  $('#tiles').innerHTML = [
    ['Views today', t.views_today], ['Visitors today', t.visitors_today], ['Views · 7 days', t.views_7d],
    ['Visitors · 7 days', t.visitors_7d], ['Posts today', b.today], ['Waiting for review', b.pending, b.pending > 0],
  ].map(([label, v, alert]) => `<div class="db-tile ${alert ? 'is-alert' : ''}"><b>${fmt(v)}</b><small>${label}</small></div>`).join('');
  $('#chart-hourly').innerHTML = bars(fill(s.hourly || [], 'hour', 48, 3600e3), (d) => new Date(d).getHours() + 'h');
  $('#chart-daily').innerHTML = bars(fill(s.daily || [], 'day', 30, 864e5), (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }));
  list('#top-pages', (s.pages || []).map((p) => [p.page, p.views]));
  list('#top-refs', (s.refs || []).map((r) => [r.ref, r.visitors]));
  $('#db-status').textContent = `Admin · updated ${new Date().toLocaleTimeString()}`;
}

// Fill gaps so quiet hours and days show as zero.
function fill(rows, key, n, step) {
  const map = new Map(rows.map((r) => [Math.floor(Date.parse(r[key]) / step), r]));
  const now = Math.floor(Date.now() / step);
  return Array.from({ length: n }, (_, i) => {
    const slot = now - (n - 1 - i);
    const r = map.get(slot);
    return { t: slot * step, views: r?.views || 0, visitors: r?.visitors || 0 };
  });
}

function bars(points, label) {
  const W = 600, H = 150, pad = 18;
  const max = Math.max(1, ...points.map((p) => p.views));
  const w = (W - pad) / points.length;
  const rects = points.map((p, i) => {
    const h = (p.views / max) * (H - pad - 6);
    const hv = (p.visitors / max) * (H - pad - 6);
    return `<rect x="${pad + i * w + 1}" y="${H - pad - h}" width="${Math.max(1, w - 2)}" height="${h}" rx="2" fill="url(#g)"><title>${label(p.t)}: ${p.views} views, ${p.visitors} visitors</title></rect>
            <rect x="${pad + i * w + w * 0.3}" y="${H - pad - hv}" width="${Math.max(1, w * 0.4)}" height="${hv}" rx="1" fill="currentColor" fill-opacity=".28"/>`;
  }).join('');
  const ticks = [0, Math.floor(points.length / 2), points.length - 1]
    .map((i) => `<text class="axis" x="${pad + i * w + w / 2}" y="${H - 4}" text-anchor="middle">${esc(label(points[i].t))}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Views chart">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7a5cff"/><stop offset="1" stop-color="#ff2e7e"/></linearGradient></defs>
    <text class="axis" x="0" y="10">${fmt(max)}</text>${rects}${ticks}</svg>`;
}

function list(sel, rows) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  $(sel).innerHTML = rows.length
    ? rows.map(([k, v]) => `<li><span>${esc(k)}</span><b>${fmt(v)}</b><i style="width:${(v / max) * 100}%"></i></li>`).join('')
    : '<li><span class="w-muted">No data yet</span></li>';
}

/* ---------- Moderation ---------- */
async function loadQueue() {
  const [{ data: th }, { data: po }] = await Promise.all([
    sb.from('threads').select('id,board,title,body,author,created_at,flag_reason').eq('status', 'pending').order('created_at').limit(50),
    sb.from('posts').select('id,thread_id,body,author,created_at,flag_reason').eq('status', 'pending').order('created_at').limit(50),
  ]);
  const items = [...(th || []).map((x) => ({ ...x, kind: 'threads' })), ...(po || []).map((x) => ({ ...x, kind: 'posts' }))]
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  $('#pending-count').textContent = items.length;
  $('#queue').innerHTML = items.length ? items.map(item).join('') : '<p class="w-muted">Nothing waiting. 🎉</p>';
}

async function loadRecent() {
  const { data } = await sb.from('posts').select('id,thread_id,body,author,created_at').eq('status', 'visible').order('created_at', { ascending: false }).limit(15);
  const { data: th } = await sb.from('threads').select('id,board,title,body,author,created_at').eq('status', 'visible').order('created_at', { ascending: false }).limit(10);
  const all = [...(th || []).map((x) => ({ ...x, kind: 'threads' })), ...(data || []).map((x) => ({ ...x, kind: 'posts' }))]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 20);
  $('#recent').innerHTML = all.length ? all.map((x) => item(x, true)).join('') : '<p class="w-muted">No posts yet.</p>';
}

function item(x, visible = false) {
  const where = x.kind === 'threads' ? `New thread in <b>${esc(x.board)}</b>: ${esc(x.title)}` : `Reply in thread <a href="../board.html#/t/${esc(x.thread_id)}" target="_blank">${esc(String(x.thread_id).slice(0, 8))}</a>`;
  return `<div class="db-item" data-kind="${x.kind}" data-id="${esc(x.id)}">
    <p class="p-meta">${where} · <b>${esc(x.author)}</b> · ${esc(ago(x.created_at))}${x.flag_reason ? ` · held: ${esc(x.flag_reason)}` : ''}</p>
    <div class="p-body">${esc(x.body)}</div>
    <div class="db-actions">${visible ? '' : '<button class="ok" data-set="visible">Approve</button>'}<button class="no" data-set="hidden">Hide</button></div>
  </div>`;
}

document.addEventListener('click', async (ev) => {
  const btn = ev.target.closest('[data-set]');
  if (!btn) return;
  const row = btn.closest('.db-item');
  btn.disabled = true;
  const { error } = await sb.from(row.dataset.kind).update({ status: btn.dataset.set }).eq('id', row.dataset.id);
  if (error) { btn.disabled = false; alert(error.message); return; }
  row.remove();
  loadQueue(); loadStats();
});

/* ---------- Live feed ---------- */
function watchFeed() {
  const push = (text) => {
    const li = document.createElement('li');
    li.innerHTML = `<time>${new Date().toLocaleTimeString()}</time><span>${text}</span>`;
    $('#feed').prepend(li);
    while ($('#feed').children.length > 40) $('#feed').lastChild.remove();
  };
  // Page views are no longer published to realtime (see supabase/schema.sql); only board activity is live.
  sb.channel('db-feed')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'threads' }, ({ new: t }) => { push(`<b>New thread</b> in ${esc(t.board)}: ${esc(t.title)}${t.status === 'pending' ? ' (held)' : ''}`); loadQueue(); loadRecent(); })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, ({ new: p }) => { push(`<b>New reply</b>${p.status === 'pending' ? ' (held)' : ''}: ${esc(p.body.slice(0, 80))}`); loadQueue(); loadRecent(); })
    .subscribe();
}

main();
