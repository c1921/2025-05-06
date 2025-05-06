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

// 根据特质类别获取徽章颜色类
const getBadgeColorClass = (category: Trait['category']): string => {
  switch (category) {
    case 'Physical':
      return 'badge-info';
    case 'Personality':
      return 'badge-success';
    case 'Skill':
      return 'badge-secondary';
    case 'Background':
      return 'badge-warning';
    default:
      return '';
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
const tooltipText = computed(() => {
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

// 获取状态点的颜色类
const getStatusColorClass = computed(() => {
  if (!traitEffects.value.length) return '';
  
  if (hasNegativeEffect.value) {
    return 'status-warning'; // 混合效果使用warning
  } else {
    return 'status-success'; // 只有正面效果使用success
  }
});
</script>

<template>
  <span 
    class="badge badge-soft text-xs me-1.5 mb-1.5 inline-flex items-center" 
    :class="getBadgeColorClass(trait.category)"
    data-fy-tooltip-hover
    :data-fy-title="tooltipText"
  >
    {{ trait.name }}
    <span v-if="showSubType" class="text-[10px] opacity-80 ms-0.5">({{ trait.subType }})</span>
    
    <!-- 效果状态点 -->
    <span 
      v-if="traitEffects.length > 0" 
      class="status status-xs ms-1"
      :class="getStatusColorClass"
    ></span>
  </span>
</template> 