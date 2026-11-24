
# KynosRecompVI

Portal estático responsivo, sem banco de dados ou dependências. Notícias, corrida dos projetos e monitoramento do tracker são o foco; o simulador de hardware fica na seção **Meu PC Roda GTAVI**. Abra em um servidor local ou diretamente via `file://`.

## Marca e identidade visual

- A marca atual está em `assets/logo.svg`; caso o arquivo não carregue, o site mostra uma marca estilizada com a letra K. Ícones e favicons ficam em `assets/`.
- `background.jpg` é a imagem do hero. Para trocá-la, substitua o arquivo mantendo o nome ou ajuste a regra `.site-bg` em `styles.css`.
- O crédito do rodapé aponta para `https://github.com/kynosstudio?tab=repositories`.

## Dados do tracker em PT-BR

Os trackers têm papéis separados:

- `data/tracker.json` recebe o snapshot bruto do PortWatch. Mantenha esse arquivo como fonte de dados do tracker; não misture nele relatos editoriais ou informações de apoio comunitário.
- `data/tracker-pt-BR.json` é a versão traduzida/editada que o site consome. O gerador atualiza a tradução, mas preserva o objeto `editorial` para relatos próprios, ajustes estimados e notícias escritas em PT-BR.

Para acrescentar ou corrigir um relato editorial, edite `editorial.teams.xlaunchvi` ou `editorial.effortOverrides` dentro de `data/tracker-pt-BR.json` e rode o gerador. Notícias editoriais adicionais podem ser incluídas em `editorial.news`, com `id`, `date`, `category`, `title`, `summary` e fontes HTTP(S):

```powershell
python .\scripts\build_tracker_ptbr.py
```

O gerador aplica traduções disponíveis, mantém os textos editoriais locais e usa o título/resumo de origem como fallback para novas notícias ou manchetes ainda sem tradução. Ele produz:

- `data/tracker-pt-BR.json`: conteúdo em PT-BR para o site, incluindo projetos, notícias, ferramentas, alertas, mudanças, scout, DMCA, manchetes e o bloco de dados editoriais. Os links originais são preservados.
- `data/file-fallback.js`: fallback gerado com hardware, comunidades, snapshot bruto e camada PT-BR. É carregado diretamente em `file://` e sob demanda em HTTP quando a fonte traduzida ou os dados essenciais falham.

O progresso segue a escala PortWatch: preparação técnica até 10%, executável (10%), primeiro quadro (20%), menus (30%), mundo (40%) e jogável (50%); história, renderização, desempenho e estabilidade preenchem o restante até 100%. Builds privadas entram nas métricas gerais, mas ficam fora da corrida pública; watchlist e projetos fora do ar são apresentados separadamente. `data/portwatch-scoring.js` é o motor compartilhado entre a página e os testes.

Os valores locais de `XlaunchVI` (**55%**, menus a 30 FPS sem texturas) e `CGBJ` (**75%**, cut-scenes a 4 FPS) são overrides explícitos em `editorial.effortOverrides`; o gerador os grava como `manualScore`. Eles não são recalculados a partir de campos antigos nem substituídos pela sincronização automática. Relatos editoriais e entradas locais ausentes do snapshot são preservados em `editorial.teams.xlaunchvi` e `editorial.manualEfforts`. Esses percentuais não são medições oficiais nem marcos publicados no GitHub.

O painel **Progresso geral** calcula o líder e a média do top 3 com os esforços do snapshot bruto (`tracker.json`) e a fórmula PortWatch. Overrides editoriais continuam preservados nos dados e nas áreas locais dos projetos, mas não substituem o cálculo geral nem elevam o placar oficial por causa de percentuais da escala anterior.

O carregador HTTP consulta `tracker.json` e `tracker-pt-BR.json` de forma independente; em `file://`, o fallback inclui ambos para manter o mesmo cálculo e as mesmas notícias. A sincronização automática preserva `trackerKynos`, overrides marcados como locais e os dados editoriais. O fluxo agendado regenera a camada traduzida e o fallback após sincronizar o snapshot. O convite da comunidade fica em `data/discords.json` e direciona ao Discord do XlaunchVI, não a um servidor oficial do KynosRecompVI. Traduções de interface ficam em `i18n.js`; traduções e overrides editoriais ficam em `scripts/build_tracker_ptbr.py` e `data/tracker-pt-BR.json`. Datas sem hora são exibidas como “horário não informado”; timestamps completos usam o fuso local, com o fuso indicado e UTC disponível no detalhe. HTTP 404 em consulta anônima não confirma se um repositório está privado, removido ou temporariamente indisponível.

A projeção de prazo da corrida só é calculada se `history` contiver ao menos duas amostras do mesmo projeto, com timestamps ISO 8601 completos e percentuais comparáveis nos últimos 30 dias. Formatos aceitos incluem `{ "projectId": "xcl", "timestamp": "2026-11-24T01:00:00Z", "percent": 35 }` e snapshots `{ "timestamp": "...Z", "efforts": [{ "id": "xcl", "percent": 35 }] }`. Sem essa série, a interface informa que não há prazo calculável; não cria datas nem ritmo artificial. A previsão é especulativa e não representa uma data oficial de lançamento para PC.

O relógio no hero usa essa mesma projeção para contar até o próximo marco da escala atual. Ele só inicia com histórico verificável, atualiza a cada segundo e, sem amostras suficientes, mantém traços em vez de inventar um prazo. Se a previsão passar sem confirmação do tracker, o relógio chega a zero e informa que o marco ainda não foi confirmado.

As métricas, o líder, a média do top 3, o marco mais avançado e a quantidade de projetos que iniciaram o jogo são calculados a partir do snapshot atualizado. A corrida pública ranqueia apenas repositórios públicos acompanhados; builds privadas e watchlist têm listas próprias. Projetos fora do ar ficam no registro histórico e não entram no ranking ativo.

## Edição dos demais dados

Os arquivos JSON em `data/` concentram o conteúdo e os perfis editáveis do site:

- `repositories.json`, `news.json` e `portwatch-progress.json`: snapshots legados mantidos como referência; o portal usa `tracker-pt-BR.json` como fonte de notícias e corrida.
- `xcl-feed.json`: fallback local do feed de atividade pública do XCL. Os eventos ao vivo vêm das APIs públicas do GitHub para workflows, commits e pull requests; o feed é armazenado no `localStorage` por 15 minutos. Em `file://`, a chamada à API é desativada e é usado o fallback embutido em `app.js`. Há controles para alternar as notícias traduzidas e a atividade do XCL, atualizar sob demanda, copiar itens como JSON e exportar um resumo. A API anônima do GitHub pode atingir limites; nesse caso, a interface avisa e mostra o fallback local.
- `discords.json`: edite `official` para configurar o convite do servidor oficial (usado nos botões de participação) e adicione servidores em `affiliates`.
- `hardware.json`: edite as metas de desempenho, os perfis de console, o catálogo de placas de vídeo e processadores, as capacidades e frequências de memória, o armazenamento e os pesos da estimativa. Há metas próprias para 720p, 900p e resoluções maiores; cada meta define alvos de GPU, CPU, VRAM, RAM, largura de banda e classe de SSD.

As métricas dos projetos são o snapshot do tracker, não contagens ao vivo. O feed separado do XCL é o único trecho que consulta a API pública do GitHub para atividade recente.

Na seção **Meu PC Roda GTAVI**, a carteirinha pode ser copiada como texto para Discord/X/WhatsApp ou baixada como SVG. Os cenários Caos e presets extremos reaproveitam as pontuações locais do simulador; FSR/DLSS não recebem bônus estimado, e a ferramenta de custo-benefício não inventa preços. O radar de segurança consulta apenas o snapshot local: não visita links, não verifica disponibilidade ao vivo e não deve receber senhas ou tokens.

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
- O card principal resume veredito, FPS médios e peças; a análise de subsistemas e recomendações fica recolhida em **Ver análise detalhada e recomendações**. Contadores e barras de progresso animam a partir de zero e respeitam a preferência por movimento reduzido do sistema.

## Analytics local

O painel não aparece no menu público. Acesse diretamente `#kynos-analytics` para ver visualizações, cliques, simulações e seleções de hardware registradas neste navegador. O painel oferece exportação e importação de relatórios JSON e limpeza dos dados.

Os registros ficam exclusivamente no `localStorage` do navegador, não são enviados a um servidor e podem ser apagados ao limpar os dados do navegador. A rota não é autenticada nem deve ser considerada um mecanismo de segurança. Para adicionar uma solução externa no futuro, há um ponto de integração comentado em `app.js` (por exemplo, Cloudflare Web Analytics ou Umami).

## Mobile

O menu compacto, o seletor de idioma, o simulador empilhado e a trilha de progresso com rolagem horizontal são adaptados para celular e tablet. Os marcadores da trilha aceitam toque para abrir dicas.
