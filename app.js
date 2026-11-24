const state = { page: 'home', target: 2, channel: 'dual', ramGeneration: 'ddr5', language: 'pt', theme: 'dark', activeScenario: '', whatIfOriginalSetup: null };
const ANALYTICS_KEY = 'kynos-gta-vi-analytics-v1';
const LANGUAGE_KEY = 'kynos-gta-vi-language';
const ANALYTICS_ROUTE = 'kynos-analytics';
const MAX_ANALYTICS_EVENTS = 3000;
const PRESETS_KEY = 'kynos-gta-vi-presets-v1';
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

const pageNames = {
  home: 'Início',
  utility: 'Meu PC Roda GTAVI',
  repositories: 'Corrida dos projetos',
  news: 'Notícias',
  tracker: 'Monitoramento',
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
  applyLanguage();
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
    : t('Nenhum modelo encontrado. A seleção atual foi mantida.');
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
  const target = hardware.targets[Number(setup.target)];
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
    return `<div class="factor-row"><span class="factor-label">${escapeHtml(factor.label)}</span><div class="factor-track"><div class="factor-fill" style="width:${Math.min(percent, 100)}%"></div></div><span class="factor-value">${percent}%</span></div>`;
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
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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

function shareCurrentSetup() {
  const url = new URL(window.location.href);
  url.hash = 'home';
  url.searchParams.set('pc', JSON.stringify(readSetup()));
  return url.toString();
}

function scenarioSetup(scenario, original) {
  const setup = { ...original };
  if (scenario === 'dual') setup.channel = 'dual';
  else if (scenario === 'nvme4') setup.storageId = 'nvme4';
  else if (scenario === 'optimized') {
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
    dual: 'E se ativar canal duplo?',
    nvme4: 'E se usar SSD NVMe Gen 4?',
    optimized: 'E se fechar apps e otimizar o SO?',
    'ram-up': 'E se aumentar a RAM?',
    'ram-down': 'E se reduzir a RAM?'
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
  byId('theme-toggle').addEventListener('click', () => updateTheme(state.theme === 'dark' ? 'light' : 'dark'));
  byId('scenario-restore').addEventListener('click', restoreScenario);
  document.querySelector('.what-if-options').addEventListener('click', (event) => {
    const button = event.target.closest('[data-scenario]');
    if (!button) return;
    try {
      runWhatIf(button.dataset.scenario);
      setToolStatus(t('Simulação temporária aplicada.'));
      button.closest('details').open = false;
    } catch (error) {
      console.error('Não foi possível aplicar o cenário:', error);
      setToolStatus(error.message);
    }
  });
}

function progressPercent(value) {
  const percent = Number(value);
  return Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
}

function portwatchMilestone(project, milestones) {
  const gta = project.gta || {};
  return milestones
    .filter((milestone) => !milestone.statusField || gta[milestone.statusField] === milestone.statusValue)
    .sort((left, right) => progressPercent(right.percent) - progressPercent(left.percent))[0]
    || milestones.find((milestone) => progressPercent(milestone.percent) === 0)
    || { percent: 0, label: 'Preparação' };
}

function portwatchProjectProgress(project, milestones) {
  return progressPercent(portwatchMilestone(project, milestones).percent);
}

function isInactiveProject(project) {
  const status = String(project && project.status || '').toLowerCase();
  return ['nuked', 'down', 'takedown', 'removed', 'offline', 'closed', 'archived'].includes(status)
    || Boolean(project && (project.nuked || project.removed || project.takedown));
}

function renderPortwatchProgress(data) {
  const section = byId('portwatch-progress');
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const milestones = Array.isArray(data.milestones) ? data.milestones : [];
  const rankedProjects = projects.filter((project) => !isInactiveProject(project)).slice()
    .sort((left, right) => portwatchProjectProgress(right, milestones) - portwatchProjectProgress(left, milestones));
  const leaderProject = projects.find((project) => project.id === data.leaderId && !isInactiveProject(project)) || rankedProjects[0];
  const leaderMilestone = leaderProject ? portwatchMilestone(leaderProject, milestones) : null;
  const progress = progressPercent(data.overallProgress ?? (leaderProject ? leaderMilestone.percent : 0));
  const leader = leaderProject ? { ...leaderProject, milestone: leaderMilestone.label } : null;
  const topThree = rankedProjects.slice(0, 3);
  const topThreeAverage = topThree.length
    ? Math.round(topThree.reduce((total, project) => total + portwatchProjectProgress(project, milestones), 0) / topThree.length)
    : 0;
  const latestMilestone = milestones
    .filter((milestone) => progressPercent(milestone.percent) <= progress)
    .sort((left, right) => progressPercent(right.percent) - progressPercent(left.percent))[0];
  const latestMilestoneLabel = latestMilestone ? latestMilestone.label : 'Preparação';
  const providedStats = data.stats || {};
  const stats = [
    { label: 'Marco mais avançado', value: providedStats.furthestMilestone || latestMilestoneLabel },
    { label: 'Média do top 3', value: providedStats.top3Average || `${topThreeAverage}%` },
    { label: 'Iniciam o GTA VI', value: providedStats.launchesCount || `${projects.filter((project) => Number(project.gta && project.gta.menu) > 0).length} / ${projects.length}` },
    { label: 'Projetos acompanhados', value: providedStats.trackedProjects || projects.length }
  ];
  const timelineProjects = rankedProjects.filter((project) => portwatchProjectProgress(project, milestones) > 0);
  const lines = timelineProjects.map((project, index) => {
    const x = portwatchProjectProgress(project, milestones) * 10;
    const lane = Math.max(0, Math.min(5, index));
    const y = 19 + lane * 40;
    return `<line x1="${x}" y1="${y}" x2="${x}" y2="248" /><circle cx="${x}" cy="248" r="3.5" />`;
  }).join('');
  const markerCards = timelineProjects.map((project, index) => {
    const projectProgress = portwatchProjectProgress(project, milestones);
    const lane = Math.max(0, Math.min(5, index));
    const edge = projectProgress <= 7 ? 'left' : projectProgress >= 93 ? 'right' : 'center';
    const avatar = String(project.avatar || project.name.slice(0, 2)).slice(0, 3);
    const stage = portwatchMilestone(project, milestones).label;
    const progressLabel = Number.isInteger(projectProgress) ? String(projectProgress) : projectProgress.toLocaleString('pt-BR');
    const avatarMarkup = project.avatarUrl
      ? `<span class="pw-avatar" aria-hidden="true"><img class="pw-avatar-image" width="26" height="26" src="${escapeHtml(safeUrl(project.avatarUrl))}" alt="" /><span class="pw-avatar-fallback" hidden>${escapeHtml(avatar)}</span></span>`
      : `<span class="pw-avatar" aria-hidden="true">${escapeHtml(avatar)}</span>`;
    return `<button class="pw-project-marker align-${edge}" type="button" style="--marker-x:${projectProgress}%;--marker-lane:${lane}" data-tooltip="${escapeHtml(`${project.name}: ${progressLabel}% · ${stage}`)}" title="${escapeHtml(`${project.name}: ${progressLabel}% · ${stage}`)}" aria-label="${escapeHtml(`${project.name}, ${progressLabel}%, marco: ${stage}`)}">
      ${avatarMarkup}
      <span class="pw-project-marker-copy"><b>${escapeHtml(project.name)}</b><small>${projectProgress}% · ${escapeHtml(stage)}</small></span>
    </button>`;
  }).join('');
  const projectList = projects.slice()
    .sort((left, right) => Number(isInactiveProject(left)) - Number(isInactiveProject(right))
      || portwatchProjectProgress(right, milestones) - portwatchProjectProgress(left, milestones))
    .map((project) => {
      const projectProgress = portwatchProjectProgress(project, milestones);
      const stage = portwatchMilestone(project, milestones).label;
      const avatar = String(project.avatar || project.name.slice(0, 2)).slice(0, 3);
      const inactive = isInactiveProject(project);
      const stageText = inactive
        ? `${t('Fora do ranking ativo')} · ${t('Último marco')}: ${t(stage)}`
        : `${projectProgress}% · ${t(stage)}`;
      return `<li class="pw-project-progress-item ${projectProgress ? 'is-progressing' : ''} ${inactive ? 'is-inactive' : ''}">
        <span class="pw-project-list-avatar" aria-hidden="true">${escapeHtml(avatar)}</span>
        <span class="pw-project-progress-copy"><b>${escapeHtml(project.name)}</b><small>${escapeHtml(stageText)}</small></span>
        <strong>${projectProgress}%</strong>
      </li>`;
    }).join('');
  const milestoneButtons = milestones.map((milestone) => {
    const milestoneProgress = progressPercent(milestone.percent);
    const isReached = milestoneProgress <= progress;
    const label = String(milestone.label || '');
    const tooltip = `${label}: ${milestone.description || ''}`;
    return `<button class="pw-milestone ${isReached ? 'reached' : ''} ${milestoneProgress === progress ? 'current' : ''}" type="button" style="--milestone-x:${milestoneProgress}%" data-tooltip="${escapeHtml(tooltip)}" title="${escapeHtml(tooltip)}" aria-label="${escapeHtml(`${milestoneProgress}% ${label}. ${milestone.description || ''}`)}" ${milestoneProgress === progress ? 'aria-current="step"' : ''}>
      <b>${milestoneProgress}%</b><span>${escapeHtml(label)}</span>
    </button>`;
  }).join('');

  const sourceNotice = `<p class="pw-data-note">${escapeHtml(data.sourceNote || 'Os dados são atualizados manualmente retirados do site oficial PortWatch VI.')} <small>Atualizado em ${escapeHtml(data.updatedAt || '—')} · <code>data/portwatch-progress.json</code> · sem sincronização automática.</small></p>`;
  
  section.setAttribute('aria-busy', 'false');
  section.innerHTML = `
    <div class="pw-panel panel" id="overall">
      <div class="pw-overview">
        <div class="pw-overview-main">
          <span class="section-kicker">PROGRESSO GERAL · PROJETO MAIS PERTO DE SER JOGÁVEL</span>
          <h2 id="portwatch-title">Acompanhamento da <span>portabilidade.</span></h2>
          <div class="pw-headline">
            <strong class="pw-overall-value">${Math.round(progress)}<span>%</span></strong>
            <p><b>Líder:</b> ${leader ? `${escapeHtml(leader.name)}${leader.author ? ` <span>de</span> ${escapeHtml(leader.author)}` : ''}<span>.</span> <span>Chegou a</span> “${escapeHtml(leader.milestone || latestMilestoneLabel)}”<span>.</span>` : 'Ainda sem projetos.'}</p>
          </div>
          ${sourceNotice}
        </div>
        <div class="pw-stats">${stats.map((stat) => `<article class="pw-stat"><span>${escapeHtml(stat.label)}</span><strong>${escapeHtml(stat.value)}</strong></article>`).join('')}</div>
      </div>
      <div class="pw-divider"></div>
      <div class="pw-timeline-heading"><div><span class="section-kicker">TRILHA DE MARCOS</span><h3>Do primeiro executável à estabilidade.</h3></div><span class="pw-updated">ATUALIZADO EM ${escapeHtml(data.updatedAt || '—')}</span></div>
      <div class="pw-timeline-viewport" tabindex="0" aria-label="Trilha de progresso; deslize horizontalmente para ver todos os marcos">
        <div class="pw-timeline">
          <svg class="pw-connectors" viewBox="0 0 1000 250" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
          ${markerCards}
          <div class="pw-progress-track" role="progressbar" aria-label="Progresso geral da portabilidade" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}">
            <span class="pw-progress-fill" style="width:${progress}%"></span>
          </div>
          <div class="pw-milestones">${milestoneButtons}</div>
        </div>
      </div>
      <p class="pw-scroll-hint">Deslize a trilha para conferir todos os marcos.</p>
      <details class="pw-project-list">
        <summary><span>Progresso por projeto</span><span class="pw-project-list-action">Ver progresso de todos os projetos (${projects.length})</span></summary>
        <ul class="pw-project-progress-grid">${projectList}</ul>
      </details>
    </div>`;
  byId('portwatch-progress').querySelectorAll('.pw-avatar-image').forEach((image) => {
    image.addEventListener('error', () => {
      image.hidden = true;
      const fallback = image.nextElementSibling;
      if (fallback) fallback.hidden = false;
    }, { once: true });
  });
  applyLanguage();
}

function renderPortwatchError(error) {
  console.error(error);
  const section = byId('portwatch-progress');
  section.setAttribute('aria-busy', 'false');
  section.innerHTML = '<p class="portwatch-error" role="alert">Não foi possível carregar o acompanhamento. Verifique o arquivo <code>data/portwatch-progress.json</code>.</p>';
  applyLanguage();
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
        <div class="progress-label"><span>${escapeHtml(label)}</span><b>${progress}%</b></div>
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
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return String(value || '');
  const locale = { pt: 'pt-BR', en: 'en', es: 'es', zh: 'zh-CN' }[state.language];
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function formatPercent(value) {
  return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function renderStoryFeature(story, target) {
  target.innerHTML = `
    <div class="news-feature-content">
      <div class="news-feature-meta"><span class="news-feature-kicker">${escapeHtml(t('Manchete em destaque'))}</span><span class="news-category">${escapeHtml(t(story.category))}</span><time>${escapeHtml(formatNewsDate(story.date))}</time></div>
      <h3>${escapeHtml(story.title)}</h3>
      <p>${escapeHtml(story.summary)}</p>
      <div class="news-source-links">${(story.sources || []).map((source) => `<a class="text-link" href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(source.title)}">${escapeHtml(source.outlet)} ↗</a>`).join('')}</div>
    </div>
    <div class="news-feature-stamp" aria-hidden="true"><span>KYNOSRECOMPVI</span><strong>LEONIDA</strong><small>${escapeHtml(formatNewsDate(story.date))}</small></div>`;
  window.KynosI18n.translateDom(target, state.language);
}

function renderStoryCard(story, featured = false) {
  return `<article class="news-card ${featured ? 'news-card--featured' : ''}">
    <div class="news-card-top"><span class="news-category">${escapeHtml(t(story.category))}</span><time>${escapeHtml(formatNewsDate(story.date))}</time></div>
    <h3>${escapeHtml(story.title)}</h3>
    <p>${escapeHtml(story.summary)}</p>
    <div class="news-source-links">${(story.sources || []).map((source) => `<a class="text-link" href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(source.title)}">${escapeHtml(source.outlet)} ↗</a>`).join('')}</div>
  </article>`;
}

function renderPortalHome(data) {
  const lead = data.news.find((story) => story.id === '2026-11-23-leonida-nuked') || data.news[0];
  if (lead) renderStoryFeature(lead, byId('home-feature'));
  const latest = data.news.filter((story) => story !== lead).slice(0, 3);
  byId('home-news-list').innerHTML = latest.map((story) => renderStoryCard(story)).join('');
  window.KynosI18n.translateDom(byId('home-news-list'), state.language);

  const projects = data.efforts.filter((project) => project.status !== 'offline')
    .slice().sort((left, right) => right.percent - left.percent || left.name.localeCompare(right.name));
  const leader = projects[0];
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
    <p class="tracker-data-note">${escapeHtml(t('Relatos autodeclarados; percentuais conforme o snapshot do tracker.'))}</p>` : `<p>${escapeHtml(t('Sem dados de projetos'))}</p>`;
  window.KynosI18n.translateDom(byId('home-progress-summary'), state.language);
  attachAvatarFallbacks(byId('home-progress-summary'));
  animateCounters(byId('home-progress-summary'));
  animateProgress(byId('home-progress-summary'));
}

function renderTrackerProjectCard(project, rank, leaderId) {
  const inactive = project.status === 'offline';
  const featured = !inactive && project.id === leaderId;
  const badge = inactive ? t('Fora do ar') : `${formatPercent(project.percent)}% · ${t(project.stage)}`;
  const stats = [
    project.stars != null ? `${counterMarkup(project.stars)} ${escapeHtml(t('estrelas'))}` : '',
    project.forks != null ? `${counterMarkup(project.forks)} ${escapeHtml(t('forks'))}` : ''
  ].filter(Boolean).join(' · ');
  return `<article class="repo-card tracker-project-card ${inactive ? 'repo-card--inactive' : ''} ${featured ? 'tracker-project--featured' : ''}">
    <div class="rank-badge ${inactive ? 'inactive-badge' : ''}">${inactive ? t('FORA') : `#${rank}`}</div>
    <div class="repo-main">
      <div class="repo-title-row"><div><h3>${escapeHtml(project.name)}</h3><span class="repo-slug">${escapeHtml(project.repo)}</span></div></div>
      <div class="badge-row"><span class="status-badge ${featured || inactive ? 'warning' : 'accent'}">${escapeHtml(featured ? t('Projeto mais avançado') : badge)}</span><span class="status-badge">${escapeHtml(t(project.tier === 'tracked' ? 'Projeto acompanhado' : 'Em observação'))}</span><span class="status-badge">${escapeHtml(t('Relato não verificado independentemente'))}</span></div>
      <p class="repo-description">${escapeHtml(project.summary)}</p>
      ${inactive ? `<p class="repo-inactive-note">${escapeHtml(t('Registro histórico: fora do ar e excluído do ranking ativo.'))}</p>` : ''}
      ${stats ? `<p class="repo-author">${escapeHtml(stats)} · ${escapeHtml(t('snapshot, não ao vivo'))}</p>` : ''}
      <div class="repo-links">${project.url ? `<a class="button primary-link" href="${escapeHtml(safeUrl(project.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Repositório original'))} ↗</a>` : ''}</div>
    </div>
    <div class="repo-progress">
    <div class="progress-label"><span>${escapeHtml(t(inactive ? 'Último marco' : 'Marco atual'))} · ${escapeHtml(t(project.stage))}</span><b>${counterMarkup(project.percent, 'percent')}%</b></div>
    <div class="progress-track" role="progressbar" aria-label="${escapeHtml(`${project.name}: ${formatPercent(project.percent)}%`)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${project.percent}"><span data-progress-value="${Number(project.percent) || 0}"></span></div>
      <small>${escapeHtml(project.verification)}</small>
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
  byId('repo-count').innerHTML = counterMarkup(active.length);
  byId('tracker-race-summary').innerHTML = `
    <article class="panel race-summary-card race-summary-card--featured"><span class="section-kicker">${escapeHtml(t('Projeto mais avançado'))}</span><strong>${leader ? `${escapeHtml(leader.name)} · ${counterMarkup(leader.percent, 'percent')}%` : '—'}</strong><p>${leader ? escapeHtml(t(leader.stage)) : escapeHtml(t('Sem dados de projetos'))}</p></article>
    <article class="panel race-summary-card"><span class="section-kicker">${escapeHtml(t('Segundo projeto ativo'))}</span><strong>${runnerUp ? `${escapeHtml(runnerUp.name)} · ${counterMarkup(runnerUp.percent, 'percent')}%` : '—'}</strong><p>${runnerUp ? escapeHtml(t(runnerUp.stage)) : ''}</p></article>
    <article class="panel race-summary-card"><span class="section-kicker">${escapeHtml(t('Projetos acompanhados'))}</span><strong>${counterMarkup(projects.length)}</strong><p>${inactive.length} ${escapeHtml(t('fora do ar, sem contar no ranking ativo'))}</p></article>`;
  byId('repository-list').innerHTML = top.map((project, index) => renderTrackerProjectCard(project, index + 1, leader && leader.id)).join('');
  byId('tracker-all-projects').innerHTML = active.slice(top.length).map((project, index) => renderTrackerProjectCard(project, top.length + index + 1, leader && leader.id)).join('');
  byId('tracked-project-count').textContent = `${active.length - top.length} ${t('outros projetos')}`;
  byId('inactive-repositories').hidden = inactive.length === 0;
  byId('inactive-repository-list').innerHTML = inactive.map((project) => renderTrackerProjectCard(project, 0, leader && leader.id)).join('');
  window.KynosI18n.translateDom(byId('tracker-race-summary'), state.language);
  window.KynosI18n.translateDom(byId('repository-list'), state.language);
  window.KynosI18n.translateDom(byId('tracker-all-projects'), state.language);
  window.KynosI18n.translateDom(byId('inactive-repositories'), state.language);
  animateCounters(byId('tracker-race-summary'));
  animateCounters(byId('repository-list'));
  animateCounters(byId('tracker-all-projects'));
  animateCounters(byId('inactive-repositories'));
  animateProgress(byId('repository-list'));
  animateProgress(byId('tracker-all-projects'));
  animateProgress(byId('inactive-repositories'));
}

function renderNews(data) {
  const headline = data.news.find((story) => story.id === '2026-11-23-leonida-nuked') || data.news[0];
  const sourceNote = t('Resumos em PT-BR preparados a partir do tracker; consulte as fontes originais em cada notícia.');
  byId('news-source-note').innerHTML = `${escapeHtml(sourceNote)} <span>· ${escapeHtml(t('Atualizado em'))} ${escapeHtml(formatNewsDate(data.updatedAt))} ·</span> <a href="data/tracker-pt-BR.json" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Dados localizados'))} ↗</a>`;
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
    <p>${escapeHtml(exe.summary)}</p>
    <p class="tracker-safety-warning"><b>${escapeHtml(t('Alerta de segurança'))}</b> ${escapeHtml(exe.safety)}</p>
    <a class="text-link" href="${escapeHtml(safeUrl(exe.source))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Ler fonte citada'))} ↗</a>`;
  byId('tracker-scout').innerHTML = `
    <span class="section-kicker">${escapeHtml(t('VIGILÂNCIA COMUNITÁRIA'))}</span>
    <h2>${escapeHtml(t('Scout e triagem'))}</h2>
    <p>${escapeHtml(exe ? data.scout.summary : '')}</p>
    <div class="tracker-tags">${data.scout.sources.map((source) => `<span>${escapeHtml(source)}</span>`).join('')}</div>
    <small>${escapeHtml(t('Última varredura'))}: ${escapeHtml(formatNewsDate(data.scout.lastRun))} · ${data.candidates} ${escapeHtml(t('novos candidatos aguardam confirmação'))}</small>`;
  byId('tracker-changes').innerHTML = data.changes.slice().reverse().map((change) => `
    <article class="tracker-change panel"><span class="tracker-change-kind">${escapeHtml(t(change.kind))}</span><time>${escapeHtml(formatNewsDate(change.date))}</time><p>${escapeHtml(change.summary)}</p></article>`).join('');
  byId('tracker-tools').innerHTML = data.tools.map((tool) => `
    <article class="tracker-tool panel"><span class="section-kicker">${escapeHtml(t(tool.kind))}</span><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.description)}</p><a class="text-link" href="${escapeHtml(safeUrl(tool.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(tool.repo)} ↗</a></article>`).join('');
  byId('tracker-flagged').innerHTML = data.flagged.map((item) => `
    <article class="tracker-alert panel"><span class="status-badge warning">${item.count ? `${item.count} ${escapeHtml(t('itens sinalizados'))}` : escapeHtml(t('Alerta'))}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p>${item.examples.length ? `<small>${escapeHtml(t('Exemplos'))}: ${item.examples.map(escapeHtml).join(' · ')}</small>` : ''}</article>`).join('');
  byId('tracker-ignored').innerHTML = `<span class="section-kicker">${escapeHtml(t('TRIAGEM'))}</span><strong>${data.ignored.count} ${escapeHtml(t('itens ignorados ou não confirmados'))}</strong><p>${escapeHtml(data.ignored.summary)}</p>`;
  byId('tracker-dmca').innerHTML = data.dmca.map((item) => `
    <article class="tracker-dmca panel"><span class="section-kicker">${escapeHtml(formatNewsDate(item.date))}</span><strong>${item.repositories} ${escapeHtml(t('repositórios de GTA VI associados'))}</strong><p>${escapeHtml(item.summary)}</p><a class="text-link" href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Abrir registro público'))} ↗</a></article>`).join('');
  byId('tracker-headlines').innerHTML = data.headlines.slice(0, 12).map((headline) => `
    <article class="tracker-headline panel"><span>${escapeHtml(headline.outlet)} · ${escapeHtml(formatNewsDate(headline.date))}</span><h3>${escapeHtml(headline.title)}</h3><a class="text-link" href="${escapeHtml(safeUrl(headline.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('Fonte original'))} ↗</a></article>`).join('');
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
      <div class="news-card-top"><span class="news-category">${escapeHtml(t(item.category))}</span><time>${escapeHtml(formatFeedDate(item.date))}</time></div>
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '');
  return new Intl.DateTimeFormat(document.documentElement.lang || 'pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function xclItemToNews(item) {
  return {
    date: formatFeedDate(item.date),
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
  byId('official-discord').innerHTML = `<article class="official-card">${serverAvatar(official)}<div class="server-copy"><span class="section-kicker">${escapeHtml(official.badge)}</span><h3>${escapeHtml(official.name)}</h3><p>${escapeHtml(official.description)}</p></div><a class="button button-discord" href="${escapeHtml(safeUrl(official.url))}" target="_blank" rel="noopener noreferrer">Participar do projeto ↗</a></article>`;
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
      await window.KynosFileDataReady;
      data = window.KynosFileData;
      if (!data) throw new Error('O fallback local não foi inicializado.');
    } else {
      const [hardwareData, discords, tracker] = await Promise.all([
        loadJson('data/hardware.json'),
        loadJson('data/discords.json'),
        loadJson('data/tracker-pt-BR.json')
      ]);
      data = { hardware: hardwareData, discords, tracker };
    }
    hardware = data.hardware;
    trackerData = data.tracker;
    renderHardware();
    renderPortalHome(trackerData);
    renderTrackerProjects(trackerData);
    renderNews(trackerData);
    renderTrackerDetails(trackerData);
    setupXclFeed();
    renderDiscords(data.discords);
    initAdvancedTools();
    loadSharedSetup();
    const initialPage = window.location.hash.slice(1);
    setPage(initialPage || 'home', false);
  } catch (error) {
    console.error(error);
    document.querySelector('main').insertAdjacentHTML('afterbegin', '<p class="load-error">Não foi possível carregar o conteúdo. Confira os arquivos JSON da pasta data/ e, ao abrir com file://, gere data/file-fallback.js com scripts/build_tracker_ptbr.py.</p>');
    applyLanguage();
  }
}

document.body.addEventListener('click', (event) => {
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
  const control = event.target.closest('.target-option, .button-discord, .repo-links a, .news-card a, .news-feature a, .news-source-note a, .discord-card a, .official-card a, .add-server-card, .menu-toggle, .nav-link, .segmented button, .storage-choice, .tool-button, .theme-toggle, .what-if-menu summary, .what-if-options button');
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
