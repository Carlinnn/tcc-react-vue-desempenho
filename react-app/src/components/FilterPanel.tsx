import type { Produto } from '../store';

// Painel de filtros avançados (uma opção por produto).
// Sem renderização condicional ele é sempre montado e apenas ocultado via CSS;
// com a otimização, só entra no DOM quando o usuário o abre.
export default function FilterPanel({ produtos, aberto }: { produtos: Produto[]; aberto: boolean }) {
  if (__COND__ && !aberto) return null;
  return (
    <section className={`filtros${aberto ? '' : ' oculto'}`}>
      <strong>Filtros avançados ({produtos.length} itens)</strong>
      <ul>{produtos.map((p) => <li key={p.id}><label><input type="checkbox" /> {p.nome}</label></li>)}</ul>
    </section>
  );
}
