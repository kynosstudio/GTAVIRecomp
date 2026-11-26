const config = () => {
  const value = globalThis.KynosCommunityConfig;
  return value && typeof value === 'object' ? value : {};
};

async function requestJson(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`O serviço respondeu HTTP ${response.status}.`);
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

function requireKey(key, provider) {
  const value = config()[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Integração ${provider} não configurada. O administrador precisa fornecer uma chave com restrições de origem.`);
  }
  return value.trim();
}

export async function searchGifs(query) {
  const apiKey = requireKey('giphyApiKey', 'GIPHY');
  const search = String(query || '').trim().slice(0, 80);
  if (!search) return [];
  const url = new URL('https://api.giphy.com/v1/gifs/search');
  url.search = new URLSearchParams({
    api_key: apiKey,
    q: search,
    limit: '8',
    rating: 'pg-13',
    lang: 'pt'
  }).toString();
  const result = await requestJson(url.href);
  return (Array.isArray(result.data) ? result.data : []).map((item) => {
    const images = item && item.images && typeof item.images === 'object' ? item.images : {};
    const image = images.original || {};
    const mediaUrl = typeof image.url === 'string' ? image.url : '';
    const previewUrl = String((images.fixed_width_small && images.fixed_width_small.url) || mediaUrl);
    try {
      const media = new URL(mediaUrl);
      const preview = new URL(previewUrl);
      if (!/^media\d+\.giphy\.com$/i.test(media.hostname)
        || !/^media\d+\.giphy\.com$/i.test(preview.hostname)
        || !/^\/media\/[A-Za-z0-9]+\/giphy\.gif$/i.test(media.pathname)
        || !/^https:$/.test(media.protocol)
        || !/^https:$/.test(preview.protocol)) return null;
      return {
        id: String(item.id || ''),
        title: String(item.title || 'GIF'),
        previewUrl: preview.href,
        mediaUrl: `${media.origin}${media.pathname}`
      };
    } catch {
      return null;
    }
  }).filter(Boolean);
}

export async function loadWeather(city) {
  const apiKey = requireKey('openWeatherMapApiKey', 'OpenWeatherMap');
  const search = String(city || '').trim().slice(0, 80);
  if (!search) throw new Error('Informe uma cidade para consultar o clima.');
  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.search = new URLSearchParams({
    appid: apiKey,
    q: search,
    units: 'metric',
    lang: 'pt_br'
  }).toString();
  const result = await requestJson(url.href);
  return {
    city: String(result.name || search),
    temperature: Number(result.main && result.main.temp),
    description: String(result.weather && result.weather[0] && result.weather[0].description || ''),
    icon: String(result.weather && result.weather[0] && result.weather[0].icon || '')
  };
}

export async function loadTicker(symbol) {
  const apiKey = requireKey('apiNinjasApiKey', 'API Ninjas');
  const ticker = String(symbol || '').trim().toUpperCase();
  if (!/^[A-Z0-9.-]{1,12}$/.test(ticker)) throw new Error('Símbolo de cotação inválido.');
  const url = new URL('https://api.api-ninjas.com/v1/stockprice');
  url.searchParams.set('ticker', ticker);
  const result = await requestJson(url.href, { headers: { 'X-Api-Key': apiKey } });
  if (!result || !Number.isFinite(Number(result.price))) throw new Error('O serviço não retornou uma cotação válida.');
  return {
    ticker: String(result.ticker || ticker),
    price: Number(result.price),
    currency: String(result.currency || 'USD')
  };
}
