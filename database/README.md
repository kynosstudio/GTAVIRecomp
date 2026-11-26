# Vaquinhas e base de comunidade

## QR Code da vaquinha

Coloque o print oficial em `assets/vaquinhas/` e atualize `qr_code_url` da campanha pelo gerenciamento. O catálogo de demonstração usa `assets/vaquinhas/xlaunchvi-qr-placeholder.png`, que **não é um QR Code pagável**. Antes de ativar a campanha no banco, substitua esse caminho pelo arquivo real e confira a chave PIX.

O banner também pode ser colocado em `assets/vaquinhas/`; informe um caminho relativo, como `assets/vaquinhas/xlaunchvi-banner.webp`, no campo de imagem da campanha. O site não aceita `javascript:`, `data:` nem URLs com credenciais.

## Conectar o Supabase

1. Para uma instalação nova, aplique as migrations `20241125000000_initial_schema.sql`, `20241125000001_admin_browser_permissions.sql`, `20241125000002_community_feed.sql`, `20261125213907_static_supabase_direct_access.sql`, `20261125215259_community_permissions_and_payment_reference.sql`, `20261125225100_community_owner_posts_and_notifications.sql` e `20261126001850_community_social_features.sql`, nesta ordem. Em uma instalação existente baseada em `schema.sql`, execute também as migrations pendentes, em especial `20261126001850_community_social_features.sql` para os recursos sociais. O schema prepara a campanha XLaunchVI em rascunho sem sobrescrever uma campanha existente. O cliente público está em `supabase-client.js` e usa apenas URL/chave publishable.
2. Crie o usuário operador no Supabase Auth e copie o UUID. Cadastre-o no SQL Editor:
   ```sql
   insert into public.admin_users (user_id)
   values ('SEU-UUID-DO-SUPABASE-AUTH')
   on conflict (user_id) do nothing;
   ```
3. Publique a raiz como site estático no GitHub Pages e configure Site URL/Redirect URLs em Supabase Auth. Não são necessárias secrets de Actions, Cloudflare Functions ou chaves privadas no deploy.
4. As migrations finais criam `admin_users`/`is_admin()`, garantem permissões da Comunidade com RLS e restringem as operações administrativas a `is_admin()`. O feed e os comentários públicos expõem somente posts aprovados; posts de texto são publicados no envio e posts com mídia ficam pendentes. A propriedade anônima usa uma capability aleatória no armazenamento local do navegador; apenas seu SHA-256 fica na tabela privada `private.community_post_owners`. A chave não pode ser recuperada se os dados do navegador forem apagados. O painel permite editar posts como administrador, moderar posts/anúncios e manter avisos. Doações só aparecem no ranking após confirmação administrativa.
5. O bucket `community-media` é público para leitura e recebe upload anônimo somente de arquivos até 50 MB com extensões/MIME permitidos. Isso significa que um link direto de mídia pendente pode ser aberto por quem o conhecer; acompanhe o uso/quota e considere CAPTCHA ou upload autenticado para produção.
6. Solicitações de anúncio ficam pendentes para análise no painel. A Comunidade mostra a chave PIX `kynos.studio@gmail.com`; o identificador da transação é opcional e fica visível apenas à equipe. O site não fornece QR estático nem confirma pagamentos automaticamente.
7. `community_notifications` contém avisos em rascunho/publicados/arquivados. Apenas avisos publicados e não expirados aparecem no feed. Quando o próprio autor apaga um post com mídia, o registro e comentários são removidos, mas o arquivo público do Storage não é apagado pelo acesso anônimo; a equipe pode removê-lo no painel/Storage.
8. A migration `20261126001850_community_social_features.sql` habilita enquetes/votos, reações extras, busca textual, respostas em thread, menções por nick, denúncias, perfis/badges e registro de inscrições Web Push. Para aplicar manualmente, execute seu conteúdo no SQL Editor depois das migrations anteriores. O envio de notificações Push ainda requer um emissor server-side com chave privada VAPID; essa chave nunca deve ser colocada no site estático.
9. Integrações opcionais (GIPHY, OpenWeatherMap e API Ninjas) leem chaves de `window.KynosCommunityConfig` no navegador. Se habilitadas, defina `giphyApiKey`, `openWeatherMapApiKey`, `apiNinjasApiKey` e, para Push, `webPushPublicKey` em um script carregado antes de `comunidade/comunidade.js`; aplique restrições de origem/uso no provedor, pois qualquer chave entregue ao browser é pública. Sem configuração, o feed continua funcionando e os widgets mostram mensagens de indisponibilidade.

Não publique `service_role`, senhas ou tokens. A chave publishable no JavaScript é pública por definição; a autorização é feita no banco por RLS e `is_admin()`.

## Modo local

`data/fundraiser-mock.js` contém uma campanha de demonstração e nenhum doador real. A página informa o modo **Local / demonstração** e não grava alterações nem envia doações. A lista local não representa saldo financeiro. Com o Supabase configurado, a mesma interface muda para **Banco conectado**.

`tracker_updates` guarda histórico editorial por projeto (incluindo XLaunchVI e KynosTracker), com progresso, status, resumo e fonte. Atualizações publicadas são carregadas diretamente do Supabase; se a consulta não estiver disponível, o portal mantém os snapshots locais, incluindo `data/kynostracker.json`. Notícias do tracker usam o mapeamento PT-BR salvo no snapshot; quando uma tradução PT-BR não existe ou falha, o feed mantém o texto original em vez de bloquear a página.
