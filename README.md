
# Kynos GTA VI Recomp

Site estático responsivo, sem banco de dados ou dependências. Execute-o em um servidor local, como a extensão Live Server do VS Code, para permitir que o navegador carregue os arquivos JSON.

## Marca e identidade visual

- Substitua `assets/logo.png` pela sua logo. Se o PNG não existir, o site usa automaticamente `assets/logo.svg`; caso ambos falhem, mostra uma marca estilizada com a letra K.
- A marca K em alto contraste está disponível em `assets/logo.png` e `assets/logo.svg`. Os ícones `assets/icon.png`, `assets/favicon.png`, `assets/favicon.ico`, `assets/icon.svg` e `assets/favicon.svg` também são substituíveis; os formatos vetoriais são usados primeiro.
- `background.jpg` é a imagem do hero. Para trocá-la, substitua o arquivo mantendo o nome ou ajuste a regra `.site-bg` em `styles.css`.
- O crédito do rodapé aponta para `https://github.com/kynosstudio?tab=repositories`.

## Edição dos dados

Os arquivos JSON em `data/` concentram o conteúdo e os perfis editáveis do site:

- `repositories.json`: a página de Repositórios mostra os cinco projetos ativos mais avançados, ordenados pelo marco de GTA VI e pelo ranking manual em caso de empate. XCL e VIctory lideram com 55%, seguidos por TuxBox; projetos sem marco de GTA VI aparecem depois. Leonida fica em uma área separada, marcada como `nuked`, fora do ranking ativo, com o último marco e um link para um fork preservado. O progresso geral da comunidade também fica nesta página.
- `news.json`: o Blog apresenta uma manchete principal sobre a indisponibilidade de Leonida, seguida por três notícias do Top 3 atual (XCL, VIctory e TuxBox). O arquivo inclui traduções para EN, ES e ZH e um aviso de atualização manual com fonte no PortWatch VI; o fallback equivalente está em `app.js` para `file://`.
- `xcl-feed.json`: fallback local do feed de atividade pública do XCL. Os eventos ao vivo vêm das APIs públicas do GitHub para workflows, commits e pull requests; o feed é armazenado no `localStorage` por 15 minutos. Em `file://`, a chamada à API é desativada e é usado o fallback embutido em `app.js`; mantenha-o alinhado com este JSON ao editar os itens offline. Há controles para alternar notícias manuais/PortWatch e atualizações automáticas, atualizar sob demanda, copiar cada notícia como item JSON e exportar o resumo para uso em `news.json`. O acesso público anônimo à API do GitHub pode atingir limites; nesse caso, a interface avisa e mostra o fallback local.
- `discords.json`: edite `official` para configurar o convite do servidor oficial (usado nos botões de participação) e adicione servidores em `affiliates`.
- `hardware.json`: edite as metas de desempenho, os perfis de console, o catálogo de placas de vídeo e processadores, as capacidades e frequências de memória, o armazenamento e os pesos da estimativa. Há metas próprias para 720p, 900p e resoluções maiores; cada meta define alvos de GPU, CPU, VRAM, RAM, largura de banda e classe de SSD.
- `portwatch-progress.json`: contém os 27 projetos e os sinais de execução do GTA VI, os marcos, o líder, a data e a fonte da atualização manual. O percentual de cada projeto é derivado dos sinais `gta`: `loads` (25%), `boots` (40%), `menu` (55%), `ingame` (70%), `fps` (85%) e `stability: "stable"` (100%); sem sinal confirmado, fica em 0% (Preparação). Projetos com `status: "nuked"`, `down` ou `takedown` permanecem no registro histórico, mas não entram nos rankings ativos nem na média do Top 3. Ao atualizar, ajuste `overallProgress`, `leaderId`, `updatedAt`, status e sinais `gta`; média do top 3 ativo, projetos que chegaram ao menu principal e total acompanhado são calculados dos projetos presentes no JSON. O bloco não inclui notícias, outros dados do tracker ou histórico/gráfico diário, e não carrega o arquivo original do tracker. Em `file://`, a seção usa o mesmo conjunto embutido em `app.js`; mantenha o JSON e o fallback sincronizados.

As métricas do XCL exibidas no card são o snapshot histórico do tracker em 23/11/2026 e não contagens atuais. O feed separado é o único trecho que consulta a API pública do GitHub para atividade recente.

Os seletores de GPU e CPU organizam os modelos por fabricante, série e disponibilidade de gráfico integrado. A busca ignora diferenças de maiúsculas, acentos, espaços e hifens, informa a quantidade encontrada e mantém uma seleção válida. O catálogo de CPUs inclui Ryzen de várias gerações, Intel Core da 6ª à 14ª geração e Core Ultra; os Intel de 11ª geração e variantes F/KF aparecem no grupo de vídeo correspondente. As pontuações e os FPS são projeções comparativas, não medições nem requisitos oficiais da Rockstar Games. GPUs Radeon RX 8000 indicadas como perfis estimados são projeções.

As pontuações e as taxas de FPS são referências estimadas, não medições nem requisitos oficiais da Rockstar Games. Modelos identificados como perfil estimado são projeções que devem ser atualizadas quando houver especificações verificáveis.

Os arquivos usam JSON padrão, sem comentários dentro do próprio JSON, para manter compatibilidade com o carregamento direto no navegador.

## Idiomas

O seletor no cabeçalho oferece Português do Brasil (padrão), Inglês, Espanhol e Chinês simplificado. A escolha é salva em `localStorage`; os textos da interface ficam em `i18n.js`. Nomes próprios de projetos e modelos de hardware são preservados.

## Simulador: tema, presets e compartilhamento

- O tema claro/escuro pode ser alternado no cabeçalho e a preferência fica salva localmente.
- O botão **Presets de PC** cria três exemplos na primeira utilização e permite salvar, carregar, atualizar, renomear, excluir, importar e exportar configurações em JSON. Os dados permanecem no `localStorage` do navegador.
- **Comparar setups** abre um diálogo para comparar a configuração atual, presets e equivalências estimadas de Xbox Series S, PlayStation 5 e Xbox Series X. Essas equivalências não são requisitos oficiais.
- A faixa **E se...** aplica cenários temporários; **Restaurar configuração atual** recupera a configuração anterior sem alterar um preset salvo.
- **Copiar resumo** e **Copiar link** compartilham as especificações e parâmetros da configuração selecionada. Busca e filtros compactos ajudam a localizar CPUs e GPUs no catálogo organizado por fabricante e iGPU.

## Analytics local

O painel não aparece no menu público. Acesse diretamente `#kynos-analytics` para ver visualizações, cliques, simulações e seleções de hardware registradas neste navegador. O painel oferece exportação e importação de relatórios JSON e limpeza dos dados.

Os registros ficam exclusivamente no `localStorage` do navegador, não são enviados a um servidor e podem ser apagados ao limpar os dados do navegador. A rota não é autenticada nem deve ser considerada um mecanismo de segurança. Para adicionar uma solução externa no futuro, há um ponto de integração comentado em `app.js` (por exemplo, Cloudflare Web Analytics ou Umami).

## Mobile

O menu compacto, o seletor de idioma, o simulador empilhado e a trilha de progresso com rolagem horizontal são adaptados para celular e tablet. Os marcadores da trilha aceitam toque para abrir dicas.
