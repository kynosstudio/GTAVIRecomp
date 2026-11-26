# Painel de gerenciamento KynosRecompVI

O painel é uma página estática que acessa Supabase Auth, PostgREST e Storage diretamente com `supabase-js` ESM. Não depende de `/api/*`, Pages Functions, secrets de build ou chave `service_role`.

## Preparar o Supabase

1. Aplique o schema consolidado `database/schema.sql` no SQL Editor, ou as migrations `20241125000000_initial_schema.sql`, `20241125000001_admin_browser_permissions.sql`, `20241125000002_community_feed.sql`, `20261125213907_static_supabase_direct_access.sql`, `20261125215259_community_permissions_and_payment_reference.sql` e `20261125225100_community_owner_posts_and_notifications.sql`, nesta ordem.
2. Crie/confirme a conta do operador no Supabase Auth e copie seu UUID.
3. Execute no SQL Editor:

   ```sql
   insert into public.admin_users (user_id)
   values ('SEU-UUID-DO-SUPABASE-AUTH')
   on conflict (user_id) do nothing;
   ```

4. Configure Site URL e Redirect URLs para o endereço HTTPS do GitHub Pages em Supabase Auth.
5. Publique a raiz deste repositório no GitHub Pages. O projeto e a publishable key estão no `supabase-client.js`; são configurações públicas. A autorização real é aplicada pelo `is_admin()` e por RLS.

## Acesso e dados

O login usa `supabase.auth.signInWithPassword()` e verifica o UID na tabela `admin_users`. A navegação à direita alterna entre Comunidade & anúncios, Notificações, Vaquinhas e Notícias & trackers. O painel edita posts e avisos, modera mídia e anúncios, além de gerenciar campanhas, doações, notícias e `tracker_updates`; as alterações são protegidas por `is_admin()` e RLS.

O feed público lê views limitadas. Comentários públicos não exigem login; posts com mídia entram em análise. A área do usuário consegue listar/editar/apagar seus posts por uma capability aleatória, cuja chave fica apenas no `localStorage` do navegador. O bucket `community-media` é público para leitura e aceita upload anônimo de imagens/vídeos; portanto mídia pendente pode ser aberta por quem obtiver sua URL. Controle a quota e considere CAPTCHA/limitação externa antes de divulgar upload aberto.

Avisos são mantidos em `community_notifications`; apenas os publicados e não expirados aparecem no feed. Ao apagar um post de mídia como visitante, o banco remove post e comentários, mas o arquivo público do Storage exige limpeza administrativa.

`tracker_updates` mantém entradas históricas por projeto com percentual, marco, resumo, estado e fonte. A publicação no banco complementa os snapshots locais; não edite ou substitua `data/kynostracker.json` para operar o painel.

## Segurança

- Nunca exponha `service_role`, senha ou token em HTML, JavaScript ou workflows.
- A publishable key no navegador é pública por definição; grants e RLS são a barreira de acesso.
- `admin_users` deve ser gerenciada pelo SQL Editor ou por um fluxo administrativo separado; não existe botão público para promover usuários.
- URLs de mídia no bucket público não são privadas, inclusive enquanto um post aguarda moderação.
