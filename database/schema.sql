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

-- Explicitly remove broad default API access. The final static-site migration grants
-- administrator writes through is_admin() policies and keeps public reads on narrow views.
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
  select
    public.campaigns.id as campaign_id,
    coalesce(nullif(btrim(d.donor_alias), ''), 'Apoiador anônimo') as donor_alias,
    count(*) filter (where d.status = 'confirmed') as donations_count,
    coalesce(round(sum(d.amount) filter (where d.status = 'confirmed') * 100)::bigint, 0) as total_cents,
    max(d.created_at) as last_donation_at
  from public.donations as d
  join public.campaigns on public.campaigns.id = d.campaign_id
  where d.status = 'confirmed'
    and d.show_in_ranking
    and public.campaigns.status in ('active', 'paused', 'completed', 'archived')
  group by
    public.campaigns.id,
    coalesce(nullif(btrim(d.donor_alias), ''), 'Apoiador anônimo');

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

-- Legacy privileged RPCs remain restricted to service_role. The static admin UI writes
-- directly to tables under RLS policies added by the final migration.
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

-- Community feed, moderated media, reactions, comments, and sponsored campaigns.
-- Safe to re-run. Apply after the initial schema and admin browser permissions.

alter table public.community_posts
  add column if not exists headline text,
  add column if not exists media_path text,
  add column if not exists link_url text,
  add column if not exists link_preview jsonb not null default '{}'::jsonb,
  add column if not exists is_sponsored boolean not null default false,
  add column if not exists heart_count integer not null default 0,
  add column if not exists skull_count integer not null default 0,
  add column if not exists comment_count integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

alter table public.community_posts
  drop constraint if exists community_posts_status_check,
  drop constraint if exists community_posts_body_check,
  drop constraint if exists community_posts_check,
  drop constraint if exists community_posts_media_reference_check,
  drop constraint if exists community_posts_media_path_check,
  drop constraint if exists community_posts_link_preview_check,
  drop constraint if exists community_posts_reaction_counts_check;

alter table public.community_posts
  add constraint community_posts_status_check
    check (status in ('pending', 'approved', 'published', 'rejected', 'archived')),
  add constraint community_posts_body_check
    check (
      char_length(btrim(body)) <= 3000
      and (
        char_length(btrim(body)) > 0
        or media_path is not null
        or media_url is not null
        or link_url is not null
      )
    ),
  add constraint community_posts_media_reference_check
    check (
      (media_path is null and media_url is null and media_type is null)
      or (media_path is not null and media_url is null and media_type is not null and media_type in ('image', 'video'))
      or (media_path is null and media_url is not null and media_type is not null and media_type in ('image', 'video'))
    ),
  add constraint community_posts_media_path_check
    check (
      media_path is null
      or media_path ~ '^[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$'
    ),
  add constraint community_posts_link_preview_check
    check (jsonb_typeof(link_preview) = 'object'),
  add constraint community_posts_reaction_counts_check
    check (heart_count >= 0 and skull_count >= 0 and comment_count >= 0);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  author_alias text not null default 'Visitante'
    check (char_length(btrim(author_alias)) between 1 and 30),
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists community_comments_post_created_idx
  on public.community_comments (post_id, created_at);

create table if not exists public.community_reactions (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  voter_id uuid not null,
  reaction text not null check (reaction in ('heart', 'skull')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (post_id, voter_id)
);

create table if not exists public.community_ads (
  id uuid primary key default gen_random_uuid(),
  advertiser_name text not null check (char_length(btrim(advertiser_name)) between 2 and 100),
  contact_email text not null check (char_length(contact_email) between 3 and 254),
  title text not null check (char_length(btrim(title)) between 3 and 120),
  description text not null check (char_length(btrim(description)) between 1 and 1000),
  destination_url text not null check (destination_url ~ '^https://'),
  media_path text check (
    media_path is null
    or media_path ~ '^[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$'
  ),
  media_type text check (media_type is null or media_type in ('image', 'video')),
  duration_days smallint not null default 7 check (duration_days between 1 and 90),
  payment_status text not null default 'quote_requested'
    check (payment_status in ('quote_requested', 'paid', 'waived', 'refunded')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled', 'expired')),
  post_id uuid references public.community_posts (id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((media_path is null) = (media_type is null))
);

create index if not exists community_ads_status_created_idx
  on public.community_ads (status, created_at desc);
create index if not exists community_posts_public_created_idx
  on public.community_posts (created_at desc, id desc)
  where status in ('approved', 'published');

alter table public.community_comments enable row level security;
alter table public.community_reactions enable row level security;
alter table public.community_ads enable row level security;

revoke all on public.community_comments, public.community_reactions, public.community_ads
  from public, anon, authenticated;
grant all on public.community_comments, public.community_reactions, public.community_ads
  to service_role;

drop policy if exists "public reads current community posts" on public.community_posts;
create policy "public reads current community posts" on public.community_posts
  for select to anon, authenticated using (
    status in ('approved', 'published') and (expires_at is null or expires_at > now())
  );

create or replace view public.current_community_posts with (security_invoker = true) as
  select id, author_alias, body, media_url, media_type, expires_at, created_at,
    media_path, headline, link_url, link_preview, is_sponsored,
    heart_count, skull_count, comment_count, status
  from public.community_posts
  where status in ('approved', 'published') and (expires_at is null or expires_at > now());

grant select (
  id, author_alias, body, media_url, media_type, expires_at, created_at,
  media_path, headline, link_url, link_preview, is_sponsored,
  heart_count, skull_count, comment_count, status
) on public.community_posts to anon, authenticated;
grant select on public.current_community_posts to anon, authenticated;

-- Pending media remains private; only the server-side service role can upload or sign it.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-media',
  'community-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "community media public reads" on storage.objects;
drop policy if exists "community media public uploads" on storage.objects;

create or replace function public.community_increment_comment_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.community_posts
  set comment_count = comment_count + 1
  where id = new.post_id;
  return new;
end
$$;

revoke all on function public.community_increment_comment_count() from public, anon, authenticated;
grant execute on function public.community_increment_comment_count() to service_role;

drop trigger if exists community_comment_count_after_insert on public.community_comments;
create trigger community_comment_count_after_insert
  after insert on public.community_comments
  for each row execute function public.community_increment_comment_count();

create or replace function public.community_cast_reaction(
  p_post_id uuid,
  p_voter_id uuid,
  p_reaction text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing text;
  v_selected text;
  v_heart_count integer;
  v_skull_count integer;
begin
  if p_post_id is null or p_voter_id is null
    or (p_reaction is not null and p_reaction not in ('heart', 'skull')) then
    raise exception 'Invalid community reaction.';
  end if;

  perform 1 from public.community_posts
  where id = p_post_id
    and status in ('approved', 'published')
    and (expires_at is null or expires_at > now())
  for update;
  if not found then raise exception 'Published post not found.'; end if;

  select reaction into v_existing
  from public.community_reactions
  where post_id = p_post_id and voter_id = p_voter_id;

  if p_reaction is null or p_reaction = v_existing then
    delete from public.community_reactions
    where post_id = p_post_id and voter_id = p_voter_id;
    v_selected := null;
  else
    insert into public.community_reactions (post_id, voter_id, reaction)
    values (p_post_id, p_voter_id, p_reaction)
    on conflict (post_id, voter_id) do update
      set reaction = excluded.reaction, updated_at = now();
    v_selected := p_reaction;
  end if;

  select
    (count(*) filter (where reaction = 'heart'))::integer,
    (count(*) filter (where reaction = 'skull'))::integer
  into v_heart_count, v_skull_count
  from public.community_reactions
  where post_id = p_post_id;

  update public.community_posts
  set heart_count = v_heart_count, skull_count = v_skull_count, updated_at = now()
  where id = p_post_id;

  return jsonb_build_object(
    'heart_count', v_heart_count,
    'skull_count', v_skull_count,
    'reaction', v_selected
  );
end
$$;

revoke all on function public.community_cast_reaction(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.community_cast_reaction(uuid, uuid, text) to service_role;

alter table public.admin_audit_log
  drop constraint if exists admin_audit_log_entity_check;
alter table public.admin_audit_log
  add constraint admin_audit_log_entity_check
    check (entity in ('campaign', 'donation', 'news_post', 'tracker_update', 'community_post', 'community_ad'));

create or replace function public.admin_moderate_community_post(
  p_post_id uuid,
  p_action text,
  p_actor uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post public.community_posts;
begin
  if p_post_id is null or p_actor is null or p_action is null
    or p_action not in ('approve', 'reject', 'delete') then
    raise exception 'Invalid community moderation request.';
  end if;

  select * into v_post
  from public.community_posts
  where id = p_post_id
  for update;
  if not found then raise exception 'Community post not found.'; end if;

  if p_action = 'delete' then
    insert into public.admin_audit_log (actor_user_id, action, entity, entity_id, details)
    values (p_actor, 'delete', 'community_post', v_post.id,
      jsonb_build_object('status', v_post.status, 'is_sponsored', v_post.is_sponsored));
    delete from public.community_posts where id = p_post_id;
    return jsonb_build_object('id', v_post.id, 'media_path', v_post.media_path, 'deleted', true);
  end if;

  update public.community_posts
  set status = case when p_action = 'approve' then 'approved' else 'rejected' end,
      updated_at = now()
  where id = p_post_id
  returning * into v_post;

  insert into public.admin_audit_log (actor_user_id, action, entity, entity_id, details)
  values (p_actor, p_action, 'community_post', v_post.id,
    jsonb_build_object('status', v_post.status, 'is_sponsored', v_post.is_sponsored));
  return to_jsonb(v_post);
end
$$;

create or replace function public.admin_review_community_ad(
  p_ad_id uuid,
  p_action text,
  p_payment_status text,
  p_actor uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ad public.community_ads;
  v_post public.community_posts;
begin
  if p_ad_id is null or p_actor is null or p_action is null or p_payment_status is null
    or p_action not in ('approve', 'reject')
    or p_payment_status not in ('quote_requested', 'paid', 'waived', 'refunded') then
    raise exception 'Invalid community ad review request.';
  end if;

  select * into v_ad from public.community_ads where id = p_ad_id for update;
  if not found then raise exception 'Community ad request not found.'; end if;
  if p_action = 'approve' and p_payment_status not in ('paid', 'waived') then
    raise exception 'Record payment or waive the fee before approving an ad.';
  end if;

  if p_action = 'approve' then
    if v_ad.post_id is null then
      insert into public.community_posts (
        author_alias, headline, body, media_path, media_type, link_url,
        is_sponsored, status, expires_at
      ) values (
        v_ad.advertiser_name, v_ad.title, v_ad.description, v_ad.media_path, v_ad.media_type,
        v_ad.destination_url, true, 'approved', now() + make_interval(days => v_ad.duration_days)
      ) returning * into v_post;
    else
      update public.community_posts
      set author_alias = v_ad.advertiser_name,
          headline = v_ad.title,
          body = v_ad.description,
          media_path = v_ad.media_path,
          media_type = v_ad.media_type,
          link_url = v_ad.destination_url,
          is_sponsored = true,
          status = 'approved',
          expires_at = now() + make_interval(days => v_ad.duration_days),
          updated_at = now()
      where id = v_ad.post_id
      returning * into v_post;
    end if;
    update public.community_ads
    set status = 'approved', payment_status = p_payment_status,
        post_id = v_post.id, expires_at = v_post.expires_at, updated_at = now()
    where id = p_ad_id
    returning * into v_ad;
  else
    if v_ad.post_id is not null then
      update public.community_posts
      set status = 'rejected', updated_at = now()
      where id = v_ad.post_id;
    end if;
    update public.community_ads
    set status = 'rejected', payment_status = p_payment_status, updated_at = now()
    where id = p_ad_id
    returning * into v_ad;
  end if;

  insert into public.admin_audit_log (actor_user_id, action, entity, entity_id, details)
  values (p_actor, p_action, 'community_ad', v_ad.id,
    jsonb_build_object('status', v_ad.status, 'payment_status', v_ad.payment_status, 'post_id', v_ad.post_id));
  return to_jsonb(v_ad);
end
$$;

revoke all on function public.admin_moderate_community_post(uuid, text, uuid),
  public.admin_review_community_ad(uuid, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.admin_moderate_community_post(uuid, text, uuid),
  public.admin_review_community_ad(uuid, text, text, uuid)
  to service_role;

grant all on public.community_posts, public.community_comments, public.community_reactions,
  public.community_ads to service_role;

-- Keep the legacy actor-parameter RPCs private; the browser uses table RLS instead.
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

-- Direct static-site access for GitHub Pages through supabase-js and RLS.
-- Safe to re-run. Apply after the initial schema and community feed migrations.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from public, anon, authenticated;
grant select (user_id, created_at) on public.admin_users to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admin users read own membership" on public.admin_users;
create policy "admin users read own membership" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Public readers use curated views; authenticated operators use table RLS.
create or replace view public.public_campaigns with (security_invoker = false) as
  select id, slug, title, summary, description, goal_amount, banner_url, color_start, color_end,
    gradient_angle, case when is_active then pix_key else null end as pix_key,
    case when is_active then qr_code_url else null end as qr_code_url,
    xlaunch_percent, kynos_maintenance_percent, status, is_active, created_at, updated_at
  from public.campaigns
  where status in ('active', 'paused', 'completed', 'archived');

create or replace view public.donor_leaderboard with (security_invoker = false) as
  select
    c.id as campaign_id,
    coalesce(nullif(btrim(d.donor_alias), ''), 'Apoiador anônimo') as donor_alias,
    count(*) filter (where d.status = 'confirmed') as donations_count,
    coalesce(round(sum(d.amount) filter (where d.status = 'confirmed') * 100)::bigint, 0) as total_cents,
    max(d.created_at) as last_donation_at
  from public.donations as d
  join public.campaigns as c on c.id = d.campaign_id
  where d.status = 'confirmed'
    and d.show_in_ranking
    and c.status in ('active', 'paused', 'completed', 'archived')
  group by c.id, coalesce(nullif(btrim(d.donor_alias), ''), 'Apoiador anônimo');

create or replace view public.published_news with (security_invoker = false) as
  select id, slug, category, title, summary, body, source_url, published_at, created_at
  from public.news_posts
  where status = 'published' and published_at is not null and published_at <= now();

create or replace view public.published_tracker_updates with (security_invoker = false) as
  select id, project_id, project_name, percent, milestone, summary, source_url, published_at, created_at
  from public.tracker_updates
  where status = 'published' and published_at is not null and published_at <= now();

create or replace view public.current_community_posts with (security_invoker = false) as
  select id, author_alias, body, media_url, media_type, expires_at, created_at,
    media_path, headline, link_url, link_preview, is_sponsored,
    heart_count, skull_count, comment_count, status
  from public.community_posts
  where status in ('approved', 'published') and (expires_at is null or expires_at > now());

create or replace view public.current_community_comments with (security_invoker = false) as
  select c.id, c.post_id, c.author_alias, c.body, c.created_at
  from public.community_comments as c
  join public.community_posts as p on p.id = c.post_id
  where p.status in ('approved', 'published')
    and (p.expires_at is null or p.expires_at > now());

grant select on public.public_campaigns, public.donor_leaderboard,
  public.published_news, public.published_tracker_updates,
  public.current_community_posts, public.current_community_comments
  to anon, authenticated;
grant execute on function public.public_campaign_totals() to anon, authenticated;

-- Authenticated operators can read and write records; RLS grants no rows to other users.
grant select, insert, update, delete on public.campaigns, public.donations,
  public.news_posts, public.tracker_updates, public.community_posts,
  public.community_comments, public.community_ads, public.admin_audit_log
  to authenticated;

revoke select (
  id, slug, title, summary, description, goal_amount, banner_url, color_start,
  color_end, gradient_angle, pix_key, qr_code_url, xlaunch_percent,
  kynos_maintenance_percent, status, is_active, created_at, updated_at
) on public.campaigns from anon, authenticated;
revoke select (
  campaign_id, amount, donor_alias, status, show_in_ranking, created_at
) on public.donations from anon, authenticated;
revoke select (
  id, slug, category, title, summary, body, source_url, status, published_at, created_at
) on public.news_posts from anon, authenticated;
revoke select (
  id, project_id, project_name, percent, milestone, summary, source_url, status, published_at, created_at
) on public.tracker_updates from anon, authenticated;
revoke select (
  id, author_alias, body, media_url, media_type, status, expires_at, created_at,
  media_path, headline, link_url, link_preview, is_sponsored,
  heart_count, skull_count, comment_count
) on public.community_posts from anon, authenticated;

grant insert (
  author_alias, body, media_url, media_type, status, headline,
  link_url, link_preview, is_sponsored
) on public.community_posts to anon, authenticated;
grant insert (post_id, author_alias, body)
  on public.community_comments to anon, authenticated;
grant insert (
  advertiser_name, contact_email, title, description, destination_url,
  media_path, media_type, duration_days
) on public.community_ads to anon, authenticated;

drop policy if exists "public reads listed campaigns" on public.campaigns;
drop policy if exists "public reads active campaigns" on public.campaigns;
create policy "public reads listed campaigns" on public.campaigns
  for select to anon
  using (status in ('active', 'paused', 'completed', 'archived'));

drop policy if exists "public reads ranked confirmed donations" on public.donations;
create policy "public reads ranked confirmed donations" on public.donations
  for select to anon
  using (status = 'confirmed' and show_in_ranking);

drop policy if exists "public reads published news" on public.news_posts;
create policy "public reads published news" on public.news_posts
  for select to anon
  using (status = 'published' and published_at is not null and published_at <= now());

drop policy if exists "public reads published tracker updates" on public.tracker_updates;
create policy "public reads published tracker updates" on public.tracker_updates
  for select to anon
  using (status = 'published' and published_at is not null and published_at <= now());

drop policy if exists "public reads current community posts" on public.community_posts;
create policy "public reads current community posts" on public.community_posts
  for select to anon
  using (status in ('approved', 'published') and (expires_at is null or expires_at > now()));

drop policy if exists "public submits community posts" on public.community_posts;
create policy "public submits community posts" on public.community_posts
  for insert to anon, authenticated
  with check (
    char_length(btrim(author_alias)) between 2 and 30
    and char_length(btrim(body)) <= 3000
    and media_path is null
    and expires_at is null
    and (
      media_url is null
      or media_url ~ '^https://fefvytprogasugctxdom\.supabase\.co/storage/v1/object/public/community-media/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|mp4|webm)$'
    )
    and heart_count = 0 and skull_count = 0 and comment_count = 0
    and (link_url is null or link_url ~ '^https://')
    and jsonb_typeof(link_preview) = 'object'
    and (
      ((media_url is not null or is_sponsored) and status = 'pending')
      or (media_url is null and not is_sponsored and status = 'published')
    )
  );

drop policy if exists "public reads community comments" on public.community_comments;
create policy "public reads community comments" on public.community_comments
  for select to anon
  using (exists (
    select 1 from public.community_posts p
    where p.id = post_id and p.status in ('approved', 'published')
      and (p.expires_at is null or p.expires_at > now())
  ));

drop policy if exists "public submits community comments" on public.community_comments;
create policy "public submits community comments" on public.community_comments
  for insert to anon, authenticated
  with check (
    char_length(btrim(author_alias)) between 1 and 30
    and char_length(btrim(body)) between 1 and 1000
    and exists (
      select 1 from public.current_community_posts p where p.id = post_id
    )
  );

drop policy if exists "public submits community ad requests" on public.community_ads;
create policy "public submits community ad requests" on public.community_ads
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and payment_status = 'quote_requested'
    and post_id is null
    and expires_at is null
    and char_length(btrim(advertiser_name)) between 2 and 100
    and char_length(contact_email) between 3 and 254
    and char_length(btrim(title)) between 3 and 120
    and char_length(btrim(description)) between 1 and 1000
    and destination_url ~ '^https://'
    and duration_days between 1 and 90
  );

drop policy if exists "admins manage campaigns" on public.campaigns;
create policy "admins manage campaigns" on public.campaigns
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins manage donations" on public.donations;
create policy "admins manage donations" on public.donations
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins manage news" on public.news_posts;
create policy "admins manage news" on public.news_posts
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins manage trackers" on public.tracker_updates;
create policy "admins manage trackers" on public.tracker_updates
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins manage community posts" on public.community_posts;
create policy "admins manage community posts" on public.community_posts
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins manage community comments" on public.community_comments;
create policy "admins manage community comments" on public.community_comments
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins manage community ads" on public.community_ads;
create policy "admins manage community ads" on public.community_ads
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins read audit log" on public.admin_audit_log;
create policy "admins read audit log" on public.admin_audit_log
  for select to authenticated
  using ((select public.is_admin()));

create index if not exists tracker_updates_project_history_idx
  on public.tracker_updates (project_id, published_at desc, created_at desc);

-- Anonymous uploads are intentionally public after upload; keep paths, MIME types,
-- extensions, and object sizes constrained by this bucket configuration.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-media',
  'community-media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  name = excluded.name,
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

grant insert on storage.objects to anon, authenticated;
grant delete on storage.objects to authenticated;

drop policy if exists "community media public uploads" on storage.objects;
create policy "community media public uploads" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'community-media'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|mp4|webm)$'
  );

drop policy if exists "admins delete community media" on storage.objects;
create policy "admins delete community media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'community-media' and (select public.is_admin()));

create or replace function public.admin_moderate_community_post(
  p_post_id uuid,
  p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not (select public.is_admin()) then
    raise exception 'Administrator access required.';
  end if;
  return public.admin_moderate_community_post(p_post_id, p_action, (select auth.uid()));
end
$$;

create or replace function public.admin_review_community_ad(
  p_ad_id uuid,
  p_action text,
  p_payment_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not (select public.is_admin()) then
    raise exception 'Administrator access required.';
  end if;
  return public.admin_review_community_ad(
    p_ad_id, p_action, p_payment_status, (select auth.uid())
  );
end
$$;

revoke all on function public.admin_moderate_community_post(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_review_community_ad(uuid, text, text) from public, anon, authenticated;
grant execute on function public.admin_moderate_community_post(uuid, text),
  public.admin_review_community_ad(uuid, text, text) to authenticated;

revoke all on function public.community_cast_reaction(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.community_cast_reaction(uuid, uuid, text) to anon, authenticated;

-- The browser writes tables under RLS instead of calling the old actor-parameter RPCs.
revoke all on function public.admin_upsert_campaign(jsonb, uuid),
  public.admin_record_donation(jsonb, uuid),
  public.admin_upsert_news(jsonb, uuid),
  public.admin_upsert_tracker_update(jsonb, uuid),
  public.admin_moderate_community_post(uuid, text, uuid),
  public.admin_review_community_ad(uuid, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.admin_upsert_campaign(jsonb, uuid),
  public.admin_record_donation(jsonb, uuid),
  public.admin_upsert_news(jsonb, uuid),
  public.admin_upsert_tracker_update(jsonb, uuid),
  public.admin_moderate_community_post(uuid, text, uuid),
  public.admin_review_community_ad(uuid, text, text, uuid)
  to service_role;

-- Repair public Community table access while keeping moderation behind is_admin().
-- Non-media, non-sponsored posts are immediately approved; media/sponsored posts wait.
-- Safe to apply again through the Supabase SQL Editor or migration runner.

grant usage on schema public to anon, authenticated;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_ads enable row level security;

update public.community_posts
set status = 'approved'
where status = 'published';

alter table public.community_ads
  add column if not exists payment_reference text;

alter table public.community_ads
  drop constraint if exists community_ads_payment_reference_check;
alter table public.community_ads
  add constraint community_ads_payment_reference_check
  check (payment_reference is null or char_length(btrim(payment_reference)) between 1 and 160);

revoke all on public.community_posts, public.community_comments
  from public, anon, authenticated;
grant select, insert on public.community_posts, public.community_comments
  to anon, authenticated;
grant update, delete on public.community_posts, public.community_comments
  to authenticated;

revoke all on public.community_ads from public, anon, authenticated;
grant select, insert, update, delete on public.community_ads to authenticated;
grant insert (
  advertiser_name, contact_email, title, description, destination_url,
  media_path, media_type, duration_days, payment_reference
) on public.community_ads to anon, authenticated;

drop policy if exists "public reads current community posts" on public.community_posts;
drop policy if exists "public reads approved community posts" on public.community_posts;
create policy "public reads approved community posts" on public.community_posts
  for select to anon, authenticated
  using (status = 'approved' and (expires_at is null or expires_at > now()));

drop policy if exists "admins read all community posts" on public.community_posts;
create policy "admins read all community posts" on public.community_posts
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "admins manage community posts" on public.community_posts;
create policy "admins manage community posts" on public.community_posts
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "public submits community posts" on public.community_posts;
create policy "public submits community posts" on public.community_posts
  for insert to anon, authenticated
  with check (
    char_length(btrim(author_alias)) between 2 and 30
    and char_length(btrim(body)) <= 3000
    and user_id is null
    and media_path is null
    and expires_at is null
    and created_at between now() - interval '1 minute' and now() + interval '1 minute'
    and updated_at between now() - interval '1 minute' and now() + interval '1 minute'
    and heart_count = 0
    and skull_count = 0
    and comment_count = 0
    and (link_url is null or link_url ~ '^https://')
    and jsonb_typeof(link_preview) = 'object'
    and (
      media_url is null
      or media_url ~ '^https://fefvytprogasugctxdom\.supabase\.co/storage/v1/object/public/community-media/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|mp4|webm)$'
    )
    and (
      (status = 'pending' and (media_url is not null or is_sponsored))
      or (status = 'approved' and media_url is null and not is_sponsored)
    )
  );

drop policy if exists "public reads community comments" on public.community_comments;
drop policy if exists "public reads approved community comments" on public.community_comments;
create policy "public reads approved community comments" on public.community_comments
  for select to anon, authenticated
  using (exists (
    select 1
    from public.community_posts as p
    where p.id = post_id
      and p.status = 'approved'
      and (p.expires_at is null or p.expires_at > now())
  ));

drop policy if exists "admins read all community comments" on public.community_comments;
create policy "admins read all community comments" on public.community_comments
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "admins manage community comments" on public.community_comments;
create policy "admins manage community comments" on public.community_comments
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "public submits community comments" on public.community_comments;
create policy "public submits community comments" on public.community_comments
  for insert to anon, authenticated
  with check (
    char_length(btrim(author_alias)) between 1 and 30
    and char_length(btrim(body)) between 1 and 1000
    and created_at between now() - interval '1 minute' and now() + interval '1 minute'
    and exists (
      select 1
      from public.community_posts as p
      where p.id = post_id
        and p.status = 'approved'
        and (p.expires_at is null or p.expires_at > now())
    )
  );

create or replace view public.current_community_posts
with (security_invoker = true) as
  select id, author_alias, body, media_url, media_type, expires_at, created_at,
    media_path, headline, link_url, link_preview, is_sponsored,
    heart_count, skull_count, comment_count, status
  from public.community_posts
  where status = 'approved' and (expires_at is null or expires_at > now());

create or replace view public.current_community_comments
with (security_invoker = true) as
  select c.id, c.post_id, c.author_alias, c.body, c.created_at
  from public.community_comments as c
  join public.community_posts as p on p.id = c.post_id
  where p.status = 'approved'
    and (p.expires_at is null or p.expires_at > now());

grant select on public.current_community_posts, public.current_community_comments
  to anon, authenticated;

drop policy if exists "public submits community ad requests" on public.community_ads;
create policy "public submits community ad requests" on public.community_ads
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and payment_status = 'quote_requested'
    and post_id is null
    and expires_at is null
    and char_length(btrim(advertiser_name)) between 2 and 100
    and char_length(contact_email) between 3 and 254
    and char_length(btrim(title)) between 3 and 120
    and char_length(btrim(description)) between 1 and 1000
    and destination_url ~ '^https://'
    and duration_days between 1 and 90
    and (payment_reference is null or char_length(btrim(payment_reference)) between 1 and 160)
  );

drop policy if exists "admins manage community ads" on public.community_ads;
create policy "admins manage community ads" on public.community_ads
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on function public.community_cast_reaction(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.community_cast_reaction(uuid, uuid, text)
  to anon, authenticated;

-- Anonymous post ownership and community notices for the static Supabase client.
-- Re-runnable; run after the static-access and community-permissions migrations.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from public, anon, authenticated;
grant select (user_id, created_at) on public.admin_users to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admin users read own membership" on public.admin_users;
create policy "admin users read own membership" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

grant usage on schema public to anon, authenticated;
grant select, insert on public.community_posts to anon, authenticated;
grant update, delete on public.community_posts to authenticated;
grant select, insert on public.community_comments to anon, authenticated;
grant update, delete on public.community_comments to authenticated;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.community_post_owners (
  post_id uuid primary key references public.community_posts (id) on delete cascade,
  token_hash text not null check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

create index if not exists community_post_owners_token_hash_idx
  on private.community_post_owners (token_hash);

alter table private.community_post_owners enable row level security;
revoke all on private.community_post_owners from public, anon, authenticated;

create or replace function public.community_create_post(
  p_author_alias text,
  p_body text,
  p_media_url text,
  p_media_type text,
  p_link_url text,
  p_link_preview jsonb,
  p_owner_token_hash text
)
returns public.community_posts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post public.community_posts;
  v_body text := coalesce(p_body, '');
begin
  if p_owner_token_hash is null or p_owner_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid post ownership capability.';
  end if;
  if p_author_alias is null or char_length(btrim(p_author_alias)) not between 2 and 30 then
    raise exception 'The author nickname must contain 2 to 30 characters.';
  end if;
  if char_length(v_body) > 3000
    or (char_length(btrim(v_body)) = 0 and p_media_url is null and p_link_url is null) then
    raise exception 'The post content is empty or too long.';
  end if;
  if (p_media_url is null and p_media_type is not null)
    or (p_media_url is not null and (
      p_media_type is null
      or p_media_type not in ('image', 'video')
      or p_media_url !~ '^https://fefvytprogasugctxdom\.supabase\.co/storage/v1/object/public/community-media/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|mp4|webm)$'
    )) then
    raise exception 'The uploaded media reference is invalid.';
  end if;
  if p_link_url is not null and (
    char_length(p_link_url) > 500
    or p_link_url !~ '^https://[^/@[:space:]]+([/?#][^[:space:]]*)?$'
  ) then
    raise exception 'The link must be a valid HTTPS URL.';
  end if;
  if p_link_preview is not null and jsonb_typeof(p_link_preview) <> 'object' then
    raise exception 'The link preview must be an object.';
  end if;

  insert into public.community_posts (
    author_alias, body, media_url, media_type, link_url, link_preview,
    is_sponsored, status
  ) values (
    btrim(p_author_alias), v_body, p_media_url, p_media_type, p_link_url,
    coalesce(p_link_preview, '{}'::jsonb), false,
    case when p_media_url is not null then 'pending' else 'approved' end
  )
  returning * into v_post;

  insert into private.community_post_owners (post_id, token_hash)
  values (v_post.id, p_owner_token_hash);

  return v_post;
end
$$;

create or replace function public.community_my_posts(p_owner_token_hash text)
returns setof public.community_posts
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_owner_token_hash is null or p_owner_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid post ownership capability.';
  end if;

  return query
  select p.*
  from public.community_posts as p
  join private.community_post_owners as o on o.post_id = p.id
  where o.token_hash = p_owner_token_hash
  order by p.created_at desc;
end
$$;

create or replace function public.community_update_my_post(
  p_post_id uuid,
  p_owner_token_hash text,
  p_author_alias text,
  p_body text,
  p_link_url text,
  p_link_preview jsonb
)
returns public.community_posts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post public.community_posts;
  v_body text := coalesce(p_body, '');
begin
  if p_owner_token_hash is null or p_owner_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid post ownership capability.';
  end if;
  if p_post_id is null or p_author_alias is null
    or char_length(btrim(p_author_alias)) not between 2 and 30 then
    raise exception 'Invalid post edit request.';
  end if;
  if char_length(v_body) > 3000 then
    raise exception 'The post content is too long.';
  end if;
  if p_link_url is not null and (
    char_length(p_link_url) > 500
    or p_link_url !~ '^https://[^/@[:space:]]+([/?#][^[:space:]]*)?$'
  ) then
    raise exception 'The link must be a valid HTTPS URL.';
  end if;
  if p_link_preview is not null and jsonb_typeof(p_link_preview) <> 'object' then
    raise exception 'The link preview must be an object.';
  end if;

  select p.* into v_post
  from public.community_posts as p
  join private.community_post_owners as o on o.post_id = p.id
  where p.id = p_post_id and o.token_hash = p_owner_token_hash
  for update of p;
  if not found then
    raise exception 'Post not found for this browser capability.';
  end if;

  if char_length(btrim(v_body)) = 0 and v_post.media_url is null
    and v_post.media_path is null and p_link_url is null then
    raise exception 'The post must contain text, a link, or media.';
  end if;

  update public.community_posts
  set author_alias = btrim(p_author_alias),
      body = v_body,
      link_url = p_link_url,
      link_preview = coalesce(p_link_preview, '{}'::jsonb),
      status = 'pending',
      updated_at = now()
  where id = p_post_id
  returning * into v_post;

  return v_post;
end
$$;

create or replace function public.community_delete_my_post(
  p_post_id uuid,
  p_owner_token_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_owner_token_hash is null or p_owner_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid post ownership capability.';
  end if;
  if p_post_id is null then
    raise exception 'Invalid post identifier.';
  end if;

  delete from public.community_posts as p
  using private.community_post_owners as o
  where p.id = p_post_id
    and o.post_id = p.id
    and o.token_hash = p_owner_token_hash;
  if not found then
    raise exception 'Post not found for this browser capability.';
  end if;
  return true;
end
$$;

revoke all on function public.community_create_post(text, text, text, text, text, jsonb, text)
  from public, anon, authenticated;
revoke all on function public.community_my_posts(text)
  from public, anon, authenticated;
revoke all on function public.community_update_my_post(uuid, text, text, text, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.community_delete_my_post(uuid, text)
  from public, anon, authenticated;
grant execute on function public.community_create_post(text, text, text, text, text, jsonb, text),
  public.community_my_posts(text),
  public.community_update_my_post(uuid, text, text, text, text, jsonb),
  public.community_delete_my_post(uuid, text)
  to anon, authenticated;

create table if not exists public.community_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 3 and 120),
  body text not null check (char_length(btrim(body)) between 1 and 1200),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_notifications_public_idx
  on public.community_notifications (published_at desc)
  where status = 'published';

alter table public.community_notifications enable row level security;
revoke all on public.community_notifications from public, anon, authenticated;
grant select on public.community_notifications to anon, authenticated;
grant insert, update, delete on public.community_notifications to authenticated;

drop policy if exists "public reads published community notifications" on public.community_notifications;
create policy "public reads published community notifications" on public.community_notifications
  for select to anon, authenticated
  using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );

drop policy if exists "admins manage community notifications" on public.community_notifications;
create policy "admins manage community notifications" on public.community_notifications
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create or replace view public.current_community_notifications
with (security_invoker = true) as
  select id, title, body, published_at, expires_at, created_at
  from public.community_notifications
  where status = 'published'
    and published_at is not null
    and published_at <= now()
    and (expires_at is null or expires_at > now());

grant select on public.current_community_notifications to anon, authenticated;
