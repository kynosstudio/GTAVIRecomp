# Análise de Integração com PortWatch VI

## O que foi analisado na pasta `portwatch-vi-main`

### 📊 **Estrutura dos dados** (PortWatch)

```json
{
  "updated": "...",
  "site": { title, heroImage, heroCredit },
  "exe": { status, expectedAt, releasedAt, by, note, source },
  "news": [{id, date, category, title, dek, body[], sources[], image, by}],
  "watchlist": [...],
  "candidates": [...],
  "ignored": [...],
  "teams": { ... }
}
```

### 📌 **Pontos de comparação: KynesRecompVI vs PortWatch VI**

| Característica | KynesRecompVI (Atual) | PortWatch VI (Analisado) | Status |
|----------------|------------------------|---------------------------|--------|
| **Executável lib. status** | `tracker.json` → `status: released`, `releasedAt` | Mesma estrutura, mais detalhado com `note`, `source` | ✅ Similar |
| **Contagem** | Baseada em tempo desde `releasedAt` | Contagem idêntica | ✅ Idêntico |
| **Projetos (efforts)** | ~26 projetos no JSON (~350 linhas) | Mesma estrutura, mais campos (`nuked`, forks, commits) | ✅ Similar |
| **Marcos de GTa** | `gta` object com `loads`, `boots`, `menu`, `ingame`, `fps`, `stability` | Mesmo schema | ✅ Idêntico |
| **Groundwork** | 4 partes: `loader`, `shaders`, `graphics`, `proven` | Mesma estrutura e pesos (20%, 28%, 32%, 20%) | ✅ Idêntico |
| **Score calculation** | Em `app.js` ou `scoring.js` | Same scoring logic, `byStars`, `overall` | ✅ Similar |

---

## 🔍 **Diferenças importantes na estrutura do JSON**

### PortWatch: tem mais camadas no `efforts[]`:
- `groundwork`: array de 4 partes (0-1)
- `gta`: object com marcos e métricas
- `highlights`: string(s) curtas para destaque visual
- `blockers`: array de strings sobre o que está travando

### KynesRecompVI: estrutura mais simples no `efforts`
- Apenas `groundworkFraction`, `effort.gta`, sem `highlights` e `blockers` explícitos em alguns casos

---

## ✅ **O que foi aprovado da PortWatch para o KynesRecompVI**

### 1. **Dados do executável (`exe`)**
```json
{
  "status": "released",
  "expectedAt": "2026-11-23T17:00:00Z",
  "releasedAt": "2026-11-23T14:36:00Z",
  "by": "Cyberleek",
  "note": "...detalhado sobre o leak...",
  "source": "https://..."
}
```

### 2. **Notícias (`news`)**
Estrutura rica com `body[]`, `sources[]`, `image`:
- Atualizações recentes (XCL 30 FPS, TuxBox, Leonida nuked)
- Imagens de cobertura dos posts/repos
- Atribuição clara por autor (`by: "report"` ou `"claude"`)

### 3. **Projeto XlaunchVI com dados da PortWatch**
```json
{
  "teams": {
    "xlaunchvi": {
      "pixKey": "...",
      "kickUrl": "...",
      "discordUrl": "...",
      "latestReport": {...}
    }
  }
}
```

### 4. **Alertas de segurança e clones**
- `news` sobre downloads falsos, tokens, DMCA
- Monitoramento do `DMCA` log
- Lista de contas suspensas ou banidas

---

## 🚀 **O que ainda falta no KynesRecompVI**

### 1. **Campos faltantes nos efforts:**
```json
// Adicionar ao effort:
"highlights": ["...", "..."],
"blockers": ["..."]
```

### 2. **Notícias mais recentes (PortWatch tem ~500+ notícias)**
- O KynesRecompVI tem menos de 20 entries
- PortWatch tem coverage de X, HackerNews, Reddit, fóruns

### 3. **Dados técnicos completos para scoring**
- `highlights` ajudam a mostrar "O que funciona"
- `blockers` ajudam a mostrar "O que está travando"

---

## 📋 **Próximos passos**

1. **Exportar os dados essenciais da PortWatch:**
   - `tracker.json` completo (com estrutura expandida)
   - `data/tracker.json` atualizado com XlaunchVI no 50%
   - Notícia do XlaunchVI: "Tela de carregamento · 50% editorial"

2. **Mantém a identidade do KynesRecompVI:**
   - Nome, logo, herói (Meu PC Roda GTAVI)
   - Foco em XLaunch Dashboard (50%)
   - Avisos de derrubada/blur amarelo para projetos fora do ar
   - Header fixo organizado
   - Utilidade **Meu PC Roda GTAVI** com resoluções < 1080p

3. **Comparação final:**
   - KynesRecompVI: mais minimalista, mais focado na ferramenta XLaunch
   - PortWatch VI: dashboard completo, histórico, feeds de notícias

**Conclusão**: Não é necessário transformar o KynesRecompVI em um clone do PortWatch VI. O atual já é focado no XlaunchVI com a identidade desejada. A integração deve ser **seletiva**: trazer os dados que completam e melhoram o tracking (highlights, blockers), mantendo o foco no XlaunchVI (50% editorial).

---
*Gerado por engrenharia de dados front-end | 24/11/2026*
