import { useMemo, useState } from 'react';
import { useStore } from '../store';
import ProductGrid from '../components/ProductGrid';
import FilterPanel from '../components/FilterPanel';

export default function Home() {
  const { produtos, carregando } = useStore();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const categorias = useMemo(() => [...new Set(produtos.map((p) => p.categoria))].sort(), [produtos]);
  const itens = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return produtos.filter((p) => (!categoria || p.categoria === categoria) && (!t || p.nome.toLowerCase().includes(t)));
  }, [produtos, busca, categoria]);

  return (
    <>
      <img className="hero" src="/img/hero.jpg" alt="Ofertas da semana" width={1600} height={600} fetchPriority="high" />
      <div className="busca">
        <input id="busca" type="search" placeholder="Buscar produtos" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button id="btn-filtros" className="btn" onClick={() => setFiltrosAbertos((v) => !v)}>Filtros</button>
      </div>
      <FilterPanel produtos={produtos} aberto={filtrosAbertos} />
      {carregando
        ? <p>Carregando produtos…</p>
        : <><p id="total">{itens.length} produtos</p><ProductGrid itens={itens} /></>}
    </>
  );
}
