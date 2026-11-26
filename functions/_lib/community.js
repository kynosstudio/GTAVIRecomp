import { getSupabaseConfig, isSameOriginRequest, jsonResponse, readJsonBody, safePublicUrl, supabaseFetch } from './supabase.js';
import { requireAdmin } from './admin.js';

const MEDIA_BUCKET = 'community-media';
const MAX_MEDIA_BYTES = 50 * 1024 * 1024;
const MAX_FORM_BYTES = MAX_MEDIA_BYTES + 1024 * 1024;
const PAGE_SIZE = 20;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MEDIA_TYPES = {
  'image/jpeg': { extension: 'jpg', kind: 'image', signature: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  'image/png': { extension: 'png', kind: 'image', signature: (bytes) => bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 },
  'image/webp': { extension: 'webp', kind: 'image', signature: (bytes) => bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 },
  'video/mp4': { extension: 'mp4', kind: 'video', signature: (bytes) => bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70 },
  'video/webm': { extension: 'webm', kind: 'video', signature: (bytes) => bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3 }
};

function serviceConfig(env) {
  const config = getSupabaseConfig(env);
  return config && config.serviceKey ? config : null;
}

function configurationError() {
  return jsonResponse({
    error: 'A comunidade ainda não está configurada no servidor.',
    code: 'COMMUNITY_BACKEND_NOT_CONFIGURED'
  }, 503);
}

function sameOriginError() {
  return jsonResponse({ error: 'Requisição same-origin necessária.', code: 'SAME_ORIGIN_REQUIRED' }, 403);
}

function normalizedText(value, maximum, allowEmpty) {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
  if ((!allowEmpty && !cleaned) || cleaned.length > maximum) return null;
  return cleaned;
}

async function requestJson(config, path, options) {
  const requestOptions = Object.assign({}, options || {});
  const headers = new Headers(requestOptions.headers || {});
  headers.set('apikey', config.serviceKey);
  headers.set('Authorization', `Bearer ${config.serviceKey}`);
  requestOptions.headers = headers;
  const response = await supabaseFetch(config, path, requestOptions);
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }
  return { response, data };
}

function restUrl(path, values) {
  const query = new URLSearchParams(values);
  return `${path}?${query.toString()}`;
}

async function readForm(request) {
  const declaredLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FORM_BYTES) {
    return { error: jsonResponse({ error: 'O envio ultrapassa o limite de 50 MB.' }, 413) };
  }
  if (!request.body) return { error: jsonResponse({ error: 'Formulário vazio.' }, 400) };

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_FORM_BYTES) {
        await reader.cancel();
        return { error: jsonResponse({ error: 'O envio ultrapassa o limite de 50 MB.' }, 413) };
      }
      chunks.push(value);
    }
    const body = new Blob(chunks);
    const parsedRequest = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body
    });
    return { form: await parsedRequest.formData() };
  } catch (error) {
    return { error: jsonResponse({ error: 'Não foi possível ler o formulário enviado.' }, 400) };
  }
}

function selectedFile(form) {
  const value = form.get('media');
  if (!value || typeof value === 'string' || !Number.isFinite(value.size) || value.size === 0) return null;
  return value;
}

async function uploadMedia(config, file) {
  const mimeType = String(file.type || '').toLowerCase();
  const metadata = MEDIA_TYPES[mimeType];
  if (!metadata || file.size > MAX_MEDIA_BYTES) {
    return { error: jsonResponse({ error: 'Use JPG, PNG, WebP, MP4 ou WebM com até 50 MB.' }, 400) };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length !== file.size || bytes.length < 12 || !metadata.signature(bytes)) {
    return { error: jsonResponse({ error: 'O conteúdo do arquivo não corresponde ao formato informado.' }, 400) };
  }
  const path = `${crypto.randomUUID()}.${metadata.extension}`;
  const response = await supabaseFetch(config, `/storage/v1/object/${MEDIA_BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      'Content-Type': mimeType,
      'Cache-Control': '3600',
      'x-upsert': 'false'
    },
    body: bytes
  });
  if (!response.ok) {
    console.error(`Community media upload failed: ${response.status}`);
    return { error: jsonResponse({ error: 'Não foi possível armazenar a mídia com segurança.' }, 502) };
  }
  return { path, kind: metadata.kind };
}

async function deleteMedia(config, path) {
  if (!path) return true;
  const response = await supabaseFetch(config, `/storage/v1/object/${MEDIA_BUCKET}`, {
    method: 'DELETE',
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prefixes: [path] })
  });
  if (!response.ok) {
    console.error(`Community media cleanup failed: ${response.status}`);
    return false;
  }
  return true;
}

async function signMedia(config, path) {
  const { response, data } = await requestJson(config, `/storage/v1/object/sign/${MEDIA_BUCKET}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: 3600 })
  });
  if (!response.ok || !data || typeof (data.signedURL || data.signedUrl) !== 'string') {
    console.error(`Community media signing failed: ${response.status}`);
    return null;
  }
  const signedUrl = data.signedURL || data.signedUrl;
  if (/^https:\/\//i.test(signedUrl)) return signedUrl;
  return `${config.baseUrl}/storage/v1${signedUrl.startsWith('/') ? '' : '/'}${signedUrl}`;
}

function validatePreview(value, linkUrl, requestUrl) {
  if (!value) return {};
  let preview;
  try {
    preview = typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error) {
    throw new Error('A prévia do link não é válida.');
  }
  if (!preview || typeof preview !== 'object' || Array.isArray(preview)) {
    throw new Error('A prévia do link não é válida.');
  }
  return {
    title: normalizedText(preview.title, 180, true) || '',
    description: normalizedText(preview.description, 500, true) || '',
    image: preview.image ? safePublicUrl(preview.image, requestUrl, true) : null,
    domain: new URL(linkUrl, requestUrl).hostname
  };
}

async function insertRow(config, table, record) {
  return requestJson(config, `/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(record)
  });
}

export async function listCommunityPosts(context) {
  const config = serviceConfig(context.env);
  if (!config) return configurationError();
  const offset = Number(new URL(context.request.url).searchParams.get('offset') || 0);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > 10000) {
    return jsonResponse({ error: 'Posição de paginação inválida.' }, 400);
  }
  const now = new Date().toISOString();
  const query = restUrl('/rest/v1/community_posts', {
    select: 'id,author_alias,headline,body,media_path,media_url,media_type,link_url,link_preview,is_sponsored,heart_count,skull_count,comment_count,status,created_at,expires_at',
    status: 'in.(approved,published)',
    or: `(expires_at.is.null,expires_at.gt.${now})`,
    order: 'created_at.desc,id.desc',
    limit: String(PAGE_SIZE),
    offset: String(offset)
  });
  try {
    const { response, data } = await requestJson(config, query, {});
    if (!response.ok || !Array.isArray(data)) {
      console.error(`Community feed query failed: ${response.status}`);
      return jsonResponse({ error: 'Não foi possível carregar o feed agora.' }, 502);
    }
    const posts = await Promise.all(data.map(async (post) => {
      const mediaUrl = post.media_path
        ? await signMedia(config, post.media_path)
        : post.media_url || null;
      let legacyMediaUrl = null;
      if (!post.media_path && post.media_url) {
        try {
          legacyMediaUrl = safePublicUrl(post.media_url, context.request.url, false);
        } catch (error) {
          legacyMediaUrl = null;
        }
      }
      return {
        ...post,
        media_url: post.media_path ? mediaUrl : legacyMediaUrl,
        media_unavailable: Boolean((post.media_path && !mediaUrl) || (post.media_url && !legacyMediaUrl))
      };
    }));
    return jsonResponse({ posts, has_more: posts.length === PAGE_SIZE, next_offset: offset + posts.length });
  } catch (error) {
    console.error('Community feed request failed.');
    return jsonResponse({ error: 'Não foi possível carregar o feed agora.' }, 502);
  }
}

export async function createCommunityPost(context) {
  if (!isSameOriginRequest(context.request)) return sameOriginError();
  const config = serviceConfig(context.env);
  if (!config) return configurationError();
  const parsed = await readForm(context.request);
  if (parsed.error) return parsed.error;
  const form = parsed.form;
  const authorAlias = normalizedText(form.get('nick'), 30, false);
  const body = normalizedText(form.get('text') || '', 2000, true);
  if (!authorAlias || authorAlias.length < 2 || body === null) {
    return jsonResponse({ error: 'Informe um nick de 2 a 30 caracteres e uma legenda de até 2000 caracteres.' }, 400);
  }
  const file = selectedFile(form);
  const linkInput = normalizedText(form.get('link') || '', 500, true);
  let linkUrl = null;
  let linkPreview = {};
  try {
    if (linkInput) {
      linkUrl = safePublicUrl(linkInput, context.request.url, true);
      linkPreview = validatePreview(form.get('link_preview'), linkUrl, context.request.url);
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 400);
  }
  const isSponsored = form.get('is_sponsored') === 'true' || form.get('is_sponsored') === '1';
  if (!body && !file && !linkUrl) {
    return jsonResponse({ error: 'Adicione uma legenda, mídia ou link ao post.' }, 400);
  }
  let uploaded = null;
  if (file) {
    uploaded = await uploadMedia(config, file);
    if (uploaded.error) return uploaded.error;
  }
  const record = {
    author_alias: authorAlias,
    body,
    media_path: uploaded ? uploaded.path : null,
    media_type: uploaded ? uploaded.kind : null,
    link_url: linkUrl,
    link_preview: linkPreview,
    is_sponsored: isSponsored,
    status: uploaded || isSponsored ? 'pending' : 'approved'
  };
  try {
    const { response, data } = await insertRow(config, 'community_posts', record);
    if (!response.ok || !Array.isArray(data) || !data[0]) {
      console.error(`Community post insert failed: ${response.status}`);
      if (uploaded && !await deleteMedia(config, uploaded.path)) {
        return jsonResponse({ error: 'O post não foi criado e a mídia pendente precisa de limpeza administrativa.' }, 502);
      }
      return jsonResponse({ error: 'Não foi possível enviar o post.' }, 400);
    }
    return jsonResponse({
      post: data[0],
      pending: data[0].status === 'pending'
    }, 201);
  } catch (error) {
    console.error('Community post submission failed.');
    if (uploaded && !await deleteMedia(config, uploaded.path)) {
      return jsonResponse({ error: 'O post não foi criado e a mídia pendente precisa de limpeza administrativa.' }, 502);
    }
    return jsonResponse({ error: 'Não foi possível enviar o post.' }, 502);
  }
}

async function hasPublicPost(config, postId) {
  const query = restUrl('/rest/v1/community_posts', {
    select: 'id',
    id: `eq.${postId}`,
    status: 'in.(approved,published)',
    or: `(expires_at.is.null,expires_at.gt.${new Date().toISOString()})`,
    limit: '1'
  });
  const { response, data } = await requestJson(config, query, {});
  return response.ok && Array.isArray(data) && data.length > 0;
}

function validPostId(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export async function listCommunityComments(context, postId) {
  if (!validPostId(postId)) return jsonResponse({ error: 'Post inválido.' }, 400);
  const config = serviceConfig(context.env);
  if (!config) return configurationError();
  try {
    if (!await hasPublicPost(config, postId)) return jsonResponse({ error: 'Post não encontrado.' }, 404);
    const query = restUrl('/rest/v1/community_comments', {
      select: 'id,post_id,author_alias,body,created_at',
      post_id: `eq.${postId}`,
      order: 'created_at.asc',
      limit: '100'
    });
    const { response, data } = await requestJson(config, query, {});
    if (!response.ok || !Array.isArray(data)) {
      console.error(`Community comments query failed: ${response.status}`);
      return jsonResponse({ error: 'Não foi possível carregar os comentários.' }, 502);
    }
    return jsonResponse({ comments: data });
  } catch (error) {
    console.error('Community comments request failed.');
    return jsonResponse({ error: 'Não foi possível carregar os comentários.' }, 502);
  }
}

export async function createCommunityComment(context, postId) {
  if (!isSameOriginRequest(context.request)) return sameOriginError();
  if (!validPostId(postId)) return jsonResponse({ error: 'Post inválido.' }, 400);
  const config = serviceConfig(context.env);
  if (!config) return configurationError();
  const bodyResult = await readJsonBody(context.request, 8192);
  if (bodyResult.error) return bodyResult.error;
  const body = bodyResult.value || {};
  const authorAlias = normalizedText(body.nick || 'Visitante', 30, false);
  const text = normalizedText(body.text, 1000, false);
  if (!authorAlias || authorAlias.length < 2 || !text) {
    return jsonResponse({ error: 'Informe um nick opcional de 2 a 30 caracteres e um comentário de até 1000 caracteres.' }, 400);
  }
  try {
    if (!await hasPublicPost(config, postId)) return jsonResponse({ error: 'Post não encontrado.' }, 404);
    const { response, data } = await insertRow(config, 'community_comments', {
      post_id: postId,
      author_alias: authorAlias,
      body: text
    });
    if (!response.ok || !Array.isArray(data) || !data[0]) {
      console.error(`Community comment insert failed: ${response.status}`);
      return jsonResponse({ error: 'Não foi possível publicar o comentário.' }, 400);
    }
    return jsonResponse({ comment: data[0] }, 201);
  } catch (error) {
    console.error('Community comment submission failed.');
    return jsonResponse({ error: 'Não foi possível publicar o comentário.' }, 502);
  }
}

export async function reactToCommunityPost(context, postId) {
  if (!isSameOriginRequest(context.request)) return sameOriginError();
  if (!validPostId(postId)) return jsonResponse({ error: 'Post inválido.' }, 400);
  const config = serviceConfig(context.env);
  if (!config) return configurationError();
  const bodyResult = await readJsonBody(context.request, 4096);
  if (bodyResult.error) return bodyResult.error;
  const { voter_id: voterId, reaction } = bodyResult.value || {};
  if (!validPostId(voterId) || (reaction !== null && reaction !== 'heart' && reaction !== 'skull')) {
    return jsonResponse({ error: 'Reação inválida.' }, 400);
  }
  try {
    const { response, data } = await requestJson(config, '/rest/v1/rpc/community_cast_reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_post_id: postId, p_voter_id: voterId, p_reaction: reaction })
    });
    if (!response.ok || !data || typeof data.heart_count !== 'number' || typeof data.skull_count !== 'number') {
      console.error(`Community reaction failed: ${response.status}`);
      return jsonResponse({ error: 'Não foi possível registrar a reação.' }, 400);
    }
    return jsonResponse(data);
  } catch (error) {
    console.error('Community reaction request failed.');
    return jsonResponse({ error: 'Não foi possível registrar a reação.' }, 502);
  }
}

export async function createCommunityAd(context) {
  if (!isSameOriginRequest(context.request)) return sameOriginError();
  const config = serviceConfig(context.env);
  if (!config) return configurationError();
  const parsed = await readForm(context.request);
  if (parsed.error) return parsed.error;
  const form = parsed.form;
  const advertiserName = normalizedText(form.get('name'), 100, false);
  const email = normalizedText(form.get('email'), 254, false);
  const title = normalizedText(form.get('title'), 120, false);
  const description = normalizedText(form.get('description'), 1000, false);
  const destinationInput = normalizedText(form.get('url'), 500, false);
  const duration = Number(form.get('days') || 7);
  if (!advertiserName || advertiserName.length < 2 || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !title || title.length < 3 || !description || !destinationInput
    || !Number.isInteger(duration) || duration < 1 || duration > 90) {
    return jsonResponse({ error: 'Revise nome, e-mail, título, descrição e duração do anúncio.' }, 400);
  }
  let destinationUrl;
  try {
    destinationUrl = safePublicUrl(destinationInput, context.request.url, true);
  } catch (error) {
    return jsonResponse({ error: 'O link do anúncio deve ser HTTPS e não pode conter credenciais.' }, 400);
  }
  const file = selectedFile(form);
  let uploaded = null;
  if (file) {
    uploaded = await uploadMedia(config, file);
    if (uploaded.error) return uploaded.error;
  }
  try {
    const { response, data } = await insertRow(config, 'community_ads', {
      advertiser_name: advertiserName,
      contact_email: email,
      title,
      description,
      destination_url: destinationUrl,
      media_path: uploaded ? uploaded.path : null,
      media_type: uploaded ? uploaded.kind : null,
      duration_days: duration,
      payment_status: 'quote_requested',
      status: 'pending'
    });
    if (!response.ok || !Array.isArray(data) || !data[0]) {
      console.error(`Community ad request insert failed: ${response.status}`);
      if (uploaded && !await deleteMedia(config, uploaded.path)) {
        return jsonResponse({ error: 'A solicitação não foi criada e a mídia privada precisa de limpeza administrativa.' }, 502);
      }
      return jsonResponse({ error: 'Não foi possível enviar a solicitação de anúncio.' }, 400);
    }
    return jsonResponse({ request_id: data[0].id, status: data[0].status }, 201);
  } catch (error) {
    console.error('Community ad submission failed.');
    if (uploaded && !await deleteMedia(config, uploaded.path)) {
      return jsonResponse({ error: 'A solicitação não foi criada e a mídia privada precisa de limpeza administrativa.' }, 502);
    }
    return jsonResponse({ error: 'Não foi possível enviar a solicitação de anúncio.' }, 502);
  }
}

async function signRows(config, rows) {
  return Promise.all(rows.map(async (row) => {
    const mediaUrl = row.media_path ? await signMedia(config, row.media_path) : null;
    return {
      ...row,
      media_url: mediaUrl,
      media_unavailable: Boolean(row.media_path && !mediaUrl)
    };
  }));
}

export async function listAdminCommunity(context) {
  const auth = await requireAdmin(context);
  if (auth.response) return auth.response;
  const config = serviceConfig(context.env);
  if (!config) return configurationError();
  const postsQuery = restUrl('/rest/v1/community_posts', {
    select: 'id,author_alias,headline,body,media_path,media_type,link_url,is_sponsored,status,heart_count,skull_count,comment_count,created_at,expires_at',
    order: 'created_at.desc',
    limit: '100'
  });
  const adsQuery = restUrl('/rest/v1/community_ads', {
    select: 'id,advertiser_name,contact_email,title,description,destination_url,media_path,media_type,duration_days,payment_status,status,post_id,expires_at,created_at',
    order: 'created_at.desc',
    limit: '100'
  });
  try {
    const [postResult, adResult] = await Promise.all([
      requestJson(config, postsQuery, {}),
      requestJson(config, adsQuery, {})
    ]);
    if (!postResult.response.ok || !Array.isArray(postResult.data)
      || !adResult.response.ok || !Array.isArray(adResult.data)) {
      console.error(`Admin community query failed: posts ${postResult.response.status}, ads ${adResult.response.status}`);
      return jsonResponse({ error: 'Não foi possível carregar a moderação da comunidade.' }, 502);
    }
    const [posts, ads] = await Promise.all([
      signRows(config, postResult.data),
      signRows(config, adResult.data)
    ]);
    return jsonResponse({ posts, ads });
  } catch (error) {
    console.error('Admin community list failed.');
    return jsonResponse({ error: 'Não foi possível carregar a moderação da comunidade.' }, 502);
  }
}

export async function moderateCommunity(context) {
  if (!isSameOriginRequest(context.request)) return sameOriginError();
  const auth = await requireAdmin(context);
  if (auth.response) return auth.response;
  const config = serviceConfig(context.env);
  if (!config) return configurationError();
  const bodyResult = await readJsonBody(context.request, 8192);
  if (bodyResult.error) return bodyResult.error;
  const body = bodyResult.value || {};
  const entity = body.entity;
  const id = body.id;
  const action = body.action;
  if (!validPostId(id)) return jsonResponse({ error: 'Registro de comunidade inválido.' }, 400);

  try {
    if (entity === 'post' && ['approve', 'reject', 'delete'].includes(action)) {
      const { response, data } = await requestJson(config, '/rest/v1/rpc/admin_moderate_community_post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_post_id: id, p_action: action, p_actor: auth.user.id })
      });
      if (!response.ok || !data) {
        console.error(`Admin community post moderation failed: ${response.status}`);
        return jsonResponse({ error: 'O banco de dados não aceitou a moderação do post.' }, 400);
      }
      if (action === 'delete' && data.media_path && !await deleteMedia(config, data.media_path)) {
        return jsonResponse({ error: 'O post foi excluído, mas a mídia privada não pôde ser removida.' }, 502);
      }
      return jsonResponse({ saved: true, record: data });
    }

    if (entity === 'ad' && ['approve', 'reject'].includes(action)) {
      const paymentStatus = body.payment_status;
      if (!['quote_requested', 'paid', 'waived', 'refunded'].includes(paymentStatus)) {
        return jsonResponse({ error: 'Status de pagamento inválido.' }, 400);
      }
      const { response, data } = await requestJson(config, '/rest/v1/rpc/admin_review_community_ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_ad_id: id,
          p_action: action,
          p_payment_status: paymentStatus,
          p_actor: auth.user.id
        })
      });
      if (!response.ok || !data) {
        console.error(`Admin community ad review failed: ${response.status}`);
        return jsonResponse({
          error: action === 'approve'
            ? 'Aprove somente após registrar pagamento ou isenção.'
            : 'O banco de dados não aceitou a revisão do anúncio.'
        }, 400);
      }
      return jsonResponse({ saved: true, record: data });
    }
    return jsonResponse({ error: 'Ação de moderação inválida.' }, 400);
  } catch (error) {
    console.error('Admin community moderation request failed.');
    return jsonResponse({ error: 'Não foi possível concluir a moderação.' }, 502);
  }
}
