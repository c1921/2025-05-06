<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Role } from '../types/Role';
import type { TraitCategory, TraitSubType } from '../types/Trait';
import { generateRandomRoles } from '../utils/roleUtils';
import RoleCard from '../components/RoleCard.vue';
import RoleFilters from '../components/RoleFilters.vue';
import RoleList from '../components/RoleList.vue';

const roles = ref<Role[]>([]);
const filteredRoles = ref<Role[]>([]);
const selectedRoleId = ref<number | null>(null);
const selectedRole = ref<Role | null>(null);

const filterOptions = ref<{
  category: TraitCategory | null,
  subType: TraitSubType | null
}>({
  category: null,
  subType: null
});

onMounted(() => {
  // 初始化角色列表
  roles.value = generateRandomRoles(5);
  applyFilters();
  
  // 默认选中第一个角色
  if (filteredRoles.value.length > 0) {
    selectRole(filteredRoles.value[0].id);
  } else {
    selectedRole.value = null;
  }
});

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
  
  // 如果当前选中的角色不在筛选结果中，则选择第一个角色
  if (selectedRoleId.value !== null && !filteredRoles.value.some(role => role.id === selectedRoleId.value)) {
    if (filteredRoles.value.length > 0) {
      selectRole(filteredRoles.value[0].id);
    } else {
      selectedRole.value = null;
    }
  }
};

const handleFilterChange = (filters: {
  category: TraitCategory | null,
  subType: TraitSubType | null
}) => {
  filterOptions.value = filters;
  applyFilters();
};

// 选择角色
const selectRole = (roleId: number) => {
  selectedRoleId.value = roleId;
  selectedRole.value = roles.value.find(role => role.id === roleId) || null;
};

// 处理角色选择事件
const handleRoleSelect = (roleId: number) => {
  selectRole(roleId);
};
</script>

<template>
  <div class="max-w-6xl mx-auto">
    
    <div class="card card-bordered mb-6">
      <div class="card-body">
        <RoleFilters @filter-change="handleFilterChange" />
      </div>
    </div>
    
    <div v-if="filteredRoles.length === 0" class="alert alert-warning mb-6">
      <div class="flex">
        <span class="icon-[tabler--alert-circle] size-5 me-2"></span>
        <p>No matching results, please try adjusting the filters.</p>
      </div>
    </div>
    
    <!-- 角色列表与详情的双栏布局 -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- 左侧角色列表 -->
      <div class="md:col-span-4 lg:col-span-3">
        <RoleList 
          :roles="filteredRoles" 
          :selected-role-id="selectedRoleId" 
          @select-role="handleRoleSelect" 
        />
      </div>
      
      <!-- 右侧角色详情 -->
      <div class="md:col-span-8 lg:col-span-9">
        <div v-if="selectedRole" class="card card-bordered">
          <div class="card-body p-4">
            <RoleCard 
              :role="selectedRole" 
              :all-roles="roles"
            />
          </div>
        </div>
        
        <div v-else class="flex justify-center items-center h-64 rounded-lg border-2 border-dashed">
          <div class="text-center">
            <span class="icon-[tabler--user-question] size-12 block mx-auto mb-2"></span>
            <p>Please select a character to view details</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 