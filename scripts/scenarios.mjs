// Definição dos cenários experimentais. Cada cenário liga um conjunto de
// otimizações em tempo de build; as duas aplicações (React e Vue) leem
// este mesmo arquivo, garantindo que os cenários sejam equivalentes.
export const SCENARIOS = {
  's0-baseline':     { lazy: false, split: false, cache: false, cond: false },
  's1-lazy':         { lazy: true,  split: false, cache: false, cond: false },
  's2-split':        { lazy: false, split: true,  cache: false, cond: false },
  's3-cache':        { lazy: false, split: false, cache: true,  cond: false },
  's4-cond':         { lazy: false, split: false, cache: false, cond: true  },
  's5-combinado':    { lazy: true,  split: true,  cache: true,  cond: true  },
};

export function getScenario(name = process.env.SCENARIO || 's0-baseline') {
  const flags = SCENARIOS[name];
  if (!flags) throw new Error(`Cenário desconhecido: ${name}`);
  return { name, ...flags };
}

// Configuração do service worker (usada só quando cache = true).
// Pré-cache do "app shell" (HTML/JS/CSS) e cache em tempo de execução
// para imagens (CacheFirst) e dados (StaleWhileRevalidate).
export const pwaOptions = {
  registerType: 'autoUpdate',
  injectRegister: 'script-defer',
  manifest: false,
  workbox: {
    globPatterns: ['**/*.{js,css,html}'],
    navigateFallback: '/index.html',
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      { urlPattern: ({ url }) => url.pathname.startsWith('/img/'),
        handler: 'CacheFirst',
        options: { cacheName: 'imagens', expiration: { maxEntries: 1100 } } },
      { urlPattern: ({ url }) => url.pathname.startsWith('/data/'),
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'dados' } },
    ],
  },
};
