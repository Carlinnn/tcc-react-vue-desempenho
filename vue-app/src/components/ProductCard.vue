<script setup lang="ts">
import { adicionar, moeda, type Produto } from '../store';

defineProps<{ p: Produto }>();
const LAZY = __LAZY__;
</script>

<template>
  <article class="card">
    <!-- Lazy loading: carregamento nativo adiado para imagens fora da tela. -->
    <img :src="p.imagem" :alt="p.nome" width="400" height="400"
         :loading="LAZY ? 'lazy' : 'eager'" :decoding="LAZY ? 'async' : 'auto'" />
    <div class="info">
      <h3><RouterLink :to="`/produto/${p.id}`">{{ p.nome }}</RouterLink></h3>
      <span>{{ p.categoria }} · ★ {{ p.avaliacao }}</span>
      <span class="preco">{{ moeda(p.preco) }}</span>
      <button class="btn" @click="adicionar">Adicionar</button>
    </div>
  </article>
</template>
