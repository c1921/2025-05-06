<script setup lang="ts">
import { computed } from 'vue';
import type { Trait } from '../types/Trait';
import { getAllTraitEffectsDescription } from '../utils/traitEffects';
import { traitEffectsMap } from '../utils/traitEffects';

const props = defineProps<{
  trait: Trait;
  showSubType?: boolean;
  showEffects?: boolean;
}>();

// 根据特质类别获取徽章颜色
const getBadgeColor = (category: Trait['category']) => {
  switch (category) {
    case 'Physical':
      return 'bg-blue-100 text-blue-800';
    case 'Personality':
      return 'bg-green-100 text-green-800';
    case 'Skill':
      return 'bg-purple-100 text-purple-800';
    case 'Background':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 获取特质的所有效果描述
const traitEffects = computed(() => {
  return getAllTraitEffectsDescription(props.trait.id);
});

// 检查特质是否有负面效果
const hasNegativeEffect = computed(() => {
  const effects = traitEffectsMap[props.trait.id] || [];
  return effects.some(effect => effect.value < 0);
});

// 获取带有子类型和效果的提示文本
const getTooltip = computed(() => {
  let tooltip = `${props.trait.name} (${props.trait.subType}): ${props.trait.description}`;
  
  // 如果特质有效果，添加到提示中
  if (traitEffects.value.length > 0) {
    tooltip += '\n\nEffects:';
    traitEffects.value.forEach(effect => {
      tooltip += `\n• ${effect}`;
    });
  }
  
  return tooltip;
});
</script>

<template>
  <div 
    class="trait-badge" 
    :class="getBadgeColor(trait.category)"
    :title="getTooltip"
  >
    {{ trait.name }}
    <span v-if="showSubType" class="sub-type">({{ trait.subType }})</span>
    
    <!-- 显示效果标记 -->
    <span v-if="traitEffects.length > 0" class="effect-indicator">
      <span class="effect-dot" :class="{ 'has-negative': hasNegativeEffect }"></span>
    </span>
  </div>
</template>

<style scoped>
.trait-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-right: 5px;
  margin-bottom: 5px;
  cursor: help;
  position: relative;
}

.sub-type {
  font-size: 0.7rem;
  opacity: 0.8;
  margin-left: 2px;
}

.effect-indicator {
  display: inline-block;
  margin-left: 4px;
  vertical-align: middle;
}

.effect-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #27ae60;
}

.has-negative {
  background: linear-gradient(135deg, #27ae60 50%, #e74c3c 50%);
}

.bg-blue-100 {
  background-color: #dbeafe;
}
.text-blue-800 {
  color: #1e40af;
}

.bg-green-100 {
  background-color: #d1fae5;
}
.text-green-800 {
  color: #065f46;
}

.bg-purple-100 {
  background-color: #ede9fe;
}
.text-purple-800 {
  color: #5b21b6;
}

.bg-amber-100 {
  background-color: #fef3c7;
}
.text-amber-800 {
  color: #92400e;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}
.text-gray-800 {
  color: #1f2937;
}
</style> 