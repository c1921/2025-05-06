<script setup lang="ts">
import type { Role } from '../types/Role';

// 属性定义
defineProps<{
  roles: Role[]; // 要显示的角色列表
  selectedRoleId: number | null; // 当前选中的角色ID
}>();

// 事件定义
const emit = defineEmits<{
  'select-role': [roleId: number]; // 选择角色事件
}>();

// 选择角色
const handleSelectRole = (roleId: number) => {
  emit('select-role', roleId);
};
</script>

<template>
  <div class="card card-bordered">
    <div class="card-header p-3">
    </div>
    <div class="border-base-content/25 divide-base-content/25 flex flex-col divide-y rounded-md border *:first:rounded-t-md *:last:rounded-b-md">
      <div
        v-for="role in roles"
        :key="role.id"
        class="flex flex-col"
      >
        <button
          @click="handleSelectRole(role.id)"
          class="link flex items-center no-underline p-3"
          :class="{
            'link-primary': role.id === selectedRoleId,
            'hover:link-primary': role.id !== selectedRoleId
          }"
        >
          <span class="status me-3" :class="role.gender === 'Male' ? 'status-info' : 'status-pink'"></span>
          <span class="grow">{{ role.name }}</span>
          <span class="text-xs opacity-50">{{ role.age }} years</span>
        </button>
      </div>
    </div>
  </div>
</template> 