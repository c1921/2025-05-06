<script setup lang="ts">
import { computed } from 'vue';
import type { Skill, SkillType } from '../types/Skill';
import SkillBar from './SkillBar.vue';

const props = defineProps<{
  skills: Skill[];
  specialtyType?: SkillType;
}>();

// 按技能类型分组
const groupedSkills = computed(() => {
  const groups: Record<SkillType, Skill[]> = {
    Combat: [],
    Magic: [],
    Survival: [],
    Social: [],
    Crafting: []
  };
  
  // 为每个技能类型分组
  props.skills.forEach(skill => {
    groups[skill.type].push(skill);
  });
  
  return groups;
});

// 检查技能类型是否为专长
const isSpecialtyType = (type: SkillType) => {
  return props.specialtyType === type;
};

// 获取技能类型标题
const getTypeTitle = (type: SkillType) => {
  return isSpecialtyType(type) ? `${type} (Specialty)` : type;
};

// 获取技能类型的颜色类
const getTypeColorClass = (type: SkillType): string => {
  switch (type) {
    case 'Combat': return 'text-error-500';
    case 'Magic': return 'text-violet-500';
    case 'Survival': return 'text-success-500';
    case 'Social': return 'text-info-500';
    case 'Crafting': return 'text-warning-500';
    default: return '';
  }
};
</script>

<template>
  <div class="mt-5">
    
    <div v-for="(skills, type) in groupedSkills" :key="type" class="mb-4">
      <div 
        class="text-sm font-semibold mb-2"
        :class="[
          getTypeColorClass(type as SkillType),
          { 'font-bold': isSpecialtyType(type as SkillType) }
        ]"
      >
        {{ getTypeTitle(type as SkillType) }}
        <span v-if="isSpecialtyType(type as SkillType)" class="text-amber-500 ms-1">★</span>
      </div>
      
      <div class="pl-2">
        <SkillBar 
          v-for="skill in skills" 
          :key="skill.id" 
          :skill="skill" 
        />
      </div>
    </div>
  </div>
</template> 