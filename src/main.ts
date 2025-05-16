import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import "flyonui/flyonui";
import { initSettings } from './utils/settingsService';
import { hasSavedGame, loadGame } from './utils/saveService';

// 初始化应用设置
initSettings();

// 检查并加载游戏数据
if (hasSavedGame()) {
  try {
    loadGame();
    console.log('游戏数据加载成功');
  } catch (error) {
    console.error('无法加载游戏数据，使用默认游戏设置:', error);
  }
}

createApp(App).mount('#app')