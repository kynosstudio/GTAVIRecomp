const state = { page: 'home', target: 2, channel: 'dual', ramGeneration: 'ddr5', language: 'pt', theme: 'dark', activeScenario: '', whatIfOriginalSetup: null };
const ANALYTICS_KEY = 'kynos-gta-vi-analytics-v1';
const LANGUAGE_KEY = 'kynos-gta-vi-language';
const ANALYTICS_ROUTE = 'kynos-analytics';
const MAX_ANALYTICS_EVENTS = 3000;
const PRESETS_KEY = 'kynos-gta-vi-presets-v1';
const NOTIFICATION_KEY = 'kynos-gta-vi-notifications-v1';
const XCL_FEED_CACHE_KEY = 'kynos-xcl-feed-v1';
const XCL_FEED_CACHE_TTL = 15 * 60 * 1000;
const raceView = { scope: 'all', sort: 'score', initialized: false };
const XCL_FEED_FALLBACK = {
  repository: 'ivall/xcl',
  updatedAt: '2026-11-23T20:57:00-03:00',
  source: 'PortWatch VI · atualização manual',
  items: [{
    kind: 'manual_snapshot',
    date: '2026-11-23T20:57:00-03:00',
    actor: 'PortWatch VI',
    title: 'XCL alcança o menu principal de GTA VI',
    summary: 'Resumo manual: o tracker reporta menus iniciais a 30 FPS e resposta de controle em testes autodeclarados; gameplay ainda não foi alcançado.',
    url: 'https://github.com/ivall/xcl',
    category: 'Snapshot manual · PortWatch VI'
  }]
};
const NEWS_FALLBACK = {
  updatedAt: '2026-11-23',
  sourceUrl: 'https://portwatch-vi.xyz/#top',
  sourceNote: 'Conteúdo e posições atualizados manualmente com base no tracker PortWatch VI.',
  translations: {
    en: { sourceNote: 'Stories and rankings are updated manually from the PortWatch VI tracker.' },
    es: { sourceNote: 'Las noticias y posiciones se actualizan manualmente con base en el tracker PortWatch VI.' },
    zh: { sourceNote: '新闻与排名依据 PortWatch VI 跟踪器手动更新。' }
  },
  headline: {
    date: '2026-11-23',
    category: 'PROJETO FORA DO AR',
    title: 'Leonida perde o repositório e o Discord; criador anuncia afastamento',
    summary: 'Em 23/11, o repositório deixou de existir no GitHub e o convite do Discord parou de resolver. O criador publicou que estava saindo do projeto. O tracker não encontrou aviso público de DMCA e não confirma o motivo da remoção. Forks de colaboradores ainda preservam o código; Leonida permanece no registro histórico, mas não conta no ranking ativo.',
    url: 'https://portwatch-vi.xyz/#top',
    linkLabel: 'Acompanhar no PortWatch VI',
    translations: {
      en: {
        category: 'PROJECT OFFLINE',
        title: 'Leonida loses its GitHub repository and Discord as its creator steps away',
        summary: 'On Nov 23, the GitHub repository disappeared and the Discord invite stopped resolving. The creator posted that he was leaving the project. The tracker found no public DMCA notice and cannot confirm why the repository was removed. Contributor forks still preserve the code; Leonida remains in the historical record but is excluded from the active ranking.',
        linkLabel: 'Follow PortWatch VI'
      },
      es: {
        category: 'PROYECTO FUERA DE LÍNEA',
        title: 'Leonida pierde su repositorio de GitHub y Discord; su creador anuncia que se aparta',
        summary: 'El 23/11, el repositorio dejó de estar disponible en GitHub y la invitación de Discord dejó de funcionar. El creador publicó que abandonaba el proyecto. El tracker no encontró un aviso público de DMCA y no confirma el motivo de la eliminación. Los forks de colaboradores aún conservan el código; Leonida permanece en el registro histórico, pero queda fuera del ranking activo.',
        linkLabel: 'Seguir en PortWatch VI'
      },
      zh: {
        category: '项目已下线',
        title: 'Leonida 的 GitHub 仓库与 Discord 消失，创建者宣布退出',
        summary: '11 月 23 日，GitHub 仓库消失，Discord 邀请链接也无法使用。创建者发文称将离开项目。跟踪器未发现公开的 DMCA 通知，因此无法确认仓库移除的原因。贡献者的 fork 仍保存着代码；Leonida 保留在历史记录中，但不再计入活跃排名。',
        linkLabel: '查看 PortWatch VI'
      }
    }
  },
  topThree: [
    {
      date: '2026-11-23',
      category: 'XCL · 55%',
      title: 'XCL chega ao menu principal e divide a liderança dos marcos',
      summary: 'O tracker atribui 55% e o estágio Menu principal ao XCL. Registra tela de conta e menus de configurações a 30 FPS com controle em um teste autodeclarado; gameplay ainda não foi alcançado.',
      url: 'https://github.com/ivall/xcl',
      linkLabel: 'Ver repositório',
      translations: {
        en: {
          category: 'XCL · 55%',
          title: 'XCL reaches the main menu and shares the milestone lead',
          summary: 'The tracker rates XCL at 55%, the Main menu stage. It records an account screen and settings menus at 30 FPS with controller input in a self-reported test; gameplay has not been reached.'
        },
        es: {
          category: 'XCL · 55%',
          title: 'XCL llega al menú principal y comparte el liderazgo por hitos',
          summary: 'El tracker sitúa a XCL en 55%, en la etapa Menú principal. Registra una pantalla de cuenta y menús de ajustes a 30 FPS con mando en una prueba autodeclarada; aún no se ha alcanzado el juego.'
        },
        zh: {
          category: 'XCL · 55%',
          title: 'XCL 到达主菜单阶段，与另一项目并列领先',
          summary: '跟踪器将 XCL 评为 55%，处于主菜单阶段。记录显示，一项自述测试中的账户界面和设置菜单可在手柄操作下达到 30 FPS；尚未进入实际游戏。'
        }
      }
    },
    {
      date: '2026-11-23',
      category: 'VICTORY · 55%',
      title: 'VIctory também chega ao menu; resultado ainda aguarda reprodução independente',
      summary: 'O tracker coloca o VIctory em 55%, no estágio Menu principal. Uma transmissão mostrou o menu perto de 15 FPS; o README relata telas iniciais a 30 FPS e carregamento até um mundo com imagem preta. Os testes seguem autodeclarados em um único PC.',
      url: 'https://github.com/Marvisak/VIctory',
      linkLabel: 'Ver repositório',
      translations: {
        en: {
          category: 'VICTORY · 55%',
          title: 'VIctory also reaches the menu, but independent reproduction is still pending',
          summary: 'The tracker places VIctory at 55%, the Main menu stage. A livestream showed the menu at about 15 FPS; its README reports boot screens at 30 FPS and loading into a world with a black image. Tests remain self-reported on a single PC.'
        },
        es: {
          category: 'VICTORY · 55%',
          title: 'VIctory también llega al menú, pero aún espera una reproducción independiente',
          summary: 'El tracker sitúa a VIctory en 55%, en la etapa Menú principal. Una transmisión mostró el menú a unos 15 FPS; su README informa pantallas iniciales a 30 FPS y carga hasta un mundo con imagen negra. Las pruebas siguen siendo autodeclaradas y se hicieron en un solo PC.'
        },
        zh: {
          category: 'VICTORY · 55%',
          title: 'VIctory 也已到达菜单阶段，仍待独立复现',
          summary: '跟踪器将 VIctory 列为 55%，处于主菜单阶段。直播画面显示菜单约为 15 FPS；项目 README 声称启动界面可达 30 FPS，并能加载到画面为黑色的游戏世界。测试目前仍是单台电脑上的自述结果。'
        }
      }
    },
    {
      date: '2026-11-23',
      category: 'TUXBOX · 25%',
      title: 'TuxBox abre o executável de GTA VI, mas ainda exibe uma tela preta',
      summary: 'O estágio atual é Exe rodando, com 25%. Segundo o tracker, o executável abre uma janela em 4K e inicializa áudio e arquivos do jogo no Proton; ainda não há logo nem menu visível. Resultado autodeclarado.',
      url: 'https://github.com/brcly/TuxBox',
      linkLabel: 'Ver repositório',
      translations: {
        en: {
          category: 'TUXBOX · 25%',
          title: "TuxBox opens GTA VI's executable, but the screen is still black",
          summary: 'Its current stage is Executable running, at 25%. According to the tracker, the executable opens a 4K window and initializes audio and game archives through Proton; no logo or menu is visible yet. Self-reported result.'
        },
        es: {
          category: 'TUXBOX · 25%',
          title: 'TuxBox abre el ejecutable de GTA VI, pero la pantalla sigue negra',
          summary: 'Su etapa actual es Ejecutable en marcha, con 25%. Según el tracker, el ejecutable abre una ventana 4K e inicia el audio y los archivos del juego en Proton; todavía no se ve el logotipo ni el menú. Resultado autodeclarado.'
        },
        zh: {
          category: 'TUXBOX · 25%',
          title: 'TuxBox 已启动 GTA VI 可执行文件，但画面仍为黑屏',
          summary: '当前阶段为可执行文件运行，进度 25%。据跟踪器称，可执行文件会在 Proton 中打开 4K 窗口并初始化音频与游戏文件；目前尚未显示标志或菜单。该结果为自述。'
        }
      }
    }
  ]
};
let xclFeedItems = [];
let xclFeedLoaded = false;
let xclFeedLoading = false;
let xclFeedStatusRaw = 'A atividade do GitHub será carregada ao abrir esta aba.';
const THEME_KEY = 'kynos-gta-vi-theme';
let hardware;
let pageData = {};
let portwatchData = null;
let repositoryData = [];
let newsData = null;
let trackerData = null;
let managedEditorial = { news: [], tracker_updates: [] };
let notificationPreferences = null;
let notificationItems = [];
let notificationSnapshot = null;
let notificationHandlersBound = false;
let quickProjects = [];
let heroCountdownTimer = null;
let headerFreshnessTimestamp = null;
let headerFreshnessTimer = null;

const pageNames = {
  home: 'Início',
  utility: 'Meu PC Roda GTAVI',
  repositories: 'Corrida dos projetos',
  news: 'Notícias',
  tracker: 'Monitoramento',
  xlaunchvi: 'Equipe XlaunchVI',
  discord: 'Comunidades'
};

const PORTWATCH_FALLBACK = {
  updatedAt: '25/11/2026 · 03:15',
  sourceNote: 'Os dados são atualizados manualmente retirados do site oficial PortWatch VI e do tracker local KynosRecompVI.',
  overallProgress: 78.7,
  leaderId: 'xlaunchvi',
  milestones: [
    { key: 'groundwork', percent: 0, label: 'Preparação', description: 'Carregador, bibliotecas base e camada gráfica inicial.' },
    { key: 'loads', percent: 10, label: 'Executável em execução', description: 'O executável do jogo é mapeado e inicia o próprio código no Windows.' },
    { key: 'boots', percent: 20, label: 'Primeiro quadro', description: 'O jogo apresenta os primeiros quadros renderizados.' },
    { key: 'menu', percent: 30, label: 'Menu principal', description: 'Os menus são alcançados e respondem à entrada (relatado a 30 FPS).' },
    { key: 'world', percent: 40, label: 'Dentro do mundo', description: 'O modo história carrega e desenha o mundo; edificações e modelos aparecem.' },
    { key: 'playable', percent: 50, label: 'Jogável', description: 'É possível controlar um personagem no mundo; prólogo (Lucia, prisão) carregado.' },
    { key: 'shaders_lighting_rt', percent: 60, label: 'Shaders, iluminação e Ray Tracing', description: 'Shaders compilados, texturas funcionais, iluminação e Ray Tracing ativos a 30+ FPS estável.' },
    { key: 'prologue_60fps', percent: 70, label: 'Prólogo a 60 FPS', description: 'Alcançar 60 FPS no prólogo (Lucia, ambiente prisional) com qualidade visual completa.' },
    { key: 'openworld_60fps', percent: 80, label: 'Mundo aberto a 60 FPS', description: 'Estender 60 FPS estável para o mundo aberto completo: missões, tráfego, IA, sistemas dinâmicos.' },
    { key: 'final_polish', percent: 90, label: 'Otimização final / Xbox 360', description: 'Polimento geral, correção de edge cases, início da compatibilidade com títulos de Xbox 360.' },
    { key: 'complete', percent: 100, label: 'Jogo completo / Release Final', description: 'Release pública apenas na Release Final: meta mínima 60 FPS, rodando melhor que no console.' }
  ],
  projects: [
    { id: 'xcl', name: 'XCL', author: 'ivall', gta: { loads: 1, boots: 1, menu: 1 }, avatar: 'XC', avatarUrl: 'https://github.com/ivall.png?size=88' },
    { id: 'marvis', name: 'VIctory', author: 'Marvisak', gta: { loads: 1, boots: 1, menu: 1 }, avatar: 'VI', avatarUrl: 'https://github.com/Marvisak.png?size=88' },
    { id: 'xbox-emulator', name: 'xbox-emulator', author: 'omonkeyz' },
    { id: 'scarlettx', name: 'ScarlettX', author: 'Freminet' },
    { id: 'tuxbox', name: 'TuxBox', author: 'brcly', gta: { loads: 1 }, avatar: 'Tu', avatarUrl: 'https://github.com/brcly.png?size=88' },
    { id: 'americas-recomp', name: 'americas-recomp', author: 'realdody' },
    { id: 'leonida', name: 'Leonida', author: 'ItsNotRexed', status: 'nuked', gta: { loads: 1 }, avatar: 'Le', avatarUrl: 'https://github.com/ItsNotRexed.png?size=88' },
    { id: 'openscarlett', name: 'OpenScarlett', author: 'californiaAlmonds' },
    { id: 'scarlett-layer', name: 'scarlett-layer', author: 'jadeowaowa' },
    { id: 'xbox2windows', name: 'Xbox2Windows', author: 'R0Y00' },
    { id: 'anyxboxx', name: 'AnyXboxX', author: 'LooperSalty' },
    { id: 'xvalkyrie', name: 'XValkyrie', author: 'sammwyy' },
    { id: 'gtavi-recomp', name: 'GTAVI-Recomp', author: 'JamesCicada' },
    { id: 'anyxboxseries', name: 'AnyXboxSeries', author: 'edupode' },
    { id: 'scarab', name: 'SCARAB', author: 'p-portela' },
    { id: 'anybox', name: 'AnyBox', author: 'Dark3581' },
    { id: 'percyscarlett', name: 'PercyScarlett', author: 'rpatty-dev' },
    { id: 'grandtheftxbox', name: 'GrandTheftXbox', author: 'zohaiblazuli' },
    { id: 'scarlett-windows-compat', name: 'Scarlett Windows Compat', author: 'ProhorovIlja' },
    { id: 'dedsec', name: 'DedSec', author: 'Hylanderry' },
    { id: 'xbgtasix', name: 'Xbgtasix', author: 'ljm-233' },
    { id: 'seriesx-emulator', name: 'SeriesX Emulator', author: 'anrq0' },
    { id: 'gta6-compat-layer', name: 'GTA6-COMPAT-LAYER (ScarlettCompat)', author: 'SSTGxf' },
    { id: 'xlaunchvi', name: 'XlaunchVI', author: 'JPTuba9' },
    { id: 'openscarlett-ce', name: 'OpenScarlett (Community Edition)', author: 'OpenCommunityEdition' },
    { id: 'five-star-recomp', name: 'Five Star Recomp', author: 'ThatRecompDev' },
    { id: 'g6recomp', name: 'G6Recomp', author: 'Kajcsi' }
  ]
};

const byId = (id) => document.getElementById(id);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const cleanDisplayText = (value = '') => String(value)
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ')
  .trim();
const safeUrl = (value = '') => /^https?:\/\//i.test(value) || /^#[\w-]+$/.test(value) ? value : '#';
const t = (value) => window.KynosI18n.translateText(value, state.language);
const counterAnimations = new WeakMap();

function counterMarkup(value, kind = 'integer') {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return escapeHtml(value);
  return `<span class="count-up" data-count-value="${numeric}" data-count-kind="${kind}">0</span>`;
}

function formatCounter(value, kind) {
  const locale = { pt: 'pt-BR', en: 'en', es: 'es', zh: 'zh-CN' }[state.language];
  if (kind === 'percent') return Number(value).toLocaleString(locale, { maximumFractionDigits: 1 });
  return Math.round(value).toLocaleString(locale);
}

function animateCounters(root) {
  if (!root || !root.querySelectorAll) return;
  const elements = [...root.querySelectorAll('[data-count-value]')];
  const start = () => elements.forEach((element) => {
    const value = Number(element.dataset.countValue);
    if (!Number.isFinite(value)) return;
    const previousAnimation = counterAnimations.get(element);
    if (previousAnimation) cancelAnimationFrame(previousAnimation);
    const kind = element.dataset.countKind || 'integer';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || value === 0) {
      element.textContent = formatCounter(value, kind);
      counterAnimations.delete(element);
      return;
    }
    element.textContent = formatCounter(0, kind);
    const duration = root && root.querySelector && root.querySelector('.pw-overall-value') ? 1200 : 650;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - ((1 - progress) ** 3);
      element.textContent = formatCounter(value * eased, kind);
      if (progress < 1) counterAnimations.set(element, requestAnimationFrame(tick));
      else {
        element.textContent = formatCounter(value, kind);
        counterAnimations.delete(element);
      }
    };
    counterAnimations.set(element, requestAnimationFrame(tick));
  });
  const rect = root.getBoundingClientRect ? root.getBoundingClientRect() : null;
  if (rect && rect.bottom >= 0 && rect.top <= window.innerHeight) start();
  else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        start();
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(root);
  } else start();
}

function recalculateProgressConnectors(root) {
  const timeline = root && root.querySelector('.pw-timeline');
  const svg = timeline && timeline.querySelector('.pw-connectors');
  const bar = timeline && timeline.querySelector('.pw-progress-track');
  const markers = timeline ? [...timeline.querySelectorAll('.pw-project-marker')] : [];
  if (!timeline || !svg || !bar || !markers.length) return;

  const timelineRect = timeline.getBoundingClientRect();
  const barRect = bar.getBoundingClientRect();
  const width = Math.max(1, timelineRect.width);
  const height = Math.max(1, timelineRect.height);
  const markerWidth = Math.max(...markers.map((marker) => marker.getBoundingClientRect().width));
  const gap = markerWidth + 8;
  const positionedMarkers = markers.map((marker) => ({
    marker,
    progress: Number(marker.dataset.markerProgress),
    x: Number(marker.dataset.markerProgress) / 100 * width
  })).sort((left, right) => left.x - right.x);
  positionedMarkers.forEach((item, index) => {
    item.anchor = index ? Math.max(item.x, positionedMarkers[index - 1].anchor + gap) : item.x;
  });
  const averageOffset = positionedMarkers.reduce((total, item) => total + item.x - item.anchor, 0)
    / positionedMarkers.length;
  positionedMarkers.forEach((item) => { item.anchor += averageOffset; });
  const edge = markerWidth / 2 + 4;
  const leftShift = Math.max(0, edge - positionedMarkers[0].anchor);
  const rightShift = Math.min(0, width - edge - positionedMarkers[positionedMarkers.length - 1].anchor);
  const shift = leftShift || rightShift;
  positionedMarkers.forEach((item) => {
    item.anchor += shift;
    item.marker.style.setProperty('--marker-x', `${item.anchor / width * 100}%`);
  });

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', `${width}`);
  svg.setAttribute('height', `${height}`);
  svg.style.width = `${width}px`;
  svg.style.height = `${height}px`;

  const targetTop = barRect.top - timelineRect.top;
  svg.innerHTML = positionedMarkers.map(({ marker, progress }) => {
    const markerRect = marker.getBoundingClientRect();
    const startX = markerRect.left - timelineRect.left + markerRect.width / 2;
    const startY = markerRect.bottom - timelineRect.top;
    let endX = Number.isFinite(progress)
      ? progress / 100 * width
      : markerRect.left - timelineRect.left + markerRect.width / 2;
    endX = Math.max(0, Math.min(width, endX));
    const endY = targetTop;
    const distance = Math.max(24, endY - startY);
    const controlY1 = startY + distance * 0.42;
    const controlY2 = endY - distance * 0.18;
    const restrictedClass = marker.classList.contains('is-private') || marker.classList.contains('is-blocked')
      ? ' pw-curve-path--restricted'
      : '';
    const dotRestrictedClass = restrictedClass ? ' pw-curve-dot--restricted' : '';
    return `<path d="M ${startX.toFixed(2)} ${startY.toFixed(2)} C ${startX.toFixed(2)} ${controlY1.toFixed(2)}, ${endX.toFixed(2)} ${controlY2.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}" fill="none" class="pw-curve-path${restrictedClass}"/>
      <circle cx="${endX.toFixed(2)}" cy="${endY.toFixed(2)}" r="3.5" class="pw-curve-dot${dotRestrictedClass}"/>`;
  }).join('');
}

function animateProgress(root) {
  if (!root || !root.querySelectorAll) return;
  const bars = [...root.querySelectorAll('[data-progress-value]')];
  const start = () => bars.forEach((bar) => {
    const value = Number(bar.dataset.progressValue);
    if (!Number.isFinite(value)) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      bar.style.width = `${value}%`;
      return;
    }
    bar.style.width = '0%';
    const duration = 650;
    const startTime = performance.now();
    const tick = (now) => {
      const linear = Math.min(1, (now - startTime) / duration);
      const eased = 1 - ((1 - linear) ** 3);
      const current = value * eased;
      bar.style.width = `${current}%`;
      root.querySelectorAll('.pw-project-marker[data-marker-progress]').forEach((marker) => {
        const markerValue = Number(marker.dataset.markerProgress);
        const crossing = Number.isFinite(markerValue) && markerValue <= current && markerValue >= current - 5;
        marker.classList.toggle('is-crossing', crossing);
        if (Number.isFinite(markerValue) && markerValue <= current) marker.classList.add('is-reached');
      });
      if (linear < 1) requestAnimationFrame(tick);
      else {
        bar.style.width = `${value}%`;
        requestAnimationFrame(() => recalculateProgressConnectors(root));
        root.querySelectorAll('.pw-project-marker[data-marker-progress]').forEach((marker) => {
          const markerValue = Number(marker.dataset.markerProgress);
          marker.classList.remove('is-crossing');
          if (Number.isFinite(markerValue) && markerValue <= value) marker.classList.add('is-reached');
        });
      }
    };
    requestAnimationFrame(tick);
  });
  const rect = root.getBoundingClientRect ? root.getBoundingClientRect() : null;
  if (rect && rect.bottom >= 0 && rect.top <= window.innerHeight) start();
  else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        start();
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(root);
  } else start();
}

function attachAvatarFallbacks(root) {
  root.querySelectorAll('.home-leader-avatar img').forEach((image) => {
    const showFallback = () => {
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    };
    image.addEventListener('error', showFallback, { once: true });
    if (image.complete && !image.naturalWidth) showFallback();
  });
}

function readAnalyticsEvents() {
  const raw = localStorage.getItem(ANALYTICS_KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (data.version !== 1 || !Array.isArray(data.events) || data.events.some((event) =>
    !event || typeof event.type !== 'string' || typeof event.label !== 'string' || typeof event.timestamp !== 'string')) {
    throw new Error('O arquivo de analytics local está inválido.');
  }
  return data.events;
}

function trackEvent(type, label, details = {}) {
  try {
    const events = readAnalyticsEvents();
    events.push({
      type,
      page: state.page,
      label: String(label || ''),
      details,
      timestamp: new Date().toISOString()
    });
    if (events.length > MAX_ANALYTICS_EVENTS) events.splice(0, events.length - MAX_ANALYTICS_EVENTS);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify({ version: 1, events }));
  } catch (error) {
    console.error('Não foi possível registrar analytics local:', error);
    const status = byId('analytics-status');
    if (status) status.textContent = t('Não foi possível salvar métricas neste navegador. Confira o armazenamento local.');
  }
}

function applyLanguage() {
  const htmlLanguage = { pt: 'pt-BR', en: 'en', es: 'es', zh: 'zh-CN' }[state.language];
  document.documentElement.lang = htmlLanguage;
  document.title = t('KynosRecompVI — Notícias e corrida por GTA VI');
  document.querySelector('meta[name="description"]').content = t('KynosRecompVI: notícias em português, acompanhamento da corrida de projetos de GTA VI e utilidade de simulação de PC.');
  const languageSelect = byId('language-select');
  if (languageSelect) languageSelect.value = state.language;
  window.KynosI18n.translateDom(document.body, state.language);
  if (hardware) {
    filterHardwareOptions('cpu');
    filterHardwareOptions('gpu');
  }
  if (trackerData) {
    renderPortalHome(trackerData);
    renderTrackerProjects(trackerData);
    renderNews(trackerData);
    renderTrackerDetails(trackerData);
    renderXlaunchPage(trackerData);
    if (quickProjects.length) updateQuickProjectStatus();
    if (byId('quick-safety-query') && byId('quick-safety-query').value.trim()) updateFakeRadar(trackerData);
    if (notificationPreferences) renderNotificationCenter(trackerData);
  }
  if (xclFeedLoaded && byId('xcl-news-list')) renderXclFeed(xclFeedItems, xclFeedStatusRaw);
}

function setLanguage(language) {
  if (!['pt', 'en', 'es', 'zh'].includes(language)) return;
  state.language = language;
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Não foi possível salvar o idioma preferido:', error);
  }
  if (state.activeScenario) updateScenarioBadge();
  if (hardware) calculate({ trackSimulation: false });
  else applyLanguage();
  trackEvent('language_change', language.toUpperCase(), { language });
  if (state.page === 'analytics') renderAnalytics();
  if (byId('presets-dialog').open) renderPresetList();
  if (byId('compare-dialog').open) renderCompareOptions();
}

function trackHardwareSelection(dimension, value) {
  trackEvent('hardware_selection', dimension, { dimension, value });
}

function hardwareSelectionLabel(id) {
  const value = byId(id).value;
  if (id === 'gpu-select') {
    const gpu = hardware.gpus.find((item) => item.id === value);
    return `${gpu.name}${gpu.integrated ? ' [iGPU]' : ''}`;
  }
  if (id === 'cpu-select') {
    const cpu = hardware.cpus.find((item) => item.id === value);
    return `${cpu.name} [${cpuHasIntegratedGraphics(cpu) ? 'iGPU' : 'Sem iGPU'}]`;
  }
  if (id === 'ram-select') return `${value} GB`;
  if (id === 'ram-frequency') return `${Number(value).toLocaleString('pt-BR')} MHz`;
  if (id === 'space-select') return `${value} GB livres`;
  return hardware.operatingSystems.concat(hardware.backgroundUsage).find((item) => item.id === value).name;
}

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Não foi possível carregar ${path} (${response.status})`);
  return response.json();
}

async function loadOptionalJson(path) {
  try {
    return await loadJson(path);
  } catch (error) {
    console.warn(`Fonte de dados indisponível (${path}); a inicialização tentará usar o fallback.`, error);
    return null;
  }
}

const TRACKER_REMOTE_URL = 'https://raw.githubusercontent.com/4lwayz/portwatch-vi/main/data/tracker.json';

function trackerRecordKey(item, field) {
  if (!item || typeof item !== 'object') return '';
  if (item.id) return `${field}:id:${item.id}`;
  if (field === 'history') {
    const date = item.timestamp || item.updatedAt || item.at || item.date;
    return date ? `${field}:${date}:${item.leaderId || item.projectId || item.project || ''}` : '';
  }
  if (field === 'changes') {
    return `${field}:${item.date || item.updatedAt || ''}:${item.kind || ''}:${item.sourceText || item.text || ''}`;
  }
  return item.repo ? `${field}:repo:${item.repo}`
    : item.url ? `${field}:url:${item.url}`
      : item.link ? `${field}:link:${item.link}`
        : item.path ? `${field}:path:${item.path}`
          : item.name ? `${field}:name:${item.name}`
            : item.title ? `${field}:title:${item.title}` : '';
}

function isKynosManualRecord(item) {
  return Boolean(item && typeof item === 'object' && (
    item.trackerKynos === true
    || item.localOnly === true
    || item.manual === true
    || String(item.manualSource || item.source || '').toLowerCase() === 'kynos'
    || Number.isFinite(item.manualScore)
  ));
}

function mergeTrackerSnapshots(upstream, local) {
  if (!upstream || typeof upstream !== 'object') return local;
  if (!local || typeof local !== 'object') return upstream;

  const upstreamDate = Date.parse(upstream.updated || upstream.updatedAt || '');
  const localDate = Date.parse(local.updated || local.updatedAt || '');
  const localIsNewer = Number.isFinite(localDate) && (!Number.isFinite(upstreamDate) || localDate > upstreamDate);
  const preferred = localIsNewer ? local : upstream;
  const secondary = localIsNewer ? upstream : local;
  const merged = { ...secondary, ...preferred };
  const arrayFields = ['efforts', 'news', 'tools', 'candidates', 'flagged', 'ignored', 'changes', 'history', 'headlines', 'dmca'];

  arrayFields.forEach((field) => {
    const records = new Map();
    const addRecords = (items) => {
      if (!Array.isArray(items)) return;
      items.forEach((item) => {
        const key = trackerRecordKey(item, field);
        if (key) records.set(key, item);
      });
    };
    addRecords(secondary[field]);
    addRecords(preferred[field]);
    if (Array.isArray(local[field])) {
      local[field].filter(isKynosManualRecord).forEach((item) => {
        const key = trackerRecordKey(item, field);
        if (key) records.set(key, item);
      });
    }
    if (Array.isArray(preferred[field]) || Array.isArray(secondary[field])) {
      merged[field] = [...records.values()];
    }
  });
  return merged;
}

async function fetchJsonWithTimeout(url, timeoutMs = 5000) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, {
      cache: 'no-store',
      ...(controller ? { signal: controller.signal } : {})
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    if (timeout) window.clearTimeout(timeout);
  }
}

async function loadTrackerSourceChain() {
  if (window.location.protocol === 'file:') return { payload: null, source: 'memory' };
  const [local, remote] = await Promise.all([
    loadOptionalJson('data/tracker.json'),
    fetchJsonWithTimeout(TRACKER_REMOTE_URL).catch((error) => {
      console.warn('Tracker remoto indisponível; usando o snapshot local quando disponível.', error);
      return null;
    })
  ]);
  if (remote) {
    return {
      payload: local ? mergeTrackerSnapshots(remote, local) : remote,
      source: local ? 'github-remote+local' : 'github-remote'
    };
  }
  if (local) return { payload: local, source: 'local' };
  return { payload: null, source: 'memory' };
}

async function ensureEmbeddedFallback() {
  if (window.KynosFileData) return window.KynosFileData;
  if (window.location.protocol === 'file:' && window.KynosFileDataReady) {
    try {
      await window.KynosFileDataReady;
    } catch (error) {
      console.error('O fallback local inicial falhou; tentando carregá-lo novamente:', error);
    }
    if (window.KynosFileData) return window.KynosFileData;
  }
  if (!window.KynosFallbackLoading) {
    window.KynosFallbackLoading = new Promise((resolve, reject) => {
      const fallback = document.createElement('script');
      fallback.src = 'data/file-fallback.js';
      fallback.dataset.kynosFallback = 'true';
      fallback.onload = () => window.KynosFileData
        ? resolve(window.KynosFileData)
        : reject(new Error('O script de fallback carregou sem inicializar os dados.'));
      fallback.onerror = () => reject(new Error('Não foi possível carregar data/file-fallback.js.'));
      document.head.appendChild(fallback);
    });
  }
  return window.KynosFallbackLoading;
}

function isTrackerPayload(value) {
  return Boolean(value && typeof value === 'object'
    && (Array.isArray(value.news) || Array.isArray(value.efforts)));
}

function mergeTrackerPayloads(portwatch, localized, fallback, kynosLocal) {
  const fallbackTracker = fallback && isTrackerPayload(fallback.trackerLocalized)
    ? fallback.trackerLocalized
    : fallback && isTrackerPayload(fallback.tracker) ? fallback.tracker : fallback;
  const fallbackRaw = fallback && isTrackerPayload(fallback.trackerRaw) ? fallback.trackerRaw : null;
  const fallbackPortwatch = fallback && fallback.portwatch && typeof fallback.portwatch === 'object'
    ? fallback.portwatch
    : {};
  const kynosTracker = isTrackerPayload(kynosLocal)
    ? kynosLocal
    : fallback && isTrackerPayload(fallback.trackerKynos) ? fallback.trackerKynos : {};
  const raw = isTrackerPayload(portwatch) ? portwatch : fallbackRaw || {};
  const base = isTrackerPayload(fallbackTracker) ? fallbackTracker : {};
  const translated = isTrackerPayload(localized) ? localized : {};
  const merged = { ...base, ...raw, ...translated };

  const itemKey = (item, field) => {
    if (!item) return '';
    if (item.id) return `${field}:id:${item.id}`;
    if (field === 'changes') {
      const sourceText = item.sourceText || item.text;
      return sourceText ? `${field}:source:${sourceText}` : '';
    }
    if (field === 'history') {
      const date = item.timestamp || item.updatedAt || item.at || item.date;
      const project = item.leaderId || item.projectId || item.project || '';
      return date ? `${field}:${date}:${project}` : '';
    }
    const url = item.url || item.link;
    return item.repo ? `${field}:repo:${item.repo}`
      : item.name ? `${field}:name:${item.name}`
        : url ? `${field}:url:${url}`
          : item.title ? `${field}:title:${item.title}`
            : item.path ? `${field}:path:${item.path}` : '';
  };
  const mergeArrayByKey = (field) => {
    const rawItems = Array.isArray(raw[field]) ? raw[field] : [];
    const baseItems = Array.isArray(base[field]) ? base[field] : [];
    const translatedItems = Array.isArray(translated[field]) ? translated[field] : [];
    const source = rawItems.length ? rawItems : baseItems;
    const translatedMap = new Map(translatedItems.map((item) => [itemKey(item, field), item]).filter(([key]) => key));
    const result = source.map((item) => {
      const translation = translatedMap.get(itemKey(item, field));
      if (translation) return { ...item, ...translation, translations: { ...(item.translations || {}), ...(translation.translations || {}) } };
      return field === 'changes' ? { ...item, summary: item.summary || item.text || '' } : { ...item };
    });
    const knownKeys = new Set(result.map((item) => itemKey(item, field)).filter(Boolean));
    translatedItems.forEach((item) => {
      const key = itemKey(item, field);
      if (key && !knownKeys.has(key)) {
        if (field === 'changes' && rawItems.length) return;
        result.push({ ...item });
        knownKeys.add(key);
      }
    });
    return result;
  };

  ['tools', 'flagged', 'changes', 'headlines', 'dmca', 'history'].forEach((field) => {
    merged[field] = mergeArrayByKey(field);
  });
  const rawCandidates = Array.isArray(raw.candidates) ? raw.candidates : [];
  const localizedCandidates = Array.isArray(translated.candidateList) ? translated.candidateList : [];
  const localizedCandidateMap = new Map(localizedCandidates.map((item) => [itemKey(item, 'candidateList'), item]).filter(([key]) => key));
  merged.candidateList = rawCandidates.map((item) => {
    const translation = localizedCandidateMap.get(itemKey(item, 'candidateList'));
    return translation ? { ...item, ...translation } : { ...item };
  });
  const candidateKeys = new Set(merged.candidateList.map((item) => itemKey(item, 'candidateList')).filter(Boolean));
  localizedCandidates.forEach((item) => {
    const key = itemKey(item, 'candidateList');
    if (key && !candidateKeys.has(key)) {
      merged.candidateList.push({ ...item });
      candidateKeys.add(key);
    }
  });
  merged.candidates = Number.isFinite(Number(translated.candidates))
    ? Number(translated.candidates)
    : merged.candidateList.length;

  const rawEfforts = Array.isArray(raw.efforts) ? raw.efforts : (Array.isArray(base.efforts) ? base.efforts : []);
  const localizedEfforts = Array.isArray(translated.efforts) ? translated.efforts : [];
  const effortMap = new Map(localizedEfforts.map((item) => [item.id, item]).filter(([key]) => key));
  const effortOverrides = translated.editorial && translated.editorial.effortOverrides
    && typeof translated.editorial.effortOverrides === 'object' ? translated.editorial.effortOverrides : {};
  merged.efforts = rawEfforts.map((rawItem) => {
    const local = effortMap.get(rawItem.id);
    if (!local) return { ...rawItem };
    const override = effortOverrides[rawItem.id] && typeof effortOverrides[rawItem.id] === 'object'
      ? effortOverrides[rawItem.id]
      : {};
    const manualScore = override.percent ?? local.manualScore ?? rawItem.manualScore;
    const hasManualScore = manualScore != null && Number.isFinite(Number(manualScore));
    return {
      ...rawItem,
      ...local,
      percent: hasManualScore ? Number(manualScore) : undefined,
      manualScore: hasManualScore ? Number(manualScore) : undefined,
      stage: override.stage || local.stage || rawItem.stage,
      status: rawItem.id === 'xlaunchvi'
        ? 'acompanhado'
        : (rawItem.nuked || rawItem.missing || rawItem.status === 'offline' ? 'offline' : rawItem.status),
      gta: { ...(local.gta || {}), ...(rawItem.gta || {}) },
      groundwork: { ...(local.groundwork || {}), ...(rawItem.groundwork || {}) },
      stats: rawItem.stats || local.stats,
      nuked: rawItem.nuked || local.nuked,
      missing: rawItem.missing || rawItem.stats?.missing || local.missing,
      technicalDetails: local.technicalDetails || rawItem.technicalDetails,
      translations: { ...(rawItem.translations || {}), ...(local.translations || {}) }
    };
  });
  localizedEfforts.forEach((item) => {
    if (item && item.id && !merged.efforts.some((effort) => effort.id === item.id)) {
      const override = effortOverrides[item.id] && typeof effortOverrides[item.id] === 'object'
        ? effortOverrides[item.id]
        : {};
      const manualScore = override.percent ?? item.manualScore;
      merged.efforts.push({
        ...item,
        percent: manualScore == null ? undefined : Number(manualScore),
        manualScore: manualScore == null ? undefined : Number(manualScore),
        stage: override.stage || item.stage
      });
    }
  });

  const rawNews = Array.isArray(raw.news) ? raw.news : (Array.isArray(base.news) ? base.news : []);
  const localizedNews = Array.isArray(translated.news) ? translated.news : [];
  const newsMap = new Map(localizedNews.map((item) => [item.id, item]).filter(([key]) => key));
  merged.news = rawNews.map((rawItem) => {
    const local = newsMap.get(rawItem.id);
    if (!local) return { ...rawItem };
    return {
      ...rawItem,
      ...local,
      body: Array.isArray(local.body) ? local.body : (Array.isArray(rawItem.body) ? rawItem.body : []),
      image: rawItem.image !== undefined ? rawItem.image : (local.image ?? null),
      sources: Array.isArray(rawItem.sources) ? rawItem.sources : (Array.isArray(local.sources) ? local.sources : []),
      summary: local.summary || rawItem.dek || rawItem.summary,
      translations: { ...(rawItem.translations || {}), ...(local.translations || {}) }
    };
  });
  localizedNews.forEach((item) => {
    if (item && item.id && !merged.news.some((story) => story.id === item.id)) merged.news.push({ ...item, summary: item.summary || item.dek });
  });

  merged.news = merged.news.slice().sort((left, right) => Date.parse(right.date || right.updatedAt || 0) - Date.parse(left.date || left.updatedAt || 0));
  merged.changes = (Array.isArray(merged.changes) ? merged.changes : []).slice()
    .sort((left, right) => Date.parse(right.date || right.updatedAt || 0) - Date.parse(left.date || left.updatedAt || 0));
  merged.headlines = (Array.isArray(merged.headlines) ? merged.headlines : []).slice()
    .sort((left, right) => Date.parse(right.date || 0) - Date.parse(left.date || 0));
  merged.ignored = {
    ...(base.ignored && typeof base.ignored === 'object' ? base.ignored : {}),
    ...(raw.ignored && typeof raw.ignored === 'object' ? raw.ignored : {}),
    ...(translated.ignored && typeof translated.ignored === 'object' ? translated.ignored : {})
  };
  merged.exe = {
    ...(base.exe && typeof base.exe === 'object' ? base.exe : {}),
    ...(raw.exe && typeof raw.exe === 'object' ? raw.exe : {}),
    ...(translated.exe && typeof translated.exe === 'object' ? translated.exe : {})
  };
  merged.scout = {
    ...(base.scout && typeof base.scout === 'object' ? base.scout : {}),
    ...(raw.scout && typeof raw.scout === 'object' ? raw.scout : {}),
    ...(translated.scout && typeof translated.scout === 'object' ? translated.scout : {})
  };
  const rawUpdated = raw.updated || raw.updatedAt;
  const rawSynced = raw.lastSyncedAt;
  const candidates = [
    merged.lastSyncedAt, rawSynced, merged.updatedAt, rawUpdated,
    fallbackPortwatch.lastSyncedAt, fallbackPortwatch.updated, kynosTracker.updated
  ]
    .filter((timestamp) => typeof timestamp === 'string' && Number.isFinite(Date.parse(timestamp)));
  const latestTimestamp = candidates.sort((left, right) => Date.parse(right) - Date.parse(left))[0];
  if (!merged.updatedAt) merged.updatedAt = rawUpdated || fallbackPortwatch.updated || '';
  if (!merged.lastSyncedAt) merged.lastSyncedAt = rawSynced || fallbackPortwatch.lastSyncedAt || '';
  if (latestTimestamp) merged.lastSyncedAt = latestTimestamp;

  const baseTeams = base.teams && typeof base.teams === 'object' ? base.teams : {};
  const translatedTeams = translated.teams && typeof translated.teams === 'object' ? translated.teams : {};
  merged.teams = { ...baseTeams, ...translatedTeams };
  const baseTeam = baseTeams.xlaunchvi && typeof baseTeams.xlaunchvi === 'object' ? baseTeams.xlaunchvi : {};
  const translatedTeam = translatedTeams.xlaunchvi && typeof translatedTeams.xlaunchvi === 'object' ? translatedTeams.xlaunchvi : {};
  if (Object.keys(baseTeam).length || Object.keys(translatedTeam).length) {
    merged.teams.xlaunchvi = {
      ...baseTeam,
      ...translatedTeam,
      latestReport: translatedTeam.latestReport || baseTeam.latestReport || null,
      repositoryCheck: translatedTeam.repositoryCheck || baseTeam.repositoryCheck || null
    };
  }
  const xlaunchTeam = merged.teams && merged.teams.xlaunchvi;
  if (xlaunchTeam) {
    merged.teams.xlaunchvi = {
      ...xlaunchTeam,
      pixKey: xlaunchTeam.pixKey || 'galinhafritadubs@gmail.com',
      discordUrl: xlaunchTeam.discordUrl || 'https://discord.gg/R5T6zeQuPY',
      kickUrl: xlaunchTeam.kickUrl || 'https://kick.com/myleouss'
    };
  }
  const xlaunchIndex = merged.efforts.findIndex((item) => item && item.id === 'xlaunchvi');
  if (xlaunchIndex >= 0) {
    const xlaunch = merged.efforts[xlaunchIndex];
    merged.efforts[xlaunchIndex] = {
      ...xlaunch,
      percent: 55,
      stage: 'Menu principal a 30 FPS (sem texturas)',
      progressBasis: 'team-report-estimate',
      portwatchPercent: Number.isFinite(Number(xlaunch.portwatchPercent)) ? Number(xlaunch.portwatchPercent) : 0,
      portwatchMilestonePercent: 0,
      status: 'acompanhado'
    };
  } else {
    merged.efforts.push({
      id: 'xlaunchvi',
      name: 'XlaunchVI',
      repo: 'JPTuba9/xlaunch-vi',
      tier: 'watchlist',
      percent: 55,
      stage: 'Menu principal a 30 FPS (sem texturas)',
      progressBasis: 'team-report-estimate',
      portwatchPercent: 0,
      portwatchMilestonePercent: 0,
      status: 'acompanhado',
      summary: 'Os menus do XLaunchVI abrem a 30 FPS sem texturas; o próximo foco é otimizar memória e shaders sem textura. O portal mantém 55% como estimativa editorial local.',
      verification: 'Relato da equipe não verificado independentemente'
    });
  }
  merged.portwatchSource = {
    updatedAt: rawUpdated || fallbackPortwatch.updated || '',
    lastSyncedAt: rawSynced || fallbackPortwatch.lastSyncedAt || '',
    sourceFile: 'data/tracker.json',
    efforts: rawEfforts.map((effort) => ({ ...effort }))
  };

  const localArrayKeys = {
    efforts: (item) => item.id,
    news: (item) => item.id,
    tools: (item) => item.repo || item.name || item.url,
    candidates: (item) => item.repo || item.name || item.url,
    flagged: (item) => item.id || item.pattern || item.label,
    changes: (item) => item.id || `${item.date || item.updatedAt || ''}:${item.kind || ''}:${item.sourceText || item.text || ''}`,
    history: (item) => {
      const date = item.timestamp || item.updatedAt || item.at || item.date;
      return date ? `${date}:${item.leaderId || item.projectId || item.project || ''}` : '';
    },
    headlines: (item) => item.link || item.url || item.title,
    dmca: (item) => item.url || item.path || item.date
  };
  const mergeKynosArray = (field, destination = field) => {
    const localItems = Array.isArray(kynosTracker[field]) ? kynosTracker[field] : [];
    if (!localItems.length) return;
    const baseItems = Array.isArray(merged[destination]) ? merged[destination] : [];
    const positions = new Map(baseItems.map((item, index) => {
      const key = localArrayKeys[field](item);
      return key ? [String(key), index] : null;
    }).filter(Boolean));
    const result = baseItems.slice();
    localItems.forEach((localItem) => {
      const key = localArrayKeys[field](localItem);
      if (!key) return;
      const index = positions.get(String(key));
      if (index === undefined) {
        positions.set(String(key), result.length);
        result.push({ ...localItem });
        return;
      }
      const current = result[index];
      const next = { ...current, ...localItem };
      ['gta', 'groundwork', 'stats', 'technicalDetails', 'translations'].forEach((nested) => {
        if (current[nested] && localItem[nested]
          && typeof current[nested] === 'object' && typeof localItem[nested] === 'object') {
          next[nested] = nested === 'stats'
            ? { ...localItem[nested], ...current[nested] }
            : { ...current[nested], ...localItem[nested] };
        }
      });
      result[index] = next;
    });
    merged[destination] = result;
  };
  Object.keys(localArrayKeys).filter((field) => field !== 'candidates')
    .forEach((field) => mergeKynosArray(field));
  mergeKynosArray('candidates', 'candidateList');
  if (Array.isArray(kynosTracker.candidates) && kynosTracker.candidates.length) {
    merged.candidates = Array.isArray(merged.candidateList) ? merged.candidateList.length : merged.candidates;
  }
  merged.news = (Array.isArray(merged.news) ? merged.news : []).slice()
    .sort((left, right) => Date.parse(right.date || right.updatedAt || 0) - Date.parse(left.date || left.updatedAt || 0));
  merged.changes = (Array.isArray(merged.changes) ? merged.changes : []).slice()
    .sort((left, right) => Date.parse(right.date || right.updatedAt || 0) - Date.parse(left.date || left.updatedAt || 0));
  merged.headlines = (Array.isArray(merged.headlines) ? merged.headlines : []).slice()
    .sort((left, right) => Date.parse(right.date || 0) - Date.parse(left.date || 0));
  merged.kynosSource = {
    updated: kynosTracker.updated || '',
    efforts: Array.isArray(kynosTracker.efforts) ? kynosTracker.efforts.map((effort) => ({ ...effort })) : [],
    news: Array.isArray(kynosTracker.news) ? kynosTracker.news.map((story) => ({ ...story })) : []
  };
  return merged;
}

function renderTargets() {
  const targets = hardware.targets.map((target, index) => ({ target, index }))
    .sort((left, right) => (left.target.displayOrder ?? 100 + left.index) - (right.target.displayOrder ?? 100 + right.index));
  byId('target-options').innerHTML = targets.map(({ target, index }) => `
    <button class="target-option ${index === state.target ? 'selected' : ''}" type="button" data-target="${index}" aria-pressed="${index === state.target}">
      <strong>${escapeHtml(t(target.name))}</strong><span>${escapeHtml(t(target.description))}</span>
    </button>`).join('');
}

function fillSelect(id, items) {
  byId(id).innerHTML = items.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
}

function cpuHasIntegratedGraphics(cpu) {
  if (typeof cpu.integratedGraphics === 'boolean') return cpu.integratedGraphics;
  const model = cpu.name.split(' · ')[0];
  if (model.startsWith('AMD Ryzen')) {
    if (/G(?:T|E)?$/i.test(model) || model.includes('Ryzen AI')) return true;
    const series = cpu.id.match(/ryzen-(?:[3579]-|ai-[3579]-)(\d+)/);
    return Boolean(series && Number(series[1]) >= 7000 && !model.endsWith('F'));
  }
  if (model.includes('Core Ultra')) return !/(?:KF|F)$/i.test(model);
  return !/(?:KF|F)$/i.test(model);
}

function renderGpuSelect() {
  const groups = [
    { key: 'rtx-5', label: 'NVIDIA GeForce RTX Série 50' },
    { key: 'rtx-4', label: 'NVIDIA GeForce RTX Série 40' },
    { key: 'rtx-3', label: 'NVIDIA GeForce RTX Série 30' },
    { key: 'rtx-2', label: 'NVIDIA GeForce RTX Série 20' },
    { key: 'gtx-', label: 'NVIDIA GeForce GTX' },
    { key: 'rx-9', label: 'AMD Radeon RX Série 9000' },
    { key: 'rx-8', label: 'AMD Radeon RX Série 8000 · perfis estimados' },
    { key: 'rx-7', label: 'AMD Radeon RX Série 7000' },
    { key: 'rx-6', label: 'AMD Radeon RX Série 6000' },
    { key: 'rx-5', label: 'AMD Radeon RX Série 5000 e anteriores' },
    { key: 'arc-', label: 'Intel Arc' },
    { key: 'igpu-', label: 'Gráfico integrado · iGPU' }
  ];
  byId('gpu-select').innerHTML = groups.map((group) => {
    const items = hardware.gpus
      .filter((gpu) => gpu.id.startsWith(group.key))
      .sort((left, right) => right.score - left.score)
      .map((gpu) => {
        const brand = gpu.id.startsWith('rtx-') || gpu.id.startsWith('gtx-') ? 'nvidia'
          : gpu.id.startsWith('rx-') || gpu.id.startsWith('igpu-radeon-') ? 'amd'
            : 'intel';
        return `<option value="${escapeHtml(gpu.id)}" data-brand="${brand}" data-integrated="${Boolean(gpu.integrated)}">${escapeHtml(gpu.name)}${gpu.integrated ? ' [iGPU]' : ''}</option>`;
      })
      .join('');
    return items ? `<optgroup label="${escapeHtml(group.label)}">${items}</optgroup>` : '';
  }).join('');
}

function renderCpuSelect() {
  const groups = [
    { label: 'AMD Ryzen — com gráfico integrado (G / GT / iGPU / séries 7000–9000)', brand: 'amd', integrated: true },
    { label: 'AMD Ryzen — sem gráfico integrado (modelos sem iGPU)', brand: 'amd', integrated: false },
    { label: 'Intel Core — com gráfico integrado (iGPU / UHD / Arc)', brand: 'intel', integrated: true },
    { label: 'Intel Core — sem gráfico integrado (F / KF)', brand: 'intel', integrated: false }
  ];
  byId('cpu-select').innerHTML = groups.map((group) => {
    const items = hardware.cpus
      .filter((cpu) => {
        const isAmd = cpu.name.startsWith('AMD Ryzen');
        return (group.brand === 'amd') === isAmd && cpuHasIntegratedGraphics(cpu) === group.integrated;
      })
      .sort((left, right) => right.score - left.score)
      .map((cpu) => `<option value="${escapeHtml(cpu.id)}" data-brand="${group.brand}" data-integrated="${group.integrated}">${escapeHtml(cpu.name)} [${cpuHasIntegratedGraphics(cpu) ? 'iGPU' : 'Sem iGPU'}]</option>`)
      .join('');
    return items ? `<optgroup label="${escapeHtml(group.label)}">${items}</optgroup>` : '';
  }).join('');
}

function renderRamFrequencies(preferredMhz) {
  const generation = hardware.ramGenerations[state.ramGeneration];
  const select = byId('ram-frequency');
  select.innerHTML = generation.frequencies.map((frequency) =>
    `<option value="${frequency.mhz}" data-score="${frequency.score}">${escapeHtml(frequency.label)}</option>`).join('');
  const preferred = preferredMhz || (state.ramGeneration === 'ddr5' ? 4800 : 2133);
  select.value = String(preferred);
  if (!select.value) select.selectedIndex = 0;
}

function renderStorageOptions() {
  byId('storage-options').innerHTML = hardware.storage.map((drive, index) => `
    <label class="storage-choice ${drive.compatible ? '' : 'storage-incompatible'}">
      <input type="radio" name="storage" value="${escapeHtml(drive.id)}" ${drive.id === 'nvme4' ? 'checked' : ''} />
      <span><b>${escapeHtml(drive.name)}</b><small>${escapeHtml(drive.detail)}</small></span>
    </label>`).join('');
  byId('space-select').innerHTML = hardware.freeSpaceOptions.map((space) => {
    const selected = space === 250 ? 'selected' : '';
    const label = space < hardware.requiredFreeSpace ? `Menos de ${space} GB` : space === hardware.requiredFreeSpace ? `${space} GB (requisito estimado)` : `${space} GB livres`;
    return `<option value="${space}" ${selected}>${escapeHtml(label)}</option>`;
  }).join('');
}

function renderConsoleReference() {
  const reference = byId('target-options').nextElementSibling;
  reference.innerHTML = `<b>Referências de console · projeções de mercado para novembro de 2026</b>${hardware.consoles.map((consoleItem) =>
    `<span><strong>${escapeHtml(consoleItem.name)}</strong> · ${escapeHtml(consoleItem.architecture)} · ${consoleItem.gpuTflops.toFixed(2).replace('.', ',')} TFLOPs · ${escapeHtml(consoleItem.memory)} · meta ${escapeHtml(consoleItem.target)}</span>`).join('')}`;
}

function updateRamValue() {
  byId('ram-value').textContent = `${byId('ram-select').value} GB`;
}

function readSetup() {
  const selectedStorage = document.querySelector('input[name="storage"]:checked');
  return {
    target: state.target,
    gpuId: byId('gpu-select').value,
    cpuId: byId('cpu-select').value,
    ramGb: Number(byId('ram-select').value),
    ramGeneration: state.ramGeneration,
    ramMhz: Number(byId('ram-frequency').value),
    channel: state.channel,
    storageId: selectedStorage ? selectedStorage.value : '',
    freeSpaceGb: Number(byId('space-select').value),
    osId: byId('os-select').value,
    backgroundId: byId('background-select').value
  };
}

function isValidSetup(setup) {
  if (!setup || typeof setup !== 'object' || !Number.isInteger(Number(setup.target)) || !hardware.targets[Number(setup.target)]) return false;
  if (!hardware.gpus.some((item) => item.id === setup.gpuId) || !hardware.cpus.some((item) => item.id === setup.cpuId)) return false;
  if (!hardware.ramCapacities.includes(Number(setup.ramGb)) || !hardware.ramGenerations[setup.ramGeneration]) return false;
  if (!hardware.ramGenerations[setup.ramGeneration].frequencies.some((item) => item.mhz === Number(setup.ramMhz))) return false;
  return ['single', 'dual'].includes(setup.channel)
    && hardware.storage.some((item) => item.id === setup.storageId)
    && hardware.freeSpaceOptions.includes(Number(setup.freeSpaceGb))
    && hardware.operatingSystems.some((item) => item.id === setup.osId)
    && hardware.backgroundUsage.some((item) => item.id === setup.backgroundId);
}

function trackSetupChanges(previous, next) {
  const hardwareFields = [
    ['gpuId', 'gpu-select'],
    ['cpuId', 'cpu-select'],
    ['ramGb', 'ram-select'],
    ['ramGeneration', 'ram-generation'],
    ['ramMhz', 'ram-frequency'],
    ['channel', 'ram-channel'],
    ['storageId', 'storage'],
    ['freeSpaceGb', 'space-select'],
    ['osId', 'os-select'],
    ['backgroundId', 'background-select']
  ];
  hardwareFields.forEach(([key, dimension]) => {
    if (previous[key] === next[key]) return;
    let value;
    if (dimension === 'ram-channel') value = next.channel === 'dual' ? 'Canal duplo' : 'Canal único';
    else if (dimension === 'storage') value = hardware.storage.find((item) => item.id === next.storageId).name;
    else if (dimension === 'ram-generation') value = next.ramGeneration.toUpperCase();
    else value = hardwareSelectionLabel(dimension);
    trackHardwareSelection(dimension, value);
  });
  if (previous.target !== next.target) {
    trackEvent('target_selection', hardware.targets[next.target].name, { target: hardware.targets[next.target].name });
  }
}

function applySetup(setup, options = {}) {
  if (!isValidSetup(setup)) throw new Error(t('A configuração selecionada não é válida para este catálogo de hardware.'));
  const previous = readSetup();
  state.target = Number(setup.target);
  state.channel = setup.channel;
  state.ramGeneration = setup.ramGeneration;
  byId('gpu-select').value = setup.gpuId;
  byId('cpu-select').value = setup.cpuId;
  byId('ram-select').value = String(setup.ramGb);
  renderRamFrequencies(Number(setup.ramMhz));
  byId('os-select').value = setup.osId;
  byId('background-select').value = setup.backgroundId;
  byId('space-select').value = String(setup.freeSpaceGb);
  const storage = [...document.querySelectorAll('input[name="storage"]')].find((item) => item.value === setup.storageId);
  if (!storage) throw new Error(t('Não foi possível aplicar o armazenamento selecionado.'));
  storage.checked = true;
  byId('channel-options').querySelectorAll('[data-channel]').forEach((button) => {
    const selected = button.dataset.channel === setup.channel;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  updateRamValue();
  renderTargets();
  ['cpu', 'gpu'].forEach((kind) => {
    byId(`${kind}-search`).value = '';
    byId(`${kind}-filter`).value = 'all';
  });
  filterHardwareOptions('cpu');
  filterHardwareOptions('gpu');
  if (!options.scenarioMode) {
    state.activeScenario = '';
    state.whatIfOriginalSetup = null;
    updateScenarioBadge();
  }
  const next = readSetup();
  if (options.track !== false) trackSetupChanges(previous, next);
  calculate({ trackSimulation: options.track !== false });
}

function normalizeHardwareSearch(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function filterHardwareOptions(kind) {
  const isCpu = kind === 'cpu';
  const select = byId(isCpu ? 'cpu-select' : 'gpu-select');
  const search = normalizeHardwareSearch(byId(isCpu ? 'cpu-search' : 'gpu-search').value);
  const filter = byId(isCpu ? 'cpu-filter' : 'gpu-filter').value;
  const status = byId(isCpu ? 'cpu-filter-status' : 'gpu-filter-status');
  const count = status.querySelector('span');
  const clearButton = status.querySelector('button');
  const previousValue = select.value;
  const matchingOptions = Array.from(select.options).filter((option) => {
    const integrated = option.dataset.integrated === 'true';
    const textMatches = normalizeHardwareSearch(option.textContent).includes(search);
    const categoryMatches = isCpu
      ? filter === 'all' || (filter === 'igpu' ? integrated : !integrated)
      : filter === 'all' || option.dataset.brand === filter;
    return textMatches && categoryMatches;
  });
  if (matchingOptions.length && !matchingOptions.some((option) => option.value === previousValue)) {
    select.value = matchingOptions[0].value;
  }
  const selected = select.selectedOptions[0];
  const matchingSet = new Set(matchingOptions);
  select.querySelectorAll('option').forEach((option) => {
    option.hidden = !matchingSet.has(option) && option !== selected;
  });
  select.querySelectorAll('optgroup').forEach((group) => {
    group.hidden = !Array.from(group.querySelectorAll('option')).some((option) => !option.hidden);
  });
  const activeFilter = Boolean(byId(isCpu ? 'cpu-search' : 'gpu-search').value.trim()) || filter !== 'all';
  clearButton.hidden = !activeFilter;
  count.textContent = matchingOptions.length
    ? `${matchingOptions.length} ${t(matchingOptions.length === 1 ? 'modelo encontrado' : 'modelos encontrados')}`
    : t('Nenhum modelo encontrado. Limpe a busca ou ajuste os filtros.');
  select.disabled = !matchingOptions.length;
  if (previousValue !== select.value) {
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function renderHardware() {
  renderGpuSelect();
  renderCpuSelect();
  fillSelect('os-select', hardware.operatingSystems);
  fillSelect('background-select', hardware.backgroundUsage);
  byId('ram-select').innerHTML = hardware.ramCapacities.map((capacity) =>
    `<option value="${capacity}" ${capacity === 32 ? 'selected' : ''}>${capacity} GB</option>`).join('');
  byId('gpu-select').value = 'rtx-4070';
  byId('cpu-select').value = 'ryzen-7-7800x3d';
  byId('os-select').value = 'windows-11';
  byId('background-select').value = 'normal';
  renderRamFrequencies();
  renderStorageOptions();
  renderTargets();
  renderConsoleReference();
  filterHardwareOptions('cpu');
  filterHardwareOptions('gpu');
  trackHardwareSelection('gpu-select', hardwareSelectionLabel('gpu-select'));
  trackHardwareSelection('cpu-select', hardwareSelectionLabel('cpu-select'));
  trackHardwareSelection('ram-select', `${byId('ram-select').value} GB`);
  trackHardwareSelection('ram-generation', state.ramGeneration.toUpperCase());
  trackHardwareSelection('ram-frequency', `${byId('ram-frequency').value} MHz`);
  trackHardwareSelection('ram-channel', 'Canal duplo');
  trackHardwareSelection('storage', hardware.storage.find((item) => item.id === document.querySelector('input[name="storage"]:checked').value).name);
  trackHardwareSelection('os-select', hardwareSelectionLabel('os-select'));
  trackHardwareSelection('background-select', hardwareSelectionLabel('background-select'));

  byId('target-options').addEventListener('click', (event) => {
    const option = event.target.closest('[data-target]');
    if (!option) return;
    state.target = Number(option.dataset.target);
    renderTargets();
    trackEvent('target_selection', hardware.targets[state.target].name, { target: hardware.targets[state.target].name });
    calculate();
  });
  byId('ram-generation').addEventListener('change', (event) => {
    state.ramGeneration = event.target.value;
    renderRamFrequencies();
    trackHardwareSelection('ram-generation', state.ramGeneration.toUpperCase());
    calculate();
  });
  byId('channel-options').addEventListener('click', (event) => {
    const button = event.target.closest('[data-channel]');
    if (!button) return;
    state.channel = button.dataset.channel;
    byId('channel-options').querySelectorAll('button').forEach((item) => {
      item.classList.toggle('selected', item === button);
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    trackHardwareSelection('ram-channel', state.channel === 'dual' ? 'Canal duplo' : 'Canal único');
    calculate();
  });
  ['gpu-select', 'cpu-select', 'ram-select', 'ram-frequency', 'os-select', 'background-select', 'space-select'].forEach((id) =>
    byId(id).addEventListener('change', () => {
      updateRamValue();
      const select = byId(id);
      trackHardwareSelection(id, hardwareSelectionLabel(id));
      calculate();
    }));
  byId('storage-options').addEventListener('change', (event) => {
    const choice = event.target.closest('input[name="storage"]');
    if (choice) trackHardwareSelection('storage', hardware.storage.find((item) => item.id === choice.value).name);
    calculate();
  });
  [['cpu-search', 'cpu'], ['cpu-filter', 'cpu'], ['gpu-search', 'gpu'], ['gpu-filter', 'gpu']].forEach(([id, kind]) => {
    const control = byId(id);
    control.addEventListener(id.endsWith('search') ? 'input' : 'change', () => filterHardwareOptions(kind));
    control.addEventListener('change', () => trackEvent('hardware_filter', kind, { query: byId(`${kind}-search`).value, filter: byId(`${kind}-filter`).value }));
  });
  [['cpu-filter-clear', 'cpu'], ['gpu-filter-clear', 'gpu']].forEach(([id, kind]) => {
    byId(id).addEventListener('click', () => {
      byId(`${kind}-search`).value = '';
      byId(`${kind}-filter`).value = 'all';
      filterHardwareOptions(kind);
      trackEvent('hardware_filter_clear', kind);
      byId(`${kind}-search`).focus();
    });
  });
  updateRamValue();
  calculate();
}

function calculate(options = {}) {
  if (!hardware) return;
  const setup = options.setup || readSetup();
  const reference = options.reference || null;
  const scenario = options.scenario === undefined ? state.activeScenario : options.scenario;
  const target = { ...hardware.targets[Number(setup.target)] };
  if (scenario === 'chaos-vram') target.vramGb *= 2;
  const gpu = reference
    ? { id: `console-gpu-${reference.name}`, name: `${reference.name} · GPU equivalente`, score: reference.gpuScore, vram: reference.vramGb }
    : hardware.gpus.find((item) => item.id === setup.gpuId);
  const cpu = reference
    ? { id: `console-cpu-${reference.name}`, name: `${reference.name} · CPU equivalente`, score: reference.cpuScore, memoryGenerations: ['ddr4', 'ddr5'] }
    : hardware.cpus.find((item) => item.id === setup.cpuId);
  const ramCapacity = Number(reference ? reference.ramGb : setup.ramGb);
  const ramGeneration = reference ? { name: 'GDDR6', score: 1 } : hardware.ramGenerations[setup.ramGeneration];
  const frequency = reference ? { mhz: 0, score: 1 } : ramGeneration.frequencies.find((item) => item.mhz === Number(setup.ramMhz));
  const storageId = reference ? reference.storageTier : setup.storageId;
  const storage = hardware.storage.find((item) => item.id === storageId);
  const targetStorage = hardware.storage.find((item) => item.id === target.storageTier);
  const freeSpace = Number(reference ? hardware.requiredFreeSpace : setup.freeSpaceGb);
  const os = reference ? { name: 'SO otimizado', score: 1 } : hardware.operatingSystems.find((item) => item.id === setup.osId);
  const background = reference ? { name: 'Jogo limpo', score: 1 } : hardware.backgroundUsage.find((item) => item.id === setup.backgroundId);
  const channel = reference ? 'dual' : setup.channel;
  const memoryCompatible = reference ? true : cpu.memoryGenerations.includes(setup.ramGeneration);
  const referenceMhz = reference ? 0 : setup.ramGeneration === target.ramGeneration ? target.frequencyMhz : setup.ramGeneration === 'ddr4' ? 3200 : 5600;
  const bandwidth = reference ? reference.bandwidthGbps : Number(setup.ramMhz) * 8 * (channel === 'dual' ? 2 : 1) / 1000;
  const spaceFactor = freeSpace < hardware.requiredFreeSpace ? hardware.penalties.insufficientSpace : 1;
  const ramCapacityFactor = Math.min(1, ramCapacity / target.ramGb);
  const bandwidthRatio = bandwidth / target.bandwidthGbps;
  const channelFactor = channel === 'single' ? hardware.penalties.singleChannel : 1;
  const generationFactor = reference ? 1 : ramGeneration.score / hardware.ramGenerations[setup.ramGeneration].score;
  const memoryCompatibilityFactor = memoryCompatible ? 1 : hardware.penalties.memoryMismatch;
  const ramScore = ramCapacityFactor * bandwidthRatio * channelFactor * generationFactor * memoryCompatibilityFactor;
  const gpuRatio = gpu.score / target.gpuScore;
  const cpuRatio = cpu.score / target.cpuScore;
  const vramRatio = gpu.integrated ? 0 : gpu.vram / target.vramGb;
  const vramMultiplier = gpu.integrated
    ? hardware.penalties.vramFloor
    : Math.min(1, Math.max(hardware.penalties.vramFloor, vramRatio));
  const gpuEffectiveScore = gpuRatio * vramMultiplier;
  const storageRatio = (storage.score / targetStorage.score) * spaceFactor;
  const overheadRatio = os.score * background.score;
  const factors = [
    { key: 'gpu', label: gpu.integrated ? 'GPU integrada' : 'GPU', score: gpuRatio },
    { key: 'vram', label: 'VRAM dedicada', score: vramRatio },
    { key: 'cpu', label: 'CPU', score: cpuRatio },
    { key: 'ram', label: 'RAM e canal', score: ramScore },
    { key: 'bandwidth', label: 'Largura de banda', score: bandwidthRatio },
    { key: 'storage', label: 'SSD e espaço', score: storageRatio },
    { key: 'overhead', label: 'SO e segundo plano', score: overheadRatio }
  ];
  const weightedScore = gpuEffectiveScore * hardware.weights.gpu
    + cpuRatio * hardware.weights.cpu
    + ramScore * hardware.weights.ram
    + storageRatio * hardware.weights.storage
    + overheadRatio * hardware.weights.overhead;
  let finalRatio = weightedScore;
  if (!storage.compatible) finalRatio *= hardware.penalties.hdd;
  else if (freeSpace < hardware.requiredFreeSpace) finalRatio *= hardware.penalties.insufficientSpace;
  if (!memoryCompatible) finalRatio *= hardware.penalties.memoryMismatch;
  const score = Math.max(0, Math.round(finalRatio * 100));

  const bottleneck = factors.reduce((lowest, factor) => factor.score < lowest.score ? factor : lowest, factors[0]);
  const bottleneckLabel = bottleneck.score < 0.9 ? bottleneck.label : '';
  const isCompatible = storage.compatible && freeSpace >= hardware.requiredFreeSpace && memoryCompatible;
  const status = !storage.compatible ? 'Armazenamento incompatível' : freeSpace < hardware.requiredFreeSpace ? 'Espaço insuficiente' : !memoryCompatible ? 'Memória incompatível' : score >= 95 ? 'Meta atingida' : score >= 75 ? 'Perto da meta' : 'Abaixo da meta';
  const statusColor = !isCompatible || !memoryCompatible || score < 75 ? 'var(--status-danger)' : score < 95 ? 'var(--status-warning)' : 'var(--green)';
  const summary = !storage.compatible
    ? 'HDD não atende ao requisito estimado. Troque por SSD para continuar.'
    : freeSpace < hardware.requiredFreeSpace
      ? `Libere ao menos ${hardware.requiredFreeSpace} GB para atender ao espaço estimado.`
      : !memoryCompatible
        ? `A geração ${ramGeneration.name} não é compatível com este processador. Confira CPU e placa-mãe.`
        : score >= 95
          ? 'Sua configuração está bem alinhada à meta escolhida.'
          : score >= 75
            ? 'Alguns ajustes podem ajudar a manter a experiência mais estável.'
            : 'Reduza a meta gráfica ou priorize o componente limitante.';
  const fpsValues = [target.fps.minimum, target.fps.average, target.fps.low].map((fps) => Math.max(0, Math.round(fps * finalRatio)));
  const evaluation = {
    setup,
    target,
    gpu,
    cpu,
    storage,
    score,
    finalRatio,
    isCompatible,
    status,
    statusColor,
    summary,
    fpsValues,
    bandwidth,
    ramCapacity,
    ramGeneration,
    frequency,
    channel,
    factors,
    bottleneck,
    bottleneckLabel,
    storageRatio,
    freeSpace,
    referenceMhz,
    memoryCompatible
  };
  if (options.render === false) return evaluation;

  updateQuickReadiness();
  byId('score-value').innerHTML = counterMarkup(score);
  byId('score-ring').style.setProperty('--score', `${Math.min(score, 100)}%`);
  byId('status-label').textContent = t(status);
  byId('status-label').style.color = statusColor;
  byId('result-status-dot').style.background = statusColor;
  byId('result-headline').textContent = t(target.name);
  byId('result-summary').textContent = t(summary);
  byId('fps-average').innerHTML = counterMarkup(fpsValues[1]);
  byId('fps-resolution').textContent = t(target.name);
  byId('fps-values').innerHTML = fpsValues.map((fps) => counterMarkup(fps)).join(' / ');
  byId('fps-panel').classList.toggle('fps-incompatible', !isCompatible);
  byId('summary-cpu').textContent = t(cpu.name);
  byId('summary-gpu').textContent = `${gpu.integrated ? `${t('GPU integrada')} · ` : ''}${t(gpu.name)}`;
  byId('summary-ram').textContent = `${ramCapacity} GB ${ramGeneration.name} · ${frequency.mhz.toLocaleString('pt-BR')} MHz · ${t(channel === 'dual' ? 'Canal duplo' : 'Canal único')}`;
  byId('summary-storage').textContent = `${t(storage.name)} · ${freeSpace} GB ${t('livres')}`;
  byId('summary-os').textContent = `${t(os.name)} · ${t(background.name)}`;
  byId('bandwidth-value').textContent = `${bandwidth.toFixed(1).replace('.', ',')} GB/s`;
  byId('memory-detail').textContent = reference ? `${ramCapacity} GB ${ramGeneration.name} · ${Math.round(bandwidth)} GB/s · console` : `${ramCapacity} GB ${ramGeneration.name} · ${frequency.mhz.toLocaleString('pt-BR')} MHz · ${channel === 'dual' ? 'canal duplo' : 'canal único'}`;
  byId('factor-list').innerHTML = factors.map((factor) => {
    const percent = Math.max(0, Math.round(factor.score * 100));
    return `<div class="factor-row"><span class="factor-label">${escapeHtml(factor.label)}</span><div class="factor-track"><div class="factor-fill" style="width:${Math.min(percent, 100)}%"></div></div><span class="factor-value">${counterMarkup(percent, 'percent')}%</span></div>`;
  }).join('');
  byId('bottleneck-title').textContent = !storage.compatible
    ? 'Armazenamento: HDD incompatível'
    : freeSpace < hardware.requiredFreeSpace
      ? `Armazenamento: faltam ${hardware.requiredFreeSpace - freeSpace} GB`
      : !memoryCompatible
        ? `RAM: ${cpu.name} não é compatível com ${ramGeneration.name}`
        : bottleneckLabel
          ? `${bottleneckLabel} é o principal gargalo`
          : 'Configuração equilibrada para esta meta';
  byId('bottleneck-detail').textContent = !storage.compatible
    ? 'O jogo exige armazenamento SSD nesta estimativa. HDD não é recomendado; use um SSD SATA ou NVMe.'
    : freeSpace < hardware.requiredFreeSpace
      ? `O requisito estimado é de aproximadamente ${hardware.requiredFreeSpace} GB livres.`
      : !memoryCompatible
        ? `Este processador aceita ${cpu.memoryGenerations.map((generation) => generation.toUpperCase()).join(' ou ')}. Confira a placa-mãe e a geração da memória.`
        : bottleneckLabel
          ? `${bottleneck.label}: ${Math.round(bottleneck.score * 100)}% da referência escolhida para a meta.`
          : 'Nenhum componente está significativamente abaixo da referência escolhida.';
  updateMemoryPressure(evaluation);
  updateBottleneckHumor(evaluation);
  updateSetupCardPreview(evaluation);
  renderUpgradeEconomics(setup);
  renderRecommendations({ gpu, cpu, ramCapacity, ramGeneration, frequency, referenceMhz, memoryCompatible, storage, storageRatio, freeSpace, target, targetStorage, factors, bottleneckLabel, isCompatible, channel, backgroundId: setup.backgroundId });
  window.KynosI18n.translateDom(byId('result-panel'), state.language);
  animateCounters(byId('result-panel'));
  if (options.trackSimulation !== false) {
    trackEvent('simulation', target.name, {
      target: target.name,
      gpu: gpu.name,
      cpu: cpu.name,
      ramGb: ramCapacity,
      ramGeneration: reference ? 'GDDR6' : setup.ramGeneration,
      ramMhz: reference ? 0 : frequency.mhz,
      channel,
      storage: storage.id,
      operatingSystem: os.name,
      background: background.name,
      score
    });
  }
  applyLanguage();
  return evaluation;
}

function updateMemoryPressure(evaluation) {
  const section = byId('memory-pressure');
  if (!section) return;
  const ramCoverage = Math.round(evaluation.ramCapacity / evaluation.target.ramGb * 100);
  const ramWidth = Math.max(0, Math.min(100, ramCoverage));
  const graphicsMemory = evaluation.gpu.integrated
    ? `<div class="memory-pressure-row"><div><span>${escapeHtml(t('VRAM dedicada'))}</span><strong>${escapeHtml(t('Gráfico integrado · usa RAM compartilhada'))}</strong></div><div class="memory-pressure-track"><span class="memory-pressure-shared"></span></div><small>${escapeHtml(t('O modelo não mede a memória compartilhada em separado.'))}</small></div>`
    : (() => {
      const vramCoverage = Math.round(evaluation.gpu.vram / evaluation.target.vramGb * 100);
      return `<div class="memory-pressure-row"><div><span>${escapeHtml(t('VRAM dedicada'))}</span><strong>${counterMarkup(vramCoverage)}% · ${evaluation.gpu.vram} / ${evaluation.target.vramGb} GB</strong></div><div class="memory-pressure-track" role="progressbar" aria-label="${escapeHtml(t('Cobertura da referência de VRAM'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, vramCoverage)}"><span data-progress-value="${Math.max(0, Math.min(100, vramCoverage))}"></span></div><small>${escapeHtml(t(memoryCoverageLabel(vramCoverage)))}</small></div>`;
    })();
  section.innerHTML = `<span class="section-kicker">${escapeHtml(t('TERMÔMETRO DE RAM E VRAM'))}</span>
    <h4 id="memory-pressure-title">${escapeHtml(t('Memória perto do limite?'))}</h4>
    <div class="memory-pressure-row"><div><span>${escapeHtml(t('RAM do sistema · referência'))}</span><strong>${counterMarkup(ramCoverage)}% · ${evaluation.ramCapacity} / ${evaluation.target.ramGb} GB</strong></div><div class="memory-pressure-track" role="progressbar" aria-label="${escapeHtml(t('Cobertura da referência de RAM'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${ramWidth}"><span data-progress-value="${ramWidth}"></span></div><small>${escapeHtml(t(memoryCoverageLabel(ramCoverage)))}</small></div>
    ${graphicsMemory}
    <p>${escapeHtml(t('Indicadores relativos às referências do simulador; não são leitura do uso real do sistema.'))}</p>`;
  window.KynosI18n.translateDom(section, state.language);
  animateCounters(section);
  requestAnimationFrame(() => {
    recalculateProgressConnectors(section);
    setTimeout(() => recalculateProgressConnectors(section), 700);
  });
  if (typeof ResizeObserver !== 'undefined') {
    if (section._pwConnectorObserver) section._pwConnectorObserver.disconnect();
    const observer = new ResizeObserver(() => recalculateProgressConnectors(section));
    observer.observe(section);
    section._pwConnectorObserver = observer;
  }
}

function memoryCoverageLabel(coverage) {
  if (coverage < 80) return 'Abaixo da referência estimada';
  if (coverage < 100) return 'Perto da referência estimada';
  return 'Referência estimada coberta; sem medição de folga real';
}

function updateBottleneckHumor(evaluation) {
  const output = byId('bottleneck-humor');
  if (!output) return;
  const rankedFactors = evaluation.factors.slice().sort((left, right) => left.score - right.score);
  const primary = rankedFactors[0];
  const next = rankedFactors[1];
  const jokes = {
    gpu: 'A GPU está puxando o freio de mão; baixar a resolução costuma aliviar o trânsito.',
    vram: 'A VRAM já pediu reforço; texturas menores ajudam antes do cartão corporativo.',
    cpu: 'O processador virou gerente de fila: todo mundo espera ele terminar a reunião.',
    ram: 'A RAM está fazendo malabarismo com poucos pratos; canal duplo dá mais pista, não mais GB.',
    bandwidth: 'A memória está numa pista simples; o canal duplo pode abrir a segunda faixa.',
    storage: 'O SSD não faz milagre de FPS, mas espaço insuficiente transforma o loading num retiro.',
    overhead: 'Tem tanta coisa no fundo que o jogo vai pedir silêncio no condomínio.'
  };
  const joke = primary.score >= 0.9
    ? t('Nenhum gargalo gritante; até o ventilador pode tirar um minuto de reunião.')
    : t(jokes[primary.key] || 'O gargalo está fazendo hora extra; priorize o componente mais abaixo da referência.');
  output.innerHTML = `<span class="section-kicker">${escapeHtml(t('TERMÔMETRO DO GARGALO'))}</span>
    <p>${escapeHtml(joke)}</p>
    <small>${escapeHtml(t('Próximo limitante provável:'))} <b>${escapeHtml(t(next.label))}</b> · ${counterMarkup(Math.max(0, next.score * 100), 'percent')}%</small>`;
  window.KynosI18n.translateDom(output, state.language);
  animateCounters(output);
}

function updateSetupCardPreview(evaluation) {
  const preview = byId('setup-card-preview');
  if (!preview) return;
  preview.innerHTML = `<div class="setup-card-art">
    <div class="setup-card-brand"><span>KYNOSRECOMPVI</span><span>${escapeHtml(t('CARTEIRINHA DE SETUP'))}</span></div>
    <div class="setup-card-main"><div><strong>${counterMarkup(evaluation.fpsValues[1])}</strong><span>FPS · ${escapeHtml(t(evaluation.target.name))}</span></div><span class="setup-card-score">${counterMarkup(evaluation.score)}%</span></div>
    <div class="setup-card-parts"><span><small>CPU</small><b>${escapeHtml(evaluation.cpu.name)}</b></span><span><small>GPU</small><b>${escapeHtml(evaluation.gpu.name)}</b></span><span><small>RAM</small><b>${evaluation.ramCapacity} GB ${escapeHtml(evaluation.ramGeneration.name)}</b></span></div>
  </div>`;
  window.KynosI18n.translateDom(preview, state.language);
  animateCounters(preview);
}

function renderUpgradeEconomics(setup) {
  const output = byId('upgrade-economics');
  if (!output || !hardware) return;
  const baseline = calculate({ setup, render: false, trackSimulation: false, scenario: '' });
  const candidates = [
    { scenario: 'upgrade-ram16', label: '+16 GB de RAM' },
    { scenario: 'upgrade-nvme', label: 'Migrar para SSD NVMe' },
    { scenario: 'upgrade-gpu-mid', label: 'GPU intermediária' },
    { scenario: 'target-900p', label: 'Ajustar para 900p' },
    { scenario: 'target-720p', label: 'Ajustar para 720p' }
  ];
  output.innerHTML = candidates.map((candidate) => {
    try {
      const variant = scenarioSetup(candidate.scenario, setup);
      const result = calculate({ setup: variant, render: false, trackSimulation: false, scenario: '' });
      const delta = result.fpsValues[1] - baseline.fpsValues[1];
      const sign = delta > 0 ? '+' : delta < 0 ? '−' : '±';
      return `<article class="upgrade-economics-row">
        <span>${escapeHtml(t(candidate.label))}</span>
        <strong>${counterMarkup(result.fpsValues[1])} FPS</strong>
        <small>${escapeHtml(t('Variação estimada:'))} ${sign}${counterMarkup(Math.abs(delta))} FPS</small>
        <button class="tool-button" type="button" data-scenario="${escapeHtml(candidate.scenario)}">${escapeHtml(t('Testar no resumão'))}</button>
      </article>`;
    } catch (error) {
      return `<article class="upgrade-economics-row is-unavailable"><span>${escapeHtml(t(candidate.label))}</span><small>${escapeHtml(error.message)}</small></article>`;
    }
  }).join('');
  window.KynosI18n.translateDom(output, state.language);
  animateCounters(output);
}

function renderRecommendations(context) {
  const { gpu, cpu, ramCapacity, ramGeneration, frequency, referenceMhz, memoryCompatible, storage, storageRatio, freeSpace, target, targetStorage, factors, bottleneckLabel, isCompatible, channel, backgroundId } = context;
  const recommendations = [];
  if (!storage.compatible) recommendations.push('Substitua o HDD por SSD SATA ou NVMe; HDD não atende ao requisito estimado.');
  else if (freeSpace < hardware.requiredFreeSpace) recommendations.push(`Libere pelo menos ${hardware.requiredFreeSpace} GB de espaço no SSD.`);
  if (!memoryCompatible) recommendations.push(`Use ${cpu.memoryGenerations.map((generation) => generation.toUpperCase()).join(' ou ')}: a geração escolhida não é compatível com este processador.`);
  if (channel === 'single') recommendations.push('Ative o canal duplo com módulos pareados para ampliar a largura de banda e reduzir engasgos.');
  if (ramCapacity < target.ramGb) recommendations.push(`Considere ${target.ramGb} GB de RAM ou mais para esta meta.`);
  if (frequency.mhz < referenceMhz && memoryCompatible) recommendations.push(`Ative XMP/EXPO na BIOS para aproximar a memória de ${referenceMhz.toLocaleString('pt-BR')} MHz.`);
  if (gpu.integrated) recommendations.push('O gráfico integrado usa memória compartilhada; uma placa de vídeo dedicada melhora a margem de desempenho.');
  else if (gpu.vram < target.vramGb) recommendations.push(`A VRAM da placa (${gpu.vram} GB) está abaixo da referência de ${target.vramGb} GB para esta meta; reduza texturas ou considere uma GPU com mais VRAM.`);
  if (bottleneckLabel === 'GPU') recommendations.push('Reduza resolução e qualidade gráfica; teste DLSS ou FSR se disponíveis.');
  if (bottleneckLabel === 'CPU') recommendations.push('Feche tarefas intensivas em segundo plano ou considere um processador mais rápido.');
  if (backgroundId === 'heavy') recommendations.push('Feche aplicativos de transmissão e processos pesados durante o jogo.');
  if (storage.compatible && storageRatio < 0.95) recommendations.push(`Considere um SSD ${targetStorage.name.replace('SSD ', '')} para acompanhar a meta selecionada.`);
  if (!isCompatible && storage.compatible && freeSpace >= hardware.requiredFreeSpace && memoryCompatible) recommendations.push('Confira se o volume selecionado é um SSD saudável e possui espaço disponível.');
  if (recommendations.length === 0) recommendations.push('Mantenha os drivers atualizados e confirme XMP/EXPO e o canal duplo na BIOS.');
  byId('recommendation-list').innerHTML = recommendations.slice(0, 4).map((recommendation) => `<li>${escapeHtml(recommendation)}</li>`).join('');
}

function updateTheme(theme, track = true) {
  if (!['dark', 'light'].includes(theme)) throw new Error(t('Tema inválido.'));
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const toggle = byId('theme-toggle');
  toggle.setAttribute('aria-pressed', String(theme === 'light'));
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Não foi possível salvar o tema preferido:', error);
    setToolStatus(t('Não foi possível salvar o tema neste navegador.'));
  }
  if (track) trackEvent('theme_change', theme, { theme });
}

function initializeTheme() {
  let savedTheme = 'dark';
  try {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') savedTheme = storedTheme;
  } catch (error) {
    console.error('Não foi possível ler o tema salvo:', error);
  }
  updateTheme(savedTheme, false);
}

function defaultPresets() {
  return [
    {
      id: 'sample-entry',
      name: 'PC de Entrada',
      example: true,
      setup: { target: 0, gpuId: 'rtx-2060', cpuId: 'ryzen-5-3600', ramGb: 16, ramGeneration: 'ddr4', ramMhz: 3200, channel: 'single', storageId: 'sata', freeSpaceGb: 250, osId: 'windows-11', backgroundId: 'normal' }
    },
    {
      id: 'sample-mid',
      name: 'PC Intermediário',
      example: true,
      setup: { target: 2, gpuId: 'rtx-4070', cpuId: 'ryzen-7-7800x3d', ramGb: 32, ramGeneration: 'ddr5', ramMhz: 5600, channel: 'dual', storageId: 'nvme4', freeSpaceGb: 500, osId: 'optimized', backgroundId: 'clean' }
    },
    {
      id: 'sample-high',
      name: 'PC High-End',
      example: true,
      setup: { target: 5, gpuId: 'rtx-5090', cpuId: 'ryzen-7-9800x3d', ramGb: 64, ramGeneration: 'ddr5', ramMhz: 6000, channel: 'dual', storageId: 'nvme5', freeSpaceGb: 500, osId: 'optimized', backgroundId: 'clean' }
    }
  ];
}

function validatePresetCollection(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.presets) || value.presets.length > 50) {
    throw new Error(t('O arquivo não contém uma lista de presets KynosRecompVI válida.'));
  }
  const ids = new Set();
  const presets = value.presets.map((preset) => {
    if (!preset || typeof preset.id !== 'string' || typeof preset.name !== 'string' || !preset.name.trim() || preset.name.trim().length > 50 || !isValidSetup(preset.setup) || ids.has(preset.id)) {
      throw new Error(t('Um ou mais presets têm dados inválidos.'));
    }
    ids.add(preset.id);
    return { id: preset.id, name: preset.name.trim(), example: preset.example === true, setup: readSetupShape(preset.setup) };
  });
  return presets;
}

function readSetupShape(setup) {
  return {
    target: Number(setup.target),
    gpuId: setup.gpuId,
    cpuId: setup.cpuId,
    ramGb: Number(setup.ramGb),
    ramGeneration: setup.ramGeneration,
    ramMhz: Number(setup.ramMhz),
    channel: setup.channel,
    storageId: setup.storageId,
    freeSpaceGb: Number(setup.freeSpaceGb),
    osId: setup.osId,
    backgroundId: setup.backgroundId
  };
}

function getPresets() {
  const raw = localStorage.getItem(PRESETS_KEY);
  if (raw === null) {
    const presets = defaultPresets();
    localStorage.setItem(PRESETS_KEY, JSON.stringify({ version: 1, presets }));
    return presets;
  }
  const saved = JSON.parse(raw);
  return validatePresetCollection({ version: saved.version, presets: saved.presets });
}

function savePresets(presets) {
  if (presets.length > 50) throw new Error(t('O limite é de 50 presets por navegador.'));
  localStorage.setItem(PRESETS_KEY, JSON.stringify({ version: 1, presets: validatePresetCollection({ version: 1, presets }) }));
}

function createLocalId() {
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function setToolStatus(message) {
  const status = byId('share-status');
  if (status) status.textContent = message;
}

function downloadJsonFile(fileName, data) {
  downloadBlobFile(fileName, new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
}

function downloadBlobFile(fileName, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderPresetList() {
  const list = byId('preset-list');
  try {
    const presets = getPresets();
    list.innerHTML = presets.length ? presets.map((preset) => `
      <article class="preset-row">
        <div><b translate="no">${escapeHtml(preset.example ? t(preset.name) : preset.name)}</b><small>${escapeHtml(t(hardware.targets[preset.setup.target].name))} · ${escapeHtml(preset.setup.ramGb)} GB ${escapeHtml(preset.setup.ramGeneration.toUpperCase())}</small></div>
        <div class="preset-actions">
          <button type="button" class="tool-button" data-preset-action="load" data-preset-id="${escapeHtml(preset.id)}">Carregar</button>
          <button type="button" class="tool-button" data-preset-action="update" data-preset-id="${escapeHtml(preset.id)}">Atualizar</button>
          <button type="button" class="tool-button" data-preset-action="rename" data-preset-id="${escapeHtml(preset.id)}">Renomear</button>
          <button type="button" class="tool-button tool-danger" data-preset-action="delete" data-preset-id="${escapeHtml(preset.id)}">Excluir</button>
        </div>
        <div class="preset-delete-confirm" hidden>
          <span>${escapeHtml(t('Excluir este preset?'))}</span>
          <button type="button" class="tool-button tool-danger" data-preset-action="delete-confirm" data-preset-id="${escapeHtml(preset.id)}">${escapeHtml(t('Confirmar exclusão'))}</button>
          <button type="button" class="tool-button" data-delete-cancel>${escapeHtml(t('Cancelar'))}</button>
        </div>
        <form class="preset-rename-form" data-preset-id="${escapeHtml(preset.id)}" hidden>
          <label class="sr-only" for="rename-${escapeHtml(preset.id)}">${escapeHtml(t('Novo nome do preset'))}</label>
          <input id="rename-${escapeHtml(preset.id)}" name="name" maxlength="50" value="${escapeHtml(preset.name)}" required />
          <button type="submit" class="tool-button">${escapeHtml(t('Salvar nome'))}</button>
          <button type="button" class="tool-button" data-rename-cancel>${escapeHtml(t('Cancelar'))}</button>
        </form>
      </article>`).join('') : `<p class="preset-empty">${escapeHtml(t('Nenhum preset salvo.'))}</p>`;
    byId('preset-status').textContent = '';
    window.KynosI18n.translateDom(list, state.language);
  } catch (error) {
    console.error('Não foi possível carregar os presets locais:', error);
    list.innerHTML = `<p class="preset-empty">${escapeHtml(t('Não foi possível ler os presets locais. Exporte uma cópia válida ou limpe os dados do navegador.'))}</p>`;
    byId('preset-status').textContent = error.message;
  }
}

function renderCompareOptions() {
  const presets = getPresets();
  const options = [
    `<option value="current">${escapeHtml(t('Configuração atual'))}</option>`,
    ...presets.map((preset) => `<option value="preset:${escapeHtml(preset.id)}" ${preset.example ? '' : 'translate="no"'}>${escapeHtml(preset.example ? t(preset.name) : preset.name)}</option>`),
    ...hardware.consoles.map((consoleItem, index) => `<option value="console:${index}">${escapeHtml(t(consoleItem.name))} · ${escapeHtml(t('referência'))}</option>`)
  ].join('');
  ['compare-a', 'compare-b'].forEach((id) => { byId(id).innerHTML = options; });
  byId('compare-a').value = 'current';
  byId('compare-b').value = presets.length ? `preset:${presets[0].id}` : 'console:0';
  renderComparison();
  window.KynosI18n.translateDom(byId('compare-dialog'), state.language);
}

function compareDefinition(value) {
  if (value === 'current') return { name: t('Configuração atual'), setup: readSetup() };
  if (value.startsWith('preset:')) {
    const id = value.slice('preset:'.length);
    const preset = getPresets().find((item) => item.id === id);
    if (!preset) throw new Error(t('O preset selecionado não foi encontrado.'));
    return { name: preset.example ? t(preset.name) : preset.name, setup: preset.setup };
  }
  if (value.startsWith('console:')) {
    const consoleItem = hardware.consoles[Number(value.slice('console:'.length))];
    if (!consoleItem) throw new Error(t('A referência de console selecionada não foi encontrada.'));
    const profileIndex = consoleItem.name === 'Xbox Series S' ? 1 : 3;
    const profile = hardware.targets[profileIndex];
    const seriesX = hardware.consoles.find((item) => item.name === 'Xbox Series X');
    const gpuScore = consoleItem.name === 'Xbox Series S'
      ? profile.gpuScore
      : profile.gpuScore * consoleItem.gpuTflops / seriesX.gpuTflops;
    const memoryGb = Number.parseInt(consoleItem.memory, 10);
    return {
      name: t(consoleItem.name),
      setup: readSetup(),
      reference: {
        name: consoleItem.name,
        gpuScore,
        cpuScore: profile.cpuScore,
        vramGb: memoryGb,
        ramGb: profile.ramGb,
        bandwidthGbps: profile.bandwidthGbps,
        storageTier: profile.storageTier
      }
    };
  }
  throw new Error(t('A seleção do comparador não é válida.'));
}

function comparisonFactorDifference(first, second) {
  const scoreOf = (evaluation, key) => evaluation.factors.find((factor) => factor.key === key).score;
  const differences = [
    { key: 'GPU / VRAM', value: Math.max(Math.abs(scoreOf(first, 'gpu') - scoreOf(second, 'gpu')), Math.abs(scoreOf(first, 'vram') - scoreOf(second, 'vram'))) },
    { key: 'CPU', value: Math.abs(scoreOf(first, 'cpu') - scoreOf(second, 'cpu')) },
    { key: 'RAM e canal', value: Math.max(Math.abs(scoreOf(first, 'ram') - scoreOf(second, 'ram')), Math.abs(scoreOf(first, 'bandwidth') - scoreOf(second, 'bandwidth'))) },
    { key: 'SSD', value: Math.abs(scoreOf(first, 'storage') - scoreOf(second, 'storage')) },
    { key: 'SO e segundo plano', value: Math.abs(scoreOf(first, 'overhead') - scoreOf(second, 'overhead')) }
  ];
  return differences.reduce((largest, item) => item.value > largest.value ? item : largest, differences[0]);
}

function renderComparison(track = false) {
  try {
    const first = compareDefinition(byId('compare-a').value);
    const second = compareDefinition(byId('compare-b').value);
    const firstResult = calculate({ setup: first.setup, reference: first.reference, render: false, trackSimulation: false });
    const secondResult = calculate({ setup: second.setup, reference: second.reference, render: false, trackSimulation: false });
    const largest = comparisonFactorDifference(firstResult, secondResult);
    const renderSide = (label, definition, result) => `
      <article class="compare-side">
        <span>${escapeHtml(label)}</span><h3 translate="no">${escapeHtml(definition.name)}</h3>
        <small>${escapeHtml(t('Meta:'))} ${escapeHtml(t(result.target.name))}</small>
        <strong>${result.score}%</strong>
        <small>${escapeHtml(t('FPS:'))} ${escapeHtml(result.fpsValues ? result.fpsValues.join(' / ') : t('Indisponível'))}</small>
        <small>${escapeHtml(t('mínimo / médio / 1% baixo'))}</small>
      </article>`;
    const differentTargets = firstResult.target !== secondResult.target;
    byId('compare-result').innerHTML = `
      <div class="compare-columns">${renderSide('Lado A', first, firstResult)}${renderSide('Lado B', second, secondResult)}</div>
      <p class="compare-delta">Diferença geral: <b>${Math.abs(firstResult.score - secondResult.score)} p.p.</b></p>
      <p class="compare-largest">Maior diferença: <b>${escapeHtml(t(largest.key))}</b> · ${Math.round(largest.value * 100)} p.p.</p>
      <p class="compare-note">${differentTargets ? `${escapeHtml(t('Metas diferentes: cada percentual é calculado em relação à meta do respectivo setup.'))} ` : ''}${escapeHtml(t('As referências de console são equivalências de PC otimizadas e não requisitos oficiais.'))}</p>`;
    window.KynosI18n.translateDom(byId('compare-result'), state.language);
    if (track) {
      const details = { first: first.name, second: second.name, scoreDifference: Math.abs(firstResult.score - secondResult.score), largestFactor: largest.key };
      trackEvent('comparison', `${first.name} vs ${second.name}`, details);
      trackEvent('click', 'Selecionar lados do comparador', details);
    }
  } catch (error) {
    console.error('Não foi possível comparar os setups:', error);
    byId('compare-result').innerHTML = `<p class="preset-empty">${escapeHtml(error.message)}</p>`;
  }
}

function presetUniqueName(name, presets) {
  const base = name.trim();
  let candidate = base;
  let suffix = 2;
  while (presets.some((preset) => preset.name.toLocaleLowerCase() === candidate.toLocaleLowerCase())) {
    candidate = `${base} (${suffix})`;
    suffix += 1;
  }
  return candidate;
}

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
}

function bindDialogClose(dialog) {
  dialog.querySelectorAll('[data-dialog-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function applyPresetAction(event) {
  const cancel = event.target.closest('[data-rename-cancel]');
  if (cancel) {
    cancel.closest('.preset-rename-form').hidden = true;
    return;
  }
  const deleteCancel = event.target.closest('[data-delete-cancel]');
  if (deleteCancel) {
    deleteCancel.closest('.preset-delete-confirm').hidden = true;
    return;
  }
  const button = event.target.closest('[data-preset-action]');
  if (!button) return;
  const action = button.dataset.presetAction;
  try {
    if (action === 'rename') {
      const form = button.closest('.preset-row').querySelector('.preset-rename-form');
      form.hidden = false;
      form.querySelector('input').focus();
      form.querySelector('input').select();
      return;
    }
    if (action === 'delete') {
      button.closest('.preset-row').querySelector('.preset-delete-confirm').hidden = false;
      return;
    }
    const presets = getPresets();
    const preset = presets.find((item) => item.id === button.dataset.presetId);
    if (!preset) throw new Error(t('O preset selecionado não foi encontrado.'));
    if (action === 'load') {
      applySetup(preset.setup);
      byId('preset-status').textContent = t('Configuração carregada.');
    } else if (action === 'update') {
      preset.setup = readSetup();
      savePresets(presets);
      renderPresetList();
      byId('preset-status').textContent = t('Preset atualizado com a configuração atual.');
    } else if (action === 'delete-confirm') {
      savePresets(presets.filter((item) => item.id !== preset.id));
      renderPresetList();
      byId('preset-status').textContent = t('Preset excluído.');
    }
    if (byId('compare-dialog').open) renderCompareOptions();
  } catch (error) {
    console.error('Não foi possível aplicar a ação ao preset:', error);
    byId('preset-status').textContent = error.message;
  }
}

function commitPresetRename(event) {
  const form = event.target.closest('.preset-rename-form');
  if (!form) return;
  event.preventDefault();
  try {
    const newName = form.elements.name.value.trim();
    if (!newName || newName.length > 50) throw new Error(t('O nome deve ter de 1 a 50 caracteres.'));
    const presets = getPresets();
    const preset = presets.find((item) => item.id === form.dataset.presetId);
    if (!preset) throw new Error(t('O preset selecionado não foi encontrado.'));
    preset.name = presetUniqueName(newName, presets.filter((item) => item.id !== preset.id));
    preset.example = false;
    savePresets(presets);
    renderPresetList();
    byId('preset-status').textContent = t('Preset renomeado.');
    if (byId('compare-dialog').open) renderCompareOptions();
  } catch (error) {
    console.error('Não foi possível renomear o preset:', error);
    byId('preset-status').textContent = error.message;
  }
}

async function copyText(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn('A API de área de transferência não está disponível; usando alternativa:', error);
    }
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error(t('Não foi possível copiar. Confira as permissões de área de transferência.'));
}

function buildShareSummary() {
  const setup = readSetup();
  const result = calculate({ setup, render: false, trackSimulation: false });
  const gpu = hardware.gpus.find((item) => item.id === setup.gpuId);
  const cpu = hardware.cpus.find((item) => item.id === setup.cpuId);
  const storage = hardware.storage.find((item) => item.id === setup.storageId);
  const os = hardware.operatingSystems.find((item) => item.id === setup.osId);
  const background = hardware.backgroundUsage.find((item) => item.id === setup.backgroundId);
  const disclaimer = 'Aviso: estimativa baseada em equivalência de consoles; a Rockstar Games ainda não divulgou requisitos oficiais para PC.';
  return [
    `KynosRecompVI · ${t('Meta de desempenho')}: ${t(result.target.name)}`,
    `${t('Processador')}: ${t(cpu.name)}`,
    `${t('Placa de vídeo')}: ${t(gpu.name)}`,
    `${t('Memória RAM')}: ${setup.ramGb} GB ${t(setup.ramGeneration.toUpperCase())} · ${setup.ramMhz.toLocaleString('pt-BR')} MHz · ${t(setup.channel === 'dual' ? 'Canal duplo' : 'Canal único')}`,
    `${t('Armazenamento')}: ${t(storage.name)} · ${setup.freeSpaceGb} GB livres`,
    `${t('Sistema operacional')}: ${t(os.name)} · ${t(background.name)}`,
    `${t('Resultado estimado')}: ${result.score}% ${t('da meta')} · ${t('mínimo / médio / 1% baixo')}: ${result.fpsValues ? result.fpsValues.join(' / ') : t('Indisponível')} FPS`,
    t(disclaimer)
  ].join('\n');
}

function downloadSetupCard() {
  const setup = readSetup();
  const result = calculate({ setup, render: false, trackSimulation: false });
  const gpu = hardware.gpus.find((item) => item.id === setup.gpuId);
  const cpu = hardware.cpus.find((item) => item.id === setup.cpuId);
  const parts = [
    `${t('CPU')}: ${cpu.name}`,
    `${t('GPU')}: ${gpu.name}`,
    `${t('RAM')}: ${setup.ramGb} GB ${setup.ramGeneration.toUpperCase()}`
  ];
  const xml = (value) => escapeHtml(value);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title description">
  <title id="title">${xml(t('Carteirinha de setup KynosRecompVI'))}</title>
  <desc id="description">${xml(t(result.target.name))} · ${result.fpsValues[1]} FPS · ${xml(parts.join(' · '))}</desc>
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#11101d"/><stop offset="1" stop-color="#29152d"/></linearGradient><linearGradient id="neon"><stop stop-color="#ff704e"/><stop offset="1" stop-color="#ffd866"/></linearGradient></defs>
  <rect width="1200" height="630" rx="36" fill="url(#bg)"/><rect x="30" y="30" width="1140" height="570" rx="26" fill="none" stroke="#674b72" stroke-width="2"/>
  <text x="78" y="100" fill="#ffd866" font-family="Arial,sans-serif" font-size="26" font-weight="700" letter-spacing="4">KYNOSRECOMPVI</text>
  <text x="78" y="151" fill="#c6b6cf" font-family="Arial,sans-serif" font-size="22">${xml(t(result.target.name))}</text>
  <text x="72" y="350" fill="url(#neon)" font-family="Arial,sans-serif" font-size="174" font-weight="800">${result.fpsValues[1]}</text>
  <text x="570" y="340" fill="#fff" font-family="Arial,sans-serif" font-size="48" font-weight="700">FPS</text>
  <text x="78" y="430" fill="#e9d9f0" font-family="Arial,sans-serif" font-size="25">${xml(parts[0])}</text>
  <text x="78" y="475" fill="#e9d9f0" font-family="Arial,sans-serif" font-size="25">${xml(parts[1])}</text>
  <text x="78" y="520" fill="#e9d9f0" font-family="Arial,sans-serif" font-size="25">${xml(parts[2])}</text>
  <text x="940" y="540" fill="#aaa0b5" font-family="Arial,sans-serif" font-size="18">${xml(t('Estimativa comunitária · não oficial'))}</text>
</svg>`;
  downloadBlobFile('kynosrecompvi-carteirinha.svg', new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
}

function shareCurrentSetup() {
  const url = new URL(window.location.href);
  url.hash = 'home';
  url.searchParams.set('pc', JSON.stringify(readSetup()));
  return url.toString();
}

function scenarioSetup(scenario, original) {
  const setup = { ...original };
  if (scenario === 'target-900p' || scenario === 'target-720p') {
    const resolution = scenario === 'target-900p' ? '900p' : '720p';
    const targetIndex = hardware.targets.findIndex((target) => target.name.startsWith(resolution));
    if (targetIndex < 0) throw new Error(t('Esta resolução não está disponível neste catálogo.'));
    setup.target = targetIndex;
  } else if (scenario === 'dual') setup.channel = 'dual';
  else if (scenario === 'nvme4') setup.storageId = 'nvme4';
  else if (scenario === 'upgrade-ram16') {
    const capacity = hardware.ramCapacities.slice().sort((left, right) => left - right)
      .find((item) => item >= setup.ramGb + 16);
    if (!capacity) throw new Error(t('A RAM já está no maior valor disponível.'));
    setup.ramGb = capacity;
  } else if (scenario === 'upgrade-nvme') {
    const currentStorage = hardware.storage.find((item) => item.id === setup.storageId);
    const storage = hardware.storage.filter((item) => item.compatible)
      .sort((left, right) => right.score - left.score)
      .find((item) => item.score > currentStorage.score);
    if (!storage) throw new Error(t('Seu SSD já está no melhor nível disponível.'));
    setup.storageId = storage.id;
  } else if (scenario === 'upgrade-gpu-mid') {
    const currentGpu = hardware.gpus.find((item) => item.id === setup.gpuId);
    const gpu = hardware.gpus.filter((item) => !item.integrated && item.score > currentGpu.score)
      .sort((left, right) => left.score - right.score)[0];
    if (!gpu) throw new Error(t('Não há uma GPU acima da selecionada no catálogo.'));
    setup.gpuId = gpu.id;
  } else if (scenario === 'chaos-720p') {
    const targetIndex = hardware.targets.findIndex((target) => target.name.startsWith('720p'));
    if (targetIndex < 0) throw new Error(t('Esta resolução não está disponível neste catálogo.'));
    setup.target = targetIndex;
    setup.backgroundId = 'heavy';
  } else if (scenario === 'nasa') {
    const cpu = hardware.cpus.filter((item) => item.memoryGenerations.includes('ddr5'))
      .sort((left, right) => right.score - left.score)[0];
    const gpu = hardware.gpus.filter((item) => !item.integrated).sort((left, right) => right.score - left.score)[0];
    const targetIndex = hardware.targets.findIndex((target) => target.name.startsWith('Ultra'));
    const storage = hardware.storage.filter((item) => item.compatible).sort((left, right) => right.score - left.score)[0];
    if (!cpu || !gpu || !storage || targetIndex < 0) throw new Error(t('Este preset não está disponível neste catálogo.'));
    setup.cpuId = cpu.id;
    setup.gpuId = gpu.id;
    setup.target = targetIndex;
    setup.ramGb = Math.max(...hardware.ramCapacities);
    setup.ramGeneration = 'ddr5';
    setup.ramMhz = Math.max(...hardware.ramGenerations.ddr5.frequencies.map((item) => item.mhz));
    setup.channel = 'dual';
    setup.storageId = storage.id;
    setup.freeSpaceGb = Math.max(...hardware.freeSpaceOptions);
    setup.osId = 'optimized';
    setup.backgroundId = 'clean';
  } else if (scenario === 'potato' || scenario === 'office-laptop') {
    const integratedGpus = hardware.gpus.filter((item) => item.integrated)
      .sort((left, right) => scenario === 'potato' ? left.score - right.score : right.score - left.score);
    const cpuOptions = hardware.cpus.filter((item) => item.memoryGenerations.includes('ddr4'))
      .sort((left, right) => scenario === 'potato' ? left.score - right.score : right.score - left.score);
    const targetIndex = hardware.targets.findIndex((target) => target.name.startsWith('720p'));
    const storage = hardware.storage.filter((item) => item.compatible).sort((left, right) => left.score - right.score)[0];
    if (!integratedGpus.length || !cpuOptions.length || !storage || targetIndex < 0) throw new Error(t('Este preset não está disponível neste catálogo.'));
    setup.gpuId = integratedGpus[0].id;
    setup.cpuId = cpuOptions[0].id;
    setup.target = targetIndex;
    setup.ramGb = scenario === 'potato' ? Math.min(...hardware.ramCapacities) : Math.min(16, Math.max(...hardware.ramCapacities));
    setup.ramGeneration = 'ddr4';
    setup.ramMhz = Math.min(...hardware.ramGenerations.ddr4.frequencies.map((item) => item.mhz));
    setup.channel = scenario === 'potato' ? 'single' : 'dual';
    setup.storageId = storage.id;
    setup.freeSpaceGb = scenario === 'potato'
      ? Math.min(...hardware.freeSpaceOptions)
      : Math.max(...hardware.freeSpaceOptions.filter((space) => space >= hardware.requiredFreeSpace));
    setup.osId = scenario === 'potato' ? 'windows-11' : 'optimized';
    setup.backgroundId = scenario === 'potato' ? 'heavy' : 'clean';
  } else if (scenario === 'chaos-vram') {
    return setup;
  } else if (scenario === 'optimized') {
    setup.osId = 'optimized';
    setup.backgroundId = 'clean';
  } else if (scenario === 'ram-up' || scenario === 'ram-down') {
    const capacities = hardware.ramCapacities.slice().sort((left, right) => left - right);
    const candidate = scenario === 'ram-up'
      ? capacities.find((capacity) => capacity > setup.ramGb)
      : capacities.slice().reverse().find((capacity) => capacity < setup.ramGb);
    if (!candidate) throw new Error(t(scenario === 'ram-up' ? 'A RAM já está no maior valor disponível.' : 'A RAM já está no menor valor disponível.'));
    setup.ramGb = candidate;
  } else {
    throw new Error(t('Este cenário não é válido.'));
  }
  return setup;
}

function updateScenarioBadge() {
  const badge = byId('scenario-badge');
  const labels = {
    'target-900p': 'E se mudar para 900p?',
    'target-720p': 'E se mudar para 720p?',
    dual: 'E se ativar canal duplo?',
    nvme4: 'E se usar SSD NVMe Gen 4?',
    optimized: 'E se fechar apps e otimizar o SO?',
    'ram-up': 'E se aumentar a RAM?',
    'ram-down': 'E se reduzir a RAM?',
    'upgrade-ram16': 'E se subir um degrau na RAM?',
    'upgrade-nvme': 'E se migrar para SSD NVMe?',
    'upgrade-gpu-mid': 'E se trocar por uma GPU acima?',
    'chaos-720p': 'Modo Caos: 720p, 100 abas e chamada',
    'chaos-vram': 'Modo Caos: dobro da exigência de VRAM',
    nasa: 'Preset extremo: PC da NASA',
    potato: 'Preset extremo: PC batata',
    'office-laptop': 'Notebook guerreiro: iGPU e tudo fechado'
  };
  badge.hidden = !state.activeScenario;
  if (state.activeScenario) byId('scenario-label').textContent = t(labels[state.activeScenario]);
}

function runWhatIf(scenario) {
  const original = state.whatIfOriginalSetup || readSetup();
  const preview = scenarioSetup(scenario, original);
  state.whatIfOriginalSetup = original;
  state.activeScenario = scenario;
  applySetup(preview, { scenarioMode: true });
  updateScenarioBadge();
  trackEvent('what_if', scenario, { scenario, setup: preview });
}

function restoreScenario() {
  if (!state.whatIfOriginalSetup) return;
  const original = state.whatIfOriginalSetup;
  state.whatIfOriginalSetup = null;
  state.activeScenario = '';
  applySetup(original, { scenarioMode: true });
  updateScenarioBadge();
  trackEvent('what_if_restore', 'Restaurar configuração atual');
}

function loadSharedSetup() {
  const serialized = new URLSearchParams(window.location.search).get('pc');
  if (!serialized) return;
  try {
    const setup = JSON.parse(serialized);
    if (!isValidSetup(setup)) throw new Error(t('O link contém uma configuração inválida.'));
    applySetup(setup);
    setToolStatus(t('Configuração do link carregada.'));
  } catch (error) {
    console.error('Não foi possível carregar a configuração compartilhada:', error);
    setToolStatus(error.message);
  }
}

function initAdvancedTools() {
  const presetsDialog = byId('presets-dialog');
  const compareDialog = byId('compare-dialog');
  bindDialogClose(presetsDialog);
  bindDialogClose(compareDialog);
  byId('presets-open').addEventListener('click', () => {
    renderPresetList();
    openDialog(presetsDialog);
  });
  byId('compare-open').addEventListener('click', () => {
    renderCompareOptions();
    openDialog(compareDialog);
    trackEvent('comparison_open', 'Abrir comparador');
  });
  byId('preset-save-form').addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const input = byId('preset-name');
      const name = input.value.trim();
      if (!name || name.length > 50) throw new Error(t('O nome deve ter de 1 a 50 caracteres.'));
      const presets = getPresets();
      if (presets.length >= 50) throw new Error(t('O limite é de 50 presets por navegador.'));
      presets.push({ id: createLocalId(), name: presetUniqueName(name, presets), setup: readSetup() });
      savePresets(presets);
      renderPresetList();
      byId('preset-status').textContent = t('Configuração salva como preset.');
      input.value = '';
      if (compareDialog.open) renderCompareOptions();
    } catch (error) {
      console.error('Não foi possível salvar o preset:', error);
      byId('preset-status').textContent = error.message;
    }
  });
  byId('preset-list').addEventListener('click', applyPresetAction);
  byId('preset-list').addEventListener('submit', commitPresetRename);
  byId('preset-export').addEventListener('click', () => {
    try {
      downloadJsonFile('kynosrecompvi-presets-pc.json', { version: 1, exportedAt: new Date().toISOString(), presets: getPresets() });
      byId('preset-status').textContent = t('Presets exportados em JSON.');
    } catch (error) {
      console.error('Não foi possível exportar os presets:', error);
      byId('preset-status').textContent = error.message;
    }
  });
  byId('preset-import-trigger').addEventListener('click', () => byId('preset-file').click());
  byId('preset-file').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const report = JSON.parse(String(reader.result));
        const imported = validatePresetCollection(report);
        const presets = getPresets();
        if (presets.length + imported.length > 50) throw new Error(t('O limite é de 50 presets por navegador.'));
        imported.forEach((preset) => presets.push({
          id: createLocalId(),
          name: presetUniqueName(preset.name, presets),
          example: false,
          setup: preset.setup
        }));
        savePresets(presets);
        renderPresetList();
        byId('preset-status').textContent = t('Presets importados neste navegador.');
        if (compareDialog.open) renderCompareOptions();
      } catch (error) {
        console.error('Não foi possível importar os presets:', error);
        byId('preset-status').textContent = error instanceof SyntaxError ? t('JSON inválido. Selecione um arquivo de presets válido.') : error.message;
      } finally {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      const error = reader.error || new Error('Falha ao ler o arquivo de presets selecionado.');
      console.error(error);
      byId('preset-status').textContent = t('Não foi possível ler o arquivo selecionado.');
    };
    reader.readAsText(file);
  });
  byId('compare-a').addEventListener('change', () => renderComparison(true));
  byId('compare-b').addEventListener('change', () => renderComparison(true));
  byId('copy-summary').addEventListener('click', async () => {
    try {
      await copyText(buildShareSummary());
      setToolStatus(t('Resumo copiado.'));
      trackEvent('share_summary', 'Copiar resumo');
    } catch (error) {
      console.error('Não foi possível copiar o resumo:', error);
      setToolStatus(error.message);
    }
  });
  byId('copy-setup-link').addEventListener('click', async () => {
    try {
      await copyText(shareCurrentSetup());
      setToolStatus(t('Link da configuração copiado.'));
      trackEvent('share_link', 'Copiar link');
    } catch (error) {
      console.error('Não foi possível copiar o link:', error);
      setToolStatus(error.message);
    }
  });
  byId('download-setup-card').addEventListener('click', () => {
    try {
      downloadSetupCard();
      setToolStatus(t('Carteirinha baixada em SVG.'));
      trackEvent('share_setup_card', 'Baixar carteirinha de setup');
    } catch (error) {
      console.error('Não foi possível gerar a carteirinha de setup:', error);
      setToolStatus(error.message);
    }
  });
  byId('theme-toggle').addEventListener('click', () => updateTheme(state.theme === 'dark' ? 'light' : 'dark'));
  byId('scenario-restore').addEventListener('click', restoreScenario);
  const applyScenarioFromButton = (event) => {
    const button = event.target.closest('[data-scenario]');
    if (!button) return;
    try {
      runWhatIf(button.dataset.scenario);
      setToolStatus(t('Simulação temporária aplicada.'));
      if (button.closest('#quick-upgrade-actions')) {
        setPage('utility');
        byId('result-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const menu = button.closest('details');
      if (menu) menu.open = false;
    } catch (error) {
      console.error('Não foi possível aplicar o cenário:', error);
      setToolStatus(error.message);
    }
  };
  byId('simulator').addEventListener('click', applyScenarioFromButton);
  byId('quick-upgrade-actions').addEventListener('click', applyScenarioFromButton);
  byId('upgrade-economics').addEventListener('click', applyScenarioFromButton);
}

function progressPercent(value) {
  const percent = Number(value);
  return Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
}

function portwatchEffortScore(project) {
  return project ? window.PortWatchScoring.scoreEffort(normalizePortwatchEffort(project)).score : 0;
}

function normalizePortwatchEffort(project) {
  const gta = { ...(project && project.gta && typeof project.gta === 'object' ? project.gta : {}) };
  if (gta.ingame != null) {
    if (gta.world == null) gta.world = gta.ingame;
  }
  return { ...project, gta };
}

function portwatchMilestone(project, milestones) {
  const result = project ? window.PortWatchScoring.scoreEffort(normalizePortwatchEffort(project)) : null;
  const matched = milestones.find((milestone) => milestone.key === (result && result.reached))
    || milestones[0]
    || { key: 'groundwork', label: 'Preparação', percent: 0 };
  return {
    ...matched,
    label: project && project.stage || matched.label,
    percent: progressPercent(matched.percent)
  };
}

function portwatchProjectProgress(project, milestones) {
  if (!project) return 0;
  return progressPercent(portwatchEffortScore(project));
}

function isInactiveProject(project) {
  const status = String(project && project.status || '').toLowerCase();
  return ['nuked', 'down', 'takedown', 'removed', 'offline', 'closed', 'archived'].includes(status)
    || Boolean(project && (project.nuked || project.removed || project.takedown));
}

function getProjectHistoryPoints(snapshot, project) {
  const history = snapshot && Array.isArray(snapshot.history) ? snapshot.history : [];
  return history.reduce((points, entry) => {
    const timestamp = entry && (entry.timestamp || entry.updatedAt || entry.at || entry.date);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(String(timestamp || ''))) return points;
    const nestedProjects = Array.isArray(entry.efforts) ? entry.efforts : Array.isArray(entry.projects) ? entry.projects : [];
    const sample = nestedProjects.find((item) => item.id === project.id || item.projectId === project.id || item.repo === project.repo)
      || (entry.projectId === project.id || entry.id === project.id || entry.repo === project.repo ? entry : null);
    const percent = Number(sample && (sample.percent != null ? sample.percent : sample.progress));
    const time = Date.parse(timestamp);
    if (Number.isFinite(percent) && percent >= 0 && percent <= 100 && Number.isFinite(time)) {
      points.push({ time, timestamp, percent });
    }
    return points;
  }, []).sort((left, right) => left.time - right.time);
}

function recentProgressTrend(snapshot, project) {
  const points = getProjectHistoryPoints(snapshot, project);
  if (points.length < 2) return { points, rate: null, delta: null, latestTime: null };
  const latest = points[points.length - 1];
  const cutoff = latest.time - 30 * 24 * 60 * 60 * 1000;
  const recent = points.filter((point) => point.time >= cutoff);
  const first = recent[0];
  const elapsedDays = first ? (latest.time - first.time) / (24 * 60 * 60 * 1000) : 0;
  const previous = points[points.length - 2];
  const delta = latest.percent - previous.percent;
  const snapshotTime = Date.parse(snapshot.updatedAt || '');
  const stale = Number.isFinite(snapshotTime) && snapshotTime - latest.time > 30 * 24 * 60 * 60 * 1000;
  const rate = first && elapsedDays > 0 && !stale && latest.percent > first.percent
    ? (latest.percent - first.percent) / elapsedDays
    : null;
  return {
    points,
    rate: Number.isFinite(rate) && rate > 0 ? rate : null,
    delta: !stale && Number.isFinite(delta) ? delta : null,
    latestTime: latest.time
  };
}

function getRaceMilestoneProjections(snapshot, leader, milestones, progress) {
  const safeSnapshot = snapshot || {};
  const trend = leader ? recentProgressTrend(safeSnapshot, leader) : { rate: null };
  const futureMilestones = milestones
    .filter((milestone) => progressPercent(milestone.percent) > progress)
    .filter((milestone) => [70, 85, 100].includes(progressPercent(milestone.percent)))
    .sort((left, right) => progressPercent(left.percent) - progressPercent(right.percent));
  const nextMilestone = milestones.find((milestone) => progressPercent(milestone.percent) > progress);
  const snapshotTime = Date.parse(safeSnapshot.updatedAt || '');
  const projectionBaseTime = Math.max(
    Number.isFinite(snapshotTime) ? snapshotTime : 0,
    trend.latestTime || 0
  ) || null;
  const projections = trend.rate && projectionBaseTime
    ? futureMilestones.map((milestone) => {
      const days = Math.ceil((progressPercent(milestone.percent) - progress) / trend.rate);
      return {
        milestone,
        timestamp: projectionBaseTime + days * 24 * 60 * 60 * 1000
      };
    })
    : [];
  return {
    trend,
    nextMilestone,
    distance: nextMilestone ? Math.max(0, progressPercent(nextMilestone.percent) - progress) : 0,
    projections
  };
}

function countdownParts(timestamp) {
  let totalSeconds = Math.max(0, Math.floor((timestamp - Date.now()) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  totalSeconds %= 86400;
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function renderHeroRaceClock(snapshot, leader, milestones, progress) {
  const panel = byId('hero-race-clock');
  if (!panel) return;
  const content = panel.querySelector('.hero-clock-content') || panel;
  if (heroCountdownTimer) {
    clearInterval(heroCountdownTimer);
    heroCountdownTimer = null;
  }
  const history = snapshot && Array.isArray(snapshot.history) ? snapshot.history.slice()
    .filter((entry) => Number.isFinite(Number(entry.leader)) && Number.isFinite(Date.parse(entry.date || '')))
    .sort((left, right) => Date.parse(left.date) - Date.parse(right.date)) : [];
  const baseTimestamp = Date.parse(snapshot && (snapshot.updatedAt || snapshot.updated || snapshot.lastSyncedAt) || '');
  const projectionBase = Number.isFinite(baseTimestamp) ? baseTimestamp : Date.now();
  const nextMilestone = milestones
    .map((milestone) => ({ ...milestone, percent: progressPercent(milestone.percent) }))
    .filter((milestone) => milestone.percent > progress)
    .sort((left, right) => left.percent - right.percent)[0] || null;
  let rate = null;
  if (history.length >= 2) {
    const first = history[0];
    const latest = history[history.length - 1];
    const elapsedDays = (Date.parse(latest.date) - Date.parse(first.date)) / 86400000;
    if (elapsedDays > 0) {
      const calculatedRate = (Number(latest.leader) - Number(first.leader)) / elapsedDays;
      if (Number.isFinite(calculatedRate) && calculatedRate > 0) rate = calculatedRate;
    }
  }
  const updateDates = [
    snapshot && (snapshot.updatedAt || snapshot.updated),
    ...(Array.isArray(snapshot && snapshot.news) ? snapshot.news.map((item) => item.updatedAt || item.date) : []),
    ...(Array.isArray(snapshot && snapshot.changes) ? snapshot.changes.map((item) => item.updatedAt || item.date) : []),
    ...(Array.isArray(snapshot && snapshot.history) ? snapshot.history.map((item) => item.updatedAt || item.date) : [])
  ].map((value) => Date.parse(value || '')).filter((value) => Number.isFinite(value)).sort((left, right) => left - right);
  const updateIntervals = updateDates.slice(1).map((value, index) => value - updateDates[index]).filter((value) => value > 0);
  const averageIntervalMs = updateIntervals.length
    ? updateIntervals.reduce((sum, value) => sum + value, 0) / updateIntervals.length
    : 24 * 60 * 60 * 1000;
  const activeEfforts = snapshot && Array.isArray(snapshot.efforts)
    ? snapshot.efforts.filter((project) => !isInactiveProject(project))
    : [];
  const currentProgress = progressPercent(progress);
  const remainingProgress = Math.max(0, 100 - currentProgress);
  const repositoryFactor = Math.max(0.75, Math.min(1.35, 1 + (activeEfforts.length - 20) * 0.012));
  const progressFactor = Math.max(0.75, 1 - currentProgress / 500);
  const intervalFactor = 1 / Math.max(0.75, Math.min(1.5, averageIntervalMs / (24 * 60 * 60 * 1000)));
  const pcProjectionMs = remainingProgress * 2.2 * repositoryFactor * progressFactor * intervalFactor * 24 * 60 * 60 * 1000;
  const leakReference = Date.parse('2026-11-23T14:36:00Z');
  const pcTargetTimestamp = Number.isFinite(leakReference)
    ? leakReference + pcProjectionMs
    : projectionBase + pcProjectionMs;
  const targetTimestamp = Number.isFinite(pcTargetTimestamp) ? pcTargetTimestamp : null;
  const hasProjection = Number.isFinite(targetTimestamp);
  const remaining = hasProjection ? countdownParts(targetTimestamp) : null;
  const units = [
    { key: 'days', label: 'dias' },
    { key: 'hours', label: 'horas' },
    { key: 'minutes', label: 'minutos' },
    { key: 'seconds', label: 'segundos' }
  ];
  const targetDate = hasProjection ? new Date(targetTimestamp).toISOString() : '';
  const intervalHours = averageIntervalMs / 3600000;
  const periodicityLabel = intervalHours >= 24
    ? `${Math.round(intervalHours / 24 * 10) / 10} ${t('dias')}`
    : `${Math.round(intervalHours * 10) / 10} ${t('horas')}`;
  const status = hasProjection
    ? `${t('Estimativa GTA VI para PC')} · ${progress}% ${t('de progresso')} · ${activeEfforts.length} ${t('projetos ativos')}. ${t('Atualizações em média a cada')} ${periodicityLabel}.`
    : t('Não há dados suficientes para calcular uma estimativa factual de próxima atualização.');
  const title = hasProjection
    ? t('Estimativa até o próximo marco')
    : t('Contagem indisponível');

  panel.dataset.state = hasProjection ? (targetTimestamp > Date.now() ? 'active' : 'elapsed') : 'unavailable';
  content.innerHTML = `<span class="section-kicker">${escapeHtml(t('ESTIMATIVA GTA VI PARA PC'))}</span>
    <h2>${escapeHtml(title)}</h2>
    <p class="hero-clock-target">${hasProjection && nextMilestone ? `${escapeHtml(t('Próximo marco:'))} <b>${escapeHtml(t(nextMilestone.label))}</b>` : escapeHtml(t('Sem projeção disponível'))}</p>
    <div class="hero-clock-units" aria-label="${escapeHtml(t('Contagem regressiva em dias, horas, minutos e segundos'))}" aria-live="off">
      ${units.map((unit) => `<span class="hero-clock-unit"><strong data-clock-unit="${unit.key}">${hasProjection ? counterMarkup(remaining[unit.key]) : '—'}</strong><small>${escapeHtml(t(unit.label))}</small></span>`).join('')}
    </div>
    ${targetDate ? `<time class="hero-clock-date" datetime="${escapeHtml(targetDate)}">${escapeHtml(t('Estimativa:'))} ${escapeHtml(formatNewsDate(targetDate))}</time>` : ''}
    <p class="hero-clock-status" role="status">${escapeHtml(status)}</p>
    <small class="hero-clock-disclaimer">${escapeHtml(t('Contagem estimada com base no progresso atual, quantidade de repositórios, vazamento de 23/11 às 11:36 BRT e periodicidade das atualizações do tracker. Não é uma data oficial confirmada pela Rockstar para PC.'))}</small>`;
  window.KynosI18n.translateDom(content, state.language);
  if (!hasProjection) return;

  animateCounters(content);
  if (targetTimestamp > Date.now()) {
    heroCountdownTimer = setInterval(() => {
      const parts = countdownParts(targetTimestamp);
      units.forEach((unit) => {
        const number = panel.querySelector(`[data-clock-unit="${unit.key}"] .count-up`);
        if (number) number.textContent = formatCounter(parts[unit.key], 'integer');
      });
      if (targetTimestamp <= Date.now()) {
        const statusElement = panel.querySelector('.hero-clock-status');
        if (statusElement) statusElement.textContent = t('A estimativa passou, mas o tracker ainda não confirmou o próximo marco.');
        panel.dataset.state = 'elapsed';
        clearInterval(heroCountdownTimer);
        heroCountdownTimer = null;
      }
    }, 1000);
  }
}

function renderRaceProjection(snapshot, leader, milestones, progress) {
  const estimate = getRaceMilestoneProjections(snapshot, leader, milestones, progress);
  const dates = estimate.trend.rate
    ? estimate.projections.map((projection) => {
      const projectedAt = new Date(projection.timestamp).toISOString();
      const distance = Math.max(0, progressPercent(projection.milestone.percent) - progress);
      return `<li><span>${escapeHtml(t(projection.milestone.label))} · ${counterMarkup(distance, 'percent')} p.p.</span><strong>${escapeHtml(formatNewsDate(projectedAt))}</strong></li>`;
    }).join('')
    : `<li class="projection-unavailable">${escapeHtml(t('Prazo não calculável: faltam duas amostras datadas de progresso do mesmo projeto.'))}</li>`;
  const pace = estimate.trend.rate
    ? `${escapeHtml(t('Ritmo observado:'))} ${counterMarkup(estimate.trend.rate, 'percent')} ${escapeHtml(t('p.p. por dia'))}`
    : escapeHtml(t('Ritmo recente indisponível no snapshot atual.'));
  return `<section class="race-intel-card panel pc-projection" aria-labelledby="pc-projection-title">
    <span class="section-kicker">${escapeHtml(t('PROJEÇÃO ESTIMADA PARA PC'))}</span>
    <h3 id="pc-projection-title">${escapeHtml(t('Contagem estimada da corrida'))}</h3>
    <p class="projection-leader">${leader ? `${escapeHtml(t('Líder atual:'))} <b>${escapeHtml(leader.name)}</b> · ${counterMarkup(progress, 'percent')}%` : escapeHtml(t('Ainda não há projeto ativo no snapshot.'))}</p>
    <p>${estimate.nextMilestone ? `${escapeHtml(t('Próximo degrau:'))} <b>${escapeHtml(t(estimate.nextMilestone.label))}</b> · ${counterMarkup(estimate.distance, 'percent')} ${escapeHtml(t('pontos percentuais'))} ${escapeHtml(t('restantes'))}` : escapeHtml(t('Todos os marcos da trilha foram alcançados.'))}</p>
    <p class="projection-pace">${pace}</p>
    <ul class="projection-targets">${dates}</ul>
    <p class="projection-warning"><b>${escapeHtml(t('Estimativa especulativa, não uma data oficial.'))}</b> ${escapeHtml(t('Não representa promessa da Rockstar/Take-Two nem data de lançamento para PC; bugs, bloqueios técnicos, limites de hardware e derrubadas podem mudar tudo.'))}</p>
    <p class="projection-method">${escapeHtml(t('A projeção de prazo só aparece com histórico temporal verificável; sem ele, mostramos a distância até os marcos, não uma data inventada.'))}</p>
  </section>`;
}


function renderRaceTimeline(milestones, progress, leader) {
  const currentMilestone = milestones.filter((milestone) => progressPercent(milestone.percent) <= progress)
    .sort((left, right) => progressPercent(right.percent) - progressPercent(left.percent))[0];
  const nextMilestone = milestones.find((milestone) => progressPercent(milestone.percent) > progress);
  const steps = milestones.map((milestone) => {
    const percent = progressPercent(milestone.percent);
    const reached = percent <= progress;
    const current = currentMilestone && percent === progressPercent(currentMilestone.percent);
    return `<li class="race-xray-step ${reached ? 'is-reached' : ''} ${current ? 'is-current' : ''}">
      <span class="race-xray-percent">${counterMarkup(percent, 'percent')}%</span>
      <strong>${escapeHtml(t(milestone.label))}</strong>
      <small>${escapeHtml(t(milestone.description || ''))}</small>
      ${current ? `<em>${escapeHtml(t('Onde está o líder'))}</em>` : ''}
    </li>`;
  }).join('');
  return `<section class="race-intel-card panel race-xray" aria-labelledby="race-xray-title">
    <span class="section-kicker">${escapeHtml(t('RAIO-X DOS MARCOS'))}</span>
    <h3 id="race-xray-title">${escapeHtml(t('Da preparação à estabilidade'))}</h3>
    <p>${leader ? `${escapeHtml(leader.name)} · ${counterMarkup(progress, 'percent')}% · ${escapeHtml(t('Marco atual:'))} ${escapeHtml(t(currentMilestone && currentMilestone.label || 'Preparação'))}` : escapeHtml(t('Sem líder ativo no momento.'))}</p>
    <ol class="race-xray-list">${steps}</ol>
    <p class="race-xray-next">${nextMilestone ? `${escapeHtml(t('Falta para o próximo degrau:'))} ${counterMarkup(Math.max(0, progressPercent(nextMilestone.percent) - progress), 'percent')} ${escapeHtml(t('pontos percentuais'))} · ${escapeHtml(t(nextMilestone.label))}` : escapeHtml(t('O líder já alcançou a estabilidade.'))}</p>
  </section>`;
}

function renderRaceReversals(snapshot, efforts, leader) {
  const offline = efforts.filter(isInactiveProject);
  const jumps = efforts.map((project) => ({ project, trend: recentProgressTrend(snapshot, project) }))
    .filter((item) => item.trend.delta > 0)
    .sort((left, right) => right.trend.delta - left.trend.delta);
  const biggestJump = jumps[0];
  const leadSummary = leader
    ? `${escapeHtml(leader.name)} · ${counterMarkup(leader.percent, 'percent')}%`
    : escapeHtml(t('Sem líder ativo'));
  const jumpSummary = biggestJump
    ? `${escapeHtml(biggestJump.project.name)} · +${counterMarkup(biggestJump.trend.delta, 'percent')} p.p.`
    : escapeHtml(t('Sem série histórica para calcular o maior salto percentual.'));
  const fallSummary = offline.length
    ? offline.map((project) => escapeHtml(project.name)).join(' · ')
    : escapeHtml(t('Nenhum projeto fora do ar foi registrado.'));
  return `<section class="race-intel-card panel race-reversals" aria-labelledby="race-reversals-title">
    <span class="section-kicker">${escapeHtml(t('PLACAR DE REVIRAVOLTAS'))}</span>
    <h3 id="race-reversals-title">${escapeHtml(t('Quem lidera, quem caiu'))}</h3>
    <dl><div><dt>${escapeHtml(t('Liderança atual'))}</dt><dd>${leadSummary}</dd></div>
    <div><dt>${escapeHtml(t('Maior salto recente'))}</dt><dd>${jumpSummary}</dd></div>
    <div><dt>${escapeHtml(t('Fora do ar / derrubados'))}</dt><dd>${fallSummary}</dd></div></dl>
    <small>${escapeHtml(t('Ultrapassagens e saltos só são calculados quando há snapshots históricos comparáveis.'))}</small>
  </section>`;
}

function renderRaceControlLog(snapshot, leader, efforts) {
  const events = [];
  if (leader) {
    const trend = recentProgressTrend(snapshot, leader);
    events.push({
      kind: 'leader',
      date: snapshot.updatedAt || '',
      title: t('Leitura do placar'),
      project: leader,
      delta: trend.delta
    });
  }
  (Array.isArray(snapshot.changes) ? snapshot.changes : []).slice(0, 5).forEach((change) => {
    events.push({ date: change.date, title: t(change.kind || 'Atualização'), body: localizedChangeSummary(change.summary) });
  });
  (Array.isArray(snapshot.news) ? snapshot.news : []).slice(0, 2).forEach((story) => {
    events.push({ date: story.date, title: t(story.category || 'Notícia'), body: localizedValue(story, 'title') || story.title });
  });
  events.sort((left, right) => (Date.parse(right.date) || 0) - (Date.parse(left.date) || 0));
  const entries = events.slice(0, 7).map((event) => `<article class="race-log-entry">
    ${publicationTimeMarkup(event.date)}
    <div><b>${escapeHtml(event.title)}</b><p>${event.kind === 'leader'
    ? `${escapeHtml(event.project.name)} · ${counterMarkup(event.project.percent, 'percent')}% · ${escapeHtml(t(event.project.stage))}${event.delta != null ? ` · ${escapeHtml(t('variação'))} ${event.delta > 0 ? '+' : ''}${counterMarkup(Math.abs(event.delta), 'percent')} p.p.` : ` · ${escapeHtml(t('variação percentual não disponível'))}`}`
    : escapeHtml(event.body)}</p></div>
  </article>`).join('');
  const inactive = efforts.filter(isInactiveProject);
  return `<section class="race-intel-card panel race-control-log" aria-labelledby="race-control-title">
    <span class="section-kicker">${escapeHtml(t('BASTIDORES & COMMITS'))}</span>
    <h3 id="race-control-title">${escapeHtml(t('Central de controle da corrida'))}</h3>
    <p class="race-log-note">${escapeHtml(t('A liderança abaixo é a leitura atual do snapshot; sem histórico, não afirmamos quem ultrapassou quem.'))}</p>
    <div class="race-log-list">${entries || `<p>${escapeHtml(t('Nenhuma atualização registrada.'))}</p>`}</div>
    ${inactive.length ? `<p class="race-log-offline">${escapeHtml(t('Fora do ar:'))} ${inactive.map((project) => escapeHtml(project.name)).join(' · ')}</p>` : ''}
  </section>`;
}

function renderPortwatchProgress(data, snapshot = trackerData) {
  const section = byId('portwatch-progress');
  const milestones = Array.isArray(data.milestones) && data.milestones.length
    ? data.milestones
    : PORTWATCH_FALLBACK.milestones;
  const legacyProjects = Array.isArray(data.projects) ? data.projects : [];
  const legacyById = new Map(legacyProjects.map((project) => [project.id, project]));
  const sourceProjects = snapshot && Array.isArray(snapshot.efforts) && snapshot.efforts.length
    ? snapshot.efforts
    : legacyProjects;
  const projects = sourceProjects.map((project) => {
    const legacy = legacyById.get(project.id) || {};
    const snapshotTeam = snapshot && snapshot.teams && snapshot.teams.xlaunchvi;
    const owner = String(project.repo || legacy.repo || '').split('/')[0];
    const avatarUrl = legacy.avatarUrl || (/^[\w-]+$/.test(owner) ? `https://github.com/${encodeURIComponent(owner)}.png?size=88` : '');
    return {
      ...legacy,
      ...project,
      teamReport: project.teamReport || (project.id === 'xlaunchvi' && snapshotTeam ? snapshotTeam.latestReport : null),
      author: project.author || legacy.author || owner,
      avatar: project.avatar || legacy.avatar || String(project.name || '').slice(0, 2).toUpperCase(),
      avatarUrl,
      status: isInactiveProject(project) || isInactiveProject(legacy) ? 'offline' : project.status || legacy.status || ''
    };
  }).filter((project) => project.name);
  const scoreSourceProjects = snapshot && snapshot.portwatchSource
    && Array.isArray(snapshot.portwatchSource.efforts)
    ? snapshot.portwatchSource.efforts
    : projects;
  const scoreById = new Map(scoreSourceProjects
    .filter((project) => project && project.id)
    .map((project) => [project.id, window.PortWatchScoring.scoreEffort(normalizePortwatchEffort(project)).score]));
  const scoreForProject = (project) => {
    if (project.id === 'xlaunchvi' && project.manualScore != null && Number.isFinite(Number(project.manualScore))) {
      return progressPercent(project.manualScore);
    }
    return scoreById.has(project.id)
      ? progressPercent(scoreById.get(project.id))
      : portwatchProjectProgress(project, milestones);
  };
  const rankedScores = window.PortWatchScoring.overall(
    scoreSourceProjects.filter((project) => !isInactiveProject(project)).map(normalizePortwatchEffort)
  );
  const rankedProjects = rankedScores.ranked
    .map((item) => projects.find((project) => project.id === item.effort.id))
    .filter(Boolean);
  const leaderProject = rankedProjects[0];
  const leaderMilestone = leaderProject ? portwatchMilestone(leaderProject, milestones) : null;
  const progress = rankedScores.score;
  const leader = leaderProject ? { ...leaderProject, milestone: leaderMilestone.label } : null;
  renderHeroRaceClock(snapshot, leader, milestones, progress);
  const topThreeAverage = rankedScores.top3;
  const latestMilestone = milestones.find((milestone) => milestone.key === rankedScores.furthest.key);
  const latestMilestoneLabel = latestMilestone ? latestMilestone.label : 'Preparação';
  const launchThreshold = window.PortWatchScoring.MILESTONES.find((milestone) => milestone.key === 'loads').at;
  const launchingCount = rankedScores.ranked.filter((project) => project.score >= launchThreshold).length;
  const stats = [
    { label: 'Marco mais avançado', value: leader ? leader.milestone : latestMilestoneLabel },
    { label: 'Média do top 3', markup: `<span class="pw-stat-value">${counterMarkup(topThreeAverage, 'percent')}%</span>` },
    { label: 'Iniciam o GTA VI', markup: `<span class="pw-stat-value">${counterMarkup(launchingCount)} / ${counterMarkup(rankedScores.ranked.length)}</span>` },
    { label: 'Projetos acompanhados', markup: `<span class="pw-stat-value">${counterMarkup(rankedScores.ranked.length)}</span>` }
  ];
  const timelineProjects = rankedProjects.slice(0, 10).filter((project) => scoreForProject(project) >= 0);
  const xlaunchReportProject = projects.find((project) => project.id === 'xlaunchvi' && project.teamReport);
  if (xlaunchReportProject && !timelineProjects.some((project) => project.id === xlaunchReportProject.id)) {
    timelineProjects.push(xlaunchReportProject);
  }
  const markerCards = timelineProjects.map((project) => {
    const projectProgress = scoreForProject(project);
    const avatar = String(project.avatar || project.name.slice(0, 2)).slice(0, 3);
    const stage = portwatchMilestone(project, milestones).label;
    const progressLabel = formatPercent(projectProgress);
    const reportStage = project.teamReport && localizedValue(project.teamReport, 'stage');
    const snapshotPercent = Number.isFinite(Number(project.portwatchPercent))
      ? formatPercent(project.portwatchPercent)
      : progressLabel;
    const estimateLabel = project.progressBasis === 'team-report-estimate'
      ? ` · ${t('estimativa editorial da equipe')}; ${t('snapshot GitHub/tracker')}: ${snapshotPercent}%`
      : reportStage ? ` · ${t('Relato do Discord')}: ${reportStage}; ${t('snapshot GitHub/tracker')}: ${snapshotPercent}%` : '';
    const tooltip = `${project.name}: ${progressLabel}% · ${stage}${estimateLabel}`;
    const repositoryUrl = project.repo ? `https://github.com/${encodeURIComponent(String(project.repo).split('/')[0])}/${encodeURIComponent(String(project.repo).split('/')[1] || '')}` : '';
    const publicUrl = project.id !== 'cgbj' && safeUrl(repositoryUrl) !== '#' ? repositoryUrl : '';
    const isLeader = Boolean(leaderProject && project.id === leaderProject.id);
    const isPrivate = project.private === true || project.id === 'cgbj' || !publicUrl;
    const status = String(project.status || '').toLowerCase();
    const isBlocked = isInactiveProject(project) || project.blocked === true
      || ['blocked', 'private', 'privado', 'bloqueado'].includes(status);
    const markerClasses = [
      'pw-project-marker',
      project.teamReport ? 'pw-project-marker--xlaunch' : '',
      projectProgress <= progress ? 'is-reached' : '',
      isLeader ? 'is-leader' : '',
      isPrivate ? 'is-private' : '',
      isBlocked ? 'is-blocked' : '',
      isLeader ? 'is-tooltip-open' : ''
    ].filter(Boolean).join(' ');
    const lockMarkup = isLeader || isPrivate || isBlocked
      ? '<span class="pw-avatar-lock" aria-hidden="true">🔒</span>'
      : '';
    const avatarMarkup = project.avatarUrl
      ? `<span class="pw-avatar" aria-hidden="true"><img class="pw-avatar-image" width="34" height="34" src="${escapeHtml(safeUrl(project.avatarUrl))}" alt="" loading="lazy" decoding="async" /><span class="pw-avatar-fallback" hidden>${escapeHtml(avatar)}</span>${lockMarkup}</span>`
      : `<span class="pw-avatar" aria-hidden="true">${escapeHtml(avatar)}${lockMarkup}</span>`;
    const markerLabel = publicUrl
      ? `Abrir repositório público de ${project.name}`
      : project.id === 'cgbj' ? 'CGBJ · repositório privado' : `Sem repositório público: ${project.name}`;
    return `<button class="${markerClasses}" type="button" style="--marker-x:${projectProgress}%" data-marker-progress="${projectProgress}" data-tooltip="${escapeHtml(tooltip)}" title="${escapeHtml(tooltip)}" aria-label="${escapeHtml(publicUrl ? `${markerLabel}: ${tooltip}` : `${markerLabel}. ${tooltip}`)}" ${publicUrl ? `data-repository-url="${escapeHtml(publicUrl)}"` : 'data-private-repository="true"'}>
      ${avatarMarkup}
    </button>`;
  }).join('');
  const projectList = projects.slice()
    .sort((left, right) => Number(isInactiveProject(left)) - Number(isInactiveProject(right))
      || scoreForProject(right) - scoreForProject(left))
    .map((project) => {
      const projectProgress = scoreForProject(project);
      const stage = portwatchMilestone(project, milestones).label;
      const avatar = String(project.avatar || project.name.slice(0, 2)).slice(0, 3);
      const inactive = isInactiveProject(project);
      let stageText = inactive
        ? `${t('Fora do ranking ativo')} · ${t('Último marco')}: ${t(stage)}`
        : t(stage);
      if (project.teamReport) {
        const snapshotPercent = Number.isFinite(Number(project.portwatchPercent))
          ? formatPercent(project.portwatchPercent)
          : formatPercent(projectProgress);
        stageText += ` · ${t('Discord relata')}: ${localizedValue(project.teamReport, 'stage')}; ${t('snapshot GitHub/tracker')}: ${snapshotPercent}%`;
      }
      const avatarMarkup = project.avatarUrl
        ? `<img class="pw-avatar-image" width="28" height="28" src="${escapeHtml(safeUrl(project.avatarUrl))}" alt="" loading="lazy" decoding="async" /><span class="pw-avatar-fallback" hidden>${escapeHtml(avatar)}</span>`
        : escapeHtml(avatar);
      const repositoryUrl = project.repo ? `https://github.com/${String(project.repo).replace(/^https?:\/\/github\.com\//, '').replace(/\/+$/, '')}` : '';
      const isPublic = project.id !== 'cgbj' && Boolean(repositoryUrl) && !project.private;
      const itemTag = isPublic ? 'a' : 'article';
      const itemAttributes = isPublic
        ? `href="${escapeHtml(repositoryUrl)}" target="_blank" rel="noopener noreferrer"`
        : `aria-label="${project.id === 'cgbj' ? 'CGBJ: repositório privado' : 'Projeto sem repositório público'}"`;
      return `<${itemTag} class="pw-project-progress-item ${projectProgress ? 'is-progressing' : ''} ${inactive ? 'is-inactive' : ''}" ${itemAttributes}>
        <span class="pw-project-list-avatar" aria-hidden="true">${avatarMarkup}</span>
        <span class="pw-project-progress-copy"><b>${escapeHtml(project.name)}</b><small>${escapeHtml(stageText)}</small></span>
        <strong>${counterMarkup(projectProgress, 'percent')}%</strong>
      </${itemTag}>`;
    }).join('');
  const milestoneButtons = milestones.map((milestone) => {
    const milestoneProgress = progressPercent(milestone.percent);
    const isReached = milestoneProgress <= progress;
    const isCurrent = latestMilestone && milestoneProgress === progressPercent(latestMilestone.percent);
    const label = String(milestone.label || '');
    const tooltip = `${label}: ${milestone.description || ''}`;
    return `<button class="pw-milestone ${isReached ? 'reached' : ''} ${isCurrent ? 'current' : ''}" type="button" style="--milestone-x:${milestoneProgress}%" data-tooltip="${escapeHtml(tooltip)}" title="${escapeHtml(tooltip)}" aria-label="${escapeHtml(`${milestoneProgress}% ${label}. ${milestone.description || ''}`)}" ${isCurrent ? 'aria-current="step"' : ''}>
      <b>${counterMarkup(milestoneProgress, 'percent')}%</b><span>${escapeHtml(t(label))}</span>
    </button>`;
  }).join('');

  const changes = snapshot && Array.isArray(snapshot.changes) ? snapshot.changes.slice(0, 4) : [];
  const changeStrip = changes.length ? `
    <section class="pw-changes" aria-labelledby="pw-changes-title">
      <div class="pw-changes-heading"><span class="section-kicker">${escapeHtml(t('O que mudou'))}</span><h3 id="pw-changes-title">${escapeHtml(t('Atualizações recentes do tracker'))}</h3></div>
      <div class="pw-change-track">${changes.map((change) => `
        <article class="pw-change-item">
          <div><span class="pw-change-kind">${escapeHtml(t(change.kind))}</span>${publicationTimeMarkup(change.date)}</div>
          <p>${escapeHtml(localizedChangeSummary(change.summary))}</p>
        </article>`).join('')}
      </div>
    </section>` : '';
  const readingTime = snapshot && snapshot.updatedAt
    ? `<p class="pw-reading-time">${escapeHtml(t('Leitura do progresso:'))} ${publicationTimeMarkup(snapshot.updatedAt)}</p>`
    : '';
  const projectProgressDetails = `
    <details class="pw-project-list pw-project-list--outside">
      <summary><span>${escapeHtml(t('Progresso por projeto'))}</span><span class="pw-project-list-action">${escapeHtml(t('Ver progresso de todos os projetos'))} (${projects.length})</span></summary>
      <ul class="pw-project-progress-grid">${projectList}</ul>
    </details>`;

  section.setAttribute('aria-busy', 'false');
  section.innerHTML = `
    <div class="pw-panel panel" id="overall">
      <div class="pw-overview">
        <div class="pw-overview-main">
          <span class="section-kicker">PROGRESSO GERAL · PROJETO MAIS PERTO DE SER JOGÁVEL</span>
          <h2 id="portwatch-title">Acompanhamento da <span>portabilidade.</span></h2>
          ${readingTime}
          <div class="pw-headline">
            <strong class="pw-overall-value">${counterMarkup(progress, 'percent')}<span>%</span></strong>
            <p><b>${escapeHtml(t('Líder:'))}</b> ${leader ? `${escapeHtml(leader.name)}${leader.author ? ` <span>${escapeHtml(t('de'))}</span> ${escapeHtml(leader.author)}` : ''}<span>.</span> <span>${escapeHtml(t('Chegou a'))}</span> “${escapeHtml(t(leader.milestone || latestMilestoneLabel))}”<span>.</span>` : escapeHtml(t('Ainda sem projetos'))}</p>
          </div>
        </div>
        <div class="pw-stats">${stats.map((stat) => `<article class="pw-stat"><span>${escapeHtml(t(stat.label))}</span><strong>${stat.markup || escapeHtml(t(stat.value))}</strong></article>`).join('')}</div>
      </div>
      <div class="pw-divider"></div>
      <div class="pw-timeline-heading"><div><span class="section-kicker">${escapeHtml(t('TRILHA DE MARCOS'))}</span><h3>${escapeHtml(t('Do primeiro executável à estabilidade.'))}</h3></div></div>
      <div class="pw-timeline-viewport" tabindex="0" aria-label="Trilha de progresso; deslize horizontalmente para ver todos os marcos">
        <div class="pw-timeline">
          <svg class="pw-connectors" aria-hidden="true"></svg>
          ${markerCards}
          <div class="pw-progress-track" role="progressbar" aria-label="${escapeHtml(t('Progresso geral da portabilidade'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
            <span class="pw-progress-fill" style="width:${progress}%"></span>
          </div>
          <div class="pw-milestones">${milestoneButtons}</div>
        </div>
      </div>
      <p class="pw-scroll-hint">${escapeHtml(t('Deslize a trilha para conferir todos os marcos.'))}</p>
    </div>${projectProgressDetails}${changeStrip}`;
  section.querySelectorAll('.pw-avatar-image').forEach((image) => {
    image.addEventListener('error', () => {
      image.hidden = true;
      const fallback = image.nextElementSibling;
      if (fallback) fallback.hidden = false;
    }, { once: true });
    if (image.complete && !image.naturalWidth) {
      image.hidden = true;
      if (image.nextElementSibling) image.nextElementSibling.hidden = false;
    }
  });
  window.KynosI18n.translateDom(section, state.language);
  animateCounters(section);
  requestAnimationFrame(() => {
    recalculateProgressConnectors(section);
  });
  if (typeof ResizeObserver !== 'undefined') {
    if (section._pwConnectorObserver) section._pwConnectorObserver.disconnect();
    const observer = new ResizeObserver(() => recalculateProgressConnectors(section));
    observer.observe(section);
    section._pwConnectorObserver = observer;
  }
}

function localizedChangeSummary(summary) {
  const scoutMatch = String(summary || '').match(/^O scout encontrou um possível esforço em (.+)\.$/);
  if (!scoutMatch) return t(summary || '');
  const repository = scoutMatch[1];
  const translations = {
    en: `Scout found a possible project at ${repository}.`,
    es: `Scout encontró un posible proyecto en ${repository}.`,
    zh: `Scout 在 ${repository} 发现了一个可能的项目。`
  };
  return translations[state.language] || String(summary);
}

function loadNotificationPreferences() {
  try {
    const raw = localStorage.getItem(NOTIFICATION_KEY);
    if (!raw) return { readIds: [], lastViewedAt: '' };
    const stored = JSON.parse(raw);
    if (stored.version !== 1 || !Array.isArray(stored.readIds)
      || stored.readIds.some((id) => typeof id !== 'string')
      || (stored.lastViewedAt && typeof stored.lastViewedAt !== 'string')) {
      throw new Error('As preferências da central de avisos estão inválidas.');
    }
    return {
      readIds: [...new Set(stored.readIds)],
      lastViewedAt: stored.lastViewedAt || ''
    };
  } catch (error) {
    console.error('Não foi possível ler as preferências da central de avisos:', error);
    return { readIds: [], lastViewedAt: '' };
  }
}

function saveNotificationPreferences() {
  try {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify({
      version: 1,
      readIds: notificationPreferences.readIds,
      lastViewedAt: notificationPreferences.lastViewedAt
    }));
  } catch (error) {
    console.error('Não foi possível salvar as preferências da central de avisos:', error);
  }
}

function buildPortalNotifications(snapshot) {
  const notifications = [];
  const editorial = withManagedEditorial(snapshot);
  const efforts = snapshot && Array.isArray(snapshot.efforts) ? snapshot.efforts : [];
  const offlineProjects = efforts.filter(isInactiveProject).slice(0, 2);
  const topProjects = topPublicTrackerProjects(snapshot, 5);
  const snapshotDate = snapshot && (snapshot.updated || snapshot.lastSyncedAt || snapshot.updatedAt) || '';

  if (snapshot && snapshot.exe && snapshot.exe.safety) {
    notifications.push({
      id: 'security:fake-download-warning:v1',
      title: t('Alerta de segurança'),
      body: t('Não baixe nem execute arquivos divulgados por desconhecidos; podem conter malware ou roubar senhas.'),
      page: 'tracker',
      kind: 'warning',
      date: snapshotDate
    });
  }

  const leader = topProjects[0];
  if (leader) {
    const milestone = portwatchMilestone(leader, PORTWATCH_FALLBACK.milestones);
    notifications.push({
      id: `leader:${leader.repo || leader.id || leader.name}:${leader.percent}:${milestone.label}`,
      title: t('Liderança da corrida'),
      body: `${leader.name} · ${formatPercent(leader.percent)}% · ${t(milestone.label)}`,
      page: 'home',
      kind: 'progress',
      date: snapshotDate
    });
  }

  (editorial && Array.isArray(editorial.news) ? editorial.news : []).slice(0, 8).forEach((story) => {
    const newsId = String(story.id || story.title || story.date || '');
    const storyText = normalizeHardwareSearch([
      story.title, story.summary, story.dek, ...(Array.isArray(story.body) ? story.body : [])
    ].join(' '));
    const relatedProject = topProjects.find((project) => [
      project.name,
      String(project.repo || '').split('/').pop(),
      project.repo
    ].some((alias) => {
      const normalizedAlias = normalizeHardwareSearch(alias || '');
      return normalizedAlias.length >= 4 && storyText.includes(normalizedAlias);
    }));
    notifications.push({
      id: `news:${newsId}`,
      title: relatedProject
        ? `${t('Destaque da corrida')} #${relatedProject.rank} · ${t('Notícia recente')}`
        : t('Notícia recente'),
      body: `${relatedProject ? `${relatedProject.name}: ` : ''}${t(story.title || story.category || '')}`,
      page: 'news',
      kind: relatedProject ? 'progress' : 'news',
      date: story.date || '',
      newsId
    });
  });
  offlineProjects.forEach((project) => {
    notifications.push({
      id: `offline:${project.repo || project.id || project.name}`,
      title: `${t('Projeto fora do ar')}: ${project.name}`,
      body: t('O tracker registra este projeto como fora do ar; o motivo da remoção pode não estar confirmado.'),
      page: 'home',
      kind: 'warning',
      date: snapshotDate
    });
  });
  (snapshot && Array.isArray(snapshot.changes) ? snapshot.changes : []).slice(0, 2).forEach((change, index) => {
    notifications.push({
      id: `change:${change.date || ''}:${change.kind || ''}:${index}:${change.summary || ''}`,
      title: t('Novidade no tracker'),
      body: localizedChangeSummary(change.summary),
      page: 'home',
      kind: 'update',
      date: change.date || ''
    });
  });
  return notifications;
}

function renderNotificationCenter(snapshot) {
  const center = byId('notification-center');
  if (!center || !notificationPreferences) return;
  notificationItems = buildPortalNotifications(snapshot);
  const unreadCount = notificationItems.filter((item) => !notificationPreferences.readIds.includes(item.id)).length;
  const count = byId('notification-count');
  count.hidden = unreadCount === 0;
  count.innerHTML = unreadCount ? counterMarkup(unreadCount) : '';
  byId('notification-toggle').setAttribute('aria-label', `${t('Abrir notificações')} · ${unreadCount} ${t('não lidas')}`);
  byId('notification-mark-all').disabled = unreadCount === 0;
  byId('notification-list').innerHTML = notificationItems.length
    ? notificationItems.map((item) => {
      const unread = !notificationPreferences.readIds.includes(item.id);
      return `<article class="notification-item ${unread ? 'is-unread' : ''} notification-${escapeHtml(item.kind)}">
        <span class="notification-dot" aria-hidden="true"></span>
        <div class="notification-copy"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p>${item.date ? publicationTimeMarkup(item.date) : ''}</div>
        <a class="notification-link" href="#${escapeHtml(item.page)}" data-notification-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(t('Abrir conteúdo relacionado'))}">↗</a>
      </article>`;
    }).join('')
    : `<p class="notification-empty">${escapeHtml(t('Sem avisos novos por enquanto.'))}</p>`;
  animateCounters(center);
}

function closeNotificationPanel(restoreFocus = false) {
  const panel = byId('notification-panel');
  if (!panel) return;
  panel.hidden = true;
  byId('notification-toggle').setAttribute('aria-expanded', 'false');
  if (restoreFocus) byId('notification-toggle').focus();
}

function setupNotificationCenter(snapshot) {
  const center = byId('notification-center');
  const toggle = byId('notification-toggle');
  const panel = byId('notification-panel');
  notificationSnapshot = snapshot;
  if (!notificationPreferences) notificationPreferences = loadNotificationPreferences();

  if (!notificationHandlersBound) {
    notificationHandlersBound = true;
    toggle.addEventListener('click', () => {
      if (panel.hidden) {
        notificationPreferences.lastViewedAt = new Date().toISOString();
        saveNotificationPreferences();
        renderNotificationCenter(notificationSnapshot);
        panel.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        closeNotificationPanel();
      }
    });
    byId('notification-close').addEventListener('click', () => closeNotificationPanel(true));
    byId('notification-mark-all').addEventListener('click', () => {
      notificationPreferences.readIds = notificationItems.map((item) => item.id);
      saveNotificationPreferences();
      renderNotificationCenter(notificationSnapshot);
    });
    panel.addEventListener('click', (event) => {
      const link = event.target.closest('[data-notification-id]');
      if (!link) return;
      event.preventDefault();
      const id = link.dataset.notificationId;
      const item = notificationItems.find((notification) => notification.id === id);
      if (!notificationPreferences.readIds.includes(id)) {
        notificationPreferences.readIds.push(id);
        saveNotificationPreferences();
      }
      renderNotificationCenter(notificationSnapshot);
      closeNotificationPanel();
      if (!item) return;
      setPage(item.page);
      if (item.kind === 'news') {
        requestAnimationFrame(() => {
          const story = [...document.querySelectorAll('#news [data-news-story-id]')]
            .find((element) => element.dataset.newsStoryId === item.newsId);
          if (!story) return;
          const fullStory = story.querySelector('details');
          if (fullStory) fullStory.open = true;
          story.scrollIntoView({ behavior: 'smooth', block: 'center' });
          story.focus({ preventScroll: true });
        });
      }
    });
    document.addEventListener('click', (event) => {
      if (!center.contains(event.target)) closeNotificationPanel();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) closeNotificationPanel(true);
    });
  }
  renderNotificationCenter(snapshot);
}

function updateQuickReadiness() {
  if (!hardware) return;
  const freeSpaceInput = byId('quick-free-space');
  const ramInput = byId('quick-ram');
  const output = byId('quick-check-status');
  if (!freeSpaceInput || !ramInput || !output) return;
  const freeSpace = Number(freeSpaceInput.value);
  const ram = Number(ramInput.value);
  if (!freeSpaceInput.value.trim() || !ramInput.value.trim()
    || !Number.isFinite(freeSpace) || freeSpace < 0
    || !Number.isFinite(ram) || ram < 0) {
    output.className = 'quick-check-status is-warning';
    output.innerHTML = `<strong>${escapeHtml(t('Informe valores numéricos válidos, iguais ou maiores que zero.'))}</strong>`;
    return;
  }
  const target = hardware.targets[state.target];
  const requiredSpace = Number(hardware.requiredFreeSpace);
  const requiredRam = Number(target.ramGb);
  const enoughSpace = freeSpace >= requiredSpace;
  const enoughRam = ram >= requiredRam;
  output.className = `quick-check-status ${enoughSpace && enoughRam ? 'is-ok' : 'is-warning'}`;
  output.innerHTML = `<strong>${escapeHtml(t(enoughSpace && enoughRam ? 'Margem estimada adequada para esta meta.' : 'Espaço e/ou RAM abaixo da referência da meta.'))}</strong>
    <ul>
      <li>${escapeHtml(t('Espaço:'))} ${counterMarkup(freeSpace)} / ${counterMarkup(requiredSpace)} GB</li>
      <li>${escapeHtml(t('RAM:'))} ${counterMarkup(ram)} / ${counterMarkup(requiredRam)} GB</li>
    </ul>`;
  window.KynosI18n.translateDom(output, state.language);
  animateCounters(output);
}

function updateQuickProjectStatus() {
  const select = byId('quick-project-select');
  const output = byId('quick-project-status');
  if (!select || !output) return;
  const project = quickProjects[Number(select.value)];
  if (!project) {
    output.textContent = t('Selecione um projeto acompanhado.');
    return;
  }
  const inactive = isInactiveProject(project);
  const progress = portwatchProjectProgress(project, PORTWATCH_FALLBACK.milestones);
  const milestone = portwatchMilestone(project, PORTWATCH_FALLBACK.milestones);
  const status = inactive
    ? t('Projeto fora do ar / encerrado')
    : progress > 0
      ? t('Em progresso (relato do tracker)')
      : t('Acompanhado, sem marco de progresso reportado');
  const details = inactive
    ? `${t('Último marco:')} ${t(milestone.label)} · ${formatPercent(progress)}%`
    : progress > 0
      ? `${formatPercent(progress)}% · ${t(milestone.label)}`
      : t('Nenhum marco de progresso foi informado no tracker.');
  const repositoryLink = project.url
    ? `<a href="${escapeHtml(safeUrl(project.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Abrir repositório ↗'))}</a>`
    : '';
  output.innerHTML = `<div class="quick-project-result ${inactive ? 'is-warning' : progress > 0 ? 'is-progress' : ''}"><strong>${escapeHtml(status)}</strong><span>${escapeHtml(details)}</span></div>${repositoryLink}`;
  window.KynosI18n.translateDom(output, state.language);
}

function updateFakeRadar(snapshot) {
  const field = byId('quick-safety-query');
  const output = byId('quick-safety-result');
  const meter = byId('fake-radar-meter');
  if (!field || !output || !meter) return;
  const query = field.value.trim();
  if (!query) {
    meter.dataset.risk = 'low';
    output.className = 'quick-safety-result is-neutral';
    output.textContent = t('Digite um nome de projeto ou link para consultar o snapshot.');
    return;
  }
  const credentialLike = /\b(?:gh[pousr]_[a-z0-9_]{20,}|github_pat_[a-z0-9_]{20,})\b|(?:token|access_token|api_key)=([a-z0-9%_-]{16,})/i.test(query);
  if (credentialLike) {
    meter.dataset.risk = 'high';
    output.className = 'quick-safety-result is-danger';
    output.innerHTML = `<strong>${escapeHtml(t('Possível credencial detectada.'))}</strong><p>${escapeHtml(t('Não compartilhe tokens ou senhas. Apague o conteúdo do campo; a consulta acontece apenas localmente e não salva nem envia o texto.'))}</p>`;
    return;
  }
  const githubMatch = query.match(/github\.com\/([^/?#]+\/[^/?#]+)/i);
  const normalizedQuery = normalizeHardwareSearch(githubMatch ? githubMatch[1] : query);
  const projects = snapshot && Array.isArray(snapshot.efforts) ? snapshot.efforts : [];
  const project = projects.find((item) => {
    const repo = normalizeHardwareSearch(item.repo || '');
    const name = normalizeHardwareSearch(item.name || '');
    return normalizedQuery === repo || normalizedQuery === name;
  });
  const flaggedItems = snapshot && Array.isArray(snapshot.flagged) ? snapshot.flagged : [];
  const flaggedEntry = flaggedItems.find((item) => {
    const content = normalizeHardwareSearch(JSON.stringify(item));
    return normalizedQuery.length >= 4 && content.includes(normalizedQuery);
  });
  const looksLikeDownload = /\.(?:exe|msi|bat|cmd|scr)(?:$|[?#])|\/(?:download|installer|setup)(?:\/|$|[?#])|(?:free|gta.?vi).{0,20}(?:installer|download|launcher)/i.test(query);
  if ((flaggedEntry || looksLikeDownload) && !project) {
    meter.dataset.risk = 'high';
    output.className = 'quick-safety-result is-danger';
    output.innerHTML = `<strong>${escapeHtml(t('Alerta alto: sinalizado pelo tracker ou link de download executável.'))}</strong><p>${escapeHtml(flaggedEntry ? `${flaggedEntry.title}: ${flaggedEntry.summary}` : t('Nenhum instalador ou executável é distribuído pelo KynosRecompVI.'))}</p><small>${escapeHtml(t('Não baixe, não execute e não informe credenciais.'))}</small>`;
    return;
  }
  if (project) {
    const inactive = isInactiveProject(project);
    const highRisk = inactive || Boolean(flaggedEntry) || looksLikeDownload;
    meter.dataset.risk = highRisk ? 'high' : 'low';
    output.className = `quick-safety-result ${highRisk ? 'is-danger' : 'is-ok'}`;
    const progress = portwatchProjectProgress(project, PORTWATCH_FALLBACK.milestones);
    const projectStatus = inactive
      ? 'Projeto fora do ar / encerrado'
      : progress > 0
        ? 'Em progresso (relato do tracker)'
        : 'Acompanhado';
    const securityNotice = flaggedEntry
      ? `<p>${escapeHtml(t('Alerta alto: sinalizado pelo tracker ou link de download executável.'))} ${escapeHtml(flaggedEntry.title)}: ${escapeHtml(flaggedEntry.summary)}</p>`
      : looksLikeDownload
        ? `<p>${escapeHtml(t('Nenhum instalador ou executável é distribuído pelo KynosRecompVI.'))}</p>`
        : '';
    output.innerHTML = `<strong>${escapeHtml(t(projectStatus))}: ${escapeHtml(project.name)}</strong><p>${escapeHtml(project.repo || '')} · ${counterMarkup(progress, 'percent')}%</p>${securityNotice}${project.url ? `<a href="${escapeHtml(safeUrl(project.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Abrir repositório original ↗'))}</a>` : ''}<small>${escapeHtml(t('Encontrado no snapshot não é garantia de segurança; verifique o proprietário e o código antes de confiar.'))} ${escapeHtml(t('Não baixe, não execute e não informe credenciais.'))}</small>`;
    window.KynosI18n.translateDom(output, state.language);
    animateCounters(output);
    return;
  }
  meter.dataset.risk = 'medium';
  output.className = 'quick-safety-result is-warning';
  output.innerHTML = `<strong>${escapeHtml(t('Não encontrado como projeto confirmado no snapshot.'))}</strong><p>${escapeHtml(t('Isso não confirma que seja golpe nem que seja seguro. Nenhuma verificação ao vivo foi feita.'))}</p>`;
  window.KynosI18n.translateDom(output, state.language);
}

function setupQuickUtilities(snapshot) {
  const setup = readSetup();
  const freeSpaceInput = byId('quick-free-space');
  const ramInput = byId('quick-ram');
  freeSpaceInput.value = String(setup.freeSpaceGb);
  ramInput.value = String(setup.ramGb);
  freeSpaceInput.addEventListener('input', updateQuickReadiness);
  ramInput.addEventListener('input', updateQuickReadiness);
  const efforts = snapshot && Array.isArray(snapshot.efforts) ? snapshot.efforts : [];
  quickProjects = efforts.filter((project) => project && project.name);
  const select = byId('quick-project-select');
  select.innerHTML = `<option value="">${escapeHtml(t('Selecione um projeto acompanhado'))}</option>${quickProjects.map((project, index) =>
    `<option value="${index}">${escapeHtml(project.name)}${project.repo ? ` · ${escapeHtml(project.repo)}` : ''}</option>`).join('')}`;
  const offlineIndex = quickProjects.findIndex((project) => isInactiveProject(project));
  select.value = String(offlineIndex >= 0 ? offlineIndex : 0);
  select.addEventListener('change', updateQuickProjectStatus);
  byId('quick-safety-check').addEventListener('click', () => updateFakeRadar(snapshot));
  byId('quick-safety-query').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      updateFakeRadar(snapshot);
    }
  });
  updateQuickReadiness();
  updateQuickProjectStatus();
  updateFakeRadar(snapshot);
}

function renderPortwatchError(error) {
  console.error(error);
  const section = byId('portwatch-progress');
  section.setAttribute('aria-busy', 'false');
  section.innerHTML = '<p class="portwatch-error" role="alert">Não foi possível carregar o acompanhamento. Verifique o arquivo <code>data/tracker-pt-BR.json</code>.</p>';
  window.KynosI18n.translateDom(section, state.language);
}

function localizedValue(item, field) {
  const translation = item && item.translations && item.translations[state.language];
  return translation && Object.prototype.hasOwnProperty.call(translation, field)
    ? translation[field]
    : item && item[field];
}

function renderRepositoryCard(repo, project, milestones, rank, inactive) {
  const progress = project ? portwatchProjectProgress(project, milestones) : progressPercent(repo.progress && repo.progress.percent);
  const stage = project ? portwatchMilestone(project, milestones).label : 'Preparação';
  const statuses = Array.isArray(repo.statuses) ? repo.statuses : [];
  const statusLabels = localizedValue(repo, 'statusLabels');
  const linkLabels = localizedValue(repo, 'linkLabels');
  const reached = milestones.filter((milestone) => progressPercent(milestone.percent) <= progress);
  const next = milestones.find((milestone) => progressPercent(milestone.percent) > progress);
  const milestoneTags = Array.isArray(repo.milestones) ? repo.milestones : reached.concat(next ? [next] : []).slice(-5);
  const progressTitle = inactive ? 'Último marco' : 'Marco atual';
  const repositoryName = escapeHtml(repo.name || '');
  const statusNote = localizedValue(repo, 'statusNote');
  const description = localizedValue(repo, 'description') || '';
  const label = `${t(progressTitle)} · ${t(stage)}`;
  const rankLabel = inactive ? t('FORA') : `#${rank}`;

  return `<article class="repo-card ${repo.details ? 'xcl-repo-card' : ''} ${inactive ? 'repo-card--inactive' : ''}">
      <div class="rank-badge ${inactive ? 'inactive-badge' : ''}">${escapeHtml(rankLabel)}</div>
      <div class="repo-main">
        <div class="repo-title-row">
          ${repo.avatar ? `<span class="repo-avatar" aria-hidden="true"><img src="${escapeHtml(safeUrl(repo.avatar))}" alt=""><span hidden>${escapeHtml(repo.initials || (repo.name || '').slice(0, 2))}</span></span>` : ''}
          <div><h3>${repositoryName}</h3><span class="repo-slug">${escapeHtml(repo.repo || '')}</span></div>
        </div>
        <div class="badge-row">${statuses.map((status, statusIndex) => {
    const statusLabel = Array.isArray(statusLabels) ? statusLabels[statusIndex] : status.label;
    return `<span class="status-badge ${escapeHtml(status.style || '')}">${escapeHtml(statusLabel || '')}</span>`;
  }).join('')}</div>
        <p class="repo-author"><span>${escapeHtml(t('Por'))}</span> <b>${escapeHtml(repo.author || '')}</b></p>
        <p class="repo-description">${escapeHtml(description)}</p>
        ${inactive && statusNote ? `<p class="repo-inactive-note">${escapeHtml(statusNote)}</p>` : ''}
        <div class="repo-links">${(repo.links || []).map((link, linkIndex) => {
    const linkLabel = Array.isArray(linkLabels) ? linkLabels[linkIndex] : link.label;
    return `<a class="button ${link.primary || linkIndex === 0 ? 'primary-link' : ''}" href="${escapeHtml(safeUrl(link.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(linkLabel || 'Abrir repositório'))} ↗</a>`;
  }).join('')}</div>
      </div>
      <div class="repo-progress">
        <div class="progress-label"><span>${escapeHtml(label)}</span><b>${counterMarkup(progress, 'percent')}%</b></div>
        <div class="progress-track"><span style="width:${progress}%"></span></div>
        <div class="milestone-tags">${milestoneTags.map((milestone) => {
    const reachedMilestone = typeof milestone.done === 'boolean'
      ? milestone.done
      : progressPercent(milestone.percent) <= progress;
    return `<span class="milestone-tag ${reachedMilestone ? 'done' : ''}">${reachedMilestone ? '✓ ' : '◌ '}${escapeHtml(t(milestone.label))}</span>`;
  }).join('')}</div>
      </div>${repo.details ? `
      <div class="xcl-details">
        <section class="xcl-groundwork"><div class="xcl-details-heading"><span class="section-kicker">PREPARAÇÃO TÉCNICA</span><h4>Base de compatibilidade</h4></div>
          ${repo.details.groundwork.map((item) => `<div class="xcl-score-row"><div class="xcl-score-label"><span>${escapeHtml(item.label)}</span><b>${escapeHtml(item.value)}%</b></div><div class="xcl-score-track"><span style="width:${Math.max(0, Math.min(100, Number(item.value)))}%"></span></div>${item.note ? `<small>${escapeHtml(item.note)}</small>` : ''}</div>`).join('')}
        </section>
        <section class="xcl-evidence"><div class="xcl-details-heading"><span class="section-kicker">O QUE FUNCIONA</span><h4>Avanços reportados</h4></div><ul>${repo.details.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
        <section class="xcl-blockers"><div class="xcl-details-heading"><span class="section-kicker">EM DESENVOLVIMENTO</span><h4>Bloqueios conhecidos</h4></div><ul>${repo.details.blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
        <section class="xcl-repo-metrics"><div class="xcl-details-heading"><span class="section-kicker">MÉTRICAS DE REFERÊNCIA</span><h4>Atividade do repositório</h4></div><div class="xcl-metric-grid">${repo.details.metrics.map((metric) => `<div><span>${escapeHtml(metric.label)}</span><b>${escapeHtml(metric.value)}</b></div>`).join('')}</div><p>${escapeHtml(repo.details.metricsNote)} ${escapeHtml(t('Última avaliação'))}: ${escapeHtml(repo.details.evaluatedAt)}.</p></section>
      </div>` : ''}
    </article>`;
}

function renderRepositories(items, progressData = portwatchData || PORTWATCH_FALLBACK) {
  const milestones = Array.isArray(progressData && progressData.milestones) ? progressData.milestones : [];
  const trackedProjects = new Map((progressData && Array.isArray(progressData.projects) ? progressData.projects : [])
    .map((project) => [project.id, project]));
  const activeItems = items.filter((repo) => !isInactiveProject(repo))
    .map((repo) => ({ repo, project: trackedProjects.get(repo.trackerId) }))
    .sort((left, right) => {
      const progressDiff = portwatchProjectProgress(right.project || {}, milestones) - portwatchProjectProgress(left.project || {}, milestones);
      return progressDiff || (Number(left.repo.rank) || Number.MAX_SAFE_INTEGER) - (Number(right.repo.rank) || Number.MAX_SAFE_INTEGER);
    })
    .slice(0, 5);
  const inactiveItems = items.filter(isInactiveProject);
  byId('repo-count').textContent = String(activeItems.length).padStart(2, '0');
  byId('repository-list').innerHTML = activeItems
    .map(({ repo, project }, index) => renderRepositoryCard(repo, project, milestones, index + 1, false))
    .join('');
  const inactiveSection = byId('inactive-repositories');
  inactiveSection.hidden = inactiveItems.length === 0;
  byId('inactive-repository-list').innerHTML = inactiveItems
    .map((repo) => renderRepositoryCard(repo, trackedProjects.get(repo.trackerId), milestones, 0, true))
    .join('');
  byId('repository-list').querySelectorAll('.repo-avatar img').forEach((image) => {
    const showFallback = () => {
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    };
    image.addEventListener('error', showFallback, { once: true });
    if (image.complete && !image.naturalWidth) showFallback();
  });
  byId('inactive-repository-list').querySelectorAll('.repo-avatar img').forEach((image) => {
    const showFallback = () => {
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    };
    image.addEventListener('error', showFallback, { once: true });
    if (image.complete && !image.naturalWidth) showFallback();
  });
  window.KynosI18n.translateDom(byId('repository-list'), state.language);
  window.KynosI18n.translateDom(inactiveSection, state.language);
}

function formatNewsDate(value) {
  const source = String(value || '').trim();
  const locale = { pt: 'pt-BR', en: 'en', es: 'es', zh: 'zh-CN' }[state.language];
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(source);
  const hasTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(source);
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(source);
  if (dateOnly) {
    const date = new Date(`${source}T12:00:00Z`);
    return `${new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeZone: 'America/Sao_Paulo'
    }).format(date)} · ${t('horário não informado')}`;
  }
  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return source || t('Data não informada');
  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  };
  if (hasTimeZone) options.timeZone = 'America/Sao_Paulo';
  const formatted = new Intl.DateTimeFormat(locale, options).format(date);
  return hasTime && !hasTimeZone ? `${formatted} · ${t('horário local')}` : formatted;
}

function relativeNewsTime(value) {
  const source = String(value || '').trim();
  const locale = { pt: 'pt-BR', en: 'en', es: 'es', zh: 'zh-CN' }[state.language];
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  if (/^\d{4}-\d{2}-\d{2}$/.test(source)) {
    const [year, month, day] = source.split('-').map(Number);
    const todayParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    const today = Object.fromEntries(todayParts.map((part) => [part.type, Number(part.value)]));
    const eventDay = Date.UTC(year, month - 1, day);
    const todayDay = Date.UTC(today.year, today.month - 1, today.day);
    return relative.format(Math.round((eventDay - todayDay) / 86400000), 'day');
  }
  const timestamp = Date.parse(source);
  if (!Number.isFinite(timestamp)) return '';
  const difference = (timestamp - Date.now()) / 1000;
  const absolute = Math.abs(difference);
  const unit = absolute < 60
    ? { name: 'second', seconds: 1 }
    : absolute < 3600
      ? { name: 'minute', seconds: 60 }
      : absolute < 86400
        ? { name: 'hour', seconds: 3600 }
        : { name: 'day', seconds: 86400 };
  return relative.format(Math.round(difference / unit.seconds), unit.name);
}

function publicationTimeMarkup(value, className = '') {
  const source = String(value || '').trim();
  const hasTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(source);
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(source);
  const date = new Date(source);
  const isValid = !Number.isNaN(date.getTime());
  const datetime = isValid ? (hasTime && hasTimeZone ? date.toISOString() : source) : '';
  const title = hasTime && isValid
    ? (hasTimeZone ? `UTC: ${date.toISOString()}` : '')
    : t('A fonte não informou o horário de publicação.');
  const relative = relativeNewsTime(source);
  return `<time${className ? ` class="${escapeHtml(className)}"` : ''}${datetime ? ` datetime="${escapeHtml(datetime)}"` : ''}${title ? ` title="${escapeHtml(title)}"` : ''}>${escapeHtml(formatNewsDate(source))}</time>${relative ? `<span class="publication-relative"> · ${escapeHtml(relative)}</span>` : ''}`;
}

function topPublicTrackerProjects(snapshot, limit = 5) {
  const efforts = snapshot && Array.isArray(snapshot.efforts) ? snapshot.efforts : [];
  const publicEfforts = efforts.filter((project) => project
    && project.tier === 'tracked'
    && typeof project.repo === 'string'
    && /^[\w.-]+\/[\w.-]+$/.test(project.repo)
    && !project.private
    && !isInactiveProject(project));
  return window.PortWatchScoring.overall(publicEfforts.map(normalizePortwatchEffort)).ranked
    .slice(0, limit)
    .map(({ effort, score }, index) => ({ ...effort, percent: score, rank: index + 1 }));
}

function formatPercent(value) {
  const locale = { pt: 'pt-BR', en: 'en', es: 'es', zh: 'zh-CN' }[state.language];
  return Number(value).toLocaleString(locale, { maximumFractionDigits: 1 });
}

function selectFeaturedStory(data) {
  const candidates = [];
  const progressWords = (value) => String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) || [];
  const containsWordSequence = (textWords, sequence) => {
    if (!sequence.length || sequence.length > textWords.length) return false;
    return textWords.some((_, index) => sequence.every((word, offset) => textWords[index + offset] === word));
  };
  const topProjects = topPublicTrackerProjects(data, 5).map((effort) => {
    const repoName = String(effort.repo || '').split('/').pop();
    const projectId = normalizeHardwareSearch(effort.id || '');
    const ignoredAliases = new Set(['game', 'gta', 'gta6', 'gtavi', 'xbox', 'scarlett', 'project', 'recomp', 'emulator', 'windows']);
    const aliases = [effort.id, effort.name, repoName, effort.repo].flatMap((value) => {
      const words = progressWords(value);
      if (!words.length) return [];
      const phrases = words.length > 1 ? [words] : [];
      words.forEach((word) => {
        const isProjectId = word === projectId && word.length >= 3;
        if (!ignoredAliases.has(word) && (word.length >= 4 || isProjectId)) phrases.push([word]);
      });
      return phrases;
    });
    return { rank: effort.rank - 1, aliases };
  });
  const getProgressRank = (item) => {
    const sourceWords = progressWords([
      item.title, item.name, item.description, item.summary, item.dek, item.text,
      ...(Array.isArray(item.body) ? item.body : []),
      ...(Array.isArray(item.signals) ? item.signals : []),
      ...(Array.isArray(item.sources) ? item.sources.flatMap((source) => [source.outlet, source.title, source.url]) : [])
    ].join(' '));
    const match = topProjects.find((project) =>
      project.aliases.some((alias) => containsWordSequence(sourceWords, alias))
    );
    return match ? match.rank : -1;
  };
  const addCandidate = (item, sourceType) => {
    if (!item) return;
    const exclusionText = normalizeHardwareSearch([
      item.title, item.name, item.description, item.summary, item.dek, item.text
    ].join(' '));
    if (
      /leonida/.test(exclusionText)
      || (sourceType !== 'candidate'
        && /nuked|derrubad|fora do ar|offline|takedown/.test(exclusionText))
    ) return;
    const dateValue = item.date || item.updatedAt || item.loggedAt || item.foundAt || item.assessedAt || '';
    const timestamp = Date.parse(dateValue);
    const ageHours = Number.isFinite(timestamp) ? Math.max(0, (Date.now() - timestamp) / 3600000) : 24 * 365;
    const recency = Number.isFinite(timestamp)
      ? (sourceType === 'candidate'
        ? Math.max(0, 35 - Math.min(35, ageHours * 0.7))
        : Math.max(0, 100 - Math.min(100, ageHours * 2)))
      : 0;
    const text = normalizeHardwareSearch([
      item.title, item.name, item.description, item.summary, item.dek, item.text,
      ...(item.signals || [])
    ].join(' '));
    let impact = 0;
    if (/nuked|derrubad|takedown|remov|exclu/.test(text)) impact += 45;
    if (/in.?game|dentro do mundo|dentro do jogo|world/.test(text)) impact += 42;
    if (/menu|menus|first frame|primeiro quadro|in-game|fps/.test(text)) impact += 34;
    if (/exe|execut[aá]vel/.test(text)) impact += 28;
    if (/new project|novo projeto|nova equipe|candidate|candidato/.test(text)) impact += 30;
    if (sourceType === 'candidate') impact += Math.max(0, Math.min(35, Number(item.substance) || 0)) * 0.25;
    if (item.status === 'new' || item.kind === 'effort') impact += 20;
    const score = recency * 0.65 + impact;
    candidates.push({ item, score, sourceType, progressRank: getProgressRank(item) });
  };

  (Array.isArray(data.news) ? data.news : []).forEach((item) => addCandidate(item, 'news'));
  (Array.isArray(data.changes) ? data.changes : []).forEach((item) => addCandidate({
    id: `change-${item.date || ''}-${item.kind || ''}`,
    date: item.date,
    title: item.kind || item.title || 'Atualização do tracker',
    summary: item.summary || item.text || '',
    ...item
  }, 'change'));
  (Array.isArray(data.candidates) ? data.candidates : []).forEach((item) => {
    if (item.status === 'new' || Number(item.substance) >= 70) addCandidate({
      id: `candidate-${item.repo || item.name}`,
      date: item.foundAt || item.createdAt,
      title: item.name ? `Novo projeto relevante: ${item.name}` : 'Novo projeto relevante',
      summary: item.description || 'Candidato identificado pela triagem automática.',
      sources: item.repo ? [{ outlet: 'GitHub', title: item.repo, url: `https://github.com/${item.repo}` }] : [],
      ...item
    }, 'candidate');
  });

  candidates.sort((left, right) =>
    right.score - left.score
    || Date.parse(right.item.date || right.item.updatedAt || right.item.foundAt || 0)
    - Date.parse(left.item.date || left.item.updatedAt || left.item.foundAt || 0));
  const progressRelated = candidates.filter((candidate) => candidate.progressRank >= 0)
    .sort((left, right) => left.progressRank - right.progressRank || right.score - left.score);
  if (progressRelated.length) return progressRelated[0].item;
  return candidates[0] ? candidates[0].item : (data.news && data.news[0]) || null;
}

function renderStoryFeature(story, target) {
  const image = story.image && typeof story.image === 'object' ? story.image : null;
  const body = Array.isArray(story.body) ? story.body : [];
  const articleBody = body.length ? `<details class="news-full-content"><summary>${escapeHtml(t('Ler notícia completa'))}</summary>${body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${story.sources && story.sources.length ? `<div class="news-source-links">${story.sources.map((source) => `<a class="text-link" href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(source.outlet || 'Fonte original'))} ↗</a>`).join('')}</div>` : ''}</details>` : '';
  const imageMarkup = image && image.url ? `<figure class="news-feature-image"><img src="${escapeHtml(safeUrl(image.url))}" alt="" loading="lazy" decoding="async">${image.credit ? `<figcaption>${escapeHtml(image.credit)}${image.link ? ` · <a href="${escapeHtml(safeUrl(image.link))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Abrir imagem'))} ↗</a>` : ''}</figcaption>` : ''}</figure>` : '';
  target.innerHTML = `
    <div class="news-feature-content">
      <div class="news-feature-meta"><span class="news-feature-kicker">${escapeHtml(t('Manchete em destaque'))}</span><span class="news-category">${escapeHtml(t(story.category))}</span>${publicationTimeMarkup(story.date)}</div>
      <h3>${escapeHtml(localizedValue(story, 'title') || story.title)}</h3>
      <p>${escapeHtml(localizedValue(story, 'dek') || localizedValue(story, 'summary') || story.summary || story.dek)}</p>
      ${imageMarkup}
      ${articleBody}
      <div class="news-source-links">${(story.sources || []).map((source) => `<a class="text-link" href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(t(source.title))}">${escapeHtml(t(source.outlet))} ↗</a>`).join('')}</div>
    </div>
    <div class="news-feature-stamp" aria-hidden="true"><span>KYNOSRECOMPVI</span><strong>${escapeHtml(t(story.category || 'Notícia'))}</strong><small>${escapeHtml(formatNewsDate(story.date))}</small></div>`;
  target.dataset.newsStoryId = String(story.id || story.title || story.date || '');
  target.tabIndex = -1;
  window.KynosI18n.translateDom(target, state.language);
}

function renderStoryCard(story, featured = false) {
  const body = Array.isArray(story.body) ? story.body : [];
  const image = story.image && typeof story.image === 'object' ? story.image : null;
  const fullContent = body.length || (story.sources && story.sources.length)
    ? `<details class="news-card-full"><summary>${escapeHtml(t('Ler completo'))}</summary>
      ${image && image.url ? `<figure class="news-card-image"><img src="${escapeHtml(safeUrl(image.url))}" alt="" loading="lazy" decoding="async">${image.credit ? `<figcaption>${escapeHtml(image.credit)}</figcaption>` : ''}</figure>` : ''}
      ${body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      ${story.sources && story.sources.length ? `<div class="news-source-links">${story.sources.map((source) => `<a class="text-link" href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(source.outlet || 'Fonte original'))} ↗</a>`).join('')}</div>` : ''}
    </details>` : '';
  return `<article class="news-card ${featured ? 'news-card--featured' : ''}" data-news-story-id="${escapeHtml(String(story.id || story.title || story.date || ''))}" tabindex="-1">
    <div class="news-card-top"><span class="news-category">${escapeHtml(t(story.category))}</span>${publicationTimeMarkup(story.date)}</div>
    <h3>${escapeHtml(localizedValue(story, 'title') || story.title)}</h3>
    <p>${escapeHtml(localizedValue(story, 'summary') || story.summary)}</p>
    ${story.loggedAt ? `<p class="news-card-recorded">${escapeHtml(t('Registro editorial no portal:'))} ${publicationTimeMarkup(story.loggedAt)}</p>` : ''}
    ${fullContent}
    <div class="news-source-links">${(story.sources || []).map((source) => `<a class="text-link" href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(t(source.title))}">${escapeHtml(t(source.outlet))} ↗</a>`).join('')}</div>
  </article>`;
}

function renderXlaunchSpotlight(project, team, snapshot, modifier = '') {
  if (!project) return '';
  const report = project.teamReport || (team && team.latestReport);
  if (!report) return '';
  const latestActivity = team && team.latestActivity;
  const percentValue = Number(project.percent);
  const percent = Number.isFinite(percentValue) ? Math.max(0, Math.min(100, percentValue)) : 0;
  const repositoryUrl = safeUrl(project.url);
  const discordUrl = safeUrl(team && team.discordUrl);
  const owner = String(project.repo || '').split('/')[0];
  const avatarUrl = /^[\w-]+$/.test(owner) ? `https://github.com/${encodeURIComponent(owner)}.png?size=88` : '';
  const repositoryCheck = team && team.repositoryCheck && typeof team.repositoryCheck === 'object'
    ? team.repositoryCheck
    : {};
  const httpStatus = Number(repositoryCheck.httpStatus);
  const checkDate = typeof repositoryCheck.checkedAt === 'string' ? repositoryCheck.checkedAt : '';
  const snapshotDate = project.repositoryAssessedAt || (snapshot && snapshot.updatedAt) || '';
  const checkMessage = httpStatus === 404
    ? t('A consulta pública sem autenticação ao GitHub retornou HTTP 404. Isso não permite determinar se o repositório está privado, removido ou temporariamente indisponível.')
    : '';
  const reportDate = report.loggedAt || report.date;

  return `<article class="xlaunch-spotlight ${escapeHtml(modifier)}">
    <div class="xlaunch-spotlight-heading">
      <span class="home-leader-avatar">${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="" loading="lazy" decoding="async">` : ''}<span class="home-leader-avatar-fallback" ${avatarUrl ? 'hidden' : ''}>X</span></span>
      <div><span class="section-kicker">${escapeHtml(t('DESTAQUE DA COMUNIDADE BR'))}</span><h3>${escapeHtml(project.name)}</h3><span class="repo-slug">${escapeHtml(project.repo || '')}</span></div>
      <span class="status-badge warning">${escapeHtml(t('Relato não verificado independentemente'))}</span>
    </div>
    <p class="xlaunch-spotlight-teaser">${escapeHtml(localizedValue(report, 'teaser') || localizedValue(report, 'summary') || '')}</p>
    ${latestActivity && latestActivity.quote ? `<div class="xlaunch-spotlight-latest-activity"><strong>${escapeHtml(t('Atividade recente'))} · ${escapeHtml(latestActivity.reporter || 'XLaunchVI')}${latestActivity.date ? ` · ${publicationTimeMarkup(latestActivity.date)}` : ''}</strong><p>“${escapeHtml(latestActivity.quote)}”</p>${latestActivity.transparency ? `<small>${escapeHtml(latestActivity.transparency)}</small>` : ''}</div>` : ''}
    <div class="xlaunch-spotlight-progress">
      <div class="progress-label"><span>${escapeHtml(t('Estimativa editorial baseada em relato'))}</span><strong>${counterMarkup(percent, 'percent')}%</strong></div>
      <div class="progress-track" role="progressbar" aria-label="${escapeHtml(`${project.name}: ${formatPercent(percent)}% de estimativa editorial`)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span data-progress-value="${percent}"></span></div>
    </div>
    <p class="xlaunch-spotlight-check">${escapeHtml(t('Progresso PortWatch/GitHub, incluindo preparação:'))} ${formatPercent(project.portwatchPercent)}% · ${escapeHtml(t('Marco GTA VI no snapshot:'))} ${formatPercent(project.portwatchMilestonePercent)}%${snapshotDate ? ` · ${publicationTimeMarkup(snapshotDate)}` : ''}</p>
    ${checkMessage ? `<p class="xlaunch-spotlight-check">${escapeHtml(checkMessage)}${checkDate ? ` · ${publicationTimeMarkup(checkDate)}` : ''}</p>` : ''}
    ${reportDate ? `<p class="xlaunch-spotlight-recorded">${escapeHtml(t('Relato registrado no portal:'))} ${publicationTimeMarkup(reportDate)}</p>` : ''}
    <div class="xlaunch-spotlight-links">
      ${repositoryUrl !== '#' ? `<a class="button primary-link" href="${escapeHtml(repositoryUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('GitHub do XlaunchVI ↗'))}</a>` : ''}
      ${discordUrl !== '#' ? `<a class="button button-discord" href="${escapeHtml(discordUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Discord do XlaunchVI ↗'))}</a>` : ''}
    </div>
  </article>`;
}

function renderXlaunchReportPanel(report, team) {
  if (!report) return '';
  const discordUrl = safeUrl(team && team.discordUrl);
  const sources = Array.isArray(report.sources) ? report.sources : [];
  return `<article class="panel xlaunch-team-report">
    <div class="xlaunch-team-report-heading"><span class="section-kicker">${escapeHtml(t('RELATO DA EQUIPE · DISCORD'))}</span><span class="status-badge warning">${escapeHtml(report.reporter || 'JPTuba')}</span></div>
    <h3>${escapeHtml(localizedValue(report, 'title') || report.title || '')}</h3>
    <p>${escapeHtml(localizedValue(report, 'summary') || report.summary || '')}</p>
    ${localizedValue(report, 'dashboardContext') ? `<p class="xlaunch-team-report-dashboard">${escapeHtml(localizedValue(report, 'dashboardContext'))}</p>` : ''}
    <div class="xlaunch-team-report-times">
      ${report.date ? `<div><span>${escapeHtml(t('Data do relato; horário original não informado:'))}</span>${publicationTimeMarkup(report.date)}</div>` : ''}
      ${report.loggedAt ? `<div><span>${escapeHtml(t('Registro editorial no portal:'))}</span>${publicationTimeMarkup(report.loggedAt)}</div>` : ''}
    </div>
    <p class="xlaunch-team-report-transparency">${escapeHtml(localizedValue(report, 'transparency') || report.transparency || '')}</p>
    <div class="news-source-links">${sources.map((source) => `<a class="text-link" href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(t(source.title || ''))}">${escapeHtml(t(source.outlet || 'Fonte original'))} ↗</a>`).join('')}${discordUrl !== '#' && !sources.length ? `<a class="text-link" href="${escapeHtml(discordUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Discord do XlaunchVI ↗'))}</a>` : ''}</div>
  </article>`;
}

function renderPortalHome(data) {
  renderHeaderFreshness(data);
  renderPortwatchProgress(PORTWATCH_FALLBACK, data);
}

function trackerTimestamp(data) {
  const values = [data && data.updatedAt, data && data.updated, data && data.lastSyncedAt]
    .map((value) => {
      const timestamp = Date.parse(String(value || ''));
      return Number.isFinite(timestamp) ? timestamp : null;
    })
    .filter((timestamp) => timestamp !== null);
  return values.length ? Math.max(...values) : null;
}

function renderHeaderFreshness(data) {
  const container = byId('header-freshness');
  const full = byId('header-freshness-full');
  const compact = byId('header-freshness-short');
  if (!container || !full || !compact) return;
  headerFreshnessTimestamp = trackerTimestamp(data);
  const updateLabel = () => {
    if (headerFreshnessTimestamp === null) {
      full.textContent = t('Atualização sem horário');
      compact.textContent = '—';
      container.title = t('Atualização sem horário');
      container.setAttribute('aria-label', t('Atualização sem horário'));
      container.hidden = false;
      return;
    }
    const age = Math.max(0, Date.now() - headerFreshnessTimestamp);
    let fullLabel;
    let shortLabel;
    if (age < 60_000) {
      fullLabel = t('Atualizado há poucos segundos');
      shortLabel = { pt: 'agora', en: 'now', es: 'ahora', zh: '刚刚' }[state.language];
    } else if (age < 60 * 60_000) {
      const minutes = Math.floor(age / 60_000);
      fullLabel = t('Atualizado há {value} min').replace('{value}', String(minutes));
      shortLabel = `${minutes}m`;
    } else if (age < 24 * 60 * 60_000) {
      const hours = Math.floor(age / (60 * 60_000));
      fullLabel = t('Atualizado há {value} h').replace('{value}', String(hours));
      shortLabel = `${hours}h`;
    } else {
      const days = Math.floor(age / (24 * 60 * 60_000));
      fullLabel = t('Atualizado há {value} d').replace('{value}', String(days));
      shortLabel = `${days}d`;
    }
    full.textContent = fullLabel;
    compact.textContent = shortLabel;
    container.title = `${fullLabel} · ${new Date(headerFreshnessTimestamp).toISOString()}`;
    container.setAttribute('aria-label', `${fullLabel} · ${new Date(headerFreshnessTimestamp).toISOString()}`);
    container.hidden = false;
  };
  updateLabel();
  if (!headerFreshnessTimer) headerFreshnessTimer = window.setInterval(updateLabel, 15_000);
}

function renderXlaunchPage(data) {
  const output = byId('xlaunchvi-content');
  if (!output) return;
  const efforts = data && Array.isArray(data.efforts) ? data.efforts : [];
  const project = efforts.find((item) => item && item.id === 'xlaunchvi');
  if (!project) {
    output.innerHTML = `<p class="xlaunch-unavailable" role="status">${escapeHtml(t('A página do projeto está indisponível no snapshot atual.'))}</p>`;
    output.setAttribute('aria-busy', 'false');
    return;
  }

  const teams = data && data.teams && typeof data.teams === 'object' ? data.teams : {};
  const team = teams.xlaunchvi && typeof teams.xlaunchvi === 'object' ? teams.xlaunchvi : {};
  const teamReport = team.latestReport || project.teamReport || null;
  const repositoryCheck = team.repositoryCheck && typeof team.repositoryCheck === 'object' ? team.repositoryCheck : {};
  const details = project.technicalDetails && typeof project.technicalDetails === 'object' ? project.technicalDetails : {};
  const hasProgress = project.percent !== null && project.percent !== undefined && String(project.percent).trim() !== '';
  const progressValue = hasProgress ? Number(project.percent) : NaN;
  const progress = Number.isFinite(progressValue) ? Math.max(0, Math.min(100, progressValue)) : null;
  const estimatedFromTeam = project.progressBasis === 'team-report-estimate';
  const progressLabel = progress === null ? '—' : `${counterMarkup(progress, 'percent')}%${estimatedFromTeam ? ` · ${escapeHtml(t('estimativa'))}` : ''}`;
  const statusLabel = project.status === 'offline'
    ? t('Projeto fora do ar / encerrado')
    : estimatedFromTeam
    ? t('Estimativa editorial baseada em relato')
    : project.status === 'acompanhado'
      ? progress === 0
        ? t('Acompanhado, sem marco de progresso reportado')
        : progress === null
          ? t('Progresso não informado no snapshot.')
          : t('Em progresso (relato do tracker)')
      : t('Status não informado no snapshot.');
  const repositoryUrl = safeUrl(project.url);
  const repositoryHttpStatus = Number(repositoryCheck.httpStatus || project.repositoryHttpStatus);
  const repositoryMissing = project.repositoryMissing === true || repositoryHttpStatus === 404;
  const repositoryAssessedAt = typeof repositoryCheck.checkedAt === 'string'
    ? repositoryCheck.checkedAt
    : typeof project.repositoryAssessedAt === 'string' ? project.repositoryAssessedAt : '';
  const pixKey = typeof team.pixKey === 'string' ? team.pixKey.trim() : '';
  const kickUrl = safeUrl(typeof team.kickUrl === 'string' ? team.kickUrl.trim() : '');
  const discordUrl = safeUrl(typeof team.discordUrl === 'string' ? team.discordUrl.trim() : '');
  const highlights = Array.isArray(details.highlights) ? details.highlights.filter((item) => typeof item === 'string' && item.trim()) : [];
  const blockers = Array.isArray(details.blockers) ? details.blockers.filter((item) => typeof item === 'string' && item.trim()) : [];
  const groundwork = Array.isArray(details.groundwork)
    ? details.groundwork.filter((item) => item && item.percent !== null && item.percent !== undefined && String(item.percent).trim() !== '' && Number.isFinite(Number(item.percent)))
    : [];
  const repositoryUpdate = typeof project.lastRepositoryUpdate === 'string' ? project.lastRepositoryUpdate : '';
  const metricCards = groundwork.map((metric) => {
    const value = Math.max(0, Math.min(100, Number(metric.percent)));
    return `<article class="xlaunch-tech-metric">
      <div><span>${escapeHtml(t(metric.label || ''))}</span><strong>${counterMarkup(value, 'percent')}%</strong></div>
      <div class="xlaunch-tech-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span data-progress-value="${value}"></span></div>
    </article>`;
  }).join('');
  const repositoryWarning = repositoryMissing
    ? repositoryHttpStatus === 404
      ? t('A consulta pública sem autenticação ao GitHub retornou HTTP 404. Isso não permite determinar se o repositório está privado, removido ou temporariamente indisponível.')
      : Number.isFinite(repositoryHttpStatus) && repositoryHttpStatus > 0
        ? t('Repositório indisponível no último registro (HTTP {status}); isso não confirma o motivo.').replace('{status}', String(repositoryHttpStatus))
        : t('Repositório indisponível no último registro; motivo não confirmado.')
    : '';

  output.innerHTML = `
    <section class="section-heading xlaunch-section-heading">
      <div><span class="section-kicker">${escapeHtml(t('PROJETO NO GITHUB'))}</span><h2>${escapeHtml(project.name)} <span>${escapeHtml(t('em foco.'))}</span></h2></div>
      ${repositoryUrl !== '#' ? `<a class="button primary-link" href="${escapeHtml(repositoryUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Repositório de código'))} ↗</a>` : ''}
    </section>
    ${renderXlaunchReportPanel(teamReport, team)}
    ${repositoryWarning ? `<p class="xlaunch-repository-warning xlaunch-repository-warning--report">${escapeHtml(repositoryWarning)}${repositoryAssessedAt ? ` · ${escapeHtml(t('Verificado em'))} ${publicationTimeMarkup(repositoryAssessedAt)}` : ''}</p>` : ''}
    <div class="xlaunch-overview-grid">
      <article class="panel xlaunch-project-card">
        <div class="xlaunch-project-heading">
          <div><span class="section-kicker">${escapeHtml(t('Status do tracker'))}</span><h3>${escapeHtml(project.name)}</h3><span class="repo-slug">${escapeHtml(project.repo || '')}</span></div>
            <div class="xlaunch-status-stack"><span class="status-badge accent">${escapeHtml(statusLabel)}</span>${repositoryMissing ? `<span class="status-badge warning">${escapeHtml(t('Repositório indisponível'))}</span>` : ''}</div>
        </div>
          <p class="xlaunch-project-summary">${escapeHtml(t(project.summary || ''))}</p>
        <div class="xlaunch-project-facts">
          <div><span>${escapeHtml(t('Abordagem'))}</span><strong>${escapeHtml(t(details.approach || '—'))}</strong></div>
          <div><span>${escapeHtml(t('Alvo'))}</span><strong>${escapeHtml(t(details.target || '—'))}</strong></div>
          <div><span>${escapeHtml(t('Progresso de GTA VI'))}</span><strong>${progressLabel}</strong></div>
          <div><span>${escapeHtml(t('Marco atual'))}</span><strong>${escapeHtml(project.stage ? t(project.stage) : t('Nenhum marco de progresso foi informado no tracker.'))}</strong></div>
          ${estimatedFromTeam ? `<div><span>${escapeHtml(t('Progresso PortWatch (inclui preparação)'))}</span><strong>${formatPercent(project.portwatchPercent)}%</strong></div><div><span>${escapeHtml(t('Marcos de GTA VI no tracker'))}</span><strong>${formatPercent(project.portwatchMilestonePercent)}%</strong></div>` : ''}
        </div>
        ${progress !== null ? `<div class="xlaunch-project-progress" role="progressbar" aria-label="${escapeHtml(`${project.name}: ${formatPercent(progress)}%`)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span data-progress-value="${progress}"></span></div>` : ''}
        ${repositoryUpdate ? `<p class="xlaunch-last-update"><span>${escapeHtml(t('Último push registrado'))}:</span> ${publicationTimeMarkup(repositoryUpdate)}</p>` : ''}
        <p class="xlaunch-disclaimer">${escapeHtml(t(project.verification || ''))}</p>
      </article>
      <article class="panel xlaunch-tech-card">
        <div class="xlaunch-card-heading"><span class="section-kicker">${escapeHtml(t('Indicadores técnicos'))}</span><span class="xlaunch-tech-icon" aria-hidden="true">⌁</span></div>
        <p class="xlaunch-tech-note">${escapeHtml(t(details.groundworkNote || 'Indicadores técnicos do snapshot; não representam progresso de GTA VI.'))}</p>
        <div class="xlaunch-tech-metrics">${metricCards || `<p>${escapeHtml(t('Nenhum indicador técnico reportado no snapshot.'))}</p>`}</div>
      </article>
    </div>
    ${(highlights.length || blockers.length) ? `<div class="xlaunch-details-grid">
      ${highlights.length ? `<article class="panel xlaunch-details-card"><span class="section-kicker">${escapeHtml(t('Avanços reportados'))}</span><ul>${highlights.map((item) => `<li>${escapeHtml(t(item))}</li>`).join('')}</ul></article>` : ''}
      ${blockers.length ? `<article class="panel xlaunch-details-card xlaunch-details-card--blockers"><span class="section-kicker">${escapeHtml(t('Bloqueios conhecidos'))}</span><ul>${blockers.map((item) => `<li>${escapeHtml(t(item))}</li>`).join('')}</ul></article>` : ''}
    </div>` : ''}
    <div class="xlaunch-community-grid">
      <article class="panel xlaunch-community-card xlaunch-pix-card">
        <span class="section-kicker">${escapeHtml(t('Apoio ao desenvolvimento'))}</span><h3>Pix</h3>
        ${pixKey ? `<code class="xlaunch-pix-key">${escapeHtml(pixKey)}</code><button class="button primary-link" type="button" data-copy-pix="${escapeHtml(pixKey)}">${escapeHtml(t('Copiar chave Pix'))}</button><p class="xlaunch-copy-status" id="xlaunch-pix-status" role="status" aria-live="polite"></p>` : `<p class="xlaunch-copy-status" id="xlaunch-pix-status" role="status">${escapeHtml(t('Chave Pix indisponível neste snapshot.'))}</p>`}
        <p class="xlaunch-community-note">${escapeHtml(t('Contribuição voluntária e independente; o KynosRecompVI não administra nem recebe pagamentos.'))}</p>
      </article>
      <article class="panel xlaunch-community-card">
        <span class="section-kicker">${escapeHtml(t('Transmissão ao vivo (Kick BR)'))}</span><h3>Kick</h3>
        ${kickUrl !== '#' ? `<a class="button xlaunch-kick-link" href="${escapeHtml(kickUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Abrir canal na Kick ↗'))}</a>` : `<p>${escapeHtml(t('Canal indisponível neste snapshot.'))}</p>`}
        <p class="xlaunch-community-note">${escapeHtml(t('Canal externo e comunitário; o status ao vivo é informado pela plataforma.'))}</p>
      </article>
      <article class="panel xlaunch-community-card">
        <span class="section-kicker">${escapeHtml(t('Discord da equipe'))}</span><h3>Discord</h3>
        ${discordUrl !== '#' ? `<a class="button" href="${escapeHtml(discordUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Discord do XlaunchVI ↗'))}</a>` : `<p class="xlaunch-discord-pending">${escapeHtml(t('Link do Discord será adicionado em breve.'))}</p>`}
      </article>
    </div>`;
  output.setAttribute('aria-busy', 'false');
  window.KynosI18n.translateDom(output, state.language);
  animateCounters(output);
  animateProgress(output);
}

function renderTrackerProjectCard(project, rank, leaderId) {
  const inactive = project.status === 'offline';
  const featured = !inactive && project.id === leaderId;
  const projectPercent = portwatchEffortScore(project);
  const score = window.PortWatchScoring.scoreEffort(normalizePortwatchEffort(project));
  const stage = project.stage || score.reachedLabel;
  const rankLabel = inactive ? t('FORA')
    : rank == null ? t(project.tier === 'watchlist' ? 'OBSERVAÇÃO' : 'PRIVADO')
      : String(rank);
  const details = project.technicalDetails && typeof project.technicalDetails === 'object' ? project.technicalDetails : {};
  const highlights = (Array.isArray(details.highlights) ? details.highlights : project.highlights || [])
    .filter((item) => typeof item === 'string' && item.trim()).slice(0, 3);
  const blockers = (Array.isArray(details.blockers) ? details.blockers : project.blockers || [])
    .filter((item) => typeof item === 'string' && item.trim()).slice(0, 3);
  const gta = project.gta && typeof project.gta === 'object' ? project.gta : {};
  const stabilityValues = { unknown: null, constant: 0, often: 25, sometimes: 55, rarely: 80, stable: 100 };
  const metricValue = (value) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(100, Number(value) * 100)) : null;
  const stabilityValue = typeof gta.stability === 'number'
    ? Math.max(0, Math.min(100, gta.stability * 100))
    : stabilityValues[String(gta.stability || 'unknown').toLowerCase()];
  const metrics = [
    { label: 'História', value: metricValue(gta.story) },
    { label: 'Gráficos', value: metricValue(gta.render) },
    { label: 'Desempenho', value: Number.isFinite(Number(gta.fps)) ? Math.max(0, Math.min(100, Number(gta.fps) / 30 * 100)) : null },
    { label: 'Estabilidade', value: stabilityValue }
  ];
  const metricMarkup = metrics.map((metric) => {
    const value = metric.value === null ? null : Math.round(metric.value);
    return `<div class="repo-metric">
      <div><span>${escapeHtml(t(metric.label))}</span><b>${value === null ? '—' : `${formatPercent(value)}%`}</b></div>
      <span class="repo-metric-track" role="progressbar" aria-label="${escapeHtml(`${t(metric.label)} · ${project.name}`)}" aria-valuemin="0" aria-valuemax="100"${value === null ? ' aria-valuetext="Não informado"' : ` aria-valuenow="${value}"`}><span style="width:${value || 0}%"></span></span>
    </div>`;
  }).join('');
  const milestones = [
    { key: 'groundwork', label: 'Preparação', at: 0 },
    { key: 'loads', label: 'Exe rodando', at: 10 },
    { key: 'boots', label: 'Primeiro frame', at: 20 },
    { key: 'menu', label: 'Menu principal', at: 30 },
    { key: 'world', label: 'No mundo', at: 40 },
    { key: 'playable', label: 'Jogável', at: 50 }
  ];
  const milestoneMarkup = milestones.map((milestone) => {
    const reached = projectPercent >= milestone.at;
    const current = score.reached === milestone.key;
    return `<span class="repo-milestone ${reached ? 'is-reached' : ''} ${current ? 'is-current' : ''}"${current ? ' aria-current="step"' : ''}>${escapeHtml(t(milestone.label))}</span>`;
  }).join('');
  const owner = String(project.repo || '').split('/')[0];
  const repoName = String(project.repo || '').split('/').slice(1).join('/');
  const githubUrl = /^[\w.-]+\/[\w.-]+$/.test(String(project.repo || ''))
    ? `https://github.com/${project.repo}`
    : '';
  const avatarUrl = project.avatarUrl || (owner && /^[\w.-]+$/.test(owner) ? `https://github.com/${encodeURIComponent(owner)}.png?size=88` : '');
  const avatarFallback = cleanDisplayText(project.name || '?').slice(0, 2).toUpperCase();
  const badges = [
    project.approach,
    project.target,
    project.verification === 'self-reported' ? 'Autodeclarado' : ''
  ].filter((label) => typeof label === 'string' && label.trim());
  const isKynosRecord = Boolean(project.trackerKynos || project.localOnly
    || (trackerData && trackerData.kynosSource && trackerData.kynosSource.efforts
      && trackerData.kynosSource.efforts.some((item) => item.id === project.id)));
  const externalLinks = (Array.isArray(project.links) ? project.links : [])
    .filter((link) => link && link.url && safeUrl(link.url) !== '#' && link.url !== githubUrl);
  const stats = project.stats && typeof project.stats === 'object' ? project.stats : {};
  const repoSummary = cleanDisplayText(project.summary || project.description || '');
  const renderEvidence = (items, fallback) => items.length
    ? `<ul>${items.map((item) => `<li>${escapeHtml(cleanDisplayText(item))}</li>`).join('')}</ul>`
    : `<p>${escapeHtml(t(fallback))}</p>`;
  const activityItems = [
    stats.stars != null ? `<span>★ ${counterMarkup(stats.stars)}</span>` : '',
    stats.forks != null ? `<span>⑂ ${counterMarkup(stats.forks)} ${escapeHtml(t('forks'))}</span>` : '',
    stats.commits7d != null ? `<span>${counterMarkup(stats.commits7d)} ${escapeHtml(t('commits · 7 dias'))}</span>` : '',
    stats.pushedAt ? `<span>${escapeHtml(t('Último push'))}: ${publicationTimeMarkup(stats.pushedAt)}</span>` : '',
    (project.review || project.assessedAt || project.repositoryAssessedAt)
      ? `<span>${escapeHtml(t('Revisão'))}: ${publicationTimeMarkup(project.review || project.assessedAt || project.repositoryAssessedAt)}</span>` : ''
  ].filter(Boolean).join('');
  const stageLabel = inactive ? t('Fora do ar') : t(cleanDisplayText(stage));

  return `<article class="repo-card tracker-project-card ${inactive ? 'repo-card--inactive' : ''} ${featured ? 'tracker-project--featured' : ''}">
    <div class="rank-badge ${inactive || rank == null ? 'inactive-badge' : ''}" aria-label="${escapeHtml(inactive ? t('Fora do ranking') : rank == null ? t(project.tier === 'watchlist' ? 'OBSERVAÇÃO' : 'PRIVADO') : `${t('Posição')} ${rank}`)}">${escapeHtml(rankLabel)}</div>
    <div class="repo-main">
      <div class="repo-title-row">
        <span class="repo-avatar" aria-hidden="true">${avatarUrl ? `<img src="${escapeHtml(safeUrl(avatarUrl))}" alt="" loading="lazy" decoding="async">` : ''}<span class="repo-avatar-fallback" ${avatarUrl ? 'hidden' : ''}>${escapeHtml(avatarFallback)}</span></span>
        <div><h3>${escapeHtml(cleanDisplayText(project.name))}</h3><span class="repo-slug">${escapeHtml(project.repo || t('Repositório privado'))}</span></div>
      </div>
      <div class="badge-row">${badges.map((label) => `<span class="status-badge">${escapeHtml(t(cleanDisplayText(label)))}</span>`).join('')}
        ${isKynosRecord ? `<span class="status-badge status-badge--source">${escapeHtml(t('Kynos Radar'))}</span>` : ''}
        ${project.id === 'xlaunchvi' ? `<span class="status-badge status-badge--br">BR</span>` : ''}
        ${externalLinks.map((link) => `<a class="status-badge status-badge--link" href="${escapeHtml(safeUrl(link.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t(cleanDisplayText(link.label || link.title || 'Link externo')))} ↗</a>`).join('')}
      </div>
      <p class="repo-description">${escapeHtml(repoSummary)}</p>
    </div>
    <div class="repo-score">
      <strong>${counterMarkup(projectPercent, 'percent')}%</strong>
      <span>${escapeHtml(stageLabel)}</span>
    </div>
    <div class="repo-card-milestones" role="list" aria-label="${escapeHtml(t('Marcos de progresso'))}">${milestoneMarkup}</div>
    <details class="repo-card-details"${rank != null && Number(rank) > 0 && Number(rank) <= 5 ? ' open' : ''}>
      <summary><span>${escapeHtml(t('Ver detalhes'))}</span><span>${escapeHtml(t('Ocultar detalhes'))}</span></summary>
      <div class="repo-details-body">
        <section class="repo-metrics" aria-label="${escapeHtml(t('Métricas de qualidade'))}">${metricMarkup}</section>
        <section class="repo-evidence">
          <div><h4>${escapeHtml(t('O que funciona'))}</h4>${renderEvidence(highlights, 'Nenhum avanço detalhado no snapshot.')}</div>
          <div><h4>${escapeHtml(t('O que está travando'))}</h4>${renderEvidence(blockers, 'Nenhum bloqueio detalhado no snapshot.')}</div>
        </section>
      </div>
    </details>
    <footer class="repo-card-footer">
      <div class="repo-card-activity">${activityItems || `<span>${escapeHtml(t('Métricas indisponíveis'))}</span>`}</div>
      <div class="repo-card-actions">
        ${githubUrl ? `<a class="repo-github-button" href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : ''}
      </div>
    </footer>
  </article>`;
}

function renderTrackerProjects(data) {
  const projects = data.efforts.map((project) => ({
    ...project,
    percent: portwatchEffortScore(project),
    stage: project.stage || portwatchMilestone(project, PORTWATCH_FALLBACK.milestones).label
  })).sort((left, right) => right.percent - left.percent || left.name.localeCompare(right.name));
  const publicTracked = projects.filter((project) => project.tier === 'tracked'
    && !project.private && !window.PortWatchScoring.isPrivateBuild(project));
  const activePublic = publicTracked.filter((project) => !isInactiveProject(project));
  const inactive = projects.filter((project) => isInactiveProject(project));
  const activeCount = projects.length - inactive.length;
  const privateBuilds = projects.filter((project) => project.tier === 'tracked'
    && !isInactiveProject(project) && window.PortWatchScoring.isPrivateBuild(project));
  const watchlist = projects.filter((project) => project.tier === 'watchlist' && !isInactiveProject(project));
  const byScore = (left, right) => right.percent - left.percent
    || window.PortWatchScoring.byStars(left, right)
    || left.name.localeCompare(right.name);
  const overallPublic = activePublic.slice().sort(byScore);
  const filteredPublic = activePublic.filter((project) => raceView.scope === 'all'
    || (raceView.scope === 'gta' ? /gta/i.test(project.target || '') : !/gta/i.test(project.target || '')));
  const sorters = {
    score: byScore,
    stars: (left, right) => window.PortWatchScoring.byStars(left, right) || byScore(left, right),
    active: (left, right) => (Date.parse(right.stats && right.stats.pushedAt || 0) || 0)
      - (Date.parse(left.stats && left.stats.pushedAt || 0) || 0) || byScore(left, right)
  };
  const sortedPublic = filteredPublic.slice().sort(sorters[raceView.sort] || byScore);
  const top = sortedPublic.slice(0, 5);
  const leader = overallPublic[0];
  const runnerUp = overallPublic[1];
  const xlaunch = projects.find((project) => project.id === 'xlaunchvi');
  const xlaunchTeam = data.teams && data.teams.xlaunchvi;
  byId('repo-count').innerHTML = counterMarkup(activePublic.length);
  byId('tracker-race-summary').innerHTML = `
    <article class="panel race-summary-card race-summary-card--featured"><span class="section-kicker">${escapeHtml(t('Projeto mais avançado'))}</span><strong>${leader ? `${escapeHtml(leader.name)} · ${counterMarkup(leader.percent, 'percent')}%` : '—'}</strong><p>${leader ? escapeHtml(t(leader.stage)) : escapeHtml(t('Sem dados de projetos'))}</p></article>
    <article class="panel race-summary-card"><span class="section-kicker">${escapeHtml(t('Segundo projeto ativo'))}</span><strong>${runnerUp ? `${escapeHtml(runnerUp.name)} · ${counterMarkup(runnerUp.percent, 'percent')}%` : '—'}</strong><p>${runnerUp ? escapeHtml(t(runnerUp.stage)) : ''}</p></article>
    <article class="panel race-summary-card"><span class="section-kicker">${escapeHtml(t('Projetos acompanhados'))}</span><strong>${counterMarkup(activeCount)}</strong><p>${inactive.length} ${escapeHtml(t('fora do ar, sem contar no ranking ativo'))}</p></article>`;
  const rankById = new Map(overallPublic.map((project, index) => [project.id, index + 1]));
  byId('repository-list').innerHTML = top.map((project) => renderTrackerProjectCard(project, rankById.get(project.id), leader && leader.id)).join('')
    || `<p class="race-empty">${escapeHtml(t('Nenhum projeto público corresponde a este filtro.'))}</p>`;
  byId('xlaunch-race-spotlight').innerHTML = renderXlaunchSpotlight(xlaunch, xlaunchTeam, data, 'xlaunch-spotlight--repositories');
  byId('tracker-all-projects').innerHTML = sortedPublic.slice(top.length).map((project) => renderTrackerProjectCard(project, rankById.get(project.id), leader && leader.id)).join('');
  byId('tracked-project-count').textContent = `${Math.max(0, sortedPublic.length - top.length)} ${t('outros projetos')}`;
  byId('private-builds').hidden = privateBuilds.length === 0;
  byId('private-repository-list').innerHTML = privateBuilds.map((project) => renderTrackerProjectCard(project, null, leader && leader.id)).join('');
  byId('private-build-count').textContent = `${privateBuilds.length} ${t('builds privadas')}`;
  byId('watchlist-projects').hidden = watchlist.length === 0;
  byId('watchlist-repository-list').innerHTML = watchlist.map((project) => renderTrackerProjectCard(project, null, leader && leader.id)).join('');
  byId('watchlist-project-count').textContent = `${watchlist.length} ${t('em observação')}`;
  byId('inactive-repositories').hidden = inactive.length === 0;
  byId('inactive-repository-list').innerHTML = inactive.map((project) => renderTrackerProjectCard(project, 0, leader && leader.id)).join('');
  [
    'repository-list', 'tracker-all-projects', 'private-repository-list',
    'watchlist-repository-list', 'inactive-repository-list'
  ].forEach((id) => {
    const root = byId(id);
    if (!root) return;
    root.querySelectorAll('.repo-avatar img').forEach((image) => {
      const showFallback = () => {
        image.hidden = true;
        if (image.nextElementSibling) image.nextElementSibling.hidden = false;
      };
      image.addEventListener('error', showFallback, { once: true });
      if (image.complete && !image.naturalWidth) showFallback();
    });
  });
  const translatedTargets = [
    'tracker-race-summary', 'repository-list', 'xlaunch-race-spotlight',
    'tracker-all-projects', 'private-builds', 'watchlist-projects', 'inactive-repositories'
  ];
  translatedTargets.forEach((id) => window.KynosI18n.translateDom(byId(id), state.language));
  attachAvatarFallbacks(byId('xlaunch-race-spotlight'));
  ['repo-count', 'tracker-race-summary', 'repository-list', 'xlaunch-race-spotlight',
    'tracker-all-projects', 'private-repository-list', 'watchlist-repository-list', 'inactive-repositories']
    .forEach((id) => animateCounters(byId(id)));
  ['repository-list', 'xlaunch-race-spotlight', 'tracker-all-projects', 'private-repository-list',
    'watchlist-repository-list', 'inactive-repositories'].forEach((id) => animateProgress(byId(id)));
}

function setupRaceControls() {
  if (raceView.initialized) return;
  const scope = byId('race-scope');
  const sort = byId('race-sort');
  if (!scope || !sort) return;
  scope.addEventListener('change', () => {
    raceView.scope = scope.value;
    if (trackerData) renderTrackerProjects(trackerData);
  });
  sort.addEventListener('change', () => {
    raceView.sort = sort.value;
    if (trackerData) renderTrackerProjects(trackerData);
  });
  raceView.initialized = true;
}

function renderNews(data) {
  const editorial = withManagedEditorial(data);
  const headline = selectFeaturedStory(editorial);
  const sourceNote = t('Notícias traduzidas e relatos de equipe em PT-BR; confira fontes e rótulos de verificação em cada item.');
  const updatedAt = data.lastSyncedAt || data.updatedAt || data.updated;
  byId('news-source-note').innerHTML = `${escapeHtml(sourceNote)} <span>· ${escapeHtml(t('Atualizado em'))} ${publicationTimeMarkup(updatedAt)} · ${escapeHtml(t('Fontes'))}: <a href="data/tracker.json" target="_blank" rel="noopener noreferrer">tracker.json</a> · <a href="data/kynostracker.json" target="_blank" rel="noopener noreferrer">kynostracker.json</a> · <a href="data/tracker-pt-BR.json" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Dados localizados'))}</a></span>`;
  if (headline) renderStoryFeature(headline, byId('news-feature'));
  byId('news-list').innerHTML = (Array.isArray(editorial.news) ? editorial.news : [])
    .filter((story) => story !== headline).map((story) => renderStoryCard(story)).join('');
  window.KynosI18n.translateDom(byId('news-source-note'), state.language);
  window.KynosI18n.translateDom(byId('news-list'), state.language);
}

function mapNewsToPortuguese(story) {
  if (state.language !== 'pt' || !story || typeof story !== 'object') return story;
  try {
    const translations = story.translations && typeof story.translations === 'object'
      ? story.translations
      : {};
    const mapped = translations['pt-BR'] || translations.pt_BR || translations.pt || story.ptBR || story.pt_br;
    if (!mapped || typeof mapped !== 'object' || Array.isArray(mapped)) return story;
    const result = { ...story };
    ['category', 'title', 'summary', 'dek'].forEach((field) => {
      if (typeof mapped[field] === 'string' && mapped[field].trim()) result[field] = mapped[field];
    });
    if (Array.isArray(mapped.body)) {
      result.body = mapped.body.filter((paragraph) => typeof paragraph === 'string' && paragraph.trim());
    }
    return result;
  } catch (error) {
    console.warn('Mapeamento PT-BR indisponível; mantendo o texto original da notícia.', error);
    return story;
  }
}

function withManagedEditorial(snapshot) {
  const baseNews = snapshot && Array.isArray(snapshot.news) ? snapshot.news : [];
  const managedNews = (Array.isArray(managedEditorial.news) ? managedEditorial.news : []).map((post) => ({
    id: `managed-news:${post.id}`,
    category: post.category || 'Notícia da comunidade',
    title: post.title,
    summary: post.summary,
    dek: post.summary,
    body: String(post.body || '').split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    date: post.published_at || post.created_at || '',
    loggedAt: post.created_at || '',
    sources: post.source_url ? [{ outlet: 'Fonte publicada', title: post.title, url: post.source_url }] : []
  }));
  const trackerNews = (Array.isArray(managedEditorial.tracker_updates) ? managedEditorial.tracker_updates : []).map((update) => ({
    id: `managed-tracker:${update.id}`,
    category: 'Atualização de tracker',
    title: `${update.project_name} · ${update.milestone}`,
    summary: `${update.percent}% · ${update.summary}`,
    dek: update.summary,
    body: [update.summary],
    date: update.published_at || update.created_at || '',
    loggedAt: update.created_at || '',
    sources: update.source_url ? [{ outlet: 'Fonte publicada', title: update.project_name, url: update.source_url }] : []
  }));
  return Object.assign({}, snapshot || {}, {
    news: [...managedNews, ...trackerNews, ...baseNews].map(mapNewsToPortuguese)
  });
}

async function refreshManagedEditorial() {
  if (window.location.protocol === 'file:') return;
  const response = await fetch('/api/fundraisers', { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) return;
  const payload = await response.json();
  if (!payload || payload.source !== 'database') return;
  managedEditorial = {
    news: Array.isArray(payload.news) ? payload.news : [],
    tracker_updates: Array.isArray(payload.tracker_updates) ? payload.tracker_updates : []
  };
  if (trackerData) {
    renderNews(trackerData);
    if (notificationPreferences) renderNotificationCenter(trackerData);
  }
}

function renderTrackerDetails(data) {
  const exe = data.exe;
  byId('tracker-exe').innerHTML = `
    <span class="section-kicker">${escapeHtml(t('STATUS DO EXECUTÁVEL'))}</span>
    <h2>${escapeHtml(t(exe.status))}</h2>
    <small>${escapeHtml(t('Relato registrado em:'))} ${publicationTimeMarkup(exe.releasedAt)}</small>
    <p>${escapeHtml(exe.summary)}</p>
    <p class="tracker-safety-warning"><b>${escapeHtml(t('Alerta de segurança'))}</b> ${escapeHtml(exe.safety)}</p>
    <a class="text-link" href="${escapeHtml(safeUrl(exe.source))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Ler fonte citada'))} ↗</a>`;
  byId('tracker-scout').innerHTML = `
    <span class="section-kicker">${escapeHtml(t('VIGILÂNCIA COMUNITÁRIA'))}</span>
    <h2>${escapeHtml(t('Scout e triagem'))}</h2>
    <p>${escapeHtml(exe ? data.scout.summary : '')}</p>
    <div class="tracker-tags">${data.scout.sources.map((source) => `<span>${escapeHtml(source)}</span>`).join('')}</div>
    <small>${escapeHtml(t('Última varredura'))}: ${publicationTimeMarkup(data.scout.lastRun)} · ${data.candidates} ${escapeHtml(t('candidatos aguardam confirmação'))}</small>
    ${Array.isArray(data.candidateList) && data.candidateList.length ? `<details class="tracker-candidate-list"><summary>${escapeHtml(t('Ver candidatos sem confirmação'))}</summary><ul>${data.candidateList.map((candidate) => `<li><b>${escapeHtml(candidate.repo || candidate.name)}</b><span>${escapeHtml(t(candidate.kind === 'tool' ? 'Ferramenta em triagem' : 'Possível projeto · aguarda revisão'))}</span></li>`).join('')}</ul></details>` : ''}`;
  byId('tracker-changes').innerHTML = data.changes.slice(0, 12).map((change) => `
    <article class="tracker-change panel"><span class="tracker-change-kind">${escapeHtml(t(change.kind))}</span>${publicationTimeMarkup(change.date)}<p>${escapeHtml(localizedChangeSummary(change.summary || change.text))}</p></article>`).join('');
  byId('tracker-tools').innerHTML = data.tools.map((tool) => `
    <article class="tracker-tool panel"><span class="section-kicker">${escapeHtml(t(tool.kind))}</span><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.description)}</p><a class="text-link" href="${escapeHtml(safeUrl(tool.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(tool.repo)} ↗</a></article>`).join('');
  byId('tracker-flagged').innerHTML = data.flagged.map((item) => `
    <article class="tracker-alert panel"><span class="status-badge warning">${item.count ? `${item.count} ${escapeHtml(t('itens sinalizados'))}` : escapeHtml(t('Alerta'))}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p>${item.examples.length ? `<small>${escapeHtml(t('Exemplos'))}: ${item.examples.map(escapeHtml).join(' · ')}</small>` : ''}</article>`).join('');
  const ignoredCategories = data.ignored.categories && typeof data.ignored.categories === 'object' ? data.ignored.categories : {};
  const ignoredBreakdown = [
    ['clones', 'Cópias e forks'],
    ['foraDoEscopo', 'Fora do escopo'],
    ['semReadme', 'Sem README útil'],
    ['poucoConteudo', 'Pouco conteúdo técnico'],
    ['outros', 'Outros motivos']
  ].filter(([key]) => Number(ignoredCategories[key]) > 0);
  byId('tracker-ignored').innerHTML = `<span class="section-kicker">${escapeHtml(t('TRIAGEM'))}</span><strong>${data.ignored.count} ${escapeHtml(t('itens ignorados ou não confirmados'))}</strong><p>${escapeHtml(data.ignored.summary)}</p>${ignoredBreakdown.length ? `<ul class="tracker-ignored-breakdown">${ignoredBreakdown.map(([key, label]) => `<li><span>${escapeHtml(t(label))}</span><b>${counterMarkup(ignoredCategories[key])}</b></li>`).join('')}</ul>` : ''}`;
  byId('tracker-dmca').innerHTML = data.dmca.map((item) => `
    <article class="tracker-dmca panel">${publicationTimeMarkup(item.date, 'section-kicker')}<strong>${item.repositories} ${escapeHtml(t('repositórios de GTA VI associados'))}</strong><p>${escapeHtml(item.summary)}</p><a class="text-link" href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Abrir registro público'))} ↗</a></article>`).join('');
  byId('tracker-headlines').innerHTML = data.headlines.slice(0, 12).map((headline) => `
    <article class="tracker-headline panel"><span>${escapeHtml(headline.outlet)}</span>${publicationTimeMarkup(headline.date)}<h3>${escapeHtml(headline.title)}</h3><a class="text-link" href="${escapeHtml(safeUrl(headline.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Fonte original'))} ↗</a></article>`).join('');
  byId('tracker-history').innerHTML = (Array.isArray(data.history) ? data.history : []).slice().sort((left, right) =>
    Date.parse(right.date || right.timestamp || 0) - Date.parse(left.date || left.timestamp || 0)
  ).map((entry) => `
    <article class="tracker-history-item panel">
      ${publicationTimeMarkup(entry.date || entry.timestamp, 'section-kicker')}
      <strong>${counterMarkup(entry.leader || entry.percent || 0, 'percent')}%</strong>
      <p>${escapeHtml(entry.leaderId || entry.project || entry.stage || '')}</p>
      ${entry.tracked !== undefined ? `<small>${counterMarkup(entry.tracked)} ${escapeHtml(t('projetos acompanhados'))}</small>` : ''}
    </article>`).join('');
  byId('tracker-candidates').innerHTML = (Array.isArray(data.candidates) ? data.candidates : []).map((candidate) => `
    <article class="tracker-candidate panel">
      <span class="section-kicker">${escapeHtml(t(candidate.kind || 'Candidato'))}</span>
      <h3>${escapeHtml(candidate.name || candidate.repo || 'Projeto sem nome')}</h3>
      <p>${escapeHtml(candidate.description || candidate.summary || candidate.reason || '')}</p>
      ${candidate.url || candidate.repo ? `<a class="text-link" href="${escapeHtml(safeUrl(candidate.url || (candidate.repo && /^https?:/.test(candidate.repo) ? candidate.repo : `https://github.com/${candidate.repo}`)))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Abrir candidato'))} ↗</a>` : ''}
    </article>`).join('');
  byId('tracker-updated').setAttribute('datetime', data.updatedAt || '');
  byId('tracker-updated').textContent = formatNewsDate(data.updatedAt);
  const updatedRelative = relativeNewsTime(data.updatedAt);
  byId('tracker-updated-relative').textContent = updatedRelative ? `(${updatedRelative})` : '';
  document.querySelectorAll('#tracker .tracker-content > *, #tracker .tracker-content article').forEach((element) => {
    window.KynosI18n.translateDom(element, state.language);
  });
}

function renderXclFeed(items, statusMessage) {
  xclFeedItems = Array.isArray(items) ? items : [];
  xclFeedStatusRaw = statusMessage;
  const list = byId('xcl-news-list');
  list.innerHTML = xclFeedItems.length ? xclFeedItems.map((item, index) => `
    <article class="news-card xcl-feed-card">
      <div class="news-card-top"><span class="news-category">${escapeHtml(t(item.category))}</span>${publicationTimeMarkup(item.date)}</div>
      <h3>${escapeHtml(t(item.title))}</h3><p>${escapeHtml(t(item.summary))}</p>
      <div class="xcl-feed-card-actions">
        <a class="text-link" href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Ver no GitHub'))} ↗</a>
        <button class="xcl-copy-item" type="button" data-copy-xcl-item="${index}">${escapeHtml(t('Copiar JSON'))}</button>
      </div>
    </article>`).join('') : `<p class="xcl-feed-empty">${escapeHtml(t('Nenhuma atividade do XCL disponível agora. Tente atualizar mais tarde.'))}</p>`;
  byId('xcl-feed-status').textContent = statusMessage;
  window.KynosI18n.translateDom(list, state.language);
  window.KynosI18n.translateDom(byId('xcl-feed-status'), state.language);
}

function formatFeedDate(value) {
  const formatted = formatNewsDate(value);
  const relative = relativeNewsTime(value);
  return relative ? `${formatted} (${relative})` : formatted;
}

function xclItemToNews(item) {
  return {
    date: item.date,
    category: t(item.category),
    title: t(item.title),
    summary: t(item.summary),
    url: item.url,
    linkLabel: t('Ver no GitHub')
  };
}

function readXclFeedCache() {
  try {
    const raw = localStorage.getItem(XCL_FEED_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached || !Array.isArray(cached.items) || !Number.isFinite(cached.cachedAt)) return null;
    return Date.now() - cached.cachedAt < XCL_FEED_CACHE_TTL ? cached : null;
  } catch (error) {
    console.error('Não foi possível ler o cache local do feed XCL:', error);
    return null;
  }
}

async function loadXclFallback() {
  if (window.location.protocol === 'file:') return XCL_FEED_FALLBACK;
  try {
    const fallback = await loadJson('data/xcl-feed.json');
    return Array.isArray(fallback.items) ? fallback : XCL_FEED_FALLBACK;
  } catch (error) {
    console.error('Não foi possível carregar o fallback local do feed XCL:', error);
    return XCL_FEED_FALLBACK;
  }
}

function xclEventFromCommit(commit) {
  const message = String(commit.commit && commit.commit.message || '').split('\n')[0];
  const author = commit.author && commit.author.login || commit.commit && commit.commit.author && commit.commit.author.name || 'colaborador do GitHub';
  return {
    kind: 'commit',
    date: commit.commit && commit.commit.author && commit.commit.author.date || commit.commit && commit.commit.committer && commit.commit.committer.date,
    actor: author,
    branch: '',
    title: `Novo commit: ${message || 'Atualização do código'}`,
    summary: `Enviado por ${author} · ${String(commit.sha || '').slice(0, 7)}`,
    url: commit.html_url,
    category: 'Commit'
  };
}

function xclEventFromPullRequest(pullRequest) {
  const merged = Boolean(pullRequest.merged_at);
  const status = merged ? 'Mesclado' : pullRequest.state === 'open' ? 'Aberto' : 'Fechado';
  return {
    kind: 'pull_request',
    date: pullRequest.merged_at || pullRequest.updated_at || pullRequest.created_at,
    actor: pullRequest.user && pullRequest.user.login || 'GitHub contributor',
    branch: pullRequest.head && pullRequest.head.ref || '',
    title: `Pull request ${status.toLowerCase()}: ${pullRequest.title || ''}`,
    summary: `Por ${pullRequest.user && pullRequest.user.login || 'colaborador do GitHub'} · ${pullRequest.head && pullRequest.head.ref ? `branch ${pullRequest.head.ref}` : ''}`,
    url: pullRequest.html_url,
    category: `Pull request · ${status}`
  };
}

function xclEventFromWorkflow(run) {
  const statusNames = { success: 'sucesso', failure: 'falha', cancelled: 'cancelado', skipped: 'ignorado', timed_out: 'tempo esgotado', completed: 'concluído', in_progress: 'em andamento', queued: 'na fila', waiting: 'aguardando', requested: 'solicitado', action_required: 'ação necessária', neutral: 'neutro', stale: 'desatualizado', startup_failure: 'falha na inicialização' };
  const rawStatus = run.status || 'unknown';
  const runStatus = statusNames[rawStatus] || 'desconhecido';
  const conclusion = run.conclusion ? statusNames[run.conclusion] || run.conclusion : '';
  const status = rawStatus === 'completed' && conclusion ? `${runStatus} · ${conclusion}` : runStatus;
  const details = [run.name, run.head_branch, run.event].filter(Boolean).join(' · ');
  const testedMilestone = ['D3D12.X', 'Memory', 'XGameSave'].find((name) => `${run.name || ''} ${run.display_title || ''}`.toLowerCase().includes(name.toLowerCase()));
  const title = run.display_title || run.name || 'Execução do workflow';
  return {
    kind: 'workflow',
    date: run.updated_at || run.created_at,
    actor: run.actor && run.actor.login || 'GitHub Actions',
    branch: run.head_branch || '',
    title: testedMilestone && title.toLowerCase().includes(testedMilestone.toLowerCase()) ? title : `${testedMilestone || 'Workflow'}: ${title}`,
    summary: `Status: ${status} · ${details} · Por ${run.actor && run.actor.login || 'GitHub Actions'}`,
    url: run.html_url,
    category: `Workflow · ${status}`,
    status
  };
}

async function fetchXclApi(url) {
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) {
    const error = new Error(`GitHub API ${response.status}: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function refreshXclFeed(force = false) {
  if (xclFeedLoading) return;
  xclFeedLoading = true;
  const refreshButton = byId('xcl-feed-refresh');
  refreshButton.disabled = true;
  const status = byId('xcl-feed-status');
  if (status) status.textContent = t('Carregando atividade pública do XCL…');
  if (!force) {
    const cached = readXclFeedCache();
    if (cached) {
      renderXclFeed(cached.items, `Atualizado em ${formatFeedDate(cached.updatedAt)} · cache válido por 15 minutos.`);
      xclFeedLoaded = true;
      xclFeedLoading = false;
      refreshButton.disabled = false;
      return;
    }
  }
  if (window.location.protocol === 'file:') {
    const fallback = await loadXclFallback();
    renderXclFeed(fallback.items, `A API do GitHub não está disponível via file://. Exibindo o fallback local.${fallback.items.length ? ` Atualizado em ${formatFeedDate(fallback.updatedAt)}.` : ''}`);
    xclFeedLoaded = true;
    xclFeedLoading = false;
    refreshButton.disabled = false;
    return;
  }
  try {
    const base = 'https://api.github.com/repos/ivall/xcl';
    const [workflows, commits, pullRequests] = await Promise.all([
      fetchXclApi(`${base}/actions/runs?per_page=8`),
      fetchXclApi(`${base}/commits?per_page=8`),
      fetchXclApi(`${base}/pulls?state=all&sort=updated&direction=desc&per_page=8`)
    ]);
    const items = [
      ...(Array.isArray(commits) ? commits.slice(0, 8).map(xclEventFromCommit) : []),
      ...(Array.isArray(pullRequests) ? pullRequests.slice(0, 8).map(xclEventFromPullRequest) : []),
      ...(Array.isArray(workflows.workflow_runs) ? workflows.workflow_runs.slice(0, 8).map(xclEventFromWorkflow) : [])
    ].filter((item) => item.url && item.date)
      .sort((left, right) => new Date(right.date) - new Date(left.date))
      .slice(0, 15);
    const result = { items, updatedAt: new Date().toISOString(), cachedAt: Date.now() };
    try {
      localStorage.setItem(XCL_FEED_CACHE_KEY, JSON.stringify(result));
    } catch (error) {
      console.error('Não foi possível salvar o cache local do feed XCL:', error);
    }
    renderXclFeed(items, `Fonte: API pública do GitHub · Atualizado em ${formatFeedDate(result.updatedAt)}.`);
  } catch (error) {
    console.error('Não foi possível atualizar a atividade do XCL:', error);
    const fallback = await loadXclFallback();
    const reason = error.status === 403 || error.status === 429
      ? 'Limite da API do GitHub atingido.'
      : 'Não foi possível conectar à API do GitHub.';
    renderXclFeed(fallback.items, `${reason} Exibindo o fallback local (data/xcl-feed.json).`);
  }
  xclFeedLoaded = true;
  xclFeedLoading = false;
  refreshButton.disabled = false;
}

function setupXclFeed() {
  document.querySelectorAll('[data-news-source]').forEach((button) => {
    button.addEventListener('click', () => {
      const source = button.dataset.newsSource;
      document.querySelectorAll('[data-news-source]').forEach((tab) => {
        const selected = tab === button;
        tab.classList.toggle('selected', selected);
        tab.setAttribute('aria-pressed', String(selected));
      });
      document.querySelectorAll('[data-news-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.newsPanel !== source;
      });
      trackEvent('click', source === 'xcl' ? 'Abrir atualizações automáticas XCL' : 'Abrir notícias manuais');
      if (source === 'xcl' && !xclFeedLoaded) refreshXclFeed();
    });
  });
  byId('xcl-feed-refresh').addEventListener('click', () => refreshXclFeed(true));
  byId('xcl-feed-export').addEventListener('click', () => {
    downloadJsonFile('kynosrecompvi-xcl-news.json', xclFeedItems.map(xclItemToNews));
    trackEvent('click', 'Exportar resumo JSON do XCL', { count: xclFeedItems.length });
  });
  byId('xcl-news-list').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-xcl-item]');
    if (!button) return;
    const item = xclFeedItems[Number(button.dataset.copyXclItem)];
    if (!item) return;
    try {
      await copyText(JSON.stringify(xclItemToNews(item), null, 2));
      byId('xcl-feed-status').textContent = 'Item JSON copiado.';
      window.KynosI18n.translateDom(byId('xcl-feed-status'), state.language);
      trackEvent('click', 'Copiar item JSON do XCL');
    } catch (error) {
      console.error('Não foi possível copiar o item do feed XCL:', error);
      byId('xcl-feed-status').textContent = 'Não foi possível copiar. Confira as permissões de área de transferência.';
      window.KynosI18n.translateDom(byId('xcl-feed-status'), state.language);
    }
  });
}

function serverAvatar(server) {
  return server.avatar ? `<img class="server-avatar" src="${escapeHtml(safeUrl(server.avatar))}" alt="" />` : `<span class="server-avatar">${escapeHtml(server.initials || server.name.slice(0, 1))}</span>`;
}

function renderDiscords(data) {
  const official = data.official;
  document.querySelectorAll('[data-official-link]').forEach((link) => {
    link.href = safeUrl(official.url);
    if (link.getAttribute('href') === '#') link.setAttribute('aria-disabled', 'true');
  });
  byId('official-discord').innerHTML = `<article class="official-card">${serverAvatar(official)}<div class="server-copy"><span class="section-kicker">${escapeHtml(official.badge)}</span><h3>${escapeHtml(official.name)}</h3><p>${escapeHtml(official.description)}</p></div><a class="button button-discord" href="${escapeHtml(safeUrl(official.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Entrar no Discord do XlaunchVI ↗'))}</a></article>`;
  byId('discord-list').innerHTML = data.affiliates.map((server) => `
    <article class="discord-card">
      <div class="discord-card-head">${serverAvatar(server)}<div><h3>${escapeHtml(server.name)}</h3><div class="discord-tags">${server.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('<span>·</span>')}</div></div></div>
      <p>${escapeHtml(server.description)}</p>
      <a class="button" href="${escapeHtml(safeUrl(server.url))}" target="_blank" rel="noopener noreferrer">Entrar no Discord ↗</a>
    </article>`).join('');
  applyLanguage();
}

function isSidebarMobile() {
  return window.matchMedia('(max-width: 900px)').matches;
}

function updateSidebarToggle() {
  const toggle = byId('sidebar-toggle');
  if (!toggle) return;
  const mobile = isSidebarMobile();
  const open = mobile
    ? document.body.classList.contains('sidebar-open')
    : !document.body.classList.contains('sidebar-collapsed');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', t(open
    ? (mobile ? 'Fechar navegação' : 'Recolher navegação')
    : (mobile ? 'Abrir navegação' : 'Expandir navegação')));
}

function closeSidebarDrawer() {
  document.body.classList.remove('sidebar-open');
  const nav = byId('main-navigation');
  if (nav) nav.classList.remove('open');
  updateSidebarToggle();
}

function setPage(page, updateHash = true, countVisit = true) {
  const isAnalytics = page === ANALYTICS_ROUTE;
  if (!isAnalytics && !document.querySelector(`[data-page="${page}"]`)) page = 'home';
  state.page = isAnalytics ? 'analytics' : page;
  document.querySelectorAll('.page-section').forEach((section) => section.classList.toggle('active', !isAnalytics && section.dataset.page === page));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.pageLink === page));
  closeSidebarDrawer();
  if (updateHash) history.replaceState(null, '', `#${page}`);
  if (isAnalytics) renderAnalytics();
  else if (byId('analytics-page')) byId('analytics-page').hidden = true;
  if (countVisit) {
    if (isAnalytics) trackEvent('analytics_view', 'Painel de analytics');
    else trackEvent('page_view', pageNames[page], { route: page });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function countEvents(events, predicate) {
  return events.filter(predicate).length;
}

function rankedValues(events, predicate, getValue) {
  const counts = new Map();
  events.filter(predicate).forEach((event) => {
    const value = String(getValue(event) || '').trim();
    if (value) counts.set(value, (counts.get(value) || 0) + 1);
  });
  return [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 6);
}

function renderAnalyticsBars(items, emptyLabel) {
  if (!items.length) return `<p class="analytics-empty">${escapeHtml(t(emptyLabel))}</p>`;
  const max = Math.max(...items.map((item) => item[1]), 1);
  return `<div class="analytics-bars">${items.map(([label, count]) => `
    <div class="analytics-bar-row">
      <span class="analytics-bar-label">${escapeHtml(t(label))}</span>
      <span class="analytics-track"><span style="width:${Math.round(count / max * 100)}%"></span></span>
      <span class="analytics-bar-value">${count}</span>
    </div>`).join('')}</div>`;
}

function addAnalyticsSection() {
  if (byId('analytics-page')) return byId('analytics-page');
  document.querySelector('main').insertAdjacentHTML('beforeend', `
    <section class="analytics-page" id="analytics-page">
      <a class="analytics-back" href="#home" data-page-link="home">← <span>Voltar ao site</span></a>
      <div class="analytics-heading">
        <div>
          <span class="section-kicker">KYNOS STUDIOS · LOCAL</span>
          <h1>Painel de analytics</h1>
          <p>Métricas privadas deste navegador, sem envio para servidor.</p>
        </div>
        <div class="analytics-controls">
          <button class="button button-discord" id="analytics-export" type="button">Exportar relatório JSON</button>
          <button class="button" id="analytics-import" type="button">Importar JSON</button>
          <input class="analytics-import" id="analytics-import-file" type="file" accept="application/json,.json" />
          <button class="button" id="analytics-clear" type="button">Limpar dados locais</button>
        </div>
      </div>
      <div id="analytics-content" class="analytics-grid"></div>
      <p class="analytics-status" id="analytics-status" role="status" aria-live="polite"></p>
      <p class="analytics-privacy">Os registros ficam somente no localStorage deste navegador. Não existe conta, banco de dados ou envio remoto; limpar os dados do navegador também os remove. Este painel não é uma área autenticada: o hash discreto não deve ser tratado como controle de acesso. <!-- Espaço para integrar Cloudflare Web Analytics ou Umami, se desejado. --></p>
    </section>`);
  return byId('analytics-page');
}

function renderAnalytics() {
  const section = addAnalyticsSection();
  section.hidden = false;
  const content = byId('analytics-content');
  let events;
  try {
    events = readAnalyticsEvents();
  } catch (error) {
    console.error('Não foi possível ler o analytics local:', error);
    content.innerHTML = `<article class="analytics-card analytics-span-3"><h2>${escapeHtml(t('Dados inválidos'))}</h2><p class="analytics-empty">${escapeHtml(t('O armazenamento local está corrompido. Exporte uma cópia válida ou limpe os dados para começar novamente.'))}</p></article>`;
    byId('analytics-status').textContent = error.message;
    bindAnalyticsControls();
    applyLanguage();
    return;
  }

  const visits = countEvents(events, (event) => event.type === 'page_view');
  const clicks = countEvents(events, (event) => event.type === 'click' || event.type === 'language_change');
  const simulations = countEvents(events, (event) => event.type === 'simulation');
  const pageViews = Object.entries(pageNames).map(([route, name]) => [name, countEvents(events, (event) => event.type === 'page_view' && event.page === route)]);
  const clickRanking = rankedValues(events, (event) => event.type === 'click', (event) => event.label);
  const dimensionRanking = (dimension) => rankedValues(events,
    (event) => event.type === 'hardware_selection' && event.details && event.details.dimension === dimension,
    (event) => event.details.value);
  const gpuRanking = dimensionRanking('gpu-select');
  const cpuRanking = dimensionRanking('cpu-select');
  const ramCapacity = dimensionRanking('ram-select');
  const ramGeneration = dimensionRanking('ram-generation');
  const ramChannel = dimensionRanking('ram-channel');
  const storage = dimensionRanking('storage');
  const operatingSystem = dimensionRanking('os-select');
  const background = dimensionRanking('background-select');

  content.innerHTML = `
    <article class="analytics-card"><span class="analytics-label">${escapeHtml(t('Visitas'))}</span><strong class="analytics-total">${visits}</strong></article>
    <article class="analytics-card"><span class="analytics-label">${escapeHtml(t('Interações e cliques'))}</span><strong class="analytics-total">${clicks}</strong></article>
    <article class="analytics-card"><span class="analytics-label">${escapeHtml(t('Simulações feitas'))}</span><strong class="analytics-total">${simulations}</strong></article>
    <article class="analytics-card"><h2>${escapeHtml(t('Visualizações por página'))}</h2>${renderAnalyticsBars(pageViews, 'Ainda não há visualizações.')}</article>
    <article class="analytics-card"><h2>${escapeHtml(t('Botões e links mais clicados'))}</h2>${renderAnalyticsBars(clickRanking, 'Ainda não há cliques registrados.')}</article>
    <article class="analytics-card"><h2>${escapeHtml(t('Placas de vídeo mais escolhidas'))}</h2>${renderAnalyticsBars(gpuRanking, 'Ainda não há seleções de GPU.')}</article>
    <article class="analytics-card"><h2>${escapeHtml(t('Processadores mais escolhidos'))}</h2>${renderAnalyticsBars(cpuRanking, 'Ainda não há seleções de CPU.')}</article>
    <article class="analytics-card"><h2>${escapeHtml(t('Distribuição de memória'))}</h2><span class="analytics-label">${escapeHtml(t('Capacidade (GB)'))}</span>${renderAnalyticsBars(ramCapacity, 'Ainda não há seleções de RAM.')}<span class="analytics-label">${escapeHtml(t('Geração'))}</span>${renderAnalyticsBars(ramGeneration, 'Ainda não há seleções de geração.')}<span class="analytics-label">${escapeHtml(t('Modo de canal'))}</span>${renderAnalyticsBars(ramChannel, 'Ainda não há seleções de canal.')}</article>
    <article class="analytics-card"><h2>${escapeHtml(t('Armazenamento'))}</h2>${renderAnalyticsBars(storage, 'Ainda não há seleções de armazenamento.')}</article>
    <article class="analytics-card"><h2>${escapeHtml(t('Sistema operacional'))}</h2>${renderAnalyticsBars(operatingSystem, 'Ainda não há seleções de sistema.')}<span class="analytics-label">${escapeHtml(t('Uso em segundo plano'))}</span>${renderAnalyticsBars(background, 'Ainda não há seleções de uso.')}</article>`;
  byId('analytics-status').textContent = '';
  bindAnalyticsControls();
  applyLanguage();
}

function bindAnalyticsControls() {
  const exportButton = byId('analytics-export');
  const importButton = byId('analytics-import');
  const importInput = byId('analytics-import-file');
  const clearButton = byId('analytics-clear');
  if (!exportButton || exportButton.dataset.bound) return;
  exportButton.dataset.bound = 'true';
  importButton.dataset.bound = 'true';
  clearButton.dataset.bound = 'true';
  exportButton.addEventListener('click', () => {
    try {
      const report = { version: 1, exportedAt: new Date().toISOString(), events: readAnalyticsEvents() };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kynosrecompvi-analytics-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      byId('analytics-status').textContent = t('Relatório JSON exportado.');
    } catch (error) {
      console.error('Não foi possível exportar analytics:', error);
      byId('analytics-status').textContent = t('Falha ao exportar. Confira os dados locais e tente novamente.');
    }
  });
  importButton.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const report = JSON.parse(String(reader.result));
        if (report.version !== 1 || !Array.isArray(report.events) || report.events.some((item) =>
          !item || typeof item.type !== 'string' || typeof item.label !== 'string' || typeof item.timestamp !== 'string')) {
          throw new Error(t('O JSON não contém um relatório KynosRecompVI válido.'));
        }
        const events = report.events.slice(-MAX_ANALYTICS_EVENTS);
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify({ version: 1, events }));
        renderAnalytics();
        byId('analytics-status').textContent = t('Relatório importado neste navegador.');
      } catch (error) {
        console.error('Não foi possível importar analytics:', error);
        byId('analytics-status').textContent = error instanceof SyntaxError ? t('JSON inválido. Selecione um arquivo de relatório válido.') : error.message;
      }
    };
    reader.onerror = () => {
      const error = reader.error || new Error('Falha de leitura do arquivo selecionado.');
      console.error(error);
      byId('analytics-status').textContent = t('Não foi possível ler o arquivo selecionado.');
    };
    reader.readAsText(file);
  });
  clearButton.addEventListener('click', () => {
    if (!window.confirm(t('Deseja apagar todas as métricas deste navegador?'))) return;
    try {
      localStorage.removeItem(ANALYTICS_KEY);
      renderAnalytics();
      byId('analytics-status').textContent = t('Dados locais apagados.');
    } catch (error) {
      console.error('Não foi possível limpar analytics local:', error);
      byId('analytics-status').textContent = t('Falha ao limpar os dados locais.');
    }
  });
}

function watchLiveViewers() {
  const pill = byId('watching-now');
  if (!pill || window.location.protocol === 'file:') {
    if (pill) pill.hidden = true;
    return;
  }
  const refresh = async () => {
    if (document.hidden) return;
    try {
      const response = await fetch('/api/live', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const count = Number(payload && payload.n);
      if (!Number.isInteger(count) || count < 1) {
        pill.hidden = true;
        return;
      }
      const locale = { pt: 'pt-BR', en: 'en-US', es: 'es-ES', zh: 'zh-CN' }[state.language] || 'pt-BR';
      pill.textContent = `${count.toLocaleString(locale)} ${t('assistindo agora')}`;
      pill.hidden = false;
    } catch (error) {
      pill.hidden = true;
    }
  };
  refresh();
  window.setInterval(refresh, 5 * 60_000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });
}

function setupLogoFallback() {
  const logo = document.querySelector('.brand-logo');
  const fallbackLogo = () => {
    if (logo.dataset.fallback !== 'svg') {
      logo.dataset.fallback = 'svg';
      logo.src = 'assets/logo.svg';
      return;
    }
    logo.hidden = true;
    logo.nextElementSibling.hidden = false;
  };
  logo.addEventListener('error', fallbackLogo);
  if (logo.complete && !logo.naturalWidth) fallbackLogo();
}

async function init() {
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (['pt', 'en', 'es', 'zh'].includes(savedLanguage)) state.language = savedLanguage;
  } catch (error) {
    console.error('Não foi possível ler o idioma salvo:', error);
  }
  initializeTheme();
  applyLanguage();
  setupLogoFallback();
  try {
    let data;
    if (window.location.protocol === 'file:') {
      const embedded = await ensureEmbeddedFallback();
      const localized = await loadOptionalJson('data/tracker-pt-BR.json');
      const embeddedLocalized = embedded.trackerLocalized || embedded.tracker;
      data = {
        hardware: embedded.hardware,
        discords: embedded.discords,
        tracker: mergeTrackerPayloads(
          embedded.trackerRaw || null,
          localized || embeddedLocalized,
          embedded,
          embedded.trackerKynos || null
        )
      };
    } else {
      const [hardwareData, discords, trackerSource, localized, kynosLocal] = await Promise.all([
        loadOptionalJson('data/hardware.json'),
        loadOptionalJson('data/discords.json'),
        loadTrackerSourceChain(),
        loadOptionalJson('data/tracker-pt-BR.json'),
        loadOptionalJson('data/kynostracker.json')
      ]);
      const needsEmbeddedFallback = !hardwareData || !discords
        || !localized || !Array.isArray(localized.efforts) || !Array.isArray(localized.news)
        || !kynosLocal || !Array.isArray(kynosLocal.efforts) || !Array.isArray(kynosLocal.news);
      const embedded = needsEmbeddedFallback ? await ensureEmbeddedFallback() : null;
      data = {
        hardware: hardwareData || (embedded && embedded.hardware),
        discords: discords || (embedded && embedded.discords),
        tracker: mergeTrackerPayloads(
          trackerSource.payload,
          localized,
          embedded,
          kynosLocal || (embedded && embedded.trackerKynos)
        )
      };
      data.tracker.portwatchSource.source = trackerSource.source;
    }
    if (!data || !data.hardware || !data.discords || !isTrackerPayload(data.tracker)) {
      throw new Error('Os dados do portal e os fallbacks não forneceram o conjunto mínimo para inicializar.');
    }
    hardware = data.hardware;
    trackerData = data.tracker;
    setupRaceControls();
    renderHardware();
    renderPortalHome(trackerData);
    renderTrackerProjects(trackerData);
    renderNews(trackerData);
    renderTrackerDetails(trackerData);
    renderXlaunchPage(trackerData);
    watchLiveViewers();
    setupNotificationCenter(trackerData);
    refreshManagedEditorial().catch((error) => console.warn('Conteúdo editorial gerenciado indisponível; mantendo o feed local.', error));
    if (window.location.protocol !== 'file:' && !window.__kynosManagedEditorialRefresh) {
      window.__kynosManagedEditorialRefresh = true;
      window.setInterval(() => {
        refreshManagedEditorial().catch((error) => console.warn('Não foi possível atualizar notícias gerenciadas.', error));
      }, 5 * 60 * 1000);
    }
    setupXclFeed();
    renderDiscords(data.discords);
    initAdvancedTools();
    loadSharedSetup();
    setupQuickUtilities(trackerData);
    const initialPage = window.location.hash.slice(1);
    setPage(initialPage || 'home', false);
    if (window.location.protocol !== 'file:' && !window.__kynosTrackerAutoRefresh) {
      window.__kynosTrackerAutoRefresh = true;
      const refreshTracker = async () => {
        try {
          const [source, localized, kynosLocal] = await Promise.all([
            loadTrackerSourceChain(),
            loadOptionalJson(`data/tracker-pt-BR.json?t=${Date.now()}`),
            loadOptionalJson(`data/kynostracker.json?t=${Date.now()}`)
          ]);
          if (!source.payload) return;
          const embedded = await ensureEmbeddedFallback();
          const unified = mergeTrackerPayloads(
            source.payload,
            localized,
            embedded,
            kynosLocal || embedded.trackerKynos
          );
          unified.portwatchSource.source = source.source;
          trackerData = unified;
          renderPortalHome(trackerData);
          renderTrackerProjects(trackerData);
          renderNews(trackerData);
          renderTrackerDetails(trackerData);
          renderXlaunchPage(trackerData);
          setupNotificationCenter(trackerData);
          setupQuickUtilities(trackerData);
        } catch (error) {
          console.warn('Atualização automática do tracker ignorada.', error);
        }
      };
      window.setInterval(refreshTracker, 5 * 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) refreshTracker();
      });
      window.addEventListener('focus', refreshTracker);
    }
  } catch (error) {
    console.error(error);
    document.querySelector('main').insertAdjacentHTML('afterbegin', '<p class="load-error">Não foi possível carregar os dados essenciais. Confira os arquivos da pasta data/ ou gere o fallback com scripts/build_tracker_ptbr.py.</p>');
    applyLanguage();
  }
}

document.body.addEventListener('click', (event) => {
  const brPixButton = event.target.closest('[data-br-pix]');
  if (brPixButton) {
    const status = brPixButton.closest('.br-support-actions')?.querySelector('.br-support-status');
    const originalLabel = 'Apoiar via PIX <span aria-hidden="true">♥</span>';
    copyText(brPixButton.dataset.brPix).then(() => {
      if (status) status.textContent = 'Chave PIX copiada!';
      brPixButton.textContent = 'Chave PIX copiada!';
      setTimeout(() => {
        brPixButton.innerHTML = originalLabel;
      }, 1800);
    }).catch((error) => {
      console.error('Não foi possível copiar a chave PIX:', error);
      if (status) status.textContent = 'Copie a chave pelo app do banco.';
    });
  }
  const pixCopyButton = event.target.closest('[data-copy-pix]');
  if (pixCopyButton && !pixCopyButton.disabled) {
    const pixKey = pixCopyButton.dataset.copyPix || '';
    const buttonLabel = pixCopyButton.textContent.trim();
    const status = byId('xlaunch-pix-status');
    pixCopyButton.disabled = true;
    pixCopyButton.setAttribute('aria-busy', 'true');
    copyText(pixKey).then(() => {
      if (status) status.textContent = t('Chave Pix copiada!');
      pixCopyButton.textContent = t('Chave Pix copiada!');
      trackEvent('xlaunch_pix_copy', 'Copiar chave Pix', { route: 'xlaunchvi' });
    }).catch((error) => {
      console.error('Não foi possível copiar a chave Pix:', error);
      if (status) status.textContent = t('Falha ao copiar a chave Pix.');
    }).finally(() => {
      window.setTimeout(() => {
        if (!pixCopyButton.isConnected) return;
        pixCopyButton.disabled = false;
        pixCopyButton.removeAttribute('aria-busy');
        pixCopyButton.textContent = buttonLabel;
      }, 1600);
    });
  }
  const pageLink = event.target.closest('[data-page-link]');
  if (pageLink) {
    event.preventDefault();
    setPage(pageLink.dataset.pageLink);
  }
  const tooltip = event.target.closest('.pw-milestone, .pw-project-marker');
  if (tooltip) {
    const shouldOpen = !tooltip.classList.contains('is-tooltip-open');
    document.querySelectorAll('.pw-milestone.is-tooltip-open, .pw-project-marker.is-tooltip-open').forEach((item) => item.classList.remove('is-tooltip-open'));
    tooltip.classList.toggle('is-tooltip-open', shouldOpen);
    const repositoryUrl = tooltip.dataset.repositoryUrl;
    if (repositoryUrl) {
      window.open(repositoryUrl, '_blank', 'noopener,noreferrer');
    }
  } else {
    document.querySelectorAll('.pw-milestone.is-tooltip-open, .pw-project-marker.is-tooltip-open').forEach((item) => item.classList.remove('is-tooltip-open'));
  }
  if (event.target.closest('.analytics-page')) return;
  const control = event.target.closest('[data-copy-pix], .target-option, .button-discord, .repo-links a, .news-card a, .news-feature a, .news-source-note a, .discord-card a, .official-card a, .add-server-card, .menu-toggle, .nav-link, .segmented button, .storage-choice, .tool-button, .theme-toggle, .what-if-menu summary, .what-if-options button');
  if (!control) return;
  const label = pageNames[control.dataset.pageLink]
    || control.getAttribute('data-analytics-label')
    || control.getAttribute('aria-label')
    || control.querySelector('.cta-label, .add-server-copy strong')?.innerText.trim()
    || control.innerText.trim();
  trackEvent('click', label, { href: control.href || '', action: control.dataset.analyticsAction || '' });
});
byId('language-select').addEventListener('change', (event) => setLanguage(event.target.value));
byId('sidebar-toggle').addEventListener('click', () => {
  const nav = byId('main-navigation');
  if (isSidebarMobile()) {
    const open = document.body.classList.toggle('sidebar-open');
    nav.classList.toggle('open', open);
  } else {
    document.body.classList.toggle('sidebar-collapsed');
  }
  updateSidebarToggle();
});
byId('main-navigation').addEventListener('click', (event) => {
  if (!isSidebarMobile() || !event.target.closest('a')) return;
  closeSidebarDrawer();
});
document.addEventListener('click', (event) => {
  if (!isSidebarMobile() || !document.body.classList.contains('sidebar-open')) return;
  const sidebar = byId('site-sidebar');
  const toggle = byId('sidebar-toggle');
  if (sidebar.contains(event.target) || toggle.contains(event.target)) return;
  closeSidebarDrawer();
});
document.addEventListener('keydown', (event) => {
  const toggle = byId('sidebar-toggle');
  if (event.key !== 'Escape' || !document.body.classList.contains('sidebar-open')) return;
  closeSidebarDrawer();
  toggle.focus();
});
byId('sidebar-scrim').addEventListener('click', () => {
  closeSidebarDrawer();
  byId('sidebar-toggle').focus();
});
window.addEventListener('resize', () => {
  if (!isSidebarMobile()) closeSidebarDrawer();
  else updateSidebarToggle();
});
byId('hero-clock-toggle').addEventListener('click', (event) => {
  const panel = byId('hero-race-clock');
  const collapsed = panel.classList.toggle('is-collapsed');
  event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
  event.currentTarget.setAttribute('aria-label', t(collapsed ? 'Expandir estimativa' : 'Minimizar estimativa'));
  byId('hero-clock-toggle').querySelector('.hero-clock-toggle-icon').textContent = collapsed ? '＋' : '−';
});
window.addEventListener('hashchange', () => setPage(window.location.hash.slice(1), false));
updateSidebarToggle();
init();
