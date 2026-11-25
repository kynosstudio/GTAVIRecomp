(function () {
  'use strict';

  if (!document.body || document.querySelector('.site-sidebar')) return;

  const base = document.body.dataset.siteBase || '';
  const iconPaths = {
    home: ['M3 10.5 12 3l9 7.5', 'M5.5 9.5V21h13V9.5', 'M9 21v-7h6v7'],
    news: ['M5 4h14v16H5z', 'M8 8h8', 'M8 12h8', 'M8 16h5'],
    fundraising: ['M12 20s-7-4.5-9-9.2C1 5.2 6.8 2.4 12 7c5.2-4.6 11-1.8 9 3.8C19 15.5 12 20 12 20Z'],
    pc: ['M3 5h18v12H3z', 'M8 21h8', 'M12 17v4', 'M7 10h4', 'M7 13h8'],
    xlaunch: ['M12 21s-6-4.5-6-11a6 6 0 0 1 12 0c0 6.5-6 11-6 11Z', 'M12 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'm6 13-3 3v3l5-2', 'm18 13 3 3v3l-5-2'],
    tracker: ['M3 17h4l3-9 4 12 3-8h4', 'M3 4v16h18']
  };
  const links = [
    { href: `${base}index.html#home`, label: 'Início', key: 'home', icon: 'home' },
    { href: `${base}index.html#news`, label: 'Notícias', key: 'news', icon: 'news' },
    { href: `${base}vaquinhas/index.html`, label: 'Vaquinhas e Apoiadores', key: 'fundraising', icon: 'fundraising' },
    { href: `${base}meu-pc-roda/index.html`, label: 'Meu PC Roda GTAVI', key: 'pc', icon: 'pc', special: true },
    { href: `${base}xlaunchvi/index.html`, label: 'XLaunchVI', key: 'xlaunch', icon: 'xlaunch' },
    { href: `${base}index.html#tracker`, label: 'Monitoramento do tracker', key: 'tracker', icon: 'tracker' }
  ];
  const path = window.location.pathname.toLowerCase();
  const hashPage = window.location.hash.slice(1).toLowerCase();
  const current = path.includes('/meu-pc-roda/')
    ? 'pc'
    : path.includes('/xlaunchvi/')
      ? 'xlaunch'
      : path.includes('/vaquinhas/')
        ? 'fundraising'
        : ['home', 'news', 'tracker'].includes(hashPage)
          ? hashPage
          : '';

  function makeIcon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'nav-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    (iconPaths[name] || []).forEach((data) => {
      const pathNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathNode.setAttribute('d', data);
      svg.append(pathNode);
    });
    return svg;
  }

  const sidebar = document.createElement('aside');
  sidebar.className = 'site-sidebar';
  sidebar.setAttribute('aria-label', 'Navegação do subsistema Recomp');
  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = `${base}index.html#home`;
  brand.setAttribute('aria-label', 'KynosRecompVI — página inicial');
  const logo = document.createElement('img');
  logo.className = 'brand-logo';
  logo.src = `${base}assets/logo.svg`;
  logo.alt = '';
  const monogram = document.createElement('span');
  monogram.className = 'sidebar-brand-monogram';
  monogram.setAttribute('aria-hidden', 'true');
  monogram.textContent = 'K';
  brand.append(logo, monogram);

  const nav = document.createElement('nav');
  nav.className = 'main-nav';
  nav.setAttribute('aria-label', 'Navegação principal');
  links.forEach((item) => {
    const link = document.createElement('a');
    link.className = `nav-link${item.special ? ' nav-utility-link' : ''}${item.key === current ? ' active' : ''}`;
    link.href = item.href;
    if (item.key === current) {
      link.setAttribute('aria-current', 'page');
    }
    link.append(makeIcon(item.icon));
    const label = document.createElement('span');
    label.className = 'nav-label';
    label.textContent = item.label;
    link.append(label);
    nav.append(link);
  });
  sidebar.append(brand, nav);
  document.body.insertBefore(sidebar, document.body.firstChild);
}());
