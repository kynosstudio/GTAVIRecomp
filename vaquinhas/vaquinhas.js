(function () {
  'use strict';

  const api = window.KynosFundraising;
  const mock = window.KynosFundraiserMock;
  const campaignList = document.getElementById('campaign-list');
  const mode = document.getElementById('fundraising-data-mode');
  const rankingList = document.getElementById('donor-ranking');
  const filter = document.getElementById('ranking-filter');
  let state = { campaigns: [], leaderboard: [], campaign_totals: [], source: 'local' };

  function appendText(parent, tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = String(value || '');
    parent.append(node);
    return node;
  }

  function makeImage(src, alt, className) {
    const safeSrc = api.safePublicUrl(src, document.baseURI);
    if (!safeSrc) return null;
    const image = document.createElement('img');
    image.src = safeSrc;
    image.alt = alt;
    image.className = className;
    image.loading = 'lazy';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => image.remove(), { once: true });
    return image;
  }

  function makeCampaignCard(campaign, donationRows) {
    const card = document.createElement('article');
    card.className = 'campaign-card';
    const start = api.safeHexColor(campaign.color_start, '#ff7b47');
    const end = api.safeHexColor(campaign.color_end, '#8157e8');
    const angle = Math.min(360, Math.max(0, Number(campaign.gradient_angle) || 125));
    const art = document.createElement('div');
    art.className = 'campaign-art';
    art.style.setProperty('--campaign-gradient', `linear-gradient(${angle}deg, ${start}, ${end})`);
    const banner = makeImage(campaign.banner_url, '', '');
    if (banner) art.append(banner);
    appendText(art, 'span', '', campaign.title || 'Vaquinha');
    card.append(art);

    const body = document.createElement('div');
    body.className = 'campaign-body';
    const topline = document.createElement('div');
    topline.className = 'campaign-topline';
    const statusLabels = { active: 'Ativa', paused: 'Pausada', completed: 'Concluída', archived: 'Arquivada', draft: 'Rascunho' };
    const statusLabel = state.source === 'local' ? 'Demonstração local' : (statusLabels[campaign.status] || 'Inativa');
    appendText(topline, 'span', 'campaign-status' + (campaign.is_active ? ' is-active' : ''), statusLabel);
    if (campaign.slug) appendText(topline, 'span', 'campaign-status', `/${campaign.slug}`);
    body.append(topline);
    appendText(body, 'h3', 'campaign-title', campaign.title || 'Campanha');
    appendText(body, 'p', 'campaign-summary', campaign.summary);
    if (campaign.description) appendText(body, 'p', 'campaign-description', campaign.description);
    appendText(body, 'div', 'campaign-split', api.getCampaignSplit(campaign));

    const raised = api.getCampaignTotal(state.campaign_totals, donationRows, campaign.id);
    const donationCount = api.getCampaignDonationCount(state.campaign_totals, donationRows, campaign.id);
    if (campaign.goal_amount) {
      const goal = Number(campaign.goal_amount);
      const raisedCents = api.decimalCents(raised) || 0n;
      const goalCents = api.decimalCents(campaign.goal_amount);
      const progress = document.createElement('div');
      progress.className = 'campaign-progress';
      const heading = document.createElement('div');
      heading.className = 'campaign-progress-head';
      appendText(heading, 'span', '', 'Arrecadado');
      appendText(heading, 'strong', '', `${api.formatCurrency(raised)} / ${api.formatCurrency(goal)}`);
      progress.append(heading);
      const track = document.createElement('div');
      track.className = 'campaign-progress-track';
      track.setAttribute('role', 'progressbar');
      track.setAttribute('aria-valuemin', '0');
      track.setAttribute('aria-valuemax', '100');
      const percent = goalCents ? Math.min(100, Number(raisedCents * 10000n / goalCents) / 100) : 0;
      track.setAttribute('aria-valuenow', String(Math.round(percent)));
      const fill = document.createElement('span');
      fill.style.width = `${percent}%`;
      track.append(fill);
      progress.append(track);
      body.append(progress);
    } else {
      appendText(body, 'p', 'campaign-total', 'Meta financeira: a definir');
    }

      // Create main content wrapper for side-by-side layout
      const mainContent = document.createElement('div');
      mainContent.className = 'campaign-main-content';

      // Left side: PIX info, progress, totals
      const leftSide = document.createElement('div');
      leftSide.className = 'campaign-pix-section';

    const canShowPix = campaign.is_active === true || state.source === 'local';
    const pix = document.createElement('div');
    pix.className = 'campaign-pix';
    if (canShowPix) {
      const pixKey = campaign.pix_key || 'kynos.studio@gmail.com';
      const row = document.createElement('div');
      row.className = 'campaign-pix-row';
      const keyWrap = document.createElement('div');
      appendText(keyWrap, 'span', 'campaign-pix-label', 'CHAVE PIX');
      appendText(keyWrap, 'code', 'campaign-pix-key', pixKey);
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'campaign-copy-button';
      copy.textContent = 'Copiar chave';
      const copyStatus = document.createElement('p');
      copyStatus.className = 'campaign-copy-status';
      copyStatus.setAttribute('role', 'status');
      copyStatus.setAttribute('aria-live', 'polite');
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pixKey);
          copyStatus.textContent = 'Chave PIX copiada.';
        } catch (error) {
          copyStatus.textContent = 'Não foi possível copiar. Selecione e copie a chave manualmente.';
        }
      });
      row.append(keyWrap, copy);
      pix.append(row, copyStatus);
    } else {
      appendText(pix, 'p', 'campaign-qr-note', 'PIX temporariamente indisponível para esta campanha.');
    }
    const total = document.createElement('div');
    total.className = 'campaign-total';
    appendText(total, 'span', '', 'Doações confirmadas');
    appendText(total, 'strong', '', api.formatCurrency(raised));
    pix.append(total);
    if (!campaign.goal_amount) {
      const volume = document.createElement('div');
      volume.className = 'campaign-volume';
      const volumeLabel = document.createElement('div');
      volumeLabel.className = 'campaign-volume-label';
      appendText(volumeLabel, 'span', '', 'Volume de doações confirmadas');
      appendText(volumeLabel, 'strong', '', `${donationCount} ${donationCount === 1 ? 'doação' : 'doações'}`);
      const track = document.createElement('div');
      track.className = 'campaign-volume-track';
      track.setAttribute('role', 'progressbar');
      track.setAttribute('aria-label', 'Volume de doações confirmadas; escala visual até 20 doações, sem meta financeira');
      track.setAttribute('aria-valuemin', '0');
      track.setAttribute('aria-valuemax', '20');
      track.setAttribute('aria-valuenow', String(Math.min(20, donationCount)));
      const fill = document.createElement('span');
      fill.style.width = `${Math.min(100, donationCount * 5)}%`;
      track.append(fill);
      volume.append(volumeLabel, track);
      appendText(volume, 'small', '', 'Escala visual de volume, não representa uma meta financeira.');
      pix.append(volume);
    }
      leftSide.append(pix);
      mainContent.append(leftSide);

      // Right side: QR Code frame
      const rightSide = document.createElement('div');
      rightSide.className = 'campaign-qr-section';
      if (canShowPix) {
        const qr = makeImage(campaign.qr_code_url, `QR Code PIX da campanha ${campaign.title || ''}`, 'campaign-qr');
        if (qr) {
          const frame = document.createElement('figure');
          frame.className = 'campaign-qr-frame';
          frame.append(qr);
          appendText(frame, 'figcaption', 'campaign-qr-note', state.source === 'local' ? 'Imagem demonstrativa; não é um QR Code pagável.' : 'Confira o valor e a chave no app do banco antes de confirmar.');
          rightSide.append(frame);
        }
      }
      mainContent.append(rightSide);

      body.append(mainContent);
    card.append(body);
    return card;
  }

  function renderCampaigns() {
    campaignList.replaceChildren();
    const campaigns = state.campaigns;
    document.getElementById('campaign-empty').hidden = campaigns.length > 0;
    campaigns.forEach((campaign) => campaignList.append(makeCampaignCard(campaign, state.leaderboard)));
  }

  function renderRanking() {
    const campaignId = state.campaigns.length > 1 && filter.value !== 'all' ? filter.value : '';
    const rows = api.aggregateLeaderboard(state.leaderboard, campaignId);
    rankingList.replaceChildren();
    document.getElementById('ranking-empty').hidden = rows.length > 0;
    rows.forEach((row, index) => {
      const item = document.createElement('li');
      appendText(item, 'span', 'donor-rank-number', String(index + 1).padStart(2, '0'));
      const identity = document.createElement('div');
      appendText(identity, 'strong', 'donor-rank-name', row.alias);
      appendText(identity, 'span', 'donor-rank-count', `${row.donations} ${row.donations === 1 ? 'doação confirmada' : 'doações confirmadas'}`);
      appendText(item, 'strong', 'donor-rank-amount', api.formatCurrency(row.amount));
      item.insertBefore(identity, item.lastChild);
      rankingList.append(item);
    });
  }

  function setupFilter() {
    const wrap = document.getElementById('ranking-filter-wrap');
    wrap.hidden = state.campaigns.length <= 1;
    filter.replaceChildren();
    if (state.campaigns.length > 1) {
      const all = document.createElement('option');
      all.value = 'all';
      all.textContent = 'Todas as vaquinhas';
      filter.append(all);
      state.campaigns.forEach((campaign) => {
        const option = document.createElement('option');
        option.value = campaign.id;
        option.textContent = campaign.title;
        filter.append(option);
      });
    }
    filter.addEventListener('change', renderRanking);
  }

  async function loadData() {
    if (window.location.protocol !== 'file:') {
      try {
        const response = await fetch('../api/fundraisers', { headers: { Accept: 'application/json' }, cache: 'no-store' });
        if (response.ok) {
          const payload = await response.json();
          if (payload && payload.source === 'database' && Array.isArray(payload.campaigns) && Array.isArray(payload.leaderboard)) {
            return {
              campaigns: payload.campaigns,
              leaderboard: payload.leaderboard,
              campaign_totals: Array.isArray(payload.campaign_totals) ? payload.campaign_totals : [],
              source: 'database'
            };
          }
        }
      } catch (error) {
        console.warn('Banco de vaquinhas indisponível; usando dados locais de demonstração.', error);
      }
    }
    return {
      campaigns: Array.isArray(mock.campaigns) ? mock.campaigns : [],
      leaderboard: Array.isArray(mock.leaderboard) ? mock.leaderboard : [],
      campaign_totals: Array.isArray(mock.campaign_totals) ? mock.campaign_totals : [],
      source: 'local'
    };
  }

  loadData().then((data) => {
    state = data;
    mode.dataset.source = data.source;
    mode.textContent = data.source === 'database'
      ? 'Banco conectado · campanhas e ranking publicados'
      : 'Modo local / demonstração · sem gravação e sem doadores reais';
    renderCampaigns();
    setupFilter();
    renderRanking();
  }).catch((error) => {
    console.error('Não foi possível carregar as campanhas de apoio.', error);
    mode.dataset.source = 'local';
    mode.textContent = 'Modo local · não foi possível carregar os dados do banco.';
    state.campaigns = Array.isArray(mock.campaigns) ? mock.campaigns : [];
    state.leaderboard = Array.isArray(mock.leaderboard) ? mock.leaderboard : [];
    state.campaign_totals = Array.isArray(mock.campaign_totals) ? mock.campaign_totals : [];
    renderCampaigns();
    setupFilter();
    renderRanking();
  });
}());
