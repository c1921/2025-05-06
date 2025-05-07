<script setup lang="ts">
import { computed } from 'vue';
import type { PoliticalStance } from '../types/Role';

const props = defineProps<{
  politicalStance: PoliticalStance;
}>();

// Get label based on value
function getPositionLabel(value: number, dimension: 'economic' | 'diplomatic' | 'civil' | 'societal'): string {
  // Economic: left vs right
  if (dimension === 'economic') {
    if (value < 30) return 'Far Left';
    if (value < 45) return 'Left';
    if (value < 55) return 'Centrist';
    if (value < 70) return 'Right';
    return 'Far Right';
  }
  
  // Diplomatic: globalist vs nationalist
  if (dimension === 'diplomatic') {
    if (value < 30) return 'Globalist';
    if (value < 45) return 'Internationalist';
    if (value < 55) return 'Balanced';
    if (value < 70) return 'Patriotic';
    return 'Nationalist';
  }
  
  // Civil: libertarian vs authoritarian
  if (dimension === 'civil') {
    if (value < 30) return 'Libertarian';
    if (value < 45) return 'Liberal';
    if (value < 55) return 'Moderate';
    if (value < 70) return 'Statist';
    return 'Authoritarian';
  }
  
  // Societal: progressive vs traditional
  if (dimension === 'societal') {
    if (value < 30) return 'Progressive';
    if (value < 45) return 'Modern';
    if (value < 55) return 'Neutral';
    if (value < 70) return 'Conservative';
    return 'Traditional';
  }
  
  return 'Unknown';
}

const economicLabel = computed(() => getPositionLabel(props.politicalStance.economic, 'economic'));
const diplomaticLabel = computed(() => getPositionLabel(props.politicalStance.diplomatic, 'diplomatic'));
const civilLabel = computed(() => getPositionLabel(props.politicalStance.civil, 'civil'));
const societalLabel = computed(() => getPositionLabel(props.politicalStance.societal, 'societal'));
</script>

<template>
  <div class="political-stance">
    <h4 class="text-base font-semibold mb-3 pb-1 border-b">Political Stance</h4>
    
    <div class="space-y-5">
      <!-- Economic Axis -->
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm text-economic-left font-medium">Left</span>
          <span class="text-sm font-medium">{{ economicLabel }}</span>
          <span class="text-sm text-economic-right font-medium">Right</span>
        </div>
        <div class="progress h-3">
          <div 
            class="progress-bar bg-economic-left rounded-e-none" 
            :style="`width: ${100 - politicalStance.economic}%`"
          ></div>
          <div 
            class="progress-bar bg-economic-right rounded-s-none" 
            :style="`width: ${politicalStance.economic}%`"
          ></div>
        </div>
        <div class="text-right text-xs text-gray-500 mt-1">Value: {{ politicalStance.economic }}</div>
      </div>
      
      <!-- Diplomatic Axis -->
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm text-diplomatic-left font-medium">Globalist</span>
          <span class="text-sm font-medium">{{ diplomaticLabel }}</span>
          <span class="text-sm text-diplomatic-right font-medium">Nationalist</span>
        </div>
        <div class="progress h-3">
          <div 
            class="progress-bar bg-diplomatic-left rounded-e-none" 
            :style="`width: ${100 - politicalStance.diplomatic}%`"
          ></div>
          <div 
            class="progress-bar bg-diplomatic-right rounded-s-none" 
            :style="`width: ${politicalStance.diplomatic}%`"
          ></div>
        </div>
        <div class="text-right text-xs text-gray-500 mt-1">Value: {{ politicalStance.diplomatic }}</div>
      </div>
      
      <!-- Civil Axis -->
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm text-civil-left font-medium">Libertarian</span>
          <span class="text-sm font-medium">{{ civilLabel }}</span>
          <span class="text-sm text-civil-right font-medium">Authoritarian</span>
        </div>
        <div class="progress h-3">
          <div 
            class="progress-bar bg-civil-left rounded-e-none" 
            :style="`width: ${100 - politicalStance.civil}%`"
          ></div>
          <div 
            class="progress-bar bg-civil-right rounded-s-none" 
            :style="`width: ${politicalStance.civil}%`"
          ></div>
        </div>
        <div class="text-right text-xs text-gray-500 mt-1">Value: {{ politicalStance.civil }}</div>
      </div>
      
      <!-- Societal Axis -->
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm text-societal-left font-medium">Progressive</span>
          <span class="text-sm font-medium">{{ societalLabel }}</span>
          <span class="text-sm text-societal-right font-medium">Traditional</span>
        </div>
        <div class="progress h-3">
          <div 
            class="progress-bar bg-societal-left rounded-e-none" 
            :style="`width: ${100 - politicalStance.societal}%`"
          ></div>
          <div 
            class="progress-bar bg-societal-right rounded-s-none" 
            :style="`width: ${politicalStance.societal}%`"
          ></div>
        </div>
        <div class="text-right text-xs text-gray-500 mt-1">Value: {{ politicalStance.societal }}</div>
      </div>
    </div>
  </div>
</template> 