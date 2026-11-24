// Pinned message editor for the private dashboard. It doesn't need the Supabase sign-in, so it still works
// when the database is down: the message is a static file, data/pinned.json, and publishing commits that
// file to main through GitHub's API. The deploy workflow then puts it live in about two minutes.
// Publishing needs the owner's fine-grained GitHub token (this repo only, Contents: read and write),
// kept in this browser's localStorage on this PC. It's sent only to api.github.com.
import { fillPinned, PINNED_MAX } from '../assets/js/pinned.js';

const REPO = '4lwayz/portwatch-vi';
const FILE = 'data/pinned.json';
const API = `https://api.github.com/repos/${REPO}/contents/${FILE}`;
const TOKEN_KEY = 'pw-gh-token';
const DEFAULTS = { show: false, name: '4lwayz', avatar: 'assets/img/4lwayz-2.jpg', text: '', updated: null };

const $ = (s) => document.querySelector(s);
const ago = (iso) => {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

let current = { ...DEFAULTS }; // the file as last loaded or published
let sha = null; // its blob sha on main, needed to update it
let busy = false;

const token = () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
const note = (html, kind = '') => { const el = $('#pin-note'); el.className = `fine pin-note ${kind}`; el.innerHTML = html; };

const b64encode = (str) => { let bin = ''; for (const b of new TextEncoder().encode(str)) bin += String.fromCharCode(b); return btoa(bin); };
const b64decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

function gh(method = 'GET', body) {
  return fetch(method === 'GET' ? `${API}?ref=main` : API, {
    method,
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${token()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function ghError(res) {
  if (res.status === 401) return 'GitHub rejected the token. It may have expired: make a new one below.';
  if (res.status === 403 || res.status === 404) return `The token can't write to ${REPO}. It needs this repository and Contents: read and write.`;
  return `GitHub answered HTTP ${res.status}.`;
}

// The current file: from GitHub when there's a token (always up to date), else from this checkout.
async function load() {
  if (token()) {
    const res = await gh();
    if (res.status === 404) { sha = null; return { ...DEFAULTS }; }
    if (!res.ok) throw new Error(ghError(res));
    const j = await res.json();
    sha = j.sha;
    return { ...DEFAULTS, ...JSON.parse(b64decode(j.content)) };
  }
  const res = await fetch(`../${FILE}?ts=${Date.now()}`, { cache: 'no-store' });
  return res.ok ? { ...DEFAULTS, ...(await res.json()) } : { ...DEFAULTS };
}

function showState() {
  const live = current.show !== false && String(current.text || '').trim();
  const pill = $('#pin-state');
  pill.textContent = live ? 'Live' : 'Not shown';
  pill.classList.toggle('is-off', !live);
}

function preview() {
  const text = $('#pin-input').value;
  $('#pin-chars').textContent = `${text.length}/${PINNED_MAX}`;
  const shown = fillPinned($('#pin-preview .pinned'), { ...current, show: true, text, updated: new Date().toISOString() }, { ago, base: '../' });
  $('#pin-empty').hidden = shown;
}

async function publish(show) {
  if (busy) return;
  if (!token()) { $('#pin-token-box').open = true; $('#pin-token').focus(); note('Add your GitHub token first (below).', 'is-bad'); return; }
  const text = $('#pin-input').value.trim();
  if (show && !text) { note('Write a message first.', 'is-bad'); return; }

  const next = {
    show,
    name: current.name || DEFAULTS.name,
    avatar: current.avatar || DEFAULTS.avatar,
    text: show ? text : current.text || text,
    updated: show ? new Date().toISOString().replace(/\.\d+Z$/, 'Z') : current.updated,
  };
  const oneLine = next.text.replace(/\s+/g, ' ');
  const body = {
    message: show ? `Pinned message: "${oneLine.length > 60 ? `${oneLine.slice(0, 57)}...` : oneLine}"` : 'Pinned message: taken down',
    content: b64encode(`${JSON.stringify(next, null, 2)}\n`),
    branch: 'main',
  };

  busy = true;
  $('#pin-form').classList.add('is-busy');
  note(show ? 'Publishing…' : 'Taking it down…');
  try {
    if (!sha) await load().catch(() => {}); // pick up the sha if the file exists
    let res = await gh('PUT', sha ? { ...body, sha } : body);
    if (res.status === 409 || res.status === 422) { // changed on GitHub since it was loaded: reload the sha, try once more
      await load();
      res = await gh('PUT', sha ? { ...body, sha } : body);
    }
    if (!res.ok) throw new Error(ghError(res));
    const j = await res.json();
    sha = j.content?.sha || null;
    current = next;
    showState();
    const url = String(j.commit?.html_url || '');
    const commit = url.startsWith(`https://github.com/${REPO}/`) ? ` <a href="${encodeURI(url)}" target="_blank" rel="noopener">See the commit</a>.` : '';
    note(show ? `Published. The site shows it in about 2 minutes, once the deploy finishes.${commit}` : `Taken down. It leaves the site in about 2 minutes.${commit}`, 'is-ok');
  } catch (err) {
    note(String(err.message || err), 'is-bad');
  } finally {
    busy = false;
    $('#pin-form').classList.remove('is-busy');
  }
}

function bindToken() {
  const box = $('#pin-token-box');
  const refresh = () => {
    const has = Boolean(token());
    $('#pin-token-state').textContent = has ? 'saved on this PC' : 'not set';
    $('#pin-token-forget').hidden = !has;
    if (!has) box.open = true;
  };
  $('#pin-token-form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const v = $('#pin-token').value.trim();
    if (!v) return;
    try { localStorage.setItem(TOKEN_KEY, v); } catch { note("This browser won't store the token.", 'is-bad'); return; }
    $('#pin-token').value = '';
    refresh();
    try { current = await load(); showState(); note('Token saved. Loaded the current message from GitHub.', 'is-ok'); box.open = false; } catch (err) { note(String(err.message || err), 'is-bad'); }
  });
  $('#pin-token-forget').addEventListener('click', () => { try { localStorage.removeItem(TOKEN_KEY); } catch {} sha = null; refresh(); note('Token removed from this browser.'); });
  refresh();
}

async function main() {
  $('#pin-input').maxLength = PINNED_MAX;
  bindToken();
  $('#pin-input').addEventListener('input', preview);
  $('#pin-form').addEventListener('submit', (ev) => { ev.preventDefault(); publish(true); });
  $('#pin-hide').addEventListener('click', () => publish(false));
  try {
    current = await load();
  } catch (err) {
    note(String(err.message || err), 'is-bad');
  }
  $('#pin-input').value = current.text || '';
  showState();
  preview();
}

main();
