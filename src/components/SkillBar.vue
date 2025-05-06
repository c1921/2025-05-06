<script setup lang="ts">
import { computed } from 'vue';
import type { Skill } from '../types/Skill';
import { getSkillLevelDescription, MAX_SKILL_LEVEL, getEffectiveLevel } from '../types/Skill';

const props = defineProps<{
  skill: Skill;
}>();

// 获取技能有效等级
const effectiveLevel = computed(() => {
  return getEffectiveLevel(props.skill);
});

// 获取技能等级描述
const levelDescription = computed(() => {
  return getSkillLevelDescription(effectiveLevel.value);
});

// 判断是否有特质加成
const hasBonus = computed(() => props.skill.bonusLevel !== 0);

// 获取加成文本
const bonusText = computed(() => {
  if (!hasBonus.value) return '';
  return props.skill.bonusLevel > 0 ? `+${props.skill.bonusLevel}` : `${props.skill.bonusLevel}`;
});

// 获取技能类型的进度条颜色类
const getProgressColorClass = (type: Skill['type']): string => {
  switch (type) {
    case 'Combat': return 'progress-error';
    case 'Magic': return 'bg-violet-500'; // FlyonUI没有violet预设，使用Tailwind
    case 'Survival': return 'progress-success';
    case 'Social': return 'progress-info';
    case 'Crafting': return 'progress-warning';
    default: return 'progress-secondary';
  }
};

// 计算最终等级百分比（基于有效等级）
const effectiveProgressPercent = computed(() => {
  return (effectiveLevel.value / MAX_SKILL_LEVEL) * 100;
});

// 获取加成文本颜色
const getBonusTextColorClass = computed(() => {
  return props.skill.bonusLevel > 0 ? 'text-success-500' : 'text-error-500';
});

// 获取技能详细描述（用于tooltip）
const skillTooltip = computed(() => {
  let tooltip = `${props.skill.name} (${props.skill.type}): ${props.skill.description}\n`;
  tooltip += `Base Level: ${props.skill.baseLevel}`;
  
  if (hasBonus.value) {
    tooltip += `\nTrait Bonus: ${bonusText.value}`;
    tooltip += `\nEffective Level: ${effectiveLevel.value}`;
  }
  
  return tooltip;
});
</script>

<template>
  <div class="mb-2 group" data-fy-tooltip-hover :data-fy-title="skillTooltip">
    <div class="flex justify-between items-center mb-1">
      <span class="text-xs font-medium text-gray-700">{{ skill.name }}</span>
      <div class="text-xs text-gray-500 flex items-center gap-1">
        {{ effectiveLevel }}
        <span v-if="hasBonus" class="text-[10px] font-semibold" :class="getBonusTextColorClass">
          ({{ bonusText }})
        </span>
        <span class="text-gray-400 text-[10px]">({{ levelDescription }})</span>
      </div>
    </div>
    
    <!-- 使用FlyonUI的progress组件，只显示最终有效等级 -->
    <div 
      class="progress" 
      role="progressbar" 
      :aria-label="`${skill.name} skill level`" 
      :aria-valuenow="effectiveLevel" 
      aria-valuemin="0" 
      :aria-valuemax="MAX_SKILL_LEVEL"
    >
      <div 
        class="progress-bar" 
        :class="getProgressColorClass(skill.type)"
        :style="{ width: `${effectiveProgressPercent}%` }"
      ></div>
    </div>
  </div>
</template> 