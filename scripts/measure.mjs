// Coleta das métricas de desempenho com o Lighthouse (modo user flow).
//
// Para cada execução e para cada um dos 12 builds, abre um navegador limpo e roda:
//   1. navegacao_fria   - primeira visita (cache e storage limpos)
//   2. navegacao_quente - segunda visita (mantém cache HTTP e service worker)
//   3. interacao        - timespan com interações roteirizadas (busca, abrir filtros,
//                         adicionar ao carrinho) para medir INP e TBT
// A navegação fria usa a configuração padrão do Lighthouse (mobile, throttling simulado).
// A navegação quente usa throttling aplicado (devtools) com o mesmo perfil, porque o
// modelo simulado (Lantern) não representa respostas servidas pelo service worker.
// O timespan usa throttling aplicado (devtools), pois o simulado não se aplica a interações.
//
// A ordem é intercalada (execução 1 de todos os builds, depois a 2...) para que
// variações da máquina ao longo do tempo afetem todos os cenários por igual.
// Uso: node scripts/measure.mjs [execucoes=10] [filtro-de-build]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import puppeteer from 'puppeteer';
import { startFlow } from 'lighthouse';
import { startServer } from './serve.mjs';
import { SCENARIOS } from './scenarios.mjs';
import { chromePath } from './chrome.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const N = Number(process.argv[2] || 10);
const filtro = process.argv[3] || '';
const RESULTS = path.join(ROOT, 'results');
const RAW = path.join(RESULTS, 'raw');
const CSV = path.join(RESULTS, process.env.CSV_NAME || 'medicoes.csv');
fs.mkdirSync(RAW, { recursive: true });

const COLUNAS = ['framework', 'cenario', 'execucao', 'etapa', 'score', 'fcp_ms', 'lcp_ms', 'tbt_ms', 'cls',
  'si_ms', 'inp_ms', 'bytes_kb', 'requisicoes', 'dom_nos', 'timestamp'];
if (!fs.existsSync(CSV)) fs.writeFileSync(CSV, COLUNAS.join(',') + '\n');
const feitos = new Set(fs.readFileSync(CSV, 'utf8').trim().split('\n').slice(1)
  .map((l) => l.split(',').slice(0, 3).join('|')));

const builds = [];
let porta = 5200;
for (const app of ['react-app', 'vue-app']) {
  for (const [cenario, flags] of Object.entries(SCENARIOS)) {
    const fw = app.replace('-app', '');
    if (filtro && !`${fw}/${cenario}`.includes(filtro)) continue;
    const p = ++porta;
    await startServer(path.join(ROOT, app, 'dist', cenario), p, { cache: flags.cache });
    builds.push({ fw, cenario, url: `http://127.0.0.1:${p}/` });
  }
}

const num = (lhr, id) => lhr.audits[id]?.numericValue;
const r = (v, d = 0) => (v == null || Number.isNaN(v) ? '' : Number(v).toFixed(d));
function linha(b, exec, etapa, lhr) {
  const score = lhr.categories.performance?.score;
  return [b.fw, b.cenario, exec, etapa, score == null ? '' : Math.round(score * 100),
    r(num(lhr, 'first-contentful-paint')), r(num(lhr, 'largest-contentful-paint')),
    r(num(lhr, 'total-blocking-time')), r(num(lhr, 'cumulative-layout-shift'), 4),
    r(num(lhr, 'speed-index')), r(num(lhr, 'interaction-to-next-paint')),
    r((num(lhr, 'total-byte-weight') ?? NaN) / 1024, 1),
    lhr.audits['network-requests']?.details?.items?.length ?? '',
    r(num(lhr, 'dom-size-insight') ?? num(lhr, 'dom-size')), new Date().toISOString()].join(',');
}

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));

async function executar(b, exec) {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'tcc-lh-'));
  const browser = await puppeteer.launch({
    executablePath: chromePath(), headless: true, userDataDir: perfil,
    args: ['--no-first-run', '--no-default-browser-check', '--disable-extensions'],
  });
  try {
    const page = await browser.newPage();
    const flow = await startFlow(page, { name: `${b.fw}-${b.cenario}-${exec}` });

    await flow.navigate(b.url, { name: 'navegacao_fria', disableStorageReset: false });
    // aguarda o service worker assumir a página (cenários com caching)
    await page.evaluate(() => (navigator.serviceWorker?.controller || !navigator.serviceWorker
      ? true : Promise.race([navigator.serviceWorker.ready, new Promise((ok) => setTimeout(ok, 5000))])));
    await espera(1000);

    // throttling aplicado: o modo simulado não modela respostas vindas do service worker
    await flow.navigate(b.url, { name: 'navegacao_quente', disableStorageReset: true, throttlingMethod: 'devtools', maxWaitForLoad: 120000 });

    await page.waitForSelector('#total');
    await flow.startTimespan({ name: 'interacao', throttlingMethod: 'devtools' });
    await page.type('#busca', 'Fone', { delay: 150 });
    await espera(500);
    await page.click('#btn-filtros');
    await espera(500);
    await page.click('#btn-filtros');
    await espera(500);
    await page.click('.card .btn');
    await espera(1000);
    await flow.endTimespan();

    const res = await flow.createFlowResult();
    fs.writeFileSync(path.join(RAW, `${b.fw}_${b.cenario}_${exec}.json`), JSON.stringify(
      res.steps.map((s) => ({ etapa: s.name, audits: Object.fromEntries(
        Object.entries(s.lhr.audits).filter(([, a]) => a.numericValue != null).map(([k, a]) => [k, a.numericValue])),
      score: s.lhr.categories.performance?.score, versaoLighthouse: s.lhr.lighthouseVersion, userAgent: s.lhr.environment?.hostUserAgent }))));
    const etapas = ['navegacao_fria', 'navegacao_quente', 'interacao'];
    return res.steps.map((s, i) => linha(b, exec, etapas[i], s.lhr));
  } finally {
    await browser.close();
    fs.rmSync(perfil, { recursive: true, force: true });
  }
}

const inicio = Date.now();
for (let exec = 1; exec <= N; exec++) {
  for (const b of builds) {
    if (feitos.has(`${b.fw}|${b.cenario}|${exec}`)) continue;
    const t = Date.now();
    try {
      const linhas = await executar(b, exec);
      fs.appendFileSync(CSV, linhas.join('\n') + '\n');
      const fria = linhas[0].split(',');
      console.log(`[${exec}/${N}] ${b.fw.padEnd(5)} ${b.cenario.padEnd(13)} score=${fria[4]} lcp=${fria[6]}ms tbt=${fria[7]}ms (${((Date.now() - t) / 1000).toFixed(0)}s)`);
    } catch (e) {
      console.log(`[${exec}/${N}] ${b.fw} ${b.cenario} ERRO: ${e.message}`);
    }
  }
}
console.log(`Concluído em ${((Date.now() - inicio) / 60000).toFixed(1)} min. Dados: ${CSV}`);
process.exit(0);
