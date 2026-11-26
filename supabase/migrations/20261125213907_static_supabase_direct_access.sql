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