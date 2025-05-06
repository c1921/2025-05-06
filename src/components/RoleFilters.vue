<script setup lang="ts">
import { ref } from 'vue';
import type { TraitCategory, TraitSubType } from '../types/Trait';
import { getTraitsByCategory } from '../utils/traitUtils';

const emit = defineEmits(['filter-change']);

const selectedCategory = ref<TraitCategory | null>(null);
const selectedSubType = ref<TraitSubType | null>(null);

// 获取所选类别的可用子类型
const getAvailableSubTypes = (): TraitSubType[] => {
  if (!selectedCategory.value) {
    return [];
  }
  
  // 返回所选类别的不重复子类型
  const traits = getTraitsByCategory(selectedCategory.value);
  const subTypes = traits.map(trait => trait.subType);
  return [...new Set(subTypes)];
};

// 当类别改变时重置子类型
const handleCategoryChange = () => {
  selectedSubType.value = null;
  emitFilterChanges();
};

// 发送筛选变更事件
const emitFilterChanges = () => {
  emit('filter-change', {
    category: selectedCategory.value,
    subType: selectedSubType.value
  });
};
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Filter Roles</h3>
    
    <div class="grid sm:grid-cols-2 gap-4">
      <div class="form-group">
        <label for="category-filter" class="text-sm font-medium text-gray-600 mb-1.5 block">
          Trait Category
        </label>
        <select 
          id="category-filter" 
          v-model="selectedCategory"
          @change="handleCategoryChange"
          class="form-select"
        >
          <option :value="null">All Categories</option>
          <option value="Physical">Physical</option>
          <option value="Personality">Personality</option>
          <option value="Skill">Skill</option>
          <option value="Background">Background</option>
        </select>
      </div>
      
      <div class="form-group" v-if="selectedCategory">
        <label for="subtype-filter" class="text-sm font-medium text-gray-600 mb-1.5 block">
          Trait Subtype
        </label>
        <select 
          id="subtype-filter" 
          v-model="selectedSubType"
          @change="emitFilterChanges"
          class="form-select"
        >
          <option :value="null">All Subtypes</option>
          <option v-for="subType in getAvailableSubTypes()" :key="subType" :value="subType">
            {{ subType }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template> 