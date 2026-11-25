-- Grant permissions for admin RPC functions to be called from the browser (authenticated role)
-- Run this in the Supabase SQL Editor after applying the main schema.sql
-- This allows the admin page on GitHub Pages to call the admin functions directly
-- using the user's access token (Supabase Auth).

-- The RPC functions are defined with SECURITY DEFINER and check public.is_admin()
-- which verifies the user exists in the public.admins table.
-- Granting execute to authenticated allows any authenticated user to CALL the function,
-- but the function itself will fail if the user is not an admin (is_admin() returns false).

grant execute on function public.admin_upsert_campaign(jsonb, uuid) to authenticated;
grant execute on function public.admin_record_donation(jsonb, uuid) to authenticated;
grant execute on function public.admin_upsert_news(jsonb, uuid) to authenticated;
grant execute on function public.admin_upsert_tracker_update(jsonb, uuid) to authenticated;

-- Also grant access to the tables for admin reads (needed for the admin dashboard to see all records including drafts)
-- These are already granted to authenticated in schema.sql lines 202-218, but we ensure full access here:
grant select on public.campaigns to authenticated;
grant select on public.donations to authenticated;
grant select on public.news_posts to authenticated;
grant select on public.tracker_updates to authenticated;
grant select on public.admin_audit_log to authenticated;

-- Optional: If you want to use the public.admins table for authorization instead of/in addition to ADMIN_USER_IDS
-- The public.is_admin() function already checks this table.
-- To add an admin, insert into public.admins:
-- insert into public.admins (user_id) values ('user-uuid-here') on conflict do nothing;

-- Verify the grants
select routine_name, routine_type, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('admin_upsert_campaign', 'admin_record_donation', 'admin_upsert_news', 'admin_upsert_tracker_update');