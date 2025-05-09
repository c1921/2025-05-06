<script setup lang="ts">
import GridMap from '../components/GridMap.vue';
import { ref, computed } from 'vue';

// 网格地图配置（使用固定值）
const gridSize = ref(40);
const backgroundColor = ref('#333333');
const gridColor = ref('#444444');
const borderColor = ref('#000000');
const moveSpeed = ref(5);
const minZoom = ref(0.1);
const maxZoom = ref(10);
const mapWidth = ref(500);
const mapHeight = ref(500);

// 地图当前状态
const mapPosition = ref({ x: 0, y: 0 });
const mapZoom = ref(1);

// 地图组件引用
const gridMapRef = ref<InstanceType<typeof GridMap> | null>(null);

// 重置地图视图
const resetMapView = () => {
  gridMapRef.value?.resetView();
};

// 处理位置变化
const handlePositionChange = (position: { x: number, y: number }) => {
  mapPosition.value = position;
};

// 处理缩放变化
const handleZoomChange = (zoom: number) => {
  mapZoom.value = zoom;
};

// 更改移动速度
const changeMoveSpeed = (speed: number) => {
  moveSpeed.value = speed;
};

// 当前位置格式化显示
const formattedPosition = computed(() => {
  return `(${mapPosition.value.x.toFixed(0)}, ${mapPosition.value.y.toFixed(0)})`;
});

// 检查当前位置是否在地图范围内
const isInMapBounds = computed(() => {
  return gridMapRef.value?.isInMapBounds(mapPosition.value.x, mapPosition.value.y) ?? false;
});
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <div class="bg-base-200 border-b border-base-300 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="overflow-hidden">
        <h3 class="text-base font-medium text-base-content mb-2 pb-1 border-b border-base-300">Map Controls</h3>
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="font-medium text-sm text-base-content/70 w-20">Move Speed:</span>
          <div class="join">
            <button @click="changeMoveSpeed(3)" class="btn btn-sm join-item" :class="moveSpeed === 3 ? 'btn-primary' : 'btn-outline'">Slow</button>
            <button @click="changeMoveSpeed(5)" class="btn btn-sm join-item" :class="moveSpeed === 5 ? 'btn-primary' : 'btn-outline'">Medium</button>
            <button @click="changeMoveSpeed(10)" class="btn btn-sm join-item" :class="moveSpeed === 10 ? 'btn-primary' : 'btn-outline'">Fast</button>
          </div>
          <span class="badge">{{ moveSpeed }}</span>
        </div>
      </div>
      
      <div class="overflow-hidden">
        <h3 class="text-base font-medium text-base-content mb-2 pb-1 border-b border-base-300">Map Status</h3>
        <div class="flex items-center mb-1">
          <span class="font-medium text-sm text-base-content/70 w-20">Position:</span>
          <span>{{ formattedPosition }}</span>
          <span v-if="!isInMapBounds" class="text-error text-xs ml-2">(Out of bounds)</span>
        </div>
        <div class="flex items-center mb-1">
          <span class="font-medium text-sm text-base-content/70 w-20">Zoom:</span>
          <span>{{ mapZoom.toFixed(2) }}x</span>
        </div>
        <div class="flex items-center mb-1">
          <span class="font-medium text-sm text-base-content/70 w-20">Map Size:</span>
          <span>{{ mapWidth }}×{{ mapHeight }} cells</span>
        </div>
        <div class="mt-3">
          <button @click="resetMapView" class="btn btn-sm btn-outline">Reset View</button>
        </div>
      </div>
      
      <div class="overflow-hidden hidden md:block">
        <h3 class="text-base font-medium text-base-content mb-2 pb-1 border-b border-base-300">Instructions</h3>
        <ul class="text-sm space-y-1 list-disc pl-5">
          <li><kbd class="kbd kbd-sm">Mouse drag</kbd> or <kbd class="kbd kbd-sm">WASD</kbd> keys to move map</li>
          <li><kbd class="kbd kbd-sm">Scroll wheel</kbd> to zoom</li>
          <li>Touch devices support <kbd class="kbd kbd-sm">one finger drag</kbd> and <kbd class="kbd kbd-sm">pinch zoom</kbd></li>
          <li>Red border shows map boundaries (500×500)</li>
          <li>Yellow highlight shows the cell under cursor</li>
        </ul>
      </div>
    </div>
    
    <div class="flex-grow relative overflow-hidden">
      <GridMap
        ref="gridMapRef"
        :gridSize="gridSize"
        :backgroundColor="backgroundColor"
        :gridColor="gridColor"
        :borderColor="borderColor"
        :moveSpeed="moveSpeed"
        :minZoom="minZoom"
        :maxZoom="maxZoom"
        :mapWidth="mapWidth"
        :mapHeight="mapHeight"
        @position-change="handlePositionChange"
        @zoom-change="handleZoomChange"
      />
    </div>
  </div>
</template> 