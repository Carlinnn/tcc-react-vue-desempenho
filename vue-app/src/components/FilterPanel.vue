<script setup lang="ts">
import type { Produto } from '../store';

// Painel de filtros avançados (uma opção por produto).
// Sem renderização condicional ele é sempre montado e apenas ocultado via CSS
// (equivalente a v-show); com a otimização, usa v-if e só entra no DOM quando aberto.
defineProps<{ produtos: Produto[]; aberto: boolean }>();
const COND = __COND__;
</script>

<template>
  <section v-if="!COND || aberto" :class="['filtros', { oculto: !aberto }]">
    <strong>Filtros avançados ({{ produtos.length }} itens)</strong>
    <ul>
      <li v-for="p in produtos" :key="p.id"><label><input type="checkbox" /> {{ p.nome }}</label></li>
    </ul>
  </section>
</template>
