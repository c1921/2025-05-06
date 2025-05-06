<template>
  <div class="role-favor-list">
    <h3>{{ role.name }} 的好感度关系</h3>
    
    <div v-if="favorRelations.length === 0" class="no-relations">
      暂无好感度关系
    </div>
    
    <div v-else class="favor-relations">
      <div v-for="relation in favorRelations" :key="relation.targetId" class="favor-item">
        <div class="target-name">{{ getTargetName(relation.targetId) }}</div>
        
        <div class="favor-value" :class="getFavorClass(relation.value)">
          {{ relation.value }}
        </div>
        
        <div class="favor-level">
          {{ getLevelName(relation.value) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Role } from '../types/Role';
import { getFavorLevelName as getLevel } from '../utils/favorUtils';

// 定义组件属性
const props = defineProps<{
  role: Role;
  allRoles: Role[];
}>();

// 计算属性：获取所有好感度关系
const favorRelations = computed(() => {
  return props.role.favorRelations.map(relation => {
    const targetRole = props.allRoles.find(r => r.id === relation.targetId);
    return {
      ...relation,
      targetName: targetRole?.name || `未知角色(${relation.targetId})`
    };
  });
});

// 获取目标角色名称
function getTargetName(targetId: number): string {
  const targetRole = props.allRoles.find(r => r.id === targetId);
  return targetRole?.name || `未知角色(${targetId})`;
}

// 获取好感度等级名称
function getLevelName(value: number): string {
  return getLevel(value);
}

// 获取好感度值的CSS类
function getFavorClass(value: number): string {
  if (value >= 70) return 'favor-high';
  if (value >= 40) return 'favor-medium';
  if (value >= 10) return 'favor-low';
  if (value >= -10) return 'favor-neutral';
  if (value >= -50) return 'favor-negative';
  return 'favor-hostile';
}
</script>

<style scoped>
.role-favor-list {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.2rem;
}

.no-relations {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.favor-relations {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.favor-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.target-name {
  flex: 1;
  font-weight: 500;
}

.favor-value {
  width: 60px;
  text-align: center;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin: 0 0.5rem;
}

.favor-level {
  width: 80px;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

/* 好感度值的颜色样式 */
.favor-high {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.favor-medium {
  background-color: #e3f2fd;
  color: #1976d2;
}

.favor-low {
  background-color: #fff3e0;
  color: #f57c00;
}

.favor-neutral {
  background-color: #f5f5f5;
  color: #757575;
}

.favor-negative {
  background-color: #ffebee;
  color: #d32f2f;
}

.favor-hostile {
  background-color: #fce4ec;
  color: #c2185b;
}
</style> 