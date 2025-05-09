<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

// 类型定义
interface Point {
  x: number;
  y: number;
}

interface Cell extends Point {}

// 地图参数
const props = defineProps({
  gridSize: { type: Number, default: 40 },
  backgroundColor: { type: String, default: '#f0f0f0' },
  gridColor: { type: String, default: '#cccccc' },
  borderColor: { type: String, default: '#ff0000' },
  isVisible: { type: Boolean, default: true },
  moveSpeed: { type: Number, default: 5 },
  minZoom: { type: Number, default: 0.1 },
  maxZoom: { type: Number, default: 10 },
  mapWidth: { type: Number, default: 500 },
  mapHeight: { type: Number, default: 500 },
  hoverColor: { type: String, default: 'rgba(255, 255, 0, 0.3)' },
  selectedColor: { type: String, default: 'rgba(0, 255, 0, 0.5)' }
});

// 发出事件
const emit = defineEmits(['positionChange', 'zoomChange', 'cellSelected']);

// DOM引用
const canvasRef = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

// 视口状态
const cameraOffset = ref<Point>({ x: 0, y: 0 });
const zoom = ref(1);
const isDragging = ref(false);
const dragStart = ref<Point>({ x: 0, y: 0 });
const lastPinchDistance = ref<number | null>(null);
const frameId = ref<number | null>(null);

// 鼠标位置
const mousePosition = ref<Point>({ x: 0, y: 0 });
const worldPosition = computed<Point>(() => ({
  x: Math.floor((mousePosition.value.x - cameraOffset.value.x) / (props.gridSize * zoom.value)),
  y: Math.floor((mousePosition.value.y - cameraOffset.value.y) / (props.gridSize * zoom.value))
}));

// 选中的格子
const selectedCell = ref<Cell | null>(null);

// 计算地图的像素尺寸
const mapPixelWidth = computed(() => props.mapWidth * props.gridSize);
const mapPixelHeight = computed(() => props.mapHeight * props.gridSize);

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
let drawRequestId: number | null = null;

// 判断坐标是否在地图范围内
const isInMapBounds = (x: number, y: number): boolean => 
  x >= 0 && x < props.mapWidth && y >= 0 && y < props.mapHeight;

// 获取元素的边界矩形，优化性能
const getElementRect = (element: HTMLElement): DOMRect => element.getBoundingClientRect();

// 请求重绘，使用requestAnimationFrame防止过度重绘
const requestDraw = () => {
  if (drawRequestId) return;
  drawRequestId = requestAnimationFrame(() => {
    draw();
    drawRequestId = null;
  });
};

// 调整Canvas大小
const resizeCanvas = () => {
  if (!canvasRef.value || !containerRef.value) return;
  
  const container = containerRef.value;
  
  // 检查父元素是否有有效尺寸
  if (container.clientWidth <= 0 || container.clientHeight <= 0) {
    setTimeout(resizeCanvas, 100);
    return;
  }
  
  // 设置Canvas尺寸为容器的实际尺寸
  canvasRef.value.width = container.clientWidth;
  canvasRef.value.height = container.clientHeight;
  
  requestDraw();
};

// 重置视图到中心点
const resetView = () => {
  if (!canvasRef.value) return;
  
  // 设置相机中心到画布中心点，并考虑地图中心
  cameraOffset.value = {
    x: canvasRef.value.width / 2 - (mapPixelWidth.value / 2) * zoom.value,
    y: canvasRef.value.height / 2 - (mapPixelHeight.value / 2) * zoom.value
  };
  
  // 重置缩放级别
  zoom.value = 1;
  
  requestDraw();
  
  // 发出位置和缩放变化事件
  emit('positionChange', { x: props.mapWidth / 2, y: props.mapHeight / 2 });
  emit('zoomChange', 1);
};

// 绘制网格
const draw = () => {
  if (!ctx.value || !canvasRef.value) return;
  
  const now = performance.now();
  if (now - lastDrawTime < drawThrottleMs) {
    return;
  }
  lastDrawTime = now;
  
  const { width, height } = canvasRef.value;
  const { value: ctxValue } = ctx;
  
  // 清除画布
  ctxValue.fillStyle = props.backgroundColor;
  ctxValue.fillRect(0, 0, width, height);
  
  // 计算网格单元格大小
  const gridSize = props.gridSize * zoom.value;
  
  // 计算地图的像素尺寸（考虑缩放）
  const scaledMapWidth = mapPixelWidth.value * zoom.value;
  const scaledMapHeight = mapPixelHeight.value * zoom.value;
  
  // 计算地图左上角在画布中的位置
  const mapLeft = cameraOffset.value.x;
  const mapTop = cameraOffset.value.y;
  
  // 计算可见区域的网格范围
  const startCol = Math.max(0, Math.floor(-mapLeft / gridSize));
  const endCol = Math.min(props.mapWidth, Math.ceil((width - mapLeft) / gridSize));
  const startRow = Math.max(0, Math.floor(-mapTop / gridSize));
  const endRow = Math.min(props.mapHeight, Math.ceil((height - mapTop) / gridSize));
  
  // 绘制背景区域（表示地图边界）
  ctxValue.fillStyle = props.backgroundColor;
  ctxValue.fillRect(mapLeft, mapTop, scaledMapWidth, scaledMapHeight);
  
  // 优化：只在网格线宽度大于0.5像素时绘制
  if (gridSize > 0.5) {
    // 绘制网格线
    ctxValue.strokeStyle = props.gridColor;
    ctxValue.lineWidth = 1;
    ctxValue.beginPath();
    
    // 垂直线
    for (let x = startCol; x <= endCol; x++) {
      const posX = mapLeft + x * gridSize;
      ctxValue.moveTo(posX, mapTop);
      ctxValue.lineTo(posX, mapTop + scaledMapHeight);
    }
    
    // 水平线
    for (let y = startRow; y <= endRow; y++) {
      const posY = mapTop + y * gridSize;
      ctxValue.moveTo(mapLeft, posY);
      ctxValue.lineTo(mapLeft + scaledMapWidth, posY);
    }
    
    ctxValue.stroke();
  }
  
  // 绘制地图边界
  ctxValue.strokeStyle = props.borderColor;
  ctxValue.lineWidth = 2;
  ctxValue.strokeRect(mapLeft, mapTop, scaledMapWidth, scaledMapHeight);
  
  // 绘制坐标轴
  ctxValue.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  ctxValue.lineWidth = 1;
  ctxValue.beginPath();
  
  // X轴
  const xAxisY = mapTop + (props.mapHeight / 2) * gridSize;
  ctxValue.moveTo(mapLeft, xAxisY);
  ctxValue.lineTo(mapLeft + scaledMapWidth, xAxisY);
  
  // Y轴
  const yAxisX = mapLeft + (props.mapWidth / 2) * gridSize;
  ctxValue.moveTo(yAxisX, mapTop);
  ctxValue.lineTo(yAxisX, mapTop + scaledMapHeight);
  
  ctxValue.stroke();
  
  // 绘制原点（地图中心）
  const originX = mapLeft + (props.mapWidth / 2) * gridSize;
  const originY = mapTop + (props.mapHeight / 2) * gridSize;
  
  ctxValue.fillStyle = 'red';
  ctxValue.beginPath();
  ctxValue.arc(originX, originY, 5, 0, Math.PI * 2);
  ctxValue.fill();
  
  // 绘制选中的格子（如果有）
  if (selectedCell.value && isInMapBounds(selectedCell.value.x, selectedCell.value.y)) {
    drawHighlightedCell(selectedCell.value, props.selectedColor, 'rgba(0, 255, 0, 0.8)', 2);
  }
  
  // 绘制当前鼠标位置的指示器（如果在地图范围内且不是选中的格子）
  const { x: worldX, y: worldY } = worldPosition.value;
  if (isInMapBounds(worldX, worldY) && 
      (!selectedCell.value || selectedCell.value.x !== worldX || selectedCell.value.y !== worldY)) {
    // 绘制高亮格子
    drawHighlightedCell({ x: worldX, y: worldY }, props.hoverColor);
    
    // 绘制十字光标
    const cursorX = mapLeft + (worldX + 0.5) * gridSize;
    const cursorY = mapTop + (worldY + 0.5) * gridSize;
    
    ctxValue.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctxValue.lineWidth = 1;
    ctxValue.beginPath();
    ctxValue.moveTo(cursorX - 10, cursorY);
    ctxValue.lineTo(cursorX + 10, cursorY);
    ctxValue.moveTo(cursorX, cursorY - 10);
    ctxValue.lineTo(cursorX, cursorY + 10);
    ctxValue.stroke();
  }
};

// 绘制高亮单元格
const drawHighlightedCell = (cell: Cell, fillColor: string, strokeColor?: string, lineWidth?: number) => {
  if (!ctx.value) return;
  
  const gridSize = props.gridSize * zoom.value;
  const mapLeft = cameraOffset.value.x;
  const mapTop = cameraOffset.value.y;
  
  // 填充格子
  ctx.value.fillStyle = fillColor;
  ctx.value.fillRect(
    mapLeft + cell.x * gridSize,
    mapTop + cell.y * gridSize,
    gridSize,
    gridSize
  );
  
  // 如果提供了边框颜色，绘制边框
  if (strokeColor) {
    ctx.value.strokeStyle = strokeColor;
    ctx.value.lineWidth = lineWidth || 1;
    ctx.value.strokeRect(
      mapLeft + cell.x * gridSize,
      mapTop + cell.y * gridSize,
      gridSize,
      gridSize
    );
  }
};

// 事件处理器
const handleClick = () => {
  const { x, y } = worldPosition.value;
  
  if (isInMapBounds(x, y)) {
    // 如果点击的是已选中的格子，则取消选中
    if (selectedCell.value && selectedCell.value.x === x && selectedCell.value.y === y) {
      selectedCell.value = null;
    } else {
      // 否则选中当前格子
      selectedCell.value = { x, y };
    }
    
    // 发出格子选中事件
    emit('cellSelected', selectedCell.value);
    requestDraw();
  }
};

// 更新鼠标位置
const updateMousePosition = (e: MouseEvent) => {
  if (!canvasRef.value) return;
  
  const rect = getElementRect(canvasRef.value);
  mousePosition.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  
  requestDraw();
};

// 处理鼠标滚轮事件（缩放）
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  
  if (!canvasRef.value) return;
  
  const rect = getElementRect(canvasRef.value);
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
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
  cameraOffset.value = {
    x: mouseX - worldX * zoom.value,
    y: mouseY - worldY * zoom.value
  };
  
  requestDraw();
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
    
    requestDraw();
    emit('positionChange', worldPosition.value);
  }
  
  // 更新鼠标位置以实现悬浮效果
  updateMousePosition(e);
};

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  
  if (e.touches.length === 1) {
    isDragging.value = true;
    dragStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    // 计算两指之间的距离，用于缩放
    const [touch1, touch2] = [e.touches[0], e.touches[1]];
    lastPinchDistance.value = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
  }
};

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  
  if (isDragging.value && e.touches.length === 1) {
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.value.x;
    const dy = touch.clientY - dragStart.value.y;
    
    cameraOffset.value.x += dx;
    cameraOffset.value.y += dy;
    
    dragStart.value = { x: touch.clientX, y: touch.clientY };
    
    requestDraw();
    emit('positionChange', worldPosition.value);
  } else if (e.touches.length === 2 && lastPinchDistance.value !== null) {
    handlePinchZoom(e);
  }
};

// 处理双指缩放
const handlePinchZoom = (e: TouchEvent) => {
  if (!canvasRef.value || lastPinchDistance.value === null) return;
  
  const [touch1, touch2] = [e.touches[0], e.touches[1]];
  
  // 计算新的两指之间的距离
  const newDistance = Math.hypot(
    touch1.clientX - touch2.clientX,
    touch1.clientY - touch2.clientY
  );
  
  // 计算缩放比例变化
  const zoomChange = newDistance / lastPinchDistance.value;
  
  const rect = getElementRect(canvasRef.value);
  
  // 计算触摸点中心
  const touchCenter = {
    x: (touch1.clientX + touch2.clientX) / 2 - rect.left,
    y: (touch1.clientY + touch2.clientY) / 2 - rect.top
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
  cameraOffset.value = {
    x: touchCenter.x - worldX * zoom.value,
    y: touchCenter.y - worldY * zoom.value
  };
  
  // 更新最后的触摸距离
  lastPinchDistance.value = newDistance;
  
  requestDraw();
  emit('zoomChange', zoom.value);
};

const handleTouchEnd = () => {
  isDragging.value = false;
  lastPinchDistance.value = null;
};

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  if (['w', 'a', 's', 'd'].includes(key)) {
    keys.value[key as 'w' | 'a' | 's' | 'd'] = true;
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  if (['w', 'a', 's', 'd'].includes(key)) {
    keys.value[key as 'w' | 'a' | 's' | 'd'] = false;
  }
};

// 动画循环
const startAnimationLoop = () => {
  const loop = () => {
    // 处理WASD移动
    const moveSpeed = props.moveSpeed;
    let moved = false;
    
    if (keys.value.w) { cameraOffset.value.y += moveSpeed; moved = true; }
    if (keys.value.s) { cameraOffset.value.y -= moveSpeed; moved = true; }
    if (keys.value.a) { cameraOffset.value.x += moveSpeed; moved = true; }
    if (keys.value.d) { cameraOffset.value.x -= moveSpeed; moved = true; }
    
    // 如果有按键被按下，重新绘制
    if (moved) {
      requestDraw();
      emit('positionChange', worldPosition.value);
    }
    
    // 继续循环
    frameId.value = requestAnimationFrame(loop);
  };
  
  frameId.value = requestAnimationFrame(loop);
};

const stopAnimationLoop = () => {
  if (frameId.value !== null) {
    cancelAnimationFrame(frameId.value);
    frameId.value = null;
  }
};

// 设置选中格子
const setSelectedCell = (x: number, y: number) => {
  if (isInMapBounds(x, y)) {
    selectedCell.value = { x, y };
    requestDraw();
  }
};

// 清除选中
const clearSelection = () => {
  selectedCell.value = null;
  requestDraw();
};

// 监听器设置
const setupEventListeners = () => {
  if (!canvasRef.value) return;
  
  canvasRef.value.addEventListener('wheel', handleWheel, { passive: false });
  canvasRef.value.addEventListener('mousedown', handleMouseDown);
  canvasRef.value.addEventListener('mousemove', updateMousePosition);
  canvasRef.value.addEventListener('click', handleClick);
  canvasRef.value.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvasRef.value.addEventListener('touchend', handleTouchEnd);
  canvasRef.value.addEventListener('touchmove', handleTouchMove, { passive: false });
  
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('resize', resizeCanvas);
};

// 清理监听器
const cleanupEventListeners = () => {
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('wheel', handleWheel);
    canvasRef.value.removeEventListener('mousedown', handleMouseDown);
    canvasRef.value.removeEventListener('mousemove', updateMousePosition);
    canvasRef.value.removeEventListener('click', handleClick);
    canvasRef.value.removeEventListener('touchstart', handleTouchStart);
    canvasRef.value.removeEventListener('touchend', handleTouchEnd);
    canvasRef.value.removeEventListener('touchmove', handleTouchMove);
  }
  
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('resize', resizeCanvas);
};

// 监听属性变化
watch(() => props.isVisible, (newVal) => {
  if (newVal === true) {
    setTimeout(resizeCanvas, 0);
  }
});

watch(() => props.gridSize, requestDraw);

watch(
  [() => props.backgroundColor, () => props.gridColor, () => props.borderColor, 
   () => props.hoverColor, () => props.selectedColor],
  requestDraw
);

watch([() => props.mapWidth, () => props.mapHeight], requestDraw);
watch(() => selectedCell.value, requestDraw);

// 生命周期钩子
onMounted(() => {
  if (!canvasRef.value) return;
  
  ctx.value = canvasRef.value.getContext('2d', { alpha: false });
  
  setTimeout(() => {
    resizeCanvas();
    resetView();
  }, 0);
  
  setupEventListeners();
  startAnimationLoop();
});

onUnmounted(() => {
  cleanupEventListeners();
  stopAnimationLoop();
  
  // 清理绘制请求
  if (drawRequestId) {
    cancelAnimationFrame(drawRequestId);
    drawRequestId = null;
  }
});

// 公开方法
defineExpose({
  resizeCanvas,
  resetView,
  getPosition: () => ({
    x: worldPosition.value.x,
    y: worldPosition.value.y
  }),
  getZoom: () => zoom.value,
  isInMapBounds,
  setSelectedCell,
  clearSelection,
  getSelectedCell: () => selectedCell.value
});
</script>

<template>
  <div ref="containerRef" class="relative w-full h-full overflow-hidden">
    <canvas ref="canvasRef" class="block w-full h-full touch-none"></canvas>
    <div class="absolute bottom-3 right-3 bg-base-100/70 p-2 rounded shadow-sm text-xs pointer-events-none z-10">
      <div class="mb-1">
        <span>缩放: {{ zoom.toFixed(2) }}x</span>
      </div>
      <div class="mb-1">
        <span>位置: ({{ worldPosition.x }}, {{ worldPosition.y }})</span>
        <span v-if="!isInMapBounds(worldPosition.x, worldPosition.y)" class="text-error ml-1">
          (超出边界)
        </span>
      </div>
      <div class="mb-1">
        <span>地图尺寸: {{ props.mapWidth }}×{{ props.mapHeight }}</span>
      </div>
      <div class="flex justify-end mt-2 pointer-events-auto">
        <button @click="resetView" class="btn btn-xs btn-circle border border-base-300 hover:bg-base-500" title="重置视图">
          <span>⟳</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 使用FlyonUI类名 */
</style> 