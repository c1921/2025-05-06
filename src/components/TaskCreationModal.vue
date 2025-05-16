<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { taskTemplates, createTaskFromTemplateId } from '../utils/taskCreationUtils';
import { TaskType } from '../types/Task';

const props = defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits<{
  close: [],
  taskCreated: []
}>();

// 成功消息
const successMessage = ref('');

// 错误消息
const errorMessage = ref('');

// 选中的模板
const selectedTemplate = ref<string | null>(null);

// 任务循环设置
const isRecurring = ref(false);

// 循环次数（0表示无限循环）
const cycleCount = ref(0);

// 任务详情对话框
const showTaskDetails = ref(false);

// 监听对话框状态变化
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    // 当对话框关闭时重置状态
    successMessage.value = '';
    errorMessage.value = '';
    selectedTemplate.value = null;
    isRecurring.value = false;
    cycleCount.value = 0;
    showTaskDetails.value = false;
  }
});

// 模板列表
const templates = computed(() => {
  return Object.entries(taskTemplates).map(([id, template]) => ({
    id,
    name: template.name,
    description: template.description,
    type: template.taskType,
    tags: template.tags || [],
    skills: template.requiredSkills,
    requiredItems: template.requiredItems,
    outputItems: template.outputItems,
    timeEstimate: template.timeEstimate,
    priority: template.defaultPriority
  }));
});

// 获取当前选中的模板
const currentTemplate = computed(() => {
  if (!selectedTemplate.value) return null;
  return templates.value.find(t => t.id === selectedTemplate.value) || null;
});

// 获取任务类型名称
const getTaskTypeName = (type: string): string => {
  switch (type) {
    case TaskType.CRAFTING:
      return '制作';
    case TaskType.GATHERING:
      return '采集';
    case TaskType.BUILDING:
      return '建造';
    case TaskType.RESEARCH:
      return '研究';
    case TaskType.MAINTENANCE:
      return '维护';
    case TaskType.TRAINING:
      return '训练';
    default:
      return '未知';
  }
};

// 任务图标
const getTaskTypeIcon = (type: string): string => {
  switch (type) {
    case TaskType.CRAFTING:
      return 'tabler--hammer';
    case TaskType.GATHERING:
      return 'tabler--pickaxe';
    case TaskType.BUILDING:
      return 'tabler--building';
    case TaskType.RESEARCH:
      return 'tabler--bulb';
    case TaskType.MAINTENANCE:
      return 'tabler--tool';
    case TaskType.TRAINING:
      return 'tabler--barbell';
    default:
      return 'tabler--question-mark';
  }
};

// 选择任务模板
const selectTemplate = (templateId: string) => {
  selectedTemplate.value = templateId;
  showTaskDetails.value = true;
};

// 创建任务
const createTask = () => {
  successMessage.value = '';
  errorMessage.value = '';
  
  if (!selectedTemplate.value) return;
  
  const customParams = {
    isRecurring: isRecurring.value,
    cycleCount: isRecurring.value ? cycleCount.value : undefined
  };
  
  const success = createTaskFromTemplateId(selectedTemplate.value, customParams);
  
  if (success) {
    const templateName = taskTemplates[selectedTemplate.value]?.name || '未知任务';
    const cycleText = isRecurring.value 
      ? (cycleCount.value > 0 ? `（循环${cycleCount.value}次）` : '（无限循环）') 
      : '';
    successMessage.value = `成功创建任务：${templateName}${cycleText}`;
    
    // 通知父组件任务已创建
    emit('taskCreated');
    
    // 关闭任务详情
    showTaskDetails.value = false;
    selectedTemplate.value = null;
    isRecurring.value = false;
    cycleCount.value = 0;
  } else {
    errorMessage.value = '创建任务失败，请重试';
  }
};

// 关闭对话框
const closeDialog = () => {
  emit('close');
};

// 返回到任务列表
const backToList = () => {
  showTaskDetails.value = false;
  selectedTemplate.value = null;
  isRecurring.value = false;
  cycleCount.value = 0;
};
</script>

<template>
  <div 
    id="task-creation-modal" 
    class="overlay modal" 
    :class="{ 'hidden': !isOpen }"
    role="dialog" 
    tabindex="-1"
    style="display: flex; opacity: 1;"
    v-if="isOpen"
  >
    <div class="modal-dialog" style="opacity: 1;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            <template v-if="!showTaskDetails">选择要创建的任务</template>
            <template v-else>任务详情设置</template>
          </h3>
          <button 
            type="button" 
            class="btn btn-text btn-circle btn-sm absolute end-3 top-3" 
            aria-label="Close"
            @click="closeDialog"
          >
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- 成功消息 -->
          <div v-if="successMessage" class="alert alert-success mb-4">
            <span class="icon-[tabler--check] size-5"></span>
            <span>{{ successMessage }}</span>
          </div>
          
          <!-- 错误消息 -->
          <div v-if="errorMessage" class="alert alert-error mb-4">
            <span class="icon-[tabler--alert-circle] size-5"></span>
            <span>{{ errorMessage }}</span>
          </div>
          
          <!-- 任务详情设置 -->
          <div v-if="showTaskDetails && currentTemplate" class="task-details-form">
            <div class="flex items-center mb-4">
              <button 
                class="btn btn-ghost btn-sm mr-2" 
                @click="backToList"
              >
                <span class="icon-[tabler--arrow-left] size-4 mr-1"></span>
                返回
              </button>
              
              <h4 class="text-lg font-semibold">
                <span :class="`icon-[${getTaskTypeIcon(currentTemplate.type)}] size-5 mr-1`"></span>
                {{ currentTemplate.name }}
              </h4>
            </div>
            
            <p class="text-sm mb-4">{{ currentTemplate.description }}</p>
            
            <div class="form-control mb-4">
              <label class="cursor-pointer label justify-start">
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm mr-2" 
                  v-model="isRecurring"
                />
                <span class="label-text">设为循环任务（同一任务可多次执行）</span>
              </label>
            </div>
            
            <div v-if="isRecurring" class="form-control mb-4 pl-8">
              <label class="label">
                <span class="label-text">循环次数（0表示无限循环）</span>
              </label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                class="input input-bordered input-sm w-32" 
                v-model="cycleCount"
              />
            </div>
            
            <!-- 预览信息 -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h5 class="card-title text-sm">任务预览</h5>
                
                <div class="divider my-1"></div>
                
                <!-- 技能和资源卡片 -->
                <div class="grid grid-cols-2 gap-2 mt-1 text-sm">
                  <!-- 所需技能 -->
                  <div v-if="currentTemplate.skills && currentTemplate.skills.length > 0">
                    <div class="font-medium">所需技能</div>
                    <div v-for="skill in currentTemplate.skills" :key="skill.skillId" class="text-xs">
                      {{ skill.skillName }}: {{ skill.requiredValue }}
                    </div>
                  </div>
                  
                  <!-- 所需资源 -->
                  <div v-if="currentTemplate.requiredItems && currentTemplate.requiredItems.length > 0">
                    <div class="font-medium">所需物品</div>
                    <div v-for="item in currentTemplate.requiredItems" :key="item.itemId" class="text-xs">
                      {{ item.itemName }}: {{ item.quantity }}个
                    </div>
                  </div>
                  
                  <!-- 产出物品 -->
                  <div v-if="currentTemplate.outputItems && currentTemplate.outputItems.length > 0">
                    <div class="font-medium">产出物品</div>
                    <div v-for="item in currentTemplate.outputItems" :key="item.itemId" class="text-xs">
                      {{ item.itemName }}: {{ item.quantity }}个
                    </div>
                  </div>
                  
                  <!-- 时间估计 -->
                  <div v-if="currentTemplate.timeEstimate">
                    <div class="font-medium">时间估计</div>
                    <div class="text-xs">
                      基础时间: {{ currentTemplate.timeEstimate.baseHours }}小时
                    </div>
                  </div>
                </div>
                
                <div class="mt-2">
                  <div class="flex items-center">
                    <div class="badge badge-sm mr-2">{{ getTaskTypeName(currentTemplate.type) }}</div>
                    <div v-if="isRecurring" class="badge badge-sm badge-accent">
                      循环{{ cycleCount > 0 ? cycleCount + '次' : '(无限)' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 任务卡片列表 -->
          <div v-if="!showTaskDetails" class="grid grid-cols-1 gap-4">
            <div 
              v-for="template in templates" 
              :key="template.id"
              class="card cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] overflow-hidden bg-base-200"
              @click="selectTemplate(template.id)"
            >
              <div class="card-body">
                <div class="flex justify-between items-center mb-1">
                  <h2 class="card-title text-base">
                    <span :class="`icon-[${getTaskTypeIcon(template.type)}] size-5 mr-1`"></span>
                    {{ template.name }}
                  </h2>
                  <span class="badge badge-sm">
                    {{ getTaskTypeName(template.type) }}
                  </span>
                </div>
                
                <p class="text-sm mb-2">{{ template.description }}</p>
                
                <div class="divider my-1"></div>
                
                <!-- 技能和资源卡片 -->
                <div class="grid grid-cols-2 gap-2 mt-1 text-sm">
                  <!-- 所需技能 -->
                  <div v-if="template.skills && template.skills.length > 0">
                    <div class="font-medium">所需技能</div>
                    <div v-for="skill in template.skills" :key="skill.skillId" class="text-xs">
                      {{ skill.skillName }}: {{ skill.requiredValue }}
                    </div>
                  </div>
                  
                  <!-- 所需资源 -->
                  <div v-if="template.requiredItems && template.requiredItems.length > 0">
                    <div class="font-medium">所需物品</div>
                    <div v-for="item in template.requiredItems" :key="item.itemId" class="text-xs">
                      {{ item.itemName }}: {{ item.quantity }}个
                    </div>
                  </div>
                  
                  <!-- 产出物品 -->
                  <div v-if="template.outputItems && template.outputItems.length > 0">
                    <div class="font-medium">产出物品</div>
                    <div v-for="item in template.outputItems" :key="item.itemId" class="text-xs">
                      {{ item.itemName }}: {{ item.quantity }}个
                    </div>
                  </div>
                  
                  <!-- 时间估计 -->
                  <div v-if="template.timeEstimate">
                    <div class="font-medium">时间估计</div>
                    <div class="text-xs">
                      基础时间: {{ template.timeEstimate.baseHours }}小时
                    </div>
                  </div>
                </div>
                
                <div class="mt-3">
                  <div class="flex flex-wrap gap-1">
                    <span class="badge badge-sm badge-outline" v-for="tag in template.tags" :key="tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button v-if="!showTaskDetails" type="button" class="btn btn-soft btn-secondary" @click="closeDialog">取消</button>
          <template v-else>
            <button type="button" class="btn btn-soft btn-secondary" @click="backToList">返回</button>
            <button type="button" class="btn btn-soft btn-primary" @click="createTask">创建任务</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
  max-width: 90%;
  width: 600px;
  max-height: 90vh;
  border-radius: 0.5rem;
  background-color: var(--b1);
}

.modal-content {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--b3);
  position: relative;
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
  max-height: 70vh;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--b3);
}

.card {
  transition: all 0.2s ease;
}
</style> 