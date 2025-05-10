<template>
  <div class="card shadow-sm border hover:shadow-md transition-all">
    <div class="card-body p-4">
      <h3 class="card-title text-lg">{{ template.name }}</h3>
      <p class="text-sm text-base-content/70">{{ template.description }}</p>
      
      <div class="mt-2 flex flex-wrap gap-2">
        <span class="badge badge-primary">{{ getBuildingTypeName(template.type) }}</span>
        <span class="badge badge-outline">{{ getSizeRangeText() }}</span>
      </div>
      
      <div class="mt-3">
        <h4 class="font-medium text-sm mb-1">Required Materials (per sq. meter):</h4>
        <ul class="text-sm text-base-content/70">
          <li v-for="req in materialRequirementsWithNames" :key="req.itemId" class="flex items-center gap-1">
            <span class="icon-[tabler--box] size-4"></span>
            {{ req.name }}: {{ req.quantityPerSquareMeter }}
          </li>
        </ul>
      </div>
      
      <div class="card-actions justify-end mt-3">
        <button 
          class="btn btn-primary btn-sm" 
          @click="$emit('select', template)"
        >
          Select
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import type { BuildingTemplate, MaterialRequirement } from '../types/Building';
import { BUILDING_TYPE_NAMES } from '../types/Building';
import { loadItems, findItemById } from '../utils/itemUtils';
import { getBuildingSizeRangeText } from '../utils/buildingUtils';

export default defineComponent({
  name: 'BuildingTemplateCard',
  props: {
    template: {
      type: Object as PropType<BuildingTemplate>,
      required: true
    }
  },
  emits: ['select'],
  setup(props) {
    const items = loadItems();
    
    const materialRequirementsWithNames = computed(() => {
      return props.template.materialRequirements.map(req => {
        const item = findItemById(items, req.itemId);
        return {
          ...req,
          name: item ? item.name : `Item #${req.itemId}`
        };
      });
    });
    
    const getBuildingTypeName = (type: string) => {
      return BUILDING_TYPE_NAMES[type as keyof typeof BUILDING_TYPE_NAMES] || type;
    };
    
    const getSizeRangeText = () => {
      return getBuildingSizeRangeText(props.template);
    };
    
    return {
      materialRequirementsWithNames,
      getBuildingTypeName,
      getSizeRangeText
    };
  }
});
</script> 