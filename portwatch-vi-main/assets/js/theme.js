// Light / dark / system theme setting, shared by every page.
// Loaded as a plain (blocking) script in <head> so the saved theme applies before the first paint,
// then adds the theme menu to the page's nav bar once the DOM is ready.
(function () {
  var KEY = 'pw-theme';
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function saved() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'system'; } catch (e) { return 'system'; }
  }
  function isDark(choice) { return choice === 'dark' || (choice === 'system' && !!(media && media.matches)); }
  function apply(choice) {
    if (choice === 'light' || choice === 'dark') root.setAttribute('data-theme', choice);
    else root.removeAttribute('data-theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark(choice) ? '#0b0c12' : '#ffffff');
  }
  apply(saved());

  var ICONS = {
    system: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="9" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 14h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    light: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 .9v1.8M8 13.3v1.8M.9 8h1.8M13.3 8h1.8M3 3l1.3 1.3M11.7 11.7 13 13M3 13l1.3-1.3M11.7 4.3 13 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    dark: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M13.6 10.2A6 6 0 0 1 5.8 2.4a6 6 0 1 0 7.8 7.8Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>'
  };
  var LABELS = { system: 'System', light: 'Light', dark: 'Dark' };
  var PREFIX = 'Theme';
  var relabel = null;

  // Called by i18n.js once the page's language has loaded, before or after the menu mounts.
  window.pwSetThemeLabels = function (labels, prefix) {
    ['system', 'light', 'dark'].forEach(function (k) { if (labels && labels[k]) LABELS[k] = labels[k]; });
    if (prefix) PREFIX = prefix;
    if (relabel) relabel();
  };

  function mount() {
    var nav = document.querySelector('.nav-inner');
    if (!nav || nav.querySelector('.theme-pick')) return;
    var wrap = document.createElement('div');
    wrap.className = 'theme-pick';
    wrap.innerHTML =
      '<button type="button" class="theme-btn" aria-haspopup="true" aria-expanded="false"></button>' +
      '<div class="theme-menu" role="menu" hidden>' +
      ['system', 'light', 'dark'].map(function (k) {
        return '<button type="button" role="menuitemradio" data-theme-choice="' + k + '">' + ICONS[k] + '<span>' + LABELS[k] + '</span></button>';
      }).join('') + '</div>';
    nav.appendChild(wrap);
    var btn = wrap.querySelector('.theme-btn');
    var menu = wrap.querySelector('.theme-menu');

    function render() {
      var c = saved();
      btn.innerHTML = ICONS[isDark(c) ? 'dark' : 'light'];
      btn.setAttribute('aria-label', PREFIX + ': ' + LABELS[c]);
      btn.title = PREFIX + ': ' + LABELS[c];
      menu.querySelectorAll('[data-theme-choice]').forEach(function (b) {
        b.setAttribute('aria-checked', String(b.getAttribute('data-theme-choice') === c));
      });
    }
    function open(v) {
      menu.hidden = !v;
      btn.setAttribute('aria-expanded', String(v));
      if (v) (menu.querySelector('[aria-checked="true"]') || menu.firstChild).focus();
    }
    btn.addEventListener('click', function () { open(menu.hidden); });
    menu.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-theme-choice]');
      if (!b) return;
      var c = b.getAttribute('data-theme-choice');
      try { if (c === 'system') localStorage.removeItem(KEY); else localStorage.setItem(KEY, c); } catch (e) {}
      apply(c); render(); open(false); btn.focus();
    });
    document.addEventListener('click', function (ev) { if (!wrap.contains(ev.target)) open(false); });
    wrap.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !menu.hidden) { open(false); btn.focus(); }
      if ((ev.key === 'ArrowDown' || ev.key === 'ArrowUp') && !menu.hidden) {
        ev.preventDefault();
        var items = Array.prototype.slice.call(menu.querySelectorAll('[data-theme-choice]'));
        var i = items.indexOf(document.activeElement);
        items[(i + (ev.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
      }
    });
    if (media && media.addEventListener) media.addEventListener('change', function () { apply(saved()); render(); });
    relabel = function () {
      menu.querySelectorAll('[data-theme-choice]').forEach(function (b) {
        b.querySelector('span').textContent = LABELS[b.getAttribute('data-theme-choice')];
      });
      render();
    };
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
