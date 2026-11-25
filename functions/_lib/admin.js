import { getSupabaseConfig, isSameOriginRequest, jsonResponse, readJsonBody, safePublicUrl, supabaseFetch } from './supabase.js';

const SESSION_COOKIE = 'kynos_operator';
const ADMIN_USER_ENDPOINT = '/auth/v1/user';
const RESOURCE_CONFIG = {
  campaigns: {
    table: 'campaigns',
    select: 'id,slug,title,summary,description,goal_amount,banner_url,color_start,color_end,gradient_angle,pix_key,qr_code_url,xlaunch_percent,kynos_maintenance_percent,status,is_active,created_at,updated_at',
    order: 'updated_at.desc'
  },
  donations: {
    table: 'donations',
    select: 'id,campaign_id,amount,donor_alias,message,status,show_in_ranking,created_at,confirmed_at',
    order: 'created_at.desc'
  },
  news: {
    table: 'news_posts',
    select: 'id,slug,category,title,summary,body,source_url,status,published_at,created_at,updated_at',
    order: 'created_at.desc'
  },
  tracker: {
    table: 'tracker_updates',
    select: 'id,project_id,project_name,percent,milestone,summary,source_url,status,published_at,created_at,updated_at',
    order: 'created_at.desc'
  }
};

function getAllowedUserIds(env) {
  return String(env.ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim().toLowerCase())
    .filter(Boolean);
}

function getCookie(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const entry = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!entry) return '';
  try {
    return decodeURIComponent(entry.slice(SESSION_COOKIE.length + 1));
  } catch (error) {
    return '';
  }
}

function sessionCookie(token, maxAge) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/api/admin; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

function clearedSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/api/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

async function authUser(config, token) {
  const response = await supabaseFetch(config, ADMIN_USER_ENDPOINT, {
    headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  const user = await response.json();
  return user && typeof user.id === 'string' ? user : null;
}

export async function requireAdmin(context) {
  const config = getSupabaseConfig(context.env);
  const allowedIds = getAllowedUserIds(context.env);
  if (!config || !config.serviceKey || !allowedIds.length) {
    return { response: jsonResponse({ error: 'Admin backend is not configured.' }, 503) };
  }
  const token = getCookie(context.request);
  if (!token) return { response: jsonResponse({ error: 'Operator session required.' }, 401) };
  try {
    const user = await authUser(config, token);
    if (!user || !allowedIds.includes(user.id.toLowerCase())) {
      return { response: jsonResponse({ error: 'Operator session is not authorized.' }, 401) };
    }
    return { config, user };
  } catch (error) {
    console.error('Admin session validation failed.');
    return { response: jsonResponse({ error: 'Could not validate operator session.' }, 502) };
  }
}

export async function login(context) {
  if (!isSameOriginRequest(context.request)) return jsonResponse({ error: 'Same-origin request required.' }, 403);
  const config = getSupabaseConfig(context.env);
  const allowedIds = getAllowedUserIds(context.env);
  if (!config || !config.serviceKey || !allowedIds.length) return jsonResponse({ error: 'Admin authentication is not configured.' }, 503);
  const body = await readJsonBody(context.request, 8192);
  if (body.error) return body.error;
  const email = body.value && typeof body.value.email === 'string' ? body.value.email.trim() : '';
  const password = body.value && typeof body.value.password === 'string' ? body.value.password : '';
  if (!email || email.length > 254 || !password || password.length > 1024) {
    return jsonResponse({ error: 'Enter a valid operator email and password.' }, 400);
  }
  try {
    const response = await supabaseFetch(config, '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = response.ok ? await response.json() : null;
    if (!result || !result.access_token || !result.user || !allowedIds.includes(String(result.user.id).toLowerCase())) {
      return jsonResponse({ error: 'Authentication failed or this account is not an authorized operator.' }, 401);
    }
    const age = Math.max(60, Math.min(Number(result.expires_in) || 3600, 3600));
    return jsonResponse({ authenticated: true, email: result.user.email || '' }, 200, {
      'Set-Cookie': sessionCookie(result.access_token, age)
    });
  } catch (error) {
    console.error('Admin sign-in request failed.');
    return jsonResponse({ error: 'Authentication service is unavailable.' }, 502);
  }
}

export async function session(context) {
  const result = await requireAdmin(context);
  if (result.response) return result.response;
  return jsonResponse({ authenticated: true, email: result.user.email || '' }, 200);
}

export async function logout(context) {
  if (!isSameOriginRequest(context.request)) return jsonResponse({ error: 'Same-origin request required.' }, 403);
  return jsonResponse({ authenticated: false }, 200, { 'Set-Cookie': clearedSessionCookie() });
}

export async function listAdminResource(context, resource) {
  const auth = await requireAdmin(context);
  if (auth.response) return auth.response;
  const config = RESOURCE_CONFIG[resource];
  if (!config) return jsonResponse({ error: 'Unknown admin resource.' }, 404);
  try {
    const query = new URLSearchParams({ select: config.select, order: config.order });
    if (resource !== 'campaigns') query.set('limit', '100');
    const response = await supabaseFetch(auth.config, `/rest/v1/${config.table}?${query.toString()}`, {
      headers: { apikey: auth.config.serviceKey, Authorization: `Bearer ${auth.config.serviceKey}` }
    });
    if (!response.ok) {
      console.error(`Admin list query failed for ${resource}: ${response.status}`);
      return jsonResponse({ error: 'Could not load management records.' }, 502);
    }
    return jsonResponse({ items: await response.json() }, 200);
  } catch (error) {
    console.error(`Admin list request failed for ${resource}.`);
    return jsonResponse({ error: 'Could not load management records.' }, 502);
  }
}

function validatePublicFields(resource, payload, requestUrl) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Request must contain an object.');
  const value = Object.assign({}, payload);
  if (resource === 'campaigns') {
    value.banner_url = safePublicUrl(value.banner_url, requestUrl, false);
    value.qr_code_url = safePublicUrl(value.qr_code_url, requestUrl, false);
  }
  if (resource === 'news' || resource === 'tracker') {
    value.source_url = safePublicUrl(value.source_url, requestUrl, true);
  }
  return value;
}

export async function mutateAdminResource(context, resource, rpcName) {
  if (!isSameOriginRequest(context.request)) return jsonResponse({ error: 'Same-origin request required.' }, 403);
  const auth = await requireAdmin(context);
  if (auth.response) return auth.response;
  const body = await readJsonBody(context.request, 65536);
  if (body.error) return body.error;
  let payload;
  try {
    payload = validatePublicFields(resource, body.value, context.request.url);
  } catch (error) {
    return jsonResponse({ error: error.message }, 400);
  }
  try {
    const response = await supabaseFetch(auth.config, `/rest/v1/rpc/${rpcName}`, {
      method: 'POST',
      headers: {
        apikey: auth.config.serviceKey,
        Authorization: `Bearer ${auth.config.serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ p_payload: payload, p_actor: auth.user.id })
    });
    if (!response.ok) {
      console.error(`Admin mutation failed for ${resource}: ${response.status}`);
      return jsonResponse({ error: 'The database rejected the change. Check required fields and try again.' }, 400);
    }
    const result = await response.json();
    return jsonResponse({ saved: true, record: Array.isArray(result) ? result[0] : result }, 200);
  } catch (error) {
    console.error(`Admin mutation request failed for ${resource}.`);
    return jsonResponse({ error: 'Could not save this record.' }, 502);
  }
}
