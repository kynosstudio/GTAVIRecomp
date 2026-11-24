
# KynosRecompVI

Portal estático responsivo, sem banco de dados ou dependências. Notícias, corrida dos projetos e monitoramento do tracker são o foco; o simulador de hardware fica na seção **Meu PC Roda GTAVI**. Abra em um servidor local ou diretamente via `file://`.

## Marca e identidade visual

- A marca atual está em `assets/logo.svg`; caso o arquivo não carregue, o site mostra uma marca estilizada com a letra K. Ícones e favicons ficam em `assets/`.
- `background.jpg` é a imagem do hero. Para trocá-la, substitua o arquivo mantendo o nome ou ajuste a regra `.site-bg` em `styles.css`.
- O crédito do rodapé aponta para `https://github.com/kynosstudio?tab=repositories`.

## Dados do tracker em PT-BR

`data/tracker.json` é a fonte original do tracker. Para atualizar a versão editorial traduzida, substitua esse arquivo pela nova exportação e execute:

```powershell
python .\scripts\build_tracker_ptbr.py
```

O gerador valida se todas as notícias e manchetes têm uma tradução revisada e produz:

- `data/tracker-pt-BR.json`: conteúdo enxuto para o site, com resumos em PT-BR, dados de projetos, ferramentas, alertas, mudanças, scout, DMCA e manchetes. Os links originais são preservados.
- `data/file-fallback.js`: pacote local de fallback para `file://`, com os dados do simulador e da comunidade junto ao tracker traduzido. Em HTTP, o portal carrega os JSONs normalmente e não baixa esse pacote.

As traduções editoriais ficam no dicionário `scripts/build_tracker_ptbr.py`. Se o tracker trouxer IDs de notícias ou títulos de manchetes novos, o gerador interrompe com erro até que a tradução seja adicionada. Datas sem hora são exibidas como “horário não informado”; timestamps completos aparecem no fuso local do navegador, com o fuso indicado e o valor UTC disponível no detalhe.

A projeção de prazo da corrida só é calculada se `history` contiver ao menos duas amostras do mesmo projeto, com timestamps ISO 8601 completos e percentuais comparáveis nos últimos 30 dias. Formatos aceitos incluem `{ "projectId": "xcl", "timestamp": "2026-11-24T01:00:00Z", "percent": 62.5 }` e snapshots `{ "timestamp": "...Z", "efforts": [{ "id": "xcl", "percent": 62.5 }] }`. Sem essa série, a interface mostra a distância até os marcos e informa que não há prazo calculável; não cria datas nem ritmo artificial. A previsão é especulativa e não representa uma data oficial de lançamento para PC.

O relógio no hero usa essa mesma projeção para contar até o próximo marco acompanhado de jogabilidade (70%, 30 FPS ou estabilidade). Ele só inicia com histórico verificável, atualiza a cada segundo e, sem amostras suficientes, mantém traços em vez de inventar um prazo. Se a previsão passar sem confirmação do tracker, o relógio chega a zero e informa que o marco ainda não foi confirmado.

O snapshot deste workspace aponta VIctory em 67%, XCL em 62,5% e TuxBox em 40%. O projeto ativo com maior percentual é destacado automaticamente na home e no ranking; projetos fora do ar ficam no registro histórico e não entram na liderança ativa.

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
