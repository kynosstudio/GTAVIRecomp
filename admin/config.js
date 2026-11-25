// Admin Configuration for KynosRecompVI
// This file can be replaced at build time or loaded at runtime
// For GitHub Pages, you can use GitHub Actions to inject the values during deployment

window.KynosAdminConfig = {
  // Supabase configuration
  supabase: {
    url: 'https://fefvytprogasugctxdom.supabase.co',
    anonKey: 'sb_publishable_xhdlCMR97qQGNiIXtx1s2g_-V9jVpPy'
  },

  // Admin user IDs allowlist (UUIDs from Supabase Auth)
  // These are the users who can access the admin panel
  // In production, populate this via GitHub Actions secrets during deployment
  adminUserIds: [
    // Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    // Add UUIDs here or inject at build time
  ],

  // Feature flags
  features: {
    enableAuditLog: true,
    enableCommunityPosts: true,
    enablePointsSystem: true
  }
};

// If using a build process, you can replace this file entirely
// Or load from a separate JSON file at runtime:
// fetch('/admin/config.json').then(r => r.json()).then(cfg => window.KynosAdminConfig = cfg);