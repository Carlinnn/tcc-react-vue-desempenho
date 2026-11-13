import { ref, shallowRef } from 'vue';

export interface Produto {
  id: number; nome: string; categoria: string; preco: number; avaliacao: number;
  estoque: number; descricao: string; imagem: string; vendasMensais: number[];
}

// Estado global equivalente ao Context do React.
// shallowRef: a lista é substituída de uma vez e não precisa de reatividade profunda.
export const produtos = shallowRef<Produto[]>([]);
export const carregando = ref(true);
export const carrinho = ref(0);
export const adicionar = () => { carrinho.value++; };

export function carregarProdutos() {
  fetch('/data/products.json').then((r) => r.json()).then((d) => { produtos.value = d; carregando.value = false; });
}

export const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
