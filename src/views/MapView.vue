<script setup lang="ts">
import GridMap from '../components/GridMap.vue';
import { ref, computed } from 'vue';

// 网格地图配置
const gridSize = ref(40);
const backgroundColor = ref('#f0f0f0');
const gridColor = ref('#cccccc');
const moveSpeed = ref(5);
const minZoom = ref(0.1);
const maxZoom = ref(10);

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

// 更改网格大小
const changeGridSize = (size: number) => {
  gridSize.value = size;
};

// 更改背景颜色
const changeBackgroundColor = (color: string) => {
  backgroundColor.value = color;
};

// 更改网格线颜色
const changeGridColor = (color: string) => {
  gridColor.value = color;
};

// 更改移动速度
const changeMoveSpeed = (speed: number) => {
  moveSpeed.value = speed;
};

// 当前位置格式化显示
const formattedPosition = computed(() => {
  return `(${mapPosition.value.x.toFixed(1)}, ${mapPosition.value.y.toFixed(1)})`;
});
</script>

<template>
  <div class="grid-map-demo">
    <div class="controls">
      <div class="control-section">
        <h3>地图设置</h3>
        <div class="control-group">
          <label>网格大小:</label>
          <div class="button-group">
            <button @click="changeGridSize(20)" :class="{ active: gridSize === 20 }">小</button>
            <button @click="changeGridSize(40)" :class="{ active: gridSize === 40 }">中</button>
            <button @click="changeGridSize(60)" :class="{ active: gridSize === 60 }">大</button>
          </div>
          <span class="value-display">{{ gridSize }}px</span>
        </div>
        
        <div class="control-group">
          <label>移动速度:</label>
          <div class="button-group">
            <button @click="changeMoveSpeed(3)" :class="{ active: moveSpeed === 3 }">慢</button>
            <button @click="changeMoveSpeed(5)" :class="{ active: moveSpeed === 5 }">中</button>
            <button @click="changeMoveSpeed(10)" :class="{ active: moveSpeed === 10 }">快</button>
          </div>
          <span class="value-display">{{ moveSpeed }}</span>
        </div>
        
        <div class="control-group">
          <label>背景颜色:</label>
          <div class="color-buttons">
            <button @click="changeBackgroundColor('#f0f0f0')" class="color-btn" :style="{ backgroundColor: '#f0f0f0' }" :class="{ active: backgroundColor === '#f0f0f0' }"></button>
            <button @click="changeBackgroundColor('#e0e0ff')" class="color-btn" :style="{ backgroundColor: '#e0e0ff' }" :class="{ active: backgroundColor === '#e0e0ff' }"></button>
            <button @click="changeBackgroundColor('#e0ffe0')" class="color-btn" :style="{ backgroundColor: '#e0ffe0' }" :class="{ active: backgroundColor === '#e0ffe0' }"></button>
            <button @click="changeBackgroundColor('#ffffe0')" class="color-btn" :style="{ backgroundColor: '#ffffe0' }" :class="{ active: backgroundColor === '#ffffe0' }"></button>
          </div>
        </div>
        
        <div class="control-group">
          <label>网格线颜色:</label>
          <div class="color-buttons">
            <button @click="changeGridColor('#cccccc')" class="color-btn" :style="{ backgroundColor: '#cccccc' }" :class="{ active: gridColor === '#cccccc' }"></button>
            <button @click="changeGridColor('#aaaaff')" class="color-btn" :style="{ backgroundColor: '#aaaaff' }" :class="{ active: gridColor === '#aaaaff' }"></button>
            <button @click="changeGridColor('#aaffaa')" class="color-btn" :style="{ backgroundColor: '#aaffaa' }" :class="{ active: gridColor === '#aaffaa' }"></button>
            <button @click="changeGridColor('#ffaaaa')" class="color-btn" :style="{ backgroundColor: '#ffaaaa' }" :class="{ active: gridColor === '#ffaaaa' }"></button>
          </div>
        </div>
      </div>
      
      <div class="status-section">
        <h3>地图状态</h3>
        <div class="status-row">
          <span class="status-label">当前位置:</span>
          <span>{{ formattedPosition }}</span>
        </div>
        <div class="status-row">
          <span class="status-label">当前缩放:</span>
          <span>{{ mapZoom.toFixed(2) }}x</span>
        </div>
        <div class="status-actions">
          <button @click="resetMapView" class="action-button">重置视图</button>
        </div>
      </div>
      
      <div class="instructions">
        <h3>操作指南</h3>
        <ul>
          <li><kbd>鼠标拖拽</kbd> 或 <kbd>WASD</kbd> 键移动地图</li>
          <li><kbd>滚轮</kbd> 缩放地图</li>
          <li>触摸设备上支持<kbd>单指拖拽</kbd>和<kbd>双指缩放</kbd></li>
        </ul>
      </div>
    </div>
    
    <div class="map-container">
      <GridMap
        ref="gridMapRef"
        :gridSize="gridSize"
        :backgroundColor="backgroundColor"
        :gridColor="gridColor"
        :moveSpeed="moveSpeed"
        :minZoom="minZoom"
        :maxZoom="maxZoom"
        @position-change="handlePositionChange"
        @zoom-change="handleZoomChange"
      />
    </div>
  </div>
</template>

<style scoped>
.grid-map-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.controls {
  padding: 15px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #ddd;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.control-section, .status-section, .instructions {
  overflow: hidden;
}

h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #444;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.control-group {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

label {
  min-width: 80px;
  font-weight: 500;
  color: #555;
}

.button-group {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
}

button {
  padding: 4px 8px;
  background-color: #fff;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 13px;
}

.button-group button {
  border-radius: 0;
  border-right: none;
}

.button-group button:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.button-group button:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  border-right: 1px solid #ddd;
}

button.active {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
  position: relative;
  z-index: 1;
}

button:hover:not(.active) {
  background-color: #f9f9f9;
}

.color-buttons {
  display: flex;
  gap: 8px;
}

.color-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  padding: 0;
  border: 1px solid #ddd;
  position: relative;
}

.color-btn.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  text-shadow: 0 0 1px white;
}

.value-display {
  min-width: 40px;
  text-align: center;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.status-section {
  display: flex;
  flex-direction: column;
}

.status-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.status-label {
  min-width: 80px;
  color: #555;
  font-weight: 500;
}

.status-actions {
  margin-top: 10px;
}

.action-button {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.action-button:hover {
  background-color: #e6e6e6;
}

.map-container {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.6;
}

kbd {
  background-color: #f7f7f7;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.2);
  color: #333;
  display: inline-block;
  font-family: monospace;
  font-size: 12px;
  padding: 2px 4px;
  white-space: nowrap;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .controls {
    grid-template-columns: 1fr;
  }
  
  .instructions {
    display: none;
  }
}

@media (max-width: 480px) {
  .controls {
    padding: 10px;
  }
  
  .control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  label {
    min-width: auto;
  }
}
</style> 