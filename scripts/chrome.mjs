// Caminho do Chrome for Testing com versão fixa (instalado em .chrome/).
// Instalação: npx @puppeteer/browsers install chrome@stable --path .chrome
import fs from 'node:fs';
import path from 'node:path';

export function chromePath() {
  const base = path.resolve(import.meta.dirname, '..', '.chrome', 'chrome');
  const dir = fs.readdirSync(base).find((d) => d.startsWith('win64-') || d.startsWith('linux-') || d.startsWith('mac'));
  if (!dir) throw new Error('Chrome não encontrado em .chrome/. Rode: npx @puppeteer/browsers install chrome@stable --path .chrome');
  const sub = fs.readdirSync(path.join(base, dir))[0];
  const exe = process.platform === 'win32' ? 'chrome.exe' : 'chrome';
  return path.join(base, dir, sub, exe);
}
