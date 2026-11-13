// Diagnóstico: por que a navegação quente de S0/S2 não tem pontuação/TBT?
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import puppeteer from 'puppeteer';
import { startFlow } from 'lighthouse';
import { startServer } from './serve.mjs';
import { chromePath } from './chrome.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
await startServer(path.join(ROOT, 'react-app', 'dist', 's0-baseline'), 5299, { cache: false });
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'tcc-diag-'));
const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, userDataDir: perfil });
const page = await browser.newPage();
const flow = await startFlow(page);
await flow.navigate('http://127.0.0.1:5299/', { name: 'fria' });
await flow.navigate('http://127.0.0.1:5299/', { name: 'quente', disableStorageReset: true, throttlingMethod: 'devtools', maxWaitForLoad: 120000 });
const res = await flow.createFlowResult();
const lhr = res.steps[1].lhr;
console.log('runtimeError:', lhr.runtimeError);
console.log('runWarnings:', lhr.runWarnings);
console.log('tbt:', JSON.stringify(lhr.audits['total-blocking-time'], ['score', 'numericValue', 'errorMessage', 'scoreDisplayMode']));
console.log('timing:', lhr.timing?.total);
await browser.close();
fs.rmSync(perfil, { recursive: true, force: true });
process.exit(0);
