<template>
  <div class="building-creator">
    <!-- 步骤导航 -->
    <div class="flex mb-6">
      <div 
        class="flex-1 text-center p-2 border-b-2" 
        :class="{ 'border-primary font-medium': step === 1, 'border-base-300': step !== 1 }"
      >
        1. Select Template
      </div>
      <div 
        class="flex-1 text-center p-2 border-b-2" 
        :class="{ 'border-primary font-medium': step === 2, 'border-base-300': step !== 2 }"
      >
        2. Set Dimensions
      </div>
      <div 
        class="flex-1 text-center p-2 border-b-2" 
        :class="{ 'border-primary font-medium': step === 3, 'border-base-300': step !== 3 }"
      >
        3. Review & Build
      </div>
    </div>
    
    <!-- 步骤1: 选择模板 -->
    <div v-if="step === 1" class="step-content">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium">Select Building Template</h3>
        <div class="flex items-center gap-2">
          <label class="text-sm">Filter by type:</label>
          <select v-model="selectedType" class="select select-bordered select-sm">
            <option value="">All Types</option>
            <option v-for="(name, type) in buildingTypeNames" :key="type" :value="type">
              {{ name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BuildingTemplateCard
          v-for="template in filteredTemplates"
          :key="template.id"
          :template="template"
          @select="selectTemplate"
        />
      </div>
    </div>
    
    <!-- 步骤2: 设置尺寸 -->
    <div v-if="step === 2" class="step-content">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium">Set Building Dimensions</h3>
        <button class="btn btn-sm btn-ghost" @click="backToTemplateSelection">
          <span class="icon-[tabler--arrow-left] size-4 mr-1"></span>
          Back
        </button>
      </div>
      
      <div class="card bg-base-200 p-4 mb-4">
        <h4 class="font-medium mb-2">{{ selectedTemplate?.name }}</h4>
        <p class="text-sm text-base-content/70 mb-2">{{ selectedTemplate?.description }}</p>
        <div class="text-sm">
          <span class="badge badge-primary">{{ getBuildingTypeName(selectedTemplate?.type || '') }}</span>
          <span class="text-base-content/70 ml-2">
            Allowed size: {{ getSizeRangeText() }}
          </span>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Width (meters)</span>
            <span class="label-text-alt">{{ selectedTemplate?.minSize.width }} - {{ selectedTemplate?.maxSize.width }}</span>
          </label>
          <div class="flex items-center gap-2">
            <input 
              type="range" 
              v-model.number="buildingSize.width" 
              class="range range-primary" 
              :min="selectedTemplate?.minSize.width" 
              :max="selectedTemplate?.maxSize.width"
              :step="1"
            />
            <span class="w-12 text-center">{{ buildingSize.width }}</span>
          </div>
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">Length (meters)</span>
            <span class="label-text-alt">{{ selectedTemplate?.minSize.length }} - {{ selectedTemplate?.maxSize.length }}</span>
          </label>
          <div class="flex items-center gap-2">
            <input 
              type="range" 
              v-model.number="buildingSize.length" 
              class="range range-primary" 
              :min="selectedTemplate?.minSize.length" 
              :max="selectedTemplate?.maxSize.length"
              :step="1"
            />
            <span class="w-12 text-center">{{ buildingSize.length }}</span>
          </div>
        </div>
      </div>
      
      <div class="alert alert-info mt-4">
        <span class="icon-[tabler--info-circle] size-5 mr-2"></span>
        <div>
          <p class="font-medium">Building Area: {{ getAreaText() }}</p>
          <p class="text-sm">The larger the building, the more materials required.</p>
        </div>
      </div>
      
      <div class="flex justify-end mt-4">
        <button class="btn btn-primary" @click="goToReview">Continue</button>
      </div>
    </div>
    
    <!-- 步骤3: 审核和建造 -->
    <div v-if="step === 3" class="step-content">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium">Review & Build</h3>
        <button class="btn btn-sm btn-ghost" @click="backToSizeSelection">
          <span class="icon-[tabler--arrow-left] size-4 mr-1"></span>
          Back
        </button>
      </div>
      
      <div class="card bg-base-200 p-4 mb-4">
        <h4 class="font-medium">Building Summary</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <p><span class="text-base-content/70">Template:</span> {{ selectedTemplate?.name }}</p>
            <p><span class="text-base-content/70">Type:</span> {{ getBuildingTypeName(selectedTemplate?.type || '') }}</p>
            <p><span class="text-base-content/70">Size:</span> {{ getAreaText() }}</p>
          </div>
          <div>
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text">Building Name (optional)</span>
              </div>
              <input type="text" v-model="buildingName" placeholder="Enter name..." class="input input-bordered w-full" />
            </label>
          </div>
        </div>
      </div>
      
      <div class="card bg-base-200 p-4">
        <h4 class="font-medium mb-2">Required Materials</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Required</th>
              <th>Available</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="material in requiredMaterialsWithInfo" :key="material.itemId">
              <td>{{ material.name }}</td>
              <td>{{ material.requiredQuantity }}</td>
              <td>{{ material.availableQuantity }}</td>
              <td>
                <span 
                  class="badge" 
                  :class="material.hasEnough ? 'badge-success' : 'badge-error'"
                >
                  {{ material.hasEnough ? 'Available' : 'Not Enough' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="flex justify-end mt-4 gap-2">
        <button class="btn btn-outline" @click="cancel">Cancel</button>
        <button 
          class="btn btn-primary" 
          @click="createBuilding"
          :disabled="!canBuild"
        >
          Start Building
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import type { BuildingTemplate, BuildingSize, BuildingType } from '../types/Building';
import { BUILDING_TYPE_NAMES } from '../types/Building';
import { loadBuildingTemplates, filterTemplatesByType, getBuildingSizeRangeText, getBuildingAreaText as formatBuildingArea, calculateMaterialsWithItems } from '../utils/buildingUtils';
import { createNewBuilding } from '../utils/buildingService';
import { loadItems } from '../utils/itemUtils';
import BuildingTemplateCard from './BuildingTemplateCard.vue';

export default defineComponent({
  name: 'BuildingCreator',
  components: {
    BuildingTemplateCard
  },
  emits: ['created', 'cancel'],
  setup(_props, { emit }) {
    // 当前步骤
    const step = ref(1);
    // 选择的建筑类型过滤器
    const selectedType = ref<string>('');
    // 选择的建筑模板
    const selectedTemplate = ref<BuildingTemplate | null>(null);
    // 建筑尺寸
    const buildingSize = ref<BuildingSize>({ width: 0, length: 0 });
    // 建筑名称
    const buildingName = ref<string>('');
    
    // 加载建筑模板
    const templates = loadBuildingTemplates();
    // 加载物品数据
    const items = loadItems();
    
    // 过滤后的模板列表
    const filteredTemplates = computed(() => {
      if (!selectedType.value) {
        return templates;
      }
      return filterTemplatesByType(templates, selectedType.value as BuildingType);
    });
    
    // 所需材料信息
    const requiredMaterialsWithInfo = computed(() => {
      if (!selectedTemplate.value) return [];
      
      const materialsWithItems = calculateMaterialsWithItems(
        selectedTemplate.value,
        buildingSize.value,
        items
      );
      
      return materialsWithItems.map(material => ({
        itemId: material.itemId,
        name: material.item ? material.item.name : `Item #${material.itemId}`,
        requiredQuantity: material.requiredQuantity,
        availableQuantity: material.item ? material.item.quantity : 0,
        hasEnough: material.item ? material.item.quantity >= material.requiredQuantity : false
      }));
    });
    
    // 是否可以建造
    const canBuild = computed(() => {
      return requiredMaterialsWithInfo.value.every(material => material.hasEnough);
    });
    
    // 选择建筑模板
    const selectTemplate = (template: BuildingTemplate) => {
      selectedTemplate.value = template;
      // 设置默认尺寸为最小尺寸
      buildingSize.value = { ...template.minSize };
      // 前往下一步
      step.value = 2;
    };
    
    // 返回模板选择
    const backToTemplateSelection = () => {
      step.value = 1;
    };
    
    // 前往审核步骤
    const goToReview = () => {
      step.value = 3;
    };
    
    // 返回尺寸选择
    const backToSizeSelection = () => {
      step.value = 2;
    };
    
    // 取消建筑创建
    const cancel = () => {
      emit('cancel');
    };
    
    // 创建建筑
    const createBuilding = () => {
      if (!selectedTemplate.value) return;
      
      const building = createNewBuilding(
        selectedTemplate.value.id,
        buildingName.value || selectedTemplate.value.name,
        buildingSize.value,
        true // 消耗材料
      );
      
      if (building) {
        emit('created', building);
      }
    };
    
    // 获取建筑类型名称
    const getBuildingTypeName = (type: string) => {
      return BUILDING_TYPE_NAMES[type as keyof typeof BUILDING_TYPE_NAMES] || type;
    };
    
    // 获取建筑尺寸范围文本
    const getSizeRangeText = () => {
      if (!selectedTemplate.value) return '';
      return getBuildingSizeRangeText(selectedTemplate.value);
    };
    
    // 获取建筑面积文本
    const getAreaText = () => {
      return formatBuildingArea(buildingSize.value);
    };
    
    return {
      step,
      selectedType,
      selectedTemplate,
      buildingSize,
      buildingName,
      filteredTemplates,
      requiredMaterialsWithInfo,
      canBuild,
      buildingTypeNames: BUILDING_TYPE_NAMES,
      selectTemplate,
      backToTemplateSelection,
      goToReview,
      backToSizeSelection,
      cancel,
      createBuilding,
      getBuildingTypeName,
      getSizeRangeText,
      getAreaText
    };
  }
});
</script> 