// Servidor estático usado nas medições (o mesmo para React e Vue).
// - compressão gzip para recursos de texto (igual em todos os cenários);
// - fallback de SPA para index.html;
// - cabeçalhos de cache: sem cache nos cenários sem a otimização de caching
//   (isola o efeito da técnica); com cache longo para /assets (nomes com hash)
//   e /img quando o cenário ativa caching.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
const TEXT = new Set(['.html', '.js', '.css', '.json', '.svg', '.webmanifest']);

export function startServer(root, port, { cache = false } = {}) {
  const gzCache = new Map();
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(root, urlPath);
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.extname(urlPath) ? null : path.join(root, 'index.html');
    }
    if (!file || !fs.existsSync(file)) { res.writeHead(404).end('not found'); return; }
    const ext = path.extname(file);
    const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream' };
    if (!cache) headers['Cache-Control'] = 'no-store';
    else if (urlPath.startsWith('/assets/')) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    else if (urlPath.startsWith('/img/')) headers['Cache-Control'] = 'public, max-age=86400';
    else headers['Cache-Control'] = 'no-cache';
    let body = fs.readFileSync(file);
    if (TEXT.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      if (!gzCache.has(file)) gzCache.set(file, zlib.gzipSync(body, { level: 6 }));
      body = gzCache.get(file);
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
    }
    headers['Content-Length'] = body.length;
    res.writeHead(200, headers).end(body);
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

// Uso direto: node scripts/serve.mjs <pasta> <porta> [cache]
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const [root, port = '4173', mode] = process.argv.slice(2);
  startServer(path.resolve(root), Number(port), { cache: mode === 'cache' })
    .then(() => console.log(`Servindo ${root} em http://127.0.0.1:${port} (cache=${mode === 'cache'})`));
}
