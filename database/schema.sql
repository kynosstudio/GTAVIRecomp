-- KynosRecompVI community/fundraising schema for Supabase PostgreSQL.
-- Safe to re-run. Apply in the Supabase SQL editor after creating the project.
-- Secrets are never stored in these tables or exposed through the public views.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,59}$'),
  title text not null check (char_length(btrim(title)) between 3 and 120),
  summary text not null default '' check (char_length(summary) <= 500),
  description text not null default '' check (char_length(description) <= 4000),
  goal_amount numeric(12,2) check (goal_amount is null or goal_amount >= 0.01),
  banner_url text,
  color_start text not null default '#ff7b47' check (color_start ~ '^#[0-9A-Fa-f]{6}$'),
  color_end text not null default '#a855f7' check (color_end ~ '^#[0-9A-Fa-f]{6}$'),
  gradient_angle smallint not null default 125 check (gradient_angle between 0 and 360),
  pix_key text not null default 'kynos.studio@gmail.com' check (char_length(pix_key) between 5 and 120),
  qr_code_url text,
  xlaunch_percent smallint,
  kynos_maintenance_percent smallint,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  is_active boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (is_active = (status = 'active')),
  check (
    (xlaunch_percent is null and kynos_maintenance_percent is null)
    or (
      xlaunch_percent is not null
      and kynos_maintenance_percent is not null
      and xlaunch_percent between 0 and 100
      and kynos_maintenance_percent between 0 and 100
      and xlaunch_percent + kynos_maintenance_percent = 100
    )
  )
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete restrict,
  amount numeric(12,2) not null check (amount >= 0.01),
  donor_alias text check (donor_alias is null or char_length(btrim(donor_alias)) between 1 and 60),
  message text check (message is null or char_length(message) <= 500),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  show_in_ranking boolean not null default true,
  points_earned integer check (points_earned is null or points_earned >= 0),
  user_id uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  confirmed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,99}$'),
  category text not null default 'Comunidade' check (char_length(category) between 2 and 60),
  title text not null check (char_length(btrim(title)) between 5 and 180),
  summary text not null check (char_length(btrim(summary)) between 10 and 1200),
  body text not null default '' check (char_length(body) <= 12000),
  source_url text check (source_url is null or source_url ~ '^https://'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.tracker_updates (
  id uuid primary key default gen_random_uuid(),
  project_id text not null check (project_id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  project_name text not null check (char_length(btrim(project_name)) between 2 and 120),
  percent numeric(5,2) not null check (percent between 0 and 100),
  milestone text not null check (char_length(btrim(milestone)) between 2 and 80),
  summary text not null check (char_length(btrim(summary)) between 10 and 1200),
  source_url text check (source_url is null or source_url ~ '^https://'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  author_alias text not null default 'Comunidade' check (char_length(btrim(author_alias)) between 1 and 60),
  body text not null check (char_length(btrim(body)) between 1 and 3000),
  media_url text,
  media_type text check (media_type is null or media_type in ('image', 'video')),
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected', 'archived')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  check ((media_url is null and media_type is null) or (media_url is not null and media_type is not null))
);

-- Future login/profile groundwork. These tables intentionally start empty.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(btrim(display_name)) between 1 and 60),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  donation_id uuid references public.donations (id) on delete set null,
  points integer not null check (points > 0),
  reason text not null check (char_length(btrim(reason)) between 2 and 160),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users (id) on delete restrict,
  action text not null check (char_length(action) between 2 and 80),
  entity text not null check (entity in ('campaign', 'donation', 'news_post', 'tracker_update')),
  entity_id uuid not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists campaigns_active_updated_idx
  on public.campaigns (is_active, updated_at desc);
create index if not exists donations_campaign_status_created_idx
  on public.donations (campaign_id, status, created_at desc);
create index if not exists news_posts_published_idx
  on public.news_posts (published_at desc) where status = 'published';
create index if not exists tracker_updates_published_idx
  on public.tracker_updates (published_at desc) where status = 'published';
create index if not exists community_posts_expiry_idx
  on public.community_posts (expires_at) where expires_at is not null;
create index if not exists points_ledger_user_created_idx
  on public.points_ledger (user_id, created_at desc);
create index if not exists admin_audit_entity_created_idx
  on public.admin_audit_log (entity, entity_id, created_at desc);

-- A safe draft is available immediately after schema setup. Review its split, goal and QR
-- before activating it; the conflict clause preserves any operator-edited campaign.
insert into public.campaigns (
  slug, title, summary, description, pix_key, qr_code_url, status, is_active
) values (
  'xlaunchvi',
  'Vaquinha do XLaunchVI',
  'Apoie a engenharia brasileira por trás do launcher de GTA VI.',
  'A maior parte do apoio é destinada ao XLaunchVI e uma parcela à manutenção do KynosRecompVI. Configure percentuais, meta e o QR Code oficial antes de ativar a campanha.',
  'kynos.studio@gmail.com',
  '/assets/vaquinhas/xlaunchvi-qr-placeholder.png',
  'draft',
  false
)
on conflict (slug) do nothing;

alter table public.campaigns enable row level security;
alter table public.donations enable row level security;
alter table public.news_posts enable row level security;
alter table public.tracker_updates enable row level security;
alter table public.community_posts enable row level security;
alter table public.profiles enable row level security;
alter table public.points_ledger enable row level security;
alter table public.admin_audit_log enable row level security;

-- Explicitly remove the default API access. Public reads go through the narrow views below;
-- all mutations go through authenticated server functions and audited SQL RPCs.
revoke all on public.campaigns, public.donations, public.news_posts, public.tracker_updates,
  public.community_posts, public.profiles, public.points_ledger, public.admin_audit_log
  from public, anon, authenticated;

drop policy if exists "public reads listed campaigns" on public.campaigns;
drop policy if exists "public reads active campaigns" on public.campaigns;
create policy "public reads listed campaigns" on public.campaigns
  for select to anon, authenticated using (status in ('active', 'paused', 'completed', 'archived'));
drop policy if exists "public reads ranked confirmed donations" on public.donations;
create policy "public reads ranked confirmed donations" on public.donations
  for select to anon, authenticated using (status = 'confirmed' and show_in_ranking);
drop policy if exists "public reads published news" on public.news_posts;
create policy "public reads published news" on public.news_posts
  for select to anon, authenticated using (status = 'published' and published_at is not null and published_at <= now());
drop policy if exists "public reads published tracker updates" on public.tracker_updates;
create policy "public reads published tracker updates" on public.tracker_updates
  for select to anon, authenticated using (status = 'published' and published_at is not null and published_at <= now());
drop policy if exists "public reads current community posts" on public.community_posts;
create policy "public reads current community posts" on public.community_posts
  for select to anon, authenticated using (
    status = 'published' and (expires_at is null or expires_at > now())
  );
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "users read own points" on public.points_ledger;
create policy "users read own points" on public.points_ledger
  for select to authenticated using (user_id = auth.uid());

grant select (id, slug, title, summary, description, goal_amount, banner_url, color_start,
  color_end, gradient_angle, pix_key, qr_code_url, xlaunch_percent, kynos_maintenance_percent,
  status, is_active, created_at, updated_at)
  on public.campaigns to anon, authenticated;
grant select (campaign_id, amount, donor_alias, status, show_in_ranking, created_at)
  on public.donations to anon, authenticated;
grant select (id, slug, category, title, summary, body, source_url, status, published_at, created_at)
  on public.news_posts to anon, authenticated;
grant select (id, project_id, project_name, percent, milestone, summary, source_url, status, published_at, created_at)
  on public.tracker_updates to anon, authenticated;
grant select (id, author_alias, body, media_url, media_type, status, expires_at, created_at)
  on public.community_posts to anon, authenticated;
grant select (user_id, display_name, avatar_url, created_at, updated_at)
  on public.profiles to authenticated;
grant update (display_name, avatar_url, updated_at) on public.profiles to authenticated;
grant select (user_id, donation_id, points, reason, created_at, metadata)
  on public.points_ledger to authenticated;

create or replace view public.public_campaigns with (security_invoker = true) as
  select id, slug, title, summary, description, goal_amount, banner_url, color_start, color_end,
    gradient_angle, case when is_active then pix_key else null end as pix_key,
    case when is_active then qr_code_url else null end as qr_code_url,
    xlaunch_percent, kynos_maintenance_percent, status, is_active, created_at, updated_at
  from public.campaigns
  where status in ('active', 'paused', 'completed', 'archived');

-- Deliberately excludes donor messages, account IDs, and operator metadata.
create or replace view public.donor_leaderboard with (security_invoker = true) as
  select campaign_id,
    coalesce(nullif(btrim(donor_alias), ''), 'Apoiador anônimo') as donor_alias,
    sum(amount) as total_amount,
    count(*)::integer as donation_count,
    max(created_at) as last_donation_at
  from public.donations
  join public.campaigns on public.campaigns.id = public.donations.campaign_id
  where public.donations.status = 'confirmed'
    and public.donations.show_in_ranking
    and public.campaigns.status in ('active', 'paused', 'completed', 'archived')
  group by public.donations.campaign_id,
    coalesce(nullif(btrim(public.donations.donor_alias), ''), 'Apoiador anônimo');

create or replace view public.published_news with (security_invoker = true) as
  select id, slug, category, title, summary, body, source_url, published_at, created_at
  from public.news_posts
  where status = 'published' and published_at is not null and published_at <= now();

create or replace view public.published_tracker_updates with (security_invoker = true) as
  select id, project_id, project_name, percent, milestone, summary, source_url, published_at, created_at
  from public.tracker_updates
  where status = 'published' and published_at is not null and published_at <= now();

create or replace view public.current_community_posts with (security_invoker = true) as
  select id, author_alias, body, media_url, media_type, expires_at, created_at
  from public.community_posts
  where status = 'published' and (expires_at is null or expires_at > now());

-- Exposes only campaign totals; confirmed donations hidden from the public ranking still count.
create or replace function public.public_campaign_totals()
returns table (campaign_id uuid, total_amount numeric, donation_count bigint)
language sql stable security definer set search_path = ''
as $$
  select d.campaign_id, sum(d.amount)::numeric, count(*)::bigint
  from public.donations as d
  join public.campaigns as c on c.id = d.campaign_id
  where d.status = 'confirmed'
    and c.status in ('active', 'paused', 'completed', 'archived')
  group by d.campaign_id;
$$;
revoke all on function public.public_campaign_totals() from public;
grant execute on function public.public_campaign_totals() to anon, authenticated;

grant select on public.public_campaigns, public.donor_leaderboard, public.published_news,
  public.published_tracker_updates, public.current_community_posts to anon, authenticated;

-- These RPCs are callable only by the server's service_role after the operator session is verified.
-- Each mutation and its audit row share a database transaction.
create or replace function public.admin_upsert_campaign(p_payload jsonb, p_actor uuid)
returns public.campaigns
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_slug text;
  v_title text;
  v_summary text;
  v_description text;
  v_goal numeric(12,2);
  v_color_start text;
  v_color_end text;
  v_angle smallint;
  v_pix text;
  v_xlaunch smallint;
  v_kynos smallint;
  v_status text;
  v_active boolean;
  v_row public.campaigns;
begin
  if p_actor is null or p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Invalid campaign request.';
  end if;
  v_slug := lower(btrim(coalesce(p_payload->>'slug', '')));
  v_title := btrim(coalesce(p_payload->>'title', ''));
  v_summary := btrim(coalesce(p_payload->>'summary', ''));
  v_description := btrim(coalesce(p_payload->>'description', ''));
  v_goal := nullif(p_payload->>'goal_amount', '')::numeric;
  v_color_start := coalesce(p_payload->>'color_start', '#ff7b47');
  v_color_end := coalesce(p_payload->>'color_end', '#a855f7');
  v_angle := coalesce(nullif(p_payload->>'gradient_angle', '')::smallint, 125);
  v_pix := btrim(coalesce(p_payload->>'pix_key', 'kynos.studio@gmail.com'));
  v_xlaunch := nullif(p_payload->>'xlaunch_percent', '')::smallint;
  v_kynos := nullif(p_payload->>'kynos_maintenance_percent', '')::smallint;
  v_status := coalesce(nullif(p_payload->>'status', ''), 'draft');
  v_active := coalesce(nullif(p_payload->>'is_active', '')::boolean, v_status = 'active');

  if v_slug !~ '^[a-z0-9][a-z0-9-]{1,59}$' or char_length(v_title) not between 3 and 120
    or char_length(v_summary) > 500 or char_length(v_description) > 4000
    or (v_goal is not null and (v_goal < 0.01 or v_goal > 9999999999.99))
    or v_color_start !~ '^#[0-9A-Fa-f]{6}$' or v_color_end !~ '^#[0-9A-Fa-f]{6}$'
    or v_angle not between 0 and 360 or char_length(v_pix) not between 5 and 120
    or v_status not in ('draft', 'active', 'paused', 'completed', 'archived')
    or v_active <> (v_status = 'active') then
    raise exception 'Campaign fields failed validation.';
  end if;
  if (v_xlaunch is null) <> (v_kynos is null)
    or (v_xlaunch is not null and (v_xlaunch not between 0 and 100 or v_kynos not between 0 and 100 or v_xlaunch + v_kynos <> 100)) then
    raise exception 'Campaign split must be two percentages totaling 100.';
  end if;
  if v_active and (v_xlaunch is null or v_kynos is null) then
    raise exception 'Set the campaign split before activation.';
  end if;

  v_id := nullif(p_payload->>'id', '')::uuid;
  if v_id is null then
    select id into v_id from public.campaigns where slug = v_slug;
  end if;
  insert into public.campaigns (
    id, slug, title, summary, description, goal_amount, banner_url, color_start, color_end,
    gradient_angle, pix_key, qr_code_url, xlaunch_percent, kynos_maintenance_percent,
    status, is_active, created_by, updated_at
  ) values (
    coalesce(v_id, gen_random_uuid()), v_slug, v_title, v_summary, v_description, v_goal,
    nullif(p_payload->>'banner_url', ''), v_color_start, v_color_end, v_angle, v_pix,
    nullif(p_payload->>'qr_code_url', ''), v_xlaunch, v_kynos, v_status, v_active, p_actor, now()
  )
  on conflict (id) do update set
    slug = excluded.slug, title = excluded.title, summary = excluded.summary,
    description = excluded.description, goal_amount = excluded.goal_amount,
    banner_url = excluded.banner_url, color_start = excluded.color_start,
    color_end = excluded.color_end, gradient_angle = excluded.gradient_angle,
    pix_key = excluded.pix_key, qr_code_url = excluded.qr_code_url,
    xlaunch_percent = excluded.xlaunch_percent,
    kynos_maintenance_percent = excluded.kynos_maintenance_percent,
    status = excluded.status, is_active = excluded.is_active, updated_at = now()
  returning * into v_row;

  insert into public.admin_audit_log (actor_user_id, action, entity, entity_id, details)
  values (p_actor, 'upsert', 'campaign', v_row.id,
    jsonb_build_object('slug', v_row.slug, 'status', v_row.status, 'is_active', v_row.is_active));
  return v_row;
end
$$;

create or replace function public.admin_record_donation(p_payload jsonb, p_actor uuid)
returns public.donations
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_campaign uuid;
  v_amount numeric(12,2);
  v_alias text;
  v_message text;
  v_status text;
  v_show boolean;
  v_row public.donations;
begin
  if p_actor is null or p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Invalid donation request.';
  end if;
  v_campaign := nullif(p_payload->>'campaign_id', '')::uuid;
  v_amount := nullif(p_payload->>'amount', '')::numeric;
  v_alias := nullif(btrim(p_payload->>'donor_alias'), '');
  v_message := nullif(btrim(p_payload->>'message'), '');
  v_status := coalesce(nullif(p_payload->>'status', ''), 'pending');
  v_show := coalesce(nullif(p_payload->>'show_in_ranking', '')::boolean, true);

  if v_campaign is null or v_amount is null or v_amount < 0.01 or v_amount > 9999999999.99
    or (v_alias is not null and (char_length(v_alias) > 60 or v_alias like '%@%'))
    or char_length(coalesce(v_message, '')) > 500
    or v_status not in ('pending', 'confirmed', 'rejected') then
    raise exception 'Donation fields failed validation.';
  end if;
  if not exists (select 1 from public.campaigns where id = v_campaign) then
    raise exception 'Campaign not found.';
  end if;
  if v_alias is null then v_show := false; end if;

  v_id := nullif(p_payload->>'id', '')::uuid;
  if v_id is null then
    insert into public.donations (
      campaign_id, amount, donor_alias, message, status, show_in_ranking,
      points_earned, created_by, confirmed_by, confirmed_at
    ) values (
      v_campaign, v_amount, v_alias, v_message, v_status, v_show, null, p_actor,
      case when v_status = 'confirmed' then p_actor else null end,
      case when v_status = 'confirmed' then now() else null end
    ) returning * into v_row;
  else
    update public.donations set
      campaign_id = v_campaign, amount = v_amount, donor_alias = v_alias, message = v_message,
      status = v_status, show_in_ranking = v_show, confirmed_by = case when v_status = 'confirmed' then p_actor else null end,
      confirmed_at = case when v_status = 'confirmed' then coalesce(confirmed_at, now()) else null end
    where id = v_id returning * into v_row;
    if not found then raise exception 'Donation not found.'; end if;
  end if;

  insert into public.admin_audit_log (actor_user_id, action, entity, entity_id, details)
  values (p_actor, case when v_status = 'confirmed' then 'confirm' else 'record' end,
    'donation', v_row.id,
    jsonb_build_object('campaign_id', v_campaign, 'amount', v_amount, 'status', v_status));
  return v_row;
end
$$;

create or replace function public.admin_upsert_news(p_payload jsonb, p_actor uuid)
returns public.news_posts
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_slug text;
  v_title text;
  v_summary text;
  v_body text;
  v_category text;
  v_source text;
  v_status text;
  v_published timestamptz;
  v_row public.news_posts;
begin
  if p_actor is null or p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Invalid news request.';
  end if;
  v_slug := lower(btrim(coalesce(p_payload->>'slug', '')));
  v_title := btrim(coalesce(p_payload->>'title', ''));
  v_summary := btrim(coalesce(p_payload->>'summary', ''));
  v_body := coalesce(p_payload->>'body', '');
  v_category := coalesce(nullif(btrim(p_payload->>'category'), ''), 'Comunidade');
  v_source := nullif(btrim(p_payload->>'source_url'), '');
  v_status := coalesce(nullif(p_payload->>'status', ''), 'draft');
  v_published := case when v_status = 'published' then coalesce(nullif(p_payload->>'published_at', '')::timestamptz, now()) else null end;
  if v_slug !~ '^[a-z0-9][a-z0-9-]{1,99}$' or char_length(v_title) not between 5 and 180
    or char_length(v_summary) not between 10 and 1200 or char_length(v_body) > 12000
    or char_length(v_category) not between 2 and 60
    or (v_source is not null and v_source !~ '^https://')
    or v_status not in ('draft', 'published', 'archived') then
    raise exception 'News fields failed validation.';
  end if;
  v_id := nullif(p_payload->>'id', '')::uuid;
  if v_id is null then select id into v_id from public.news_posts where slug = v_slug; end if;
  insert into public.news_posts (id, slug, category, title, summary, body, source_url, status, published_at, created_by, updated_at)
  values (coalesce(v_id, gen_random_uuid()), v_slug, v_category, v_title, v_summary, v_body, v_source, v_status, v_published, p_actor, now())
  on conflict (id) do update set slug = excluded.slug, category = excluded.category, title = excluded.title,
    summary = excluded.summary, body = excluded.body, source_url = excluded.source_url,
    status = excluded.status, published_at = excluded.published_at, updated_at = now()
  returning * into v_row;
  insert into public.admin_audit_log (actor_user_id, action, entity, entity_id, details)
  values (p_actor, 'upsert', 'news_post', v_row.id, jsonb_build_object('slug', v_row.slug, 'status', v_row.status));
  return v_row;
end
$$;

create or replace function public.admin_upsert_tracker_update(p_payload jsonb, p_actor uuid)
returns public.tracker_updates
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_project_id text;
  v_project_name text;
  v_percent numeric(5,2);
  v_milestone text;
  v_summary text;
  v_source text;
  v_status text;
  v_published timestamptz;
  v_row public.tracker_updates;
begin
  if p_actor is null or p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Invalid tracker update request.';
  end if;
  v_project_id := lower(btrim(coalesce(p_payload->>'project_id', '')));
  v_project_name := btrim(coalesce(p_payload->>'project_name', ''));
  v_percent := nullif(p_payload->>'percent', '')::numeric;
  v_milestone := btrim(coalesce(p_payload->>'milestone', ''));
  v_summary := btrim(coalesce(p_payload->>'summary', ''));
  v_source := nullif(btrim(p_payload->>'source_url'), '');
  v_status := coalesce(nullif(p_payload->>'status', ''), 'draft');
  v_published := case when v_status = 'published' then coalesce(nullif(p_payload->>'published_at', '')::timestamptz, now()) else null end;
  if v_project_id !~ '^[a-z0-9][a-z0-9-]{1,79}$'
    or char_length(v_project_name) not between 2 and 120
    or v_percent is null or v_percent not between 0 and 100
    or char_length(v_milestone) not between 2 and 80
    or char_length(v_summary) not between 10 and 1200
    or (v_source is not null and v_source !~ '^https://')
    or v_status not in ('draft', 'published', 'archived') then
    raise exception 'Tracker fields failed validation.';
  end if;
  v_id := nullif(p_payload->>'id', '')::uuid;
  insert into public.tracker_updates (id, project_id, project_name, percent, milestone, summary, source_url, status, published_at, created_by, updated_at)
  values (coalesce(v_id, gen_random_uuid()), v_project_id, v_project_name, v_percent, v_milestone, v_summary, v_source, v_status, v_published, p_actor, now())
  on conflict (id) do update set project_id = excluded.project_id, project_name = excluded.project_name,
    percent = excluded.percent, milestone = excluded.milestone, summary = excluded.summary,
    source_url = excluded.source_url, status = excluded.status, published_at = excluded.published_at, updated_at = now()
  returning * into v_row;
  insert into public.admin_audit_log (actor_user_id, action, entity, entity_id, details)
  values (p_actor, 'upsert', 'tracker_update', v_row.id,
    jsonb_build_object('project_id', v_row.project_id, 'percent', v_row.percent, 'status', v_row.status));
  return v_row;
end
$$;

revoke all on function public.admin_upsert_campaign(jsonb, uuid),
  public.admin_record_donation(jsonb, uuid),
  public.admin_upsert_news(jsonb, uuid),
  public.admin_upsert_tracker_update(jsonb, uuid)
  from public, anon, authenticated;
grant execute on function public.admin_upsert_campaign(jsonb, uuid),
  public.admin_record_donation(jsonb, uuid),
  public.admin_upsert_news(jsonb, uuid),
  public.admin_upsert_tracker_update(jsonb, uuid)
  to service_role;

grant all on public.campaigns, public.donations, public.news_posts, public.tracker_updates,
  public.community_posts, public.profiles, public.points_ledger, public.admin_audit_log
  to service_role;
