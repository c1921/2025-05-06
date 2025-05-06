<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Role } from '../types/Role';
import TraitBadge from './TraitBadge.vue';
import SkillSection from './SkillSection.vue';
import { getTopSkills } from '../utils/roleUtils';
import RoleFavorList from './RoleFavorList.vue';

const props = defineProps<{
  role: Role;
  allRoles: Role[];
}>();

const showFavorList = ref(false);

const topSkills = computed(() => getTopSkills(props.role, 3));
</script>

<template>
  <div class="role-card" @click="showFavorList = true">
    <h3>{{ role.name }}</h3>
    <div class="role-info">
      <p>Gender: <span :class="role.gender === 'Male' ? 'male' : 'female'">{{ role.gender }}</span></p>
      <p>Age: {{ role.age }} years old</p>
    </div>
    <div class="traits-section">
      <h4>Traits:</h4>
      <div class="traits-container">
        <TraitBadge v-for="trait in role.traits" :key="trait.id" :trait="trait" />
      </div>
    </div>
    <SkillSection :skills="role.skills" :specialtyType="role.specialtyType" />
    
    <!-- 好感度列表弹窗 -->
    <div v-if="showFavorList" class="favor-modal" @click.stop="showFavorList = false">
      <div class="favor-modal-content" @click.stop>
        <RoleFavorList :role="role" :all-roles="allRoles" />
        <button class="close-button" @click="showFavorList = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin: 10px;
  width: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.role-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.role-info {
  margin-top: 12px;
}

.role-info p {
  margin: 6px 0;
}

.male {
  color: #4a6bff;
  font-weight: bold;
}

.female {
  color: #ff6b9a;
  font-weight: bold;
}

.traits-section {
  margin-top: 16px;
  border-top: 1px dashed #eee;
  padding-top: 12px;
}

.traits-section h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #666;
}

.traits-container {
  display: flex;
  flex-wrap: wrap;
}

/* 好感度列表弹窗样式 */
.favor-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.favor-modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  display: block;
  margin: 1rem auto 0;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #e0e0e0;
}
</style> 