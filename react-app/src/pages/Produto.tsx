import { Link, useParams } from 'react-router-dom';
import { moeda, useStore } from '../store';

export default function ProdutoPage() {
  const { id } = useParams();
  const { produtos, carregando, adicionar } = useStore();
  const p = produtos.find((x) => x.id === Number(id));
  if (carregando) return <p>Carregando…</p>;
  if (!p) return <p>Produto não encontrado. <Link to="/">Voltar</Link></p>;
  return (
    <div className="detalhe">
      <img src={p.imagem} alt={p.nome} width={400} height={400} />
      <div>
        <h1>{p.nome}</h1>
        <p>{p.categoria} · ★ {p.avaliacao} · {p.estoque} em estoque</p>
        <p className="preco">{moeda(p.preco)}</p>
        <p>{p.descricao}</p>
        <button className="btn" onClick={adicionar}>Adicionar ao carrinho</button>
      </div>
    </div>
  );
}
