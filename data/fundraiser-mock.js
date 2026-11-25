(function (root) {
  root.KynosFundraiserMock = {
    campaigns: [{
      id: 'local-xlaunchvi',
      slug: 'xlaunchvi',
      title: 'Vaquinha do XLaunchVI',
      summary: 'Apoie a engenharia brasileira por trás do launcher de GTA VI.',
      description: 'Campanha de demonstração local. A maior parte do apoio é destinada ao XLaunchVI e uma parcela à manutenção do KynosRecompVI. Configure percentuais, meta e status no banco antes de divulgar como campanha ativa.',
      goal_amount: null,
      banner_url: '',
      color_start: '#ff7b47',
      color_end: '#8157e8',
      gradient_angle: 125,
      pix_key: 'kynos.studio@gmail.com',
      qr_code_url: '../assets/vaquinhas/xlaunchvi-qr-placeholder.png',
      xlaunch_percent: null,
      kynos_maintenance_percent: null,
      status: 'draft',
      is_active: false,
      created_at: '2026-11-25T00:00:00.000Z'
    }],
    leaderboard: [],
    campaign_totals: [],
    news: [],
    tracker_updates: []
  };
}(typeof globalThis === 'object' ? globalThis : this));
