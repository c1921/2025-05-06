<template>
  <div>
    <div v-if="favorRelations.length === 0" class="text-center italic py-4">
      No favor relationships available
    </div>
    
    <div v-else class="space-y-3">
      <div v-for="relation in favorRelations" :key="relation.targetId" class="card card-bordered">
        <div class="card-body p-3">
          <div class="border-b pb-2 mb-3 flex items-center justify-between">
            <h4 class="text-lg font-semibold">{{ relation.targetName }}</h4>
          </div>
          
          <div class="flex items-center justify-between mb-3">
            <div class="flex flex-col items-center w-2/5">
              <span class="text-sm mb-1">Their Favor</span>
              <span class="badge w-14 text-center font-bold" :class="getFavorColorClass(relation.targetToSource)">
                {{ relation.targetToSource }}
              </span>
              <span class="text-xs mt-1">{{ getLevelName(relation.targetToSource) }}</span>
            </div>
            
            <span class="text-xl">⟺</span>
            
            <div class="flex flex-col items-center w-2/5">
              <span class="text-sm mb-1">My Favor</span>
              <span class="badge w-14 text-center font-bold" :class="getFavorColorClass(relation.sourceToTarget)">
                {{ relation.sourceToTarget }}
              </span>
              <span class="text-xs mt-1">{{ getLevelName(relation.sourceToTarget) }}</span>
            </div>
          </div>
          
          <!-- 他们对我的影响 -->
          <div v-if="relation.targetToSourceEffects.length > 0 || relation.targetToSourcePoliticalEffects.length > 0" 
               class="border-t pt-2 mt-2">
            <div class="text-sm font-medium mb-1">Their Effects on Me:</div>
            
            <!-- 特质效果 -->
            <div v-for="(effect, index) in relation.targetToSourceEffects" 
                 :key="`target-trait-${index}`"
                 class="flex justify-between items-center py-1 text-sm">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 text-xs rounded-full" :class="getEffectTypeBadgeClass('trait')">Trait</span>
                {{ effect.description }}
              </div>
              <span class="badge" :class="getEffectColorClass(effect.value)">
                {{ effect.value > 0 ? '+' : '' }}{{ effect.value }}
              </span>
            </div>
            
            <!-- 政治立场效果 -->
            <div v-for="(effect, index) in relation.targetToSourcePoliticalEffects" 
                 :key="`target-political-${index}`"
                 class="flex justify-between items-center py-1 text-sm">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 text-xs rounded-full" :class="getEffectTypeBadgeClass('political')">Politics</span>
                {{ effect.description }}
              </div>
              <span class="badge" :class="getEffectColorClass(effect.value)">
                {{ effect.value > 0 ? '+' : '' }}{{ effect.value }}
              </span>
            </div>
          </div>
          
          <!-- 我对他们的影响 -->
          <div v-if="relation.sourceToTargetEffects.length > 0 || relation.sourceToTargetPoliticalEffects.length > 0" 
               class="border-t pt-2 mt-2">
            <div class="text-sm font-medium mb-1">My Effects on Them:</div>
            
            <!-- 特质效果 -->
            <div v-for="(effect, index) in relation.sourceToTargetEffects" 
                 :key="`source-trait-${index}`"
                 class="flex justify-between items-center py-1 text-sm">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 text-xs rounded-full" :class="getEffectTypeBadgeClass('trait')">Trait</span>
                {{ effect.description }}
              </div>
              <span class="badge" :class="getEffectColorClass(effect.value)">
                {{ effect.value > 0 ? '+' : '' }}{{ effect.value }}
              </span>
            </div>
            
            <!-- 政治立场效果 -->
            <div v-for="(effect, index) in relation.sourceToTargetPoliticalEffects" 
                 :key="`source-political-${index}`"
                 class="flex justify-between items-center py-1 text-sm">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 text-xs rounded-full" :class="getEffectTypeBadgeClass('political')">Politics</span>
                {{ effect.description }}
              </div>
              <span class="badge" :class="getEffectColorClass(effect.value)">
                {{ effect.value > 0 ? '+' : '' }}{{ effect.value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Role } from '../types/Role';
import { getFavorLevelName as getLevel } from '../utils/favorUtils';
import { calculateTraitFavorEffects } from '../utils/traitFavorUtils';
import { calculatePoliticalFavorEffects } from '../utils/politicalFavorUtils';

// 定义组件属性
const props = defineProps<{
  role: Role;
  allRoles: Role[];
}>();

// 计算属性：获取所有好感度关系
const favorRelations = computed(() => {
  return props.role.favorRelations.map(sourceRelation => {
    const targetRole = props.allRoles.find(r => r.id === sourceRelation.targetId);
    if (!targetRole) return {
      targetId: sourceRelation.targetId,
      targetName: `Unknown Character(${sourceRelation.targetId})`,
      sourceToTarget: sourceRelation.value,
      targetToSource: 0,
      targetToSourceEffects: [],
      sourceToTargetEffects: [],
      targetToSourcePoliticalEffects: [],
      sourceToTargetPoliticalEffects: []
    };

    // 查找目标角色对当前角色的好感度
    const targetRelation = targetRole.favorRelations.find(r => r.targetId === props.role.id);
    const targetToSource = targetRelation ? targetRelation.value : 0;

    // 计算特质好感度影响（目标角色对当前角色的好感）
    const targetToSourceEffects = calculateTraitFavorEffects(props.role, targetRole);
    
    // 计算特质好感度影响（当前角色对目标角色的好感）
    const sourceToTargetEffects = calculateTraitFavorEffects(targetRole, props.role);

    // 计算政治立场好感度影响（目标角色对当前角色的好感）
    const targetToSourcePoliticalEffects = calculatePoliticalFavorEffects(props.role, targetRole);
    
    // 计算政治立场好感度影响（当前角色对目标角色的好感）
    const sourceToTargetPoliticalEffects = calculatePoliticalFavorEffects(targetRole, props.role);
    
    return {
      targetId: sourceRelation.targetId,
      targetName: targetRole.name,
      sourceToTarget: sourceRelation.value,
      targetToSource,
      targetToSourceEffects,
      sourceToTargetEffects,
      targetToSourcePoliticalEffects,
      sourceToTargetPoliticalEffects
    };
  });
});

// 获取好感度等级名称
function getLevelName(value: number): string {
  return getLevel(value);
}

// 获取好感度值的Tailwind/FlyonUI颜色类
function getFavorColorClass(value: number): string {
  if (value >= 70) return 'badge-success';
  if (value >= 40) return 'badge-info';
  if (value >= 10) return 'badge-warning';
  if (value >= -10) return 'badge-ghost';
  if (value >= -50) return 'badge-error';
  return 'badge-secondary';
}

// 获取影响值的Tailwind/FlyonUI颜色类
function getEffectColorClass(value: number): string {
  if (value > 0) return 'badge-success';
  if (value < 0) return 'badge-error';
  return 'badge-ghost';
}

// 获取效果类型标签类
function getEffectTypeBadgeClass(type: 'trait' | 'political'): string {
  if (type === 'trait') return 'bg-amber-100 text-amber-800';
  return 'bg-blue-100 text-blue-800';
}
</script> 