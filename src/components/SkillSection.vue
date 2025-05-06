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
</script>

<template>
  <div class="skills-section">
    <h4>Skills</h4>
    
    <div v-for="(skills, type) in groupedSkills" :key="type" class="skill-group">
      <div 
        class="skill-group-header" 
        :class="{ 'specialty': isSpecialtyType(type as SkillType) }"
      >
        {{ getTypeTitle(type as SkillType) }}
      </div>
      
      <div class="skill-list">
        <SkillBar 
          v-for="skill in skills" 
          :key="skill.id" 
          :skill="skill" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-section {
  margin-top: 20px;
}

h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.skill-group {
  margin-bottom: 15px;
}

.skill-group-header {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
}

.specialty {
  color: #e67e22;
  font-weight: 700;
}

.skill-list {
  padding-left: 8px;
}
</style> 