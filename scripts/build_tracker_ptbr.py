import json
import math
import re
import argparse
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
    "2026-11-24-new-progress-scale": (
        "Kynos RecompVI muda a escala: ser jogável vale metade; concluir o jogo, 100%",
        "Tracker",
        "A nova escala separa chegar ao jogo de conseguir jogá-lo bem. A preparação técnica vale até 10%; executável, primeiro quadro, menus, mundo e personagem jogável marcam 10%, 20%, 30%, 40% e 50%. Depois, história, renderização, desempenho e estabilidade completam os outros 50%.",
    ),
    "2026-11-24-omonkey-shaders-prison": (
        "omonkey carrega shaders de GTA VI e movimenta personagem na cena da prisão",
        "Progresso",
        "O snapshot registra omonkey em 76%, no marco Dentro do jogo: os shaders começaram a carregar e o personagem se move lentamente pela cena inicial da prisão, a cerca de 5 FPS. O desenvolvimento foi transmitido ao vivo no canal Swaggely, mas não há código público nem build para testes externos.",
    ),
    "2026-11-24-cgbj-in-game": (
        "CGBJ chega a 75%: cut-scenes a 4 FPS e cenas ainda sem iluminação",
        "Progresso",
        "O tracker registra o CGBJ em 75%, no marco Dentro do jogo · cut-scenes a 4 FPS. Na build privada, o personagem se move com controle, anda pelo mapa, conversa com NPCs e abre menus. O vídeo mostra cenas em cores chapadas e sem iluminação; o resultado não pode ser reproduzido externamente porque o código não é público.",
    ),
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
    "xlaunchvi": "Os menus abrem a 30 FPS, ainda sem texturas. A equipe foca em otimizar memória e shaders; 55% é uma estimativa editorial local, não uma medição oficial.",
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
                "reportedStage": "menu_30fps_no_textures",
                "estimatedPercent": 55,
                "pauseHours": "2–3",
                "aiUsageExhausted": True,
                "claudeRecharged": True,
                "objective": "Otimizar memória e shaders sem textura até os menus ganharem texturas e o jogo ficar quase jogável.",
                "dashboardFeatures": [
                    "Reconhecimento de jogos e mídia física",
                    "Detecção de build",
                    "Suporte a controles",
                    "Login e troca de perfil",
                    "Biblioteca de jogos",
                ],
                "source": "Relato atribuído à equipe; estimativa editorial local de 55%",
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
            "percent": 55,
            "stage": "Menu principal a 30 FPS (sem texturas)",
            "basis": "team-report-estimate",
        },
        "cgbj": {
            "percent": 75,
            "stage": "Dentro do jogo · cut-scenes a 4 FPS",
            "basis": "manual-local-report",
        }
    },
    "manualEfforts": [],
    "news": [],
}


def translated_xlaunch_report(source, editorial, preserved_report=None):
    source_teams = editorial.get("teams") if isinstance(editorial.get("teams"), dict) else {}
    team = source_teams.get("xlaunchvi") if isinstance(source_teams.get("xlaunchvi"), dict) else {}
    report = team.get("latestReport") if isinstance(team.get("latestReport"), dict) else None
    if not report:
        return None

    project = next((item for item in source.get("efforts", []) if item.get("id") == "xlaunchvi"), {})
    portwatch_percent = snapshot_percent(project)
    portwatch_milestone_percent = score_effort(project)["milestonePercent"]
    local_report = preserved_report or team.get("localReport")
    if isinstance(local_report, dict):
        return {
            **local_report,
            "portwatchPercent": portwatch_percent,
            "portwatchMilestonePercent": portwatch_milestone_percent,
        }
    estimated_percent = report.get("estimatedPercent", 55)
    try:
        estimated_percent = round(max(0, min(100, float(estimated_percent))), 1)
    except (TypeError, ValueError):
        estimated_percent = 55
    reported_stage = str(report.get("reportedStage") or "")
    stage_label = {
        "menu_30fps_no_textures": "Menu principal a 30 FPS · sem texturas",
        "loading_screen": "Tela de carregamento",
    }.get(reported_stage, "Progresso informado pela equipe")
    translations = {
        "en": {
            "title": f"XlaunchVI: {estimated_percent:g}% estimate, menus at 30 FPS without textures",
            "summary": f"The team reports that XlaunchVI menus now run at 30 FPS without textures. The next focus is memory and shader optimization. The {estimated_percent:g}% figure is a local editorial estimate, not an official measurement or a GitHub milestone; no public release is available.",
            "teaser": f"{estimated_percent:g}% editorial estimate · menus at 30 FPS without textures · next: memory and shaders.",
            "stage": f"Main menu at 30 FPS · no textures · editorial estimate (~{estimated_percent:g}%)",
            "transparency": f"The {estimated_percent:g}% figure is a local editorial estimate, not an official measurement. Team reports describe menus at 30 FPS without textures and a focus on memory and shaders. The public snapshot calculates {portwatch_percent:g}% overall from technical groundwork and records {portwatch_milestone_percent:g}% in GTA VI milestones.",
            "dashboardContext": "XLaunch Dashboard scope supplied to the portal: game and physical-media recognition, build detection, controller support, login/profile switching, and a game library. These details are not independently confirmed in the public GitHub snapshot.",
        },
        "es": {
            "title": f"XlaunchVI: estimación del {estimated_percent:g}%, menús a 30 FPS sin texturas",
            "summary": f"El equipo informa que los menús de XlaunchVI ya funcionan a 30 FPS sin texturas. El siguiente foco es optimizar memoria y shaders. El {estimated_percent:g}% es una estimación editorial local, no una medición oficial ni un hito de GitHub; no hay una versión pública disponible.",
            "teaser": f"{estimated_percent:g}% estimado · menús a 30 FPS sin texturas · próximo paso: memoria y shaders.",
            "stage": f"Menú principal a 30 FPS · sin texturas · estimación editorial (~{estimated_percent:g}%)",
            "transparency": f"El {estimated_percent:g}% es una estimación editorial local, no una medición oficial. El equipo informa menús a 30 FPS sin texturas y un foco en memoria y shaders. El snapshot público calcula {portwatch_percent:g}% global por preparación técnica y registra {portwatch_milestone_percent:g}% en hitos de GTA VI.",
            "dashboardContext": "Alcance de XLaunch Dashboard informado al portal: reconocimiento de juegos y medios físicos, detección de versiones, compatibilidad con mandos, inicio de sesión/cambio de perfil y biblioteca. Estos detalles no están confirmados de forma independiente en el snapshot público de GitHub.",
        },
        "zh": {
            "title": f"XlaunchVI：估算进度 {estimated_percent:g}%，菜单以 30 FPS 运行且无贴图",
            "summary": f"团队称 XlaunchVI 菜单现可在无贴图时以 30 FPS 运行，下一阶段将优化内存和着色器。{estimated_percent:g}% 是本地编辑估算，并非官方测量或 GitHub 里程碑；目前没有公开版本。",
            "teaser": f"编辑估算 {estimated_percent:g}% · 菜单 30 FPS 无贴图 · 下一步：内存与着色器。",
            "stage": f"主菜单 30 FPS · 无贴图 · 编辑估算（约 {estimated_percent:g}%）",
            "transparency": f"{estimated_percent:g}% 是本地编辑估算，并非官方测量。团队报告菜单以 30 FPS 运行且无贴图，当前重点为内存和着色器。公开快照根据技术准备工作计算总体进度 {portwatch_percent:g}%，GTA VI 里程碑为 {portwatch_milestone_percent:g}%。",
            "dashboardContext": "提供给门户的 XLaunch Dashboard 范围：游戏与实体介质识别、版本检测、手柄支持、登录/切换档案及游戏库。这些详情未在公开 GitHub 快照中得到独立确认。",
        },
    }
    return {
        "id": "xlaunchvi-loading-screen-team-report",
        "reporter": str(report.get("reporter") or "JPTuba"),
        "date": str(report.get("date") or ""),
        "loggedAt": str(report.get("loggedAt") or ""),
        "stage": f"{stage_label} · estimativa editorial (~{estimated_percent:g}%)",
        "estimatedPercent": estimated_percent,
        "portwatchPercent": portwatch_percent,
        "portwatchMilestonePercent": portwatch_milestone_percent,
        "title": f"XlaunchVI: estimativa editorial de {estimated_percent:g}%, menus a 30 FPS sem texturas",
        "summary": "Relatos da equipe indicam que os menus do XlaunchVI agora abrem cravados em 30 FPS, ainda sem texturas. A estabilidade está mais forte segundo Nesko. O próximo foco é otimizar o uso de memória e as shaders sem textura. O projeto já abriu The Matrix Awakens e busca executar outros jogos de Xbox; não há release pública para baixar.",
        "teaser": f"{estimated_percent:g}% · menus a 30 FPS sem texturas · próximo passo: memória e shaders.",
        "transparency": f"Os {estimated_percent:g}% são uma estimativa editorial local, não uma medição oficial. Relatos atribuídos à equipe descrevem menus a 30 FPS sem texturas e foco em memória/shaders; não há confirmação pública independente nem release disponível. O snapshot público calcula {portwatch_percent:g}% de progresso geral a partir da preparação técnica e registra {portwatch_milestone_percent:g}% em marcos de GTA VI.",
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


def translated_news(source, editorial, preserved_news=None, preserved_report=None):
    stories = []
    for item in source["news"]:
        title, category, summary = NEWS_PT.get(item["id"], (
            item.get("title") or "Atualização do tracker",
            item.get("category") or "Atualização",
            item.get("dek") or item.get("summary") or "Nova atualização registrada pelo tracker.",
        ))
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
    team_report = translated_xlaunch_report(source, editorial, preserved_report)
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
    editorial_news = list(preserved_news or []) + list(editorial.get("news", []))
    for story in editorial_news:
        if not isinstance(story, dict) or not story.get("id") or not story.get("title") or not story.get("summary"):
            continue
        matching = next((index for index, existing in enumerate(stories) if existing["id"] == story["id"]), None)
        preserved = {
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
        }
        for field in ("body", "image", "teaser", "transparency"):
            if field in story:
                preserved[field] = story[field]
        if isinstance(story.get("translations"), dict):
            preserved["translations"] = story["translations"]
        if matching is not None:
            stories[matching] = {**stories[matching], **preserved}
            continue
        stories.append(preserved)
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
        "world": "Dentro do mundo",
        "playable": "Jogável",
        "complete": "Jogo completo",
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
    gta = dict(effort.get("gta")) if isinstance(effort.get("gta"), dict) else {}
    if gta.get("ingame") is not None:
        if gta.get("world") is None:
            gta["world"] = gta["ingame"]
    weights = {"loader": 0.2, "shaders": 0.28, "graphics": 0.32, "proven": 0.2}
    groundwork_fraction = sum(weight * clamp_fraction(groundwork.get(key)) for key, weight in weights.items())
    score = 10 * groundwork_fraction
    reached = "groundwork"
    previous_tick = score
    ticks = {"loads": 10, "boots": 20, "menu": 30, "world": 40, "playable": 50}
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

    milestone_percent = ticks.get(reached, 0)
    if reached == "playable":
        fps = float(gta.get("fps") or 0)
        fps_fraction = clamp_fraction(fps / 30 if math.isfinite(fps) else 0)
        stability = {
            "unknown": 0,
            "constant": 0,
            "often": 0.25,
            "sometimes": 0.55,
            "rarely": 0.8,
            "stable": 1,
        }.get(gta.get("stability"), 0)
        quality = (
            0.35 * clamp_fraction(gta.get("story"))
            + 0.25 * clamp_fraction(gta.get("render"))
            + 0.2 * fps_fraction
            + 0.2 * stability
        )
        score = 50 + quality * 50
        if quality >= 1:
            reached = "complete"
            milestone_percent = 100

    manual_score = effort.get("manualScore")
    if isinstance(manual_score, (int, float)) and math.isfinite(manual_score):
        score = max(0, min(100, manual_score))

    return {
        "score": round(score * 10) / 10,
        "groundworkFraction": round(groundwork_fraction, 4),
        "milestonePercent": round(milestone_percent, 1),
        "reached": reached,
    }


def snapshot_percent(effort):
    return score_effort(effort)["score"]


def translated_efforts(source, editorial, preserved_report=None):
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
        if override.get("stage"):
            stage_overrides[project_id] = str(override["stage"])
    milestones = [
        ("complete", "Jogo completo"),
        ("playable", "Jogável"),
        ("world", "Dentro do mundo"),
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
        override = editorial_overrides.get(item["id"], {})
        manual_score = override.get("percent") if isinstance(override, dict) else None
        if manual_score is None:
            manual_score = item.get("manualScore")
        percent = round(float(manual_score if manual_score is not None else source_percent), 1)
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
            for key in ("loads", "boots", "menu", "world", "playable", "ingame")
        }
        if gta.get("ingame") is not None:
            if gta.get("world") is None:
                gta_milestones["world"] = clamp_fraction(gta.get("ingame"))
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
            **({"manualScore": round(float(manual_score), 1)} if manual_score is not None else {}),
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
            "gta": dict(gta),
            "groundwork": dict(groundwork),
            "technicalDetails": technical_details,
        }
        if item["id"] == "xlaunchvi":
            project["teamReport"] = translated_xlaunch_report(source, editorial, preserved_report)
            project["progressBasis"] = "team-report-estimate"
        projects.append(project)
    existing_ids = {project["id"] for project in projects}
    for item in editorial.get("manualEfforts", []):
        if not isinstance(item, dict) or not item.get("id") or item["id"] in existing_ids:
            continue
        project = dict(item)
        override = editorial_overrides.get(project["id"], {})
        manual_score = override.get("percent") if isinstance(override, dict) else project.get("manualScore")
        if manual_score is not None:
            project["percent"] = round(float(manual_score), 1)
            project["manualScore"] = round(float(manual_score), 1)
        if isinstance(override, dict) and override.get("stage"):
            project["stage"] = str(override["stage"])
        projects.append(project)
        existing_ids.add(project["id"])
    return projects


def build_tracker(source, editorial, preserved_news=None, preserved_report=None):
    tools = []
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
            "description": TOOL_DESCRIPTIONS_PT.get(item["name"], item.get("description") or "Ferramenta registrada pelo tracker."),
            "stars": (item.get("stats") or {}).get("stars"),
        })

    flagged = []
    for item in source["flagged"]:
        title, summary = FLAGGED_PT.get(item["id"], (
            item.get("title") or "Item sinalizado pelo tracker",
            item.get("summary") or "Confira a fonte original e os dados atuais do tracker.",
        ))
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
            "sourceText": str(item.get("text") or ""),
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
            "title": HEADLINES_PT.get(item["title"], item["title"]),
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
    team_report = translated_xlaunch_report(source, editorial, preserved_report)
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
        "news": translated_news(source, editorial, preserved_news, preserved_report),
        "efforts": translated_efforts(source, editorial, preserved_report),
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


def write_fallback(source, localized):
    fallback = {
        "hardware": json.loads((DATA / "hardware.json").read_text(encoding="utf-8")),
        "discords": json.loads((DATA / "discords.json").read_text(encoding="utf-8")),
        "tracker": localized,
        "trackerLocalized": localized,
        "trackerRaw": source,
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
    return fallback_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fallback-only", action="store_true", help="Regenerate file:// data without rebuilding local translations.")
    args = parser.parse_args()
    source_path = DATA / "tracker.json"
    source = json.loads(source_path.read_text(encoding="utf-8"))
    localized_path = DATA / "tracker-pt-BR.json"
    if args.fallback_only:
        localized = json.loads(localized_path.read_text(encoding="utf-8"))
        fallback_path = write_fallback(source, localized)
        print(f"Gerado {fallback_path.relative_to(ROOT)} a partir dos dados atuais.")
        return

    previous_localized = {}
    if localized_path.exists():
        previous_localized = json.loads(localized_path.read_text(encoding="utf-8"))
    editorial = merge_editorial_defaults(
        XLAUNCH_EDITORIAL_DEFAULTS,
        previous_localized.get("editorial", {}),
    )
    previous_teams = previous_localized.get("teams") if isinstance(previous_localized.get("teams"), dict) else {}
    previous_xlaunch_team = previous_teams.get("xlaunchvi") if isinstance(previous_teams.get("xlaunchvi"), dict) else {}
    previous_report = previous_xlaunch_team.get("latestReport")
    editorial_teams = editorial.setdefault("teams", {})
    editorial_xlaunch_team = editorial_teams.setdefault("xlaunchvi", {})
    if not isinstance(previous_report, dict):
        previous_report = editorial_xlaunch_team.get("localReport")
    editorial_xlaunch_team.pop("localReport", None)

    source_ids = {item.get("id") for item in source.get("efforts", []) if isinstance(item, dict)}
    previous_efforts = previous_localized.get("efforts") if isinstance(previous_localized.get("efforts"), list) else []
    manual_efforts = {
        item["id"]: item for item in editorial.get("manualEfforts", [])
        if isinstance(item, dict) and item.get("id")
    }
    for item in previous_efforts:
        if isinstance(item, dict) and item.get("id") and item["id"] not in source_ids:
            manual_efforts[item["id"]] = item
    editorial["manualEfforts"] = list(manual_efforts.values())

    existing_editorial_news = editorial.get("news") if isinstance(editorial.get("news"), list) else []
    previous_news = previous_localized.get("news") if isinstance(previous_localized.get("news"), list) else []
    preserved_news = {
        item["id"]: item for item in previous_news
        if isinstance(item, dict) and item.get("id") and item.get("title") and item.get("summary")
    }
    remaining_editorial_news = []
    for item in existing_editorial_news:
        if isinstance(item, dict) and item.get("id") and item.get("title") and item.get("summary"):
            previous = preserved_news.get(item["id"], {})
            generated_echo = all(item.get(field) == previous.get(field) for field in ("date", "category", "title", "summary"))
            generated_echo = generated_echo and item.get("body") == previous.get("body")
            if not generated_echo:
                remaining_editorial_news.append(item)
    editorial["news"] = remaining_editorial_news

    localized = build_tracker(
        source,
        editorial,
        list(preserved_news.values()),
        previous_report if isinstance(previous_report, dict) else None,
    )
    localized_path.write_text(json.dumps(localized, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    fallback_path = write_fallback(source, localized)
    print(f"Gerados {localized_path.relative_to(ROOT)} e {fallback_path.relative_to(ROOT)}.")


if __name__ == "__main__":
    main()
