import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface Produto {
  id: number; nome: string; categoria: string; preco: number; avaliacao: number;
  estoque: number; descricao: string; imagem: string; vendasMensais: number[];
}

interface Store { produtos: Produto[]; carregando: boolean; carrinho: number; adicionar: () => void; }
const Ctx = createContext<Store>(null!);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carrinho, setCarrinho] = useState(0);
  useEffect(() => {
    fetch('/data/products.json').then((r) => r.json()).then((d) => { setProdutos(d); setCarregando(false); });
  }, []);
  const adicionar = useCallback(() => setCarrinho((c) => c + 1), []);
  const valor = useMemo(() => ({ produtos, carregando, carrinho, adicionar }), [produtos, carregando, carrinho, adicionar]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
export const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
