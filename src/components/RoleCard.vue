<script setup lang="ts">
/**
 * 角色卡片组件
 * 
 * 此组件用于展示角色的详细信息，包括基本信息、特质、政治立场、技能和好感关系。
 * 设计为在角色详情页面使用，提供完整的角色数据展示。
 */

import { computed } from 'vue';
import type { Role } from '../types/Role';
import TraitBadge from './TraitBadge.vue';
import SkillSection from './SkillSection.vue';
import RoleFavorList from './RoleFavorList.vue';
import PoliticalStanceSection from './PoliticalStanceSection.vue';
import { getOverallPersonalityDescription, getPersonalityTooltip } from '../utils/personalityDescriptionUtils';
import { gameEngine } from '../core/GameEngine';

// 组件属性定义
const props = defineProps<{
  role: Role;                // 要显示的角色数据
  allRoles: Role[];          // 所有角色数据，用于关系展示
}>();

// 计算模态框ID，确保每个角色卡片有唯一的模态框标识
const modalId = computed(() => `role-favor-modal-${props.role.id}`);

// 计算角色是否饥饿
const isHungry = computed(() => gameEngine.isRoleHungry(props.role.id));

// 获取饥饿状态文本描述
const hungerStatusText = computed(() => {
  return isHungry.value ? '饥饿' : '充足';
});

// 获取饥饿状态样式类
const hungerStatusClass = computed(() => {
  return isHungry.value ? 'badge-error' : 'badge-success';
});

// 使用DiceBear API生成角色头像
const avatarUrl = computed(() => {
  // 使用DiceBear的HTTP API直接生成头像URL
  // 选择avataaars风格，将角色ID用作种子，确保头像稳定性
  const style = 'avataaars';
  // 将ID直接作为种子参数，无需转换
  const seed = encodeURIComponent(props.role.id);
  
  // 根据性别定义可用的发型选项
  let topOptions = [];
  
  if (props.role.gender === 'Female') {
    // 女性可用发型
    topOptions = [
      'bigHair', 'bob', 'bun','curly','curvy','dreads','frida','froBand','longButNotTooLong','miaWallace','shaggyMullet','shavedSides','straight01','straight02','straightAndStrand'
    ];
  } else {
    // 男性可用发型
    topOptions = [
      'dreads', 'dreads01','dreads02','frizzle','fro','shaggy','shortCurly','shortFlat','shortRound','shortWaved','theCaesar','theCaesarAndSidePart'
    ];
  }
  
  // 将数组转换为逗号分隔的字符串
  const tops = topOptions.join(',');
  
  // 指定允许的嘴部表情列表
  const mouthOptions = [
    'concerned', 'default', 'disbelief', 'eating', 
    'sad', 'serious', 'smile', 'twinkle'
  ];
  const mouths = mouthOptions.join(',');
  
  // 设置参数
  const options = {
    seed: seed,
    top: tops,
    mouth: mouths,
    facialHairProbability: props.role.gender === 'Female' ? 0 : 50,
    size: 100
  };
  
  // 构建URL查询参数 - 由于顶部参数格式特殊，单独处理
  let queryParams = '';
  for (const [key, value] of Object.entries(options)) {
    if (queryParams) queryParams += '&';
    queryParams += `${key}=${encodeURIComponent(value)}`;
  }
  
  // 返回完整的DiceBear API URL
  return `https://api.dicebear.com/9.x/${style}/svg?${queryParams}`;
});
</script>

<template>
  <div class="w-full">
    <!-- 角色详情卡片头部：名称、性别、年龄和个性描述 -->
    <div class="card-header p-4 mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-baseline gap-2">
          <h3 class="text-lg font-semibold">{{ role.name }}</h3>
          <div class="avatar">
            <div class="size-14 rounded-full">
              <img :src="avatarUrl" :alt="`${role.name}的头像`" />
            </div>
          </div>
          
          <!-- 角色个性描述：悬停显示详细人格特质 -->
          <div class="tooltip">
            <span class="tooltip-toggle text-sm text-gray-600 cursor-help">
              {{ getOverallPersonalityDescription(role.aiPersonality) }}
            </span>
            <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
              <span class="tooltip-body tooltip-info" v-html="getPersonalityTooltip(role.aiPersonality)"></span>
            </span>
          </div>
        </div>
        <div>
          <!-- 性别和年龄标签 -->
          <span 
            class="badge" 
            :class="role.gender === 'Male' ? 'badge-info' : 'badge-pink'"
          >
            {{ role.gender }}
          </span>
          <span class="badge badge-ghost ms-2">{{ role.age }} years</span>
          
          <!-- 饥饿状态标签 -->
          <span 
            class="badge ms-2" 
            :class="hungerStatusClass"
            :title="`食物状态: ${isHungry ? '饥饿' : '充足'}`"
          >
            <span class="icon-[tabler--apple] size-3 me-1"></span>
            {{ hungerStatusText }}
          </span>
        </div>
      </div>
    </div>

    <!-- 详情内容区域：特质、政治立场、技能和好感关系 -->
    <div class="grid grid-cols-1 gap-4">
      <!-- 特质部分：按类别分组显示 -->
      <div>
        <h4 class="text-base font-semibold mb-3 pb-1 border-b">Traits</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <!-- 按四大类别分组：身体、性格、技能和背景 -->
          <div v-for="category in ['Physical', 'Personality', 'Skill', 'Background']" :key="category" class="rounded p-3">
            <h5 class="text-sm font-medium mb-2">{{ category }}</h5>
            <div class="flex flex-wrap">
              <!-- 显示当前类别的所有特质 -->
              <TraitBadge 
                v-for="trait in role.traits.filter(t => t.category === category)" 
                :key="trait.id" 
                :trait="trait" 
                show-sub-type
              />
              <!-- 当没有该类别特质时显示提示 -->
              <span v-if="!role.traits.some(t => t.category === category)" class="text-sm italic">None</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 政治立场部分：使用专门的组件展示 -->
      <PoliticalStanceSection :political-stance="role.politicalStance" />

      <!-- 技能部分：展示角色的所有技能和专长 -->
      <div>
        <h4 class="text-base font-semibold mb-3 pb-1 border-b">Skills</h4>
        <SkillSection :skills="role.skills" :specialtyType="role.specialtyType" />
      </div>

      <!-- 好感关系部分：显示与其他角色的关系 -->
      <div>
        <div class="flex items-center justify-between mb-3 pb-1 border-b">
          <h4 class="text-base font-semibold">Favor Relationships</h4>
          <!-- 查看详情按钮：打开关系详情模态框 -->
          <button 
            class="btn btn-sm btn-soft-primary"
            :data-overlay="`#${modalId}`"
          >
            <span class="icon-[tabler--heart] size-4 me-1"></span>
            View Details
          </button>
        </div>
        <!-- 角色关系列表：显示与每个角色的好感度 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div 
            v-for="relation in role.favorRelations" 
            :key="relation.targetId" 
            class="flex items-center justify-between p-2 rounded"
          >
            <!-- 目标角色名称 -->
            <span class="font-medium">
              {{ allRoles.find(r => r.id === relation.targetId)?.name || 'Unknown Character' }}
            </span>
            <!-- 好感度值和颜色指示 -->
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

  <!-- 好感关系模态框：点击"查看详情"按钮时显示，包含完整的好感关系数据 -->
  <div :id="modalId" class="overlay modal overlay-open:opacity-100 hidden overlay-open:duration-300" role="dialog" tabindex="-1">
    <div class="modal-dialog overlay-open:opacity-100 overlay-open:duration-300">
      <div class="modal-content">
        <!-- 模态框标题 -->
        <div class="modal-header">
          <h3 class="modal-title">{{ role.name }}'s Favor Relationships</h3>
          <button type="button" class="btn btn-text btn-circle btn-sm absolute end-3 top-3" aria-label="Close" :data-overlay="`#${modalId}`">
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>
        <!-- 模态框内容：使用专门的组件显示详细关系数据 -->
        <div class="modal-body">
          <RoleFavorList :role="role" :all-roles="allRoles" />
        </div>
        <!-- 模态框底部 -->
        <div class="modal-footer">
          <button type="button" class="btn btn-soft btn-secondary" :data-overlay="`#${modalId}`">Close</button>
        </div>
      </div>
    </div>
  </div>
</template> 