const test = require('node:test');
const assert = require('node:assert/strict');
const fundraising = require('../vaquinhas/fundraising-core.js');

test('ranking includes confirmed donations and aggregates aliases', () => {
  const rows = [
    { campaign_id: 'a', amount: '2.50', donor_alias: 'Ana', status: 'confirmed', show_in_ranking: true },
    { campaign_id: 'b', amount: '3.25', donor_alias: 'ana', status: 'confirmed', show_in_ranking: true },
    { campaign_id: 'a', amount: '100.00', donor_alias: 'Pendente', status: 'pending', show_in_ranking: true },
    { campaign_id: 'b', amount: '50.00', donor_alias: 'Oculto', status: 'confirmed', show_in_ranking: false }
  ];

  assert.deepEqual(fundraising.aggregateLeaderboard(rows), [
    { alias: 'Ana', amount: '5.75', donations: 2 }
  ]);
  assert.deepEqual(fundraising.aggregateLeaderboard(rows, 'a'), [
    { alias: 'Ana', amount: '2.50', donations: 1 }
  ]);
});

test('database leaderboard rows can be combined for the overall ranking', () => {
  const rows = [
    { campaign_id: 'a', donor_alias: 'Bia', total_amount: '8.00', donation_count: 2 },
    { campaign_id: 'b', donor_alias: 'Bia', total_amount: '4.00', donation_count: 1 }
  ];

  assert.deepEqual(fundraising.aggregateLeaderboard(rows), [
    { alias: 'Bia', amount: '12.00', donations: 3 }
  ]);
  assert.equal(fundraising.sumLeaderboard(rows), '12.00');
  assert.equal(fundraising.formatCurrency('99999999999.98'), 'R$ 99.999.999.999,98');
  assert.equal(fundraising.sumLeaderboard([
    { campaign_id: 'a', donor_alias: 'Cris', total_amount: '0.01', donation_count: 1 },
    { campaign_id: 'b', donor_alias: 'Cris', total_amount: '9999999999.99', donation_count: 1 }
  ]), '10000000000.00');
});

test('confirmed campaign totals include donations omitted from the public ranking', () => {
  const totals = [{ campaign_id: 'a', total_amount: '23.50', donation_count: 4 }];
  const leaderboard = [{ campaign_id: 'a', donor_alias: 'Ana', total_amount: '10.00', donation_count: 2 }];

  assert.equal(fundraising.getCampaignTotal(totals, leaderboard, 'a'), '23.50');
  assert.equal(fundraising.getCampaignDonationCount(totals, leaderboard, 'a'), 4);
  assert.equal(fundraising.getCampaignTotal([], leaderboard, 'a'), '10.00');
});

test('public URLs reject executable schemes and cross-origin insecure URLs', () => {
  const base = 'https://kynos.example/vaquinhas/';
  assert.equal(fundraising.safePublicUrl('javascript:alert(1)', base), '');
  assert.equal(fundraising.safePublicUrl('//tracker.example/pixel', base), '');
  assert.equal(fundraising.safePublicUrl('http://other.example/image.png', base), '');
  assert.equal(fundraising.safePublicUrl('/assets/vaquinhas/qr.png', base), 'https://kynos.example/assets/vaquinhas/qr.png');
  assert.equal(fundraising.safePublicUrl('https://cdn.example/qr.png', base), 'https://cdn.example/qr.png');
  assert.equal(fundraising.safePublicUrl('../assets/qr.png', 'file:///site/vaquinhas/index.html'), 'file:///site/assets/qr.png');
});

test('campaign split is only shown as exact percentages when it totals 100', () => {
  assert.equal(
    fundraising.getCampaignSplit({ xlaunch_percent: 85, kynos_maintenance_percent: 15 }),
    '85% para o XLaunchVI · 15% para manutenção do KynosRecompVI'
  );
  assert.match(fundraising.getCampaignSplit({ xlaunch_percent: 80, kynos_maintenance_percent: 15 }), /percentuais oficiais/);
});
