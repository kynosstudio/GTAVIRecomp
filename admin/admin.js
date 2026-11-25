(function () {
  'use strict';

  const data = { campaigns: [], donations: [], news: [], tracker: [] };
  const loginForm = document.getElementById('login-form');
  const loginStatus = document.getElementById('login-status');
  const adminMode = document.getElementById('admin-mode');
  const workspace = document.getElementById('admin-workspace');
  const logoutButton = document.getElementById('logout-button');
  const campaignSelect = document.getElementById('campaign-edit-select');
  const newsSelect = document.getElementById('news-edit-select');
  const trackerSelect = document.getElementById('tracker-edit-select');

  function setStatus(id, message, isError) {
    const node = document.getElementById(id);
    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(isError));
  }

  async function request(path, options) {
    const response = await fetch(`../api/admin/${path}`, Object.assign({
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    }, options || {}));
    let payload = {};
    if (!response.headers.get('Content-Type') || !response.headers.get('Content-Type').includes('application/json')) {
      if (response.status === 404 || response.status === 405) {
        throw new Error('Backend não configurado. Alterações administrativas estão desativadas.');
      }
      throw new Error('O servidor retornou uma resposta inválida.');
    }
    try {
      payload = await response.json();
    } catch (error) {
      throw new Error('O servidor retornou uma resposta inválida.');
    }
    if (!response.ok) throw new Error(payload.error || `Falha na solicitação (${response.status}).`);
    return payload;
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
    const [campaigns, donations, news, tracker] = await Promise.all([
      request('campaigns'),
      request('donations'),
      request('news'),
      request('tracker')
    ]);
    data.campaigns = campaigns.items || [];
    data.donations = donations.items || [];
    data.news = news.items || [];
    data.tracker = tracker.items || [];
    renderLists();
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
      slug: fieldValue(form, 'slug') || title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100),
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

  function setupMutationForm(name, endpoint, payloadBuilder, successMessage) {
    const form = document.getElementById(`${name}-form`);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const statusId = `${name}-status`;
      setStatus(statusId, 'Salvando e registrando auditoria…', false);
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        await request(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payloadBuilder(form))
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

  async function activateWorkspace(email) {
    workspace.hidden = false;
    logoutButton.hidden = false;
    loginForm.hidden = true;
    loginStatus.textContent = email ? `Sessão autorizada: ${email}` : 'Sessão de operador autorizada.';
    adminMode.dataset.state = 'connected';
    adminMode.textContent = 'Backend conectado · sessão de operador autenticada';
    try {
      await refreshDashboard();
    } catch (error) {
      setStatus('campaign-status', error.message, true);
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = loginForm.querySelector('[type="submit"]');
    submit.disabled = true;
    loginStatus.textContent = 'Validando credenciais e autorização do operador…';
    loginStatus.classList.remove('is-error');
    const email = fieldValue(loginForm, 'email');
    const password = field(loginForm, 'password').value;
    try {
      const result = await request('login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password })
      });
      field(loginForm, 'password').value = '';
      await activateWorkspace(result.email);
    } catch (error) {
      loginStatus.textContent = error.message;
      loginStatus.classList.add('is-error');
      adminMode.dataset.state = 'local';
      adminMode.textContent = 'Backend local ou autenticação indisponível';
    } finally {
      submit.disabled = false;
    }
  });

  logoutButton.addEventListener('click', async () => {
    try {
      await request('logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    } catch (error) {
      loginStatus.textContent = error.message;
    }
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

  setupMutationForm('campaign', 'campaigns', campaignPayload, 'Campanha salva; registro de auditoria criado.');
  setupMutationForm('donation', 'donations', (form) => ({
    id: fieldValue(form, 'id') || null,
    campaign_id: fieldValue(form, 'campaign_id'),
    amount: fieldValue(form, 'amount'),
    donor_alias: fieldValue(form, 'donor_alias') || null,
    message: fieldValue(form, 'message') || null,
    status: fieldValue(form, 'status'),
    show_in_ranking: field(form, 'show_in_ranking').checked
  }), 'Doação registrada; o ranking reflete somente confirmações autorizadas.');
  setupMutationForm('news', 'news', newsPayload, 'Notícia salva; o feed e a Central de Avisos serão atualizados.');
  setupMutationForm('tracker', 'tracker', trackerPayload, 'Atualização salva; o feed e a Central de Avisos serão atualizados.');

  if (window.location.protocol === 'file:') {
    adminMode.dataset.state = 'local';
    adminMode.textContent = 'Backend não configurado · modo local, alterações desativadas';
    loginStatus.textContent = 'Publique as Cloudflare Pages Functions e configure o Supabase para habilitar o gerenciamento.';
  } else {
    request('session').then((result) => activateWorkspace(result.email)).catch((error) => {
      adminMode.dataset.state = error.message.includes('not configured') || error.message.includes('Backend não configurado') ? 'local' : '';
      adminMode.textContent = error.message.includes('not configured') || error.message.includes('Backend não configurado')
        ? 'Backend não configurado · modo local, alterações desativadas'
        : 'Entre com uma conta autorizada para gerenciar os dados';
      if (error.message.includes('Backend não configurado')) loginStatus.textContent = error.message;
      else if (!error.message.includes('not configured') && !error.message.includes('session')) loginStatus.textContent = error.message;
    });
  }
}());
