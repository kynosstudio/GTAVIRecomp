import { supabase } from '../supabase-client.js';
import { loadTicker, loadWeather, searchGifs } from './community-integrations.js';

(function () {
  'use strict';

  const PROFILE_KEY = 'kynos-community-profile';
  const OWNER_TOKEN_KEY = 'kynos-community-owner-capability';
  const REACTIONS_KEY = 'kynos-community-reactions';
  const VOTER_KEY = 'kynos-community-voter';
  const BLOCKED_AUTHORS_KEY = 'kynos-community-blocked-authors';
  const POLL_VOTES_KEY = 'kynos-community-poll-votes';
  const EMOJI_RECENTS_KEY = 'kynos-community-emoji-recents';
  const REACTION_TYPES = [
    { id: 'heart', emoji: '❤️', label: 'Curtir' },
    { id: 'skull', emoji: '💀', label: 'Odiar' },
    { id: 'fire', emoji: '🔥', label: 'Adorei' },
    { id: 'laugh', emoji: '😂', label: 'Rir' },
    { id: 'wow', emoji: '😮', label: 'Surpresa' },
    { id: 'clap', emoji: '👏', label: 'Aplaudir' }
  ];
  const EMOJI_CATEGORIES = {
    'Recentes': [],
    'Rostos': [
      { emoji: '😀', name: 'sorriso feliz rosto' }, { emoji: '😂', name: 'rir alegria' },
      { emoji: '🥹', name: 'emocionado rosto' }, { emoji: '😍', name: 'amor coração' },
      { emoji: '😮', name: 'surpresa uau' }, { emoji: '😎', name: 'legal óculos' },
      { emoji: '😭', name: 'chorar triste' }, { emoji: '🤔', name: 'pensar dúvida' }
    ],
    'Gestos': [
      { emoji: '👍', name: 'positivo gostei' }, { emoji: '👏', name: 'aplaudir parabéns' },
      { emoji: '🙏', name: 'obrigado oração' }, { emoji: '🤝', name: 'acordo parceria' }
    ],
    'Objetos': [
      { emoji: '🔥', name: 'fogo incrível' }, { emoji: '🎮', name: 'jogo videogame' },
      { emoji: '🚗', name: 'carro veículo' }, { emoji: '💻', name: 'computador pc' },
      { emoji: '⭐', name: 'estrela favorito' }, { emoji: '💜', name: 'coração roxo' }
    ]
  };
  const AVATAR_STYLES = ['lorelei', 'bottts', 'thumbs', 'pixel-art'];
  const panels = {
    profile: document.getElementById('profile-panel'),
    advertise: document.getElementById('advertise-panel')
  };
  const buttons = {
    profile: document.getElementById('profile-open'),
    advertise: document.getElementById('advertise-open')
  };
  const feedList = document.getElementById('feed-list');
  const feedLoading = document.getElementById('feed-loading');
  const feedEmpty = document.getElementById('feed-empty');
  const feedPagination = document.getElementById('feed-pagination');
  const feedMore = document.getElementById('feed-load-more');
  const feedFilterButtons = Array.from(document.querySelectorAll('[data-feed-filter]'));
  const feedFilterStatus = document.getElementById('feed-filter-status');
  const activeChannelLabel = document.getElementById('active-channel-label');
  const feedSearchInput = document.getElementById('feed-search');
  let nextOffset = 0;
  let hasMore = false;
  let loadedPosts = [];
  let activeFeedFilter = 'all';
  let serverSearchResults = false;
  let linkPreviewData = null;
  let linkPreviewUrl = null;
  let previewTimer = 0;
  let previewRequest = 0;
  let selectedGif = null;
  let composerPreviewObjectUrl = null;
  let activeEmojiCategory = 'Rostos';
  let activeReportPostId = null;
  let replyingToCommentId = null;
  let feedSearchTimer = 0;
  let feedLoadRequest = 0;

  function setStatus(id, message, kind) {
    const element = document.getElementById(id);
    element.textContent = message || '';
    element.classList.remove('success', 'error');
    if (kind) element.classList.add(kind);
  }

  function readStored(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn('Os dados locais da comunidade não puderam ser lidos.');
      return fallback;
    }
  }

  function writeStored(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Os dados locais da comunidade não puderam ser salvos.');
      return false;
    }
  }

  function profile() {
    const stored = readStored(PROFILE_KEY, {});
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  }

  function profileNick() {
    const nick = profile().nick;
    return typeof nick === 'string' ? nick.trim().slice(0, 30) : '';
  }

  function getVoterId() {
    try {
      let id = localStorage.getItem(VOTER_KEY);
      if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return id;
      if (crypto.randomUUID) {
        id = crypto.randomUUID();
      } else {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        id = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
          .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
      }
      localStorage.setItem(VOTER_KEY, id);
      return id;
    } catch (error) {
      throw new Error('O navegador não permitiu salvar o identificador local das reações.');
    }
  }

  function getOwnerToken() {
    try {
      const current = localStorage.getItem(OWNER_TOKEN_KEY);
      if (current && /^[0-9a-f]{64}$/.test(current)) return current;
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(OWNER_TOKEN_KEY, token);
      return token;
    } catch (error) {
      throw new Error('O navegador não permitiu guardar a chave privada de gerenciamento. Verifique o armazenamento local do site.');
    }
  }

  async function getOwnerTokenHash() {
    if (!crypto.subtle) throw new Error('Este navegador não oferece Web Crypto para proteger o acesso às postagens.');
    const token = getOwnerToken();
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function reactionMap() {
    const value = readStored(REACTIONS_KEY, {});
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function normalizeAlias(value) {
    return String(value || '').trim().toLocaleLowerCase('pt-BR');
  }

  function blockedAuthors() {
    const stored = readStored(BLOCKED_AUTHORS_KEY, []);
    return new Set(Array.isArray(stored) ? stored.filter((alias) => typeof alias === 'string').map(normalizeAlias) : []);
  }

  function pollVoteMap() {
    const stored = readStored(POLL_VOTES_KEY, {});
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  }

  function rememberEmoji(emoji) {
    const stored = readStored(EMOJI_RECENTS_KEY, []);
    const recent = [emoji, ...(Array.isArray(stored) ? stored : []).filter((item) => item !== emoji)].slice(0, 12);
    writeStored(EMOJI_RECENTS_KEY, recent);
  }

  const mediaExtensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm'
  };

  function createUuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
      .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
  }

  async function uploadMedia(file) {
    const extension = mediaExtensions[file.type];
    if (!extension) throw new Error('Formato não permitido. Use JPG, PNG, WebP, MP4 ou WebM.');
    const objectPath = `${createUuid()}.${extension}`;
    const { error } = await supabase.storage
      .from('community-media')
      .upload(objectPath, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return {
      objectPath,
      publicUrl: supabase.storage.from('community-media').getPublicUrl(objectPath).data.publicUrl,
      mediaType: file.type.startsWith('video/') ? 'video' : 'image'
    };
  }

  function setPanel(name, open) {
    Object.keys(panels).forEach((key) => {
      const selected = key === name && open;
      panels[key].hidden = !selected;
      buttons[key].setAttribute('aria-expanded', String(selected));
    });
    document.body.classList.toggle('community-panel-open', Boolean(open));
    if (open) {
      const focusTarget = panels[name].querySelector('input, textarea, button');
      if (focusTarget) focusTarget.focus();
    }
  }

  function focusComposer() {
    const composer = document.getElementById('composer-panel');
    composer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('composer-text').focus({ preventScroll: true });
  }

  function friendlyError(error, action) {
    const message = error && typeof error.message === 'string' ? error.message.toLowerCase() : '';
    const code = error && typeof error.code === 'string' ? error.code : '';
    if (code === 'PGRST202' || /could not find the function|schema cache/.test(message)) {
      return 'A função necessária ainda não está disponível no Supabase. Aplique a migration de recursos sociais da Comunidade e tente novamente.';
    }
    if (code === '42501' || /permission denied|row-level security|insufficient privilege/.test(message)) {
      if (message.includes('storage') || message.includes('bucket')) {
        return 'O Supabase bloqueou o acesso ao armazenamento da Comunidade. Confira as policies do bucket community-media.';
      }
      return 'O Supabase bloqueou esta ação por permissões/RLS. Confirme se as migrations de permissões e recursos sociais da Comunidade foram aplicadas.';
    }
    return `Não foi possível ${action}. Verifique sua conexão e se as migrations da Comunidade foram aplicadas.`;
  }

  function safeHttpsUrl(value, base) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim(), base || window.location.href);
      if (url.protocol !== 'https:' || url.username || url.password) return null;
      return url.href;
    } catch (error) {
      return null;
    }
  }

  function extractFirstHttpsUrl(value) {
    const match = String(value || '').match(/https:\/\/[^\s<>"']+/i);
    if (!match) return null;
    const destination = safeHttpsUrl(match[0].replace(/[),.!?;:]+$/g, ''));
    return destination && destination.length <= 500 ? destination : null;
  }

  function addText(parent, tagName, className, value) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = value == null ? '' : String(value);
    parent.append(element);
    return element;
  }

  function renderRichText(parent, value) {
    const raw = String(value || '');
    const tokenPattern = /https:\/\/[^\s<>"']+|@[A-Za-z0-9_]{2,30}|#[A-Za-z0-9_]{1,40}/gi;
    let cursor = 0;
    let match;
    while ((match = tokenPattern.exec(raw))) {
      if (match.index > cursor) parent.append(document.createTextNode(raw.slice(cursor, match.index)));
      const token = match[0];
      if (token.startsWith('https://')) {
        const cleanUrl = token.replace(/[),.!?;:]+$/g, '');
        const href = safeHttpsUrl(cleanUrl);
        if (href) {
          const link = document.createElement('a');
          link.href = href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = cleanUrl;
          parent.append(link);
          if (cleanUrl.length < token.length) parent.append(document.createTextNode(token.slice(cleanUrl.length)));
        } else parent.append(document.createTextNode(token));
      } else {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = token;
        if (token.startsWith('@')) {
          button.className = 'mention-link';
          button.dataset.profileAlias = token.slice(1);
        } else {
          button.className = 'mention-link hashtag-link';
          button.dataset.hashtag = token.slice(1).toLocaleLowerCase('pt-BR');
        }
        parent.append(button);
      }
      cursor = tokenPattern.lastIndex;
    }
    if (cursor < raw.length) parent.append(document.createTextNode(raw.slice(cursor)));
  }

  function extractHashtags(value) {
    return [...new Set((String(value || '').match(/#[A-Za-z0-9_]{1,40}/g) || [])
      .map((tag) => tag.slice(1).toLocaleLowerCase('pt-BR')))];
  }

  function avatarUrl(alias, styleOverride) {
    const nick = String(alias || 'Comunidade').trim() || 'Comunidade';
    const hash = [...nick].reduce((sum, character) => sum + character.codePointAt(0), 0);
    const preferred = styleOverride || (profileNick() === nick ? profile().avatarStyle : '');
    const style = AVATAR_STYLES.includes(preferred) ? preferred : AVATAR_STYLES[hash % AVATAR_STYLES.length];
    return `https://api.dicebear.com/11.x/${style}/svg?seed=${encodeURIComponent(nick)}`;
  }

  function makeProfileAvatar(alias, className = 'profile-avatar-image') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `profile-avatar-button ${className}`;
    button.dataset.profileAlias = alias || 'Comunidade';
    button.setAttribute('aria-label', `Abrir perfil de ${alias || 'Comunidade'}`);
    const image = document.createElement('img');
    image.src = avatarUrl(alias);
    image.alt = '';
    image.loading = 'lazy';
    image.referrerPolicy = 'no-referrer';
    button.append(image);
    return button;
  }

  function makeProfileName(alias, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className || 'profile-open-button';
    button.dataset.profileAlias = alias || 'Comunidade';
    button.textContent = alias || 'Comunidade';
    return button;
  }

  function previewFallback(url, message) {
    const container = document.getElementById('link-preview');
    container.replaceChildren();
    container.hidden = false;
    container.classList.remove('loading', 'error');
    const host = new URL(url).hostname;
    addText(container, 'strong', 'preview-domain', host);
    addText(container, 'p', 'preview-description', message);
  }

  function renderLinkPreview(container, data, destination) {
    container.replaceChildren();
    container.hidden = false;
    container.classList.remove('loading', 'error');
    const card = document.createElement('div');
    card.className = 'preview-card';
    const imageUrl = data && safeHttpsUrl(data.image, destination);
    if (imageUrl) {
      const image = document.createElement('img');
      image.className = 'preview-image';
      image.src = imageUrl;
      image.alt = '';
      image.loading = 'lazy';
      card.append(image);
    } else card.classList.add('preview-card--text');
    const copy = document.createElement('div');
    copy.className = 'preview-content';
    addText(copy, 'strong', 'preview-title', data && data.title ? data.title : new URL(destination).hostname);
    if (data && data.description) addText(copy, 'p', 'preview-description', data.description);
    addText(copy, 'span', 'preview-domain', new URL(destination).hostname);
    card.append(copy);
    container.append(card);
  }

  async function readLimitedResponse(response, maximumBytes) {
    if (!response.body) {
      const text = await response.text();
      if (new TextEncoder().encode(text).length > maximumBytes) throw new Error('Prévia externa muito grande.');
      return text;
    }
    const reader = response.body.getReader();
    const chunks = [];
    let length = 0;
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      length += result.value.byteLength;
      if (length > maximumBytes) {
        await reader.cancel();
        throw new Error('Prévia externa muito grande.');
      }
      chunks.push(result.value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    chunks.forEach((chunk) => {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    });
    return new TextDecoder().decode(bytes);
  }

  async function loadLinkPreview() {
    const input = document.getElementById('composer-text');
    const container = document.getElementById('link-preview');
    const destination = extractFirstHttpsUrl(input.value);
    const requestId = ++previewRequest;
    linkPreviewData = null;
    linkPreviewUrl = null;
    if (!destination) {
      container.hidden = true;
      container.replaceChildren();
      return null;
    }
    container.hidden = false;
    container.className = 'link-preview loading';
    container.textContent = 'Tentando carregar a prévia…';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(destination, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow',
        headers: { Accept: 'text/html' },
        signal: controller.signal
      });
      if (!response.ok || !/^text\/html\b/i.test(response.headers.get('Content-Type') || '')) {
        throw new Error('Este endereço não disponibiliza uma página HTML legível.');
      }
      const html = await readLimitedResponse(response, 512 * 1024);
      if (requestId !== previewRequest || extractFirstHttpsUrl(input.value) !== destination) return null;
      const documentCopy = new DOMParser().parseFromString(html, 'text/html');
      const meta = (selector) => {
        const node = documentCopy.querySelector(selector);
        return node ? node.getAttribute('content') || '' : '';
      };
      const image = meta('meta[property="og:image"]') || meta('meta[name="twitter:image"]');
      const imageUrl = image ? safeHttpsUrl(image, response.url || destination) : null;
      const data = {
        title: (meta('meta[property="og:title"]') || documentCopy.title || '').slice(0, 180),
        description: (meta('meta[property="og:description"]') || meta('meta[name="description"]') || '').slice(0, 500),
        image: imageUrl
      };
      linkPreviewData = data;
      linkPreviewUrl = destination;
      renderLinkPreview(container, data, destination);
      return data;
    } catch (error) {
      if (requestId !== previewRequest || extractFirstHttpsUrl(input.value) !== destination) return null;
      linkPreviewUrl = destination;
      previewFallback(destination, 'Não foi possível ler a prévia (o site pode bloquear acesso externo). O link será publicado sem prévia.');
      return null;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function formatDate(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return 'data não informada';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  function postStatusLabel(status) {
    const labels = {
      pending: 'Em análise',
      approved: 'Publicado',
      published: 'Publicado',
      rejected: 'Rejeitado',
      archived: 'Arquivado'
    };
    return labels[status] || status || 'Status desconhecido';
  }

  function ownPostNode(post) {
    const card = document.createElement('article');
    card.className = 'profile-post-item';
    const header = document.createElement('header');
    header.className = 'profile-post-heading';
    addText(header, 'strong', 'profile-post-status', postStatusLabel(post.status));
    addText(header, 'time', 'profile-post-time', formatDate(post.created_at));
    card.append(header);
    if (post.body) addText(card, 'p', 'profile-post-copy', post.body);
    const media = renderMedia(post);
    if (media) card.append(media);
    const link = renderPostLink(post);
    if (link) card.append(link);

    const actions = document.createElement('div');
    actions.className = 'profile-post-actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'button comunidade-tertiary';
    edit.textContent = 'Editar';
    edit.addEventListener('click', () => showOwnPostEditor(post, card));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'button comunidade-tertiary';
    remove.textContent = 'Apagar';
    remove.addEventListener('click', () => deleteOwnPost(post, remove));
    actions.append(edit, remove);
    card.append(actions);
    return card;
  }

  function showOwnPostEditor(post, card) {
    card.replaceChildren();
    const form = document.createElement('form');
    form.className = 'profile-post-edit';
    const aliasLabel = addText(form, 'label', '', 'Nick');
    const alias = document.createElement('input');
    alias.type = 'text';
    alias.maxLength = 30;
    alias.minLength = 2;
    alias.required = true;
    alias.value = String(post.author_alias || profileNick() || 'Visitante').slice(0, 30);
    aliasLabel.append(alias);
    const bodyLabel = addText(form, 'label', '', 'Mensagem');
    const body = document.createElement('textarea');
    body.maxLength = 3000;
    body.rows = 4;
    const currentBody = post.body || '';
    body.value = post.link_url && !extractFirstHttpsUrl(currentBody)
      ? `${currentBody}${currentBody ? '\n' : ''}${post.link_url}`
      : currentBody;
    bodyLabel.append(body);
    const note = addText(form, 'p', 'form-hint', 'Ao salvar, o post volta para análise antes de ser publicado novamente.');
    const status = addText(form, 'p', 'form-status', '');
    status.setAttribute('role', 'status');
    const actions = document.createElement('div');
    actions.className = 'profile-post-actions';
    const save = document.createElement('button');
    save.type = 'submit';
    save.className = 'button comunidade-primary';
    save.textContent = 'Salvar edição';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'button comunidade-tertiary';
    cancel.textContent = 'Cancelar';
    cancel.addEventListener('click', () => loadMyPosts());
    actions.append(save, cancel);
    form.append(aliasLabel, bodyLabel, note, status, actions);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const newBody = body.value.trim();
      const linkUrl = extractFirstHttpsUrl(newBody);
      if (!newBody && !post.media_url && !linkUrl) {
        status.textContent = 'A postagem precisa ter texto, link ou mídia.';
        status.classList.add('error');
        return;
      }
      save.disabled = true;
      status.textContent = 'Salvando edição…';
      status.classList.remove('error', 'success');
      try {
        const ownerHash = await getOwnerTokenHash();
        const linkPreview = linkUrl && linkUrl === post.link_url ? (post.link_preview || {}) : {};
        const { error } = await supabase.rpc('community_update_my_post', {
          p_post_id: post.id,
          p_owner_token_hash: ownerHash,
          p_author_alias: alias.value.trim(),
          p_body: newBody,
          p_link_url: linkUrl,
          p_link_preview: linkPreview
        });
        if (error) throw error;
        await Promise.all([loadMyPosts(), loadFeed(false)]);
        setStatus('my-posts-status', 'Post atualizado e enviado para nova análise.', 'success');
      } catch (error) {
        status.textContent = friendlyError(error, 'editar a postagem');
        status.classList.add('error');
      } finally {
        save.disabled = false;
      }
    });
    card.append(form);
    alias.focus();
  }

  async function deleteOwnPost(post, button) {
    if (!window.confirm('Apagar esta postagem e os comentários associados? Esta ação não pode ser desfeita.')) return;
    button.disabled = true;
    try {
      const ownerHash = await getOwnerTokenHash();
      const { error } = await supabase.rpc('community_delete_my_post', {
        p_post_id: post.id,
        p_owner_token_hash: ownerHash
      });
      if (error) throw error;
      await Promise.all([loadMyPosts(), loadFeed(false)]);
      setStatus('my-posts-status', post.media_url
        ? 'Post apagado. A mídia pública pode permanecer no Storage até a limpeza administrativa.'
        : 'Post apagado.', 'success');
    } catch (error) {
      setStatus('my-posts-status', friendlyError(error, 'apagar a postagem'), 'error');
    } finally {
      button.disabled = false;
    }
  }

  async function loadMyPosts() {
    const container = document.getElementById('my-posts-list');
    if (!container) return;
    setStatus('my-posts-status', 'Carregando suas postagens…');
    try {
      const ownerHash = await getOwnerTokenHash();
      const { data: posts, error } = await supabase.rpc('community_my_posts', {
        p_owner_token_hash: ownerHash
      });
      if (error) throw error;
      container.replaceChildren();
      (posts || []).forEach((post) => {
        if (!post.media_url && post.media_path) {
          post.media_url = supabase.storage.from('community-media').getPublicUrl(post.media_path).data.publicUrl;
        }
        container.append(ownPostNode(post));
      });
      if (!posts || posts.length === 0) {
        addText(container, 'p', 'history-empty', 'Nenhuma postagem encontrada para este navegador.');
      }
      setStatus('my-posts-status', `${(posts || []).length} postagem(ns) encontrada(s).`, 'success');
    } catch (error) {
      container.replaceChildren();
      setStatus('my-posts-status', friendlyError(error, 'carregar suas postagens'), 'error');
    }
  }

  function renderPostLink(post) {
    const destination = safeHttpsUrl(post.link_url);
    if (!destination) return null;
    const preview = post.link_preview && typeof post.link_preview === 'object' ? post.link_preview : {};
    const anchor = document.createElement('a');
    anchor.className = 'post-link-preview';
    anchor.href = destination;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    const imageUrl = safeHttpsUrl(preview.image, destination);
    if (imageUrl) {
      const image = document.createElement('img');
      image.className = 'preview-image';
      image.src = imageUrl;
      image.alt = '';
      image.loading = 'lazy';
      anchor.append(image);
    } else anchor.classList.add('post-link-preview--text');
    const content = document.createElement('div');
    content.className = 'preview-content';
    addText(content, 'strong', 'preview-title', preview.title || new URL(destination).hostname);
    if (preview.description) addText(content, 'p', 'preview-description', preview.description);
    addText(content, 'span', 'preview-domain', preview.domain || new URL(destination).hostname);
    anchor.append(content);
    return anchor;
  }

  function renderMedia(post) {
    if (!post.media_url) {
      if (post.media_unavailable) {
        const notice = document.createElement('p');
        notice.className = 'post-media-error';
        notice.textContent = 'Mídia temporariamente indisponível.';
        return notice;
      }
      return null;
    }
    const source = safeHttpsUrl(post.media_url);
    if (!source) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'post-media';
    const media = document.createElement(post.media_type === 'video' ? 'video' : 'img');
    media.src = source;
    if (post.media_type === 'video') {
      media.controls = true;
      media.preload = 'metadata';
      media.playsInline = true;
    } else {
      media.alt = `Mídia enviada por ${post.author_alias || 'Comunidade'}`;
      media.loading = 'lazy';
    }
    media.referrerPolicy = 'no-referrer';
    wrapper.append(media);
    return wrapper;
  }

  function commentNode(comment, onReply) {
    const item = document.createElement('article');
    item.className = 'comment';
    item.dataset.commentId = comment.id || '';
    item.append(makeProfileAvatar(comment.author_alias || 'Visitante', 'comment-avatar'));
    const content = document.createElement('div');
    content.className = 'comment-body';
    const header = document.createElement('div');
    header.className = 'comment-header';
    header.append(makeProfileName(comment.author_alias || 'Visitante', 'comment-author-name profile-open-button'));
    addText(header, 'time', 'comment-time', formatDate(comment.created_at));
    const text = document.createElement('p');
    text.className = 'comment-text';
    renderRichText(text, comment.body || '');
    text.setAttribute('dir', 'auto');
    const reply = document.createElement('button');
    reply.type = 'button';
    reply.className = 'comment-reply';
    reply.textContent = 'Responder';
    reply.addEventListener('click', () => onReply(comment));
    content.append(header, text, reply);
    item.append(content);
    return item;
  }

  function reactionCount(post, kind) {
    if (kind === 'heart') return Number(post.heart_count) || 0;
    if (kind === 'skull') return Number(post.skull_count) || 0;
    return Number(post.reaction_counts && post.reaction_counts[kind]) || 0;
  }

  function makeReaction(post, reaction, reactions) {
    const definition = REACTION_TYPES.find((item) => item.id === reaction);
    if (!definition) return document.createElement('span');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `reaction-button${reactions[post.id] === reaction ? ' is-active' : ''}`;
    button.setAttribute('aria-label', `${definition.label}: ${reactionCount(post, reaction)}`);
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = definition.emoji;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = String(reactionCount(post, reaction));
    button.append(icon, count);
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const current = reactionMap();
        const selected = current[post.id] === reaction ? null : reaction;
        const voterId = getVoterId();
        const { data: result, error } = await supabase.rpc('community_cast_reaction', {
          p_post_id: post.id,
          p_voter_id: voterId,
          p_reaction: selected
        });
        if (error) throw error;
        if (result.reaction) current[post.id] = result.reaction;
        else delete current[post.id];
        writeStored(REACTIONS_KEY, current);
        post.reaction_counts = result.reaction_counts || {
          heart: result.heart_count,
          skull: result.skull_count
        };
        post.heart_count = result.heart_count;
        post.skull_count = result.skull_count;
        updatePostReactions(post.id, post);
      } catch (error) {
        showFeedError(error, 'registrar a reação');
      } finally {
        button.disabled = false;
      }
    });
    return button;
  }

  function updatePostReactions(postId, post) {
    const article = feedList.querySelector(`[data-post-id="${CSS.escape(postId)}"]`);
    if (!article) return;
    const previous = article.querySelector('.post-actions');
    const reactions = reactionMap();
    const actions = document.createElement('div');
    actions.className = 'post-actions';
    REACTION_TYPES.forEach((reaction) => actions.append(makeReaction(post, reaction.id, reactions)));
    previous.replaceWith(actions);
  }

  function renderPoll(post) {
    const poll = post.poll && typeof post.poll === 'object' ? post.poll : null;
    if (!poll || !Array.isArray(poll.options) || !poll.options.length) return null;
    const card = document.createElement('section');
    card.className = 'poll-card';
    addText(card, 'h4', '', poll.question || 'Enquete');
    const options = poll.options;
    const votes = options.reduce((total, option) => total + (Number(option.vote_count) || 0), 0);
    const voteMap = pollVoteMap();
    let selectedOptionId = voteMap[poll.id] || '';
    const voteButtons = new Map();
    options.forEach((option) => {
      const optionButton = document.createElement('button');
      optionButton.type = 'button';
      optionButton.className = 'poll-option';
      optionButton.setAttribute('aria-pressed', String(selectedOptionId === option.id));
      const label = addText(optionButton, 'span', 'poll-option-label', option.label);
      label.setAttribute('dir', 'auto');
      const count = Number(option.vote_count) || 0;
      const percentage = votes ? Math.round((count / votes) * 100) : 0;
      const meter = document.createElement('span');
      meter.className = 'poll-option-meter';
      const bar = document.createElement('span');
      bar.style.width = `${percentage}%`;
      meter.append(bar);
      addText(optionButton, 'span', 'poll-option-count', `${percentage}% · ${count}`);
      optionButton.append(meter);
      optionButton.addEventListener('click', () => {
        selectedOptionId = option.id;
        voteButtons.forEach((button, id) => button.setAttribute('aria-pressed', String(id === selectedOptionId)));
      });
      voteButtons.set(option.id, optionButton);
      card.append(optionButton);
    });
    const submit = document.createElement('button');
    submit.type = 'button';
    submit.className = 'button comunidade-secondary poll-vote-button';
    submit.textContent = voteMap[poll.id] ? 'Atualizar voto' : 'Votar';
    submit.disabled = !selectedOptionId;
    submit.addEventListener('click', async () => {
      if (!selectedOptionId) return;
      submit.disabled = true;
      try {
        const { data: result, error } = await supabase.rpc('community_cast_poll_vote', {
          p_poll_id: poll.id,
          p_option_id: selectedOptionId,
          p_voter_id: getVoterId()
        });
        if (error) throw error;
        if (!result || !Array.isArray(result.options)) throw new Error('A votação retornou um resultado inválido.');
        post.poll.options = result.options;
        voteMap[poll.id] = result.user_option_id || selectedOptionId;
        writeStored(POLL_VOTES_KEY, voteMap);
        card.replaceWith(renderPoll(post));
      } catch (error) {
        showFeedError(error, 'registrar o voto');
      } finally {
        submit.disabled = false;
      }
    });
    card.append(submit);
    addText(card, 'small', 'poll-total', `${votes} voto(s)`);
    return card;
  }

  async function loadComments(post, panel, toggle) {
    panel.replaceChildren();
    const loading = addText(panel, 'p', 'comments-loading', 'Carregando comentários…');
    try {
      const { data: result, error } = await supabase
        .from('current_community_comments')
        .select('id, post_id, parent_comment_id, author_alias, body, created_at')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })
        .limit(200);
      if (error) throw error;
      loading.remove();
      const list = document.createElement('div');
      list.className = 'comments-list';
      const blocked = blockedAuthors();
      const comments = (result || []).filter((comment) => !blocked.has(normalizeAlias(comment.author_alias)));
      const children = new Map();
      comments.forEach((comment) => {
        const parentId = comment.parent_comment_id || '';
        if (!children.has(parentId)) children.set(parentId, []);
        children.get(parentId).push(comment);
      });
      const renderChildren = (parentId, parent, depth) => {
        (children.get(parentId) || []).forEach((comment) => {
          const item = commentNode(comment, (selected) => {
            replyingToCommentId = selected.id;
            replyStatus.textContent = `Respondendo a ${selected.author_alias}.`;
            replyStatus.hidden = false;
            cancelReply.hidden = false;
            text.focus();
          });
          parent.append(item);
          const replies = children.get(comment.id) || [];
          if (replies.length) {
            const thread = document.createElement('div');
            thread.className = 'comment-thread';
            item.append(thread);
            renderChildren(comment.id, thread, depth + 1);
          }
        });
      };
      panel.append(list);
      const form = document.createElement('form');
      form.className = 'comment-form';
      const nick = document.createElement('input');
      nick.type = 'text';
      nick.maxLength = 30;
      nick.placeholder = 'Nick (opcional)';
      nick.setAttribute('aria-label', 'Nick do comentário, opcional');
      nick.value = profileNick();
      const text = document.createElement('input');
      text.type = 'text';
      text.maxLength = 1000;
      text.required = true;
      text.placeholder = 'Escreva um comentário…';
      text.setAttribute('aria-label', 'Comentário');
      const replyStatus = addText(form, 'span', 'comment-reply-status', '');
      replyStatus.hidden = true;
      const cancelReply = document.createElement('button');
      cancelReply.type = 'button';
      cancelReply.className = 'comment-reply';
      cancelReply.textContent = 'Cancelar resposta';
      cancelReply.hidden = true;
      cancelReply.addEventListener('click', () => {
        replyingToCommentId = null;
        replyStatus.hidden = true;
        cancelReply.hidden = true;
      });
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.textContent = 'Enviar';
      form.append(nick, text, cancelReply, submit);
      renderChildren('', list, 0);
      if (!comments.length) addText(list, 'p', 'comments-empty', 'Ainda não há comentários.');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        submit.disabled = true;
        try {
          const { error } = await supabase
            .from('community_comments')
            .insert({
              post_id: post.id,
              parent_comment_id: replyingToCommentId,
              author_alias: nick.value.trim() || 'Visitante',
              body: text.value.trim()
            });
          if (error) throw error;
          replyingToCommentId = null;
          replyStatus.hidden = true;
          cancelReply.hidden = true;
          text.value = '';
          post.comment_count = Number(post.comment_count || 0) + 1;
          toggle.textContent = `Comentários (${post.comment_count})`;
          await loadComments(post, panel, toggle);
        } catch (error) {
          showFeedError(error, 'enviar o comentário');
        } finally {
          submit.disabled = false;
        }
      });
      panel.append(form);
      return true;
    } catch (error) {
      loading.textContent = friendlyError(error, 'carregar os comentários');
      loading.classList.add('error');
      return false;
    }
  }

  function postNode(post) {
    const article = document.createElement('article');
    article.className = `feed-post feed-card${post.is_sponsored ? ' sponsored feed-card--sponsored' : ''}`;
    article.dataset.postId = post.id;
    article.setAttribute('role', 'article');
    const header = document.createElement('header');
    header.className = 'post-header feed-card__top';
    header.append(makeProfileAvatar(post.author_alias || 'Comunidade', 'post-avatar'));
    const author = document.createElement('div');
    author.className = 'post-author-info feed-card__author';
    author.append(makeProfileName(post.author_alias || 'Comunidade', 'post-author-name profile-open-button'));
    const meta = document.createElement('div');
    meta.className = 'post-meta';
    addText(meta, 'time', '', formatDate(post.created_at));
    addText(meta, 'span', 'post-channel', channelForPost(post));
    if (post.is_sponsored) addText(meta, 'span', 'post-status-badge sponsored', 'Patrocinado');
    author.append(meta);
    const options = document.createElement('details');
    options.className = 'post-menu';
    const summary = addText(options, 'summary', '', '•••');
    summary.setAttribute('aria-label', 'Opções da publicação');
    const optionList = document.createElement('div');
    const blockButton = addText(optionList, 'button', '', 'Bloquear autor');
    blockButton.type = 'button';
    blockButton.addEventListener('click', () => blockAuthor(post.author_alias));
    const reportButton = addText(optionList, 'button', '', 'Denunciar publicação');
    reportButton.type = 'button';
    reportButton.addEventListener('click', () => openReportDialog(post.id));
    options.append(optionList);
    header.append(author, options);
    article.append(header);

    const content = document.createElement('div');
    content.className = 'post-content feed-card__body';
    if (post.headline) addText(content, 'h3', 'post-headline', post.headline);
    const pollQuestion = post.poll && post.poll.question;
    if (post.body && (!pollQuestion || post.body !== pollQuestion)) {
      const text = addText(content, 'p', 'post-text', post.body);
      text.replaceChildren();
      renderRichText(text, post.body);
      text.setAttribute('dir', 'auto');
    }
    const media = renderMedia(post);
    if (media) content.append(media);
    const link = renderPostLink(post);
    if (link) content.append(link);
    const poll = renderPoll(post);
    if (poll) content.append(poll);
    article.append(content);

    const actions = document.createElement('div');
    actions.className = 'post-actions';
    const reactions = reactionMap();
    REACTION_TYPES.forEach((reaction) => actions.append(makeReaction(post, reaction.id, reactions)));
    article.append(actions);

    const comments = document.createElement('section');
    comments.className = 'post-comments';
    const commentsHeader = document.createElement('div');
    commentsHeader.className = 'comments-header';
    const toggle = document.createElement('button');
    toggle.className = 'comments-toggle';
    toggle.type = 'button';
    toggle.textContent = `Comentários (${Number(post.comment_count) || 0})`;
    const commentsPanel = document.createElement('div');
    commentsPanel.hidden = true;
    let loaded = false;
    toggle.addEventListener('click', async () => {
      commentsPanel.hidden = !commentsPanel.hidden;
      if (!commentsPanel.hidden && !loaded) {
        loaded = await loadComments(post, commentsPanel, toggle);
      }
    });
    commentsHeader.append(toggle);
    comments.append(commentsHeader, commentsPanel);
    article.append(comments);
    return article;
  }

  function channelForPost(post) {
    if (post.media_url || post.media_path) return '#mídia';
    if (post.link_url) return '#links';
    if (post.is_sponsored) return '#patrocinados';
    return '#geral';
  }

  function postMatchesFilter(post, filter) {
    if (filter === 'media') return Boolean(post.media_url || post.media_path);
    if (filter === 'links') return Boolean(post.link_url);
    if (filter === 'sponsored') return Boolean(post.is_sponsored);
    return true;
  }

  function postMatchesSearch(post, value) {
    const query = String(value || '').trim().toLocaleLowerCase('pt-BR');
    if (!query) return true;
    if (query.startsWith('#')) return extractHashtags(post.body).includes(query.slice(1));
    if (query.startsWith('@')) return normalizeAlias(post.author_alias).includes(query.slice(1));
    return [post.author_alias, post.body, post.headline, post.link_url]
      .some((field) => String(field || '').toLocaleLowerCase('pt-BR').includes(query));
  }

  function renderTrendingTopics() {
    const container = document.getElementById('trending-topics');
    const counts = new Map();
    loadedPosts.forEach((post) => extractHashtags(post.body).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }));
    const trending = [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).slice(0, 6);
    container.replaceChildren();
    if (!trending.length) {
      addText(container, 'p', 'form-hint', 'As hashtags mais usadas aparecem aqui.');
      return;
    }
    trending.forEach(([tag, count]) => {
      const button = addText(container, 'button', 'trending-topic', `#${tag} · ${count}`);
      button.type = 'button';
      button.dataset.hashtag = tag;
    });
  }

  function renderBlockedUsers() {
    const container = document.getElementById('blocked-users');
    const blocked = [...blockedAuthors()];
    container.replaceChildren();
    if (!blocked.length) {
      addText(container, 'p', 'form-hint', 'Nenhum usuário bloqueado.');
      return;
    }
    blocked.forEach((alias) => {
      const chip = addText(container, 'span', 'blocked-user-chip', '');
      addText(chip, 'span', '', `@${alias}`);
      const unblock = addText(chip, 'button', '', 'Desbloquear');
      unblock.type = 'button';
      unblock.addEventListener('click', () => {
        const remaining = blocked.filter((item) => item !== alias);
        writeStored(BLOCKED_AUTHORS_KEY, remaining);
        renderBlockedUsers();
        renderLoadedPosts();
      });
    });
  }

  function blockAuthor(alias) {
    const normalized = normalizeAlias(alias);
    if (!normalized || normalized === normalizeAlias(profileNick())) return;
    const blocked = blockedAuthors();
    blocked.add(normalized);
    if (!writeStored(BLOCKED_AUTHORS_KEY, [...blocked])) return;
    renderBlockedUsers();
    renderLoadedPosts();
  }

  function openReportDialog(postId) {
    activeReportPostId = postId;
    const dialog = document.getElementById('community-report-dialog');
    setStatus('report-status', '');
    document.getElementById('report-details').value = '';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  async function loadMentionNotifications() {
    const container = document.getElementById('mention-notifications');
    const alias = normalizeAlias(profileNick());
    container.replaceChildren();
    if (!alias) {
      addText(container, 'p', 'form-hint', 'Configure um nick para acompanhar menções.');
      return;
    }
    addText(container, 'p', 'form-hint', 'Buscando menções públicas para seu nick…');
    try {
      const { data: mentions, error } = await supabase
        .from('current_community_mentions')
        .select('post_id, author_alias, mentioned_alias, body, created_at')
        .eq('mentioned_alias', alias)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      container.replaceChildren();
      if (!mentions || !mentions.length) {
        addText(container, 'p', 'form-hint', 'Nenhuma menção recente.');
        return;
      }
      mentions.forEach((mention) => {
        const item = document.createElement('article');
        item.className = 'profile-post-item';
        addText(item, 'strong', '', `@${mention.author_alias} mencionou você`);
        const copy = addText(item, 'p', 'profile-post-copy', '');
        renderRichText(copy, mention.body);
        addText(item, 'time', 'profile-post-time', formatDate(mention.created_at));
        item.dataset.postId = mention.post_id;
        container.append(item);
      });
    } catch (error) {
      container.replaceChildren();
      addText(container, 'p', 'form-status error', friendlyError(error, 'carregar suas menções'));
    }
  }

  function profilePostPreview(post) {
    const item = document.createElement('article');
    item.className = 'profile-post-item';
    addText(item, 'time', 'profile-post-time', formatDate(post.created_at));
    if (post.body && !(post.poll && post.body === post.poll.question)) {
      const body = addText(item, 'p', 'profile-post-copy', '');
      renderRichText(body, post.body);
    }
    if (post.poll && post.poll.question) addText(item, 'strong', 'profile-post-copy', `Enquete: ${post.poll.question}`);
    const media = renderMedia(post);
    if (media) item.append(media);
    const link = renderPostLink(post);
    if (link) item.append(link);
    return item;
  }

  async function openProfile(alias) {
    const nickname = String(alias || '').trim().slice(0, 60);
    if (!nickname) return;
    const dialog = document.getElementById('community-profile-dialog');
    const title = document.getElementById('community-profile-title');
    const avatar = document.getElementById('community-profile-avatar');
    const badges = document.getElementById('community-profile-badges');
    const bio = document.getElementById('community-profile-bio');
    const posts = document.getElementById('community-profile-posts');
    title.textContent = nickname;
    avatar.src = avatarUrl(nickname);
    avatar.alt = `Avatar de ${nickname}`;
    badges.replaceChildren();
    bio.textContent = '';
    posts.replaceChildren();
    addText(posts, 'p', 'form-hint', 'Carregando publicações…');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    try {
      const { data: publicPosts, error } = await supabase
        .from('current_community_posts')
        .select('id, author_alias, body, media_url, media_type, created_at, media_path, link_url, link_preview, is_sponsored, poll')
        .eq('author_alias', nickname)
        .order('created_at', { ascending: false })
        .limit(40);
      if (error) throw error;
      const [profileResult, badgeResult] = await Promise.all([
        supabase.from('community_profiles').select('bio, avatar_style').eq('author_alias', nickname).maybeSingle(),
        supabase.from('community_profile_badges').select('badge_key').eq('author_alias', nickname)
      ]);
      if (!profileResult.error && profileResult.data) {
        bio.textContent = profileResult.data.bio || '';
        avatar.src = avatarUrl(nickname, profileResult.data.avatar_style);
      }
      posts.replaceChildren();
      const records = publicPosts || [];
      records.forEach((post) => {
        if (!post.media_url && post.media_path) {
          post.media_url = supabase.storage.from('community-media').getPublicUrl(post.media_path).data.publicUrl;
        }
      });
      if (records.length) {
        addText(badges, 'span', 'profile-badge', 'Primeiro post');
        if (records.length >= 5) addText(badges, 'span', 'profile-badge', 'Participante ativo');
        const earliest = Date.parse(records[records.length - 1].created_at || '');
        if (Number.isFinite(earliest) && Date.now() - earliest >= 30 * 24 * 60 * 60 * 1000) {
          addText(badges, 'span', 'profile-badge', 'Membro veterano');
        }
        records.forEach((post) => posts.append(profilePostPreview(post)));
      } else addText(posts, 'p', 'history-empty', 'Este perfil ainda não tem publicações aprovadas.');
      if (!badgeResult.error && Array.isArray(badgeResult.data)) {
        badgeResult.data.forEach(({ badge_key: badgeKey }) => {
          const label = String(badgeKey || '').replace(/[_-]+/g, ' ');
          if (label) addText(badges, 'span', 'profile-badge', label);
        });
      }
    } catch (error) {
      posts.replaceChildren();
      addText(posts, 'p', 'form-status error', friendlyError(error, 'carregar o perfil'));
    }
  }

  function sortFeedPosts(posts) {
    return [...posts].sort((a, b) => {
      const aSponsored = Boolean(a.is_sponsored);
      const bSponsored = Boolean(b.is_sponsored);
      if (aSponsored !== bSponsored) return aSponsored ? -1 : 1;
      return (Date.parse(b.created_at || '') || 0) - (Date.parse(a.created_at || '') || 0);
    });
  }

  function renderLoadedPosts() {
    const blocked = blockedAuthors();
    const visiblePosts = sortFeedPosts(loadedPosts).filter((post) =>
      !blocked.has(normalizeAlias(post.author_alias))
      && postMatchesFilter(post, activeFeedFilter)
      && (serverSearchResults || postMatchesSearch(post, feedSearchInput.value)));
    feedList.replaceChildren();
    visiblePosts.forEach((post) => feedList.append(postNode(post)));
    const searchTerm = feedSearchInput.value.trim();
    feedEmpty.hidden = loadedPosts.length > 0 || !feedLoading.hidden || Boolean(searchTerm);

    const filteredEmpty = document.getElementById('feed-filter-empty');
    filteredEmpty.hidden = visiblePosts.length > 0 || (!loadedPosts.length && !searchTerm);
    if (!filteredEmpty.hidden) {
      filteredEmpty.textContent = loadedPosts.length
        ? `Nenhum post corresponde aos filtros entre os ${loadedPosts.length} carregados. Confira seus bloqueios ou use “Carregar mais” para procurar posts anteriores.`
        : `Nenhum resultado para “${searchTerm}”.`;
    }

    const labels = { all: 'Tudo', media: 'Mídia', links: 'Links', sponsored: 'Patrocinados' };
    activeChannelLabel.textContent = labels[activeFeedFilter] || labels.all;
    feedFilterStatus.textContent = activeFeedFilter === 'all'
      ? `${visiblePosts.length} post(s) visível(is) entre os carregados.`
      : `${visiblePosts.length} post(s) neste canal entre os carregados.`;
    feedPagination.hidden = !hasMore;
    renderTrendingTopics();
  }

  function setFeedFilter(filter) {
    activeFeedFilter = filter;
    feedFilterButtons.forEach((button) => {
      const selected = button.dataset.feedFilter === filter;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    renderLoadedPosts();
  }

  function showFeedError(error, action) {
    feedLoading.hidden = false;
    feedLoading.textContent = friendlyError(error, action || 'concluir a solicitação');
    feedLoading.classList.add('error');
  }

  async function loadFeed(append) {
    const requestId = ++feedLoadRequest;
    if (!append) {
      nextOffset = 0;
      loadedPosts = [];
      feedList.replaceChildren();
    }
    feedLoading.hidden = false;
    feedLoading.classList.remove('error');
    feedLoading.textContent = 'Carregando feed…';
    feedEmpty.hidden = true;
    try {
      const pageSize = 20;
      const searchTerm = feedSearchInput.value.trim();
      const result = searchTerm
        ? await supabase.rpc('community_search_posts', {
          p_query: searchTerm,
          p_limit: pageSize,
          p_offset: nextOffset
        })
        : await supabase
          .from('current_community_posts')
          .select('id, author_alias, body, media_url, media_type, expires_at, created_at, media_path, headline, link_url, link_preview, is_sponsored, heart_count, skull_count, comment_count, reaction_counts, status, poll')
          .order('is_sponsored', { ascending: false })
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(nextOffset, nextOffset + pageSize - 1);
      if (requestId !== feedLoadRequest) return;
      const { data: posts, error } = result;
      if (error) throw error;
      serverSearchResults = Boolean(searchTerm);
      const visiblePosts = posts || [];
      visiblePosts.forEach((post) => {
        if (!post.media_url && post.media_path) {
          post.media_url = supabase.storage.from('community-media').getPublicUrl(post.media_path).data.publicUrl;
        }
      });
      loadedPosts.push(...visiblePosts);
      nextOffset += visiblePosts.length;
      hasMore = visiblePosts.length === pageSize;
      feedLoading.hidden = true;
      renderLoadedPosts();
    } catch (error) {
      if (requestId !== feedLoadRequest) return;
      showFeedError(error, 'carregar o feed');
    }
  }

  async function loadCommunityNotifications() {
    const container = document.getElementById('community-notifications');
    try {
      const { data: notifications, error } = await supabase
        .from('current_community_notifications')
        .select('id, title, body, published_at')
        .order('published_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      container.replaceChildren();
      (notifications || []).forEach((notification) => {
        const item = document.createElement('article');
        item.className = 'community-notification';
        addText(item, 'strong', 'community-notification-title', notification.title);
        addText(item, 'p', 'community-notification-body', notification.body);
        container.append(item);
      });
      container.hidden = !notifications || notifications.length === 0;
    } catch (error) {
      container.replaceChildren();
      addText(container, 'p', 'community-notification-error',
        'Avisos indisponíveis. Verifique a conexão e se as migrations da Comunidade foram aplicadas.');
      container.hidden = false;
    }
  }

  function renderEmojiPicker() {
    const categories = document.querySelector('.emoji-categories');
    const grid = document.getElementById('emoji-grid');
    const search = document.getElementById('emoji-search').value.trim().toLocaleLowerCase('pt-BR');
    const recents = readStored(EMOJI_RECENTS_KEY, []);
    const emojiCategories = {
      ...EMOJI_CATEGORIES,
      Recentes: (Array.isArray(recents) ? recents : []).map((emoji) => ({ emoji, name: 'recente' }))
    };
    categories.replaceChildren();
    Object.keys(emojiCategories).forEach((name) => {
      if (search) return;
      const button = addText(categories, 'button', 'emoji-category', name);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(name === activeEmojiCategory));
      button.addEventListener('click', () => {
        activeEmojiCategory = name;
        renderEmojiPicker();
      });
    });
    const source = search
      ? Object.values(emojiCategories).flat()
      : (emojiCategories[activeEmojiCategory] || emojiCategories.Rostos);
    const choices = source.filter((item) => !search
      || `${item.emoji} ${item.name}`.toLocaleLowerCase('pt-BR').includes(search));
    grid.replaceChildren();
    choices.forEach((item) => {
      const button = addText(grid, 'button', 'emoji-choice', item.emoji);
      button.type = 'button';
      button.title = item.name;
      button.setAttribute('aria-label', item.name);
      button.addEventListener('click', () => {
        const input = document.getElementById('composer-text');
        const start = input.selectionStart || input.value.length;
        const end = input.selectionEnd || start;
        input.setRangeText(item.emoji, start, end, 'end');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
        rememberEmoji(item.emoji);
        renderEmojiPicker();
      });
    });
    if (!choices.length) addText(grid, 'p', 'form-hint', 'Nenhum emoji encontrado.');
  }

  function updateComposerMediaPreview(label, url, kind) {
    const preview = document.getElementById('composer-media-preview');
    preview.replaceChildren();
    if (composerPreviewObjectUrl) {
      URL.revokeObjectURL(composerPreviewObjectUrl);
      composerPreviewObjectUrl = null;
    }
    if (!label) {
      preview.hidden = true;
      return;
    }
    preview.hidden = false;
    if (url) {
      if (url.startsWith('blob:')) composerPreviewObjectUrl = url;
      const media = document.createElement(kind === 'video' ? 'video' : 'img');
      media.src = url;
      media.alt = '';
      if (kind === 'video') {
        media.controls = true;
        media.muted = true;
        media.playsInline = true;
      }
      preview.append(media);
    }
    addText(preview, 'span', '', label);
    const remove = addText(preview, 'button', '', 'Remover');
    remove.type = 'button';
    remove.addEventListener('click', () => {
      selectedGif = null;
      document.getElementById('composer-media').value = '';
      updateComposerMediaPreview('', '', 'image');
    });
  }

  function readPollDraft() {
    const question = document.getElementById('poll-question').value.trim();
    const options = [...document.querySelectorAll('#poll-options input')]
      .map((input) => input.value.trim()).filter(Boolean);
    if (!question && !options.length) return null;
    if (question.length < 3 || options.length < 2 || options.length > 4) {
      throw new Error('Uma enquete precisa de uma pergunta e de 2 a 4 opções.');
    }
    if (new Set(options.map((option) => option.toLocaleLowerCase('pt-BR'))).size !== options.length) {
      throw new Error('As opções da enquete precisam ser diferentes.');
    }
    return { question, options };
  }

  function setupComposerTools() {
    const emojiPanel = document.getElementById('emoji-picker');
    const gifPanel = document.getElementById('gif-picker');
    const pollPanel = document.getElementById('poll-editor');
    const togglePanel = (buttonId, panel, open) => {
      panel.hidden = !open;
      document.getElementById(buttonId).setAttribute('aria-expanded', String(open));
    };
    document.getElementById('media-open').addEventListener('click', () => document.getElementById('composer-media').click());
    document.getElementById('composer-media').addEventListener('change', (event) => {
      const file = event.currentTarget.files[0];
      if (!file) return;
      selectedGif = null;
      updateComposerMediaPreview(file.name, URL.createObjectURL(file), file.type.startsWith('video/') ? 'video' : 'image');
      setStatus('composer-status', '');
    });
    document.getElementById('emoji-toggle').addEventListener('click', () => togglePanel('emoji-toggle', emojiPanel, emojiPanel.hidden));
    document.getElementById('gif-toggle').addEventListener('click', () => {
      togglePanel('gif-toggle', gifPanel, gifPanel.hidden);
      if (!gifPanel.hidden) document.getElementById('gif-query').focus();
    });
    document.getElementById('poll-toggle').addEventListener('click', () => togglePanel('poll-toggle', pollPanel, pollPanel.hidden));
    document.getElementById('emoji-search').addEventListener('input', renderEmojiPicker);
    renderEmojiPicker();
    document.getElementById('poll-add-option').addEventListener('click', () => {
      const optionList = document.getElementById('poll-options');
      if (optionList.children.length >= 4) return;
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 80;
      input.placeholder = `Opção ${optionList.children.length + 1}`;
      input.setAttribute('aria-label', input.placeholder);
      optionList.append(input);
      input.focus();
    });
    document.getElementById('poll-remove').addEventListener('click', () => {
      document.getElementById('poll-question').value = '';
      const options = document.getElementById('poll-options');
      options.replaceChildren();
      [1, 2].forEach((number) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 80;
        input.placeholder = `Opção ${number}`;
        input.setAttribute('aria-label', input.placeholder);
        options.append(input);
      });
      togglePanel('poll-toggle', pollPanel, false);
    });
    document.getElementById('gif-search').addEventListener('click', async () => {
      const query = document.getElementById('gif-query').value;
      const status = document.getElementById('gif-status');
      const results = document.getElementById('gif-results');
      status.textContent = 'Buscando GIFs…';
      results.replaceChildren();
      try {
        const gifs = await searchGifs(query);
        status.textContent = gifs.length ? `${gifs.length} resultado(s). Escolha um para anexar; a mídia entrará em análise.` : 'Nenhum GIF encontrado.';
        gifs.forEach((gif) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'gif-choice';
          button.setAttribute('aria-label', `Anexar GIF: ${gif.title}`);
          const image = document.createElement('img');
          image.src = gif.previewUrl;
          image.alt = gif.title;
          image.loading = 'lazy';
          button.append(image);
          button.addEventListener('click', () => {
            const gifUrl = safeHttpsUrl(gif.mediaUrl);
            if (!gifUrl || !/^https:\/\/media\d*\.giphy\.com\/media\//i.test(gifUrl)) {
              status.textContent = 'Este GIF foi descartado porque o endereço não é seguro.';
              return;
            }
            selectedGif = { url: gifUrl, type: 'image', title: gif.title };
            document.getElementById('composer-media').value = '';
            updateComposerMediaPreview(`GIF: ${gif.title}`, gifUrl, 'image');
            togglePanel('gif-toggle', gifPanel, false);
          });
          results.append(button);
        });
      } catch (error) {
        status.textContent = error.message || 'Não foi possível buscar GIFs agora.';
      }
    });
    const text = document.getElementById('composer-text');
    const count = document.getElementById('composer-character-count');
    const updateCount = () => { count.textContent = `${text.value.length} / 3000`; };
    text.addEventListener('input', updateCount);
    text.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        event.currentTarget.form.requestSubmit();
      }
    });
    updateCount();
  }

  function setupOptionalWidgets() {
    document.getElementById('weather-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const output = document.getElementById('weather-result');
      output.textContent = 'Consultando clima…';
      try {
        const weather = await loadWeather(document.getElementById('weather-city').value);
        if (!Number.isFinite(weather.temperature)) throw new Error('O serviço não retornou uma temperatura válida.');
        output.textContent = `${weather.city}: ${Math.round(weather.temperature)} °C · ${weather.description}`;
      } catch (error) {
        output.textContent = error.message || 'Clima indisponível. Tente novamente mais tarde.';
      }
    });
    document.getElementById('ticker-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const output = document.getElementById('ticker-result');
      output.textContent = 'Consultando cotação…';
      try {
        const quote = await loadTicker(document.getElementById('ticker-symbol').value);
        output.textContent = `${quote.ticker}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency }).format(quote.price)}`;
      } catch (error) {
        output.textContent = error.message || 'Cotação indisponível. Tente novamente mais tarde.';
      }
    });
  }

  function base64UrlToBytes(value) {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  }

  function setupPushNotifications() {
    document.getElementById('push-enable').addEventListener('click', async () => {
      const status = document.getElementById('push-status');
      try {
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
          status.textContent = 'Este navegador não oferece Web Push. As menções continuam disponíveis no perfil.';
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          status.textContent = permission === 'denied'
            ? 'Permissão negada. Você ainda pode consultar menções no seu perfil.'
            : 'Permissão não concedida. Nenhuma assinatura foi criada.';
          return;
        }
        const vapidKey = globalThis.KynosCommunityConfig && globalThis.KynosCommunityConfig.webPushPublicKey;
        if (typeof vapidKey !== 'string' || !vapidKey.trim()) {
          status.textContent = 'Permissão concedida, mas o Web Push ainda não foi configurado com uma chave pública VAPID.';
          return;
        }
        const registration = await navigator.serviceWorker.register('./community-sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToBytes(vapidKey.trim())
        });
        const json = subscription.toJSON();
        const { error } = await supabase.rpc('community_register_push_subscription', {
          p_endpoint: json.endpoint,
          p_p256dh: json.keys && json.keys.p256dh,
          p_auth: json.keys && json.keys.auth,
          p_author_alias: profileNick() || 'Visitante'
        });
        if (error) throw error;
        status.textContent = 'Notificações ativadas neste navegador. O envio remoto exige o emissor Web Push do site.';
      } catch (error) {
        status.textContent = friendlyError(error, 'ativar notificações');
      }
    });
  }

  function setupReportForm() {
    const dialog = document.getElementById('community-report-dialog');
    document.getElementById('report-cancel').addEventListener('click', () => dialog.close());
    document.getElementById('community-report-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!activeReportPostId) return;
      const submit = document.getElementById('report-submit');
      submit.disabled = true;
      setStatus('report-status', 'Enviando denúncia…');
      try {
        const { error } = await supabase.from('community_reports').insert({
          post_id: activeReportPostId,
          reporter_id: getVoterId(),
          reason: document.getElementById('report-reason').value,
          details: document.getElementById('report-details').value.trim() || null
        });
        if (error) throw error;
        setStatus('report-status', 'Denúncia enviada para análise da moderação.', 'success');
        activeReportPostId = null;
      } catch (error) {
        setStatus('report-status', friendlyError(error, 'enviar a denúncia'), 'error');
      } finally {
        submit.disabled = false;
      }
    });
  }

  function initializeProfile() {
    document.getElementById('profile-nick').value = profileNick();
    document.getElementById('profile-avatar-style').value = AVATAR_STYLES.includes(profile().avatarStyle)
      ? profile().avatarStyle
      : AVATAR_STYLES[0];
    document.getElementById('composer-author').textContent = profileNick() || 'Visitante';
  }

  Object.keys(buttons).forEach((name) => {
    buttons[name].addEventListener('click', () => {
      const open = panels[name].hidden;
      setPanel(name, open);
      if (name === 'profile' && open) {
        loadMyPosts();
        loadMentionNotifications();
        renderBlockedUsers();
      }
    });
  });
  document.getElementById('profile-edit-open').addEventListener('click', () => {
    setPanel('profile', true);
    loadMyPosts();
    loadMentionNotifications();
    renderBlockedUsers();
  });
  document.querySelectorAll('.comunidade-panel .panel-close').forEach((button) => {
    button.addEventListener('click', () => setPanel('', false));
  });
  document.getElementById('profile-dialog-close').addEventListener('click', () => {
    document.getElementById('community-profile-dialog').close();
  });
  document.getElementById('advertise-cancel').addEventListener('click', () => setPanel('', false));
  document.getElementById('empty-compose').addEventListener('click', focusComposer);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('community-panel-open')) setPanel('', false);
  });
  document.addEventListener('click', (event) => {
    const hashtag = event.target.closest('[data-hashtag]');
    if (hashtag) {
      feedSearchInput.value = `#${hashtag.dataset.hashtag}`;
      loadFeed(false);
      return;
    }
    const profileButton = event.target.closest('[data-profile-alias]');
    if (profileButton) openProfile(profileButton.dataset.profileAlias);
  });

  document.getElementById('profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const nick = document.getElementById('profile-nick').value.trim();
    if (nick && nick.length < 2) {
      setStatus('profile-status', 'O nick precisa ter ao menos 2 caracteres.', 'error');
      return;
    }
    const avatarStyle = document.getElementById('profile-avatar-style').value;
    const saved = {
      ...profile(),
      nick,
      avatarStyle: AVATAR_STYLES.includes(avatarStyle) ? avatarStyle : AVATAR_STYLES[0]
    };
    if (!writeStored(PROFILE_KEY, saved)) {
      setStatus('profile-status', 'O navegador bloqueou o armazenamento local do perfil.', 'error');
      return;
    }
    document.getElementById('composer-author').textContent = nick || 'Visitante';
    setStatus('profile-status', 'Perfil salvo somente neste navegador.', 'success');
    loadMentionNotifications();
    renderLoadedPosts();
  });

  document.getElementById('profile-clear').addEventListener('click', () => {
    try {
      localStorage.removeItem(PROFILE_KEY);
      document.getElementById('profile-form').reset();
      document.getElementById('composer-author').textContent = 'Visitante';
      document.getElementById('profile-avatar-style').value = AVATAR_STYLES[0];
      setStatus('profile-status', 'Nick removido. A chave de acesso às suas postagens foi preservada.', 'success');
      loadMentionNotifications();
      renderLoadedPosts();
    } catch (error) {
      setStatus('profile-status', 'O navegador não permitiu remover os dados locais.', 'error');
    }
  });

  document.getElementById('composer-text').addEventListener('input', () => {
    linkPreviewData = null;
    linkPreviewUrl = null;
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => {
      if (extractFirstHttpsUrl(document.getElementById('composer-text').value)) loadLinkPreview();
      else document.getElementById('link-preview').hidden = true;
    }, 800);
  });
  feedSearchInput.addEventListener('input', () => {
    window.clearTimeout(feedSearchTimer);
    feedSearchTimer = window.setTimeout(() => loadFeed(false), 250);
  });

  document.getElementById('composer-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('[type="submit"]');
    const nick = profileNick() || 'Visitante';
    const text = document.getElementById('composer-text').value.trim();
    const safeLink = extractFirstHttpsUrl(text);
    const media = document.getElementById('composer-media').files[0];
    let pollDraft;
    try {
      pollDraft = readPollDraft();
    } catch (error) {
      setStatus('composer-status', error.message, 'error');
      return;
    }
    if (!text && !media && !selectedGif && !pollDraft) {
      setStatus('composer-status', 'Escreva uma mensagem, anexe mídia ou crie uma enquete.', 'error');
      return;
    }
    if (media && media.size > 50 * 1024 * 1024) {
      setStatus('composer-status', 'O arquivo ultrapassa o limite de 50 MB.', 'error');
      return;
    }
    if (safeLink && linkPreviewUrl !== safeLink) await loadLinkPreview();
    submit.disabled = true;
    setStatus('composer-status', 'Enviando post…');
    try {
      if (!writeStored(PROFILE_KEY, Object.assign({}, profile(), { nick }))) {
        throw new Error('O navegador bloqueou o salvamento do perfil local.');
      }
      const ownerHash = await getOwnerTokenHash();
      const mediaData = media ? await uploadMedia(media) : null;
      const preview = safeLink && linkPreviewUrl === safeLink ? (linkPreviewData || {}) : {};
      const { error } = await supabase.rpc('community_create_post_with_poll', {
        p_author_alias: nick,
        p_body: text || (pollDraft ? pollDraft.question : ''),
        p_media_url: mediaData ? mediaData.publicUrl : (selectedGif ? selectedGif.url : null),
        p_media_type: mediaData ? mediaData.mediaType : (selectedGif ? selectedGif.type : null),
        p_link_url: safeLink,
        p_link_preview: preview,
        p_owner_token_hash: ownerHash,
        p_poll_question: pollDraft ? pollDraft.question : null,
        p_poll_options: pollDraft ? pollDraft.options : []
      });
      if (error) throw error;
      const isPending = Boolean(media || selectedGif);
      setStatus('composer-status', isPending
        ? 'Enviado para análise. O post aparecerá publicamente após aprovação.'
        : 'Post publicado no feed.', 'success');
      form.reset();
      selectedGif = null;
      updateComposerMediaPreview('', '', 'image');
      document.getElementById('poll-remove').click();
      linkPreviewData = null;
      linkPreviewUrl = null;
      document.getElementById('link-preview').hidden = true;
      if (!isPending) await loadFeed(false);
      if (!document.getElementById('profile-panel').hidden) await loadMyPosts();
    } catch (error) {
      setStatus('composer-status', friendlyError(error, 'enviar o post'), 'error');
    } finally {
      submit.disabled = false;
    }
  });

  document.getElementById('advertise-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('[type="submit"]');
    const media = document.getElementById('advertise-media').files[0];
    const destination = safeHttpsUrl(document.getElementById('advertise-url').value);
    if (!destination) {
      setStatus('advertise-status', 'O endereço do anúncio precisa usar HTTPS e não pode incluir credenciais.', 'error');
      return;
    }
    if (media && media.size > 50 * 1024 * 1024) {
      setStatus('advertise-status', 'O arquivo ultrapassa o limite de 50 MB.', 'error');
      return;
    }
    submit.disabled = true;
    setStatus('advertise-status', 'Enviando solicitação para análise…');
    try {
      const mediaData = media ? await uploadMedia(media) : null;
      const { error } = await supabase
        .from('community_ads')
        .insert({
          advertiser_name: document.getElementById('advertise-name').value.trim(),
          contact_email: document.getElementById('advertise-email').value.trim(),
          title: document.getElementById('advertise-title').value.trim(),
          description: document.getElementById('advertise-description').value.trim(),
          destination_url: destination,
          duration_days: Number(document.getElementById('advertise-days').value) || 7,
          media_path: mediaData ? mediaData.objectPath : null,
          media_type: mediaData ? mediaData.mediaType : null,
          payment_reference: document.getElementById('advertise-payment-reference').value.trim() || null
        });
      if (error) throw error;
      form.reset();
      document.getElementById('advertise-days').value = '7';
      setStatus('advertise-status', 'Solicitação enviada para análise. A equipe confirmará o pagamento e a publicação pelo contato informado.', 'success');
    } catch (error) {
      setStatus('advertise-status', friendlyError(error, 'enviar a solicitação de anúncio'), 'error');
    } finally {
      submit.disabled = false;
    }
  });

  feedMore.addEventListener('click', async () => {
    if (!hasMore) return;
    feedMore.disabled = true;
    await loadFeed(true);
    feedMore.disabled = false;
  });

  feedFilterButtons.forEach((button) => {
    button.addEventListener('click', () => setFeedFilter(button.dataset.feedFilter));
  });

  document.getElementById('copy-pix-key').addEventListener('click', async () => {
    const key = document.getElementById('community-pix-key').textContent.trim();
    try {
      await navigator.clipboard.writeText(key);
      setStatus('pix-copy-status', 'Chave PIX copiada.', 'success');
    } catch (error) {
      setStatus('pix-copy-status', 'Não foi possível copiar automaticamente. Selecione e copie a chave PIX exibida acima.', 'error');
    }
  });

  initializeProfile();
  renderBlockedUsers();
  setupComposerTools();
  setupOptionalWidgets();
  setupPushNotifications();
  setupReportForm();
  loadCommunityNotifications();
  loadFeed(false);
}());
