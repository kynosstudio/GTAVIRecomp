const DEFAULT_SUPABASE_URL = 'https://fefvytprogasugctxdom.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xhdlCMR97qQGNiIXtx1s2g_-V9jVpPy';

export function jsonResponse(payload, status, headers) {
  const responseHeaders = new Headers(headers || {});
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
  responseHeaders.set('Cache-Control', 'no-store');
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  return new Response(JSON.stringify(payload), { status: status || 200, headers: responseHeaders });
}

export function getSupabaseConfig(env) {
  const settings = env || {};
  const urlValue = settings.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = settings.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = settings.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!urlValue || !anonKey) return null;
  try {
    const url = new URL(urlValue);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') return null;
    if (url.username || url.password) return null;
    return {
      baseUrl: url.origin,
      anonKey,
      serviceKey: serviceKey || ''
    };
  } catch (error) {
    return null;
  }
}

export async function readJsonBody(request, maximumBytes) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > (maximumBytes || 65536)) {
    return { error: jsonResponse({ error: 'Request body is too large.' }, 413) };
  }
  try {
    return { value: JSON.parse(raw) };
  } catch (error) {
    return { error: jsonResponse({ error: 'Invalid JSON body.' }, 400) };
  }
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch (error) {
    return false;
  }
}

export function safePublicUrl(value, requestUrl, externalHttpsOnly) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > 2048 || /[\u0000-\u001f\\]/.test(value)) {
    throw new Error('Invalid public URL.');
  }
  const raw = value.trim();
  if (/^(javascript|data|vbscript):/i.test(raw) || raw.startsWith('//')) {
    throw new Error('Invalid public URL.');
  }
  let url;
  try {
    url = new URL(raw, requestUrl);
  } catch (error) {
    throw new Error('Invalid public URL.');
  }
  if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.origin === new URL(requestUrl).origin))) {
    throw new Error('Invalid public URL.');
  }
  if (externalHttpsOnly && url.protocol !== 'https:') throw new Error('External source URLs must use HTTPS.');
  if (raw.startsWith('/') && !raw.startsWith('//')) return `${url.pathname}${url.search}${url.hash}`;
  if (url.origin === new URL(requestUrl).origin) return `${url.pathname}${url.search}${url.hash}`;
  return url.href;
}

export async function supabaseFetch(config, path, options) {
  const requestOptions = Object.assign({}, options || {});
  const headers = new Headers(requestOptions.headers || {});
  requestOptions.headers = headers;
  return fetch(`${config.baseUrl}${path}`, requestOptions);
}
