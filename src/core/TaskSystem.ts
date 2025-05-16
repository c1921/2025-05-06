import { ref } from 'vue';
import type { Task, CreateTaskParams, TaskRoleFitScore } from '../types/Task';
import { TaskStatus, TaskType } from '../types/Task';
import type { Role } from '../types/Role';
import { 
  createTaskFromParams, 
  calculateHourlyProgress, 
  validateRequiredItems,
  validateRoleForTask,
  calculateRoleFitScore
} from '../utils/taskUtils';
import { removeItemQuantity, addItemQuantity } from '../utils/inventoryService';
import { getEffectiveLevel } from '../types/Skill';
import { getSettings } from '../utils/settingsService';

/**
 * 工作系统
 * 负责工作的创建、分配、进度跟踪和完成处理
 */
class TaskSystem {
  // 所有工作列表
  private tasks = ref<Task[]>([]);
  
  // 事件处理器
  private eventHandlers = new Map<string, Function[]>();
  
  // 最后的时间更新检查点
  private lastTimeUpdateHour = 0;
  private lastTimeUpdateDay = 0;
  
  /**
   * 获取所有工作
   */
  public getAllTasks(): Task[] {
    return [...this.tasks.value];
  }
  
  /**
   * 获取特定状态的工作
   * @param status 工作状态
   */
  public getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.value.filter(task => task.status === status);
  }
  
  /**
   * 获取特定类型的工作
   * @param type 工作类型
   */
  public getTasksByType(type: TaskType): Task[] {
    return this.tasks.value.filter(task => task.type === type);
  }
  
  /**
   * 获取分配给特定角色的工作
   * @param roleId 角色ID
   */
  public getTasksByRole(roleId: string): Task[] {
    return this.tasks.value.filter(task => task.assignedRoleId === roleId);
  }
  
  /**
   * 获取当前活跃的工作（待分配或进行中）
   */
  public getActiveTasks(): Task[] {
    return this.tasks.value.filter(
      task => task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS
    );
  }
  
  /**
   * 根据ID获取工作
   * @param taskId 工作ID
   */
  public getTaskById(taskId: string): Task | undefined {
    return this.tasks.value.find(task => task.id === taskId);
  }
  
  /**
   * 创建新工作
   * @param params 创建参数
   * @returns 新创建的工作
   */
  public createTask(params: CreateTaskParams): Task {
    const task = createTaskFromParams(params);
    this.tasks.value.push(task);
    
    // 触发工作创建事件
    this.triggerEvent('taskCreated', task);
    
    return task;
  }
  
  /**
   * 分配工作给角色
   * @param taskId 工作ID
   * @param roleId 角色ID
   * @param roles 所有角色数据（用于更新角色状态）
   * @returns 是否成功分配
   */
  public assignTaskToRole(taskId: string, roleId: string, roles: Role[]): boolean {
    const task = this.getTaskById(taskId);
    const role = roles.find(r => r.id === roleId);
    
    // 检查工作和角色是否存在
    if (!task || !role) {
      return false;
    }
    
    // 检查工作是否已经被分配
    if (task.status !== TaskStatus.PENDING) {
      return false;
    }
    
    // 检查角色是否已有其他工作
    if (role.currentTaskId) {
      return false;
    }
    
    // 检查物品需求
    const { hasAllItems } = validateRequiredItems(task.requiredItems);
    if (!hasAllItems) {
      return false;
    }
    
    // 更新任务状态
    task.assignedRoleId = roleId;
    task.status = TaskStatus.IN_PROGRESS;
    task.startTime = new Date();
    task.history.push({
      timestamp: new Date(),
      type: 'assigned',
      description: `分配给 ${role.name}`,
      data: { roleId }
    });
    
    // 更新角色状态
    role.currentTaskId = taskId;
    role.isAvailable = false;
    
    // 消耗所需物品
    this.consumeRequiredItems(task);
    
    // 触发工作分配事件
    this.triggerEvent('taskAssigned', task, role);
    
    return true;
  }
  
  /**
   * 取消工作分配
   * @param taskId 工作ID
   * @param roles 所有角色数据（用于更新角色状态）
   * @returns 是否成功取消
   */
  public unassignTask(taskId: string, roles: Role[]): boolean {
    const task = this.getTaskById(taskId);
    
    if (!task || task.status !== TaskStatus.IN_PROGRESS) {
      return false;
    }
    
    const roleId = task.assignedRoleId;
    if (!roleId) {
      return false;
    }
    
    const role = roles.find(r => r.id === roleId);
    if (!role) {
      return false;
    }
    
    // 更新任务状态
    task.assignedRoleId = null;
    task.status = TaskStatus.PENDING;
    task.progress = 0;
    task.startTime = null;
    task.history.push({
      timestamp: new Date(),
      type: 'unassigned',
      description: `从 ${role.name} 取消分配`,
      data: { roleId }
    });
    
    // 更新角色状态
    role.currentTaskId = null;
    role.isAvailable = true;
    
    // 返还所需物品
    this.returnRequiredItems(task);
    
    // 触发工作取消分配事件
    this.triggerEvent('taskUnassigned', task, role);
    
    return true;
  }
  
  /**
   * 取消工作
   * @param taskId 工作ID
   * @param roles 所有角色数据（用于更新角色状态）
   * @returns 是否成功取消
   */
  public cancelTask(taskId: string, roles: Role[]): boolean {
    const task = this.getTaskById(taskId);
    
    if (!task) {
      return false;
    }
    
    // 如果任务已分配，需要先取消分配
    if (task.status === TaskStatus.IN_PROGRESS && task.assignedRoleId) {
      this.unassignTask(taskId, roles);
    }
    
    // 更新任务状态
    task.status = TaskStatus.CANCELLED;
    task.history.push({
      timestamp: new Date(),
      type: 'cancelled',
      description: '工作已取消'
    });
    
    // 触发工作取消事件
    this.triggerEvent('taskCancelled', task);
    
    return true;
  }
  
  /**
   * 更新工作进度
   * @param taskId 工作ID
   * @param roles 所有角色数据
   * @param hoursElapsed 经过的小时数
   */
  public updateTaskProgress(taskId: string, roles: Role[], hoursElapsed: number): void {
    const task = this.getTaskById(taskId);
    
    if (!task || task.status !== TaskStatus.IN_PROGRESS || !task.assignedRoleId) {
      return;
    }
    
    const role = roles.find(r => r.id === task.assignedRoleId);
    if (!role) {
      return;
    }
    
    // 计算每小时进度
    const hourlyProgress = calculateHourlyProgress(task, role);
    
    // 应用角色工作效率修正
    const efficiencyModifier = role.workState.efficiency / 100;
    
    // 计算本次进度增加量
    const progressIncrease = hourlyProgress * hoursElapsed * efficiencyModifier;
    
    // 更新进度
    task.progress = Math.min(100, task.progress + progressIncrease);
    
    // 减少角色体力
    role.workState.stamina = Math.max(0, role.workState.stamina - (hoursElapsed * 2));
    
    // 如果体力太低，工作效率会下降
    if (role.workState.stamina < 30) {
      role.workState.efficiency = Math.max(50, role.workState.efficiency - 10);
    }
    
    // 检查是否完成
    if (task.progress >= 100) {
      this.completeTask(taskId, roles);
    } else {
      // 触发进度更新事件
      this.triggerEvent('taskProgressUpdated', task, progressIncrease);
    }
  }
  
  /**
   * 完成工作
   * @param taskId 工作ID
   * @param roles 所有角色数据
   * @returns 是否成功完成
   */
  public completeTask(taskId: string, roles: Role[]): boolean {
    const task = this.getTaskById(taskId);
    
    if (!task || task.status !== TaskStatus.IN_PROGRESS || !task.assignedRoleId) {
      return false;
    }
    
    const role = roles.find(r => r.id === task.assignedRoleId);
    if (!role) {
      return false;
    }
    
    // 生成产出物品
    this.generateOutputItems(task, role);
    
    // 更新任务状态
    task.status = TaskStatus.COMPLETED;
    task.progress = 100;
    task.completionTime = new Date();
    task.history.push({
      timestamp: new Date(),
      type: 'completed',
      description: `由 ${role.name} 完成`,
      data: { roleId: role.id }
    });
    
    // 更新角色状态
    role.currentTaskId = null;
    role.isAvailable = true;
    role.workState.taskHistory.unshift(taskId);
    
    // 限制历史记录长度
    if (role.workState.taskHistory.length > 10) {
      role.workState.taskHistory.pop();
    }
    
    // 触发工作完成事件
    this.triggerEvent('taskCompleted', task, role);
    
    // 处理循环任务 - 如果任务标记为循环，则创建一个新的相同任务
    if (task.isRecurring) {
      // 创建新任务参数
      const newTaskParams: CreateTaskParams = {
        name: task.name,
        type: task.type,
        description: task.description,
        requiredSkills: task.requiredSkills,
        priority: task.priority,
        requiredItems: task.requiredItems,
        outputItems: task.outputItems.map(item => ({
          ...item,
          qualityModifier: undefined // 重置质量修饰符
        })),
        timeEstimate: task.timeEstimate,
        tags: task.tags,
        isRecurring: true, // 保持循环属性
        isUserCreated: task.isUserCreated
      };
      
      // 创建新任务
      const newTask = this.createTask(newTaskParams);
      
      // 记录任务循环创建
      newTask.history.push({
        timestamp: new Date(),
        type: 'recurring_creation',
        description: '由循环任务自动创建',
        data: { sourceTaskId: task.id }
      });
      
      // 触发循环任务创建事件
      this.triggerEvent('recurringTaskCreated', newTask, task);
    }
    
    return true;
  }
  
  /**
   * 设置工作失败
   * @param taskId 工作ID
   * @param reason 失败原因
   * @param roles 所有角色数据
   * @returns 是否设置成功
   */
  public failTask(taskId: string, reason: string, roles: Role[]): boolean {
    const task = this.getTaskById(taskId);
    
    if (!task) {
      return false;
    }
    
    let roleToUpdate: Role | undefined;
    
    // 如果任务已分配，需要更新角色状态
    if (task.status === TaskStatus.IN_PROGRESS && task.assignedRoleId) {
      roleToUpdate = roles.find(r => r.id === task.assignedRoleId);
      
      if (roleToUpdate) {
        roleToUpdate.currentTaskId = null;
        roleToUpdate.isAvailable = true;
      }
    }
    
    // 更新任务状态
    task.status = TaskStatus.FAILED;
    task.history.push({
      timestamp: new Date(),
      type: 'failed',
      description: `工作失败: ${reason}`
    });
    
    // 触发工作失败事件
    this.triggerEvent('taskFailed', task, roleToUpdate, reason);
    
    return true;
  }
  
  /**
   * 消耗工作所需物品
   * @param task 工作
   */
  private consumeRequiredItems(task: Task): void {
    for (const item of task.requiredItems) {
      removeItemQuantity(item.itemId, item.quantity);
    }
  }
  
  /**
   * 返还工作所需物品（取消分配时）
   * @param task 工作
   */
  private returnRequiredItems(task: Task): void {
    for (const item of task.requiredItems) {
      addItemQuantity(item.itemId, item.quantity);
    }
  }
  
  /**
   * 生成工作产出物品
   * @param task 工作
   * @param role 完成工作的角色
   */
  private generateOutputItems(task: Task, role: Role): void {
    // 基于角色技能计算品质修正
    const calculateQualityModifier = (): number => {
      if (!task.requiredSkills || task.requiredSkills.length === 0) {
        return 1.0; // 默认正常品质
      }
      
      let totalSkillAdvantage = 0;
      
      for (const requiredSkill of task.requiredSkills) {
        const roleSkill = role.skills.find(s => s.id === requiredSkill.skillId);
        
        if (roleSkill) {
          // 计算技能优势
          const skillValue = getEffectiveLevel(roleSkill);
          const advantage = (skillValue - requiredSkill.requiredValue) / 50;
          totalSkillAdvantage += Math.max(-0.5, Math.min(1.0, advantage));
        }
      }
      
      // 平均技能优势
      const avgAdvantage = task.requiredSkills.length > 0 
        ? totalSkillAdvantage / task.requiredSkills.length 
        : 0;
      
      // 将平均优势转换为品质修正(0.5到1.5)
      return Math.max(0.5, Math.min(1.5, 1.0 + avgAdvantage));
    };
    
    // 应用品质修正
    const qualityMod = calculateQualityModifier();
    
    // 添加产出物品到库存
    for (const output of task.outputItems) {
      const qualityAdjustedQuantity = Math.floor(output.quantity * qualityMod);
      addItemQuantity(output.itemId, qualityAdjustedQuantity);
      
      // 更新输出信息中的实际产出数量和品质
      output.quantity = qualityAdjustedQuantity;
      output.qualityModifier = qualityMod;
    }
  }
  
  /**
   * 处理游戏时间更新
   * @param hour 当前小时
   * @param day 当前日
   * @param roles 所有角色数据
   */
  public onTimeUpdate(hour: number, day: number, roles: Role[]): void {
    // 检查是否过了一个小时
    if (hour !== this.lastTimeUpdateHour || day !== this.lastTimeUpdateDay) {
      const hoursElapsed = 1; // 简化处理，每次调用视为过了一小时
      
      // 更新所有进行中的任务
      const inProgressTasks = this.getTasksByStatus(TaskStatus.IN_PROGRESS);
      for (const task of inProgressTasks) {
        this.updateTaskProgress(task.id, roles, hoursElapsed);
      }
      
      // 检查过期任务
      this.checkTaskDeadlines(roles);
      
      // 获取用户设置
      const settings = getSettings();
      
      // 根据用户设置决定是否自动分配任务
      if (settings.autoAssignTasks) {
        // 自动分配待分配任务给合适的角色
        this.autoAssignRolesToTasks(roles);
      }
      
      // 更新时间检查点
      this.lastTimeUpdateHour = hour;
      this.lastTimeUpdateDay = day;
    }
  }
  
  /**
   * 检查任务截止日期
   * @param roles 所有角色数据
   */
  private checkTaskDeadlines(roles: Role[]): void {
    const now = new Date();
    
    for (const task of this.tasks.value) {
      // 只检查未完成且有截止日期的任务
      if (
        (task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS) &&
        task.deadline && now > task.deadline
      ) {
        this.failTask(task.id, '任务过期', roles);
      }
    }
  }
  
  /**
   * 自动分配角色到待分配任务
   * 根据角色与任务的匹配评分，将可用角色分配给最合适的任务
   * @param roles 所有角色数据
   * @returns 成功分配的任务数量
   */
  public autoAssignRolesToTasks(roles: Role[]): number {
    // 获取所有待分配任务
    const pendingTasks = this.getTasksByStatus(TaskStatus.PENDING);
    
    // 如果没有待分配任务，直接返回
    if (pendingTasks.length === 0) {
      return 0;
    }
    
    // 按优先级降序排序任务（优先处理高优先级任务）
    const sortedTasks = [...pendingTasks].sort((a, b) => b.priority - a.priority);
    
    // 筛选出可用角色（没有当前任务的角色）
    const availableRoles = roles.filter(role => role.isAvailable && !role.currentTaskId);
    
    // 如果没有可用角色，直接返回
    if (availableRoles.length === 0) {
      return 0;
    }
    
    // 记录成功分配的任务数量
    let assignedCount = 0;
    
    // 为每个任务找到最合适的角色
    for (const task of sortedTasks) {
      // 记录每个角色的匹配评分
      const roleFitScores: TaskRoleFitScore[] = [];
      
      // 计算每个可用角色与当前任务的匹配度
      for (const role of availableRoles) {
        // 首先验证角色是否满足任务的基本要求
        const { isValid } = validateRoleForTask(task, role);
        
        // 如果角色不满足基本要求，跳过
        if (!isValid) continue;
        
        // 计算角色与任务的匹配评分
        const fitScore = calculateRoleFitScore(task, role);
        roleFitScores.push(fitScore);
      }
      
      // 如果没有合适的角色，继续下一个任务
      if (roleFitScores.length === 0) continue;
      
      // 按总体评分降序排序，找出最合适的角色
      roleFitScores.sort((a, b) => b.overallScore - a.overallScore);
      
      // 获取评分最高的角色
      const bestFitRole = roles.find(role => role.id === roleFitScores[0].roleId);
      
      // 验证物品需求
      const { hasAllItems } = validateRequiredItems(task.requiredItems);
      
      // 如果找到合适的角色且有足够的物品，分配任务
      if (bestFitRole && hasAllItems) {
        const success = this.assignTaskToRole(task.id, bestFitRole.id, roles);
        
        if (success) {
          assignedCount++;
          
          // 记录自动分配信息
          task.history.push({
            timestamp: new Date(),
            type: 'auto-assigned',
            description: `系统自动分配给 ${bestFitRole.name}`,
            data: { roleId: bestFitRole.id, score: roleFitScores[0].overallScore }
          });
          
          // 从可用角色列表中移除已分配的角色
          const roleIndex = availableRoles.findIndex(r => r.id === bestFitRole.id);
          if (roleIndex !== -1) {
            availableRoles.splice(roleIndex, 1);
          }
          
          // 如果没有更多可用角色，结束分配
          if (availableRoles.length === 0) break;
        }
      }
    }
    
    // 如果有任务被分配，触发事件
    if (assignedCount > 0) {
      this.triggerEvent('tasksAutoAssigned', assignedCount);
    }
    
    return assignedCount;
  }
  
  /**
   * 添加事件监听器
   * @param eventName 事件名称
   * @param handler 处理函数
   */
  public addEventListener(eventName: string, handler: Function): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName)?.push(handler);
  }
  
  /**
   * 移除事件监听器
   * @param eventName 事件名称
   * @param handler 处理函数
   */
  public removeEventListener(eventName: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  /**
   * 触发事件
   * @param eventName 事件名称
   * @param args 事件参数
   */
  private triggerEvent(eventName: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(eventName) || [];
    for (const handler of handlers) {
      handler(...args);
    }
  }
}

// 导出单例实例
export const taskSystem = new TaskSystem(); 