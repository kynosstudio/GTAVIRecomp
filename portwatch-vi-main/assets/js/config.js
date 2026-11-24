// Supabase connection for anonymous page-view counts and the live viewer count (see assets/js/backend.js
// and functions/api/live.js). The board was removed on 2026-11-24.
// The publishable (anon) key is meant to be public: what it can do is limited by the
// database's row-level security and functions in supabase/schema.sql.
// Leave both empty to run the site without analytics.
export const SUPABASE_URL = 'https://ukkphczkthpiosuezgfj.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_6bI_-WqCLu73dqaIOznDag_FmpTBSij';
// true = public pages don't count views, and /api/live answers null without asking the database.
// Was on from 2026-11-24 ~00:30 UTC after ~290k requests an hour swamped the free-plan database; turned off
// again once views were sampled and the live count moved behind Cloudflare's cache (functions/api/live.js).
export const STATS_PAUSED = false;
