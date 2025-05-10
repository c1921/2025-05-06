<script setup lang="ts">
import { ref } from 'vue';
import BuildingTemplateCard from '../components/BuildingTemplateCard.vue';
import BuildingCreator from '../components/BuildingCreator.vue';
import { loadBuildingTemplates } from '../utils/buildingUtils';
import { useBuildingService } from '../utils/buildingService';
import type { Building } from '../types/Building';

const isCreatingBuilding = ref(false);
const { buildings, getAllBuildings, removeBuilding } = useBuildingService();

// 切换建筑创建模式
const toggleBuildingCreation = () => {
  isCreatingBuilding.value = !isCreatingBuilding.value;
};

// 处理建筑创建完成
const handleBuildingCreated = (building: Building) => {
  isCreatingBuilding.value = false;
};

// 处理建筑创建取消
const handleBuildingCreationCancel = () => {
  isCreatingBuilding.value = false;
};

// 删除建筑
const handleRemoveBuilding = (id: number) => {
  removeBuilding(id);
};
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="card card-bordered">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title text-xl font-bold">Buildings Management</h2>
          <button 
            v-if="!isCreatingBuilding" 
            class="btn btn-primary"
            @click="toggleBuildingCreation"
          >
            <span class="icon-[tabler--plus] size-5 mr-1"></span>
            New Building
          </button>
        </div>
        
        <!-- 建筑创建界面 -->
        <div v-if="isCreatingBuilding">
          <BuildingCreator 
            @created="handleBuildingCreated"
            @cancel="handleBuildingCreationCancel"
          />
        </div>
        
        <!-- 建筑列表 -->
        <div v-else>
          <div v-if="buildings.length === 0" class="text-center py-8">
            <span class="icon-[tabler--building] size-12 mx-auto block text-base-content/30 mb-2"></span>
            <h3 class="text-lg font-medium mb-1">No Buildings Yet</h3>
            <p class="text-base-content/70 mb-4">Start by creating your first building</p>
            <button class="btn btn-primary" @click="toggleBuildingCreation">Create Building</button>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              v-for="building in buildings" 
              :key="building.id" 
              class="card shadow-sm border hover:shadow-md transition-all"
            >
              <div class="card-body p-4">
                <div class="flex justify-between">
                  <h3 class="card-title text-lg">{{ building.name }}</h3>
                  <div class="dropdown dropdown-end">
                    <button class="btn btn-ghost btn-sm btn-circle">
                      <span class="icon-[tabler--dots-vertical] size-5"></span>
                    </button>
                    <ul class="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a @click="handleRemoveBuilding(building.id)">Remove</a></li>
                    </ul>
                  </div>
                </div>
                <p class="text-sm text-base-content/70">{{ building.description }}</p>
                <div class="mt-2">
                  <div class="flex items-center justify-between">
                    <span>Size: {{ building.size.width }}x{{ building.size.length }}</span>
                    <span class="badge" :class="building.isCompleted ? 'badge-success' : 'badge-warning'">
                      {{ building.isCompleted ? 'Completed' : 'In Progress' }}
                    </span>
                  </div>
                  <progress 
                    class="progress progress-primary w-full mt-2" 
                    :value="building.constructionProgress" 
                    max="100"
                  ></progress>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 