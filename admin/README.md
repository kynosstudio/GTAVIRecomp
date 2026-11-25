# KynosRecompVI Admin Panel

Painel de administração para gerenciar vaquinhas, doações, notícias e atualizações do tracker.

## Como funciona

O admin panel agora funciona **100% no navegador** (client-side) usando Supabase Auth diretamente, sem depender de backend/serverless functions. Isso permite deploy no GitHub Pages.

### Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Navegador     │────▶│   Supabase Auth  │────▶│   Supabase DB   │
│  (admin.html)   │     │  (signInWithPwd) │     │  (RPC functions)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        │                       │                        │
        ▼                       ▼                        ▼
   sessionStorage         JWT token              RLS + is_admin()
   (access_token)                              (public.admins table)
```

### Fluxo de autenticação

1. Usuário insere email/senha no formulário
2. `supabase.auth.signInWithPassword()` autentica no Supabase
3. Verifica se o `user.id` está na allowlist (`ADMIN_USER_IDS` no config.js)
4. Armazena `access_token` no `sessionStorage`
5. Para operações de escrita, chama as RPC functions via `supabase.rpc()`
6. As RPC functions verificam `public.is_admin()` (checa tabela `public.admins`)

## Configuração

### 1. Variáveis de ambiente (GitHub Actions Secrets)

Configure estes secrets no repositório (Settings → Secrets and variables → Actions):

| Secret | Descrição |
|--------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase (ex: `https://fefvytprogasugctxdom.supabase.co`) |
| `SUPABASE_ANON_KEY` | Chave anônima pública do Supabase |
| `SUPABASE_ACCESS_TOKEN` | Personal Access Token do Supabase (para migrations) |
| `SUPABASE_DB_PASSWORD` | Senha do banco de dados (para migrations) |
| `ADMIN_USER_IDS` | Array JSON de UUIDs autorizados: `["uuid1", "uuid2"]` |
| `CLOUDFLARE_API_TOKEN` | Token API do Cloudflare (para deploy no Cloudflare Pages) |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID do Cloudflare |

### 2. Tabela de admins no Supabase

Execute no SQL Editor do Supabase:

```sql
-- Adicionar um admin (substitua pelo UUID real do usuário)
insert into public.admins (user_id) values ('user-uuid-here') on conflict do nothing;

-- Verificar admins
select * from public.admins;
```

### 3. Permissões para RPC functions

Execute no SQL Editor do Supabase (arquivo `database/admin-browser-permissions.sql`):

```sql
grant execute on function public.admin_upsert_campaign(jsonb, uuid) to authenticated;
grant execute on function public.admin_record_donation(jsonb, uuid) to authenticated;
grant execute on function public.admin_upsert_news(jsonb, uuid) to authenticated;
grant execute on function public.admin_upsert_tracker_update(jsonb, uuid) to authenticated;

grant select on public.campaigns to authenticated;
grant select on public.donations to authenticated;
grant select on public.news_posts to authenticated;
grant select on public.tracker_updates to authenticated;
grant select on public.admin_audit_log to authenticated;
```

## Deploy

### GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` faz deploy automático no push para `main` ou `Kynos`.

1. Ative GitHub Pages nas configurações do repositório (Source: GitHub Actions)
2. Configure os secrets necessários
3. Push para a branch dispara o deploy

### Cloudflare Pages

O workflow `.github/workflows/deploy-cloudflare.yml` faz deploy no Cloudflare Pages.

1. Crie um projeto no Cloudflare Pages conectado ao repositório
2. Configure os secrets necessários
3. Push para a branch dispara o deploy

### Supabase Migrations

O workflow `.github/workflows/supabase-migrations.yml` roda migrations automaticamente quando arquivos em `supabase/migrations/` são alterados.

## Desenvolvimento Local

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar stack local
supabase start

# Aplicar migrations
supabase db reset

# Acessar Studio local
supabase studio
```

O arquivo `supabase/seed.sql` popula dados de demonstração.

## Estrutura de arquivos

```
admin/
├── index.html      # Página principal
├── admin.js        # Lógica da aplicação
├── config.js       # Configuração (injetada no build)
├── styles.css      # Estilos
└── README.md       # Este arquivo

supabase/
├── config.toml           # Configuração do Supabase CLI
├── migrations/           # Migrations SQL
│   ├── 20241125000000_initial_schema.sql
│   └── 20241125000001_admin_browser_permissions.sql
└── seed.sql              # Dados de seed para desenvolvimento

.github/workflows/
├── deploy-pages.yml         # Deploy GitHub Pages
├── deploy-cloudflare.yml    # Deploy Cloudflare Pages
└── supabase-migrations.yml  # Migrations automáticas

database/
├── schema.sql                      # Schema principal
└── admin-browser-permissions.sql   # Permissões para acesso via browser
```

## Segurança

- **Nenhuma chave secreta no frontend**: Apenas a `anonKey` (pública) é usada
- **Autorização dupla**: 
  1. Client-side: `ADMIN_USER_IDS` allowlist
  2. Server-side: `public.is_admin()` verifica tabela `public.admins`
- **RLS (Row Level Security)**: Todas as tabelas têm RLS habilitado
- **RPC functions**: `SECURITY DEFINER` com verificação `is_admin()`
- **Auditoria**: Todas as mutações criam registro em `admin_audit_log`

## Troubleshooting

### "Conta não autorizada"
- Verifique se o UUID do usuário está em `ADMIN_USER_IDS` (config.js)
- Verifique se o usuário existe na tabela `public.admins` no Supabase

### "Session expired"
- O token expirou (padrão 1 hora). Faça login novamente.
- Verifique se `autoRefreshToken: true` está funcionando

### Erro de CORS
- Adicione o domínio do GitHub Pages nas configurações de Auth do Supabase:
  - Site URL: `https://kynosstudio.github.io/GTAVIRecomp/`
  - Redirect URLs: `https://kynosstudio.github.io/GTAVIRecomp/**`

### RPC function não encontrada
- Execute o script `database/admin-browser-permissions.sql` no Supabase
- Verifique se as funções existem: `select * from pg_proc where proname like 'admin_%';`

## Referências

- [Supabase Auth Client](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [Supabase RPC](https://supabase.com/docs/reference/javascript/rpc)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [GitHub Pages Deploy](https://docs.github.com/en/pages)
- [Cloudflare Pages](https://pages.cloudflare.com/)