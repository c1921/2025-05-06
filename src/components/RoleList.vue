<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Role } from '../types/Role';

// 属性定义
const props = defineProps<{
  roles: Role[]; // 要显示的角色列表
  selectedRoleId: string | null; // 当前选中的角色ID
}>();

// 事件定义
const emit = defineEmits<{
  'select-role': [roleId: string]; // 选择角色事件
}>();

// 搜索功能
const searchQuery = ref('');
const itemsPerPage = 8; // 每页显示的角色数量
const currentPage = ref(1);

// 根据搜索词和分页过滤角色
const filteredRoles = computed(() => {
  // 先按搜索词过滤
  const searchFiltered = searchQuery.value 
    ? props.roles.filter((role: Role) => 
        role.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    : props.roles;
    
  // 计算总页数
  totalPages.value = Math.ceil(searchFiltered.length / itemsPerPage);
  
  // 确保当前页在有效范围内
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value;
  }
  
  // 返回当前页的角色
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return searchFiltered.slice(start, end);
});

// 总页数
const totalPages = ref(Math.ceil(props.roles.length / itemsPerPage));

// 页码导航
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 搜索框清空时重置
const handleSearchInput = () => {
  currentPage.value = 1; // 搜索时重置到第一页
};

// 选择角色
const handleSelectRole = (roleId: string) => {
  emit('select-role', roleId);
};
</script>

<template>
  <div class="card card-bordered">
    <!-- 搜索栏 -->
    <div class="card-header p-3">
      <div class="flex items-center justify-between">
        <div class="relative w-full">
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleSearchInput"
            placeholder="Search characters..." 
            class="form-control form-control-sm pl-8 pr-2 w-full"
          />
          <span class="icon-[tabler--search] size-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"></span>
        </div>
      </div>
    </div>
    
    <!-- 角色列表 - 使用网格布局 -->
    <div class="overflow-y-auto max-h-[calc(100vh-15rem)]">
      <!-- 无结果提示 -->
      <div v-if="filteredRoles.length === 0" class="p-4 text-center text-gray-500">
        No characters matching your search
      </div>
      
      <!-- 网格布局的角色列表 -->
      <div class="grid grid-cols-2 md:grid-cols-1 gap-1 p-1">
        <div
          v-for="role in filteredRoles"
          :key="role.id"
          class="flex flex-col"
        >
          <button
            @click="handleSelectRole(role.id)"
            class="link flex items-center justify-start text-left no-underline p-2 rounded hover:bg-base-100/80"
            :class="{
              'bg-primary/10 link-primary': role.id === selectedRoleId,
              'hover:link-primary': role.id !== selectedRoleId
            }"
          >
            <span class="truncate text-sm">{{ role.name }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 分页控件 -->
    <div v-if="totalPages > 1" class="card-footer p-2">
      <div class="flex items-center justify-center gap-1">
        <button 
          class="btn btn-xs btn-ghost rounded" 
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          <span class="icon-[tabler--chevrons-left] size-3.5"></span>
        </button>
        <button 
          class="btn btn-xs btn-ghost rounded" 
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <span class="icon-[tabler--chevron-left] size-3.5"></span>
        </button>
        
        <span class="text-xs px-2">
          {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          class="btn btn-xs btn-ghost rounded" 
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <span class="icon-[tabler--chevron-right] size-3.5"></span>
        </button>
        <button 
          class="btn btn-xs btn-ghost rounded" 
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          <span class="icon-[tabler--chevrons-right] size-3.5"></span>
        </button>
      </div>
    </div>
  </div>
</template> 