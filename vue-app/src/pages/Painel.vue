<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { moeda, produtos } from '../store';

Chart.register(...registerables);
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const barras = ref<HTMLCanvasElement>();
const linha = ref<HTMLCanvasElement>();

const porCategoria = computed(() => {
  const m = new Map<string, number>();
  produtos.value.forEach((p) => m.set(p.categoria, (m.get(p.categoria) || 0) + p.vendasMensais.reduce((a, b) => a + b, 0)));
  return [...m].sort();
});
const porMes = computed(() => MESES.map((_, i) => produtos.value.reduce((s, p) => s + p.vendasMensais[i], 0)));
const top = computed(() =>
  [...produtos.value].sort((a, b) => b.preco * b.vendasMensais[11] - a.preco * a.vendasMensais[11]).slice(0, 20));

let graficos: Chart[] = [];
const destruir = () => { graficos.forEach((g) => g.destroy()); graficos = []; };
watch([produtos, barras, linha], () => {
  destruir();
  if (!produtos.value.length || !barras.value || !linha.value) return;
  graficos = [
    new Chart(barras.value, { type: 'bar', data: { labels: porCategoria.value.map((c) => c[0]), datasets: [{ label: 'Unidades vendidas', data: porCategoria.value.map((c) => c[1]) }] } }),
    new Chart(linha.value, { type: 'line', data: { labels: MESES, datasets: [{ label: 'Vendas por mês', data: porMes.value }] } }),
  ];
}, { immediate: true, flush: 'post' });
onBeforeUnmount(destruir);
</script>

<template>
  <h1>Painel de vendas</h1>
  <div class="graficos">
    <div><canvas ref="barras" /></div>
    <div><canvas ref="linha" /></div>
  </div>
  <table>
    <thead><tr><th>Produto</th><th>Categoria</th><th>Receita (dez.)</th></tr></thead>
    <tbody>
      <tr v-for="p in top" :key="p.id">
        <td>{{ p.nome }}</td><td>{{ p.categoria }}</td><td>{{ moeda(p.preco * p.vendasMensais[11]) }}</td>
      </tr>
    </tbody>
  </table>
</template>
