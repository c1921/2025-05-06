<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

// 地图参数
const props = defineProps({
  // 网格大小（像素）
  gridSize: {
    type: Number,
    default: 40
  },
  // 背景色
  backgroundColor: {
    type: String,
    default: '#f0f0f0'
  },
  // 网格线颜色
  gridColor: {
    type: String,
    default: '#cccccc'
  },
  // 是否可见（用于监听标签页切换）
  isVisible: {
    type: Boolean,
    default: true
  },
  // 移动速度
  moveSpeed: {
    type: Number,
    default: 5
  },
  // 最小缩放级别
  minZoom: {
    type: Number,
    default: 0.1
  },
  // 最大缩放级别
  maxZoom: {
    type: Number,
    default: 10
  }
});

// 发出事件
const emit = defineEmits(['positionChange', 'zoomChange']);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

// 视口状态
const cameraOffset = ref({ x: 0, y: 0 });
const zoom = ref(1);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const lastPinchDistance = ref<number | null>(null);
const frameId = ref<number | null>(null);

// 当前鼠标位置（用于显示坐标信息）
const mousePosition = ref({ x: 0, y: 0 });
const worldPosition = computed(() => {
  return {
    x: Math.floor((mousePosition.value.x - cameraOffset.value.x) / (props.gridSize * zoom.value)),
    y: Math.floor((mousePosition.value.y - cameraOffset.value.y) / (props.gridSize * zoom.value))
  };
});

// 按键状态
const keys = ref({
  w: false,
  a: false,
  s: false,
  d: false
});

// 性能优化：使用requestAnimationFrame控制重绘频率
let lastDrawTime = 0;
const drawThrottleMs = 16; // 约60fps

// 调整Canvas大小
const resizeCanvas = () => {
  if (!canvasRef.value || !containerRef.value) return;
  
  const container = containerRef.value;
  
  // 检查父元素是否有有效尺寸
  if (container.clientWidth <= 0 || container.clientHeight <= 0) {
    // 如果父元素尺寸无效，安排一个延迟重试
    setTimeout(resizeCanvas, 100);
    return;
  }
  
  // 设置Canvas尺寸为容器的实际尺寸
  canvasRef.value.width = container.clientWidth;
  canvasRef.value.height = container.clientHeight;
  
  // 重新绘制
  draw();
};

// 重置视图到中心点
const resetView = () => {
  if (!canvasRef.value) return;
  
  // 设置相机中心到画布中心点
  cameraOffset.value = {
    x: canvasRef.value.width / 2,
    y: canvasRef.value.height / 2
  };
  
  // 重置缩放级别
  zoom.value = 1;
  
  // 重新绘制
  draw();
  
  // 发出位置和缩放变化事件
  emit('positionChange', { x: 0, y: 0 });
  emit('zoomChange', 1);
};

// 监听可见性变化，在变为可见时重新调整大小
watch(() => props.isVisible, (newVal) => {
  if (newVal === true) {
    // 使用setTimeout确保DOM已经更新
    setTimeout(() => {
      resizeCanvas();
    }, 0);
  }
});

// 监听网格大小变化，重新绘制
watch(() => props.gridSize, () => {
  draw();
});

// 监听颜色变化，重新绘制
watch([() => props.backgroundColor, () => props.gridColor], () => {
  draw();
});

// 公开方法，允许从父组件调用
defineExpose({
  resizeCanvas,
  resetView,
  getPosition: () => ({
    x: (canvasRef.value?.width ? canvasRef.value.width / 2 : 0) - cameraOffset.value.x,
    y: (canvasRef.value?.height ? canvasRef.value.height / 2 : 0) - cameraOffset.value.y,
  }),
  getZoom: () => zoom.value
});

// 绘制网格
const draw = () => {
  if (!ctx.value || !canvasRef.value) return;
  
  const now = performance.now();
  if (now - lastDrawTime < drawThrottleMs) {
    return;
  }
  lastDrawTime = now;
  
  const width = canvasRef.value.width;
  const height = canvasRef.value.height;
  
  // 清除画布
  ctx.value.fillStyle = props.backgroundColor;
  ctx.value.fillRect(0, 0, width, height);
  
  // 计算可见区域的网格范围
  const gridSize = props.gridSize * zoom.value;
  const offsetX = cameraOffset.value.x % gridSize;
  const offsetY = cameraOffset.value.y % gridSize;
  
  // 优化：只在网格线宽度大于0.5像素时绘制
  if (gridSize > 0.5) {
    // 绘制网格线
    ctx.value.strokeStyle = props.gridColor;
    ctx.value.lineWidth = 1;
    ctx.value.beginPath();
    
    // 垂直线
    for (let x = offsetX; x < width; x += gridSize) {
      ctx.value.moveTo(x, 0);
      ctx.value.lineTo(x, height);
    }
    
    // 水平线
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.value.moveTo(0, y);
      ctx.value.lineTo(width, y);
    }
    
    ctx.value.stroke();
  }
  
  // 在坐标原点绘制一个标记
  const originX = cameraOffset.value.x;
  const originY = cameraOffset.value.y;
  
  ctx.value.fillStyle = 'red';
  ctx.value.beginPath();
  ctx.value.arc(originX, originY, 5, 0, Math.PI * 2);
  ctx.value.fill();
  
  // 绘制坐标轴
  ctx.value.strokeStyle = 'rgba(255, 0, 0, 0.8)';
  ctx.value.lineWidth = 2;
  ctx.value.beginPath();
  ctx.value.moveTo(originX, 0);
  ctx.value.lineTo(originX, height);
  ctx.value.moveTo(0, originY);
  ctx.value.lineTo(width, originY);
  ctx.value.stroke();
};

// 初始化Canvas
onMounted(() => {
  if (!canvasRef.value) return;
  
  ctx.value = canvasRef.value.getContext('2d', { alpha: false }); // alpha: false 可以提高性能
  
  // 使用setTimeout确保DOM已完全渲染
  setTimeout(() => {
    resizeCanvas();
    resetView();
  }, 0);
  
  // 监听窗口大小变化
  window.addEventListener('resize', resizeCanvas);
  
  // 添加事件监听器
  canvasRef.value.addEventListener('wheel', handleWheel, { passive: false });
  canvasRef.value.addEventListener('mousedown', handleMouseDown);
  canvasRef.value.addEventListener('mousemove', updateMousePosition);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  // 触摸事件支持
  canvasRef.value.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvasRef.value.addEventListener('touchend', handleTouchEnd);
  canvasRef.value.addEventListener('touchmove', handleTouchMove, { passive: false });
  
  // 开始动画循环
  startAnimationLoop();
});

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('wheel', handleWheel);
    canvasRef.value.removeEventListener('mousedown', handleMouseDown);
    canvasRef.value.removeEventListener('mousemove', updateMousePosition);
    canvasRef.value.removeEventListener('touchstart', handleTouchStart);
    canvasRef.value.removeEventListener('touchend', handleTouchEnd);
    canvasRef.value.removeEventListener('touchmove', handleTouchMove);
  }
  
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  
  // 停止动画循环
  stopAnimationLoop();
});

// 更新鼠标位置
const updateMousePosition = (e: MouseEvent) => {
  if (!canvasRef.value) return;
  
  mousePosition.value.x = e.clientX - canvasRef.value.getBoundingClientRect().left;
  mousePosition.value.y = e.clientY - canvasRef.value.getBoundingClientRect().top;
};

// 处理鼠标滚轮事件（缩放）
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  
  if (!canvasRef.value) return;
  
  // 获取鼠标位置
  const mouseX = e.clientX - canvasRef.value.getBoundingClientRect().left;
  const mouseY = e.clientY - canvasRef.value.getBoundingClientRect().top;
  
  // 计算缩放前的世界坐标
  const worldX = (mouseX - cameraOffset.value.x) / zoom.value;
  const worldY = (mouseY - cameraOffset.value.y) / zoom.value;
  
  // 调整缩放级别，更平滑的缩放体验
  const zoomAmount = -e.deltaY * 0.001;
  const newZoom = Math.max(props.minZoom, Math.min(props.maxZoom, zoom.value * (1 + zoomAmount)));
  
  // 如果缩放值相同，不进行操作
  if (newZoom === zoom.value) return;
  
  // 更新缩放级别
  zoom.value = newZoom;
  
  // 调整相机偏移，保持鼠标指向的世界坐标不变
  cameraOffset.value.x = mouseX - worldX * zoom.value;
  cameraOffset.value.y = mouseY - worldY * zoom.value;
  
  // 重新绘制
  draw();
  
  // 发出缩放变化事件
  emit('zoomChange', zoom.value);
};

// 处理鼠标按下事件（拖拽开始）
const handleMouseDown = (e: MouseEvent) => {
  if (e.button === 0) { // 左键
    isDragging.value = true;
    dragStart.value = { x: e.clientX, y: e.clientY };
  }
};

// 处理鼠标释放事件（拖拽结束）
const handleMouseUp = () => {
  isDragging.value = false;
  lastPinchDistance.value = null;
};

// 处理鼠标移动事件（拖拽进行中）
const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    const dx = e.clientX - dragStart.value.x;
    const dy = e.clientY - dragStart.value.y;
    
    cameraOffset.value.x += dx;
    cameraOffset.value.y += dy;
    
    dragStart.value = { x: e.clientX, y: e.clientY };
    
    // 重新绘制
    draw();
    
    // 发出位置变化事件
    if (canvasRef.value) {
      const centerX = (canvasRef.value.width / 2 - cameraOffset.value.x) / (props.gridSize * zoom.value);
      const centerY = (canvasRef.value.height / 2 - cameraOffset.value.y) / (props.gridSize * zoom.value);
      emit('positionChange', { x: centerX, y: centerY });
    }
  }
};

// 处理触摸开始事件
const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  
  if (e.touches.length === 1) {
    isDragging.value = true;
    dragStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    // 计算两指之间的距离，用于缩放
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    lastPinchDistance.value = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
  }
};

// 处理触摸移动事件
const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  
  if (isDragging.value && e.touches.length === 1) {
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.value.x;
    const dy = touch.clientY - dragStart.value.y;
    
    cameraOffset.value.x += dx;
    cameraOffset.value.y += dy;
    
    dragStart.value = { x: touch.clientX, y: touch.clientY };
    
    // 重新绘制
    draw();
    
    // 发出位置变化事件
    if (canvasRef.value) {
      const centerX = (canvasRef.value.width / 2 - cameraOffset.value.x) / (props.gridSize * zoom.value);
      const centerY = (canvasRef.value.height / 2 - cameraOffset.value.y) / (props.gridSize * zoom.value);
      emit('positionChange', { x: centerX, y: centerY });
    }
  } else if (e.touches.length === 2 && lastPinchDistance.value !== null) {
    // 处理双指缩放
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    // 计算新的两指之间的距离
    const newDistance = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
    
    // 计算缩放比例变化
    const zoomChange = newDistance / lastPinchDistance.value;
    
    if (!canvasRef.value) return;
    
    // 计算触摸点中心
    const touchCenter = {
      x: (touch1.clientX + touch2.clientX) / 2 - canvasRef.value.getBoundingClientRect().left,
      y: (touch1.clientY + touch2.clientY) / 2 - canvasRef.value.getBoundingClientRect().top
    };
    
    // 计算中心在世界坐标系中的位置
    const worldX = (touchCenter.x - cameraOffset.value.x) / zoom.value;
    const worldY = (touchCenter.y - cameraOffset.value.y) / zoom.value;
    
    // 计算新的缩放级别
    const newZoom = Math.max(props.minZoom, Math.min(props.maxZoom, zoom.value * zoomChange));
    
    // 如果缩放值相同，不进行操作
    if (newZoom === zoom.value) return;
    
    // 更新缩放级别
    zoom.value = newZoom;
    
    // 调整相机偏移，保持触摸点中心不变
    cameraOffset.value.x = touchCenter.x - worldX * zoom.value;
    cameraOffset.value.y = touchCenter.y - worldY * zoom.value;
    
    // 更新最后的触摸距离
    lastPinchDistance.value = newDistance;
    
    // 重新绘制
    draw();
    
    // 发出缩放变化事件
    emit('zoomChange', zoom.value);
  }
};

// 处理触摸结束事件
const handleTouchEnd = () => {
  isDragging.value = false;
  lastPinchDistance.value = null;
};

// 处理键盘按下事件（WASD移动）
const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  if (['w', 'a', 's', 'd'].includes(key)) {
    keys.value[key as 'w' | 'a' | 's' | 'd'] = true;
  }
};

// 处理键盘释放事件
const handleKeyUp = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  if (['w', 'a', 's', 'd'].includes(key)) {
    keys.value[key as 'w' | 'a' | 's' | 'd'] = false;
  }
};

// 开始动画循环
const startAnimationLoop = () => {
  const loop = () => {
    // 处理WASD移动
    const moveSpeed = props.moveSpeed;
    let moved = false;
    
    if (keys.value.w) {
      cameraOffset.value.y += moveSpeed;
      moved = true;
    }
    if (keys.value.s) {
      cameraOffset.value.y -= moveSpeed;
      moved = true;
    }
    if (keys.value.a) {
      cameraOffset.value.x += moveSpeed;
      moved = true;
    }
    if (keys.value.d) {
      cameraOffset.value.x -= moveSpeed;
      moved = true;
    }
    
    // 如果有按键被按下，重新绘制
    if (moved) {
      draw();
      
      // 发出位置变化事件
      if (canvasRef.value) {
        const centerX = (canvasRef.value.width / 2 - cameraOffset.value.x) / (props.gridSize * zoom.value);
        const centerY = (canvasRef.value.height / 2 - cameraOffset.value.y) / (props.gridSize * zoom.value);
        emit('positionChange', { x: centerX, y: centerY });
      }
    }
    
    // 继续循环
    frameId.value = requestAnimationFrame(loop);
  };
  
  frameId.value = requestAnimationFrame(loop);
};

// 停止动画循环
const stopAnimationLoop = () => {
  if (frameId.value !== null) {
    cancelAnimationFrame(frameId.value);
    frameId.value = null;
  }
};
</script>

<template>
  <div ref="containerRef" class="grid-map-container">
    <canvas ref="canvasRef" class="grid-map-canvas"></canvas>
    <div class="grid-map-controls">
      <div class="zoom-info">
        <span>缩放: {{ zoom.toFixed(2) }}x</span>
      </div>
      <div class="position-info">
        <span>坐标: ({{ worldPosition.x }}, {{ worldPosition.y }})</span>
      </div>
      <div class="control-buttons">
        <button @click="resetView" class="reset-button" title="重置视图">
          <span>⟳</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.grid-map-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none; /* 防止触摸设备上的默认行为 */
}

.grid-map-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 10;
}

.zoom-info, .position-info {
  margin-bottom: 4px;
}

.control-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
  pointer-events: auto;
}

.reset-button {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 3px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
}

.reset-button:hover {
  background-color: #f0f0f0;
}
</style> 