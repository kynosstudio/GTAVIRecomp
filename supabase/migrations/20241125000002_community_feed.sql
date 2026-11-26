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

-- The admin UI now uses the authenticated server routes; do not expose privileged
-- SECURITY DEFINER RPCs directly to arbitrary authenticated browser sessions.
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
