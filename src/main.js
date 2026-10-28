import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';

// Bootstrap 5 & Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Application Custom Styles
import './index.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
