-- Supabase Seed Data for Local Development
-- Run with: supabase db reset (includes seed)
-- This file is only for local development, not for production

-- Insert a demo campaign (only runs if not exists)
insert into public.campaigns (
  slug, title, summary, description, pix_key, qr_code_url, status, is_active,
  color_start, color_end, gradient_angle,
  xlaunch_percent, kynos_maintenance_percent
) values (
  'xlaunchvi',
  'Vaquinha do XLaunchVI',
  'Apoie a engenharia brasileira por trás do launcher de GTA VI.',
  'A maior parte do apoio é destinada ao XLaunchVI e uma parcela à manutenção do KynosRecompVI. Configure percentuais, meta e o QR Code oficial antes de ativar a campanha.',
  'kynos.studio@gmail.com',
  '/assets/vaquinhas/xlaunchvi-qr-placeholder.png',
  'draft',
  false,
  '#ff7b47',
  '#8157e8',
  125,
  70,
  30
)
on conflict (slug) do nothing;

-- Insert demo news post
insert into public.news_posts (
  slug, category, title, summary, body, status, published_at
) values (
  'bem-vindo-ao-kynosrecompvi',
  'Comunidade',
  'Bem-vindo ao KynosRecompVI',
  'O portal de acompanhamento da engenharia reversa de GTA VI.',
  '## Bem-vindo!\n\nEste é o portal oficial do KynosRecompVI para acompanhar o progresso da engenharia reversa de GTA VI.\n\nAqui você encontra:\n- Tracker de progresso dos projetos\n- Vaquinhas para apoiar o desenvolvimento\n- Notícias e atualizações\n\nObrigado por fazer parte da comunidade!',
  'published',
  now()
)
on conflict (slug) do nothing;

-- Insert demo tracker update
insert into public.tracker_updates (
  project_id, project_name, percent, milestone, summary, status, published_at
) values (
  'xlaunchvi',
  'XLaunchVI',
  55.0,
  'Menu principal',
  'O launcher agora exibe o menu principal com navegação funcional. Próximos passos: renderização do mundo e jogabilidade.',
  'published',
  now()
)
on conflict do nothing;