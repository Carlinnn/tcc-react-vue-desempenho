<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue';
import type { Produto } from '../store';
import ProductCard from './ProductCard.vue';

const props = defineProps<{ itens: Produto[] }>();
const COND = __COND__;

const ALTURA_LINHA = 330 + 16; // altura do card + gap
const LARGURA_MIN = 200;
const GAP = 16;
const MARGEM_LINHAS = 2;

// Renderização condicional (virtualização): só os cards visíveis na janela
// entram no DOM. Sem a otimização, todos os itens são renderizados.
const el = ref<HTMLDivElement>();
const colunas = ref(1);
const inicio = ref(0);
const fim = ref(4);

function calcular() {
  if (!el.value) return;
  colunas.value = Math.max(1, Math.floor((el.value.clientWidth + GAP) / (LARGURA_MIN + GAP)));
  const topo = el.value.getBoundingClientRect().top + window.scrollY;
  const rolado = Math.max(0, window.scrollY - topo);
  inicio.value = Math.max(0, Math.floor(rolado / ALTURA_LINHA) - MARGEM_LINHAS);
  fim.value = Math.ceil((rolado + window.innerHeight) / ALTURA_LINHA) + MARGEM_LINHAS;
}

const linhas = computed(() => Math.ceil(props.itens.length / colunas.value));
const visiveis = computed(() =>
  props.itens.slice(inicio.value * colunas.value, Math.min(linhas.value, fim.value) * colunas.value));

let raf = 0;
const agendar = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(calcular); };
if (COND) {
  onMounted(() => {
    calcular();
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', agendar);
    window.removeEventListener('resize', agendar);
  });
  watch(() => props.itens.length, () => nextTick(calcular));
}
</script>

<template>
  <div v-if="!COND" class="grade">
    <ProductCard v-for="p in itens" :key="p.id" :p="p" />
  </div>
  <div v-else ref="el" :style="{ height: `${linhas * ALTURA_LINHA}px` }">
    <div class="grade" :style="{ gridTemplateColumns: `repeat(${colunas}, 1fr)`, transform: `translateY(${inicio * ALTURA_LINHA}px)` }">
      <ProductCard v-for="p in visiveis" :key="p.id" :p="p" />
    </div>
  </div>
</template>
