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

const modalId = computed(() => `role-favor-modal-${props.role.id}`);
const topSkills = computed(() => getTopSkills(props.role, 3));
</script>

<template>
  <div class="card card-bordered shadow-sm hover:shadow-md transition-all cursor-pointer m-2 w-72" 
       :data-overlay="`#${modalId}`" 
       aria-haspopup="dialog" 
       aria-expanded="false">
    <div class="card-body p-4">
      <h3 class="card-title border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">{{ role.name }}</h3>
      <div class="mt-3">
        <p class="my-1.5">Gender: 
          <span :class="role.gender === 'Male' ? 'text-blue-600 font-semibold' : 'text-pink-500 font-semibold'">
            {{ role.gender }}
          </span>
        </p>
        <p class="my-1.5">Age: {{ role.age }} years old</p>
      </div>
      <div class="mt-4 border-t border-dashed border-gray-200 pt-3">
        <h4 class="text-sm text-gray-600 mb-2">Traits:</h4>
        <div class="flex flex-wrap">
          <TraitBadge v-for="trait in role.traits" :key="trait.id" :trait="trait" />
        </div>
      </div>
      <SkillSection :skills="role.skills" :specialtyType="role.specialtyType" />
    </div>
  </div>

  <!-- 好感度列表模态窗口 -->
  <div :id="modalId" class="overlay modal overlay-open:opacity-100 hidden overlay-open:duration-300" role="dialog" tabindex="-1">
    <div class="modal-dialog overlay-open:opacity-100 overlay-open:duration-300">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ role.name }} 的好感度关系</h3>
          <button type="button" class="btn btn-text btn-circle btn-sm absolute end-3 top-3" aria-label="Close" :data-overlay="`#${modalId}`">
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>
        <div class="modal-body">
          <RoleFavorList :role="role" :all-roles="allRoles" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-soft btn-secondary" :data-overlay="`#${modalId}`">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template> 