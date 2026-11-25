import { getSupabaseConfig, jsonResponse, supabaseFetch } from './supabase.js';

async function readView(config, name) {
  const query = new URLSearchParams({ select: '*' });
  if (name === 'public_campaigns') query.set('order', 'created_at.asc');
  if (name === 'donor_leaderboard') query.set('order', 'total_amount.desc');
  if (name === 'published_news') query.set('order', 'published_at.desc');
  if (name === 'published_tracker_updates') query.set('order', 'published_at.desc');
  const response = await supabaseFetch(config, `/rest/v1/${name}?${query.toString()}`, {
    headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}` }
  });
  if (!response.ok) throw new Error(`Public view request failed: ${name} (${response.status})`);
  return response.json();
}

async function readCampaignTotals(config) {
  const response = await supabaseFetch(config, '/rest/v1/rpc/public_campaign_totals', {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      'Content-Type': 'application/json'
    },
    body: '{}'
  });
  if (!response.ok) throw new Error(`Public aggregate request failed (${response.status})`);
  return response.json();
}

export async function getFundraiserData(context) {
  const config = getSupabaseConfig(context.env);
  if (!config) {
    return jsonResponse({ source: 'local', error: 'Database is not configured.' }, 503);
  }
  try {
    const [campaigns, leaderboard, campaignTotals, news, trackerUpdates] = await Promise.all([
      readView(config, 'public_campaigns'),
      readView(config, 'donor_leaderboard'),
      readCampaignTotals(config),
      readView(config, 'published_news'),
      readView(config, 'published_tracker_updates')
    ]);
    return jsonResponse({
      source: 'database',
      campaigns,
      leaderboard,
      campaign_totals: campaignTotals,
      news,
      tracker_updates: trackerUpdates
    }, 200, { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' });
  } catch (error) {
    console.error('Public fundraiser data could not be loaded.');
    return jsonResponse({
      source: 'local',
      error: 'Public Supabase data is not ready; use the local demonstration data.'
    }, 503);
  }
}
