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
  <div class="max-w-6xl mx-auto">
    <h2 class="text-xl font-bold text-center text-gray-800 mb-6">Role List</h2>
    
    <div class="flex justify-center mb-6">
      <button 
        class="btn btn-primary"
        @click="regenerateRoles"
      >
        <span class="icon-[tabler--refresh] size-4 me-2"></span>
        Regenerate Roles
      </button>
    </div>
    
    <div class="card card-bordered mb-6">
      <div class="card-body">
        <RoleFilters @filter-change="handleFilterChange" />
      </div>
    </div>
    
    <div v-if="filteredRoles.length === 0" class="alert alert-warning mb-6">
      <div class="flex">
        <span class="icon-[tabler--alert-circle] size-5 me-2"></span>
        <p>No roles match the current filters.</p>
      </div>
    </div>
    
    <div class="flex flex-wrap justify-center gap-4">
      <RoleCard 
        v-for="role in filteredRoles" 
        :key="role.id" 
        :role="role"
        :all-roles="roles"
      />
    </div>
  </div>
</template> 