<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Role } from '../types/Role';
import type { TraitCategory, TraitSubType } from '../types/Trait';
import { generateRandomRoles } from '../utils/roleUtils';
import RoleCard from './RoleCard.vue';
import RoleFilters from './RoleFilters.vue';
import { getOverallPersonalityDescription, getPersonalityTooltip } from '../utils/personalityDescriptionUtils';

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
        <div class="card card-bordered">
          <div class="card-header border-b p-3">
            <h3 class="text-base font-semibold">Character List</h3>
          </div>
          <div class="border-base-content/25 divide-base-content/25 flex flex-col divide-y rounded-md border *:first:rounded-t-md *:last:rounded-b-md">
            <div
              v-for="role in filteredRoles"
              :key="role.id"
              class="flex flex-col"
            >
              <button
                @click="selectRole(role.id)"
                class="link flex items-center no-underline p-3"
                :class="{
                  'link-primary': role.id === selectedRoleId,
                  'hover:link-primary': role.id !== selectedRoleId
                }"
              >
                <span class="status me-3" :class="role.gender === 'Male' ? 'status-info' : 'status-pink'"></span>
                <span class="grow">{{ role.name }}</span>
                
                <!-- Political stance indicators -->
                <div class="flex items-center gap-1 me-2">
                  <!-- Economic indicator -->
                  <div class="tooltip">
                    <span 
                      class="tooltip-toggle size-2 rounded-full" 
                      :class="role.politicalStance.economic < 50 ? 'bg-red-400' : 'bg-blue-400'"
                    ></span>
                    <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                      <span class="tooltip-body">
                        {{ role.politicalStance.economic < 30 ? 'Far Left' : 
                           role.politicalStance.economic < 45 ? 'Left' : 
                           role.politicalStance.economic < 55 ? 'Centrist' : 
                           role.politicalStance.economic < 70 ? 'Right' : 'Far Right' }}
                      </span>
                    </span>
                  </div>
                  
                  <!-- Civil indicator -->
                  <div class="tooltip">
                    <span 
                      class="tooltip-toggle size-2 rounded-full" 
                      :class="role.politicalStance.civil < 50 ? 'bg-purple-400' : 'bg-orange-400'"
                    ></span>
                    <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                      <span class="tooltip-body">
                        {{ role.politicalStance.civil < 30 ? 'Libertarian' : 
                           role.politicalStance.civil < 45 ? 'Liberal' : 
                           role.politicalStance.civil < 55 ? 'Moderate' : 
                           role.politicalStance.civil < 70 ? 'Statist' : 'Authoritarian' }}
                      </span>
                    </span>
                  </div>
                </div>
                
                <span class="text-xs opacity-50">{{ role.age }} years</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧角色详情 -->
      <div class="md:col-span-8 lg:col-span-9">
        <div v-if="selectedRole" class="card card-bordered">
          <div class="card-header border-b p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-baseline gap-2">
                  <h3 class="text-lg font-semibold">{{ selectedRole.name }}</h3>
                  
                  <!-- 角色个性描述（详情视图） -->
                  <div class="tooltip">
                    <span class="tooltip-toggle text-sm text-gray-600">
                      {{ getOverallPersonalityDescription(selectedRole.aiPersonality) }}
                    </span>
                    <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                      <span class="tooltip-body" v-html="getPersonalityTooltip(selectedRole.aiPersonality)"></span>
                    </span>
                  </div>
                </div>
              </div>
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
          <div class="text-center">
            <span class="icon-[tabler--user-question] size-12 block mx-auto mb-2"></span>
            <p>Please select a character to view details</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 