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

function getAdminSetup(env) {
  const config = getSupabaseConfig(env);
  const allowedIds = getAllowedUserIds(env);
  const missing = [];
  if (!config) missing.push('SUPABASE_URL (invalid URL or configuration)');
  if (!config || !config.serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!allowedIds.length) missing.push('ADMIN_USER_IDS');
  return { config, allowedIds, missing };
}

function adminConfigurationError(missing) {
  return jsonResponse({
    error: `Admin backend is not configured. Set these server variables: ${missing.join(', ')}.`,
    code: 'ADMIN_BACKEND_NOT_CONFIGURED',
    missing
  }, 503);
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
  const setup = getAdminSetup(context.env);
  if (setup.missing.length) return { response: adminConfigurationError(setup.missing) };
  const { config, allowedIds } = setup;
  const token = getCookie(context.request);
  if (!token) {
    return { response: jsonResponse({
      error: 'Operator session required.',
      code: 'OPERATOR_SESSION_REQUIRED'
    }, 401) };
  }
  try {
    const user = await authUser(config, token);
    if (!user || !allowedIds.includes(user.id.toLowerCase())) {
      return { response: jsonResponse({
        error: 'Operator session is not authorized.',
        code: 'OPERATOR_SESSION_NOT_AUTHORIZED'
      }, 401) };
    }
    return { config, user };
  } catch (error) {
    console.error('Admin session validation failed.');
    return { response: jsonResponse({ error: 'Could not validate operator session.' }, 502) };
  }
}

export async function login(context) {
  if (!isSameOriginRequest(context.request)) {
    return jsonResponse({ error: 'Same-origin request required.', code: 'SAME_ORIGIN_REQUIRED' }, 403);
  }
  const setup = getAdminSetup(context.env);
  if (setup.missing.length) return adminConfigurationError(setup.missing);
  const { config, allowedIds } = setup;
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
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      const authCode = result && (result.code || result.error_code);
      if (authCode === 'email_not_confirmed') {
        return jsonResponse({
          error: 'This Supabase Auth user exists but its email is not confirmed. Confirm it in Supabase Auth, then try again.',
          code: 'AUTH_EMAIL_NOT_CONFIRMED'
        }, 401);
      }
      if (response.status >= 500 || response.status === 429) {
        return jsonResponse({
          error: 'Supabase Auth is temporarily unavailable. Check the Supabase project URL and public key, then try again.',
          code: 'AUTH_SERVICE_UNAVAILABLE'
        }, 502);
      }
      return jsonResponse({
        error: 'Supabase Auth did not accept these credentials. Confirm the user exists and is enabled in Supabase Auth, and check the email and password.',
        code: 'AUTH_INVALID_CREDENTIALS'
      }, 401);
    }
    if (!result || !result.access_token || !result.user || typeof result.user.id !== 'string') {
      return jsonResponse({
        error: 'Supabase Auth returned an invalid sign-in response.',
        code: 'AUTH_RESPONSE_INVALID'
      }, 502);
    }
    if (!allowedIds.includes(result.user.id.toLowerCase())) {
      return jsonResponse({
        error: 'Supabase Auth accepted this account, but its UID is not listed in the server variable ADMIN_USER_IDS. Add the operator UID there and try again.',
        code: 'OPERATOR_NOT_ALLOWLISTED'
      }, 403);
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
  if (!isSameOriginRequest(context.request)) {
    return jsonResponse({ error: 'Same-origin request required.', code: 'SAME_ORIGIN_REQUIRED' }, 403);
  }
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
