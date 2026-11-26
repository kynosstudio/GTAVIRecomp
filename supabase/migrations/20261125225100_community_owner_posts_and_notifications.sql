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
