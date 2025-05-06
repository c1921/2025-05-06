<template>
  <div class="role-favor-list">
    <h3>{{ role.name }} 的好感度关系</h3>
    
    <div v-if="favorRelations.length === 0" class="no-relations">
      暂无好感度关系
    </div>
    
    <div v-else class="favor-relations">
      <div v-for="relation in favorRelations" :key="relation.targetId" class="favor-item">
        <div class="target-info">
          <div class="target-name">{{ relation.targetName }}</div>
        </div>
        
        <div class="favor-values">
          <div class="favor-direction">
            <div class="direction-label">对方好感</div>
            <div class="favor-value" :class="getFavorClass(relation.targetToSource)">
              {{ relation.targetToSource }}
            </div>
            <div class="favor-level">{{ getLevelName(relation.targetToSource) }}</div>
          </div>
          
          <div class="favor-arrow">⟺</div>
          
          <div class="favor-direction">
            <div class="direction-label">我方好感</div>
            <div class="favor-value" :class="getFavorClass(relation.sourceToTarget)">
              {{ relation.sourceToTarget }}
            </div>
            <div class="favor-level">{{ getLevelName(relation.sourceToTarget) }}</div>
          </div>
        </div>
        
        <div v-if="relation.targetToSourceEffects.length > 0" class="trait-effects">
          <div class="effects-header">对方对我的特质影响:</div>
          <div v-for="(effect, index) in relation.targetToSourceEffects" 
               :key="`target-${index}`" 
               class="trait-effect"
               :class="getEffectClass(effect.value)">
            {{ effect.description }}
            <span class="effect-value" :class="getEffectClass(effect.value)">
              {{ effect.value > 0 ? '+' : '' }}{{ effect.value }}
            </span>
          </div>
        </div>
        
        <div v-if="relation.sourceToTargetEffects.length > 0" class="trait-effects">
          <div class="effects-header">我对对方的特质影响:</div>
          <div v-for="(effect, index) in relation.sourceToTargetEffects" 
               :key="`source-${index}`" 
               class="trait-effect"
               :class="getEffectClass(effect.value)">
            {{ effect.description }}
            <span class="effect-value" :class="getEffectClass(effect.value)">
              {{ effect.value > 0 ? '+' : '' }}{{ effect.value }}
            </span>
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
      targetName: `未知角色(${sourceRelation.targetId})`,
      sourceToTarget: sourceRelation.value,
      targetToSource: 0,
      targetToSourceEffects: [],
      sourceToTargetEffects: []
    };

    // 查找目标角色对当前角色的好感度
    const targetRelation = targetRole.favorRelations.find(r => r.targetId === props.role.id);
    const targetToSource = targetRelation ? targetRelation.value : 0;

    // 计算特质好感度影响（目标角色对当前角色的好感）
    const targetToSourceEffects = calculateTraitFavorEffects(props.role, targetRole);
    
    // 计算特质好感度影响（当前角色对目标角色的好感）
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

// 获取影响值的CSS类
function getEffectClass(value: number): string {
  if (value > 0) return 'effect-positive';
  if (value < 0) return 'effect-negative';
  return 'effect-neutral';
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
  gap: 0.8rem;
}

.favor-item {
  display: flex;
  flex-direction: column;
  padding: 0.8rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.target-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.target-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.favor-values {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.favor-direction {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 45%;
}

.direction-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.favor-arrow {
  color: #999;
  font-size: 1.2rem;
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
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.3rem;
  text-align: center;
}

.trait-effects {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.effects-header {
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.trait-effect {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.9rem;
  color: #666;
}

.effect-value {
  font-weight: 500;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  margin-left: 0.5rem;
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

/* 影响值的颜色样式 */
.effect-positive {
  color: #2e7d32;
  background-color: #e6f7e6;
}

.effect-negative {
  color: #d32f2f;
  background-color: #ffebee;
}

.effect-neutral {
  color: #757575;
  background-color: #f5f5f5;
}
</style> 