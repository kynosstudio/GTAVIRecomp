// News pieces shared by the homepage (app.js) and the static article pages built at deploy time
// (scripts/lib/site-build.mjs). Keep this file free of DOM and Node APIs so it runs in both.

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Article ids become file names (news/<id>.html), so only plain slugs get a page.
export const NEWS_ID_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
export const articlePath = (n) => (NEWS_ID_RE.test(n?.id || '') ? `news/${n.id}.html` : null);

export const COVER_ICON = {
  Leak: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2h8l5 5v8.5l-2-2V8h-4V4H6v16h7.5l2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm12.5 13.5L21 18l-3 4-3-4 2.5-2.5Z"/></svg>',
  Takedown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 0 0-6.3 12.9L16.9 5.7A8 8 0 0 0 12 4Zm6.3 3.1L7.1 18.3A8 8 0 0 0 18.3 7.1Z"/></svg>',
  Security: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1 6h2v6h-2V8Zm0 8h2v2h-2v-2Z"/></svg>',
  Legal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 3h2v2h6v2h-1.2l2.7 6.3A3.5 3.5 0 0 1 17 16a3.5 3.5 0 0 1-3.5-2.7L16.2 7H13v12h4v2H7v-2h4V7H7.8l2.7 6.3A3.5 3.5 0 0 1 7 16a3.5 3.5 0 0 1-3.5-2.7L6.2 7H5V5h6V3Zm-4 6.2L5.6 12.5h2.8L7 9.2Zm10 0-1.4 3.3h2.8L17 9.2Z"/></svg>',
  Safety: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1.2 13.6L7 11.8l1.4-1.4 2.4 2.4 4.8-4.8L17 9.4l-6.2 6.2Z"/></svg>',
};

export const coverHtml = (cat) => `<div class="cover cover-${esc(cat)}">${COVER_ICON[cat] || COVER_ICON.Leak}</div>`;
