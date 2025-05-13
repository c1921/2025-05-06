<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { gameEngine } from '../core/GameEngine';

// 游戏时间控制状态
const isPaused = ref(true);
const speedIndex = ref(1); // 默认速度 1x
const speedOptions = [0.5, 1, 2, 5, 10]; // 速度选项倍数

// 游戏时间状态（从游戏引擎中获取）
const year = computed(() => gameEngine.getCurrentYear());
const month = computed(() => gameEngine.getCurrentMonth());
const day = computed(() => gameEngine.getCurrentDay());
const hour = computed(() => gameEngine.getCurrentHour());

// 基础时间流逝速度（毫秒）
const baseTickMs = 1000; // 1000ms = 1小时游戏时间

// 计算当前实际tick速度
const currentTickMs = computed(() => {
  return baseTickMs / speedOptions[speedIndex.value];
});

// 格式化时间显示
const formattedMonth = computed(() => month.value.toString().padStart(2, '0'));
const formattedDay = computed(() => day.value.toString().padStart(2, '0'));
const formattedHour = computed(() => hour.value.toString().padStart(2, '0'));

// 时间计时器引用
let timeInterval: number | null = null;

// 最新消息通知
const latestMessage = ref('');
const hasMessage = ref(false);

// 显示消息通知
const showMessage = (message: string) => {
  latestMessage.value = message;
  hasMessage.value = true;
  
  // 5秒后自动清除消息
  setTimeout(() => {
    hasMessage.value = false;
  }, 5000);
};

// 启动时间流逝
const startTime = () => {
  if (timeInterval !== null) return;
  
  timeInterval = window.setInterval(() => {
    // 每次tick推进游戏时间1小时
    gameEngine.advanceTime(1);
  }, currentTickMs.value);
  
  isPaused.value = false;
};

// 暂停时间流逝
const pauseTime = () => {
  if (timeInterval !== null) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
  
  isPaused.value = true;
};

// 切换暂停/开始状态
const togglePause = () => {
  if (isPaused.value) {
    startTime();
  } else {
    pauseTime();
  }
};

// 加速时间
const increaseSpeed = () => {
  if (speedIndex.value < speedOptions.length - 1) {
    speedIndex.value++;
    // 如果时间在运行，需要重置时间间隔
    if (!isPaused.value) {
      pauseTime();
      startTime();
    }
  }
};

// 减速时间
const decreaseSpeed = () => {
  if (speedIndex.value > 0) {
    speedIndex.value--;
    // 如果时间在运行，需要重置时间间隔
    if (!isPaused.value) {
      pauseTime();
      startTime();
    }
  }
};

// 空格键控制时间暂停/继续
const handleKeyPress = (event: KeyboardEvent) => {
  // 只处理空格键
  if (event.code === 'Space' && !event.repeat) {
    // 防止按空格键时触发其他UI元素
    event.preventDefault();
    // 切换暂停/开始状态
    togglePause();
  }
};

// 当组件卸载时清理计时器和事件监听器
const cleanup = () => {
  if (timeInterval !== null) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
  // 移除键盘事件监听器
  window.removeEventListener('keydown', handleKeyPress);
};

// 监听速度变化
watch(() => speedIndex.value, () => {
  // 可以添加任何需要的速度变化处理逻辑
});

// 游戏事件监听
const setupGameEventListeners = () => {
  // 监听食物消耗事件
  gameEngine.addEventListener('foodConsumed', (result: { hungryCount: number, fedCount: number }) => {
    const message = `食物已消耗，${result.fedCount}人获得食物${result.hungryCount > 0 ? '，' + result.hungryCount + '人饥饿' : ''}`;
    showMessage(message);
  });
  
  // 监听饥饿事件
  gameEngine.addEventListener('hunger', (hungryCount: number, fedCount: number) => {
    showMessage(`警告: 食物不足！${hungryCount}人处于饥饿状态`);
  });
};

// 组件挂载和卸载
onMounted(() => {
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyPress);
  
  // 设置游戏事件监听器
  setupGameEventListeners();
});

onBeforeUnmount(() => {
  cleanup();
});

defineExpose({
  isPaused,
  speedIndex,
  togglePause,
  increaseSpeed,
  decreaseSpeed,
  startTime,
  pauseTime,
  cleanup
});
</script>

<template>
  <div class="relative">
    <!-- 消息通知 -->
    <div 
      v-if="hasMessage" 
      class="message-notification absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-2 bg-base-300 shadow-md rounded-md text-sm z-10 w-72 max-w-full"
    >
      {{ latestMessage }}
    </div>
    
    <div class="time-control flex flex-wrap items-center justify-center sm:justify-end gap-2">
      <!-- 时间显示 -->
      <div class="time-display font-mono text-base sm:text-lg bg-base-100 rounded-md px-2 py-1 shadow-sm">
        {{ year }}-{{ formattedMonth }}-{{ formattedDay }} {{ formattedHour }}:00
      </div>
      
      <!-- 控制按钮 -->
      <div class="time-controls flex items-center gap-1">
        <!-- 减速按钮 -->
        <button 
          @click="decreaseSpeed" 
          class="btn btn-sm btn-ghost btn-circle" 
          :disabled="speedIndex === 0"
          title="减慢速度"
        >
          <span class="icon-[tabler--minus] size-4"></span>
        </button>
        
        <!-- 暂停/播放按钮 -->
        <button 
          @click="togglePause" 
          class="btn btn-sm btn-primary btn-circle"
          :class="{ 'btn-outline': !isPaused }"
          title="空格键暂停/继续"
        >
          <span v-if="isPaused" class="icon-[tabler--player-play] size-4"></span>
          <span v-else class="icon-[tabler--player-pause] size-4"></span>
        </button>
        
        <!-- 加速按钮 -->
        <button 
          @click="increaseSpeed" 
          class="btn btn-sm btn-ghost btn-circle" 
          :disabled="speedIndex === speedOptions.length - 1"
          title="加快速度"
        >
          <span class="icon-[tabler--plus] size-4"></span>
        </button>
        
        <!-- 速度显示 -->
        <div class="speed-display text-xs font-mono bg-base-100 px-2 py-1 rounded-full ml-1">
          {{ speedOptions[speedIndex] }}x
        </div>
      </div>
    </div>
  </div>
</template> 