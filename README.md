# Experimento: React x Vue.js e estratégias de otimização

Uma mesma loja de demonstração (1.000 produtos, busca, filtros, painel com Chart.js) foi implementada em React 19.3.1 e em Vue 3.5.45, com Vite 8.3.8. Cada aplicação tem 6 cenários de build:

| Cenário | Otimização |
|---|---|
| s0-baseline | nenhuma |
| s1-lazy | `loading="lazy"` nas imagens |
| s2-split | code splitting por rota (React.lazy / rotas assíncronas do Vue Router) |
| s3-cache | service worker (Workbox) + cabeçalhos de cache HTTP |
| s4-cond | renderização condicional: lista virtualizada + painel de filtros com v-if/retorno nulo |
| s5-combinado | todas as anteriores |

## Como rodar
```
npm install                      # na raiz, em react-app/ e em vue-app/
npx @puppeteer/browsers install chrome@stable --path .chrome
python -I shared/generate-data.py shared/public   # dados e imagens (seed fixa)
node scripts/build-all.mjs       # 12 builds + results/bundles.csv
node scripts/smoke-test.mjs      # teste funcional dos 12 builds
node scripts/measure.mjs 10      # medições Lighthouse -> results/medicoes.csv (~3 h)
python -I scripts/analyze.py     # resumo.csv, react_vs_vue.csv, tabelas.md, graficos/
```

## Situação em 12/11/2026
- ✅ Coleta oficial concluída: 360/360 medições (10 execuções × 12 builds × 3 etapas), sem erros, 170,7 min.
- ✅ Análise: `results/tabelas.md`, `results/resumo.csv`, `results/react_vs_vue.csv`, `results/graficos/*.png`.
- ℹ️ Navegação quente de S0 e S2 sem pontuação/TBT: a página não termina de baixar ~18 MB de imagens em 120 s
  (aviso do Lighthouse NO_TTI_NETWORK_IDLE_PERIOD; confirmado com `scripts/diag-quente.mjs`). FCP, LCP e SI são válidos.
