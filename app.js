const state = { page: 'home', target: 2, channel: 'dual', ramGeneration: 'ddr5', language: 'pt', theme: 'dark', activeScenario: '', whatIfOriginalSetup: null };
const ANALYTICS_KEY = 'kynos-gta-vi-analytics-v1';
const LANGUAGE_KEY = 'kynos-gta-vi-language';
const ANALYTICS_ROUTE = 'kynos-analytics';
const MAX_ANALYTICS_EVENTS = 3000;
const PRESETS_KEY = 'kynos-gta-vi-presets-v1';
const NOTIFICATION_KEY = 'kynos-gta-vi-notifications-v1';
const XCL_FEED_CACHE_KEY = 'kynos-xcl-feed-v1';
const XCL_FEED_CACHE_TTL = 15 * 60 * 1000;
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
let notificationPreferences = null;
let notificationItems = [];
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
  updatedAt: '23/11/2026 · 20:57',
  sourceNote: 'Os dados são atualizados manualmente retirados do site oficial PortWatch VI.',
  overallProgress: 55,
  leaderId: 'xcl',
  milestones: [
    { percent: 0, label: 'Preparação', description: 'Projeto em fase de preparação.' },
    { percent: 25, label: 'Exe rodando', description: 'O executável inicia.', statusField: 'loads', statusValue: 1 },
    { percent: 40, label: 'Primeiro frame', description: 'O jogo apresenta o primeiro quadro.', statusField: 'boots', statusValue: 1 },
    { percent: 55, label: 'Menu principal', description: 'O menu principal é exibido.', statusField: 'menu', statusValue: 1 },
    { percent: 70, label: 'Dentro do jogo', description: 'É possível entrar no jogo.', statusField: 'ingame', statusValue: 1 },
    { percent: 85, label: '30 FPS', description: 'O jogo alcança cerca de 30 quadros por segundo.', statusField: 'fps', statusValue: 1 },
    { percent: 100, label: 'Estável', description: 'A experiência está estável.', statusField: 'stability', statusValue: 'stable' }
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
  root.querySelectorAll('[data-count-value]').forEach((element) => {
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
    const duration = 650;
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
}

function animateProgress(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('[data-progress-value]').forEach((bar) => {
    const value = Number(bar.dataset.progressValue);
    if (!Number.isFinite(value)) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    bar.style.width = reduceMotion ? `${value}%` : '0%';
    if (!reduceMotion) requestAnimationFrame(() => { bar.style.width = `${value}%`; });
  });
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

function mergeTrackerPayloads(portwatch, localized, fallback) {
  const fallbackTracker = fallback && isTrackerPayload(fallback.tracker) ? fallback.tracker : fallback;
  const fallbackPortwatch = fallback && fallback.portwatch && typeof fallback.portwatch === 'object'
    ? fallback.portwatch
    : {};
  const base = isTrackerPayload(fallbackTracker) ? fallbackTracker : {};
  const translated = isTrackerPayload(localized) ? localized : {};
  const merged = { ...base, ...translated };
  const arrayFields = ['news', 'efforts', 'tools', 'flagged', 'changes', 'headlines', 'dmca'];
  arrayFields.forEach((field) => {
    merged[field] = Array.isArray(translated[field])
      ? translated[field]
      : Array.isArray(base[field]) ? base[field] : [];
  });
  const rawUpdated = portwatch && (portwatch.updated || portwatch.updatedAt);
  const rawSynced = portwatch && portwatch.lastSyncedAt;
  const candidates = [merged.lastSyncedAt, rawSynced, merged.updatedAt, rawUpdated, fallbackPortwatch.lastSyncedAt, fallbackPortwatch.updated]
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
  merged.portwatchSource = {
    updatedAt: rawUpdated || fallbackPortwatch.updated || '',
    lastSyncedAt: rawSynced || fallbackPortwatch.lastSyncedAt || '',
    sourceFile: 'data/tracker.json'
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
  animateProgress(section);
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

function portwatchMilestone(project, milestones) {
  const projectProgress = Number(project && project.percent);
  if (Number.isFinite(projectProgress)) {
    const reached = milestones
      .filter((milestone) => progressPercent(milestone.percent) <= progressPercent(projectProgress))
      .sort((left, right) => progressPercent(right.percent) - progressPercent(left.percent))[0];
    return {
      ...(reached || milestones.find((milestone) => progressPercent(milestone.percent) === 0) || { label: 'Preparação', percent: 0 }),
      percent: progressPercent(projectProgress),
      label: project.stage || (reached && reached.label) || 'Preparação'
    };
  }
  const gta = project.gta || {};
  return milestones
    .filter((milestone) => !milestone.statusField || gta[milestone.statusField] === milestone.statusValue)
    .sort((left, right) => progressPercent(right.percent) - progressPercent(left.percent))[0]
    || milestones.find((milestone) => progressPercent(milestone.percent) === 0)
    || { percent: 0, label: 'Preparação' };
}

function portwatchProjectProgress(project, milestones) {
  return progressPercent(project && project.percent != null
    ? project.percent
    : portwatchMilestone(project, milestones).percent);
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
  if (heroCountdownTimer) {
    clearInterval(heroCountdownTimer);
    heroCountdownTimer = null;
  }

  const projection = getRaceMilestoneProjections(snapshot, leader, milestones, progress);
  const target = projection.projections[0];
  const nextMilestone = target ? target.milestone : projection.nextMilestone;
  const hasProjection = Boolean(target);
  const remaining = hasProjection ? countdownParts(target.timestamp) : null;
  const units = [
    { key: 'days', label: 'dias' },
    { key: 'hours', label: 'horas' },
    { key: 'minutes', label: 'minutos' },
    { key: 'seconds', label: 'segundos' }
  ];
  const targetDate = hasProjection ? new Date(target.timestamp).toISOString() : '';
  const status = !leader
    ? t('Ainda não há projeto ativo no snapshot.')
    : !nextMilestone
      ? t('O projeto líder já alcançou os marcos acompanhados.')
      : !hasProjection
        ? t('Faltam amostras datadas recentes do mesmo projeto para calcular a contagem.')
        : target.timestamp <= Date.now()
          ? t('A previsão passou, mas o tracker ainda não confirmou este marco.')
          : t('Contagem calculada a partir do ritmo recente registrado no tracker.');

  panel.dataset.state = hasProjection ? (target.timestamp > Date.now() ? 'active' : 'elapsed') : 'unavailable';
  panel.innerHTML = `<span class="section-kicker">${escapeHtml(t('PROJEÇÃO DA COMUNIDADE'))}</span>
    <h2>${escapeHtml(t('Tempo estimado até o próximo marco'))}</h2>
    <p class="hero-clock-target">${nextMilestone ? `${escapeHtml(t('Próximo alvo:'))} <b>${escapeHtml(t(nextMilestone.label))}</b>` : escapeHtml(t('Todos os marcos da trilha foram alcançados.'))}</p>
    <div class="hero-clock-units" aria-label="${escapeHtml(t('Contagem regressiva em dias, horas, minutos e segundos'))}" aria-live="off">
      ${units.map((unit) => `<span class="hero-clock-unit"><strong data-clock-unit="${unit.key}">${hasProjection ? counterMarkup(remaining[unit.key]) : '—'}</strong><small>${escapeHtml(t(unit.label))}</small></span>`).join('')}
    </div>
    ${hasProjection ? `<time class="hero-clock-date" datetime="${escapeHtml(targetDate)}">${escapeHtml(t('Previsão:'))} ${escapeHtml(formatNewsDate(targetDate))}</time>` : ''}
    <p class="hero-clock-status" role="status">${escapeHtml(status)}</p>
    <small class="hero-clock-disclaimer">${escapeHtml(t('Não há data oficial para PC. Esta contagem especulativa extrapola o ritmo recente da comunidade; bloqueios, bugs e derrubadas podem alterar o prazo.'))}</small>`;
  window.KynosI18n.translateDom(panel, state.language);
  if (!hasProjection) return;

  animateCounters(panel);
  if (target.timestamp > Date.now()) {
    heroCountdownTimer = setInterval(() => {
      const parts = countdownParts(target.timestamp);
      units.forEach((unit) => {
        const number = panel.querySelector(`[data-clock-unit="${unit.key}"] .count-up`);
        if (number) number.textContent = formatCounter(parts[unit.key], 'integer');
      });
      if (target.timestamp <= Date.now()) {
        const statusElement = panel.querySelector('.hero-clock-status');
        if (statusElement) statusElement.textContent = t('A previsão passou, mas o tracker ainda não confirmou este marco.');
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
  const milestones = Array.isArray(data.milestones) ? data.milestones : [];
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
  const rankedProjects = projects.filter((project) => !isInactiveProject(project)).slice()
    .sort((left, right) => portwatchProjectProgress(right, milestones) - portwatchProjectProgress(left, milestones)
      || left.name.localeCompare(right.name));
  const leaderProject = rankedProjects[0];
  const leaderMilestone = leaderProject ? portwatchMilestone(leaderProject, milestones) : null;
  const progress = leaderProject ? portwatchProjectProgress(leaderProject, milestones) : 0;
  const leader = leaderProject ? { ...leaderProject, milestone: leaderMilestone.label } : null;
  renderHeroRaceClock(snapshot, leader, milestones, progress);
  const topThree = rankedProjects.slice(0, 3);
  const topThreeAverage = topThree.length
    ? Math.round((topThree.reduce((total, project) => total + portwatchProjectProgress(project, milestones), 0) / topThree.length) * 10) / 10
    : 0;
  const latestMilestone = milestones
    .filter((milestone) => progressPercent(milestone.percent) <= progress)
    .sort((left, right) => progressPercent(right.percent) - progressPercent(left.percent))[0];
  const latestMilestoneLabel = latestMilestone ? latestMilestone.label : 'Preparação';
  const launchThreshold = milestones.find((milestone) => progressPercent(milestone.percent) > 0);
  const launchingCount = launchThreshold
    ? rankedProjects.filter((project) => portwatchProjectProgress(project, milestones) >= progressPercent(launchThreshold.percent)).length
    : 0;
  const stats = [
    { label: 'Marco mais avançado', value: leader ? leader.milestone : latestMilestoneLabel },
    { label: 'Média do top 3', markup: `${counterMarkup(topThreeAverage, 'percent')}%` },
    { label: 'Iniciam o GTA VI', markup: `${counterMarkup(launchingCount)} / ${counterMarkup(rankedProjects.length)}` },
    { label: 'Projetos acompanhados', markup: counterMarkup(projects.length) }
  ];
  const timelineProjects = rankedProjects.slice(0, 5).filter((project) => portwatchProjectProgress(project, milestones) > 0);
  const xlaunchReportProject = projects.find((project) => project.id === 'xlaunchvi' && project.teamReport);
  if (xlaunchReportProject && !timelineProjects.some((project) => project.id === xlaunchReportProject.id)) {
    timelineProjects.push(xlaunchReportProject);
  }
  const lines = timelineProjects.map((project, index) => {
    const x = portwatchProjectProgress(project, milestones) * 10;
    const lane = index;
    const y = 24 + lane * 48;
    return `<line x1="${x}" y1="${y}" x2="${x}" y2="306" /><circle cx="${x}" cy="306" r="4" />`;
  }).join('');
  const markerCards = timelineProjects.map((project, index) => {
    const projectProgress = portwatchProjectProgress(project, milestones);
    const lane = index;
    const edge = projectProgress <= 7 ? 'left' : projectProgress >= 93 ? 'right' : 'center';
    const avatar = String(project.avatar || project.name.slice(0, 2)).slice(0, 3);
    const stage = portwatchMilestone(project, milestones).label;
    const progressLabel = formatPercent(projectProgress);
    const avatarMarkup = project.avatarUrl
      ? `<span class="pw-avatar" aria-hidden="true"><img class="pw-avatar-image" width="34" height="34" src="${escapeHtml(safeUrl(project.avatarUrl))}" alt="" loading="lazy" decoding="async" /><span class="pw-avatar-fallback" hidden>${escapeHtml(avatar)}</span></span>`
      : `<span class="pw-avatar" aria-hidden="true">${escapeHtml(avatar)}</span>`;
    const reportStage = project.teamReport && localizedValue(project.teamReport, 'stage');
    const snapshotPercent = Number.isFinite(Number(project.portwatchPercent))
      ? formatPercent(project.portwatchPercent)
      : progressLabel;
    const estimateLabel = project.progressBasis === 'team-report-estimate'
      ? ` · ${t('estimativa editorial da equipe')}; ${t('snapshot GitHub/tracker')}: ${snapshotPercent}%`
      : reportStage ? ` · ${t('Relato do Discord')}: ${reportStage}; ${t('snapshot GitHub/tracker')}: ${snapshotPercent}%` : '';
    const tooltip = `${project.name}: ${progressLabel}% · ${stage}${estimateLabel}`;
    return `<button class="pw-project-marker align-${edge} ${project.teamReport ? 'pw-project-marker--xlaunch' : ''}" type="button" style="--marker-x:${projectProgress}%;--marker-lane:${lane}" data-tooltip="${escapeHtml(tooltip)}" title="${escapeHtml(tooltip)}" aria-label="${escapeHtml(tooltip)}">${avatarMarkup}</button>`;
  }).join('');
  const projectList = projects.slice()
    .sort((left, right) => Number(isInactiveProject(left)) - Number(isInactiveProject(right))
      || portwatchProjectProgress(right, milestones) - portwatchProjectProgress(left, milestones))
    .map((project) => {
      const projectProgress = portwatchProjectProgress(project, milestones);
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
      return `<li class="pw-project-progress-item ${projectProgress ? 'is-progressing' : ''} ${inactive ? 'is-inactive' : ''}">
        <span class="pw-project-list-avatar" aria-hidden="true">${avatarMarkup}</span>
        <span class="pw-project-progress-copy"><b>${escapeHtml(project.name)}</b><small>${escapeHtml(stageText)}</small></span>
        <strong>${counterMarkup(projectProgress, 'percent')}%</strong>
      </li>`;
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
  const raceIntel = snapshot ? `<div class="race-intelligence-grid">
    ${renderRaceTimeline(milestones, progress, leader)}
    ${renderRaceProjection(snapshot, leader, milestones, progress)}
    ${renderRaceReversals(snapshot, projects, leader)}
    ${renderRaceControlLog(snapshot, leader, projects)}
  </div>` : '';

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
          <svg class="pw-connectors" viewBox="0 0 1000 308" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
          ${markerCards}
          <div class="pw-progress-track" role="progressbar" aria-label="${escapeHtml(t('Progresso geral da portabilidade'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
            <span class="pw-progress-fill" data-progress-value="${progress}"></span>
          </div>
          <div class="pw-milestones">${milestoneButtons}</div>
        </div>
      </div>
      <p class="pw-scroll-hint">${escapeHtml(t('Deslize a trilha para conferir todos os marcos.'))}</p>
      <details class="pw-project-list">
        <summary><span>${escapeHtml(t('Progresso por projeto'))}</span><span class="pw-project-list-action">${escapeHtml(t('Ver progresso de todos os projetos'))} (${projects.length})</span></summary>
        <ul class="pw-project-progress-grid">${projectList}</ul>
      </details>
    </div>${raceIntel}${changeStrip}`;
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
  animateProgress(section);
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
  const efforts = snapshot && Array.isArray(snapshot.efforts) ? snapshot.efforts : [];
  const offlineProjects = efforts.filter(isInactiveProject).slice(0, 2);
  offlineProjects.forEach((project) => {
    notifications.push({
      id: `offline:${project.repo || project.id || project.name}`,
      title: `${t('Projeto fora do ar')}: ${project.name}`,
      body: t('O tracker registra este projeto como fora do ar; o motivo da remoção pode não estar confirmado.'),
      page: 'repositories',
      kind: 'warning',
      date: snapshot.updatedAt || ''
    });
  });

  if (snapshot && snapshot.exe && snapshot.exe.safety) {
    notifications.push({
      id: 'security:fake-download-warning:v1',
      title: t('Alerta de segurança'),
      body: t('Não baixe nem execute arquivos divulgados por desconhecidos; podem conter malware ou roubar senhas.'),
      page: 'tracker',
      kind: 'warning',
      date: snapshot.updatedAt || ''
    });
  }

  const activeProjects = efforts.filter((project) => !isInactiveProject(project)).slice()
    .sort((left, right) => portwatchProjectProgress(right, PORTWATCH_FALLBACK.milestones)
      - portwatchProjectProgress(left, PORTWATCH_FALLBACK.milestones));
  const leader = activeProjects[0];
  if (leader) {
    const progress = portwatchProjectProgress(leader, PORTWATCH_FALLBACK.milestones);
    const milestone = portwatchMilestone(leader, PORTWATCH_FALLBACK.milestones);
    notifications.push({
      id: `leader:${leader.repo || leader.id || leader.name}:${progress}:${milestone.label}`,
      title: t('Liderança da corrida'),
      body: `${leader.name} · ${formatPercent(progress)}% · ${t(milestone.label)}`,
      page: 'home',
      kind: 'progress',
      date: snapshot.updatedAt || ''
    });
  }

  (snapshot && Array.isArray(snapshot.news) ? snapshot.news : []).slice(0, 2).forEach((story) => {
    notifications.push({
      id: `news:${story.id || story.title}`,
      title: t('Notícia recente'),
      body: t(story.title || story.category || ''),
      page: 'news',
      kind: 'news',
      date: story.date || ''
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
  const validIds = new Set(notificationItems.map((item) => item.id));
  const currentReadIds = notificationPreferences.readIds.filter((id) => validIds.has(id));
  if (currentReadIds.length !== notificationPreferences.readIds.length) {
    notificationPreferences.readIds = currentReadIds;
    saveNotificationPreferences();
  }
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
        <a class="notification-link" href="#${escapeHtml(item.page)}" data-page-link="${escapeHtml(item.page)}" data-notification-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(t('Abrir conteúdo relacionado'))}">↗</a>
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
  notificationPreferences = loadNotificationPreferences();

  toggle.addEventListener('click', () => {
    if (panel.hidden) {
      notificationPreferences.lastViewedAt = new Date().toISOString();
      saveNotificationPreferences();
      renderNotificationCenter(snapshot);
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
    renderNotificationCenter(snapshot);
  });
  panel.addEventListener('click', (event) => {
    const link = event.target.closest('[data-notification-id]');
    if (!link) return;
    const id = link.dataset.notificationId;
    if (!notificationPreferences.readIds.includes(id)) {
      notificationPreferences.readIds.push(id);
      saveNotificationPreferences();
    }
    renderNotificationCenter(snapshot);
    closeNotificationPanel();
  });
  document.addEventListener('click', (event) => {
    if (!center.contains(event.target)) closeNotificationPanel();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closeNotificationPanel(true);
  });
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(source)) {
    const date = new Date(`${source}T12:00:00Z`);
    return `${new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)} · ${t('horário não informado')}`;
  }
  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return source || t('Data não informada');
  const formatted = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
  return `${formatted} · ${t('horário local')}`;
}

function publicationTimeMarkup(value, className = '') {
  const source = String(value || '').trim();
  const hasTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(source);
  const date = new Date(source);
  const isValid = !Number.isNaN(date.getTime());
  const datetime = isValid ? (hasTime ? date.toISOString() : source) : '';
  const title = hasTime && isValid
    ? `UTC: ${date.toISOString()}`
    : t('A fonte não informou o horário de publicação.');
  return `<time${className ? ` class="${escapeHtml(className)}"` : ''}${datetime ? ` datetime="${escapeHtml(datetime)}"` : ''} title="${escapeHtml(title)}">${escapeHtml(formatNewsDate(source))}</time>`;
}

function formatPercent(value) {
  const locale = { pt: 'pt-BR', en: 'en', es: 'es', zh: 'zh-CN' }[state.language];
  return Number(value).toLocaleString(locale, { maximumFractionDigits: 1 });
}

function renderStoryFeature(story, target) {
  target.innerHTML = `
    <div class="news-feature-content">
      <div class="news-feature-meta"><span class="news-feature-kicker">${escapeHtml(t('Manchete em destaque'))}</span><span class="news-category">${escapeHtml(t(story.category))}</span>${publicationTimeMarkup(story.date)}</div>
      <h3>${escapeHtml(story.title)}</h3>
      <p>${escapeHtml(story.summary)}</p>
      <div class="news-source-links">${(story.sources || []).map((source) => `<a class="text-link" href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(t(source.title))}">${escapeHtml(t(source.outlet))} ↗</a>`).join('')}</div>
    </div>
    <div class="news-feature-stamp" aria-hidden="true"><span>KYNOSRECOMPVI</span><strong>LEONIDA</strong><small>${escapeHtml(formatNewsDate(story.date))}</small></div>`;
  window.KynosI18n.translateDom(target, state.language);
}

function renderStoryCard(story, featured = false) {
  return `<article class="news-card ${featured ? 'news-card--featured' : ''}">
    <div class="news-card-top"><span class="news-category">${escapeHtml(t(story.category))}</span>${publicationTimeMarkup(story.date)}</div>
    <h3>${escapeHtml(localizedValue(story, 'title') || story.title)}</h3>
    <p>${escapeHtml(localizedValue(story, 'summary') || story.summary)}</p>
    ${story.loggedAt ? `<p class="news-card-recorded">${escapeHtml(t('Registro editorial no portal:'))} ${publicationTimeMarkup(story.loggedAt)}</p>` : ''}
    <div class="news-source-links">${(story.sources || []).map((source) => `<a class="text-link" href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(t(source.title))}">${escapeHtml(t(source.outlet))} ↗</a>`).join('')}</div>
  </article>`;
}

function homeProjectStory(project, rank, date) {
  const percent = formatPercent(project.percent);
  const stage = t(project.stage);
  const copy = {
    pt: {
      category: 'Snapshot do tracker',
      title: `#${rank} · ${project.name} no acompanhamento`,
      summary: `O snapshot de ${date} registra ${project.name} em ${percent}% no marco “${stage}”. Percentual editorial do tracker; o avanço não foi verificado de forma independente.`
    },
    en: {
      category: 'Tracker snapshot',
      title: `#${rank} · ${project.name} in the tracker`,
      summary: `The ${date} snapshot records ${project.name} at ${percent}% at the “${stage}” milestone. This is the tracker’s editorial estimate; progress has not been independently verified.`
    },
    es: {
      category: 'Snapshot del tracker',
      title: `#${rank} · ${project.name} en el seguimiento`,
      summary: `El snapshot del ${date} registra ${project.name} con un ${percent}% en el hito “${stage}”. Es una estimación editorial del tracker; el avance no se ha verificado de forma independiente.`
    },
    zh: {
      category: '跟踪器快照',
      title: `第 ${rank} 名 · ${project.name} 跟踪进度`,
      summary: `${date} 的快照记录 ${project.name} 在“${stage}”里程碑达到 ${percent}%。这是跟踪器的编辑估值，进度尚未经过独立验证。`
    }
  };
  const localized = copy[state.language] || copy.pt;
  return {
    id: `tracker-${project.id}`,
    date: trackerData && trackerData.updatedAt || '',
    category: localized.category,
    title: localized.title,
    summary: localized.summary,
    sources: project.url ? [{ outlet: state.language === 'en' ? 'Repository' : state.language === 'es' ? 'Repositorio' : state.language === 'zh' ? '代码库' : 'Repositório', title: project.repo || project.name, url: project.url }] : []
  };
}

function renderXlaunchSpotlight(project, team, snapshot, modifier = '') {
  if (!project) return '';
  const report = project.teamReport || (team && team.latestReport);
  if (!report) return '';
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
    <div class="xlaunch-spotlight-progress">
      <div class="progress-label"><span>${escapeHtml(t('Estimativa editorial baseada em relato'))}</span><strong>${counterMarkup(percent, 'percent')}%</strong></div>
      <div class="progress-track" role="progressbar" aria-label="${escapeHtml(`${project.name}: ${formatPercent(percent)}% de estimativa editorial`)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span data-progress-value="${percent}"></span></div>
    </div>
    <p class="xlaunch-spotlight-check">${escapeHtml(t('Snapshot PortWatch/GitHub:'))} ${formatPercent(project.portwatchPercent)}%${snapshotDate ? ` · ${escapeHtml(formatNewsDate(snapshotDate))}` : ''}</p>
    ${checkMessage ? `<p class="xlaunch-spotlight-check">${escapeHtml(checkMessage)}${checkDate ? ` · ${escapeHtml(formatNewsDate(checkDate))}` : ''}</p>` : ''}
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
  const lead = data.news.find((story) => story.id === '2026-11-23-leonida-nuked') || data.news[0];
  if (lead) renderStoryFeature(lead, byId('home-feature'));
  const projects = data.efforts.filter((project) => project.status !== 'offline')
    .slice().sort((left, right) => right.percent - left.percent || left.name.localeCompare(right.name));
  const assignedStories = new Set(lead ? [lead] : []);
  const teamReportStory = data.news.find((story) => story.id === 'xlaunchvi-loading-screen-team-report');
  if (teamReportStory) assignedStories.add(teamReportStory);
  const latestProjects = projects.filter((project) => project.id !== 'xlaunchvi').slice(0, teamReportStory ? 2 : 3);
  const latest = [
    ...(teamReportStory ? [teamReportStory] : []),
    ...latestProjects.map((project, index) => {
    const projectName = normalizeHardwareSearch(project.name);
    const projectRepo = normalizeHardwareSearch(project.repo || '');
    const matchingStory = data.news.find((story) => {
      if (assignedStories.has(story)) return false;
      const storyContent = normalizeHardwareSearch([
        story.title,
        story.summary,
        ...(story.sources || []).map((source) => `${source.url || ''} ${source.title || ''}`)
      ].join(' '));
      return (projectName && storyContent.includes(projectName))
        || (projectRepo && storyContent.includes(projectRepo));
    });
    if (matchingStory) {
      assignedStories.add(matchingStory);
      return matchingStory;
    }
    return homeProjectStory(project, index + 1, formatNewsDate(data.updatedAt));
    })
  ];
  byId('home-news-list').innerHTML = latest.map((story) => renderStoryCard(story)).join('');
  window.KynosI18n.translateDom(byId('home-news-list'), state.language);

  const leader = projects[0];
  renderPortwatchProgress(PORTWATCH_FALLBACK, data);
  const xlaunch = data.efforts.find((project) => project.id === 'xlaunchvi');
  const xlaunchTeam = data.teams && data.teams.xlaunchvi;
  const owner = leader && leader.repo ? leader.repo.split('/')[0] : '';
  const avatarUrl = /^[\w-]+$/.test(owner) ? `https://github.com/${encodeURIComponent(owner)}.png?size=96` : '';
  const initials = leader ? leader.name.slice(0, 2).toUpperCase() : '—';
  byId('home-progress-summary').innerHTML = leader ? `
    <article class="home-leader">
      <div class="home-leader-heading">
        <div class="home-leader-identity">
          <span class="home-leader-avatar">${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="" loading="lazy" decoding="async">` : ''}<span class="home-leader-avatar-fallback" ${avatarUrl ? 'hidden' : ''}>${escapeHtml(initials)}</span></span>
          <div><span class="section-kicker">${escapeHtml(t('Projeto mais avançado'))}</span><h3>${escapeHtml(leader.name)}</h3><span class="repo-slug">${escapeHtml(leader.repo)}</span></div>
        </div>
        <strong class="home-leader-percent">${counterMarkup(leader.percent, 'percent')}%</strong>
      </div>
      <div class="home-leader-progress" role="progressbar" aria-label="${escapeHtml(`${leader.name}: ${formatPercent(leader.percent)}%`)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Number(leader.percent) || 0}"><span data-progress-value="${Number(leader.percent) || 0}"></span></div>
      <div class="home-leader-milestone"><span>${escapeHtml(t('Marco atual'))}</span><strong>${escapeHtml(t(leader.stage))}</strong></div>
      <p class="home-leader-verification">${escapeHtml(leader.verification)}</p>
      ${leader.url ? `<a class="text-link" href="${escapeHtml(safeUrl(leader.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Repositório original'))} ↗</a>` : ''}
    </article>
    ${renderXlaunchSpotlight(xlaunch, xlaunchTeam, data, 'xlaunch-spotlight--home')}
    <p class="tracker-data-note">${escapeHtml(t('Relatos autodeclarados; percentuais conforme o snapshot do tracker.'))}</p>` : `<p>${escapeHtml(t('Sem dados de projetos'))}</p>`;
  window.KynosI18n.translateDom(byId('home-progress-summary'), state.language);
  attachAvatarFallbacks(byId('home-progress-summary'));
  animateCounters(byId('home-progress-summary'));
  animateProgress(byId('home-progress-summary'));
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
    ${repositoryWarning ? `<p class="xlaunch-repository-warning xlaunch-repository-warning--report">${escapeHtml(repositoryWarning)}${repositoryAssessedAt ? ` · ${escapeHtml(t('Verificado em'))} ${escapeHtml(formatNewsDate(repositoryAssessedAt))}` : ''}</p>` : ''}
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
          ${estimatedFromTeam ? `<div><span>${escapeHtml(t('Snapshot PortWatch/GitHub'))}</span><strong>${formatPercent(project.portwatchPercent)}%</strong></div>` : ''}
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
  const badge = inactive ? t('Fora do ar') : `${counterMarkup(project.percent, 'percent')}% · ${t(project.stage)}`;
  const stats = [
    project.stars != null ? `${counterMarkup(project.stars)} ${escapeHtml(t('estrelas'))}` : '',
    project.forks != null ? `${counterMarkup(project.forks)} ${escapeHtml(t('forks'))}` : ''
  ].filter(Boolean).join(' · ');
  return `<article class="repo-card tracker-project-card ${inactive ? 'repo-card--inactive' : ''} ${featured ? 'tracker-project--featured' : ''}">
    <div class="rank-badge ${inactive ? 'inactive-badge' : ''}">${inactive ? t('FORA') : `#${rank}`}</div>
    <div class="repo-main">
      <div class="repo-title-row"><div><h3>${escapeHtml(project.name)}</h3><span class="repo-slug">${escapeHtml(project.repo)}</span></div></div>
      <div class="badge-row"><span class="status-badge ${featured || inactive ? 'warning' : 'accent'}">${featured ? escapeHtml(t('Projeto mais avançado')) : badge}</span><span class="status-badge">${escapeHtml(t(project.tier === 'tracked' ? 'Projeto acompanhado' : 'Em observação'))}</span><span class="status-badge">${escapeHtml(t('Relato não verificado independentemente'))}</span></div>
      <p class="repo-description">${escapeHtml(project.summary)}</p>
      ${inactive ? `<p class="repo-inactive-note">${escapeHtml(t('Registro histórico: fora do ar e excluído do ranking ativo.'))}</p>` : ''}
      ${stats ? `<p class="repo-author">${escapeHtml(stats)} · ${escapeHtml(t('snapshot, não ao vivo'))}</p>` : ''}
      <div class="repo-links">${project.url ? `<a class="button primary-link" href="${escapeHtml(safeUrl(project.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Repositório original'))} ↗</a>` : ''}</div>
    </div>
    <div class="repo-progress">
    <div class="progress-label"><span>${escapeHtml(t(inactive ? 'Último marco' : 'Marco atual'))} · ${escapeHtml(t(project.stage))}</span><b>${counterMarkup(project.percent, 'percent')}%</b></div>
    <div class="progress-track" role="progressbar" aria-label="${escapeHtml(`${project.name}: ${formatPercent(project.percent)}%`)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${project.percent}"><span data-progress-value="${Number(project.percent) || 0}"></span></div>
      <small>${escapeHtml(project.verification)} · ${escapeHtml(t('Leitura do snapshot:'))} ${escapeHtml(formatNewsDate(trackerData && trackerData.updatedAt))}</small>
    </div>
  </article>`;
}

function renderTrackerProjects(data) {
  const projects = data.efforts.slice().sort((left, right) => right.percent - left.percent || left.name.localeCompare(right.name));
  const active = projects.filter((project) => project.status !== 'offline');
  const inactive = projects.filter((project) => project.status === 'offline');
  const top = active.slice(0, 5);
  const leader = active[0];
  const runnerUp = active[1];
  const xlaunch = active.find((project) => project.id === 'xlaunchvi');
  const xlaunchTeam = data.teams && data.teams.xlaunchvi;
  byId('repo-count').innerHTML = counterMarkup(active.length);
  byId('tracker-race-summary').innerHTML = `
    <article class="panel race-summary-card race-summary-card--featured"><span class="section-kicker">${escapeHtml(t('Projeto mais avançado'))}</span><strong>${leader ? `${escapeHtml(leader.name)} · ${counterMarkup(leader.percent, 'percent')}%` : '—'}</strong><p>${leader ? escapeHtml(t(leader.stage)) : escapeHtml(t('Sem dados de projetos'))}</p></article>
    <article class="panel race-summary-card"><span class="section-kicker">${escapeHtml(t('Segundo projeto ativo'))}</span><strong>${runnerUp ? `${escapeHtml(runnerUp.name)} · ${counterMarkup(runnerUp.percent, 'percent')}%` : '—'}</strong><p>${runnerUp ? escapeHtml(t(runnerUp.stage)) : ''}</p></article>
    <article class="panel race-summary-card"><span class="section-kicker">${escapeHtml(t('Projetos acompanhados'))}</span><strong>${counterMarkup(projects.length)}</strong><p>${inactive.length} ${escapeHtml(t('fora do ar, sem contar no ranking ativo'))}</p></article>`;
  byId('repository-list').innerHTML = top.map((project, index) => renderTrackerProjectCard(project, index + 1, leader && leader.id)).join('');
  byId('xlaunch-race-spotlight').innerHTML = renderXlaunchSpotlight(xlaunch, xlaunchTeam, data, 'xlaunch-spotlight--repositories');
  byId('tracker-all-projects').innerHTML = active.slice(top.length).map((project, index) => renderTrackerProjectCard(project, top.length + index + 1, leader && leader.id)).join('');
  byId('tracked-project-count').textContent = `${active.length - top.length} ${t('outros projetos')}`;
  byId('inactive-repositories').hidden = inactive.length === 0;
  byId('inactive-repository-list').innerHTML = inactive.map((project) => renderTrackerProjectCard(project, 0, leader && leader.id)).join('');
  window.KynosI18n.translateDom(byId('tracker-race-summary'), state.language);
  window.KynosI18n.translateDom(byId('repository-list'), state.language);
  window.KynosI18n.translateDom(byId('xlaunch-race-spotlight'), state.language);
  window.KynosI18n.translateDom(byId('tracker-all-projects'), state.language);
  window.KynosI18n.translateDom(byId('inactive-repositories'), state.language);
  attachAvatarFallbacks(byId('xlaunch-race-spotlight'));
  animateCounters(byId('tracker-race-summary'));
  animateCounters(byId('repository-list'));
  animateCounters(byId('xlaunch-race-spotlight'));
  animateCounters(byId('tracker-all-projects'));
  animateCounters(byId('inactive-repositories'));
  animateProgress(byId('repository-list'));
  animateProgress(byId('xlaunch-race-spotlight'));
  animateProgress(byId('tracker-all-projects'));
  animateProgress(byId('inactive-repositories'));
}

function renderNews(data) {
  const headline = data.news.find((story) => story.id === '2026-11-23-leonida-nuked') || data.news[0];
  const sourceNote = t('Notícias traduzidas e relatos de equipe em PT-BR; confira fontes e rótulos de verificação em cada item.');
  byId('news-source-note').innerHTML = `${escapeHtml(sourceNote)} <span>· ${escapeHtml(t('Atualizado em'))} ${escapeHtml(formatNewsDate(data.lastSyncedAt || data.updatedAt))} ·</span> <a href="data/tracker-pt-BR.json" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Dados localizados'))} ↗</a>`;
  if (headline) renderStoryFeature(headline, byId('news-feature'));
  byId('news-list').innerHTML = data.news.filter((story) => story !== headline).map((story) => renderStoryCard(story)).join('');
  window.KynosI18n.translateDom(byId('news-source-note'), state.language);
  window.KynosI18n.translateDom(byId('news-list'), state.language);
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
    <small>${escapeHtml(t('Última varredura'))}: ${publicationTimeMarkup(data.scout.lastRun)} · ${data.candidates} ${escapeHtml(t('novos candidatos aguardam confirmação'))}</small>`;
  byId('tracker-changes').innerHTML = data.changes.slice().reverse().map((change) => `
    <article class="tracker-change panel"><span class="tracker-change-kind">${escapeHtml(t(change.kind))}</span>${publicationTimeMarkup(change.date)}<p>${escapeHtml(change.summary)}</p></article>`).join('');
  byId('tracker-tools').innerHTML = data.tools.map((tool) => `
    <article class="tracker-tool panel"><span class="section-kicker">${escapeHtml(t(tool.kind))}</span><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.description)}</p><a class="text-link" href="${escapeHtml(safeUrl(tool.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(tool.repo)} ↗</a></article>`).join('');
  byId('tracker-flagged').innerHTML = data.flagged.map((item) => `
    <article class="tracker-alert panel"><span class="status-badge warning">${item.count ? `${item.count} ${escapeHtml(t('itens sinalizados'))}` : escapeHtml(t('Alerta'))}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p>${item.examples.length ? `<small>${escapeHtml(t('Exemplos'))}: ${item.examples.map(escapeHtml).join(' · ')}</small>` : ''}</article>`).join('');
  byId('tracker-ignored').innerHTML = `<span class="section-kicker">${escapeHtml(t('TRIAGEM'))}</span><strong>${data.ignored.count} ${escapeHtml(t('itens ignorados ou não confirmados'))}</strong><p>${escapeHtml(data.ignored.summary)}</p>`;
  byId('tracker-dmca').innerHTML = data.dmca.map((item) => `
    <article class="tracker-dmca panel">${publicationTimeMarkup(item.date, 'section-kicker')}<strong>${item.repositories} ${escapeHtml(t('repositórios de GTA VI associados'))}</strong><p>${escapeHtml(item.summary)}</p><a class="text-link" href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Abrir registro público'))} ↗</a></article>`).join('');
  byId('tracker-headlines').innerHTML = data.headlines.slice(0, 12).map((headline) => `
    <article class="tracker-headline panel"><span>${escapeHtml(headline.outlet)}</span>${publicationTimeMarkup(headline.date)}<h3>${escapeHtml(headline.title)}</h3><a class="text-link" href="${escapeHtml(safeUrl(headline.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Fonte original'))} ↗</a></article>`).join('');
  byId('tracker-updated').setAttribute('datetime', data.updatedAt || '');
  byId('tracker-updated').textContent = formatNewsDate(data.updatedAt);
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
  return formatNewsDate(value);
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

function setPage(page, updateHash = true, countVisit = true) {
  const isAnalytics = page === ANALYTICS_ROUTE;
  if (!isAnalytics && !document.querySelector(`[data-page="${page}"]`)) page = 'home';
  state.page = isAnalytics ? 'analytics' : page;
  document.querySelectorAll('.page-section').forEach((section) => section.classList.toggle('active', !isAnalytics && section.dataset.page === page));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.pageLink === page));
  document.querySelector('.main-nav').classList.remove('open');
  const navMore = document.querySelector('.nav-more');
  if (navMore) {
    navMore.open = false;
    navMore.classList.toggle('has-active', page === 'tracker' || page === 'discord');
  }
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
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
      data = {
        hardware: embedded.hardware,
        discords: embedded.discords,
        tracker: mergeTrackerPayloads(null, embedded.tracker, embedded)
      };
    } else {
      const [hardwareData, discords, portwatch, localized] = await Promise.all([
        loadOptionalJson('data/hardware.json'),
        loadOptionalJson('data/discords.json'),
        loadOptionalJson('data/tracker.json'),
        loadOptionalJson('data/tracker-pt-BR.json')
      ]);
      const needsEmbeddedFallback = !hardwareData || !discords
        || !localized || !Array.isArray(localized.efforts) || !Array.isArray(localized.news);
      const embedded = needsEmbeddedFallback ? await ensureEmbeddedFallback() : null;
      data = {
        hardware: hardwareData || (embedded && embedded.hardware),
        discords: discords || (embedded && embedded.discords),
        tracker: mergeTrackerPayloads(portwatch, localized, embedded)
      };
    }
    if (!data || !data.hardware || !data.discords || !isTrackerPayload(data.tracker)) {
      throw new Error('Os dados do portal e os fallbacks não forneceram o conjunto mínimo para inicializar.');
    }
    hardware = data.hardware;
    trackerData = data.tracker;
    renderHardware();
    renderPortalHome(trackerData);
    renderTrackerProjects(trackerData);
    renderNews(trackerData);
    renderTrackerDetails(trackerData);
    renderXlaunchPage(trackerData);
    setupNotificationCenter(trackerData);
    setupXclFeed();
    renderDiscords(data.discords);
    initAdvancedTools();
    loadSharedSetup();
    setupQuickUtilities(trackerData);
    const initialPage = window.location.hash.slice(1);
    setPage(initialPage || 'home', false);
  } catch (error) {
    console.error(error);
    document.querySelector('main').insertAdjacentHTML('afterbegin', '<p class="load-error">Não foi possível carregar os dados essenciais. Confira os arquivos da pasta data/ ou gere o fallback com scripts/build_tracker_ptbr.py.</p>');
    applyLanguage();
  }
}

document.body.addEventListener('click', (event) => {
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
document.querySelector('.menu-toggle').addEventListener('click', (event) => {
  const open = document.querySelector('.main-nav').classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
});
window.addEventListener('hashchange', () => setPage(window.location.hash.slice(1), false));
init();
