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
  <div class="filter-container">
    <h3>Filter Roles</h3>
    
    <div class="filter-section">
      <label for="category-filter">Trait Category:</label>
      <select 
        id="category-filter" 
        v-model="selectedCategory"
        @change="handleCategoryChange"
        class="filter-select"
      >
        <option :value="null">All Categories</option>
        <option value="Physical">Physical</option>
        <option value="Personality">Personality</option>
        <option value="Skill">Skill</option>
        <option value="Background">Background</option>
      </select>
    </div>
    
    <div class="filter-section" v-if="selectedCategory">
      <label for="subtype-filter">Trait Subtype:</label>
      <select 
        id="subtype-filter" 
        v-model="selectedSubType"
        @change="emitFilterChanges"
        class="filter-select"
      >
        <option :value="null">All Subtypes</option>
        <option v-for="subType in getAvailableSubTypes()" :key="subType" :value="subType">
          {{ subType }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.filter-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #333;
}

.filter-section {
  margin-bottom: 12px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #555;
}

.filter-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
}
</style> 