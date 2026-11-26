import { SUPABASE_URL, supabase } from '../supabase-client.js';

(function () {
  'use strict';

  const data = {
    campaigns: [], donations: [], news: [], tracker: [],
    communityPosts: [], communityReports: [], communityAds: [], communityNotifications: []
  };
  const loginForm = document.getElementById('login-form');
  const loginStatus = document.getElementById('login-status');
  const adminMode = document.getElementById('admin-mode');
  const workspace = document.getElementById('admin-workspace');
  const logoutButton = document.getElementById('logout-button');
  const campaignSelect = document.getElementById('campaign-edit-select');
  const newsSelect = document.getElementById('news-edit-select');
  const trackerSelect = document.getElementById('tracker-edit-select');
  let currentUserId = null;

  function setStatus(id, message, isError) {
    const node = document.getElementById(id);
    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(isError));
  }

  async function requireQuery(query) {
    const { data: result, error } = await query;
    if (error) throw error;
    return result;
  }

  function publicMediaUrl(path) {
    return path
      ? supabase.storage.from('community-media').getPublicUrl(path).data.publicUrl
      : null;
  }

  function communityObjectPath(record) {
    if (record.media_path) return record.media_path;
    if (!record.media_url) return null;
    try {
      const url = new URL(record.media_url);
      const projectOrigin = new URL(SUPABASE_URL).origin;
      const prefix = '/storage/v1/object/public/community-media/';
      if (url.origin !== projectOrigin || !url.pathname.startsWith(prefix)) return null;
      const path = decodeURIComponent(url.pathname.slice(prefix.length));
      return /^[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$/i.test(path) ? path : null;
    } catch (error) {
      return null;
    }
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

  function localDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
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
    } else if (name === 'community-post') {
      setField(form, 'status', 'pending');
      setField(form, 'is_sponsored', false);
    } else if (name === 'community-notification') {
      setField(form, 'status', 'draft');
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

  function linkButton(actions, label, url) {
    if (!url) return;
    let safeUrl;
    try {
      safeUrl = new URL(url, window.location.href);
    } catch (error) {
      return;
    }
    if (safeUrl.protocol !== 'https:' || safeUrl.username || safeUrl.password) return;
    const link = document.createElement('a');
    link.href = safeUrl.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    actions.append(link);
  }

  async function runCommunityAction(entity, record, action) {
    setStatus('community-status', 'Salvando moderação…', false);
    try {
      let cleanupWarning = '';
      if (entity === 'ad' && action === 'delete') {
        const linkedPost = data.communityPosts.find((post) => post.id === record.post_id);
        if (linkedPost) {
          await requireQuery(supabase.from('community_posts').delete().eq('id', linkedPost.id));
        }
        await requireQuery(supabase.from('community_ads').delete().eq('id', record.id));
        const paths = [communityObjectPath(record), linkedPost && communityObjectPath(linkedPost)].filter(Boolean);
        if (paths.length) {
          const { error } = await supabase.storage.from('community-media').remove(Array.from(new Set(paths)));
          if (error) cleanupWarning = `Anúncio excluído; não foi possível apagar a mídia (${error.message}).`;
        }
        setStatus('community-status', cleanupWarning || 'Anúncio excluído.', Boolean(cleanupWarning));
        await refreshDashboard();
        return;
      }
      const request = entity === 'post'
        ? supabase.rpc('admin_moderate_community_post', {
          p_post_id: record.id,
          p_action: action
        })
        : supabase.rpc('admin_review_community_ad', {
          p_ad_id: record.id,
          p_action: action,
          p_payment_status: document.getElementById('community-ad-payment').value
        });
      await requireQuery(request);
      if (entity === 'post' && action === 'delete') {
        const path = communityObjectPath(record);
        if (path) {
          const { error } = await supabase.storage.from('community-media').remove([path]);
          if (error) cleanupWarning = `Post excluído; não foi possível apagar a mídia (${error.message}).`;
        }
      }
      setStatus('community-status', cleanupWarning || 'Moderação salva.', Boolean(cleanupWarning));
      await refreshDashboard();
    } catch (error) {
      setStatus('community-status', error.message, true);
    }
  }

  async function updateCommunityReport(report, status) {
    setStatus('community-status', 'Atualizando denúncia…', false);
    try {
      await requireQuery(supabase.from('community_reports').update({ status }).eq('id', report.id));
      setStatus('community-status', 'Status da denúncia atualizado.', false);
      await refreshDashboard();
    } catch (error) {
      setStatus('community-status', error.message, true);
    }
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

    renderRecords('community-post-records', data.communityPosts,
      (item) => `${item.is_sponsored ? 'Patrocinado · ' : ''}${item.headline || item.author_alias || 'Post da comunidade'}`,
      (item) => `${item.status} · ${item.media_type || 'sem mídia'} · ${item.created_at ? new Date(item.created_at).toLocaleString('pt-BR') : 'data não informada'}`,
      (item, actions) => {
        if (item.media_url) linkButton(actions, 'Ver mídia', item.media_url);
        editButton(actions, 'Editar', () => {
          fillForm('community-post', item);
          document.getElementById('community-post-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        if (item.status !== 'approved' && item.status !== 'published') {
          editButton(actions, 'Aprovar', () => runCommunityAction('post', item, 'approve'));
        }
        if (item.status === 'approved' || item.status === 'published' || item.status === 'pending') {
          editButton(actions, 'Rejeitar', () => runCommunityAction('post', item, 'reject'));
        }
        editButton(actions, 'Excluir', () => {
          if (window.confirm('Excluir permanentemente este post e seus comentários?')) {
            runCommunityAction('post', item, 'delete');
          }
        });
      });

    renderRecords('community-report-records', data.communityReports,
      (item) => `${item.reason} · ${item.post_id ? 'post' : 'comentário'}`,
      (item) => `${item.status} · ${item.details || 'sem detalhes'} · ${item.created_at ? new Date(item.created_at).toLocaleString('pt-BR') : 'data não informada'}`,
      (item, actions) => {
        const post = item.post_id && data.communityPosts.find((record) => record.id === item.post_id);
        if (post) editButton(actions, 'Ver post', () => {
          fillForm('community-post', post);
          document.getElementById('community-post-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        if (item.status === 'pending') {
          editButton(actions, 'Marcar revisada', () => updateCommunityReport(item, 'reviewed'));
          editButton(actions, 'Dispensar', () => updateCommunityReport(item, 'dismissed'));
          editButton(actions, 'Ação tomada', () => updateCommunityReport(item, 'actioned'));
        }
      });

    renderRecords('community-ad-records', data.communityAds,
      (item) => `${item.title} · ${item.advertiser_name}`,
      (item) => `${item.status} · pagamento: ${item.payment_status} · ${item.contact_email}${item.payment_reference ? ` · referência PIX: ${item.payment_reference}` : ' · sem referência PIX'}`,
      (item, actions) => {
        if (item.media_url) linkButton(actions, 'Ver mídia', item.media_url);
        if (item.status === 'pending') {
          editButton(actions, 'Aprovar', () => runCommunityAction('ad', item, 'approve'));
          editButton(actions, 'Rejeitar', () => runCommunityAction('ad', item, 'reject'));
        }
        editButton(actions, 'Excluir anúncio', () => {
          if (window.confirm('Excluir esta solicitação e, se existir, sua publicação patrocinada?')) {
            runCommunityAction('ad', item, 'delete');
          }
        });
      });

    renderRecords('community-notification-records', data.communityNotifications,
      (item) => item.title,
      (item) => `${item.status} · ${item.expires_at ? `expira ${new Date(item.expires_at).toLocaleString('pt-BR')}` : 'sem expiração'}`,
      (item, actions) => {
        editButton(actions, 'Editar', () => {
          fillForm('community-notification', Object.assign({}, item, {
            expires_at: localDateTime(item.expires_at)
          }));
          document.getElementById('community-notification-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        editButton(actions, 'Excluir', () => {
          if (window.confirm('Excluir este aviso da Comunidade?')) {
            deleteCommunityNotification(item);
          }
        });
      });

    if (!data.campaigns.length) setStatus('donation-status', 'Cadastre uma campanha antes de registrar doações.', false);
  }

  async function refreshDashboard() {
    try {
      const [campaigns, donations, news, tracker, communityPosts, communityReports, communityAds, communityNotifications] = await Promise.all([
        requireQuery(supabase.from('campaigns').select('*').order('updated_at', { ascending: false }).limit(100)),
        requireQuery(supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(100)),
        requireQuery(supabase.from('news_posts').select('*').order('created_at', { ascending: false }).limit(100)),
        requireQuery(supabase.from('tracker_updates').select('*').order('created_at', { ascending: false }).limit(100)),
        requireQuery(supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(100)),
        requireQuery(supabase.from('community_reports').select('*').order('created_at', { ascending: false }).limit(100)),
        requireQuery(supabase.from('community_ads').select('*').order('created_at', { ascending: false }).limit(100)),
        requireQuery(supabase.from('community_notifications').select('*').order('created_at', { ascending: false }).limit(100))
      ]);
      data.campaigns = campaigns || [];
      data.donations = donations || [];
      data.news = news || [];
      data.tracker = tracker || [];
      data.communityPosts = (communityPosts || []).map((post) => ({
        ...post,
        media_url: post.media_url || publicMediaUrl(post.media_path)
      }));
      data.communityReports = communityReports || [];
      data.communityAds = (communityAds || []).map((ad) => ({
        ...ad,
        media_url: publicMediaUrl(ad.media_path)
      }));
      data.communityNotifications = communityNotifications || [];
      renderLists();
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

  function httpsField(value, label) {
    if (!value) return null;
    let url;
    try {
      url = new URL(value);
    } catch (error) {
      throw new Error(`${label} precisa ser um endereço HTTPS válido.`);
    }
    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new Error(`${label} precisa usar HTTPS e não pode incluir credenciais.`);
    }
    return url.href;
  }

  function communityPostPayload(form) {
    const mediaUrl = httpsField(fieldValue(form, 'media_url'), 'A mídia');
    const mediaType = fieldValue(form, 'media_type') || null;
    const linkUrl = httpsField(fieldValue(form, 'link_url'), 'O link');
    const body = fieldValue(form, 'body');
    if (Boolean(mediaUrl) !== Boolean(mediaType)) {
      throw new Error('Informe tanto a URL quanto o tipo de mídia, ou deixe ambos vazios.');
    }
    if (!body && !mediaUrl && !linkUrl) {
      throw new Error('O post precisa ter texto, link ou mídia.');
    }
    const id = fieldValue(form, 'id') || null;
    const existing = id ? data.communityPosts.find((post) => post.id === id) : null;
    return {
      id,
      author_alias: fieldValue(form, 'author_alias'),
      headline: fieldValue(form, 'headline') || null,
      body,
      media_url: mediaUrl,
      media_path: null,
      media_type: mediaType,
      link_url: linkUrl,
      link_preview: existing && existing.link_url === linkUrl ? (existing.link_preview || {}) : {},
      status: fieldValue(form, 'status'),
      is_sponsored: field(form, 'is_sponsored').checked,
      updated_at: new Date().toISOString()
    };
  }

  function communityNotificationPayload(form) {
    const status = fieldValue(form, 'status');
    const id = fieldValue(form, 'id') || null;
    const existing = id ? data.communityNotifications.find((item) => item.id === id) : null;
    const expiration = fieldValue(form, 'expires_at');
    const expiresAt = expiration ? new Date(expiration) : null;
    if (expiresAt && !Number.isFinite(expiresAt.getTime())) {
      throw new Error('A data de expiração não é válida.');
    }
    return {
      id,
      title: fieldValue(form, 'title'),
      body: fieldValue(form, 'body'),
      status,
      published_at: status === 'published'
        ? (existing && existing.published_at ? existing.published_at : new Date().toISOString())
        : null,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      created_by: currentUserId,
      updated_at: new Date().toISOString()
    };
  }

  async function mutateCampaign(payload) {
    const record = Object.assign({}, payload, {
      is_active: payload.status === 'active',
      updated_at: new Date().toISOString()
    });
    if (!record.id) delete record.id;
    return requireQuery(supabase.from('campaigns').upsert(record, { onConflict: 'slug' }));
  }

  async function mutateDonation(payload) {
    const record = Object.assign({}, payload, { created_by: currentUserId });
    if (!record.id) delete record.id;
    if (record.status === 'confirmed') {
      record.confirmed_by = currentUserId;
      record.confirmed_at = new Date().toISOString();
    } else {
      record.confirmed_by = null;
      record.confirmed_at = null;
    }
    return requireQuery(supabase.from('donations').upsert(record));
  }

  async function mutateNews(payload) {
    const record = Object.assign({}, payload, {
      created_by: currentUserId,
      published_at: payload.status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    });
    if (!record.id) delete record.id;
    return requireQuery(supabase.from('news_posts').upsert(record, { onConflict: 'slug' }));
  }

  async function mutateTracker(payload) {
    const record = Object.assign({}, payload, {
      created_by: currentUserId,
      published_at: payload.status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    });
    if (!record.id) delete record.id;
    return requireQuery(supabase.from('tracker_updates').upsert(record));
  }

  async function mutateCommunityPost(payload) {
    const record = Object.assign({}, payload);
    if (!record.id) delete record.id;
    return requireQuery(supabase.from('community_posts').upsert(record));
  }

  async function mutateCommunityNotification(payload) {
    const record = Object.assign({}, payload);
    if (!record.id) delete record.id;
    return requireQuery(supabase.from('community_notifications').upsert(record));
  }

  async function deleteCommunityNotification(record) {
    setStatus('community-notification-status', 'Excluindo aviso…', false);
    try {
      await requireQuery(supabase.from('community_notifications').delete().eq('id', record.id));
      setStatus('community-notification-status', 'Aviso excluído.', false);
      await refreshDashboard();
    } catch (error) {
      setStatus('community-notification-status', error.message, true);
    }
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
        await mutateFn(payload);
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
    currentUserId = user.id;
    workspace.hidden = false;
    logoutButton.hidden = false;
    loginForm.hidden = true;
    loginStatus.textContent = user && user.email ? `Sessão autorizada: ${user.email}` : 'Sessão de operador autorizada.';
    adminMode.dataset.state = 'connected';
    adminMode.textContent = 'Supabase conectado · sessão de administrador autenticada';
    try {
      await refreshDashboard();
    } catch (error) {
      setStatus('campaign-status', error.message, true);
    }
  }

  async function checkExistingSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) return false;
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const user = userData.user;
      if (!user) return false;
      await requireAdmin(user);
      await activateWorkspace(user);
      return true;
    } catch (error) {
      loginStatus.textContent = error.message;
      return false;
    }
  }

  async function requireAdmin(user) {
    const { data: record, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    if (!record) {
      await supabase.auth.signOut();
      throw new Error('Esta conta não está cadastrada como administradora.');
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = loginForm.querySelector('[type="submit"]');
    submit.disabled = true;
    loginStatus.textContent = 'Autenticando com o Supabase…';
    loginStatus.classList.remove('is-error');
    const email = fieldValue(loginForm, 'email');
    const password = field(loginForm, 'password').value;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (!data.user) throw new Error('O Supabase não retornou o usuário autenticado.');
      await requireAdmin(data.user);
      field(loginForm, 'password').value = '';
      await activateWorkspace(data.user);
    } catch (error) {
      loginStatus.textContent = error.message;
      loginStatus.classList.add('is-error');
      adminMode.dataset.state = 'local';
      adminMode.textContent = 'Autenticação falhou · confira as credenciais e a tabela admin_users';
    } finally {
      submit.disabled = false;
    }
  });

  logoutButton.addEventListener('click', async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setStatus('campaign-status', error.message, true);
    }
    currentUserId = null;
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
  document.getElementById('new-community-post').addEventListener('click', () => resetForm('community-post'));
  document.getElementById('new-community-notification').addEventListener('click', () => resetForm('community-notification'));

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
  setupMutationForm('community-post', communityPostPayload, mutateCommunityPost, 'Post salvo com sucesso.');
  setupMutationForm('community-notification', communityNotificationPayload, mutateCommunityNotification, 'Aviso salvo com sucesso.');

  adminMode.textContent = 'Verificando sessão Supabase…';
  checkExistingSession().then((hasSession) => {
    if (!hasSession) {
      adminMode.dataset.state = 'local';
      adminMode.textContent = 'Entre com uma conta cadastrada em admin_users';
    }
  }).catch((error) => {
    adminMode.dataset.state = 'local';
    adminMode.textContent = 'Erro ao verificar sessão Supabase';
    loginStatus.textContent = error.message;
  });
}());