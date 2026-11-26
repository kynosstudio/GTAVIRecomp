-- Community polls, reactions, mentions, profiles, moderation and Web Push support.
-- Idempotent; run after the static Supabase access and community ownership migrations.

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
    select 1 from public.admin_users where user_id = (select auth.uid())
  )
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant usage on schema public to anon, authenticated;

alter table public.community_posts
  add column if not exists reaction_counts jsonb not null
    default '{"heart":0,"skull":0,"fire":0,"laugh":0,"wow":0,"clap":0}'::jsonb,
  add column if not exists search_vector tsvector generated always as (
    to_tsvector(
      'simple'::regconfig,
      coalesce(author_alias, '') || ' ' || coalesce(body, '') || ' ' ||
      coalesce(headline, '') || ' ' || coalesce(link_url, '') || ' ' ||
      coalesce(link_preview->>'title', '') || ' ' || coalesce(link_preview->>'description', '')
    )
  ) stored;

update public.community_posts as post
set reaction_counts = (
  select jsonb_build_object(
    'heart', count(*) filter (where reaction = 'heart'),
    'skull', count(*) filter (where reaction = 'skull'),
    'fire', count(*) filter (where reaction = 'fire'),
    'laugh', count(*) filter (where reaction = 'laugh'),
    'wow', count(*) filter (where reaction = 'wow'),
    'clap', count(*) filter (where reaction = 'clap')
  )
  from public.community_reactions
  where post_id = post.id
);

alter table public.community_posts
  alter column reaction_counts set default
    '{"heart":0,"skull":0,"fire":0,"laugh":0,"wow":0,"clap":0}'::jsonb,
  alter column reaction_counts set not null;

alter table public.community_posts
  drop constraint if exists community_posts_reaction_counts_social_check,
  add constraint community_posts_reaction_counts_social_check
    check (
      jsonb_typeof(reaction_counts) = 'object'
      and coalesce(reaction_counts->>'heart', '0') ~ '^[0-9]+$'
      and coalesce(reaction_counts->>'skull', '0') ~ '^[0-9]+$'
      and coalesce(reaction_counts->>'fire', '0') ~ '^[0-9]+$'
      and coalesce(reaction_counts->>'laugh', '0') ~ '^[0-9]+$'
      and coalesce(reaction_counts->>'wow', '0') ~ '^[0-9]+$'
      and coalesce(reaction_counts->>'clap', '0') ~ '^[0-9]+$'
    );

update public.community_posts
set heart_count = coalesce((reaction_counts->>'heart')::integer, 0),
    skull_count = coalesce((reaction_counts->>'skull')::integer, 0);

create index if not exists community_posts_search_vector_idx
  on public.community_posts using gin (search_vector);

alter table public.community_reactions
  drop constraint if exists community_reactions_reaction_check,
  add constraint community_reactions_reaction_check
    check (reaction in ('heart', 'skull', 'fire', 'laugh', 'wow', 'clap'));

alter table public.community_comments
  add column if not exists parent_comment_id uuid;

alter table public.community_comments
  drop constraint if exists community_comments_parent_same_post_fk,
  drop constraint if exists community_comments_id_post_unique,
  add constraint community_comments_id_post_unique unique (id, post_id),
  add constraint community_comments_parent_same_post_fk
    foreign key (parent_comment_id, post_id)
    references public.community_comments (id, post_id)
    on delete cascade;

create index if not exists community_comments_parent_idx
  on public.community_comments (parent_comment_id, created_at);

create table if not exists public.community_polls (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.community_posts (id) on delete cascade,
  question text not null check (char_length(btrim(question)) between 3 and 180),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.community_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.community_polls (id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 1 and 80),
  position smallint not null check (position between 1 and 4),
  vote_count bigint not null default 0 check (vote_count >= 0),
  unique (poll_id, position),
  unique (poll_id, id)
);

create table if not exists public.community_poll_votes (
  poll_id uuid not null references public.community_polls (id) on delete cascade,
  option_id uuid not null,
  voter_id uuid not null,
  voted_at timestamptz not null default now(),
  primary key (poll_id, voter_id),
  foreign key (poll_id, option_id)
    references public.community_poll_options (poll_id, id)
    on delete cascade
);

create index if not exists community_poll_options_poll_order_idx
  on public.community_poll_options (poll_id, position);

alter table public.community_polls enable row level security;
alter table public.community_poll_options enable row level security;
alter table public.community_poll_votes enable row level security;
revoke all on public.community_polls, public.community_poll_options, public.community_poll_votes
  from public, anon, authenticated;
grant select on public.community_polls, public.community_poll_options to anon, authenticated;

drop policy if exists "public reads polls for published posts" on public.community_polls;
create policy "public reads polls for published posts" on public.community_polls
  for select to anon, authenticated
  using (exists (
    select 1 from public.community_posts as post
    where post.id = post_id
      and post.status = 'approved'
      and (post.expires_at is null or post.expires_at > now())
  ));

drop policy if exists "admins read all community polls" on public.community_polls;
create policy "admins read all community polls" on public.community_polls
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "public reads options for published polls" on public.community_poll_options;
create policy "public reads options for published polls" on public.community_poll_options
  for select to anon, authenticated
  using (exists (
    select 1
    from public.community_polls as poll
    join public.community_posts as post on post.id = poll.post_id
    where poll.id = poll_id
      and post.status = 'approved'
      and (post.expires_at is null or post.expires_at > now())
  ));

drop policy if exists "admins read all community poll options" on public.community_poll_options;
create policy "admins read all community poll options" on public.community_poll_options
  for select to authenticated using ((select public.is_admin()));

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
      or (
        p_media_url !~ '^https://fefvytprogasugctxdom\.supabase\.co/storage/v1/object/public/community-media/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|mp4|webm)$'
        and not (
          p_media_type = 'image'
          and p_media_url ~ '^https://media[0-9]+\.giphy\.com/media/[A-Za-z0-9]+/giphy\.gif$'
        )
      )
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

create or replace function public.community_create_post_with_poll(
  p_author_alias text,
  p_body text,
  p_media_url text,
  p_media_type text,
  p_link_url text,
  p_link_preview jsonb,
  p_owner_token_hash text,
  p_poll_question text,
  p_poll_options jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post public.community_posts;
  v_poll_id uuid;
  v_option text;
  v_position smallint := 0;
  v_options jsonb := coalesce(p_poll_options, '[]'::jsonb);
begin
  if p_poll_question is null then
    if v_options <> '[]'::jsonb then raise exception 'Poll options require a poll question.'; end if;
  else
    if char_length(btrim(p_poll_question)) not between 3 and 180
      or jsonb_typeof(v_options) <> 'array'
      or jsonb_array_length(v_options) not between 2 and 4 then
      raise exception 'A poll requires a question and 2 to 4 options.';
    end if;
    if exists (
      select 1
      from jsonb_array_elements_text(v_options) as item(value)
      where char_length(btrim(item.value)) not between 1 and 80
    ) or (
      select count(distinct lower(btrim(item.value)))
      from jsonb_array_elements_text(v_options) as item(value)
    ) <> jsonb_array_length(v_options) then
      raise exception 'Poll options must be unique and contain 1 to 80 characters.';
    end if;
  end if;

  v_post := public.community_create_post(
    p_author_alias,
    case when char_length(btrim(coalesce(p_body, ''))) = 0 and p_poll_question is not null
      then p_poll_question else p_body end,
    p_media_url,
    p_media_type,
    p_link_url,
    p_link_preview,
    p_owner_token_hash
  );

  if p_poll_question is not null then
    insert into public.community_polls (post_id, question)
    values (v_post.id, btrim(p_poll_question))
    returning id into v_poll_id;

    for v_option in
      select btrim(item.value)
      from jsonb_array_elements_text(v_options) as item(value)
    loop
      v_position := v_position + 1;
      insert into public.community_poll_options (poll_id, label, position)
      values (v_poll_id, v_option, v_position);
    end loop;
  end if;

  return jsonb_build_object(
    'post_id', v_post.id,
    'status', v_post.status,
    'poll_id', v_poll_id
  );
end
$$;

create or replace function public.community_cast_poll_vote(
  p_poll_id uuid,
  p_option_id uuid,
  p_voter_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_option uuid;
  v_options jsonb;
begin
  if p_poll_id is null or p_option_id is null or p_voter_id is null then
    raise exception 'Invalid community poll vote.';
  end if;

  perform 1
  from public.community_polls as poll
  join public.community_posts as post on post.id = poll.post_id
  where poll.id = p_poll_id
    and (poll.expires_at is null or poll.expires_at > now())
    and post.status = 'approved'
    and (post.expires_at is null or post.expires_at > now())
  for update of poll;
  if not found then raise exception 'Published poll not found or expired.'; end if;

  if not exists (
    select 1 from public.community_poll_options
    where id = p_option_id and poll_id = p_poll_id
  ) then raise exception 'Poll option does not belong to this poll.'; end if;

  select option_id into v_existing_option
  from public.community_poll_votes
  where poll_id = p_poll_id and voter_id = p_voter_id;

  if v_existing_option is distinct from p_option_id then
    if v_existing_option is not null then
      update public.community_poll_options
      set vote_count = greatest(vote_count - 1, 0)
      where id = v_existing_option and poll_id = p_poll_id;
    end if;
    insert into public.community_poll_votes (poll_id, option_id, voter_id)
    values (p_poll_id, p_option_id, p_voter_id)
    on conflict (poll_id, voter_id) do update
      set option_id = excluded.option_id, voted_at = now();
    update public.community_poll_options
    set vote_count = vote_count + 1
    where id = p_option_id and poll_id = p_poll_id;
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'label', label,
      'position', position,
      'vote_count', vote_count
    ) order by position
  ), '[]'::jsonb)
  into v_options
  from public.community_poll_options
  where poll_id = p_poll_id;

  return jsonb_build_object(
    'options', v_options,
    'user_option_id', p_option_id
  );
end
$$;

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
  v_counts jsonb;
  v_heart_count integer;
  v_skull_count integer;
begin
  if p_post_id is null or p_voter_id is null
    or (p_reaction is not null and p_reaction not in ('heart', 'skull', 'fire', 'laugh', 'wow', 'clap')) then
    raise exception 'Invalid community reaction.';
  end if;

  perform 1 from public.community_posts
  where id = p_post_id
    and status = 'approved'
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

  select jsonb_build_object(
    'heart', count(*) filter (where reaction = 'heart'),
    'skull', count(*) filter (where reaction = 'skull'),
    'fire', count(*) filter (where reaction = 'fire'),
    'laugh', count(*) filter (where reaction = 'laugh'),
    'wow', count(*) filter (where reaction = 'wow'),
    'clap', count(*) filter (where reaction = 'clap')
  )
  into v_counts
  from public.community_reactions
  where post_id = p_post_id;

  v_heart_count := coalesce((v_counts->>'heart')::integer, 0);
  v_skull_count := coalesce((v_counts->>'skull')::integer, 0);

  update public.community_posts
  set heart_count = v_heart_count,
      skull_count = v_skull_count,
      reaction_counts = v_counts,
      updated_at = now()
  where id = p_post_id;

  return jsonb_build_object(
    'heart_count', v_heart_count,
    'skull_count', v_skull_count,
    'reaction_counts', v_counts,
    'reaction', v_selected
  );
end
$$;

create table if not exists public.community_mentions (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  mentioned_alias text not null check (char_length(mentioned_alias) between 2 and 30),
  author_alias text not null check (char_length(author_alias) between 2 and 30),
  created_at timestamptz not null default now(),
  primary key (post_id, mentioned_alias)
);

create index if not exists community_mentions_alias_created_idx
  on public.community_mentions (mentioned_alias, created_at desc);

alter table public.community_mentions enable row level security;
revoke all on public.community_mentions from public, anon, authenticated;
grant select on public.community_mentions to anon, authenticated;

drop policy if exists "public reads mentions in published posts" on public.community_mentions;
create policy "public reads mentions in published posts" on public.community_mentions
  for select to anon, authenticated
  using (exists (
    select 1 from public.community_posts as post
    where post.id = post_id
      and post.status = 'approved'
      and (post.expires_at is null or post.expires_at > now())
  ));

drop policy if exists "admins read all community mentions" on public.community_mentions;
create policy "admins read all community mentions" on public.community_mentions
  for select to authenticated using ((select public.is_admin()));

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.refresh_community_mentions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.community_mentions where post_id = new.id;
  insert into public.community_mentions (post_id, mentioned_alias, author_alias, created_at)
  select distinct
    new.id,
    lower(parts[1]),
    btrim(new.author_alias),
    coalesce(new.updated_at, new.created_at, now())
  from regexp_matches(coalesce(new.body, ''), '@([A-Za-z0-9_]{2,30})', 'g') as matches(parts)
  on conflict (post_id, mentioned_alias) do update
    set author_alias = excluded.author_alias, created_at = excluded.created_at;
  return new;
end
$$;

revoke all on function private.refresh_community_mentions() from public, anon, authenticated;
drop trigger if exists community_posts_refresh_mentions on public.community_posts;
create trigger community_posts_refresh_mentions
  after insert or update of body, author_alias on public.community_posts
  for each row execute function private.refresh_community_mentions();

insert into public.community_mentions (post_id, mentioned_alias, author_alias, created_at)
select distinct post.id, lower(parts[1]), btrim(post.author_alias), coalesce(post.updated_at, post.created_at, now())
from public.community_posts as post
cross join lateral regexp_matches(coalesce(post.body, ''), '@([A-Za-z0-9_]{2,30})', 'g') as matches(parts)
on conflict (post_id, mentioned_alias) do update
  set author_alias = excluded.author_alias, created_at = excluded.created_at;

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.community_posts (id) on delete cascade,
  comment_id uuid references public.community_comments (id) on delete cascade,
  reporter_id uuid not null,
  reason text not null check (reason in ('spam', 'harassment', 'copyright', 'unsafe', 'other')),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  check ((post_id is not null) <> (comment_id is not null))
);

create unique index if not exists community_reports_reporter_post_uidx
  on public.community_reports (reporter_id, post_id)
  where post_id is not null;
create index if not exists community_reports_status_created_idx
  on public.community_reports (status, created_at desc);

alter table public.community_reports enable row level security;
revoke all on public.community_reports from public, anon, authenticated;
grant insert (post_id, comment_id, reporter_id, reason, details)
  on public.community_reports to anon, authenticated;
grant select, update, delete on public.community_reports to authenticated;

drop policy if exists "public submits community reports" on public.community_reports;
create policy "public submits community reports" on public.community_reports
  for insert to anon, authenticated
  with check (
    created_at between now() - interval '1 minute' and now() + interval '1 minute'
    and (
      (post_id is not null and comment_id is null and exists (
        select 1 from public.community_posts as post
        where post.id = post_id
          and post.status = 'approved'
          and (post.expires_at is null or post.expires_at > now())
      ))
      or
      (comment_id is not null and post_id is null and exists (
        select 1
        from public.community_comments as comment
        join public.community_posts as post on post.id = comment.post_id
        where comment.id = comment_id
          and post.status = 'approved'
          and (post.expires_at is null or post.expires_at > now())
      ))
    )
  );

drop policy if exists "admins manage community reports" on public.community_reports;
create policy "admins manage community reports" on public.community_reports
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create table if not exists public.community_profiles (
  author_alias text primary key check (char_length(btrim(author_alias)) between 2 and 30),
  bio text check (bio is null or char_length(bio) <= 500),
  avatar_style text not null default 'lorelei'
    check (avatar_style in ('lorelei', 'bottts', 'thumbs', 'pixel-art')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_profile_badges (
  author_alias text not null references public.community_profiles (author_alias) on delete cascade,
  badge_key text not null check (badge_key ~ '^[a-z0-9_-]{2,40}$'),
  awarded_at timestamptz not null default now(),
  primary key (author_alias, badge_key)
);

alter table public.community_profiles enable row level security;
alter table public.community_profile_badges enable row level security;
revoke all on public.community_profiles, public.community_profile_badges from public, anon, authenticated;
grant select on public.community_profiles, public.community_profile_badges to anon, authenticated;
grant insert, update, delete on public.community_profiles, public.community_profile_badges to authenticated;

drop policy if exists "public reads community profiles" on public.community_profiles;
create policy "public reads community profiles" on public.community_profiles
  for select to anon, authenticated using (true);

drop policy if exists "admins manage community profiles" on public.community_profiles;
create policy "admins manage community profiles" on public.community_profiles
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "public reads community profile badges" on public.community_profile_badges;
create policy "public reads community profile badges" on public.community_profile_badges
  for select to anon, authenticated using (true);

drop policy if exists "admins manage community profile badges" on public.community_profile_badges;
create policy "admins manage community profile badges" on public.community_profile_badges
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create table if not exists public.community_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique check (endpoint ~ '^https://[^[:space:]]+$'),
  p256dh text not null check (p256dh ~ '^[A-Za-z0-9_-]{80,120}$'),
  auth_secret text not null check (auth_secret ~ '^[A-Za-z0-9_-]{16,60}$'),
  author_alias text not null check (char_length(btrim(author_alias)) between 2 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.community_push_subscriptions enable row level security;
revoke all on public.community_push_subscriptions from public, anon, authenticated;
grant select, delete on public.community_push_subscriptions to authenticated;

drop policy if exists "admins manage community push subscriptions" on public.community_push_subscriptions;
create policy "admins manage community push subscriptions" on public.community_push_subscriptions
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create or replace function public.community_register_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_author_alias text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_endpoint is null or char_length(p_endpoint) > 2048
    or p_endpoint !~ '^https://[^[:space:]]+$'
    or p_p256dh is null or p_p256dh !~ '^[A-Za-z0-9_-]{80,120}$'
    or p_auth is null or p_auth !~ '^[A-Za-z0-9_-]{16,60}$'
    or p_author_alias is null or char_length(btrim(p_author_alias)) not between 2 and 30 then
    raise exception 'Invalid Web Push subscription.';
  end if;
  insert into public.community_push_subscriptions (endpoint, p256dh, auth_secret, author_alias)
  values (p_endpoint, p_p256dh, p_auth, btrim(p_author_alias))
  on conflict (endpoint) do update
    set p256dh = excluded.p256dh,
        auth_secret = excluded.auth_secret,
        author_alias = excluded.author_alias,
        updated_at = now();
  return true;
end
$$;

create or replace view public.current_community_posts
with (security_invoker = true) as
  select
    post.id, post.author_alias, post.body, post.media_url, post.media_type,
    post.expires_at, post.created_at, post.media_path, post.headline,
    post.link_url, post.link_preview, post.is_sponsored, post.heart_count,
    post.skull_count, post.comment_count, post.status, post.reaction_counts,
    (
      select jsonb_build_object(
        'id', poll.id,
        'question', poll.question,
        'expires_at', poll.expires_at,
        'options', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', option.id,
            'label', option.label,
            'position', option.position,
            'vote_count', option.vote_count
          ) order by option.position)
          from public.community_poll_options as option
          where option.poll_id = poll.id
        ), '[]'::jsonb)
      )
      from public.community_polls as poll
      where poll.post_id = post.id
    ) as poll,
    post.search_vector
  from public.community_posts as post
  where post.status = 'approved'
    and (post.expires_at is null or post.expires_at > now());

create or replace view public.current_community_comments
with (security_invoker = true) as
  select comment.id, comment.post_id, comment.author_alias, comment.body,
    comment.created_at, comment.parent_comment_id
  from public.community_comments as comment
  join public.community_posts as post on post.id = comment.post_id
  where post.status = 'approved'
    and (post.expires_at is null or post.expires_at > now());

create or replace view public.current_community_mentions
with (security_invoker = true) as
  select mention.post_id, mention.mentioned_alias, mention.author_alias,
    post.body, mention.created_at
  from public.community_mentions as mention
  join public.community_posts as post on post.id = mention.post_id
  where post.status = 'approved'
    and (post.expires_at is null or post.expires_at > now());

grant select on public.current_community_posts, public.current_community_comments,
  public.current_community_mentions to anon, authenticated;
grant select (reaction_counts, search_vector) on public.community_posts to anon, authenticated;
grant select (parent_comment_id) on public.community_comments to anon, authenticated;
grant insert (post_id, parent_comment_id, author_alias, body)
  on public.community_comments to anon, authenticated;

create or replace function public.community_search_posts(
  p_query text,
  p_limit integer default 20,
  p_offset integer default 0
)
returns setof public.current_community_posts
language sql
stable
security invoker
set search_path = ''
as $$
  select post.*
  from public.current_community_posts as post
  where char_length(btrim(coalesce(p_query, ''))) between 1 and 100
    and (
      post.search_vector @@ websearch_to_tsquery('simple'::regconfig, btrim(p_query))
      or lower(post.author_alias) like '%' || lower(replace(replace(btrim(p_query), '%', '\%'), '_', '\_')) || '%' escape '\'
    )
  order by post.is_sponsored desc, post.created_at desc, post.id desc
  limit greatest(1, least(coalesce(p_limit, 20), 50))
  offset greatest(0, coalesce(p_offset, 0))
$$;

revoke all on function public.community_create_post(text, text, text, text, text, jsonb, text)
  from public, anon, authenticated;
revoke all on function public.community_create_post_with_poll(text, text, text, text, text, jsonb, text, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.community_cast_poll_vote(uuid, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.community_cast_reaction(uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.community_register_push_subscription(text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.community_search_posts(text, integer, integer)
  from public, anon, authenticated;

grant execute on function public.community_create_post(text, text, text, text, text, jsonb, text),
  public.community_create_post_with_poll(text, text, text, text, text, jsonb, text, text, jsonb),
  public.community_cast_poll_vote(uuid, uuid, uuid),
  public.community_cast_reaction(uuid, uuid, text),
  public.community_register_push_subscription(text, text, text, text),
  public.community_search_posts(text, integer, integer)
  to anon, authenticated;

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
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "community media public reads" on storage.objects;
create policy "community media public reads" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'community-media');

drop policy if exists "community media public uploads" on storage.objects;
create policy "community media public uploads" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'community-media'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|mp4|webm)$'
  );
