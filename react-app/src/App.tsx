import { Suspense } from 'react';
import { NavLink, useRoutes } from 'react-router-dom';
import { routes } from '@routes';
import { useStore } from './store';

const classe = ({ isActive }: { isActive: boolean }) => (isActive ? 'ativo' : '');

export default function App() {
  const { carrinho } = useStore();
  const element = useRoutes(routes);
  return (
    <>
      <header className="topo">
        <nav>
          <NavLink to="/" end className={classe}>Início</NavLink>
          <NavLink to="/painel" className={classe}>Painel</NavLink>
          <NavLink to="/sobre" className={classe}>Sobre</NavLink>
        </nav>
        <span id="carrinho">Carrinho: {carrinho}</span>
      </header>
      <main>
        <Suspense fallback={<p>Carregando…</p>}>{element}</Suspense>
      </main>
    </>
  );
}
