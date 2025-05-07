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
          
          <div v-if="relation.targetToSourceEffects.length > 0" class="border-t pt-2 mt-2">
            <div class="text-sm font-medium mb-1">Their Trait Effects on Me:</div>
            <div v-for="(effect, index) in relation.targetToSourceEffects" 
                 :key="`target-${index}`"
                 class="flex justify-between items-center py-1 text-sm">
              {{ effect.description }}
              <span class="badge" :class="getEffectColorClass(effect.value)">
                {{ effect.value > 0 ? '+' : '' }}{{ effect.value }}
              </span>
            </div>
          </div>
          
          <div v-if="relation.sourceToTargetEffects.length > 0" class="border-t pt-2 mt-2">
            <div class="text-sm font-medium mb-1">My Trait Effects on Them:</div>
            <div v-for="(effect, index) in relation.sourceToTargetEffects" 
                 :key="`source-${index}`"
                 class="flex justify-between items-center py-1 text-sm">
              {{ effect.description }}
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

// Component props definition
const props = defineProps<{
  role: Role;
  allRoles: Role[];
}>();

// Computed: Get all favor relationships
const favorRelations = computed(() => {
  return props.role.favorRelations.map(sourceRelation => {
    const targetRole = props.allRoles.find(r => r.id === sourceRelation.targetId);
    if (!targetRole) return {
      targetId: sourceRelation.targetId,
      targetName: `Unknown Character(${sourceRelation.targetId})`,
      sourceToTarget: sourceRelation.value,
      targetToSource: 0,
      targetToSourceEffects: [],
      sourceToTargetEffects: []
    };

    // Find target character's favor towards current character
    const targetRelation = targetRole.favorRelations.find(r => r.targetId === props.role.id);
    const targetToSource = targetRelation ? targetRelation.value : 0;

    // Calculate trait favor effects (target character to current character)
    const targetToSourceEffects = calculateTraitFavorEffects(props.role, targetRole);
    
    // Calculate trait favor effects (current character to target character)
    const sourceToTargetEffects = calculateTraitFavorEffects(targetRole, props.role);
    
    return {
      targetId: sourceRelation.targetId,
      targetName: targetRole.name,
      sourceToTarget: sourceRelation.value,
      targetToSource,
      targetToSourceEffects,
      sourceToTargetEffects
    };
  });
});

// Get favor level name
function getLevelName(value: number): string {
  return getLevel(value);
}

// Get favor value Tailwind/FlyonUI color class
function getFavorColorClass(value: number): string {
  if (value >= 70) return 'badge-success';
  if (value >= 40) return 'badge-info';
  if (value >= 10) return 'badge-warning';
  if (value >= -10) return 'badge-ghost';
  if (value >= -50) return 'badge-error';
  return 'badge-secondary';
}

// Get effect value Tailwind/FlyonUI color class
function getEffectColorClass(value: number): string {
  if (value > 0) return 'badge-success';
  if (value < 0) return 'badge-error';
  return 'badge-ghost';
}
</script> 