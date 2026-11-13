import { memo } from 'react';
import { Link } from 'react-router-dom';
import { moeda, type Produto } from '../store';

// memo + callback estável: atualizar o carrinho não re-renderiza os cards.
function ProductCard({ p, onAdd }: { p: Produto; onAdd: () => void }) {
  return (
    <article className="card">
      {/* Lazy loading: carregamento nativo adiado para imagens fora da tela. */}
      <img src={p.imagem} alt={p.nome} width={400} height={400}
           loading={__LAZY__ ? 'lazy' : 'eager'} decoding={__LAZY__ ? 'async' : 'auto'} />
      <div className="info">
        <h3><Link to={`/produto/${p.id}`}>{p.nome}</Link></h3>
        <span>{p.categoria} · ★ {p.avaliacao}</span>
        <span className="preco">{moeda(p.preco)}</span>
        <button className="btn" onClick={onAdd}>Adicionar</button>
      </div>
    </article>
  );
}

export default memo(ProductCard);
