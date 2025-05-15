<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import RoleView from './RoleView.vue';
import BuildingView from './BuildingView.vue';
import MapView from './MapView.vue';
import ItemView from './ItemView.vue';
import TimeControl from '../components/TimeControl.vue';
import SettingsModal from '../components/SettingsModal.vue';
import { gameEngine } from '../core/GameEngine';
import { getItemQuantity } from '../utils/inventoryService';

// 食物物品ID（根据items.json）
const FOOD_ITEM_ID = '9';

// 当前选中的标签页
const activeTab = ref('roles');

// 地图是否可见
const isMapVisible = ref(false);

// 时间控制组件引用
const timeControlRef = ref(null);

// 食物库存数量
const foodQuantity = ref(getItemQuantity(FOOD_ITEM_ID));

// 切换标签页
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
};

// 监听标签页变化
watch(() => activeTab.value, (newTab) => {
  isMapVisible.value = newTab === 'map';
});

// 监听食物消耗事件，更新库存显示
onMounted(() => {
  // 直接从GameEngine监听事件
  gameEngine.addEventListener('foodConsumed', () => {
    // 更新食物库存显示
    foodQuantity.value = getItemQuantity(FOOD_ITEM_ID);
  });
});

// 初始设置
isMapVisible.value = activeTab.value === 'map';
</script>

<template>
  <div class="h-full flex flex-col">
    
    <!-- 顶部导航栏 -->
    <header class="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 bg-base-200">
      <!-- 库存状态 -->
      <div class="flex items-center gap-3 text-sm order-2 sm:order-1 w-full sm:w-auto justify-center sm:justify-start">
        <div class="flex items-center gap-1 bg-base-100 px-2 py-1 rounded-full shadow-sm">
          <span class="icon-[tabler--apple] size-4 text-green-500"></span>
          <span class="font-medium">{{ foodQuantity }}</span>
        </div>
      </div>
      
      <!-- 时间控制器 -->
      <TimeControl ref="timeControlRef" class="order-1 sm:order-2 w-full sm:w-auto mb-1 sm:mb-0" />
      
      <!-- 设置按钮 -->
      <button 
        type="button" 
        class="btn btn-ghost btn-sm btn-circle order-3" 
        aria-haspopup="dialog" 
        aria-expanded="false" 
        aria-controls="settings-modal" 
        data-overlay="#settings-modal"
      >
        <span class="icon-[tabler--settings] size-5"></span>
      </button>
    </header>
    
    <!-- 标签导航 -->
    <nav class="tabs tabs-bordered mb-2 px-4 pt-5 flex-shrink-0" aria-label="Main Navigation" role="tablist" aria-orientation="horizontal">
      <button 
        type="button" 
        class="tab active-tab:tab-active w-full" 
        :class="{ 'active': activeTab === 'roles' }"
        id="tab-roles" 
        data-tab="#tab-content-roles" 
        aria-controls="tab-content-roles" 
        role="tab" 
        aria-selected="true"
        @click="setActiveTab('roles')"
      >
        <span class="icon-[tabler--users] size-5 me-2"></span>
        Characters
      </button>
      <button 
        type="button" 
        class="tab active-tab:tab-active w-full" 
        :class="{ 'active': activeTab === 'buildings' }"
        id="tab-buildings" 
        data-tab="#tab-content-buildings" 
        aria-controls="tab-content-buildings" 
        role="tab" 
        aria-selected="false"
        @click="setActiveTab('buildings')"
      >
        <span class="icon-[tabler--building] size-5 me-2"></span>
        Buildings
      </button>
      <button 
        type="button" 
        class="tab active-tab:tab-active w-full" 
        :class="{ 'active': activeTab === 'items' }"
        id="tab-items" 
        data-tab="#tab-content-items" 
        aria-controls="tab-content-items" 
        role="tab" 
        aria-selected="false"
        @click="setActiveTab('items')"
      >
        <span class="icon-[tabler--backpack] size-5 me-2"></span>
        Items
      </button>
      <button 
        type="button" 
        class="tab active-tab:tab-active w-full" 
        :class="{ 'active': activeTab === 'map' }"
        id="tab-map" 
        data-tab="#tab-content-map" 
        aria-controls="tab-content-map" 
        role="tab" 
        aria-selected="false"
        @click="setActiveTab('map')"
      >
        <span class="icon-[tabler--map] size-5 me-2"></span>
        Map
      </button>
    </nav>
    
    <!-- 标签内容 -->
    <div class="flex-grow overflow-auto px-4 pb-5">
      <div 
        id="tab-content-roles" 
        role="tabpanel" 
        aria-labelledby="tab-roles"
        class="h-full"
        :class="{ 'hidden': activeTab !== 'roles' }"
      >
        <RoleView />
      </div>
      
      <div 
        id="tab-content-buildings" 
        role="tabpanel" 
        aria-labelledby="tab-buildings"
        class="h-full"
        :class="{ 'hidden': activeTab !== 'buildings' }"
      >
        <BuildingView />
      </div>
      
      <div 
        id="tab-content-items" 
        role="tabpanel" 
        aria-labelledby="tab-items"
        class="h-full"
        :class="{ 'hidden': activeTab !== 'items' }"
      >
        <ItemView />
      </div>
      
      <div 
        id="tab-content-map" 
        role="tabpanel" 
        aria-labelledby="tab-map"
        class="h-full"
        :class="{ 'hidden': activeTab !== 'map' }"
      >
        <MapView />
      </div>
    </div>
    
    <!-- 设置模态框组件 -->
    <SettingsModal />
  </div>
</template> 