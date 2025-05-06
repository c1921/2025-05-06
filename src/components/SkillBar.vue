<script setup lang="ts">
import { computed } from 'vue';
import type { Skill } from '../types/Skill';
import { getSkillLevelDescription, MAX_SKILL_LEVEL, getEffectiveLevel } from '../types/Skill';

const props = defineProps<{
  skill: Skill;
}>();

// 根据技能类型获取颜色
const getColorByType = (type: Skill['type']) => {
  switch (type) {
    case 'Combat': return '#e74c3c'; // 红色
    case 'Magic': return '#9b59b6'; // 紫色
    case 'Survival': return '#27ae60'; // 绿色
    case 'Social': return '#3498db'; // 蓝色
    case 'Crafting': return '#f39c12'; // 橙色
    default: return '#95a5a6'; // 灰色
  }
};

// 获取技能有效等级
const effectiveLevel = computed(() => {
  return getEffectiveLevel(props.skill);
});

// 获取技能等级描述
const levelDescription = computed(() => {
  return getSkillLevelDescription(effectiveLevel.value);
});

// 技能条颜色
const barColor = computed(() => {
  return getColorByType(props.skill.type);
});

// 判断是否有特质加成
const hasBonus = computed(() => props.skill.bonusLevel !== 0);

// 获取加成文本
const bonusText = computed(() => {
  if (!hasBonus.value) return '';
  return props.skill.bonusLevel > 0 ? `+${props.skill.bonusLevel}` : `${props.skill.bonusLevel}`;
});

// 获取技能详细描述（用于tooltip）
const getTooltip = computed(() => {
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
  <div class="skill-bar-container" :title="getTooltip">
    <div class="skill-info">
      <span class="skill-name">{{ skill.name }}</span>
      <span class="skill-level-text">
        {{ effectiveLevel }} 
        <span v-if="hasBonus" class="bonus-text" :class="{ 'bonus-positive': skill.bonusLevel > 0, 'bonus-negative': skill.bonusLevel < 0 }">
          ({{ bonusText }})
        </span>
        <span class="level-desc">({{ levelDescription }})</span>
      </span>
    </div>
    <div class="skill-bar-wrapper">
      <!-- 基础等级条 -->
      <div 
        class="skill-bar base-level-bar" 
        :style="{ 
          width: `${(skill.baseLevel / MAX_SKILL_LEVEL) * 100}%`,
          backgroundColor: barColor
        }"
      ></div>
      <!-- 加成等级条，只在有加成时显示 -->
      <div 
        v-if="skill.bonusLevel !== 0"
        class="skill-bar bonus-level-bar" 
        :class="{ 'bonus-positive': skill.bonusLevel > 0, 'bonus-negative': skill.bonusLevel < 0 }"
        :style="{ 
          width: `${(Math.abs(skill.bonusLevel) / MAX_SKILL_LEVEL) * 100}%`,
          left: `${(skill.baseLevel / MAX_SKILL_LEVEL) * 100}%`
        }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.skill-bar-container {
  margin-bottom: 8px;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  font-size: 0.8rem;
}

.skill-name {
  font-weight: 500;
}

.skill-level-text {
  color: #666;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.level-desc {
  color: #888;
}

.bonus-text {
  font-size: 0.7rem;
  font-weight: 600;
}

.bonus-positive {
  color: #27ae60;
}

.bonus-negative {
  color: #e74c3c;
}

.skill-bar-wrapper {
  width: 100%;
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.skill-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  position: absolute;
}

.base-level-bar {
  z-index: 1;
  opacity: 0.85;
}

.bonus-level-bar {
  z-index: 2;
  height: 100%;
}

.bonus-level-bar.bonus-positive {
  background-color: #27ae60;
}

.bonus-level-bar.bonus-negative {
  background-color: #e74c3c;
}
</style> 