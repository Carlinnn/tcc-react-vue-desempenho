import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useStore, type Produto } from '../store';
import ProductCard from './ProductCard';

const ALTURA_LINHA = 330 + 16; // altura do card + gap
const LARGURA_MIN = 200;
const GAP = 16;
const MARGEM_LINHAS = 2;

// Renderização condicional (virtualização): só os cards visíveis na janela
// entram no DOM. Sem a otimização, todos os itens são renderizados.
export default function ProductGrid({ itens }: { itens: Produto[] }) {
  const { adicionar } = useStore();
  if (!__COND__) {
    return <div className="grade">{itens.map((p) => <ProductCard key={p.id} p={p} onAdd={adicionar} />)}</div>;
  }
  return <GradeVirtual itens={itens} adicionar={adicionar} />;
}

function GradeVirtual({ itens, adicionar }: { itens: Produto[]; adicionar: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [janela, setJanela] = useState({ colunas: 1, inicio: 0, fim: 4 });

  const calcular = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const colunas = Math.max(1, Math.floor((el.clientWidth + GAP) / (LARGURA_MIN + GAP)));
    const topo = el.getBoundingClientRect().top + window.scrollY;
    const rolado = Math.max(0, window.scrollY - topo);
    const inicio = Math.max(0, Math.floor(rolado / ALTURA_LINHA) - MARGEM_LINHAS);
    const fim = Math.ceil((rolado + window.innerHeight) / ALTURA_LINHA) + MARGEM_LINHAS;
    setJanela((j) => (j.colunas === colunas && j.inicio === inicio && j.fim === fim ? j : { colunas, inicio, fim }));
  }, []);

  useLayoutEffect(calcular, [calcular, itens.length]);
  useEffect(() => {
    let raf = 0;
    const agendar = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(calcular); };
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    return () => { window.removeEventListener('scroll', agendar); window.removeEventListener('resize', agendar); };
  }, [calcular]);

  const { colunas, inicio, fim } = janela;
  const linhas = Math.ceil(itens.length / colunas);
  const visiveis = itens.slice(inicio * colunas, Math.min(linhas, fim) * colunas);
  return (
    <div ref={ref} style={{ height: linhas * ALTURA_LINHA }}>
      <div className="grade" style={{ gridTemplateColumns: `repeat(${colunas}, 1fr)`, transform: `translateY(${inicio * ALTURA_LINHA}px)` }}>
        {visiveis.map((p) => <ProductCard key={p.id} p={p} onAdd={adicionar} />)}
      </div>
    </div>
  );
}
