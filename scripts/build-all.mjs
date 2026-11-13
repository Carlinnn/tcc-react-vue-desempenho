// Gera os 12 builds de produção (2 frameworks x 6 cenários)
// e registra o tamanho dos arquivos JS/CSS de cada build em results/bundles.csv.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { SCENARIOS } from './scenarios.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const APPS = ['react-app', 'vue-app'];
const linhas = ['framework,cenario,arquivos_js,js_kb,js_gzip_kb,css_kb,maior_chunk_kb,chunk_inicial_kb'];

for (const app of APPS) {
  for (const cenario of Object.keys(SCENARIOS)) {
    console.log(`> ${app} / ${cenario}`);
    execSync('npx vite build --logLevel warn', { cwd: path.join(ROOT, app), env: { ...process.env, SCENARIO: cenario }, stdio: 'inherit' });
    const assets = path.join(ROOT, app, 'dist', cenario, 'assets');
    const files = fs.readdirSync(assets);
    const js = files.filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(assets, f)));
    const css = files.filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(assets, f)));
    const kb = (n) => (n / 1024).toFixed(2);
    const soma = (arr) => arr.reduce((s, b) => s + b.length, 0);
    const gz = js.reduce((s, b) => s + zlib.gzipSync(b, { level: 6 }).length, 0);
    // chunk inicial = script de entrada referenciado no index.html
    const html = fs.readFileSync(path.join(ROOT, app, 'dist', cenario, 'index.html'), 'utf8');
    const entrada = html.match(/assets\/(index-[^"]+\.js)/)[1];
    const inicial = fs.statSync(path.join(assets, entrada)).size;
    linhas.push([app.replace('-app', ''), cenario, js.length, kb(soma(js)), kb(gz), kb(soma(css)),
      kb(Math.max(...js.map((b) => b.length))), kb(inicial)].join(','));
  }
}
fs.mkdirSync(path.join(ROOT, 'results'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'results', 'bundles.csv'), linhas.join('\n') + '\n');
console.log(linhas.join('\n'));
