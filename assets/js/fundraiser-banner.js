(function () {
  'use strict';

  const image = document.getElementById('home-fundraiser-qr');
  const splitNote = document.getElementById('home-fundraiser-split');
  const donorList = document.getElementById('home-top-donors');
  const donorMode = document.getElementById('home-top-donors-mode');
  if (!image || !splitNote || !donorList || !donorMode) return;

  function imageUrl(value) {
    if (typeof value !== 'string' || !value.trim() || /^(javascript|data|vbscript):/i.test(value) || value.trim().startsWith('//')) return '';
    try {
      const base = new URL(document.baseURI);
      const url = new URL(value.trim(), base);
      if (url.username || url.password) return '';
      if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.origin === base.origin)) return '';
      return url.href;
    } catch (error) {
      return '';
    }
  }

  function toCents(value) {
    const text = String(value == null ? '' : value).trim();
    if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
    const parts = text.split('.');
    return BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0'));
  }

  function formatCurrency(cents) {
    const whole = (cents / 100n).toLocaleString('pt-BR');
    return `R$ ${whole},${String(cents % 100n).padStart(2, '0')}`;
  }

  function appendEmptyRanking(message) {
    donorList.replaceChildren();
    const item = document.createElement('li');
    item.className = 'br-support-donor-empty';
    item.textContent = message;
    donorList.append(item);
  }

  function renderTopDonors(rows, campaignId) {
    const ranked = (Array.isArray(rows) ? rows : [])
      .filter((row) => row.campaign_id === campaignId && toCents(row.total_amount) !== null)
      .sort((left, right) => {
        const leftCents = toCents(left.total_amount);
        const rightCents = toCents(right.total_amount);
        return rightCents > leftCents ? 1 : rightCents < leftCents ? -1 : 0;
      })
      .slice(0, 3);
    donorList.replaceChildren();
    if (!ranked.length) {
      appendEmptyRanking('Ainda não há doações confirmadas para esta campanha.');
      return;
    }
    ranked.forEach((row, index) => {
      const item = document.createElement('li');
      item.style.setProperty('--donor-order', String(index));
      const position = document.createElement('span');
      position.className = 'br-support-donor-position';
      position.textContent = String(index + 1).padStart(2, '0');
      const name = document.createElement('strong');
      name.className = 'br-support-donor-name';
      name.textContent = String(row.donor_alias || 'Apoiador anônimo');
      const amount = document.createElement('span');
      amount.className = 'br-support-donor-amount';
      amount.textContent = formatCurrency(toCents(row.total_amount));
      item.append(position, name, amount);
      donorList.append(item);
    });
  }

  donorMode.textContent = 'Modo local · sem doações reais';
  appendEmptyRanking('O ranking aparece aqui quando houver doações confirmadas.');
  if (window.location.protocol === 'file:') return;

  fetch('api/fundraisers', { headers: { Accept: 'application/json' }, cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => {
      if (!payload || payload.source !== 'database' || !Array.isArray(payload.campaigns)) {
        donorMode.textContent = 'Modo local · ranking indisponível';
        return;
      }
      const campaign = payload.campaigns.find((item) => item.slug === 'xlaunchvi');
      if (!campaign) {
        donorMode.textContent = 'Banco conectado · campanha sem ranking publicado';
        appendEmptyRanking('Ainda não há doações confirmadas para esta campanha.');
        return;
      }
      const pixButton = document.querySelector('[data-br-pix]');
      const pixKey = document.querySelector('.br-support-pix-key');
      if (campaign.is_active && campaign.pix_key) {
        if (pixButton) pixButton.dataset.brPix = campaign.pix_key;
        if (pixKey) pixKey.textContent = campaign.pix_key;
      } else {
        if (pixButton) {
          pixButton.disabled = true;
          pixButton.textContent = 'Vaquinha indisponível';
        }
        if (pixKey) pixKey.textContent = 'PIX indisponível para esta campanha.';
      }
      const xlaunch = Number(campaign.xlaunch_percent);
      const kynos = Number(campaign.kynos_maintenance_percent);
      if (Number.isInteger(xlaunch) && Number.isInteger(kynos) && xlaunch + kynos === 100) {
        splitNote.textContent = `${xlaunch}% para o XLaunchVI · ${kynos}% para manutenção do KynosRecompVI.`;
      } else {
        splitNote.textContent = 'A maior parte é destinada ao XLaunchVI e uma parcela à manutenção do KynosRecompVI; os percentuais serão publicados pela campanha.';
      }
      const qr = campaign.is_active ? imageUrl(campaign.qr_code_url) : '';
      if (qr) {
        image.src = qr;
        image.alt = `QR Code PIX da campanha ${campaign.title || 'XLaunchVI'}`;
      }
      renderTopDonors(payload.leaderboard, campaign.id);
      donorMode.textContent = 'Banco conectado · valores confirmados';
    })
    .catch((error) => {
      console.warn('Não foi possível carregar os dados da vaquinha para o banner.', error);
      donorMode.textContent = 'Modo local · ranking indisponível';
    });
}());
