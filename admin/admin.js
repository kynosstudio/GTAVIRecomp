(function () {
  'use strict';

  // Load configuration from config.js (injected at build time or loaded at runtime)
  const config = window.KynosAdminConfig || {};
  const SUPABASE_URL = config.supabase?.url || 'https://fefvytprogasugctxdom.supabase.co';
  const SUPABASE_ANON_KEY = config.supabase?.anonKey || 'sb_publishable_xhdlCMR97qQGNiIXtx1s2g_-V9jVpPy';
  const ADMIN_USER_IDS = config.adminUserIds || [];

  const SESSION_STORAGE_KEY = 'kynos_admin_session';
  const SESSION_EXPIRY_KEY = 'kynos_admin_session_expiry';

  const data = { campaigns: [], donations: [], news: [], tracker: [] };
  const loginForm = document.getElementById('login-form');
  const loginStatus = document.getElementById('login-status');
  const adminMode = document.getElementById('admin-mode');
  const workspace = document.getElementById('admin-workspace');
  const logoutButton = document.getElementById('logout-button');
  const campaignSelect = document.getElementById('campaign-edit-select');
  const newsSelect = document.getElementById('news-edit-select');
  const trackerSelect = document.getElementById('tracker-edit-select');

  let supabase = null;

  function setStatus(id, message, isError) {
    const node = document.getElementById(id);
    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(isError));
  }

  async function loadSupabase() {
    if (supabase) return supabase;

    // Load @supabase/supabase-js from CDN
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Supabase SDK'));
      document.head.appendChild(script);
    });

    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false, // We handle session storage manually
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
    return supabase;
  }

  function getStoredSession() {
    try {
      const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
      if (token && expiry && Date.now() < parseInt(expiry, 10)) {
        return token;
      }
    } catch (e) {
      // Ignore storage errors
    }
    return null;
  }

  function storeSession(token, expiresIn) {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, token);
      sessionStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
    } catch (e) {
      // Ignore storage errors
    }
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    } catch (e) {
      // Ignore storage errors
    }
  }

  function isAuthorized(user) {
    if (!user || !user.id) return false;
    // Check client-side allowlist (ADMIN_USER_IDS)
    // Note: The database also enforces this via public.is_admin() which checks public.admins table
    return ADMIN_USER_IDS.length === 0 || ADMIN_USER_IDS.includes(user.id.toLowerCase());
  }

  async function supabaseRequest(fn) {
    const token = getStoredSession();
    if (!token) throw new Error('No active session');

    const client = await loadSupabase();
    // Set the auth token for this request
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      clearSession();
      throw new Error('Session expired. Please sign in again.');
    }

    // Verify user is still authorized
    if (!isAuthorized(data.user)) {
      clearSession();
      throw new Error('User no longer authorized.');
    }

    return fn(client, data.user);
  }

  function field(form, name) {
    return form.elements.namedItem(name);
  }

  function fieldValue(form, name) {
    const input = field(form, name);
    return input ? input.value.trim() : '';
  }

  function setField(form, name, value) {
    const input = field(form, name);
    if (!input) return;
    if (input.type === 'checkbox') input.checked = Boolean(value);
    else input.value = value === null || value === undefined ? '' : String(value);
  }

  function resetForm(name) {
    const form = document.getElementById(`${name}-form`);
    form.reset();
    setField(form, 'id', '');
    if (name === 'campaign') {
      setField(form, 'pix_key', 'kynos.studio@gmail.com');
      setField(form, 'color_start', '#ff7b47');
      setField(form, 'color_end', '#8157e8');
      setField(form, 'gradient_angle', 125);
      setField(form, 'status', 'draft');
      campaignSelect.value = '';
    } else if (name === 'donation') {
      setField(form, 'status', 'pending');
      setField(form, 'show_in_ranking', true);
    } else if (name === 'news') {
      setField(form, 'category', 'Comunidade');
      setField(form, 'status', 'draft');
      newsSelect.value = '';
    } else if (name === 'tracker') {
      setField(form, 'status', 'draft');
      trackerSelect.value = '';
    }
  }

  function fillForm(name, record) {
    const form = document.getElementById(`${name}-form`);
    Object.keys(record).forEach((key) => setField(form, key, record[key]));
  }

  function createOptions(select, items, labelFor, includeNew) {
    select.replaceChildren();
    if (includeNew) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Nova entrada';
      select.append(option);
    }
    items.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = labelFor(item);
      select.append(option);
    });
  }

  function renderRecords(containerId, items, titleFor, detailFor, actionsFor) {
    const container = document.getElementById(containerId);
    container.replaceChildren();
    const list = document.createElement('div');
    list.className = 'admin-records';
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'admin-empty';
      empty.textContent = 'Nenhum registro ainda.';
      list.append(empty);
    }
    items.forEach((record) => {
      const row = document.createElement('article');
      row.className = 'admin-record';
      const copy = document.createElement('div');
      copy.className = 'admin-record-copy';
      const title = document.createElement('strong');
      title.textContent = titleFor(record);
      const detail = document.createElement('small');
      detail.textContent = detailFor(record);
      copy.append(title, detail);
      row.append(copy);
      const actions = document.createElement('div');
      actions.className = 'admin-record-actions';
      actionsFor(record, actions);
      if (actions.childElementCount) row.append(actions);
      list.append(row);
    });
    container.append(list);
  }

  function editButton(actions, label, callback) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', callback);
    actions.append(button);
  }

  function renderLists() {
    createOptions(campaignSelect, data.campaigns, (item) => `${item.title} · ${item.status}`, true);
    createOptions(newsSelect, data.news, (item) => `${item.title} · ${item.status}`, true);
    createOptions(trackerSelect, data.tracker, (item) => `${item.project_name} · ${item.status}`, true);
    const donationCampaign = field(document.getElementById('donation-form'), 'campaign_id');
    donationCampaign.replaceChildren();
    data.campaigns.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = `${item.title} · ${item.status}`;
      donationCampaign.append(option);
    });

    renderRecords('donation-records', data.donations,
      (item) => `${item.donor_alias || 'Apoiador anônimo'} · ${Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      (item) => `${item.status} · ${item.created_at ? new Date(item.created_at).toLocaleString('pt-BR') : 'data não informada'}`,
      (item, actions) => {
        if (item.status === 'pending') {
          editButton(actions, 'Confirmar', () => {
            const form = document.getElementById('donation-form');
            fillForm('donation', item);
            setField(form, 'status', 'confirmed');
            document.getElementById('donation-status').scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
        }
      });

    renderRecords('news-records', data.news,
      (item) => item.title,
      (item) => `${item.status} · ${item.published_at ? new Date(item.published_at).toLocaleString('pt-BR') : 'sem data de publicação'}`,
      (item, actions) => editButton(actions, 'Editar', () => {
        fillForm('news', item);
        newsSelect.value = item.id;
        document.getElementById('news-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }));

    renderRecords('tracker-records', data.tracker,
      (item) => `${item.project_name} · ${item.percent}%`,
      (item) => `${item.milestone} · ${item.status} · ${item.published_at ? new Date(item.published_at).toLocaleString('pt-BR') : 'sem data de publicação'}`,
      (item, actions) => editButton(actions, 'Editar', () => {
        fillForm('tracker', item);
        trackerSelect.value = item.id;
        document.getElementById('tracker-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }));

    if (!data.campaigns.length) setStatus('donation-status', 'Cadastre uma campanha antes de registrar doações.', false);
  }

  async function refreshDashboard() {
    try {
      await supabaseRequest(async (client, user) => {
        // Fetch campaigns using the public view (readable by anon/authenticated)
        const { data: campaigns, error: campaignsError } = await client
          .from('public_campaigns')
          .select('*')
          .order('updated_at', { ascending: false });
        if (campaignsError) throw campaignsError;

        // Fetch donations using the public view (readable by anon/authenticated)
        const { data: donations, error: donationsError } = await client
          .from('donor_leaderboard')
          .select('*');
        if (donationsError) throw donationsError;

        // Fetch news using the public view
        const { data: news, error: newsError } = await client
          .from('published_news')
          .select('*')
          .order('published_at', { ascending: false });
        if (newsError) throw newsError;

        // Fetch tracker updates using the public view
        const { data: tracker, error: trackerError } = await client
          .from('published_tracker_updates')
          .select('*')
          .order('published_at', { ascending: false });
        if (trackerError) throw trackerError;

        // Also fetch all campaigns (including drafts) for admin editing
        // This requires the user to be authenticated and authorized
        const { data: allCampaigns, error: allCampaignsError } = await client
          .from('campaigns')
          .select('id,slug,title,summary,description,goal_amount,banner_url,color_start,color_end,gradient_angle,pix_key,qr_code_url,xlaunch_percent,kynos_maintenance_percent,status,is_active,created_at,updated_at')
          .order('updated_at', { ascending: false });
        if (allCampaignsError) throw allCampaignsError;

        // Fetch all donations for admin (including pending)
        const { data: allDonations, error: allDonationsError } = await client
          .from('donations')
          .select('id,campaign_id,amount,donor_alias,message,status,show_in_ranking,created_at,confirmed_at')
          .order('created_at', { ascending: false })
          .limit(100);
        if (allDonationsError) throw allDonationsError;

        // Fetch all news for admin
        const { data: allNews, error: allNewsError } = await client
          .from('news_posts')
          .select('id,slug,category,title,summary,body,source_url,status,published_at,created_at,updated_at')
          .order('created_at', { ascending: false });
        if (allNewsError) throw allNewsError;

        // Fetch all tracker updates for admin
        const { data: allTracker, error: allTrackerError } = await client
          .from('tracker_updates')
          .select('id,project_id,project_name,percent,milestone,summary,source_url,status,published_at,created_at,updated_at')
          .order('created_at', { ascending: false });
        if (allTrackerError) throw allTrackerError;

        data.campaigns = allCampaigns || [];
        data.donations = allDonations || [];
        data.news = allNews || [];
        data.tracker = allTracker || [];
        renderLists();
      });
    } catch (error) {
      setStatus('campaign-status', error.message, true);
      throw error;
    }
  }

  function campaignPayload(form) {
    return {
      id: fieldValue(form, 'id') || null,
      slug: fieldValue(form, 'slug'),
      title: fieldValue(form, 'title'),
      summary: fieldValue(form, 'summary'),
      description: fieldValue(form, 'description'),
      goal_amount: fieldValue(form, 'goal_amount') || null,
      pix_key: fieldValue(form, 'pix_key'),
      banner_url: fieldValue(form, 'banner_url') || null,
      qr_code_url: fieldValue(form, 'qr_code_url') || null,
      color_start: fieldValue(form, 'color_start'),
      color_end: fieldValue(form, 'color_end'),
      gradient_angle: fieldValue(form, 'gradient_angle'),
      xlaunch_percent: fieldValue(form, 'xlaunch_percent') || null,
      kynos_maintenance_percent: fieldValue(form, 'kynos_maintenance_percent') || null,
      status: fieldValue(form, 'status'),
      is_active: fieldValue(form, 'status') === 'active'
    };
  }

  function newsPayload(form) {
    const title = fieldValue(form, 'title');
    return {
      id: fieldValue(form, 'id') || null,
      slug: fieldValue(form, 'slug') || title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100),
      category: fieldValue(form, 'category'),
      title,
      summary: fieldValue(form, 'summary'),
      body: fieldValue(form, 'body'),
      source_url: fieldValue(form, 'source_url') || null,
      status: fieldValue(form, 'status')
    };
  }

  function trackerPayload(form) {
    return {
      id: fieldValue(form, 'id') || null,
      project_id: fieldValue(form, 'project_id'),
      project_name: fieldValue(form, 'project_name'),
      percent: fieldValue(form, 'percent'),
      milestone: fieldValue(form, 'milestone'),
      summary: fieldValue(form, 'summary'),
      source_url: fieldValue(form, 'source_url') || null,
      status: fieldValue(form, 'status')
    };
  }

  async function mutateCampaign(payload, user) {
    const client = await loadSupabase();
    const { data, error } = await client.rpc('admin_upsert_campaign', {
      p_payload: payload,
      p_actor: user.id
    });
    if (error) throw error;
    return data;
  }

  async function mutateDonation(payload, user) {
    const client = await loadSupabase();
    const { data, error } = await client.rpc('admin_record_donation', {
      p_payload: payload,
      p_actor: user.id
    });
    if (error) throw error;
    return data;
  }

  async function mutateNews(payload, user) {
    const client = await loadSupabase();
    const { data, error } = await client.rpc('admin_upsert_news', {
      p_payload: payload,
      p_actor: user.id
    });
    if (error) throw error;
    return data;
  }

  async function mutateTracker(payload, user) {
    const client = await loadSupabase();
    const { data, error } = await client.rpc('admin_upsert_tracker_update', {
      p_payload: payload,
      p_actor: user.id
    });
    if (error) throw error;
    return data;
  }

  function setupMutationForm(name, payloadBuilder, mutateFn, successMessage) {
    const form = document.getElementById(`${name}-form`);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const statusId = `${name}-status`;
      setStatus(statusId, 'Salvando…', false);
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        const payload = payloadBuilder(form);
        await supabaseRequest(async (client, user) => {
          await mutateFn(payload, user);
        });
        setStatus(statusId, successMessage, false);
        await refreshDashboard();
        if (name === 'donation') resetForm('donation');
      } catch (error) {
        setStatus(statusId, error.message, true);
      } finally {
        submit.disabled = false;
      }
    });
  }

  async function activateWorkspace(user) {
    workspace.hidden = false;
    logoutButton.hidden = false;
    loginForm.hidden = true;
    loginStatus.textContent = user.email ? `Sessão autorizada: ${user.email}` : 'Sessão de operador autorizada.';
    adminMode.dataset.state = 'connected';
    adminMode.textContent = 'Supabase conectado · sessão de operador autenticada';
    try {
      await refreshDashboard();
    } catch (error) {
      setStatus('campaign-status', error.message, true);
    }
  }

  async function checkExistingSession() {
    try {
      const client = await loadSupabase();
      const { data: { session } } = await client.auth.getSession();
      if (session && session.access_token) {
        // Verify the session is still valid and user is authorized
        const { data: { user } } = await client.auth.getUser(session.access_token);
        if (user && isAuthorized(user)) {
          storeSession(session.access_token, session.expires_in || 3600);
          await activateWorkspace(user);
          return true;
        }
      }
    } catch (e) {
      // Session check failed
    }
    return false;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = loginForm.querySelector('[type="submit"]');
    submit.disabled = true;
    loginStatus.textContent = 'Autenticando com Supabase…';
    loginStatus.classList.remove('is-error');
    const email = fieldValue(loginForm, 'email');
    const password = field(loginForm, 'password').value;
    try {
      const client = await loadSupabase();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      field(loginForm, 'password').value = '';
      if (!data.user || !isAuthorized(data.user)) {
        await client.auth.signOut();
        throw new Error('Conta não autorizada para acesso administrativo. Contate o administrador para adicionar seu UID à allowlist (window.KynosAdminConfig.adminUserIds no admin/config.js e/ou tabela public.admins no Supabase).');
      }
      if (data.session) {
        storeSession(data.session.access_token, data.session.expires_in || 3600);
      }
      await activateWorkspace(data.user);
    } catch (error) {
      loginStatus.textContent = error.message;
      loginStatus.classList.add('is-error');
      adminMode.dataset.state = 'local';
      adminMode.textContent = 'Autenticação falhou · verifique credenciais e allowlist';
    } finally {
      submit.disabled = false;
    }
  });

  logoutButton.addEventListener('click', async () => {
    try {
      const client = await loadSupabase();
      await client.auth.signOut();
    } catch (e) {
      // Ignore sign out errors
    }
    clearSession();
    workspace.hidden = true;
    loginForm.hidden = false;
    logoutButton.hidden = true;
    loginStatus.textContent = 'Sessão encerrada.';
    adminMode.dataset.state = 'local';
    adminMode.textContent = 'Sessão encerrada';
  });

  campaignSelect.addEventListener('change', () => {
    const item = data.campaigns.find((entry) => entry.id === campaignSelect.value);
    if (item) fillForm('campaign', item);
    else resetForm('campaign');
  });
  newsSelect.addEventListener('change', () => {
    const item = data.news.find((entry) => entry.id === newsSelect.value);
    if (item) fillForm('news', item);
    else resetForm('news');
  });
  trackerSelect.addEventListener('change', () => {
    const item = data.tracker.find((entry) => entry.id === trackerSelect.value);
    if (item) fillForm('tracker', item);
    else resetForm('tracker');
  });
  document.getElementById('new-campaign').addEventListener('click', () => resetForm('campaign'));
  document.getElementById('new-news').addEventListener('click', () => resetForm('news'));
  document.getElementById('new-tracker').addEventListener('click', () => resetForm('tracker'));

  setupMutationForm('campaign', campaignPayload, mutateCampaign, 'Campanha salva com sucesso.');
  setupMutationForm('donation', (form) => ({
    id: fieldValue(form, 'id') || null,
    campaign_id: fieldValue(form, 'campaign_id'),
    amount: fieldValue(form, 'amount'),
    donor_alias: fieldValue(form, 'donor_alias') || null,
    message: fieldValue(form, 'message') || null,
    status: fieldValue(form, 'status'),
    show_in_ranking: field(form, 'show_in_ranking').checked
  }), mutateDonation, 'Doação registrada com sucesso.');
  setupMutationForm('news', newsPayload, mutateNews, 'Notícia salva com sucesso.');
  setupMutationForm('tracker', trackerPayload, mutateTracker, 'Atualização salva com sucesso.');

  // Initialize: check for existing session
  if (window.location.protocol === 'file:') {
    adminMode.dataset.state = 'local';
    adminMode.textContent = 'Modo arquivo local · Supabase Auth requer HTTPS';
    loginStatus.textContent = 'Publique no GitHub Pages (HTTPS) para habilitar Supabase Auth.';
  } else {
    adminMode.textContent = 'Verificando sessão existente…';
    checkExistingSession().then((hasSession) => {
      if (!hasSession) {
        adminMode.dataset.state = 'local';
        adminMode.textContent = 'Entre com uma conta autorizada para gerenciar os dados';
      }
    }).catch(() => {
      adminMode.dataset.state = 'local';
      adminMode.textContent = 'Erro ao verificar sessão · tente fazer login';
    });
  }
}());