import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

NEWS_PT = {
    "2026-11-24-xcl-30fps-in-game": (
        "Exclusivo: XCL relata 30 FPS em GTA VI e testes já chegam ao mundo aberto",
        "Atualização",
        "A equipe evitou detalhar o resultado por receio de derrubadas. Depois, testers relataram que a versão pública passou dos menus e carregou o mundo. A tela, porém, permanece em um indicador de carregamento e o watchdog da GPU encerra as execuções em poucos minutos. Um relato menciona 28–30 FPS, ainda sem captura; o avanço é autodeclarado e não foi reproduzido de forma independente.",
    ),
    "2026-11-24-tuxbox-first-frame-victory-world": (
        "TuxBox mostra o primeiro quadro de GTA VI; VIctory avança no carregamento do mundo",
        "Progresso",
        "O TuxBox registrou a tela de seleção de jogador em 4K no Linux com Proton, sem entrada de controle: é um primeiro quadro, não um menu. O VIctory relata chegar ao mundo e exibir o cartão da primeira missão, mas a cena continua quase toda escura e a GPU pode travar. PercyScarlett e GTA6-BootTest também relatam executar o código até quadros pretos. Resultados ainda autodeclarados.",
    ),
    "2026-11-23-leonida-nuked": (
        "Leonida sai do ar: repositório e Discord desaparecem, e criador anuncia saída",
        "Projeto fora do ar",
        "Em 23/11, o Discord da Leonida parou de responder e o repositório deixou de existir no GitHub; o criador publicou que estava se afastando. O tracker não encontrou aviso público de DMCA contra o projeto, portanto o motivo da remoção não está confirmado. Forks de colaboradores preservam parte do código. A Leonida segue no registro histórico, fora do ranking ativo.",
    ),
    "2026-11-23-leonida-discord-down": (
        "Discord da Leonida desaparece enquanto o projeto muda de organização no GitHub",
        "Comunidade",
        "O convite do servidor deixou de funcionar; relatos de banimento não foram confirmados pelo Discord nem pela equipe. O repositório havia sido movido para uma nova organização e foi apagado mais tarde. O log público de DMCA não apontava uma notificação contra a Leonida.",
    ),
    "2026-11-23-marvis-menus-stream": (
        "VIctory mostra os menus de GTA VI em transmissão; teste ainda não foi reproduzido",
        "Progresso",
        "Uma transmissão de Marvis mostrou GTA VI chegando aos menus por volta de 15 FPS. O projeto VIctory relata telas iniciais a 30 FPS e carregamento até o mundo, ainda sem imagem utilizável. Os resultados vêm de uma única máquina e aguardam reprodução independente.",
    ),
    "2026-11-23-leonida-exe-runs": (
        "Leonida executa o arquivo de GTA VI, mas ainda não exibe imagem",
        "Progresso",
        "Builds de colaboradores executaram o código do jogo por alguns minutos, configuraram áudio e gráficos e abriram uma janela, que permaneceu preta. Uma chamada gráfica ainda bloqueava a conclusão dos quadros. O relato é histórico: o repositório principal da Leonida foi removido.",
    ),
    "2026-11-23-exe-readme": (
        "Texto atribuído ao Cyberleek mistura manifesto sobre o vazamento e pedido de cripto",
        "Contexto",
        "Um arquivo apresentado como README do pacote circulou em fóruns, mas sua autenticidade não foi verificada. O texto afirma que doações e negociações de um token financiariam um projeto não revelado. Não há comprovação independente dessas alegações; não compre tokens nem baixe executáveis anunciados por desconhecidos.",
    ),
    "2026-11-23-exe-released": (
        "Cyberleek afirma ter publicado o executável ausente; autenticidade segue sem confirmação",
        "Segurança",
        "A publicação foi anunciada em 23/11, antes do prazo divulgado pelo próprio grupo. As fontes citadas não comprovaram a autenticidade do arquivo e a Rockstar não confirmou o vazamento. Não distribuímos nem vinculamos executáveis: downloads de desconhecidos podem conter malware.",
    ),
    "2026-11-22-anyps5-developer-x-suspended": (
        "Conta de desenvolvedor do AnyPS5 é suspensa; causa não foi divulgada",
        "Contexto",
        "A suspensão da conta no X foi observada, mas a plataforma não informou publicamente o motivo. Não há evidência de participação da Sony ou da Rockstar. A suspensão não altera os marcos de progresso do GTA VI.",
    ),
    "2026-11-22-xcl-takes-lead": (
        "XCL avança ao executar jogos de Xbox Series no PC; GTA VI ainda não iniciava",
        "Progresso",
        "O XCL relatou Minecraft Preview jogável e telas iniciais de outros títulos no Windows, um sinal técnico para a camada de compatibilidade. Naquele momento, GTA VI ainda aguardava o executável necessário. Os resultados eram autodeclarados.",
    ),
    "2026-11-22-exe-deadline-time": (
        "Prazo do executável foi anunciado junto a campanha de cripto; alegações não verificadas",
        "Segurança",
        "O grupo associou a publicação do arquivo a uma contagem regressiva e a uma meta de token. Nenhuma fonte confirmou que o executável anunciado era autêntico. O tracker não recomenda downloads nem investimentos relacionados.",
    ),
    "2026-11-22-copies": (
        "Reenvios de projetos populares já circulavam em contas diferentes",
        "Alerta",
        "A triagem encontrou cópias da Leonida publicadas sob outras contas, inclusive uma com nome alterado. Um reenvio pode ser modificado para incluir código ou arquivos maliciosos. Use apenas os repositórios originais citados no acompanhamento.",
    ),
    "2026-11-21-exe-deadline": (
        "Build de Xbox atribuída ao Cyberleek circula sem verificação independente",
        "Contexto",
        "O grupo afirmou ter publicado uma build de Xbox Series, mas o executável principal estaria ausente. Veículos e pesquisadores não verificaram de forma independente a autenticidade dos arquivos. Os projetos de compatibilidade ainda precisavam de componentes para testar a inicialização.",
    ),
    "2026-11-19-fake-downloads": (
        "Downloads de “GTA VI para PC” são falsos; alertas apontam risco de malware",
        "Segurança",
        "A Rockstar não anunciou uma versão para PC, e os projetos comunitários não oferecem uma versão jogável. Empresas de segurança relataram instaladores falsos capazes de roubar senhas e dados de carteira digital. Não execute arquivos recebidos de desconhecidos nem desative o antivírus para instalá-los.",
    ),
    "2026-11-18-take-two-dmca": (
        "Take-Two envia notificações de DMCA contra projetos de GTA V no GitHub",
        "Direitos autorais",
        "Notificações protocoladas em novembro atingiram projetos não oficiais de GTA V e forks. Os registros citados tratam de GTA V, não comprovam uma ação contra os projetos de GTA VI acompanhados aqui.",
    ),
    "2026-11-16-kurtaj-plea": (
        "Responsável pelo vazamento de 2022 de GTA VI se declara culpado",
        "Contexto",
        "Arion Kurtaj admitiu invasões ligadas à divulgação de vídeos de desenvolvimento de GTA VI em 2022. Esse caso é distinto dos relatos de builds de 2026 mencionados no tracker.",
    ),
}

HEADLINES_PT = {
    "GTA 6 PC release date: When is GTA 6 coming to PC?": "GTA 6 no PC: quando o jogo pode chegar?",
    "Cyberleek Posts Missing GTA 6 Executable: What Changes for a PC Version": "Cyberleek publica o executável ausente de GTA 6: o que muda para o PC?",
    "GTA 6 Xbox Executable Leaks Online as “Early Christmas Gift” from Cyberleek": "Executável de GTA 6 para Xbox é divulgado como “presente antecipado de Natal”",
    "'GTA 6' on PC update: What we know about when it releases": "GTA 6 no PC: o que se sabe sobre uma possível versão",
    "The missing piece needed to get the leaked GTA 6 Xbox build running on PC has reportedly surfaced online": "Componente que faltava para testar a build de Xbox no PC teria aparecido",
    "GTA 6 boots on PC only 3 hours after Xbox executable leaked": "GTA 6 inicia no PC três horas após divulgação do executável de Xbox, diz site",
    "I'm playing GTA 6 at 60fps on PC without paying for anything extra": "“Estou jogando GTA 6 a 60 FPS no PC”: alegação não verificada",
    "GTA VI Xbox Executable Released by CyberLeek on November 23: The 209GB Leak Is Complete": "Cyberleek afirma ter concluído a divulgação de uma build de Xbox de 209 GB",
    "GTA 6 Leaker Releases Executable for Alleged Xbox Build": "Grupo divulga executável de uma suposta build de Xbox de GTA 6",
    "Cyberleek Releases Missing GTA 6 Xbox Executable": "Cyberleek afirma ter divulgado o executável de GTA 6 para Xbox",
    "Want GTA VI on PC? Fake downloads and scams are everywhere – how to stay safe": "Quer GTA VI no PC? Saiba reconhecer downloads falsos e golpes",
    "GTA 6 Leaker Releases All Files for Alleged Xbox Build of Game": "Grupo afirma ter divulgado todos os arquivos de uma build de Xbox",
    "GTA 6 PC port progressing at breakneck speed": "Projetos de GTA 6 para PC avançam rapidamente, afirma reportagem",
    "GTA 6 leaker reportedly releases file needed to run leaked Xbox build": "Grupo teria divulgado arquivo necessário para executar a build de Xbox",
    "GTA 6 Xbox Build EXE Leak: What It Means in the UAE": "Vazamento do executável de GTA 6 para Xbox: repercussão internacional",
    "Cyberleek Leaks GTA 6 EXE File, PC Port Efforts Begin": "Após divulgação de executável atribuída ao Cyberleek, começam testes no PC",
    "The GTA VI Xbox Executable Has Leaked. A PC Port Remains Far Off.": "Executável de GTA VI para Xbox teria vazado; versão para PC ainda está distante",
    "Enthusiasts launched the GTA 6 prologue on PC several hours after the EXE file leaked.": "Entusiastas afirmam ter iniciado o prólogo de GTA 6 no PC após o vazamento",
    "I streamed GTA VI to my PC – it was awesome, even with lag": "“Transmiti GTA VI para o PC”: relato sobre streaming, não uma versão nativa",
    "GTA 6 PC Rumors: What's Real and What's Just Hype": "Rumores de GTA 6 para PC: o que é confirmado e o que é especulação",
    "The Race Is On To Unofficially Port GTA 6 To PC After Cyberleek Drops .Exe File": "Após divulgação de executável, projetos comunitários tentam levar GTA 6 ao PC",
    "GTA 6 on PC Might Be Playable Soon, as Cyberleek Released the Full Build from Xbox's Version": "Build de Xbox atribuída ao Cyberleek reacende especulações sobre GTA 6 no PC",
    "GTA 6 leaker Cyberleek releases Xbox build .EXE: Could a PC Port be coming?": "Cyberleek afirma ter divulgado executável de Xbox; isso significa uma versão para PC?",
    "Liverpool Echo News. . A hacker has been jailed after leaking clips from GTA 6 🚨 🎮 Arion Kurtaj has also hacked into BT, EE, Revolut and Uber - costing the companies millions 💰 #GTA #hacker #game": "Responsável pelo vazamento de vídeos de GTA 6 é condenado no Reino Unido",
    "Hackers say they have leaked an Xbox build of GTA VI, now with its missing executable": "Grupo afirma ter divulgado build de Xbox de GTA VI e o executável que faltava",
    "Cyberleek releases executable for GTA 6 Xbox build leaked last week: 'The torch passes to the open source recomp and emulation projects'": "Cyberleek afirma ter divulgado executável de GTA 6 e diz passar o trabalho a projetos abertos",
    "Hacker behind GTA 6 leak released as judge says \"don't let this happen again\"": "Responsável por vazamento de GTA 6 é solto; juiz pede que o caso não se repita",
    "CyberLeek Leaks GTA 6’s Executable File, and Modders Are Already Working on a Playable PC Version": "Executável atribuído ao Cyberleek é divulgado enquanto projetos testam compatibilidade",
    "Cyberleek releases GTA 6 Xbox build .exe, boosting playable PC port chances": "Executável atribuído ao Cyberleek aumenta as expectativas por testes no PC",
    "GTA 6 Xbox Executable Leaks, Fan PC Port Projects Begin Testing": "Executável de GTA 6 para Xbox é divulgado; projetos de fãs começam testes",
}

PROJECT_SUMMARIES_PT = {
    "xcl": "Camada de compatibilidade que executa código de Xbox Series no Windows. Testes relatam menus e carregamento do mundo; a imagem ainda fica presa na tela de carregamento e os resultados não foram reproduzidos de forma independente.",
    "marvis": "Camada em Rust. Relata telas iniciais a 30 FPS e chegada ao mundo, com iluminação parcial e áudio; a cena ainda não é jogável e os relatos são autodeclarados.",
    "tuxbox": "Camada voltada a Linux/Proton. Registrou a tela de seleção de jogador em 4K, sem interação; o marco é um primeiro quadro, não um menu.",
    "leonida": "Projeto fora do ar desde 23/11: repositório removido, Discord indisponível e criador afastado. O último marco relatado foi o executável em execução, com quadros pretos.",
    "xbox2windows": "Pesquisa de recompilação estática. Uma gravação mostra menus instáveis; o projeto ainda não declara o marco como confirmado.",
    "five-star-recomp": "Relata executar o executável e exibir o vídeo de introdução; ainda não publicou captura que permita confirmar o resultado.",
    "palmetto": "Continuação aberta da Leonida. Registra a execução do executável até uma interrupção na criação de recursos, sem exibir um quadro.",
    "percyscarlett": "Relata executar o código até uma sequência de quadros pretos antes de a GPU travar; ainda sem imagem utilizável.",
    "gta6-boottest": "Harness de depuração com DLLs substitutas; o projeto afirma chegar à interface, mas não publicou captura do resultado.",
}

TOOL_DESCRIPTIONS_PT = {
    "Rage Tools VI": "Ferramentas Python para inspecionar arquivos RPF9, áudio e esquemas de scripts.",
    "GTA VI PC port hub": "Hub de coordenação com anotações compartilhadas, inventário de pacotes e bloqueios comuns.",
    "SixNG": "Extrator para converter modelos em glTF e navegar por texturas e dados de mapa.",
    "PercyStar": "Explorador RPF9 em Rust, com suporte a vídeo Bink2 e áudio ADAT/Opus.",
    "rpf9-explorer": "Explorador para Windows com visualização de modelos, texturas, áudio e vídeo.",
    "bcpack-rs": "Decodificador de texturas Xbox BCPack; BC1 funciona e BC7 segue em desenvolvimento.",
    "RageForge": "Ferramentas de pesquisa para explorar arquivos RPF9 e TTPF.",
    "ttpf-studio": "Ferramenta para visualizar, exportar e substituir texturas TTPF.",
    "GTA6-Asset-Info": "Notas de formato sobre arquivos RPF9, texturas, modelos e dados de mapa.",
    "awesome-gta6-RE": "Lista curada de ferramentas abertas de engenharia reversa e camadas de compatibilidade.",
    "gta6-explorer": "Ferramenta somente de leitura para navegar por pacotes e extrair recursos.",
    "6stars": "Visualizador para macOS que renderiza mapa, vegetação e clima a partir de arquivos locais.",
    "rage9-re": "Decodificador de arquivos de scripts e animações, com exportação para glTF.",
    "AWC from RPF9": "Extrator de faixas de áudio AWC.",
    "0x52504639": "Pesquisa de formato, catálogos e ferramentas para arquivos RPF9.",
    "rpf9-research": "Pesquisa comunitária sobre cabeçalhos, tabela de conteúdo e nomes RPF9.",
    "Vice Lens": "Explorador de mapas, modelos, animações, vídeos e sons de arquivos locais.",
    "xseriesrecomp": "Interface que reúne snapshots de projetos acompanhados; não foi testada com jogos.",
    "xbox-hle-lab": "Ferramentas de teste de GPU e scripts de VM para experimentação isolada com XCL.",
    "XBOX-Inspector": "Ferramenta somente de leitura para inventariar builds e inspecionar cabeçalhos RPF9.",
}

FLAGGED_PT = {
    "switch-emulator-network": ("Rede de cópias com instaladores falsos", "33 repositórios quase idênticos divulgavam um suposto instalador de PC. O padrão é compatível com distribuição de malware; não baixe nem execute esses arquivos."),
    "fake-exe": ("Executáveis e instaladores falsos", "O tracker alerta para falsos instaladores que usam a notícia do executável como isca. Nenhum arquivo foi autenticado pela Rockstar; não baixe executáveis de terceiros."),
    "pc-version-pages": ("Páginas que prometem GTA VI pronto para PC", "Repositórios compostos apenas por páginas HTML prometem uma versão jogável, mas não contêm código funcional."),
    "ai-fakes": ("Vídeos e publicações enganosos", "Clipes virais que afirmam mostrar GTA VI rodando no PC não foram confirmados pelos projetos acompanhados."),
    "auto-clone-networks": ("Redes de repositórios clonados", "A triagem automática sinalizou cópias e iscas de instaladores que repetem nomes ou descrições de projetos conhecidos."),
    "copies": ("Reenvios de projetos acompanhados", "O tracker lista reenvios sob outras contas. Cópias podem ser alteradas para incluir malware; prefira os links dos repositórios originais."),
}

RECENT_CHANGES_PT = [
    "O scout encontrou um possível esforço em nufu88pa/retun-leonida-for-nufu.",
    "O scout encontrou um possível esforço em nandorjanosi/Leocica.",
    "O scout encontrou um possível esforço em Guernica4u/Leonida-archive.",
    "O scout encontrou um possível esforço em LatukaTV/Leonardo.",
    "O scout encontrou um possível esforço em TreXito/mangrove.",
    "O scout encontrou um possível esforço em Nikide/leonida-bvhfix.",
    "Um repositório de backup foi sinalizado para triagem; não foi incluído como projeto confirmado.",
    "Xbox2Windows recebeu crédito parcial pelo menu: há uma gravação de execução instável, ainda sem confirmação do próprio repositório. Progresso indicado: 47,5%.",
    "VIctory avançou para 67% ao relatar iluminação parcial e áudio no mundo do jogo. É o maior percentual do snapshot, mas segue autodeclarado.",
    "Five Star Recomp relata executar o executável e exibir o vídeo de introdução; a captura ainda não foi publicada. Progresso indicado: 40%.",
    "Palmetto, continuação aberta da Leonida, entrou na lista de observação; registra execução do executável sem quadro visível. Dezesseis cópias foram separadas para revisão.",
    "XCL avançou para 62,5% após relatos de testers que carregaram o mundo; a tela segue no indicador de carregamento e o watchdog encerra os testes.",
]


def translated_news(source):
    if set(NEWS_PT) != {item["id"] for item in source["news"]}:
        raise ValueError("NEWS_PT precisa conter exatamente os IDs de news do tracker.json.")
    stories = []
    for item in source["news"]:
        title, category, summary = NEWS_PT[item["id"]]
        sources = [
            {
                "outlet": source_item.get("outlet", "Fonte"),
                "title": source_item.get("title", ""),
                "url": source_item.get("url", ""),
            }
            for source_item in item.get("sources", [])
            if source_item.get("url", "").startswith(("https://", "http://"))
        ]
        stories.append({
            "id": item["id"],
            "date": item["date"],
            "category": category,
            "title": title,
            "summary": summary,
            "sources": sources,
        })
    return stories


def translated_efforts(source):
    overrides = {
        "xcl": 62.5,
        "marvis": 67,
        "xbox2windows": 47.5,
        "tuxbox": 40,
        "five-star-recomp": 40,
    }
    stage_overrides = {
        "xcl": "Carregamento do mundo (relato)",
        "marvis": "Dentro do mundo (relato)",
        "xbox2windows": "Menus parciais (relato)",
    }
    milestones = [
        (100, "Estável"),
        (85, "30 FPS"),
        (70, "Dentro do jogo"),
        (55, "Menu principal"),
        (40, "Primeiro quadro"),
        (25, "Executável em execução"),
        (0, "Preparação"),
    ]
    projects = []
    for item in source["efforts"]:
        gta = item.get("gta") or {}
        percent = overrides.get(item["id"])
        if percent is None:
            if gta.get("stability") == "stable":
                percent = 100
            elif gta.get("fps"):
                percent = 85
            elif gta.get("ingame"):
                percent = 55 + 15 * float(gta["ingame"])
            elif gta.get("menu"):
                percent = 40 + 15 * float(gta["menu"])
            elif gta.get("boots"):
                percent = 40
            elif gta.get("loads"):
                percent = 25
            else:
                percent = 0
        percent = round(float(percent), 1)
        stage = stage_overrides.get(item["id"]) or next(
            (label for threshold, label in milestones if percent >= threshold),
            "Preparação",
        )
        status = "offline" if item["id"] == "leonida" else "acompanhado"
        summary = PROJECT_SUMMARIES_PT.get(
            item["id"],
            "Em acompanhamento; o tracker ainda não registra um marco de GTA VI confirmado para este projeto."
            if percent == 0 else
            "O tracker registra atividade de inicialização, mas o resultado é autodeclarado e ainda não foi verificado de forma independente.",
        )
        stats = item.get("stats") or {}
        projects.append({
            "id": item["id"],
            "name": item["name"],
            "repo": item.get("repo", ""),
            "url": f"https://github.com/{item['repo']}" if item.get("repo") else "",
            "tier": item.get("tier", "watchlist"),
            "status": status,
            "percent": percent,
            "stage": stage,
            "summary": summary,
            "verification": "Relato dos próprios projetos; não equivale a reprodução independente.",
            "stars": stats.get("stars"),
            "forks": stats.get("forks"),
        })
    return projects


def build_tracker(source):
    headline_translations = HEADLINES_PT
    source_titles = {item["title"] for item in source["headlines"]}
    if source_titles != set(headline_translations):
        raise ValueError("HEADLINES_PT precisa conter exatamente os títulos de headlines do tracker.json.")
    if len(RECENT_CHANGES_PT) > len(source["changes"]):
        raise ValueError("O tracker tem menos mudanças do que o conjunto de traduções recentes.")

    tools = []
    if {item["name"] for item in source["tools"]} != set(TOOL_DESCRIPTIONS_PT):
        raise ValueError("TOOL_DESCRIPTIONS_PT precisa conter exatamente os nomes de tools do tracker.json.")
    kind_labels = {
        "Archive toolkit": "Ferramentas de arquivos",
        "Coordination hub": "Hub de coordenação",
        "Asset extractor": "Extrator de recursos",
        "Archive explorer": "Explorador de arquivos",
        "Texture codec": "Codec de texturas",
        "RE toolkit": "Ferramentas de engenharia reversa",
        "Format notes": "Documentação de formatos",
        "Curated list": "Lista curada",
        "World viewer": "Visualizador de mundo",
        "Data decoder": "Decodificador de dados",
        "Audio extractor": "Extrator de áudio",
        "Format research": "Pesquisa de formatos",
        "Front end": "Interface",
        "Test tools": "Ferramentas de teste",
        "Build inspector": "Inspetor de builds",
    }
    for item in source["tools"]:
        tools.append({
            "name": item["name"],
            "repo": item["repo"],
            "url": f"https://github.com/{item['repo']}",
            "kind": kind_labels.get(item.get("kind"), "Ferramenta"),
            "description": TOOL_DESCRIPTIONS_PT[item["name"]],
            "stars": (item.get("stats") or {}).get("stars"),
        })

    flagged = []
    if {item["id"] for item in source["flagged"]} != set(FLAGGED_PT):
        raise ValueError("FLAGGED_PT precisa conter exatamente os IDs de flagged do tracker.json.")
    for item in source["flagged"]:
        title, summary = FLAGGED_PT[item["id"]]
        flagged.append({
            "id": item["id"],
            "title": title,
            "count": item.get("count"),
            "summary": summary,
            "examples": (item.get("members") or [])[:5],
        })

    recent_changes = []
    for item, translation in zip(source["changes"][-len(RECENT_CHANGES_PT):], RECENT_CHANGES_PT):
        recent_changes.append({
            "date": item["date"],
            "kind": {"up": "progresso", "new": "novo", "flag": "alerta"}.get(item.get("kind"), "atualização"),
            "summary": translation,
        })

    headlines = [
        {
            "title": HEADLINES_PT[item["title"]],
            "outlet": item.get("outlet", "Fonte"),
            "date": item.get("date", ""),
            "url": item.get("link", ""),
        }
        for item in source["headlines"]
        if item.get("link", "").startswith(("https://", "http://"))
    ]
    scout = source.get("scout") or {}
    dmca = [
        {
            "date": item.get("date", ""),
            "url": item.get("url", ""),
            "gta6": bool(item.get("gta6")),
            "repositories": item.get("repoCount", 0),
            "summary": (
                "Registro público consultado; ele não aponta projetos de GTA VI."
                if not item.get("gta6") and not item.get("repoCount")
                else "Registro público listado pelo tracker; confira o documento original."
            ),
        }
        for item in source.get("dmca", [])
    ]
    return {
        "updatedAt": source["updated"],
        "sourceFile": "data/tracker.json",
        "news": translated_news(source),
        "efforts": translated_efforts(source),
        "tools": tools,
        "candidates": len(source.get("candidates", [])),
        "flagged": flagged,
        "ignored": {
            "count": len(source.get("ignored", [])),
            "summary": "Itens fora do escopo, cópias, páginas sem código funcional e projetos ainda sem evidência suficiente.",
        },
        "changes": recent_changes,
        "scout": {
            "since": scout.get("since", ""),
            "lastRun": scout.get("lastRun", ""),
            "summary": "Última varredura: 23 repositórios atualizados, 7 READMEs alterados, 21 candidatos novos e 23 itens sinalizados.",
            "sources": ["GitHub", "Reddit", "Hacker News", "X"],
            "watchNames": scout.get("watchNames", []),
        },
        "headlines": headlines,
        "dmca": dmca,
        "exe": {
            "status": "Relato de publicação; autenticidade não confirmada",
            "releasedAt": source["exe"].get("releasedAt", ""),
            "by": source["exe"].get("by", ""),
            "summary": "O tracker registra a alegação de que o executável foi publicado. Nenhuma das fontes citadas verificou que o arquivo é genuíno, e a Rockstar não confirmou o vazamento.",
            "source": source["exe"].get("source", ""),
            "safety": "Não baixe nem execute arquivos divulgados por desconhecidos. Instaladores falsos podem roubar senhas ou instalar malware. O KynosRecompVI não hospeda nem distribui executáveis.",
        },
    }


def main():
    source_path = DATA / "tracker.json"
    source = json.loads(source_path.read_text(encoding="utf-8"))
    localized = build_tracker(source)
    localized_path = DATA / "tracker-pt-BR.json"
    localized_path.write_text(json.dumps(localized, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    fallback = {
        "hardware": json.loads((DATA / "hardware.json").read_text(encoding="utf-8")),
        "discords": json.loads((DATA / "discords.json").read_text(encoding="utf-8")),
        "tracker": localized,
    }
    fallback_path = DATA / "file-fallback.js"
    fallback_path.write_text(
        "window.KynosFileData = " + json.dumps(fallback, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"Gerados {localized_path.relative_to(ROOT)} e {fallback_path.relative_to(ROOT)}.")


if __name__ == "__main__":
    main()
