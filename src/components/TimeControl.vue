<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { timeManager } from '../core/TimeManager';

// 初始化时间管理器
onMounted(() => {
  timeManager.init();
});

// 组件卸载时清理
onBeforeUnmount(() => {
  timeManager.cleanup();
});

// 格式化时间显示
const year = computed(() => timeManager.getCurrentYear());
const month = computed(() => timeManager.getCurrentMonth());
const day = computed(() => timeManager.getCurrentDay());
const hour = computed(() => timeManager.getCurrentHour());

const formattedMonth = computed(() => month.value.toString().padStart(2, '0'));
const formattedDay = computed(() => day.value.toString().padStart(2, '0'));
const formattedHour = computed(() => hour.value.toString().padStart(2, '0'));

// 利用计算属性解决ref对比问题
const isSpeedMin = computed(() => timeManager.speedIndex.value === 0);
const isSpeedMax = computed(() => timeManager.speedIndex.value === timeManager.speedOptions.length - 1);
const currentSpeed = computed(() => timeManager.speedOptions[timeManager.speedIndex.value]);
const isPaused = computed(() => timeManager.isPaused.value);

// 暴露必要的方法给父组件
defineExpose({
  isPaused: timeManager.isPaused,
  togglePause: timeManager.togglePause,
  increaseSpeed: timeManager.increaseSpeed,
  decreaseSpeed: timeManager.decreaseSpeed
});
</script>

<template>
  <div class="relative">
    <!-- 消息通知 -->
    <div 
      v-if="timeManager.hasMessage.value" 
      class="message-notification absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-2 bg-base-300 shadow-md rounded-md text-sm z-10 w-72 max-w-full"
    >
      {{ timeManager.latestMessage.value }}
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
          @click="timeManager.decreaseSpeed" 
          class="btn btn-sm btn-ghost btn-circle" 
          :disabled="isSpeedMin"
          title="减慢速度"
        >
          <span class="icon-[tabler--minus] size-4"></span>
        </button>
        
        <!-- 暂停/播放按钮 -->
        <button 
          @click="timeManager.togglePause" 
          class="btn btn-sm btn-primary btn-circle"
          :class="{ 'btn-outline': !isPaused }"
          title="空格键暂停/继续"
        >
          <span v-if="isPaused" class="icon-[tabler--player-play] size-4"></span>
          <span v-else class="icon-[tabler--player-pause] size-4"></span>
        </button>
        
        <!-- 加速按钮 -->
        <button 
          @click="timeManager.increaseSpeed" 
          class="btn btn-sm btn-ghost btn-circle" 
          :disabled="isSpeedMax"
          title="加快速度"
        >
          <span class="icon-[tabler--plus] size-4"></span>
        </button>
        
        <!-- 速度显示 -->
        <div class="speed-display text-xs font-mono bg-base-100 px-2 py-1 rounded-full ml-1">
          {{ currentSpeed }}x
        </div>
      </div>
    </div>
  </div>
</template> 