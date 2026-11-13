# Análise das medições (results/medicoes.csv).
# Gera: resumo (mediana e IQR), variação percentual em relação ao S0,
# teste de Mann-Whitney (React x Vue em cada cenário; cada cenário x S0 em cada framework),
# tabelas em Markdown e gráficos PNG.
# Uso: python -I scripts/analyze.py
import os
import sys
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy.stats import mannwhitneyu

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
RES = os.path.join(ROOT, 'results')
FIG = os.path.join(RES, 'graficos')
os.makedirs(FIG, exist_ok=True)

df = pd.read_csv(os.path.join(RES, 'medicoes.csv'))
CENARIOS = ['s0-baseline', 's1-lazy', 's2-split', 's3-cache', 's4-cond', 's5-combinado']
ROTULO = {'s0-baseline': 'S0 Base', 's1-lazy': 'S1 Lazy', 's2-split': 'S2 Split',
          's3-cache': 'S3 Cache', 's4-cond': 'S4 Cond.', 's5-combinado': 'S5 Comb.'}
METRICAS = {
    'navegacao_fria': ['score', 'fcp_ms', 'lcp_ms', 'tbt_ms', 'cls', 'si_ms', 'bytes_kb', 'requisicoes', 'dom_nos'],
    'navegacao_quente': ['score', 'fcp_ms', 'lcp_ms', 'tbt_ms', 'cls', 'si_ms', 'bytes_kb', 'requisicoes'],
    'interacao': ['inp_ms', 'tbt_ms', 'bytes_kb'],
}
NOME = {'score': 'Pontuação', 'fcp_ms': 'FCP (ms)', 'lcp_ms': 'LCP (ms)', 'tbt_ms': 'TBT (ms)', 'cls': 'CLS',
        'si_ms': 'SI (ms)', 'bytes_kb': 'Transferido (KB)', 'requisicoes': 'Requisições', 'dom_nos': 'Nós DOM',
        'inp_ms': 'INP (ms)'}
ETAPA = {'navegacao_fria': 'Navegação fria', 'navegacao_quente': 'Navegação quente', 'interacao': 'Interação'}
ALFA = 0.05


def q(s, p):
    return s.quantile(p)


def mw(a, b):
    a, b = a.dropna(), b.dropna()
    if len(a) < 2 or len(b) < 2 or (a.nunique() == 1 and b.nunique() == 1 and a.iloc[0] == b.iloc[0]):
        return float('nan')
    return mannwhitneyu(a, b, alternative='two-sided').pvalue


# 1) resumo: mediana, Q1, Q3, IQR, n
linhas = []
for etapa, mets in METRICAS.items():
    for fw in ['react', 'vue']:
        for c in CENARIOS:
            g = df[(df.etapa == etapa) & (df.framework == fw) & (df.cenario == c)]
            base = df[(df.etapa == etapa) & (df.framework == fw) & (df.cenario == 's0-baseline')]
            for m in mets:
                s = g[m].dropna()
                if s.empty:
                    continue
                med, med0 = s.median(), base[m].median()
                linhas.append(dict(etapa=etapa, framework=fw, cenario=c, metrica=m, n=len(s), mediana=med,
                                   q1=q(s, .25), q3=q(s, .75), iqr=q(s, .75) - q(s, .25),
                                   var_pct_s0=(med - med0) / med0 * 100 if med0 else float('nan'),
                                   p_vs_s0=mw(s, base[m]) if c != 's0-baseline' else float('nan')))
resumo = pd.DataFrame(linhas)
resumo.to_csv(os.path.join(RES, 'resumo.csv'), index=False, float_format='%.4f')

# 2) React x Vue por cenário
comp = []
for etapa, mets in METRICAS.items():
    for c in CENARIOS:
        for m in mets:
            a = df[(df.etapa == etapa) & (df.framework == 'react') & (df.cenario == c)][m]
            b = df[(df.etapa == etapa) & (df.framework == 'vue') & (df.cenario == c)][m]
            if a.dropna().empty or b.dropna().empty:
                continue
            p = mw(a, b)
            comp.append(dict(etapa=etapa, cenario=c, metrica=m, mediana_react=a.median(), mediana_vue=b.median(),
                             p_valor=p, significativo=(p < ALFA) if p == p else False))
comp = pd.DataFrame(comp)
comp.to_csv(os.path.join(RES, 'react_vs_vue.csv'), index=False, float_format='%.4f')


# 3) tabelas em Markdown (formato pt-BR)
def fmt(v, m):
    if v != v:
        return '–'
    d = 3 if m == 'cls' else (1 if m == 'bytes_kb' else 0)
    return f'{v:,.{d}f}'.replace(',', 'X').replace('.', ',').replace('X', '.')


def pfmt(p):
    if p != p:
        return '–'
    return '< 0,001' if p < 0.001 else f'{p:.3f}'.replace('.', ',')


out = ['# Tabelas de resultados (geradas por scripts/analyze.py)\n',
       f'Execuções por combinação: {int(resumo.n.max())}. Valores = mediana (IQR). '
       'Var. = variação percentual da mediana em relação ao S0 do mesmo framework. '
       'p = Mann-Whitney bilateral; * indica p < 0,05.\n']
for etapa, mets in METRICAS.items():
    for fw in ['react', 'vue']:
        out.append(f'\n## {ETAPA[etapa]} — {"React" if fw == "react" else "Vue.js"}\n')
        out.append('| Cenário | ' + ' | '.join(NOME[m] for m in mets) + ' |')
        out.append('|---|' + '---|' * len(mets))
        for c in CENARIOS:
            cel = []
            for m in mets:
                r = resumo[(resumo.etapa == etapa) & (resumo.framework == fw) & (resumo.cenario == c) & (resumo.metrica == m)]
                if r.empty:
                    cel.append('–')
                    continue
                r = r.iloc[0]
                txt = f'{fmt(r.mediana, m)} ({fmt(r.iqr, m)})'
                if c != 's0-baseline' and r.var_pct_s0 == r.var_pct_s0:
                    txt += f' [{r.var_pct_s0:+.0f}%{"*" if r.p_vs_s0 < ALFA else ""}]'.replace('.', ',')
                cel.append(txt)
            out.append(f'| {ROTULO[c]} | ' + ' | '.join(cel) + ' |')
    out.append(f'\n## {ETAPA[etapa]} — React x Vue.js (mediana React / mediana Vue, p)\n')
    out.append('| Cenário | ' + ' | '.join(NOME[m] for m in mets) + ' |')
    out.append('|---|' + '---|' * len(mets))
    for c in CENARIOS:
        cel = []
        for m in mets:
            r = comp[(comp.etapa == etapa) & (comp.cenario == c) & (comp.metrica == m)]
            if r.empty:
                cel.append('–')
                continue
            r = r.iloc[0]
            cel.append(f'{fmt(r.mediana_react, m)} / {fmt(r.mediana_vue, m)} ({pfmt(r.p_valor)}{"*" if r.significativo else ""})')
        out.append(f'| {ROTULO[c]} | ' + ' | '.join(cel) + ' |')

# bundles
b = pd.read_csv(os.path.join(RES, 'bundles.csv'))
out.append('\n## Tamanho dos bundles (build de produção)\n')
out.append('| Framework | Cenário | Arquivos JS | JS (KB) | JS gzip (KB) | CSS (KB) | Maior chunk (KB) | Chunk inicial (KB) |')
out.append('|---|---|---|---|---|---|---|---|')
for _, r in b.iterrows():
    out.append(f'| {r.framework} | {ROTULO.get(r.cenario, r.cenario)} | {r.arquivos_js} | ' +
               ' | '.join(fmt(r[k], 'bytes_kb') for k in ['js_kb', 'js_gzip_kb', 'css_kb', 'maior_chunk_kb', 'chunk_inicial_kb']) + ' |')
with open(os.path.join(RES, 'tabelas.md'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(out) + '\n')

# 4) gráficos (boxplots React x Vue por cenário)
plt.rcParams.update({'font.size': 10, 'font.family': 'DejaVu Sans'})
CORES = {'react': '#1f77b4', 'vue': '#2ca02c'}


def boxplot(etapa, m, arquivo, titulo):
    fig, ax = plt.subplots(figsize=(8, 4.2))
    pos, dados, cores = [], [], []
    for i, c in enumerate(CENARIOS):
        for j, fw in enumerate(['react', 'vue']):
            s = df[(df.etapa == etapa) & (df.framework == fw) & (df.cenario == c)][m].dropna()
            dados.append(s.values)
            pos.append(i * 3 + j)
            cores.append(CORES[fw])
    bp = ax.boxplot(dados, positions=pos, widths=0.8, patch_artist=True, medianprops=dict(color='black'))
    for patch, cor in zip(bp['boxes'], cores):
        patch.set_facecolor(cor)
        patch.set_alpha(0.6)
    ax.set_xticks([i * 3 + 0.5 for i in range(len(CENARIOS))])
    ax.set_xticklabels([ROTULO[c] for c in CENARIOS])
    ax.set_ylabel(NOME[m])
    ax.set_title(titulo)
    ax.grid(axis='y', alpha=0.3)
    ax.legend([plt.Rectangle((0, 0), 1, 1, fc=CORES['react'], alpha=.6), plt.Rectangle((0, 0), 1, 1, fc=CORES['vue'], alpha=.6)],
              ['React', 'Vue.js'], loc='best')
    fig.tight_layout()
    fig.savefig(os.path.join(FIG, arquivo), dpi=200)
    plt.close(fig)


GRAFICOS = [
    ('navegacao_fria', 'score', 'fria_score.png', 'Pontuação de desempenho — navegação fria'),
    ('navegacao_fria', 'lcp_ms', 'fria_lcp.png', 'LCP — navegação fria'),
    ('navegacao_fria', 'tbt_ms', 'fria_tbt.png', 'TBT — navegação fria'),
    ('navegacao_fria', 'bytes_kb', 'fria_bytes.png', 'Bytes transferidos — navegação fria'),
    ('navegacao_quente', 'score', 'quente_score.png', 'Pontuação de desempenho — navegação quente'),
    ('navegacao_quente', 'lcp_ms', 'quente_lcp.png', 'LCP — navegação quente'),
    ('navegacao_quente', 'bytes_kb', 'quente_bytes.png', 'Bytes transferidos — navegação quente'),
    ('interacao', 'inp_ms', 'interacao_inp.png', 'INP — interação roteirizada'),
    ('interacao', 'tbt_ms', 'interacao_tbt.png', 'TBT — interação roteirizada'),
]
for g in GRAFICOS:
    boxplot(*g)

# bundle: barras de JS inicial
fig, ax = plt.subplots(figsize=(8, 4))
for j, fw in enumerate(['react', 'vue']):
    s = b[b.framework == fw].set_index('cenario').reindex(CENARIOS)
    ax.bar([i * 3 + j for i in range(len(CENARIOS))], s.chunk_inicial_kb, width=0.9, color=CORES[fw], alpha=.7,
           label='React' if fw == 'react' else 'Vue.js')
ax.set_xticks([i * 3 + 0.5 for i in range(len(CENARIOS))])
ax.set_xticklabels([ROTULO[c] for c in CENARIOS])
ax.set_ylabel('KB (sem compressão)')
ax.set_title('JavaScript carregado na rota inicial')
ax.grid(axis='y', alpha=.3)
ax.legend()
fig.tight_layout()
fig.savefig(os.path.join(FIG, 'bundle_inicial.png'), dpi=200)
plt.close(fig)

print('ok:', len(df), 'linhas;', 'resumo.csv, react_vs_vue.csv, tabelas.md, graficos/*.png')
