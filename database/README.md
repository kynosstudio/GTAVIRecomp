# Vaquinhas e base de comunidade

## QR Code da vaquinha

Coloque o print oficial em `assets/vaquinhas/` e atualize `qr_code_url` da campanha pelo gerenciamento. O catálogo de demonstração usa `assets/vaquinhas/xlaunchvi-qr-placeholder.png`, que **não é um QR Code pagável**. Antes de ativar a campanha no banco, substitua esse caminho pelo arquivo real e confira a chave PIX.

O banner também pode ser colocado em `assets/vaquinhas/`; informe um caminho relativo, como `assets/vaquinhas/xlaunchvi-banner.webp`, no campo de imagem da campanha. O site não aceita `javascript:`, `data:` nem URLs com credenciais.

## Conectar o Supabase

1. A integração pública já aponta para `https://fefvytprogasugctxdom.supabase.co` usando a chave publishable indicada pelo projeto. A URL e a chave pública podem ser substituídas por variáveis de ambiente se o projeto mudar.
2. Execute `schema.sql` no SQL Editor. Ele prepara a campanha XLaunchVI em rascunho, sem sobrescrever uma campanha com o mesmo slug. As tabelas habilitam RLS; leituras públicas passam por views limitadas e uma RPC que retorna somente totais agregados. Escritas de campanhas, doações, notícias e atualizações de tracker passam por RPCs auditáveis e só aceitam chamadas com a chave `service_role`.
3. Crie o usuário operador no Supabase Auth e copie o UUID dele. Não coloque senha, UUID de operador ou service role em arquivos públicos.
4. No ambiente privado das **Cloudflare Pages Functions**, configure:
   - `SUPABASE_SERVICE_ROLE_KEY` (**secret**, nunca no HTML/JS)
   - `ADMIN_USER_IDS` (UUIDs permitidos, separados por vírgula; variável privada)
   - Opcionalmente `SUPABASE_URL` e `SUPABASE_ANON_KEY` se for trocar o projeto; a configuração pública indicada já é o padrão no backend.
5. Publique o site com a pasta `functions/` no diretório raiz da Cloudflare Pages. Use HTTPS. Sem estas configurações, o catálogo continua no modo local e as operações administrativas ficam indisponíveis.
6. Abra `admin/index.html`, autentique com o usuário Supabase autorizado e cadastre a campanha. Configure split, chave PIX e QR real antes de ativá-la.

O login não persiste senha nem token em `localStorage`: o endpoint troca as credenciais por cookie `HttpOnly`, `Secure` e `SameSite=Strict`. As Functions validam o usuário com Supabase Auth e a allowlist `ADMIN_USER_IDS` antes de chamar as RPCs. Doações só entram no ranking depois de confirmação administrativa; a view pública retorna apenas apelido, total e quantidade, nunca mensagens ou IDs de conta.

Não crie `.env` no repositório. Variáveis privadas devem ficar no painel da plataforma ou no ambiente local ignorado pelo Git. Nunca use `service_role` em scripts servidos ao navegador.

## Modo local

`data/fundraiser-mock.js` contém uma campanha de demonstração e nenhum doador real. A página informa o modo **Local / demonstração** e não grava alterações nem envia doações. A lista local não representa saldo financeiro. Com as Functions e o banco disponíveis, a mesma interface muda para **Banco conectado**.

`tracker_updates` guarda atualizações editoriais auditadas, sem sobrescrever o snapshot oficial em `data/tracker.json` nem os registros manuais em `data/kynostracker.json`. Notícias do tracker usam o mapeamento PT-BR salvo no snapshot; quando uma tradução PT-BR não existe ou falha, o feed mantém o texto original em vez de bloquear a página. Notícias publicadas e atualizações de tracker são incorporadas ao feed e à Central de Avisos da home.
