<script setup lang="ts">
import type { Role } from '../types/Role';
import TraitBadge from './TraitBadge.vue';
import SkillSection from './SkillSection.vue';

defineProps<{
  role: Role;
}>();
</script>

<template>
  <div class="role-card">
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
</style> 