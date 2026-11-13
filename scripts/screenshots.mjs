// Capturas de tela das aplicações para o Capítulo 4 (versão S5, desktop 1280x800).
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { startServer } from './serve.mjs';
import { chromePath } from './chrome.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'results', 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
let porta = 5400;
for (const fw of ['react', 'vue']) {
  const p = ++porta;
  await startServer(path.join(ROOT, `${fw}-app`, 'dist', 's0-baseline'), p, { cache: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const base = `http://127.0.0.1:${p}`;
  await page.goto(base + '/', { waitUntil: 'networkidle0', timeout: 120000 });
  await espera(500);
  await page.screenshot({ path: path.join(OUT, `${fw}-home.png`) });
  await page.click('#btn-filtros');
  await espera(400);
  await page.screenshot({ path: path.join(OUT, `${fw}-filtros.png`) });
  await page.goto(base + '/painel', { waitUntil: 'networkidle0', timeout: 120000 });
  await espera(1500);
  await page.screenshot({ path: path.join(OUT, `${fw}-painel.png`) });
  await page.goto(base + '/produto/1', { waitUntil: 'networkidle0', timeout: 120000 });
  await espera(500);
  await page.screenshot({ path: path.join(OUT, `${fw}-produto.png`) });
  await page.close();
}
await browser.close();
console.log('capturas em', OUT);
process.exit(0);
