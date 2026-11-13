import { useEffect, useMemo, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { moeda, useStore } from '../store';

Chart.register(...registerables);
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function Painel() {
  const { produtos } = useStore();
  const barras = useRef<HTMLCanvasElement>(null);
  const linha = useRef<HTMLCanvasElement>(null);

  const porCategoria = useMemo(() => {
    const m = new Map<string, number>();
    produtos.forEach((p) => m.set(p.categoria, (m.get(p.categoria) || 0) + p.vendasMensais.reduce((a, b) => a + b, 0)));
    return [...m].sort();
  }, [produtos]);
  const porMes = useMemo(() => MESES.map((_, i) => produtos.reduce((s, p) => s + p.vendasMensais[i], 0)), [produtos]);
  const top = useMemo(
    () => [...produtos].sort((a, b) => b.preco * b.vendasMensais[11] - a.preco * a.vendasMensais[11]).slice(0, 20),
    [produtos],
  );

  useEffect(() => {
    if (!produtos.length) return;
    const c1 = new Chart(barras.current!, { type: 'bar', data: { labels: porCategoria.map((c) => c[0]), datasets: [{ label: 'Unidades vendidas', data: porCategoria.map((c) => c[1]) }] } });
    const c2 = new Chart(linha.current!, { type: 'line', data: { labels: MESES, datasets: [{ label: 'Vendas por mês', data: porMes }] } });
    return () => { c1.destroy(); c2.destroy(); };
  }, [produtos, porCategoria, porMes]);

  return (
    <>
      <h1>Painel de vendas</h1>
      <div className="graficos">
        <div><canvas ref={barras} /></div>
        <div><canvas ref={linha} /></div>
      </div>
      <table>
        <thead><tr><th>Produto</th><th>Categoria</th><th>Receita (dez.)</th></tr></thead>
        <tbody>
          {top.map((p) => <tr key={p.id}><td>{p.nome}</td><td>{p.categoria}</td><td>{moeda(p.preco * p.vendasMensais[11])}</td></tr>)}
        </tbody>
      </table>
    </>
  );
}
