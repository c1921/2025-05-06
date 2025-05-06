<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Role } from '../types/Role';
import type { TraitCategory, TraitSubType } from '../types/Trait';
import { generateRandomRoles } from '../utils/roleUtils';
import RoleCard from './RoleCard.vue';
import RoleFilters from './RoleFilters.vue';

const roles = ref<Role[]>([]);
const filteredRoles = ref<Role[]>([]);
const filterOptions = ref<{
  category: TraitCategory | null,
  subType: TraitSubType | null
}>({
  category: null,
  subType: null
});

onMounted(() => {
  // 生成5个随机角色
  regenerateRoles();
});

const regenerateRoles = () => {
  roles.value = generateRandomRoles(5);
  applyFilters();
};

const applyFilters = () => {
  if (!filterOptions.value.category) {
    // 无筛选条件，显示所有角色
    filteredRoles.value = [...roles.value];
    return;
  }

  filteredRoles.value = roles.value.filter(role => {
    // 查找符合筛选条件的特质
    return role.traits.some(trait => {
      const categoryMatch = trait.category === filterOptions.value.category;
      
      // 如果未指定子类型，仅检查类别
      if (!filterOptions.value.subType) {
        return categoryMatch;
      }
      
      // 否则同时检查类别和子类型
      return categoryMatch && trait.subType === filterOptions.value.subType;
    });
  });
};

const handleFilterChange = (filters: {
  category: TraitCategory | null,
  subType: TraitSubType | null
}) => {
  filterOptions.value = filters;
  applyFilters();
};
</script>

<template>
  <div class="role-list-container">
    <h2>Role List</h2>
    
    <div class="controls">
      <button class="regenerate-btn" @click="regenerateRoles">Regenerate Roles</button>
    </div>
    
    <RoleFilters @filter-change="handleFilterChange" />
    
    <div v-if="filteredRoles.length === 0" class="no-results">
      <p>No roles match the current filters.</p>
    </div>
    
    <div class="role-list">
      <RoleCard 
        v-for="role in filteredRoles" 
        :key="role.id" 
        :role="role"
        :all-roles="roles"
      />
    </div>
  </div>
</template>

<style scoped>
.role-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.regenerate-btn {
  padding: 10px 20px;
  background-color: #4a6bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.regenerate-btn:hover {
  background-color: #3a59e0;
}

.no-results {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.role-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}
</style> 