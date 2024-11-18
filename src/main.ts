import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import './style.css';

globalThis.DEBUG = localStorage.getItem('DEBUG') === 'true';

createApp(App).mount('#app');
