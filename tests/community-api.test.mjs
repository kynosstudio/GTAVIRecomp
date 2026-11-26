import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCommunityAd,
  createCommunityComment,
  createCommunityPost,
  listAdminCommunity,
  reactToCommunityPost,
  listCommunityPosts
} from '../functions/_lib/community.js';

const env = {
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'public-test-key',
  SUPABASE_SERVICE_ROLE_KEY: 'private-test-key'
};

function formRequest(form, origin = 'https://portal.example') {
  return new Request('https://portal.example/api/community/posts', {
    method: 'POST',
    headers: { Origin: origin },
    body: form
  });
}

test('text-only community posts publish without exposing service credentials', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), headers: new Headers(options.headers), body: options.body });
    return new Response(JSON.stringify([{
      id: '1c87c8ef-5ea0-4b54-a2ac-6bcda30d4c70',
      author_alias: 'GamerBR',
      body: 'Meu primeiro post',
      status: 'approved'
    }]), { status: 201, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const form = new FormData();
    form.set('nick', 'GamerBR');
    form.set('text', 'Meu primeiro post');
    const response = await createCommunityPost({ env, request: formRequest(form) });
    const result = await response.json();
    assert.equal(response.status, 201);
    assert.equal(result.pending, false);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].headers.get('Authorization'), 'Bearer private-test-key');
    assert.equal(JSON.parse(requests[0].body).status, 'approved');
    assert.equal(JSON.parse(requests[0].body).media_path, null);
    assert.doesNotMatch(JSON.stringify(result), /private-test-key/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('media posts are uploaded privately and submitted for moderation', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), headers: new Headers(options.headers), body: options.body });
    if (String(url).includes('/storage/v1/object/community-media/')) {
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const payload = JSON.parse(options.body);
    return new Response(JSON.stringify([{
      id: '1c87c8ef-5ea0-4b54-a2ac-6bcda30d4c70',
      status: payload.status,
      media_path: payload.media_path
    }]), { status: 201, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const form = new FormData();
    form.set('nick', 'GamerBR');
    form.set('text', 'Confira a captura');
    form.append('media', new Blob([
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
    ], { type: 'image/png' }), 'capture.png');
    const response = await createCommunityPost({ env, request: formRequest(form) });
    const result = await response.json();
    const row = JSON.parse(requests.find((item) => item.url.includes('/rest/v1/community_posts')).body);
    assert.equal(response.status, 201);
    assert.equal(result.pending, true);
    assert.equal(row.status, 'pending');
    assert.equal(row.media_type, 'image');
    assert.match(row.media_path, /^[0-9a-f-]{36}\.png$/);
    assert.ok(requests.some((item) => item.url.includes('/storage/v1/object/community-media/')));
    assert.ok(requests.every((item) => item.headers.get('Authorization') === 'Bearer private-test-key'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('cross-origin submissions are rejected before reaching Supabase', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response('{}', { status: 200 });
  };
  try {
    const form = new FormData();
    form.set('nick', 'GamerBR');
    form.set('text', 'Tentativa externa');
    const response = await createCommunityPost({
      env,
      request: formRequest(form, 'https://attacker.example')
    });
    assert.equal(response.status, 403);
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('public feed returns only approved posts and signs private media', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), headers: new Headers(options.headers) });
    if (String(url).includes('/storage/v1/object/sign/')) {
      return new Response(JSON.stringify({ signedURL: '/object/sign/community-media/media.png?token=short-lived' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify([{
      id: '1c87c8ef-5ea0-4b54-a2ac-6bcda30d4c70',
      status: 'approved',
      media_path: 'b6f85b62-512c-4c62-9aa4-a7739ce512cb.png',
      heart_count: 2,
      skull_count: 0
    }]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const response = await listCommunityPosts({
      env,
      request: new Request('https://portal.example/api/community/posts')
    });
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.posts.length, 1);
    assert.equal(result.posts[0].status, 'approved');
    assert.equal(result.posts[0].media_url, 'https://project.supabase.co/storage/v1/object/sign/community-media/media.png?token=short-lived');
    assert.ok(requests[0].url.includes('status=in.%28approved%2Cpublished%29'));
    assert.ok(requests.every((item) => item.headers.get('Authorization') === 'Bearer private-test-key'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('comments are open to visitors and treated as plain text data', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), body: options.body });
    if (String(url).includes('/rest/v1/community_posts?')) {
      return new Response(JSON.stringify([{ id: '1c87c8ef-5ea0-4b54-a2ac-6bcda30d4c70' }]), { status: 200 });
    }
    return new Response(JSON.stringify([{
      id: '8b8ba89d-84a4-4a81-aeac-f3dfd00c7ca1',
      author_alias: 'Visitante',
      body: '<script>alert(1)</script>'
    }]), { status: 201 });
  };
  try {
    const request = new Request('https://portal.example/api/community/posts/1c87c8ef-5ea0-4b54-a2ac-6bcda30d4c70/comments', {
      method: 'POST',
      headers: { Origin: 'https://portal.example', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '<script>alert(1)</script>' })
    });
    const response = await createCommunityComment({
      env,
      request
    }, '1c87c8ef-5ea0-4b54-a2ac-6bcda30d4c70');
    const result = await response.json();
    assert.equal(response.status, 201);
    assert.equal(result.comment.author_alias, 'Visitante');
    assert.equal(result.comment.body, '<script>alert(1)</script>');
    assert.equal(requests.length, 2);
    assert.equal(JSON.parse(requests[1].body).body, '<script>alert(1)</script>');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('announcement requests remain pending until an administrator reviews payment', async () => {
  const originalFetch = globalThis.fetch;
  let inserted;
  globalThis.fetch = async (url, options) => {
    inserted = JSON.parse(options.body);
    return new Response(JSON.stringify([{ id: '1c87c8ef-5ea0-4b54-a2ac-6bcda30d4c70', status: 'pending' }]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  };
  try {
    const form = new FormData();
    form.set('name', 'Loja Gamer');
    form.set('email', 'contato@example.test');
    form.set('title', 'Oferta de hardware');
    form.set('description', 'Promoção da semana');
    form.set('url', 'https://example.test/oferta');
    form.set('days', '7');
    const request = new Request('https://portal.example/api/community/ads', {
      method: 'POST',
      headers: { Origin: 'https://portal.example' },
      body: form
    });
    const response = await createCommunityAd({ env, request });
    const result = await response.json();
    assert.equal(response.status, 201);
    assert.equal(result.status, 'pending');
    assert.equal(inserted.payment_status, 'quote_requested');
    assert.equal(inserted.status, 'pending');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('reaction updates are delegated to the atomic database RPC', async () => {
  const originalFetch = globalThis.fetch;
  let rpcRequest;
  globalThis.fetch = async (url, options) => {
    rpcRequest = { url: String(url), body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ heart_count: 7, skull_count: 1, reaction: 'heart' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
  try {
    const response = await reactToCommunityPost({
      env,
      request: new Request('https://portal.example/api/community/posts/1c87c8ef-5ea0-4b54-a2ac-6bcda30d4c70/reactions', {
        method: 'POST',
        headers: { Origin: 'https://portal.example', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_id: 'b6f85b62-512c-4c62-9aa4-a7739ce512cb',
          reaction: 'heart'
        })
      })
    }, '1c87c8ef-5ea0-4b54-a2ac-6bcda30d4c70');
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.heart_count, 7);
    assert.match(rpcRequest.url, /rpc\/community_cast_reaction$/);
    assert.equal(rpcRequest.body.p_reaction, 'heart');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('community moderation API requires an authorized operator session', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response('{}', { status: 200 });
  };
  try {
    const response = await listAdminCommunity({
      env: Object.assign({}, env, { ADMIN_USER_IDS: 'c91e90ac-55e0-4bfc-a8b7-37c3a95a79dd' }),
      request: new Request('https://portal.example/api/admin/community')
    });
    assert.equal(response.status, 401);
    assert.equal(fetchCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
