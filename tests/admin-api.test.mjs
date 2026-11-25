import test from 'node:test';
import assert from 'node:assert/strict';
import { login, mutateAdminResource } from '../functions/_lib/admin.js';

const allowedId = 'c91e90ac-55e0-4bfc-a8b7-37c3a95a79dd';
const env = {
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'public-test-key',
  SUPABASE_SERVICE_ROLE_KEY: 'private-test-key',
  ADMIN_USER_IDS: allowedId
};

function request(path, origin, body) {
  return new Request(`https://portal.example/api/admin/${path}`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

test('operator login stores the access token only in an HttpOnly cookie', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    access_token: 'private-access-token',
    expires_in: 3600,
    user: { id: allowedId, email: 'operator@example.test' }
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    const response = await login({ env, request: request('login', 'https://portal.example', { email: 'operator@example.test', password: 'passphrase' }) });
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.doesNotMatch(body, /private-access-token/);
    assert.match(response.headers.get('Set-Cookie'), /HttpOnly/);
    assert.match(response.headers.get('Set-Cookie'), /Secure/);
    assert.match(response.headers.get('Set-Cookie'), /SameSite=Strict/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('operator login rejects accounts outside the server allowlist', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    access_token: 'private-access-token',
    expires_in: 3600,
    user: { id: 'a91e90ac-55e0-4bfc-a8b7-37c3a95a79dd', email: 'other@example.test' }
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    const response = await login({ env, request: request('login', 'https://portal.example', { email: 'other@example.test', password: 'passphrase' }) });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('Set-Cookie'), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('admin mutations reject cross-origin requests before accessing the database', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response('{}', { status: 200 });
  };
  try {
    const response = await mutateAdminResource({
      env,
      request: request('campaigns', 'https://attacker.example', { slug: 'xlaunchvi' })
    }, 'campaigns', 'admin_upsert_campaign');
    assert.equal(response.status, 403);
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('admin mutations reject executable image URLs before calling a write RPC', async () => {
  const originalFetch = globalThis.fetch;
  const paths = [];
  globalThis.fetch = async (url) => {
    paths.push(String(url));
    if (String(url).endsWith('/auth/v1/user')) {
      return new Response(JSON.stringify({ id: allowedId, email: 'operator@example.test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('{}', { status: 200 });
  };
  try {
    const response = await mutateAdminResource({
      env,
      request: request('campaigns', 'https://portal.example', {
        slug: 'xlaunchvi',
        banner_url: 'javascript:alert(1)'
      }).clone()
    }, 'campaigns', 'admin_upsert_campaign');
    assert.equal(response.status, 400);
    assert.equal(paths.length, 1);
    assert.match(paths[0], /auth\/v1\/user$/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
