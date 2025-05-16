import { gameEngine } from '../core/GameEngine';
import { useInventory } from './inventoryService';
import { taskSystem } from '../core/TaskSystem';
import { ref } from 'vue';

// 保存版本号，用于未来升级兼容性处理
const SAVE_VERSION = '1.0.0';
const SAVE_KEY = 'settlement_game_save';

// 存档类型定义
export interface GameSave {
  version: string;
  timestamp: number;
  gameState: {
    currentYear: number;
    currentMonth: number;
    currentDay: number;
    currentHour: number;
    lastFoodConsumptionDay: number;
    roles: any[];
  };
  inventory: any[];
  tasks: any[]; // 添加任务系统状态
}

// 判断是否有存档
export function hasSavedGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

// 上次保存的时间戳
const lastSaveTimestamp = ref<number | null>(null);

// 保存游戏
export function saveGame(): boolean {
  try {
    const { inventory } = useInventory();
    
    // 构建存档数据
    const saveData: GameSave = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      gameState: {
        currentYear: gameEngine.getCurrentYear(),
        currentMonth: gameEngine.getCurrentMonth(),
        currentDay: gameEngine.getCurrentDay(),
        currentHour: gameEngine.getCurrentHour(),
        lastFoodConsumptionDay: gameEngine.getLastFoodConsumptionDay(),
        roles: gameEngine.getRoles()
      },
      inventory: inventory.value,
      tasks: taskSystem.getAllTasks() // 保存所有任务
    };
    
    // 保存到本地存储
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    
    // 更新保存时间戳
    lastSaveTimestamp.value = saveData.timestamp;
    return true;
  } catch (error) {
    console.error('保存游戏失败:', error);
    return false;
  }
}

// 加载游戏
export function loadGame(): boolean {
  try {
    const saveJson = localStorage.getItem(SAVE_KEY);
    if (!saveJson) return false;
    
    const saveData: GameSave = JSON.parse(saveJson);
    
    // 检查版本兼容性 - 未来可能需要版本迁移逻辑
    if (!saveData.version || saveData.version !== SAVE_VERSION) {
      console.warn('存档版本不匹配，可能需要更新');
      // 这里可以添加版本迁移逻辑
    }
    
    // 恢复库存
    const { inventory } = useInventory();
    inventory.value = saveData.inventory;
    
    // 恢复游戏状态
    gameEngine.loadGameState(saveData.gameState);
    
    // 恢复任务系统状态
    if (saveData.tasks) {
      taskSystem.loadTasks(saveData.tasks);
    }
    
    // 更新保存时间戳
    lastSaveTimestamp.value = saveData.timestamp;
    return true;
  } catch (error) {
    console.error('加载游戏失败:', error);
    return false;
  }
}

// 删除存档
export function deleteSave(): boolean {
  try {
    localStorage.removeItem(SAVE_KEY);
    lastSaveTimestamp.value = null;
    return true;
  } catch (error) {
    console.error('删除存档失败:', error);
    return false;
  }
}

// 获取上次保存时间
export function getLastSaveTime(): number | null {
  return lastSaveTimestamp.value;
}

// 格式化保存时间
export function formatSaveTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// 自动初始化上次保存时间
if (hasSavedGame()) {
  try {
    const saveJson = localStorage.getItem(SAVE_KEY);
    if (saveJson) {
      const saveData: GameSave = JSON.parse(saveJson);
      lastSaveTimestamp.value = saveData.timestamp;
    }
  } catch (error) {
    console.error('读取保存时间失败:', error);
  }
} 