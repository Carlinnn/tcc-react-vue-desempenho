import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';
import { getScenario, pwaOptions } from '../scripts/scenarios.mjs';

const s = getScenario();
const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  plugins: [vue(), ...(s.cache ? [VitePWA(pwaOptions)] : [])],
  publicDir: '../shared/public',
  // Flags resolvidas em tempo de build: o código não usado é eliminado do bundle.
  define: { __LAZY__: s.lazy, __COND__: s.cond },
  resolve: {
    // Code splitting: troca o módulo de rotas (importação estática x dinâmica).
    alias: { '@routes': src(s.split ? 'routes.split.ts' : 'routes.eager.ts') },
  },
  build: { outDir: `dist/${s.name}`, emptyOutDir: true, reportCompressedSize: false },
});
