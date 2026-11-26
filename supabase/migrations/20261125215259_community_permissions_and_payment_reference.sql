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