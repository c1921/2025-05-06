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
const selectedRoleId = ref<string | null>(null);
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

const selectRole = (roleId: string) => {
  selectedRoleId.value = roleId;
  selectedRole.value = roles.value.find(role => role.id === roleId) || null;
};

</script>

<template>
  <div class="max-w-6xl mx-auto">
    
    <div class="card card-bordered mb-6">
      <div class="card-body">
        <RoleFilters @filter-change="onFilterChange" />
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
          @select-role="selectRole" 
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