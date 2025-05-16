<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { taskSystem } from '../core/TaskSystem';
import { gameEngine } from '../core/GameEngine';
import type { 
  Task, 
  CreateTaskParams} from '../types/Task';
import { TaskStatus, TaskType } from '../types/Task';
import { 
  formatTaskDate, 
  getTaskStatusText, 
  getTaskColor,
  validateRequiredItems,
  validateRoleForTask,
  calculateRoleFitScore } from '../utils/taskUtils';

// 所有角色
const roles = computed(() => gameEngine.getRoles());

// 当前任务列表
const tasks = ref<Task[]>([]);

// 当前选中的任务
const selectedTask = ref<Task | null>(null);

// 任务筛选器
const activeFilter = ref('active'); // 'all', 'active', 'pending', 'completed'

// 错误消息
const errorMessage = ref('');

// 加载任务列表
const loadTasks = () => {
  switch (activeFilter.value) {
    case 'active':
      tasks.value = taskSystem.getActiveTasks();
      break;
    case 'pending':
      tasks.value = taskSystem.getTasksByStatus(TaskStatus.PENDING);
      break;
    case 'in_progress':
      tasks.value = taskSystem.getTasksByStatus(TaskStatus.IN_PROGRESS);
      break;
    case 'completed':
      tasks.value = taskSystem.getTasksByStatus(TaskStatus.COMPLETED);
      break;
    default:
      tasks.value = taskSystem.getAllTasks();
  }
};

// 设置任务筛选器
const setFilter = (filter: string) => {
  activeFilter.value = filter;
  loadTasks();
};

// 获取角色名称
const getRoleName = (roleId: string | null): string => {
  if (!roleId) return '未分配';
  const role = roles.value.find(r => r.id === roleId);
  return role ? role.name : '未知角色';
};

// 选择任务
const selectTask = (task: Task) => {
  selectedTask.value = task;
};

// 分配任务给角色
const assignTaskToRole = (taskId: string, roleId: string) => {
  // 先清除之前的错误
  errorMessage.value = '';
  
  const task = taskSystem.getTaskById(taskId);
  const role = roles.value.find(r => r.id === roleId);
  
  if (!task || !role) {
    errorMessage.value = '任务或角色不存在';
    return;
  }
  
  // 验证角色是否符合任务要求
  const { isValid, reason } = validateRoleForTask(task, role);
  if (!isValid) {
    errorMessage.value = reason || '角色不符合任务要求';
    return;
  }
  
  // 验证物品是否足够
  const { hasAllItems, missingItems } = validateRequiredItems(task.requiredItems);
  if (!hasAllItems) {
    errorMessage.value = `物品不足: ${missingItems.map(item => 
      `${item.itemName}(需要${item.required}个，当前${item.available}个)`
    ).join(', ')}`;
    return;
  }
  
  // 尝试分配任务
  const success = taskSystem.assignTaskToRole(taskId, roleId, roles.value);
  if (success) {
    loadTasks();
  } else {
    errorMessage.value = '分配失败，请稍后再试';
  }
};

// 取消任务分配
const unassignTask = (taskId: string) => {
  const success = taskSystem.unassignTask(taskId, roles.value);
  if (success) {
    loadTasks();
  }
};

// 取消任务
const cancelTask = (taskId: string) => {
  const success = taskSystem.cancelTask(taskId, roles.value);
  if (success) {
    if (selectedTask.value?.id === taskId) {
      selectedTask.value = null;
    }
    loadTasks();
  }
};

// 可用于任务的角色
const availableRoles = computed(() => {
  return roles.value.filter(role => role.isAvailable);
});

// 任务状态颜色
const getStatusClass = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.PENDING:
      return 'badge-warning';
    case TaskStatus.IN_PROGRESS:
      return 'badge-info';
    case TaskStatus.COMPLETED:
      return 'badge-success';
    case TaskStatus.FAILED:
      return 'badge-error';
    case TaskStatus.CANCELLED:
      return 'badge-ghost';
    default:
      return 'badge-secondary';
  }
};

// 创建示例任务
const createSampleTask = () => {
  const taskParams: CreateTaskParams = {
    name: '制作木材',
    type: TaskType.CRAFTING,
    description: '将原木加工成木材',
    requiredSkills: [
      {
        skillId: '3', // 假设ID为3是工艺技能
        skillName: '工艺',
        requiredValue: 20
      }
    ],
    priority: 5,
    requiredItems: [
      {
        itemId: '7', // ID为7是木材 (Wood)
        itemName: '木材',
        quantity: 2
      }
    ],
    outputItems: [
      {
        itemId: '8', // ID为8是石材 (Stone)
        itemName: '石材',
        quantity: 4
      }
    ],
    timeEstimate: {
      baseHours: 4,
      skillFactor: 0.5,
      minHours: 1
    }
  };
  
  taskSystem.createTask(taskParams);
  loadTasks();
};

// 处理任务创建和完成事件
onMounted(() => {
  // 加载初始任务列表
  loadTasks();
  
  // 监听任务事件
  taskSystem.addEventListener('taskCreated', () => loadTasks());
  taskSystem.addEventListener('taskCompleted', () => loadTasks());
  taskSystem.addEventListener('taskProgressUpdated', () => loadTasks());
});

// 监听筛选器变化
watch(activeFilter, loadTasks);

// 计算角色对当前选择任务的适合度评分
const getRoleFitScores = computed(() => {
  if (!selectedTask.value) return {};
  
  const scores: {[roleId: string]: number} = {};
  
  for (const role of availableRoles.value) {
    const fitScore = calculateRoleFitScore(selectedTask.value, role);
    scores[role.id] = Math.round(fitScore.overallScore);
  }
  
  return scores;
});

// 获取角色评分CSS类
const getRoleScoreClass = (score: number): string => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  if (score >= 40) return 'text-info';
  return 'text-error';
};
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 任务管理顶部导航 -->
    <div class="flex justify-between items-center mb-4">
      <div class="tabs tabs-boxed">
        <button 
          class="tab" 
          :class="{ 'tab-active': activeFilter === 'active' }"
          @click="setFilter('active')"
        >活动任务</button>
        <button 
          class="tab" 
          :class="{ 'tab-active': activeFilter === 'pending' }"
          @click="setFilter('pending')"
        >待分配</button>
        <button 
          class="tab" 
          :class="{ 'tab-active': activeFilter === 'in_progress' }"
          @click="setFilter('in_progress')"
        >进行中</button>
        <button 
          class="tab" 
          :class="{ 'tab-active': activeFilter === 'completed' }"
          @click="setFilter('completed')"
        >已完成</button>
      </div>
      
      <div>
        <!-- 临时：仅用于测试 -->
        <button 
          class="btn btn-primary btn-sm"
          @click="createSampleTask"
        >
          <span class="icon-[tabler--plus] size-4 me-1"></span>
          测试任务
        </button>
      </div>
    </div>
    
    <!-- 任务列表和详情 -->
    <div class="flex gap-4 h-full">
      <!-- 任务列表 -->
      <div class="w-1/2 overflow-auto rounded-lg border">
        <div class="divide-y">
          <div 
            v-for="task in tasks" 
            :key="task.id"
            class="p-3 cursor-pointer hover:bg-base-200 transition-colors"
            :class="[selectedTask?.id === task.id ? 'bg-base-200' : '', getTaskColor(task)]"
            @click="selectTask(task)"
          >
            <div class="flex justify-between items-center">
              <h3 class="font-medium">{{ task.name }}</h3>
              <span class="badge" :class="getStatusClass(task.status)">
                {{ getTaskStatusText(task.status) }}
              </span>
            </div>
            
            <div class="text-sm text-base-content text-opacity-70">
              {{ task.description }}
            </div>
            
            <div class="mt-2 flex justify-between text-xs">
              <span>
                分配给: {{ getRoleName(task.assignedRoleId) }}
              </span>
              <span>
                优先级: {{ task.priority }}
              </span>
            </div>
            
            <!-- 进度条 -->
            <div v-if="task.status === 'in_progress'" class="mt-2 w-full bg-base-300 rounded-full h-1.5">
              <div 
                class="bg-primary h-1.5 rounded-full" 
                :style="{ width: `${task.progress}%` }"
              ></div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="tasks.length === 0" class="p-10 text-center text-base-content text-opacity-50">
            <span class="icon-[tabler--list-check] size-10 mx-auto block mb-2"></span>
            <p>没有{{ activeFilter === 'all' ? '' : '符合条件的' }}工作</p>
          </div>
        </div>
      </div>
      
      <!-- 任务详情 -->
      <div class="w-1/2 overflow-auto rounded-lg border p-4">
        <div v-if="selectedTask" class="h-full">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">{{ selectedTask.name }}</h2>
            <span class="badge" :class="getStatusClass(selectedTask.status)">
              {{ getTaskStatusText(selectedTask.status) }}
            </span>
          </div>
          
          <p class="mb-4">{{ selectedTask.description }}</p>
          
          <!-- 任务信息 -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 class="font-medium mb-1">创建时间</h4>
              <p class="text-sm">{{ formatTaskDate(selectedTask.creationTime) }}</p>
            </div>
            
            <div>
              <h4 class="font-medium mb-1">截止时间</h4>
              <p class="text-sm">{{ formatTaskDate(selectedTask.deadline) }}</p>
            </div>
            
            <div>
              <h4 class="font-medium mb-1">开始时间</h4>
              <p class="text-sm">{{ formatTaskDate(selectedTask.startTime) }}</p>
            </div>
            
            <div>
              <h4 class="font-medium mb-1">完成时间</h4>
              <p class="text-sm">{{ formatTaskDate(selectedTask.completionTime) }}</p>
            </div>
          </div>
          
          <!-- 所需技能 -->
          <div class="mb-4" v-if="selectedTask.requiredSkills.length > 0">
            <h4 class="font-medium mb-1">所需技能</h4>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="skill in selectedTask.requiredSkills" 
                :key="skill.skillId"
                class="badge badge-outline"
              >
                {{ skill.skillName }} {{ skill.requiredValue }}
              </span>
            </div>
          </div>
          
          <!-- 所需物品 -->
          <div class="mb-4" v-if="selectedTask.requiredItems.length > 0">
            <h4 class="font-medium mb-1">所需物品</h4>
            <div class="space-y-1">
              <div 
                v-for="item in selectedTask.requiredItems" 
                :key="item.itemId"
                class="text-sm flex justify-between"
              >
                <span>{{ item.itemName }}</span>
                <span>{{ item.quantity }}个</span>
              </div>
            </div>
          </div>
          
          <!-- 产出物品 -->
          <div class="mb-4" v-if="selectedTask.outputItems.length > 0">
            <h4 class="font-medium mb-1">产出物品</h4>
            <div class="space-y-1">
              <div 
                v-for="item in selectedTask.outputItems" 
                :key="item.itemId"
                class="text-sm flex justify-between"
              >
                <span>{{ item.itemName }}</span>
                <span>{{ item.quantity }}个</span>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="mt-6">
            <!-- 待分配任务的按钮 -->
            <div v-if="selectedTask.status === 'pending'">
              <h4 class="font-medium mb-2">分配给角色:</h4>
              <!-- 错误消息 -->
              <div v-if="errorMessage" class="alert alert-error mb-2 py-2 text-sm">
                {{ errorMessage }}
              </div>
              
              <!-- 评分说明 -->
              <div class="mb-2 text-sm text-base-content/70">
                角色适合度评分: 
                <span class="text-success">高(80-100)</span> | 
                <span class="text-warning">中(60-79)</span> | 
                <span class="text-info">低(40-59)</span> | 
                <span class="text-error">很低(0-39)</span>
              </div>
              
              <div class="flex flex-wrap gap-2 mb-4">
                <button 
                  v-for="role in availableRoles" 
                  :key="role.id"
                  class="btn btn-sm"
                  @click="assignTaskToRole(selectedTask.id, role.id)"
                >
                  {{ role.name }}
                  <span 
                    class="ms-1 font-bold" 
                    :class="getRoleScoreClass(getRoleFitScores[role.id] || 0)"
                  >
                    ({{ getRoleFitScores[role.id] || 0 }})
                  </span>
                </button>
                <div v-if="availableRoles.length === 0" class="text-sm text-base-content text-opacity-50">
                  没有可用角色
                </div>
              </div>
              
              <button 
                class="btn btn-error btn-sm mt-2"
                @click="cancelTask(selectedTask.id)"
              >
                取消任务
              </button>
            </div>
            
            <!-- 进行中任务的按钮 -->
            <div v-else-if="selectedTask.status === 'in_progress'">
              <div class="flex justify-between items-center mb-2">
                <h4 class="font-medium">进度: {{ Math.round(selectedTask.progress) }}%</h4>
                <p class="text-sm">
                  分配给: <span class="font-medium">{{ getRoleName(selectedTask.assignedRoleId) }}</span>
                </p>
              </div>
              
              <div class="w-full bg-base-300 rounded-full h-2 mb-4">
                <div 
                  class="bg-primary h-2 rounded-full" 
                  :style="{ width: `${selectedTask.progress}%` }"
                ></div>
              </div>
              
              <div class="flex gap-2">
                <button 
                  class="btn btn-warning btn-sm"
                  @click="unassignTask(selectedTask.id)"
                >
                  取消分配
                </button>
                
                <button 
                  class="btn btn-error btn-sm"
                  @click="cancelTask(selectedTask.id)"
                >
                  取消任务
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 未选择任务的状态 -->
        <div v-else class="h-full flex flex-col items-center justify-center text-base-content text-opacity-50">
          <span class="icon-[tabler--clipboard] size-12 mb-2"></span>
          <p>选择一个任务查看详情</p>
        </div>
      </div>
    </div>
  </div>
</template> 