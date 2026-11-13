<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { adicionar, carregando, moeda, produtos } from '../store';

const route = useRoute();
const p = computed(() => produtos.value.find((x) => x.id === Number(route.params.id)));
</script>

<template>
  <p v-if="carregando">Carregando…</p>
  <p v-else-if="!p">Produto não encontrado. <RouterLink to="/">Voltar</RouterLink></p>
  <div v-else class="detalhe">
    <img :src="p.imagem" :alt="p.nome" width="400" height="400" />
    <div>
      <h1>{{ p.nome }}</h1>
      <p>{{ p.categoria }} · ★ {{ p.avaliacao }} · {{ p.estoque }} em estoque</p>
      <p class="preco">{{ moeda(p.preco) }}</p>
      <p>{{ p.descricao }}</p>
      <button class="btn" @click="adicionar">Adicionar ao carrinho</button>
    </div>
  </div>
</template>
