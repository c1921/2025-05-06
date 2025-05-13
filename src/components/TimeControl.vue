<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

// 游戏时间控制状态
const isPaused = ref(true);
const speedIndex = ref(1); // 默认速度 1x
const speedOptions = [0.5, 1, 2, 5, 10]; // 速度选项倍数

// 游戏时间状态
const year = ref(2025);
const month = ref(1);
const day = ref(1);
const hour = ref(0);

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

// 启动时间流逝
const startTime = () => {
  if (timeInterval !== null) return;
  
  timeInterval = window.setInterval(() => {
    advanceTime();
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

// 推进时间
const advanceTime = () => {
  hour.value++;
  if (hour.value >= 24) {
    hour.value = 0;
    day.value++;
    
    // 处理月份变更
    const daysInMonth = new Date(year.value, month.value, 0).getDate();
    if (day.value > daysInMonth) {
      day.value = 1;
      month.value++;
      
      if (month.value > 12) {
        month.value = 1;
        year.value++;
      }
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

// 组件挂载和卸载
onMounted(() => {
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyPress);
});

onBeforeUnmount(() => {
  cleanup();
});

defineExpose({
  isPaused,
  speedIndex,
  year,
  month,
  day,
  hour,
  togglePause,
  increaseSpeed,
  decreaseSpeed,
  startTime,
  pauseTime,
  cleanup
});
</script>

<template>
  <div class="time-control flex items-center gap-2">
    <!-- 时间显示 -->
    <div class="time-display font-mono text-lg">
      {{ year }}-{{ formattedMonth }}-{{ formattedDay }} {{ formattedHour }}:00
    </div>
    
    <!-- 控制按钮 -->
    <div class="time-controls flex items-center gap-1">
      <!-- 减速按钮 -->
      <button 
        @click="decreaseSpeed" 
        class="btn btn-sm btn-ghost" 
        :disabled="speedIndex === 0"
        title="减慢速度"
      >
        <span class="icon-[tabler--minus] size-4"></span>
      </button>
      
      <!-- 暂停/播放按钮 -->
      <button 
        @click="togglePause" 
        class="btn btn-sm btn-primary"
        :class="{ 'btn-outline': !isPaused }"
        title="空格键暂停/继续"
      >
        <span v-if="isPaused" class="icon-[tabler--player-play] size-4"></span>
        <span v-else class="icon-[tabler--player-pause] size-4"></span>
      </button>
      
      <!-- 加速按钮 -->
      <button 
        @click="increaseSpeed" 
        class="btn btn-sm btn-ghost" 
        :disabled="speedIndex === speedOptions.length - 1"
        title="加快速度"
      >
        <span class="icon-[tabler--plus] size-4"></span>
      </button>
    </div>
    
    <!-- 速度显示 -->
    <div class="speed-display text-sm opacity-70">
      {{ speedOptions[speedIndex] }}x
    </div>
  </div>
</template> 