<script setup lang="ts">
import { carrinho } from './store';
</script>

<template>
  <header class="topo">
    <nav>
      <RouterLink to="/" exact-active-class="ativo" active-class="">Início</RouterLink>
      <RouterLink to="/painel" active-class="ativo">Painel</RouterLink>
      <RouterLink to="/sobre" active-class="ativo">Sobre</RouterLink>
    </nav>
    <span id="carrinho">Carrinho: {{ carrinho }}</span>
  </header>
  <main>
    <RouterView />
  </main>
</template>
