<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Role } from '../types/Role';
import type { TraitCategory, TraitSubType } from '../types/Trait';
import { generateRandomRoles } from '../utils/roleUtils';
import RoleCard from './RoleCard.vue';
import RoleFilters from './RoleFilters.vue';

const roles = ref<Role[]>([]);
const filteredRoles = ref<Role[]>([]);
const selectedRoleId = ref<number | null>(null);
const filterOptions = ref<{
  category: TraitCategory | null,
  subType: TraitSubType | null
}>({
  category: null,
  subType: null
});

// 计算属性：获取当前选中的角色
const selectedRole = ref<Role | null>(null);

onMounted(() => {
  // 生成5个随机角色
  regenerateRoles();
});

const regenerateRoles = () => {
  roles.value = generateRandomRoles(5);
  applyFilters();
  
  // 默认选中第一个角色
  if (filteredRoles.value.length > 0) {
    selectRole(filteredRoles.value[0].id);
  } else {
    selectedRole.value = null;
  }
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
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <h2 class="text-xl font-bold text-center  mb-6">Role Management</h2>
    
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
        <p>无匹配结果，请尝试调整筛选条件。</p>
      </div>
    </div>
    
    <!-- 角色列表与详情的双栏布局 -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- 左侧角色列表 -->
      <div class="md:col-span-4 lg:col-span-3">
        <div class="card card-bordered">
          <div class="card-header border-b p-3">
            <h3 class="text-base font-semibold">角色列表</h3>
          </div>
          <div class="divide-y">
            <button
              v-for="role in filteredRoles"
              :key="role.id"
              @click="selectRole(role.id)"
              class="w-full px-4 py-3 text-left hover:bg-gray-500 transition-colors duration-150"
              :class="{'bg-primary-50 font-medium': role.id === selectedRoleId}"
            >
              <div class="flex items-center">
                <span class="status me-2" :class="role.gender === 'Male' ? 'status-info' : 'status-pink'"></span>
                <span>{{ role.name }}</span>
                <span class="text-xs  ms-auto">{{ role.age }}岁</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 右侧角色详情 -->
      <div class="md:col-span-8 lg:col-span-9">
        <div v-if="selectedRole" class="card card-bordered">
          <div class="card-header border-b p-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ selectedRole.name }}</h3>
              <div>
                <span 
                  class="badge" 
                  :class="selectedRole.gender === 'Male' ? 'badge-info' : 'badge-pink'"
                >
                  {{ selectedRole.gender }}
                </span>
                <span class="badge badge-ghost ms-2">{{ selectedRole.age }} years</span>
              </div>
            </div>
          </div>
          
          <div class="card-body p-4">
            <RoleCard 
              :role="selectedRole" 
              :all-roles="roles"
              :is-detail-view="true"
            />
          </div>
        </div>
        
        <div v-else class="flex justify-center items-center h-64 rounded-lg border-2 border-dashed">
          <div class="text-center ">
            <span class="icon-[tabler--user-question] size-12 block mx-auto mb-2"></span>
            <p>请选择一个角色查看详细信息</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 