(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.KynosFundraising = api;
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  function safePublicUrl(value, baseUrl) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const raw = value.trim();
    if (/^(javascript|data|vbscript):/i.test(raw) || raw.startsWith('//')) return '';
    try {
      const base = new URL(baseUrl);
      const resolved = new URL(raw, base);
      if (resolved.username || resolved.password) return '';
      if (resolved.protocol === 'file:' && base.protocol === 'file:') return resolved.href;
      if (resolved.protocol !== 'https:' && !(resolved.protocol === 'http:' && resolved.origin === base.origin)) return '';
      return resolved.href;
    } catch (error) {
      return '';
    }
  }

  function safeHexColor(value, fallback) {
    return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  }

  function decimalCents(value) {
    const text = String(value === undefined || value === null ? '' : value).trim();
    if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
    const parts = text.split('.');
    const whole = BigInt(parts[0]);
    const fraction = BigInt((parts[1] || '').padEnd(2, '0'));
    return whole * 100n + fraction;
  }

  function decimalFromCents(cents) {
    return `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`;
  }

  function formatCurrency(value) {
    const cents = decimalCents(value);
    if (cents === null) return 'R$ 0,00';
    const whole = cents / 100n;
    const fraction = String(cents % 100n).padStart(2, '0');
    return `R$ ${new Intl.NumberFormat('pt-BR').format(whole)},${fraction}`;
  }

  function normalizeName(value) {
    return String(value || 'Apoiador anônimo').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
  }

  function aggregateLeaderboard(rows, campaignId) {
    const totals = new Map();
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      if (campaignId && row.campaign_id !== campaignId) return;
      const isAggregate = row.total_amount !== undefined;
      if (!isAggregate && (row.status !== 'confirmed' || row.show_in_ranking === false)) return;
      const alias = String(row.donor_alias || 'Apoiador anônimo').trim() || 'Apoiador anônimo';
      const key = normalizeName(alias);
      const cents = decimalCents(isAggregate ? row.total_amount : row.amount);
      if (cents === null || cents < 1n) return;
      const current = totals.get(key) || { alias, cents: 0n, donations: 0 };
      current.cents += cents;
      current.donations += Number(isAggregate ? row.donation_count : 1) || 0;
      totals.set(key, current);
    });
    return Array.from(totals.values()).sort((left, right) => {
      if (right.cents !== left.cents) return right.cents > left.cents ? 1 : -1;
      return right.donations - left.donations || left.alias.localeCompare(right.alias, 'pt-BR');
    }).map((row) => ({
      alias: row.alias,
      amount: decimalFromCents(row.cents),
      donations: row.donations
    }));
  }

  function sumLeaderboard(rows, campaignId) {
    const cents = aggregateLeaderboard(rows, campaignId).reduce((total, row) => {
      const cents = decimalCents(row.amount);
      return total + (cents === null ? 0n : cents);
    }, 0n);
    return decimalFromCents(cents);
  }

  function getCampaignTotal(totals, leaderboard, campaignId) {
    const total = (Array.isArray(totals) ? totals : []).find((row) => row.campaign_id === campaignId);
    const cents = total ? decimalCents(total.total_amount) : null;
    return cents === null ? sumLeaderboard(leaderboard, campaignId) : decimalFromCents(cents);
  }

  function getCampaignDonationCount(totals, leaderboard, campaignId) {
    const total = (Array.isArray(totals) ? totals : []).find((row) => row.campaign_id === campaignId);
    if (total && Number.isFinite(Number(total.donation_count))) {
      return Math.max(0, Math.trunc(Number(total.donation_count)));
    }
    return aggregateLeaderboard(leaderboard, campaignId).reduce((count, row) => count + row.donations, 0);
  }

  function getCampaignSplit(campaign) {
    const xlaunch = Number(campaign && campaign.xlaunch_percent);
    const kynos = Number(campaign && campaign.kynos_maintenance_percent);
    if (Number.isInteger(xlaunch) && Number.isInteger(kynos) && xlaunch >= 0 && kynos >= 0 && xlaunch + kynos === 100) {
      return `${xlaunch}% para o XLaunchVI · ${kynos}% para manutenção do KynosRecompVI`;
    }
    return 'A maior parte é destinada ao XLaunchVI e uma parcela à manutenção do KynosRecompVI. Os percentuais oficiais serão exibidos após a configuração da campanha.';
  }

  return {
    aggregateLeaderboard,
    decimalCents,
    formatCurrency,
    getCampaignDonationCount,
    getCampaignTotal,
    getCampaignSplit,
    safeHexColor,
    safePublicUrl,
    sumLeaderboard
  };
}));
