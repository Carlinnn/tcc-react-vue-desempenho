// Teste funcional: confirma que os 12 builds funcionam e são equivalentes
// (lista de produtos, busca, painel de filtros, carrinho, rotas e gráficos).
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { startServer } from './serve.mjs';
import { SCENARIOS } from './scenarios.mjs';
import { chromePath } from './chrome.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
let falhas = 0;
let porta = 5100;

for (const app of ['react-app', 'vue-app']) {
  for (const [cenario, flags] of Object.entries(SCENARIOS)) {
    const server = await startServer(path.join(ROOT, app, 'dist', cenario), ++porta, { cache: flags.cache });
    const base = `http://127.0.0.1:${porta}`;
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    try {
      await page.goto(base, { waitUntil: 'networkidle0', timeout: 120000 });
      await page.waitForSelector('#total');
      const total = await page.$eval('#total', (e) => e.textContent);
      const cards = await page.$$eval('.card', (c) => c.length);
      const painelNoDom = await page.$$eval('.filtros', (c) => c.length);
      await page.type('#busca', 'Fone');
      await page.waitForFunction(() => document.querySelector('#total').textContent !== '1000 produtos');
      const filtrado = await page.$eval('#total', (e) => e.textContent);
      await page.click('#btn-filtros');
      const painelAberto = await page.$$eval('.filtros:not(.oculto)', (c) => c.length);
      await page.click('.card .btn');
      const carrinho = await page.$eval('#carrinho', (e) => e.textContent);
      await page.click('a[href="/painel"]');
      await page.waitForSelector('canvas');
      await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 20);
      await page.click('a[href="/sobre"]');
      await page.waitForSelector('h1');
      await page.goto(`${base}/produto/42`, { waitUntil: 'networkidle0' });
      const produto = await page.$eval('h1', (e) => e.textContent);
      const ok = total === '1000 produtos' && painelAberto === 1 && carrinho === 'Carrinho: 1' && erros.length === 0
        && produto.endsWith(' 42') && cards === (flags.cond ? cards : 1000) && painelNoDom === (flags.cond ? 0 : 1);
      if (!ok) falhas++;
      console.log(`${ok ? 'OK ' : 'FALHA'} ${app.padEnd(9)} ${cenario.padEnd(13)} cards=${cards} painelInicial=${painelNoDom} busca="${filtrado}" ${carrinho} produto="${produto}" ${erros.join('; ')}`);
    } catch (e) {
      falhas++;
      console.log(`FALHA ${app} ${cenario}: ${e.message} ${erros.join('; ')}`);
    }
    await page.close();
    server.close();
  }
}
await browser.close();
console.log(falhas ? `${falhas} falha(s)` : 'Todos os builds passaram.');
process.exit(falhas ? 1 : 0);
