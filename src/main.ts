import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import "flyonui/flyonui";
import { initSettings } from './utils/settingsService';

// 初始化应用设置
initSettings();

createApp(App).mount('#app')