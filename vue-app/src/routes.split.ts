// Com code splitting: cada rota vira um chunk carregado sob demanda
// (rotas assíncronas do Vue Router, equivalente ao React.lazy).
import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('./pages/Home.vue') },
  { path: '/produto/:id', component: () => import('./pages/Produto.vue') },
  { path: '/painel', component: () => import('./pages/Painel.vue') },
  { path: '/sobre', component: () => import('./pages/Sobre.vue') },
];
