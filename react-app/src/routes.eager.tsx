// Sem code splitting: todas as páginas entram no bundle principal.
import type { RouteObject } from 'react-router-dom';
import Home from './pages/Home';
import ProdutoPage from './pages/Produto';
import Painel from './pages/Painel';
import Sobre from './pages/Sobre';

export const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/produto/:id', element: <ProdutoPage /> },
  { path: '/painel', element: <Painel /> },
  { path: '/sobre', element: <Sobre /> },
];
