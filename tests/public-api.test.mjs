import test from 'node:test';
import assert from 'node:assert/strict';
import { getFundraiserData } from '../functions/_lib/public-data.js';

test('public fundraiser reads use only the public key and return safe views', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), headers: new Headers(options.headers) });
    return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const response = await getFundraiserData({
      env: {
        SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_ANON_KEY: 'public-test-key'
      }
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.source, 'database');
    assert.deepEqual(payload.campaigns, []);
    assert.equal(requests.length, 5);
    assert.ok(requests.every(({ headers }) =>
      headers.get('apikey') === 'public-test-key' && headers.get('Authorization') === 'Bearer public-test-key'
    ));
    assert.ok(requests.some(({ url }) => url.includes('/public_campaigns?')));
    assert.ok(requests.some(({ url }) => url.includes('/donor_leaderboard?')));
    assert.ok(requests.some(({ url }) => url.includes('/rpc/public_campaign_totals')));
    assert.deepEqual(payload.campaign_totals, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('public fundraiser uses the configured publishable Supabase project by default', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), headers: new Headers(options.headers) });
    return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const response = await getFundraiserData({ env: {} });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.source, 'database');
    assert.equal(requests.length, 5);
    assert.ok(requests.every(({ url, headers }) =>
      url.startsWith('https://fefvytprogasugctxdom.supabase.co/')
        && headers.get('apikey') === 'sb_publishable_xhdlCMR97qQGNiIXtx1s2g_-V9jVpPy'
    ));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('public fundraiser explicitly requests local mode when the database schema is not ready', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('Not found', { status: 404 });
  try {
    const response = await getFundraiserData({ env: {} });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      source: 'local',
      error: 'Public Supabase data is not ready; use the local demonstration data.'
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
