import { ref, computed, watch } from 'vue';
import { gameEngine } from './GameEngine';

// 游戏时间控制状态
const isPaused = ref(true);
const speedIndex = ref(1); // 默认速度 1x
const speedOptions = [0.5, 1, 2, 5, 10]; // 速度选项倍数

// 基础时间流逝速度（毫秒）
const baseTickMs = 1000; // 1000ms = 1小时游戏时间

// 计算当前实际tick速度
const currentTickMs = computed(() => {
  return baseTickMs / speedOptions[speedIndex.value];
});

// 时间计时器引用
let timeInterval: number | null = null;

// 启动时间流逝
function startTime(): void {
  if (timeInterval !== null) return;
  
  timeInterval = window.setInterval(() => {
    // 每次tick推进游戏时间1小时
    gameEngine.advanceTime(1);
  }, currentTickMs.value);
  
  isPaused.value = false;
}

// 暂停时间流逝
function pauseTime(): void {
  if (timeInterval !== null) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
  
  isPaused.value = true;
}

// 切换暂停/开始状态
function togglePause(): void {
  if (isPaused.value) {
    startTime();
  } else {
    pauseTime();
  }
}

// 加速时间
function increaseSpeed(): void {
  if (speedIndex.value < speedOptions.length - 1) {
    speedIndex.value++;
    // 如果时间在运行，需要重置时间间隔
    if (!isPaused.value) {
      pauseTime();
      startTime();
    }
  }
}

// 减速时间
function decreaseSpeed(): void {
  if (speedIndex.value > 0) {
    speedIndex.value--;
    // 如果时间在运行，需要重置时间间隔
    if (!isPaused.value) {
      pauseTime();
      startTime();
    }
  }
}

// 空格键控制时间暂停/继续
function handleKeyPress(event: KeyboardEvent): void {
  // 只处理空格键
  if (event.code === 'Space' && !event.repeat) {
    // 防止按空格键时触发其他UI元素
    event.preventDefault();
    // 切换暂停/开始状态
    togglePause();
  }
}

// 当系统卸载时清理计时器和事件监听器
function cleanup(): void {
  if (timeInterval !== null) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
  // 移除键盘事件监听器
  window.removeEventListener('keydown', handleKeyPress);
}

// 初始化时间管理器
function initTimeManager(): void {
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyPress);
  
  // 监听速度变化
  watch(() => speedIndex.value, () => {
    // 可以添加任何需要的速度变化处理逻辑
  });
}

// 导出时间管理器接口
export const timeManager = {
  // 状态
  isPaused,
  speedIndex,
  speedOptions,
  currentTickMs,
  
  // 游戏时间计算函数（从GameEngine获取）
  getCurrentYear: () => gameEngine.getCurrentYear(),
  getCurrentMonth: () => gameEngine.getCurrentMonth(),
  getCurrentDay: () => gameEngine.getCurrentDay(),
  getCurrentHour: () => gameEngine.getCurrentHour(),
  
  // 动作方法
  startTime,
  pauseTime,
  togglePause,
  increaseSpeed,
  decreaseSpeed,
  cleanup,
  
  // 初始化
  init: initTimeManager
}; 