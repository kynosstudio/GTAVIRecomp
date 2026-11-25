const PIX = '50450a25-89df-446c-92cc-e56f64a5ab7a';
const CONTRIBUTOR_URL = 'https://github.com/JPTuba9/xlaunch-vi/graphs/contributors';

const team = [
  { name: 'JPTuba9', role: 'Coordenação e desenvolvimento' },
  { name: 'Bellic Linguiça', role: 'Colaboração técnica' },
  { name: 'Fuziloves', role: 'Comunidade e testes' },
  { name: 'Izanagi', role: 'Pesquisa técnica' },
  { name: 'Nat', role: 'Informações e acompanhamento' },
  { name: 'PACNAT', role: 'Decisão técnica e releases' },
  { name: 'Morrigan [MIKU]', role: 'Comunidade e apoio visual' },
  { name: 'Novos colaboradores', role: 'Espaço aberto para a equipe BR' }
];

async function loadTracker() {
  try {
    const response = await fetch(`../data/tracker-pt-BR.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const tracker = await response.json();
    if (!Array.isArray(tracker.efforts)) throw new Error('O tracker não contém a lista de projetos.');
    return tracker;
  } catch (sourceError) {
    console.warn('Tracker PT-BR indisponível; tentando o fallback local.', sourceError);
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '../data/file-fallback.js';
    script.onload = () => {
      script.remove();
      const fallback = window.KynosFileData && window.KynosFileData.tracker;
      if (fallback && Array.isArray(fallback.efforts)) resolve();
      else reject(new Error('O fallback local não contém os dados do tracker.'));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error('Não foi possível carregar o fallback local do tracker.'));
    };
    document.head.appendChild(script);
  });
  return window.KynosFileData.tracker;
}

async function copyText(value) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch (error) {
      console.warn('A API de área de transferência falhou; tentando o método compatível.', error);
    }
  }
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('O navegador não permitiu copiar a chave PIX.');
}

document.querySelectorAll('[data-copy-pix]').forEach((button) => {
  button.dataset.originalText = button.textContent.trim();
  button.addEventListener('click', async () => {
    const status = button.closest('.xlaunch-pix-card')?.querySelector('.xlaunch-pix-status')
      || button.closest('.xlaunch-hero-copy')?.querySelector('.xlaunch-copy-status');
    button.disabled = true;
    try {
      await copyText(PIX);
      if (status) status.textContent = 'Chave PIX copiada!';
      button.textContent = 'Chave PIX copiada!';
    } catch (error) {
      console.error('Não foi possível copiar a chave PIX:', error);
      if (status) status.textContent = 'Não foi possível copiar. Selecione a chave exibida e copie manualmente.';
    } finally {
      window.setTimeout(() => {
        if (!button.isConnected) return;
        button.disabled = false;
        button.textContent = button.dataset.originalText;
      }, 1800);
    }
  });
});

// Troque o src do avatar por uma foto em assets/ quando houver uma imagem autorizada.
document.getElementById('xlaunch-team').innerHTML = team.map((member) => `
  <article class="xlaunch-member">
    <img src="assets/contributor-placeholder.svg" alt="" loading="lazy">
    <div><strong>${member.name}</strong><small>${member.role}</small></div>
    <a href="${member.name === 'Novos colaboradores' ? 'https://github.com/JPTuba9/xlaunch-vi/issues' : CONTRIBUTOR_URL}" target="_blank" rel="noopener noreferrer">
      ${member.name === 'Novos colaboradores' ? 'Quero colaborar ↗' : 'Ver contribuições ↗'}
    </a>
  </article>
`).join('');

/**
 * Anima o contador percentual de 0,0% até o valor alvo
 * Usa requestAnimationFrame com easing cubic-out e respeita prefers-reduced-motion
 * Formata com vírgula decimal (pt-BR): ex. "78,7%"
 */
function animatePercentCounter(targetPercent, elementId, fillId) {
  const element = document.getElementById(elementId);
  const fill = document.getElementById(fillId);
  if (!element || !Number.isFinite(targetPercent)) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = 1200; // ms
  const startTime = performance.now();

  // Formata com vírgula decimal (pt-BR), 1 casa decimal
  function formatPercent(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
  }

  if (reduceMotion || targetPercent === 0) {
    element.textContent = formatPercent(targetPercent);
    if (fill) fill.style.width = `${targetPercent}%`;
    return;
  }

  element.classList.add('animating');
  element.textContent = formatPercent(0);

  function tick(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    // Easing cubic-out: 1 - (1 - t)^3
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = targetPercent * eased;
    element.textContent = formatPercent(current);
    if (fill) fill.style.width = `${current}%`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = formatPercent(targetPercent);
      if (fill) fill.style.width = `${targetPercent}%`;
      element.classList.remove('animating');
    }
  }

  requestAnimationFrame(tick);
}

loadTracker().then((tracker) => {
  const effort = tracker && Array.isArray(tracker.efforts)
    ? tracker.efforts.find((item) => item.id === 'xlaunchvi')
    : null;
  if (!effort) throw new Error('O tracker carregou, mas não contém o projeto XLaunchVI.');
  const percent = Math.max(0, Math.min(100, Number(effort.percent)));
  if (!Number.isFinite(percent)) throw new Error('O progresso informado para o XLaunchVI não é válido.');

  // Anima o contador e a barra de progresso
  animatePercentCounter(percent, 'xlaunch-percent', 'xlaunch-progress-fill');

  document.querySelector('#xlaunch-stage').textContent = effort.stage || 'Mundo renderizado (noite) · Lucia em tempo real · Ray Tracing ativo · 30 FPS @ 1080p';
  document.querySelector('.xlaunch-progress').setAttribute('aria-valuenow', String(percent));
  document.querySelector('#xlaunch-summary').textContent = effort.summary || effort.verification || '';
}).catch((error) => {
  console.error('Não foi possível atualizar o progresso do XLaunchVI:', error);
  document.querySelector('#xlaunch-data-status').textContent = 'Não foi possível carregar o tracker agora; o status será atualizado quando os dados estiverem disponíveis.';
});