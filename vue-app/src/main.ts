import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@routes';
import '../../shared/styles.css';
import App from './App.vue';
import { carregarProdutos } from './store';

const router = createRouter({ history: createWebHistory(), routes });
carregarProdutos();
createApp(App).use(router).mount('#app');
