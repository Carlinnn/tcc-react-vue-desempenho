<script setup lang="ts">
import { computed, ref } from 'vue';
import { carregando, produtos } from '../store';
import ProductGrid from '../components/ProductGrid.vue';
import FilterPanel from '../components/FilterPanel.vue';

const busca = ref('');
const categoria = ref('');
const filtrosAbertos = ref(false);
const categorias = computed(() => [...new Set(produtos.value.map((p) => p.categoria))].sort());
const itens = computed(() => {
  const t = busca.value.trim().toLowerCase();
  return produtos.value.filter((p) => (!categoria.value || p.categoria === categoria.value) && (!t || p.nome.toLowerCase().includes(t)));
});
</script>

<template>
  <img class="hero" src="/img/hero.jpg" alt="Ofertas da semana" width="1600" height="600" fetchpriority="high" />
  <div class="busca">
    <input id="busca" v-model="busca" type="search" placeholder="Buscar produtos" />
    <select id="categoria" v-model="categoria">
      <option value="">Todas as categorias</option>
      <option v-for="c in categorias" :key="c">{{ c }}</option>
    </select>
    <button id="btn-filtros" class="btn" @click="filtrosAbertos = !filtrosAbertos">Filtros</button>
  </div>
  <FilterPanel :produtos="produtos" :aberto="filtrosAbertos" />
  <p v-if="carregando">Carregando produtos…</p>
  <template v-else>
    <p id="total">{{ itens.length }} produtos</p>
    <ProductGrid :itens="itens" />
  </template>
</template>
