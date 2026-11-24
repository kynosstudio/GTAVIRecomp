import json
import math
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def normalized_groundwork_percent(value):
    try:
        ratio = float(value)
    except (TypeError, ValueError):
        return 0
    if not math.isfinite(ratio):
        return 0
    return round(max(0, min(1, ratio)) * 100, 1)


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
    "GTA 6 PC: Cyberleek Releases Xbox EXE; Leonida Port Remains Unreleased": "GTA 6 no PC: Cyberleek divulga EXE de Xbox; port da Leonida segue indisponível",
    "As GTA 6 PC port gets closer to becoming playable, Rockstar is reportedly taking action against modders and Discord communities": "Enquanto projetos de GTA 6 para PC avançam, Rockstar estaria agindo contra modders e comunidades no Discord",
    "Can't Wait to Live Stream GTA 6? This Trick Lets You Play It On Your PC Now": "Não quer esperar para jogar GTA 6? Este método transmite o jogo para o PC",
    "GTA 6 has been out less than a week, and a full PC port is already on its way": "GTA 6 chegou há menos de uma semana e um port completo para PC já estaria a caminho",
}

PROJECT_SUMMARIES_PT = {
    "xcl": "Camada de compatibilidade que executa código de Xbox Series no Windows. Testes relatam menus e carregamento do mundo; a imagem ainda fica presa na tela de carregamento e os resultados não foram reproduzidos de forma independente.",
    "marvis": "Camada em Rust. Relata telas iniciais a 30 FPS e chegada ao mundo, com iluminação parcial e áudio; a cena ainda não é jogável e os relatos são autodeclarados.",
    "xlaunchvi": "A equipe relata a tela de carregamento; o portal registra 50% como estimativa editorial. O contexto do XLaunch Dashboard foi informado ao portal, mas não é confirmado pelo snapshot público.",
    "tuxbox": "Camada voltada a Linux/Proton. Registrou a tela de seleção de jogador em 4K, sem interação; o marco é um primeiro quadro, não um menu.",
    "leonida": "Projeto fora do ar desde 23/11: repositório removido, Discord indisponível e criador afastado. O último marco relatado foi o executável em execução, com quadros pretos.",
    "xbox2windows": "Pesquisa de recompilação estática. O README relata uma introdução e telas de configuração em um executável de diagnóstico modificado; o executável original e os menus continuam sem confirmação.",
    "five-star-recomp": "O README relata telas iniciais e de configuração respondendo a comandos simulados, mas sem captura pública; o carregamento da história para em memória corrompida.",
    "palmetto": "Continuação aberta da Leonida. Registra a execução do executável até uma interrupção na criação de recursos, sem exibir um quadro.",
    "percyscarlett": "Relata executar o código até uma sequência de quadros pretos antes de a GPU travar; ainda sem imagem utilizável.",
    "gta6-boottest": "Harness de depuração com DLLs substitutas; o projeto afirma chegar à interface, mas não publicou captura do resultado.",
}

PROJECT_TECHNICAL_PT = {
    "xcl": {
        "highlights": [
            "Vários testers relatam que o jogo chega ao mundo; o estado interno indica execução com pedestres e veículos carregados.",
            "Os menus rodam a 30 FPS e o vídeo de introdução é reproduzido antes do carregamento do mundo.",
            "O projeto converte os 26.698 programas RDNA2 do pacote de shaders para HLSL; amostras compilam para DXIL.",
        ],
        "blockers": [
            "No mundo, a imagem continua presa no indicador de carregamento; não há captura de gameplay.",
            "O watchdog da GPU encerra os testes entre 3 e 14 minutos, tanto em AMD quanto em NVIDIA.",
            "A compilação de pipelines atrasa no carregamento do mundo e as texturas BCPack ainda não são decodificadas.",
        ],
    },
    "marvis": {
        "highlights": [
            "O README relata telas iniciais, vídeo de introdução, tela de início e salvamentos a 30 FPS.",
            "No mundo, algumas luzes aparecem e a primeira cinemática reproduz áudio.",
            "O projeto relata chegar ao mundo em cerca de 50 segundos e renderizar o cartão da primeira missão.",
        ],
        "blockers": [
            "Grande parte da cena ainda não aparece, os quadros demoram segundos e GPUs podem travar.",
            "Teste realizado em um PC com Radeon RX 6700 XT; outras pessoas ainda não reproduziram o resultado.",
            "O código foi publicado poucas horas após a transmissão e ainda não foi revisado pela PortWatch.",
        ],
    },
    "xbox2windows": {
        "highlights": [
            "Uma gravação compartilhada pelo projeto mostra menus instáveis de GTA VI no PC.",
            "O executável principal chega à criação de pipelines D3D12 nos testes de diagnóstico do mantenedor.",
            "O projeto relata 851 de 12.101 shaders de pixel comparados com saídas de referência em RTX e WARP.",
        ],
        "blockers": [
            "A introdução e as telas de configuração vêm de um executável de diagnóstico modificado; o executável original não foi confirmado.",
            "Apenas 865 de 26.503 shaders têm saída verificada pelos testes do próprio projeto.",
            "Os testes cobrem cerca de um quarto dos formatos de instrução dos shaders.",
        ],
    },
    "tuxbox": {
        "highlights": [
            "GTA VI 1.0.2.1 exibe o seletor de jogador em 3840 × 2160 no Proton padrão, com registro da execução.",
            "The Matrix Awakens chegou à perseguição na estrada e à cidade aberta em testes Linux com ajustes reduzidos.",
            "Inclui um jogo de teste que usa as bibliotecas gráficas, de memória e de entrada do Xbox.",
        ],
        "blockers": [
            "Ainda não houve entrada de controle em GTA VI; a execução registrada termina após cerca de 97 segundos.",
            "Apenas 2.755 de 11.429 solicitações de shaders capturadas de GTA VI compilam até agora.",
            "O suporte a Windows continua em desenvolvimento e os resultados ainda não foram reproduzidos.",
        ],
    },
    "five-star-recomp": {
        "highlights": [
            "O README relata telas iniciais e de configuração respondendo a comandos simulados de controle a 30 FPS.",
            "O projeto identifica o executável e registra cada etapa de inicialização até começar o carregamento da história.",
            "O tradutor sinaliza instruções sem suporte como falhas, em vez de simular resultados.",
        ],
        "blockers": [
            "O carregamento da história para por causa de dados de memória corrompidos.",
            "A contagem de 25.908 programas de shader difere dos 26.503 registros relatados por outros projetos.",
            "Ainda não há captura ou gravação dos menus no repositório.",
        ],
    },
    "leonida": {
        "highlights": [
            "Antes de sair do ar, o executável de varejo rodou por até dez minutos sem travar em Windows e Wine.",
            "O jogo realizou chamadas de desenho e apresentou quadros à própria janela, ainda pretos.",
            "O projeto relatou traduzir os 26.503 shaders de GTA VI para SPIR-V e validar os resultados.",
        ],
        "blockers": [
            "Projeto fora do ar: repositório e Discord removidos, e o criador se afastou.",
            "O código sobrevive em forks de colaboradores e em um espelho congelado.",
            "O último estado relatado ainda apresentava quadros completamente pretos.",
        ],
    },
    "palmetto": {
        "highlights": [
            "Continuação aberta da Leonida que preserva o histórico e os créditos.",
            "Registra as etapas em que o executável de GTA VI passa durante a inicialização.",
        ],
        "blockers": [
            "Ainda não exibe um quadro: a inicialização para em um contêiner vazio da renderização do jogo.",
            "A contagem de shaders depende da validação SPIR-V, que não comprova que eles funcionam.",
            "Testado em apenas uma RTX 4090.",
        ],
    },
    "percyscarlett": {
        "highlights": [
            "O README relata um loop de quadros com chamadas de apresentação, mas a imagem permanece preta.",
        ],
        "blockers": [
            "A GPU trava poucos segundos após a inicialização; ainda não há imagem utilizável.",
            "A alegação de novo marco no README aguarda confirmação independente.",
        ],
    },
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

XLAUNCH_EDITORIAL_DEFAULTS = {
    "teams": {
        "xlaunchvi": {
            "pixKey": "galinhafritadubs@gmail.com",
            "kickUrl": "https://kick.com/myleouss",
            "discordUrl": "https://discord.gg/R5T6zeQuPY",
            "latestReport": {
                "reporter": "JPTuba",
                "date": "2026-11-24",
                "loggedAt": "2026-11-24T05:07:48.307Z",
                "reportedStage": "loading_screen",
                "estimatedPercent": 50,
                "pauseHours": "2–3",
                "aiUsageExhausted": True,
                "claudeRecharged": True,
                "objective": "Alcançar o carregamento do mundo e disputar/ultrapassar XCL e VIctory.",
                "dashboardFeatures": [
                    "Reconhecimento de jogos e mídia física",
                    "Detecção de build",
                    "Suporte a controles",
                    "Login e troca de perfil",
                    "Biblioteca de jogos",
                ],
                "source": "Relato atribuído a JPTuba no Discord; estimativa de 50% informada ao portal",
            },
            "repositoryCheck": {
                "checkedAt": "2026-11-24",
                "httpStatus": None,
                "missing": False,
                "authenticated": False,
            },
        }
    },
    "effortOverrides": {
        "xlaunchvi": {
            "percent": 50,
            "stage": "Tela de carregamento (estimativa editorial)",
            "basis": "team-report-estimate",
        }
    },
    "news": [],
}


def translated_xlaunch_report(source, editorial):
    source_teams = editorial.get("teams") if isinstance(editorial.get("teams"), dict) else {}
    team = source_teams.get("xlaunchvi") if isinstance(source_teams.get("xlaunchvi"), dict) else {}
    report = team.get("latestReport") if isinstance(team.get("latestReport"), dict) else None
    if not report:
        return None

    project = next((item for item in source.get("efforts", []) if item.get("id") == "xlaunchvi"), {})
    portwatch_percent = snapshot_percent(project)
    portwatch_milestone_percent = score_effort(project)["milestonePercent"]
    estimated_percent = report.get("estimatedPercent", 50)
    try:
        estimated_percent = round(max(0, min(100, float(estimated_percent))), 1)
    except (TypeError, ValueError):
        estimated_percent = 50
    translations = {
        "en": {
            "title": "XlaunchVI: 50% editorial estimate at the loading-screen milestone",
            "summary": "A report attributed to JPTuba on Discord places XlaunchVI at the loading screen. The team said work paused for about 2–3 hours after its AI usage ran out, then resumed after Claude was recharged. The portal now records 50% as an editorial estimate supplied for this update, not an official measurement or a GitHub milestone. The reported XLaunch Dashboard scope includes game and physical-media recognition, build detection, controller support, login/profile switching, and a game library. The team aims to reach world loading and catch or overtake XCL and VIctory, with support from the Brazilian community.",
            "teaser": "The portal lists 50% as an editorial estimate; the reported milestone is the loading screen.",
            "stage": "Loading screen · editorial estimate (~50%)",
            "transparency": "The 50% estimate was supplied for this portal update; it is not an official measurement. The loading-screen report is attributed to JPTuba on Discord, but the invite does not link to the original message. The public snapshot gives XlaunchVI 3.5% overall from technical groundwork, with no GTA VI milestone yet; Dashboard details have not been independently verified there.",
            "dashboardContext": "XLaunch Dashboard scope supplied to the portal: game and physical-media recognition, build detection, controller support, login/profile switching, and a game library. These details are not independently confirmed in the public GitHub snapshot.",
        },
        "es": {
            "title": "XlaunchVI: estimación editorial del 50% en la pantalla de carga",
            "summary": "Un relato atribuido a JPTuba en Discord sitúa a XlaunchVI en la pantalla de carga. El equipo dijo que el trabajo se pausó durante unas 2–3 horas al agotarse el uso de IA y se reanudó después de recargar Claude. El portal registra ahora un 50% como estimación editorial proporcionada para esta actualización; no es una medición oficial ni un hito de GitHub. El alcance informado de XLaunch Dashboard incluye reconocimiento de juegos y medios físicos, detección de versiones, compatibilidad con mandos, inicio de sesión/cambio de perfil y una biblioteca. El objetivo es llegar a la carga del mundo y alcanzar o superar a XCL y VIctory, con apoyo de la comunidad brasileña.",
            "teaser": "El portal registra un 50% como estimación editorial; el hito informado es la pantalla de carga.",
            "stage": "Pantalla de carga · estimación editorial (~50%)",
            "transparency": "La estimación del 50% se proporcionó para esta actualización del portal; no es una medición oficial. El informe sobre la pantalla de carga se atribuye a JPTuba en Discord, pero la invitación no enlaza al mensaje original. El snapshot público asigna a XlaunchVI un 3,5% global por el trabajo técnico previo, sin hitos de GTA VI; los detalles del Dashboard no se verificaron de forma independiente allí.",
            "dashboardContext": "Alcance de XLaunch Dashboard informado al portal: reconocimiento de juegos y medios físicos, detección de versiones, compatibilidad con mandos, inicio de sesión/cambio de perfil y biblioteca. Estos detalles no están confirmados de forma independiente en el snapshot público de GitHub.",
        },
        "zh": {
            "title": "XlaunchVI：加载画面阶段的编辑估算为 50%",
            "summary": "归于 JPTuba 在 Discord 发布的报告称，XlaunchVI 已到达加载画面。团队表示，AI 使用额度耗尽后暂停了约 2–3 小时，补充 Claude 额度后恢复开发。门户在本次更新中将 50% 记录为编辑估算；这不是官方测量，也不是 GitHub 里程碑。获提供的 XLaunch Dashboard 范围包括游戏与实体介质识别、版本检测、手柄支持、登录/切换档案及游戏库。团队目标是进入世界加载阶段并追赶或超过 XCL 和 VIctory，同时获得巴西社区支持。",
            "teaser": "门户记录的 50% 是编辑估算；报告的里程碑为加载画面。",
            "stage": "加载画面 · 编辑估算（约 50%）",
            "transparency": "50% 估算是为本次门户更新提供的信息，并非官方测量。加载画面的报告归于 JPTuba 在 Discord 发布，但邀请链接未指向原始消息。公开快照根据技术准备工作将 XlaunchVI 的整体进度记为 3.5%，尚无 GTA VI 里程碑；Dashboard 详情未在该快照中得到独立验证。",
            "dashboardContext": "提供给门户的 XLaunch Dashboard 范围：游戏与实体介质识别、版本检测、手柄支持、登录/切换档案及游戏库。这些详情未在公开 GitHub 快照中得到独立确认。",
        },
    }
    return {
        "id": "xlaunchvi-loading-screen-team-report",
        "reporter": str(report.get("reporter") or "JPTuba"),
        "date": str(report.get("date") or ""),
        "loggedAt": str(report.get("loggedAt") or ""),
        "stage": f"Tela de carregamento · estimativa editorial (~{estimated_percent:g}%)",
        "estimatedPercent": estimated_percent,
        "portwatchPercent": portwatch_percent,
        "portwatchMilestonePercent": portwatch_milestone_percent,
        "title": f"XlaunchVI: estimativa editorial de {estimated_percent:g}% na tela de carregamento",
        "summary": f"Relato atribuído a JPTuba no Discord situa o XlaunchVI na tela de carregamento. A equipe informou uma pausa de cerca de 2–3 horas após esgotar o uso de IA e a retomada depois de recarregar o Claude. O portal registra agora {estimated_percent:g}% como estimativa editorial informada para esta atualização; não é medição oficial nem marco publicado no GitHub. O escopo informado do XLaunch Dashboard inclui reconhecimento de jogos e mídia física, detecção de build, suporte a controles, login/troca de perfil e biblioteca. A equipe busca chegar ao carregamento do mundo e alcançar ou ultrapassar XCL e VIctory, com apoio da comunidade brasileira.",
        "teaser": f"O portal registra {estimated_percent:g}% como estimativa editorial; o marco relatado é a tela de carregamento.",
        "transparency": f"Os {estimated_percent:g}% foram informados como estimativa editorial para esta atualização, não como medição oficial. O relato da tela de carregamento é atribuído a JPTuba no Discord, mas o convite não aponta para a mensagem original. O snapshot público PortWatch/GitHub calcula {portwatch_percent:g}% de progresso geral a partir da preparação técnica e registra {portwatch_milestone_percent:g}% em marcos de GTA VI; os detalhes do Dashboard não foram verificados de forma independente nesse snapshot.",
        "dashboardContext": "Escopo do XLaunch Dashboard informado ao portal: reconhecimento de jogos e mídia física, detecção de build, suporte a controles, login/troca de perfil e biblioteca. Esses detalhes não estão confirmados de forma independente no snapshot público do GitHub.",
        "dashboardFeatures": report.get("dashboardFeatures", []),
        "translations": translations,
        "sources": [
            {
                "outlet": "Discord do XlaunchVI",
                "title": "Convite do servidor; não direciona à mensagem original",
                "url": str(team.get("discordUrl") or ""),
            },
            {
                "outlet": "Repositório GitHub",
                "title": "O snapshot consultado ainda não registra este marco",
                "url": "https://github.com/JPTuba9/xlaunch-vi",
            },
        ],
    }


def translated_news(source, editorial):
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
    team_report = translated_xlaunch_report(source, editorial)
    if team_report:
        team_story = {
            **team_report,
            "category": "Relato da equipe",
        }
        lead_index = next(
            (index for index, story in enumerate(stories) if story["id"] == "2026-11-23-leonida-nuked"),
            -1,
        )
        stories.insert(lead_index + 1 if lead_index >= 0 else 0, team_story)
    for story in editorial.get("news", []):
        if not isinstance(story, dict) or not story.get("id") or not story.get("title") or not story.get("summary"):
            continue
        if any(existing["id"] == story["id"] for existing in stories):
            continue
        stories.append({
            "id": str(story["id"]),
            "date": str(story.get("date") or ""),
            "category": str(story.get("category") or "Atualização editorial"),
            "title": str(story["title"]),
            "summary": str(story["summary"]),
            "sources": [
                source_item for source_item in story.get("sources", [])
                if isinstance(source_item, dict)
                and str(source_item.get("url") or "").startswith(("https://", "http://"))
            ],
            **({"translations": story["translations"]} if isinstance(story.get("translations"), dict) else {}),
        })
    stories.sort(key=lambda story: story.get("date", ""), reverse=True)
    return stories


def translated_change_summary(item):
    text = str(item.get("text") or "")
    if text.startswith("Five Star Recomp gets half credit"):
        return "Five Star Recomp avançou de 40% para 47,5% após relatar telas iniciais e de configuração com comandos simulados. Ainda sem captura; o carregamento da história não foi concluído."
    if text.startswith("VIctory moves most of the way"):
        return "VIctory avançou para 67%, após relatar iluminação parcial e áudio no mundo do jogo. É o maior percentual do snapshot, mas segue autodeclarado."
    if text.startswith("Five Star Recomp reports"):
        return "Five Star Recomp relata executar o executável e exibir o vídeo de introdução; a captura ainda não foi publicada. Progresso indicado: 40%."
    if text.startswith("Palmetto, the open continuation"):
        return "Palmetto, continuação aberta da Leonida, entrou na lista de observação; registra execução do executável sem quadro visível. Dezesseis cópias foram separadas para revisão."
    if text.startswith("XCL gets half credit"):
        return "XCL avançou para 62,5% após relatos de testers que carregaram o mundo; a tela segue no indicador de carregamento e o watchdog encerra os testes."
    if text.startswith("Scarlett Windows Compat moved to "):
        repository = text.removeprefix("Scarlett Windows Compat moved to ").rstrip(".")
        return f"Scarlett Windows Compat atualizou o repositório para {repository}."
    if text.startswith("PercyScarlett's README"):
        return "O README do PercyScarlett pode alegar um novo marco de inicialização: loop de quadros com imagem preta, seguido por travamento da GPU. Alegação sem confirmação independente."
    kind = item.get("kind")
    if kind == "up":
        return "Atualização de progresso registrada no tracker; o resultado é autodeclarado e aguarda confirmação independente."
    if kind == "claim":
        return "Nova alegação registrada pelo tracker; ainda sem confirmação independente."
    if kind == "flag":
        return "Novo alerta sinalizado pelo tracker e encaminhado para triagem."
    return "Novo candidato ou atividade registrada para triagem; ainda sem confirmação."


def translated_scout_summary(scout):
    raw_summary = str(scout.get("lastSummary") or "")
    match = re.search(
        r"(\d+)\s+refreshed,\s*(\d+)\s+READMEs? changed,\s*(\d+)\s+new candidates,\s*(\d+)\s+flagged",
        raw_summary,
        re.IGNORECASE,
    )
    if not match:
        return "Resumo da última varredura não disponível no snapshot."
    refreshed, readmes, candidates, flagged = match.groups()
    return (
        f"Última varredura: {refreshed} repositórios atualizados, {readmes} READMEs alterados, "
        f"{candidates} candidatos novos e {flagged} itens sinalizados."
    )


def translated_ignored_summary(ignored):
    categories = {
        "clones": 0,
        "foraDoEscopo": 0,
        "semReadme": 0,
        "poucoConteudo": 0,
        "outros": 0,
    }
    for item in ignored:
        reason = str(item.get("reason") or "").lower()
        if any(token in reason for token in ("copy", "fork", "re-upload", "reupload", "clone")):
            categories["clones"] += 1
        elif "off-topic" in reason or "off topic" in reason or "out of scope" in reason:
            categories["foraDoEscopo"] += 1
        elif "readme" in reason:
            categories["semReadme"] += 1
        elif reason.startswith("thin"):
            categories["poucoConteudo"] += 1
        else:
            categories["outros"] += 1
    return categories


def translated_history(history, efforts):
    names = {item["id"]: item.get("name", item["id"]) for item in efforts}
    furthest_labels = {
        "groundwork": "Preparação",
        "loads": "Executável em execução",
        "boots": "Primeiro quadro",
        "menu": "Menu principal",
        "ingame": "Dentro do jogo",
        "fps30": "30 FPS",
        "stable": "Estável",
    }
    rows = []
    for item in history:
        try:
            leader_score = float(item.get("leader"))
            top3_score = float(item.get("top3"))
            if not math.isfinite(leader_score) or not math.isfinite(top3_score):
                continue
        except (TypeError, ValueError):
            continue
        rows.append({
            "date": str(item.get("date") or ""),
            "leaderId": str(item.get("leaderId") or ""),
            "leaderName": names.get(item.get("leaderId"), str(item.get("leaderId") or "Líder não identificado")),
            "leader": round(leader_score, 1),
            "top3": round(top3_score, 1),
            "furthest": furthest_labels.get(item.get("furthest"), "Marco não identificado"),
            "tracked": int(item.get("tracked") or 0),
        })
    return rows


def clamp_fraction(value):
    try:
        fraction = float(value)
    except (TypeError, ValueError):
        return 0
    return min(1, max(0, fraction)) if math.isfinite(fraction) else 0


def score_effort(effort):
    groundwork = effort.get("groundwork") if isinstance(effort.get("groundwork"), dict) else {}
    gta = effort.get("gta") if isinstance(effort.get("gta"), dict) else {}
    weights = {"loader": 0.2, "shaders": 0.28, "graphics": 0.32, "proven": 0.2}
    groundwork_fraction = sum(weight * clamp_fraction(groundwork.get(key)) for key, weight in weights.items())
    score = 25 * groundwork_fraction
    reached = "groundwork"
    previous_tick = score
    ticks = {"loads": 25, "boots": 40, "menu": 55, "ingame": 70}
    for key, tick in ticks.items():
        value = clamp_fraction(gta.get(key))
        if value >= 1:
            score = tick
            previous_tick = tick
            reached = key
            continue
        if value > 0:
            score = max(score, previous_tick + value * (tick - previous_tick))
            break

    milestone_percent = max(0, score - 25 * groundwork_fraction)
    if reached == "ingame":
        fps_fraction = clamp_fraction((float(gta.get("fps") or 0) if math.isfinite(float(gta.get("fps") or 0)) else 0) / 30)
        stability = {
            "unknown": 0,
            "constant": 0,
            "often": 0.25,
            "sometimes": 0.55,
            "rarely": 0.8,
            "stable": 1,
        }.get(gta.get("stability"), 0)
        score = 70 + fps_fraction * 15 + stability * 15
        milestone_percent = score
        if fps_fraction >= 1:
            reached = "fps30"
        if fps_fraction >= 1 and stability >= 1:
            reached = "stable"

    return {
        "score": round(score, 1),
        "groundworkFraction": round(groundwork_fraction, 4),
        "milestonePercent": round(milestone_percent, 1),
        "reached": reached,
    }


def snapshot_percent(effort):
    return score_effort(effort)["score"]


def translated_efforts(source, editorial):
    overrides = {}
    stage_overrides = {
        "xcl": "Carregamento do mundo (relato)",
        "marvis": "Dentro do mundo (relato)",
        "xbox2windows": "Menus parciais (relato)",
        "five-star-recomp": "Menu principal parcial (relato)",
    }
    editorial_overrides = editorial.get("effortOverrides") if isinstance(editorial.get("effortOverrides"), dict) else {}
    for project_id, override in editorial_overrides.items():
        if not isinstance(override, dict):
            continue
        if override.get("percent") is not None:
            overrides[project_id] = override["percent"]
        if override.get("stage"):
            stage_overrides[project_id] = str(override["stage"])
    milestones = [
        ("stable", "Estável"),
        ("fps30", "30 FPS"),
        ("ingame", "Dentro do jogo"),
        ("menu", "Menu principal"),
        ("boots", "Primeiro quadro"),
        ("loads", "Executável em execução"),
        ("groundwork", "Preparação"),
    ]
    projects = []
    for item in source["efforts"]:
        gta = item.get("gta") or {}
        score = score_effort(item)
        source_percent = score["score"]
        percent = overrides.get(item["id"])
        if percent is None:
            percent = source_percent
        percent = round(float(percent), 1)
        stage = stage_overrides.get(item["id"]) or dict(milestones).get(score["reached"], "Preparação")
        status = "offline" if item.get("nuked") else "acompanhado"
        summary = PROJECT_SUMMARIES_PT.get(
            item["id"],
            "Em acompanhamento; o tracker ainda não registra um marco de GTA VI confirmado para este projeto."
            if score["milestonePercent"] == 0 else
            "O tracker registra atividade de inicialização, mas o resultado é autodeclarado e ainda não foi verificado de forma independente.",
        )
        stats = item.get("stats") or {}
        groundwork = item.get("groundwork") if isinstance(item.get("groundwork"), dict) else {}
        gta_milestones = {
            key: clamp_fraction(gta.get(key))
            for key in ("loads", "boots", "menu", "ingame")
        }
        gta_milestones.update({
            "fps": gta.get("fps", 0),
            "stability": str(gta.get("stability") or "unknown"),
        })
        groundwork_fields = [
            ("loader", "Carregador PE e bibliotecas"),
            ("shaders", "Tradutor de shaders"),
            ("graphics", "Backend gráfico D3D12"),
            ("proven", "Execução comprovada"),
        ]
        technical = PROJECT_TECHNICAL_PT.get(item["id"], {})
        technical_details = {
            "approach": item.get("approach", ""),
            "target": item.get("target", ""),
            "highlights": technical.get("highlights", []),
            "blockers": technical.get("blockers", []),
            "groundwork": [
                {
                    "label": label,
                    "percent": normalized_groundwork_percent(groundwork.get(field, 0)),
                }
                for field, label in groundwork_fields
            ],
            "groundworkNote": "Indicadores técnicos do snapshot; não representam progresso de GTA VI.",
        }
        project = {
            "id": item["id"],
            "name": item["name"],
            "repo": item.get("repo", ""),
            "url": f"https://github.com/{item['repo']}" if item.get("repo") else "",
            "tier": item.get("tier", "watchlist"),
            "status": status,
            "nuked": item.get("nuked"),
            "percent": percent,
            "portwatchPercent": source_percent,
            "portwatchMilestonePercent": score["milestonePercent"],
            "groundworkFraction": score["groundworkFraction"],
            "reached": score["reached"],
            "stage": stage,
            "summary": summary,
            "verification": (
                "Estimativa editorial baseada em relato; não é medição oficial nem marco confirmado no GitHub."
                if item["id"] == "xlaunchvi"
                else "Relato dos próprios projetos; não equivale a reprodução independente."
            ),
            "stars": stats.get("stars"),
            "forks": stats.get("forks"),
            "lastRepositoryUpdate": stats.get("pushedAt"),
            "repositoryMissing": stats.get("missing") is True,
            "repositoryHttpStatus": stats.get("missingStatus") if stats.get("missing") is True else None,
            "repositoryAssessedAt": item.get("assessedAt"),
            "provenOn": item.get("provenOn"),
            "gtaMilestones": gta_milestones,
            "technicalDetails": technical_details,
        }
        if item["id"] == "xlaunchvi":
            project["teamReport"] = translated_xlaunch_report(source, editorial)
            project["progressBasis"] = "team-report-estimate"
        projects.append(project)
    return projects


def build_tracker(source, editorial):
    headline_translations = HEADLINES_PT
    source_titles = {item["title"] for item in source["headlines"]}
    if source_titles != set(headline_translations):
        raise ValueError("HEADLINES_PT precisa conter exatamente os títulos de headlines do tracker.json.")

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
            "membersCount": len(item.get("members") or []),
        })

    source_changes = source.get("changes", [])
    significant_changes = []
    for item in source_changes:
        text = str(item.get("text") or "")
        if not text.startswith("Scout spotted "):
            significant_changes.append(item)
    recent_changes = [
        {
            "date": item["date"],
            "kind": {"up": "progresso", "new": "novo", "flag": "alerta", "claim": "alegação"}.get(item.get("kind"), "atualização"),
            "summary": translated_change_summary(item),
        }
        for item in significant_changes[-5:]
    ]
    latest_scout_changes = []
    for item in reversed(source_changes):
        if not str(item.get("text") or "").startswith("Scout spotted "):
            break
        latest_scout_changes.append(item)
    latest_scout_changes.reverse()
    if latest_scout_changes:
        candidate_names = []
        for item in latest_scout_changes:
            match = re.match(r"Scout spotted (.+?) \(possible effort,", str(item.get("text") or ""))
            if match:
                candidate_names.append(match.group(1))
        examples = ", ".join(candidate_names[:4])
        recent_changes.append({
            "date": latest_scout_changes[-1].get("date", ""),
            "kind": "novo",
            "summary": (
                f"O scout sinalizou {len(latest_scout_changes)} candidatos a possíveis esforços; todos aguardam confirmação."
                + (f" Exemplos: {examples}." if examples else "")
            ),
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
    source_teams = editorial.get("teams") if isinstance(editorial.get("teams"), dict) else {}
    xlaunch_team = source_teams.get("xlaunchvi") if isinstance(source_teams.get("xlaunchvi"), dict) else {}
    xlaunch_source = next((item for item in source.get("efforts", []) if item.get("id") == "xlaunchvi"), {})
    xlaunch_stats = xlaunch_source.get("stats") or {}
    repository_missing = xlaunch_stats.get("missing") is True
    team_report = translated_xlaunch_report(source, editorial)
    candidates = [
        {
            "repo": str(item.get("repo") or ""),
            "name": str(item.get("name") or item.get("repo") or ""),
            "status": str(item.get("status") or "new"),
            "kind": str(item.get("kind") or "effort"),
        }
        for item in source.get("candidates", [])
        if isinstance(item, dict) and (item.get("repo") or item.get("name"))
    ]
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
        "lastSyncedAt": str(source.get("lastSyncedAt") or (team_report or {}).get("loggedAt") or ""),
        "sourceFile": "data/tracker.json",
        "teams": {
            "xlaunchvi": {
                "pixKey": str(xlaunch_team.get("pixKey") or "").strip(),
                "kickUrl": str(xlaunch_team.get("kickUrl") or "").strip(),
                "discordUrl": str(xlaunch_team.get("discordUrl") or "").strip(),
                "latestReport": team_report,
                "repositoryCheck": {
                    "checkedAt": str(xlaunch_source.get("assessedAt") or ""),
                    "httpStatus": xlaunch_stats.get("missingStatus") if repository_missing else None,
                    "missing": repository_missing,
                    "authenticated": False,
                },
            }
        },
        "news": translated_news(source, editorial),
        "efforts": translated_efforts(source, editorial),
        "editorial": editorial,
        "tools": tools,
        "candidates": len(candidates),
        "candidateList": candidates,
        "flagged": flagged,
        "ignored": {
            "count": len(source.get("ignored", [])),
            "summary": "Itens fora do escopo, cópias, páginas sem código funcional e projetos ainda sem evidência suficiente.",
            "categories": translated_ignored_summary(source.get("ignored", [])),
        },
        "history": translated_history(source.get("history", []), source.get("efforts", [])),
        "changes": recent_changes,
        "scout": {
            "since": scout.get("since", ""),
            "lastRun": scout.get("lastRun", ""),
            "summary": translated_scout_summary(scout),
            "sources": ["GitHub", "Reddit", "Hacker News", "X"],
            "watchNames": scout.get("watchNames", []),
        },
        "headlines": headlines,
        "dmca": dmca,
        "exe": {
            "status": "Relato de publicação; autenticidade não confirmada",
            "expected": source["exe"].get("expected", ""),
            "expectedAt": source["exe"].get("expectedAt", ""),
            "timeAnnounced": bool(source["exe"].get("timeAnnounced")),
            "releasedAt": source["exe"].get("releasedAt", ""),
            "by": source["exe"].get("by", ""),
            "summary": "O tracker registra que Cyberleek anunciou a publicação do executável em 23/11, antes do prazo que havia divulgado. Veículos noticiaram o anúncio, mas nenhum confirmou a autenticidade do arquivo, e a Rockstar não confirmou o vazamento.",
            "note": "Vários projetos relatam executar código do jogo; dois dizem ter chegado aos menus. Isso não autentica o arquivo nem confirma uma versão para PC.",
            "source": source["exe"].get("source", ""),
            "safety": "Não baixe nem execute arquivos divulgados por desconhecidos. Instaladores falsos podem roubar senhas ou instalar malware. O KynosRecompVI não hospeda nem distribui executáveis.",
        },
    }


def merge_editorial_defaults(defaults, overrides):
    if not isinstance(overrides, dict):
        return json.loads(json.dumps(defaults, ensure_ascii=False))
    merged = dict(defaults)
    for key, value in overrides.items():
        if isinstance(value, dict) and isinstance(defaults.get(key), dict):
            merged[key] = merge_editorial_defaults(defaults[key], value)
        else:
            merged[key] = value
    return merged


def main():
    source_path = DATA / "tracker.json"
    source = json.loads(source_path.read_text(encoding="utf-8"))
    localized_path = DATA / "tracker-pt-BR.json"
    previous_localized = {}
    if localized_path.exists():
        previous_localized = json.loads(localized_path.read_text(encoding="utf-8"))
    editorial = merge_editorial_defaults(
        XLAUNCH_EDITORIAL_DEFAULTS,
        previous_localized.get("editorial", {}),
    )
    localized = build_tracker(source, editorial)
    localized_path.write_text(json.dumps(localized, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    fallback = {
        "hardware": json.loads((DATA / "hardware.json").read_text(encoding="utf-8")),
        "discords": json.loads((DATA / "discords.json").read_text(encoding="utf-8")),
        "tracker": localized,
        "portwatch": {
            "updated": source.get("updated", ""),
            "lastSyncedAt": source.get("lastSyncedAt", ""),
            "sourceFile": "data/tracker.json",
        },
    }
    fallback_path = DATA / "file-fallback.js"
    fallback_path.write_text(
        "window.KynosFileData = " + json.dumps(fallback, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"Gerados {localized_path.relative_to(ROOT)} e {fallback_path.relative_to(ROOT)}.")


if __name__ == "__main__":
    main()
