// Com code splitting: cada rota vira um chunk carregado sob demanda (React.lazy).
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const ProdutoPage = lazy(() => import('./pages/Produto'));
const Painel = lazy(() => import('./pages/Painel'));
const Sobre = lazy(() => import('./pages/Sobre'));

export const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/produto/:id', element: <ProdutoPage /> },
  { path: '/painel', element: <Painel /> },
  { path: '/sobre', element: <Sobre /> },
];
