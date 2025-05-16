<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { taskSystem } from '../core/TaskSystem';
import { gameEngine } from '../core/GameEngine';
import type { 
  Task} from '../types/Task';
import { TaskStatus } from '../types/Task';
import { 
  formatTaskDate, 
  getTaskStatusText, 
  validateRequiredItems,
  validateRoleForTask,
  calculateRoleFitScore } from '../utils/taskUtils';
import TaskCreationDialog from '../components/TaskCreationModal.vue';
import { saveGame } from '../utils/saveService';

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

// 任务创建对话框
const isTaskCreationDialogOpen = ref(false);

// 最近自动分配的任务
const recentAutoAssignments = ref<{taskName: string, roleName: string, timestamp: Date}[]>([]);

// 成功消息
const successMessage = ref('');

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

// 检查任务是否自动分配
const isAutoAssigned = (task: Task): boolean => {
  return task.history.some(h => h.type === 'auto-assigned');
};

// 获取自动分配的时间
const getAutoAssignedTime = (task: Task): Date | null => {
  const autoAssignEvent = task.history.find(h => h.type === 'auto-assigned');
  return autoAssignEvent ? autoAssignEvent.timestamp : null;
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
    saveGame();
  } else {
    errorMessage.value = '分配失败，请稍后再试';
  }
};

// 取消任务分配
const unassignTask = (taskId: string) => {
  const success = taskSystem.unassignTask(taskId, roles.value);
  if (success) {
    loadTasks();
    saveGame();
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
    saveGame();
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

// 打开任务创建对话框
const openTaskCreationDialog = () => {
  isTaskCreationDialogOpen.value = true;
};

// 关闭任务创建对话框
const closeTaskCreationDialog = () => {
  isTaskCreationDialogOpen.value = false;
};

// 任务创建成功回调
const onTaskCreated = () => {
  loadTasks();
  saveGame();
};

// 处理任务创建和完成事件
onMounted(() => {
  // 加载初始任务列表
  loadTasks();
  
  // 监听任务事件
  taskSystem.addEventListener('taskCreated', () => {
    loadTasks();
    saveGame();
  });
  
  taskSystem.addEventListener('taskAssigned', () => {
    loadTasks();
    saveGame();
  });
  
  taskSystem.addEventListener('taskCompleted', () => {
    loadTasks();
    saveGame();
  });
  
  taskSystem.addEventListener('taskUnassigned', () => {
    loadTasks();
    saveGame();
  });
  
  taskSystem.addEventListener('taskCancelled', () => {
    loadTasks();
    saveGame();
  });
  
  taskSystem.addEventListener('taskFailed', () => {
    loadTasks();
    saveGame();
  });
  
  taskSystem.addEventListener('tasksAutoAssigned', handleAutoAssignment);
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

// 处理自动分配任务
const handleAutoAssignment = (assignedCount: number) => {
  if (assignedCount > 0) {
    // 获取所有进行中的任务
    const inProgressTasks = taskSystem.getTasksByStatus(TaskStatus.IN_PROGRESS);
    
    // 过滤出自动分配的任务
    const autoAssignedTasks = inProgressTasks
      .filter(isAutoAssigned)
      .sort((a, b) => {
        const timeA = getAutoAssignedTime(a)?.getTime() || 0;
        const timeB = getAutoAssignedTime(b)?.getTime() || 0;
        return timeB - timeA; // 按自动分配时间降序排序
      });
    
    // 将自动分配的任务添加到最近自动分配的任务列表中
    recentAutoAssignments.value = autoAssignedTasks.slice(0, 5).map(task => ({
      taskName: task.name,
      roleName: getRoleName(task.assignedRoleId),
      timestamp: getAutoAssignedTime(task) || new Date()
    }));
    
    // 添加成功消息
    successMessage.value = `自动分配了 ${assignedCount} 个任务`;
    
    // 重新加载任务列表
    loadTasks();
  }
};
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 任务管理顶部导航 -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">
        <span class="icon-[tabler--list-check] size-7 mr-2"></span>
        任务管理
      </h2>
      <button 
        class="btn btn-primary btn-sm"  
        @click="openTaskCreationDialog"
      >
        <span class="icon-[tabler--plus] size-4 mr-1"></span>
        添加任务
      </button>
    </div>
    
    <!-- 错误消息 -->
    <div v-if="errorMessage" class="alert alert-error mb-4">
      <span class="icon-[tabler--alert-circle] size-5 flex-shrink-0"></span>
      <span>{{ errorMessage }}</span>
    </div>
    
    <!-- 成功消息 -->
    <div v-if="successMessage" class="alert alert-success mb-4">
      <span class="icon-[tabler--check] size-5 flex-shrink-0"></span>
      <span>{{ successMessage }}</span>
    </div>
    
    <!-- 最近自动分配的任务 -->
    <div v-if="recentAutoAssignments.length > 0" class="alert alert-info mb-4">
      <span class="icon-[tabler--robot] size-5 flex-shrink-0"></span>
      <div>
        <div class="font-semibold">最近自动分配的任务</div>
        <div class="text-xs mt-1">
          <div v-for="(item, index) in recentAutoAssignments" :key="index" class="mb-1">
            自动分配了 <span class="font-medium">{{ item.taskName }}</span> 给 <span class="font-medium">{{ item.roleName }}</span>
            <span class="text-xs opacity-75">{{ formatTaskDate(item.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 任务筛选器 -->
    <div class="tabs tabs-boxed mb-4">
      <button 
        class="tab" 
        :class="{ 'tab-active': activeFilter === 'active' }"
        @click="setFilter('active')"
      >
        进行中任务
      </button>
      <button 
        class="tab" 
        :class="{ 'tab-active': activeFilter === 'pending' }"
        @click="setFilter('pending')"
      >
        待分配任务
      </button>
      <button 
        class="tab" 
        :class="{ 'tab-active': activeFilter === 'in_progress' }"
        @click="setFilter('in_progress')"
      >
        进行中
      </button>
      <button 
        class="tab" 
        :class="{ 'tab-active': activeFilter === 'completed' }"
        @click="setFilter('completed')"
      >
        已完成
      </button>
    </div>
    
    <!-- 任务列表和详情 -->
    <div class="flex flex-grow h-0 gap-4">
      <!-- 任务列表 -->
      <div class="flex-1 overflow-auto min-w-0 h-full">
        <div class="grid grid-cols-1 gap-3">
          <div 
            v-for="task in tasks" 
            :key="task.id"
            class="card overflow-hidden bg-base-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            @click="selectTask(task)"
          >
            <div class="card-body p-4">
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-base font-semibold truncate">{{ task.name }}</h3>
                <div class="badge" :class="getStatusClass(task.status)">
                  {{ getTaskStatusText(task.status) }}
                </div>
              </div>
              
              <!-- 添加任务进度条 -->
              <div class="mb-2" v-if="task.isRecurring || task.status === 'in_progress' || (task.status === 'pending' && task.progress > 0)">
                <div class="flex justify-between text-xs mb-1">
                  <span>{{ task.progress }}%</span>
                  <span v-if="task.isRecurring && task.currentCycle">
                    {{ task.cycleCount ? `周期 ${task.currentCycle}/${task.cycleCount}` : `周期 ${task.currentCycle}` }}
                  </span>
                  <span v-else-if="task.status === 'pending' && task.progress > 0" class="text-warning">
                    已暂停
                  </span>
                </div>
                <progress 
                  class="progress w-full h-1" 
                  :class="{
                    'progress-primary': task.status === 'in_progress', 
                    'progress-warning': task.status === 'pending' && task.progress > 0
                  }"
                  :value="task.progress" 
                  max="100"
                ></progress>
              </div>
              
              <p class="text-sm opacity-80 line-clamp-2 mb-2">{{ task.description }}</p>
              
              <div class="flex items-center justify-between text-xs opacity-70">
                <div>
                  <span class="inline-block mr-1">{{ formatTaskDate(task.creationTime) }}</span>
                  {{ task.deadline ? '截止: ' + formatTaskDate(task.deadline) : '' }}
                </div>
                
                <div class="flex items-center gap-1">
                  <!-- 显示循环信息 -->
                  <span v-if="task.isRecurring" class="badge badge-accent badge-sm text-xs">
                    {{ task.currentCycle && task.cycleCount 
                        ? `循环 ${task.currentCycle}/${task.cycleCount}` 
                        : (task.currentCycle 
                            ? `循环 ${task.currentCycle}` 
                            : '循环') }}
                  </span>
                  
                  <span 
                    v-if="task.assignedRoleId" 
                    class="badge badge-outline badge-sm text-xs"
                  >
                    {{ getRoleName(task.assignedRoleId) }}
                  </span>
                  
                  <span 
                    v-if="isAutoAssigned(task)" 
                    class="tooltip tooltip-left" 
                    data-tip="由系统自动分配"
                  >
                    <span class="icon-[tabler--robot] size-4 mr-1"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 任务详情 -->
      <div class="w-1/2 overflow-auto h-full">
        <div class="card bg-base-200 h-full" v-if="selectedTask">
          <div class="card-body p-4 overflow-auto">
            <div class="flex justify-between items-start mb-3">
              <h3 class="card-title">{{ selectedTask.name }}</h3>
              <span 
                class="badge" 
                :class="getStatusClass(selectedTask.status)"
              >
                {{ getTaskStatusText(selectedTask.status) }}
              </span>
            </div>
            
            <p class="mb-3">{{ selectedTask.description }}</p>
            
            <div class="stats shadow mb-4">
              <div class="stat">
                <div class="stat-title">优先级</div>
                <div class="stat-value text-base">
                  {{ selectedTask.priority }}/10
                </div>
              </div>
              
              <div class="stat">
                <div class="stat-title">开始时间</div>
                <div class="stat-value text-sm">
                  {{ formatTaskDate(selectedTask.startTime) }}
                </div>
              </div>
              
              <div class="stat">
                <div class="stat-title">进度</div>
                <div class="stat-value text-base flex items-center">
                  {{ selectedTask.progress }}%
                  <span v-if="selectedTask.status === 'pending' && selectedTask.progress > 0" 
                    class="badge badge-warning badge-sm ml-2 text-xs">已暂停</span>
                </div>
                <div class="stat-desc">
                  <div class="flex justify-between text-xs mb-1" v-if="selectedTask.isRecurring && selectedTask.currentCycle">
                    <span>当前周期</span>
                    <span>{{ selectedTask.cycleCount ? `${selectedTask.currentCycle}/${selectedTask.cycleCount}` : selectedTask.currentCycle }}</span>
                  </div>
                  <progress 
                    class="progress w-full" 
                    :class="{
                      'progress-primary': selectedTask.status === 'in_progress', 
                      'progress-warning': selectedTask.status === 'pending' && selectedTask.progress > 0
                    }"
                    :value="selectedTask.progress" 
                    max="100"
                  ></progress>
                </div>
              </div>
            </div>
            
            <!-- 所需技能 -->
            <div class="mb-4" v-if="selectedTask.requiredSkills.length > 0">
              <h4 class="font-semibold mb-2">所需技能</h4>
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="skill in selectedTask.requiredSkills" 
                  :key="skill.skillId"
                  class="badge badge-outline"
                >
                  {{ skill.skillName }}: {{ skill.requiredValue }}
                </div>
              </div>
            </div>
            
            <!-- 所需物品 -->
            <div class="mb-4" v-if="selectedTask.requiredItems.length > 0">
              <h4 class="font-semibold mb-2">所需物品</h4>
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="item in selectedTask.requiredItems" 
                  :key="item.itemId"
                  class="badge badge-outline"
                >
                  {{ item.itemName }}: {{ item.quantity }}个
                </div>
              </div>
            </div>
            
            <!-- 产出物品 -->
            <div class="mb-4" v-if="selectedTask.outputItems.length > 0">
              <h4 class="font-semibold mb-2">产出物品</h4>
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="item in selectedTask.outputItems" 
                  :key="item.itemId"
                  class="badge badge-outline"
                >
                  {{ item.itemName }}: {{ item.quantity }}个
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex flex-wrap gap-2 mt-4">
              <!-- 待分配任务的按钮 -->
              <div v-if="selectedTask.status === 'pending'" class="w-full">
                <h4 class="font-semibold mb-2">分配给角色:</h4>
                <div class="grid grid-cols-1 gap-2 mb-4">
                  <button 
                    v-for="role in availableRoles" 
                    :key="role.id"
                    class="btn btn-outline btn-sm justify-between"
                    @click="assignTaskToRole(selectedTask.id, role.id)"
                  >
                    {{ role.name }}
                    <span 
                      class="badge ml-2" 
                      :class="getRoleScoreClass(getRoleFitScores[role.id] || 0)"
                    >
                      {{ getRoleFitScores[role.id] || 0 }}
                    </span>
                  </button>
                </div>
                <button 
                  class="btn btn-error btn-sm w-full"
                  @click="cancelTask(selectedTask.id)"
                >
                  <span class="icon-[tabler--trash] size-4 mr-1"></span>
                  取消任务
                </button>
              </div>
              
              <!-- 进行中任务的按钮 -->
              <div v-if="selectedTask.status === 'in_progress'" class="w-full">
                <button 
                  class="btn btn-warning btn-sm w-full mb-2"
                  @click="unassignTask(selectedTask.id)"
                >
                  <span class="icon-[tabler--user-x] size-4 mr-1"></span>
                  取消分配
                </button>
                <button 
                  class="btn btn-error btn-sm w-full"
                  @click="cancelTask(selectedTask.id)"
                >
                  <span class="icon-[tabler--trash] size-4 mr-1"></span>
                  取消任务
                </button>
              </div>
            </div>
            
            <!-- 任务历史 -->
            <div class="divider"></div>
            <h4 class="font-semibold mb-2">任务历史</h4>
            <div class="text-sm">
              <div 
                v-for="(history, index) in selectedTask.history" 
                :key="index"
                class="mb-2"
              >
                <div class="flex justify-between items-center">
                  <span class="font-medium">
                    <template v-if="history.type === 'auto-assigned'">自动分配</template>
                    <template v-else-if="history.type === 'cycle_completed'">
                      <span class="text-info">完成周期 {{ history.data?.cycle }}</span>
                    </template>
                    <template v-else-if="history.type === 'all_cycles_completed'">
                      <span class="text-success">完成所有周期</span>
                    </template>
                    <template v-else>{{ history.description }}</template>
                  </span>
                  <span class="text-xs opacity-75">{{ formatTaskDate(history.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card bg-base-200 h-full flex items-center justify-center" v-else>
          <div class="text-center p-4">
            <span class="icon-[tabler--list-details] size-20 opacity-20 mb-2"></span>
            <p class="text-base-content opacity-50">选择一个任务查看详情</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 任务创建对话框 -->
    <TaskCreationDialog 
      :is-open="isTaskCreationDialogOpen"
      @close="closeTaskCreationDialog"
      @task-created="onTaskCreated"
    />
  </div>
</template> 