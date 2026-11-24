// The owner's pinned message under the countdown. It comes from data/pinned.json, a static file like
// tracker.json, so it costs no database calls however many people visit. The owner edits it from the
// private dashboard (dashboard/pinned-editor.js), which commits the file through GitHub's API.
// Shared by the homepage (app.js) and the dashboard's live preview.

export const PINNED_MAX = 500;
const AVATAR_RE = /^assets\/img\/[\w/.-]+\.(png|jpe?g|webp|svg)$/;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Plain text with line breaks; https links become links. Everything else is escaped.
export function linkify(text) {
  return String(text).split(/(https:\/\/[^\s<>"']+)/g).map((part, i) => {
    if (i % 2 === 0) return esc(part);
    const url = part.replace(/[.,;:!?)\]]+$/, '');
    const shown = url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '');
    return `<a href="${esc(url)}" target="_blank" rel="noopener nofollow">${esc(shown.length > 42 ? `${shown.slice(0, 40)}…` : shown)}</a>${esc(part.slice(url.length))}`;
  }).join('');
}

// Fills the .pinned card inside `box` and shows it. Returns false (card stays hidden) when there's nothing to pin.
// `base` prefixes the avatar path, for pages outside the site root (the dashboard passes '../').
export function fillPinned(box, p, { ago = () => '', when = (iso) => new Date(iso).toLocaleString(), base = '' } = {}) {
  const text = String(p?.text ?? '').trim().slice(0, PINNED_MAX);
  if (!box || !p || p.show === false || !text) { if (box) box.hidden = true; return false; }

  const name = String(p.name || '4lwayz').slice(0, 40);
  box.querySelector('.pin-name').textContent = name;

  const av = box.querySelector('.pin-avatar');
  av.querySelector('b').textContent = ([...name][0] || '?').toUpperCase();
  av.querySelector('img')?.remove();
  if (AVATAR_RE.test(p.avatar || '')) {
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.onerror = () => img.remove(); // the letter underneath shows instead
    img.src = base + p.avatar;
    av.prepend(img);
  }

  box.querySelector('.pin-text').innerHTML = linkify(text);
  const time = box.querySelector('.pin-time');
  const ok = Number.isFinite(Date.parse(p.updated));
  time.hidden = !ok;
  if (ok) {
    time.dateTime = p.updated;
    time.textContent = ago(p.updated);
    time.title = when(p.updated);
  }
  box.hidden = false;
  return true;
}
