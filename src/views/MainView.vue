<script setup lang="ts">
import { ref } from 'vue';
import RoleView from './RoleView.vue';
import BuildingView from './BuildingView.vue';

// 当前选中的标签页
const activeTab = ref('roles');

// 切换标签页
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
};
</script>

<template>
  <div class="h-full flex flex-col">
    
    <!-- 标签导航 -->
    <nav class="tabs tabs-bordered mb-2 px-4 pt-5 flex-shrink-0" aria-label="Main Navigation" role="tablist" aria-orientation="horizontal">
      <button 
        type="button" 
        class="tab active-tab:tab-active  w-full" 
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
        class="tab active-tab:tab-active  w-full" 
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
    </div>
  </div>
</template> 