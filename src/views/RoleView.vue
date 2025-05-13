<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Role } from '../types/Role';
import type { TraitCategory, TraitSubType } from '../types/Trait';
import RoleCard from '../components/RoleCard.vue';
import RoleFilters from '../components/RoleFilters.vue';
import RoleList from '../components/RoleList.vue';
import { gameEngine } from '../core/GameEngine';

const roles = computed(() => gameEngine.getRoles());
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
  // 应用初始筛选
  applyFilters();
  
  // 默认选中第一个角色
  if (filteredRoles.value.length > 0) {
    selectRole(filteredRoles.value[0].id);
  } else {
    selectedRole.value = null;
  }
  
  // 监听游戏事件来更新UI
  gameEngine.addEventListener('dayChanged', () => {
    // 当天数变化时，重新应用筛选以更新UI
    applyFilters();
    // 如果当前选中的角色存在，则保持选中状态
    if (selectedRoleId.value !== null) {
      selectRole(selectedRoleId.value);
    }
  });
});

const applyFilters = () => {
  if (!filterOptions.value.category) {
    // 无筛选条件，显示所有角色
    filteredRoles.value = [...roles.value];
    return;
  }
  
  // 应用特质类型筛选
  filteredRoles.value = roles.value.filter(role => {
    // 查找是否有匹配的特质
    return role.traits.some(trait => {
      // 如果只筛选类别
      if (!filterOptions.value.subType) {
        return trait.category === filterOptions.value.category;
      }
      // 如果同时筛选类别和子类型
      return trait.category === filterOptions.value.category && 
             trait.subType === filterOptions.value.subType;
    });
  });
};

const onFilterChange = (newFilter: { category: TraitCategory | null, subType: TraitSubType | null }) => {
  filterOptions.value = newFilter;
  applyFilters();
  
  // 如果筛选后没有角色，清除选中状态
  if (filteredRoles.value.length === 0) {
    selectedRole.value = null;
    selectedRoleId.value = null;
    return;
  }
  
  // 如果之前选中的角色在筛选结果中，保持选中状态，否则选中第一个角色
  if (selectedRoleId.value !== null) {
    if (filteredRoles.value.some(role => role.id === selectedRoleId.value)) {
      selectRole(selectedRoleId.value);
    } else {
      selectRole(filteredRoles.value[0].id);
    }
  } else {
    selectRole(filteredRoles.value[0].id);
  }
};

const selectRole = (roleId: number) => {
  selectedRoleId.value = roleId;
  selectedRole.value = roles.value.find(role => role.id === roleId) || null;
};

</script>

<template>
  <div class="h-full flex flex-col lg:flex-row">
    <!-- 左侧列表与筛选区域 -->
    <div class="lg:w-1/3 xl:w-1/4 lg:border-r lg:pr-4 mb-4 lg:mb-0 h-full flex flex-col">
      <div class="mb-4">
        <RoleFilters 
          :selected-category="filterOptions.category"
          :selected-sub-type="filterOptions.subType" 
          @change="onFilterChange"
        />
      </div>
      
      <!-- 角色列表 -->
      <div class="overflow-auto flex-grow">
        <RoleList 
          :roles="filteredRoles" 
          :selected-role-id="selectedRoleId"
          @select-role="selectRole"
        />
      </div>
    </div>
    
    <!-- 右侧角色详情区域 -->
    <div class="lg:w-2/3 xl:w-3/4 lg:pl-4 overflow-auto h-full">
      <div v-if="selectedRole" class="h-full">
        <RoleCard :role="selectedRole" :all-roles="roles" />
      </div>
      <div v-else class="h-full flex items-center justify-center p-4">
        <div class="text-center">
          <span class="icon-[tabler--user-question] size-16 opacity-30 mb-3"></span>
          <p class="text-xl font-medium text-gray-500">请从左侧列表选择一个角色</p>
        </div>
      </div>
    </div>
  </div>
</template> 