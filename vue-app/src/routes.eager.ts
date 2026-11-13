// Sem code splitting: todas as páginas entram no bundle principal.
import type { RouteRecordRaw } from 'vue-router';
import Home from './pages/Home.vue';
import ProdutoPage from './pages/Produto.vue';
import Painel from './pages/Painel.vue';
import Sobre from './pages/Sobre.vue';

export const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/produto/:id', component: ProdutoPage },
  { path: '/painel', component: Painel },
  { path: '/sobre', component: Sobre },
];
