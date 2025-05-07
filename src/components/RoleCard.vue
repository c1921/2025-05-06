<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Role } from '../types/Role';
import TraitBadge from './TraitBadge.vue';
import SkillSection from './SkillSection.vue';
import { getTopSkills } from '../utils/roleUtils';
import RoleFavorList from './RoleFavorList.vue';
import PoliticalStanceSection from './PoliticalStanceSection.vue';

const props = defineProps<{
  role: Role;
  allRoles: Role[];
  isDetailView?: boolean; // Whether in detail view mode
}>();

const modalId = computed(() => `role-favor-modal-${props.role.id}`);
const topSkills = computed(() => getTopSkills(props.role, 3));
</script>

<template>
  <!-- List view mode - used for displaying in character list -->
  <div v-if="!isDetailView"
       class="card card-ed shadow-sm hover:shadow-md transition-all cursor-pointer m-2 w-72" 
       :data-overlay="`#${modalId}`" 
       aria-haspopup="dialog" 
       aria-expanded="false">
    <div class="card-body p-4">
      <h3 class="card-title -b pb-2 text-lg font-semibold ">{{ role.name }}</h3>
      <div class="mt-3">
        <p class="my-1.5">Gender: 
          <span :class="role.gender === 'Male' ? 'text-blue-600 font-semibold' : 'text-pink-500 font-semibold'">
            {{ role.gender }}
          </span>
        </p>
        <p class="my-1.5">Age: {{ role.age }} years old</p>
      </div>
      <div class="mt-4 -t -dashed pt-3">
        <h4 class="text-sm  mb-2">Traits:</h4>
        <div class="flex flex-wrap">
          <TraitBadge v-for="trait in role.traits" :key="trait.id" :trait="trait" />
        </div>
      </div>
      <SkillSection :skills="role.skills" :specialtyType="role.specialtyType" />
    </div>
  </div>

  <!-- Detail view mode - used to display complete content in sidebar -->
  <div v-else class="w-full">
    <div class="grid grid-cols-1 gap-4">
      <!-- Traits section -->
      <div>
        <h4 class="text-base font-semibold  mb-3 pb-1 -b">Traits</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <div v-for="category in ['Physical', 'Personality', 'Skill', 'Background']" :key="category" class="rounded p-3 ">
            <h5 class="text-sm font-medium  mb-2">{{ category }}</h5>
            <div class="flex flex-wrap">
              <TraitBadge 
                v-for="trait in role.traits.filter(t => t.category === category)" 
                :key="trait.id" 
                :trait="trait" 
                show-sub-type
              />
              <span v-if="!role.traits.some(t => t.category === category)" class="text-sm  italic">None</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Political stance section -->
      <div>
        <PoliticalStanceSection :political-stance="role.politicalStance" />
      </div>

      <!-- Skills section -->
      <div>
        <h4 class="text-base font-semibold  mb-3 pb-1 -b">Skills</h4>
        <SkillSection :skills="role.skills" :specialtyType="role.specialtyType" />
      </div>

      <!-- Favor relationships section -->
      <div>
        <div class="flex items-center justify-between mb-3 pb-1 -b">
          <h4 class="text-base font-semibold ">Favor Relationships</h4>
          <button 
            class="btn btn-sm btn-soft-primary"
            :data-overlay="`#${modalId}`"
          >
            <span class="icon-[tabler--heart] size-4 me-1"></span>
            View Details
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div 
            v-for="relation in role.favorRelations" 
            :key="relation.targetId" 
            class="flex items-center justify-between p-2  rounded"
          >
            <span class="font-medium">
              {{ allRoles.find(r => r.id === relation.targetId)?.name || 'Unknown Character' }}
            </span>
            <span 
              class="badge"
              :class="relation.value >= 40 ? 'badge-success' : relation.value >= 0 ? 'badge-info' : 'badge-error'"
            >
              {{ relation.value }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Favor list modal (used in both modes) -->
  <div :id="modalId" class="overlay modal overlay-open:opacity-100 hidden overlay-open:duration-300" role="dialog" tabindex="-1">
    <div class="modal-dialog overlay-open:opacity-100 overlay-open:duration-300">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ role.name }}'s Favor Relationships</h3>
          <button type="button" class="btn btn-text btn-circle btn-sm absolute end-3 top-3" aria-label="Close" :data-overlay="`#${modalId}`">
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>
        <div class="modal-body">
          <RoleFavorList :role="role" :all-roles="allRoles" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-soft btn-secondary" :data-overlay="`#${modalId}`">Close</button>
        </div>
      </div>
    </div>
  </div>
</template> 