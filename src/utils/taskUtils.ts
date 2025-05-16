import { v4 as uuidv4 } from 'uuid';
import type { Role } from '../types/Role';
import type { 
  Task, 
  TaskRoleFitScore,
  CreateTaskParams,
  TaskTemplate,
  ItemRequirement
} from '../types/Task';
import { TaskStatus } from '../types/Task';
import { getItemQuantity } from './inventoryService';
import { getEffectiveLevel } from '../types/Skill';

/**
 * 生成唯一的工作ID
 */
export function generateTaskId(): string {
  return `task-${uuidv4().substring(0, 8)}`;
}

/**
 * 从创建参数生成完整的工作对象
 * @param params 创建参数
 * @returns 新的工作对象
 */
export function createTaskFromParams(params: CreateTaskParams): Task {
  const now = new Date();
  
  return {
    id: generateTaskId(),
    type: params.type,
    name: params.name,
    description: params.description || '',
    requiredSkills: params.requiredSkills || [],
    priority: params.priority || 5, // 默认中等优先级
    creationTime: now,
    deadline: params.deadline || null,
    assignedRoleId: params.assignToRoleId || null,
    status: params.assignToRoleId ? TaskStatus.IN_PROGRESS : TaskStatus.PENDING,
    progress: 0,
    timeEstimate: params.timeEstimate || { baseHours: 8, skillFactor: 0.5, minHours: 2 },
    startTime: params.assignToRoleId ? now : null,
    completionTime: null,
    requiredItems: params.requiredItems || [],
    outputItems: params.outputItems || [],
    location: params.location || null,
    history: [
      {
        timestamp: now,
        type: 'created',
        description: '工作已创建'
      }
    ],
    tags: params.tags || [],
    isUserCreated: true,
    isRecurring: params.isRecurring || false, // 添加任务的isRecurring属性支持
    cycleCount: params.isRecurring ? (params.cycleCount ?? 0) : undefined, // 总循环次数，默认无限制循环
    currentCycle: params.isRecurring ? 1 : undefined, // 当前循环次数，第一次开始
  };
}

/**
 * 从模板创建工作
 * @param template 工作模板
 * @param customParams 自定义参数覆盖模板默认值
 * @returns 新的工作对象
 */
export function createTaskFromTemplate(
  template: TaskTemplate, 
  customParams: Partial<CreateTaskParams> = {}
): Task {
  // 合并模板和自定义参数
  const params: CreateTaskParams = {
    name: customParams.name || template.name,
    type: customParams.type || template.taskType,
    description: customParams.description || template.description,
    requiredSkills: customParams.requiredSkills || template.requiredSkills,
    priority: customParams.priority || template.defaultPriority,
    requiredItems: customParams.requiredItems || template.requiredItems,
    outputItems: customParams.outputItems || template.outputItems,
    timeEstimate: customParams.timeEstimate || template.timeEstimate,
    tags: [...(template.tags || []), ...(customParams.tags || [])],
    ...customParams
  };
  
  // 创建任务
  const task = createTaskFromParams(params);
  
  // 添加模板信息到历史记录
  task.history.push({
    timestamp: new Date(),
    type: 'template-used',
    description: `使用模板 "${template.name}" 创建`,
    data: { templateId: template.id }
  });
  
  return task;
}

/**
 * 估算角色完成工作所需的时间
 * @param task 工作
 * @param role 角色
 * @returns 估计完成所需的小时数
 */
export function estimateTaskCompletionHours(task: Task, role: Role): number {
  if (!task.timeEstimate) return 8; // 默认8小时
  
  const { baseHours, skillFactor, minHours } = task.timeEstimate;
  
  // 如果没有技能要求，直接返回基础时间
  if (!task.requiredSkills || task.requiredSkills.length === 0) {
    return baseHours;
  }
  
  // 计算角色技能对时间的影响
  let skillBonus = 0;
  
  // 查找角色技能并计算优势
  for (const requiredSkill of task.requiredSkills) {
    const roleSkill = role.skills.find(s => s.id === requiredSkill.skillId);
    
    if (roleSkill) {
      // 技能值越高于要求，时间越短
      const skillValue = getEffectiveLevel(roleSkill);
      const advantage = Math.max(0, (skillValue - requiredSkill.requiredValue) / 100);
      skillBonus += advantage;
    }
  }
  
  // 平均技能优势
  const avgSkillBonus = task.requiredSkills.length > 0 
    ? skillBonus / task.requiredSkills.length 
    : 0;
  
  // 计算时间减少因子 (0-skillFactor)
  const timeReductionFactor = avgSkillBonus * skillFactor;
  
  // 计算最终小时数，但不低于最小时间
  const estimatedHours = Math.max(
    minHours,
    baseHours * (1 - timeReductionFactor)
  );
  
  return Math.round(estimatedHours * 10) / 10; // 四舍五入到一位小数
}

/**
 * 计算角色对工作的适合度评分
 * @param task 工作
 * @param role 角色
 * @returns 适合度评分对象
 */
export function calculateRoleFitScore(task: Task, role: Role): TaskRoleFitScore {
  // 技能评分 (0-50分)
  let skillScore = 0;
  const skillDetails: {[key: string]: number} = {};
  
  // 如果有所需技能，计算技能匹配度
  if (task.requiredSkills && task.requiredSkills.length > 0) {
    for (const requiredSkill of task.requiredSkills) {
      const roleSkill = role.skills.find(s => s.id === requiredSkill.skillId);
      
      let skillMatch = 0;
      if (roleSkill) {
        const skillValue = getEffectiveLevel(roleSkill);
        // 如果角色技能值达到或超过要求，给满分
        if (skillValue >= requiredSkill.requiredValue) {
          skillMatch = 10;
        } else {
          // 部分匹配
          skillMatch = Math.max(0, (skillValue / requiredSkill.requiredValue) * 10);
        }
      }
      
      skillDetails[requiredSkill.skillName] = skillMatch;
      skillScore += skillMatch;
    }
    
    // 标准化为50分满分
    skillScore = (skillScore / (task.requiredSkills.length * 10)) * 50;
  } else {
    // 没有特定技能要求，默认给30分
    skillScore = 30;
  }
  
  // 可用性评分 (0-40分)
  // 已经分配了工作会降低评分
  const availabilityScore = role.currentTaskId ? 15 : 40;
  
  // 其他影响因素 (0-10分)
  // 可以基于角色特质、偏好、健康状态等评分
  const otherFactors = 10;
  
  // 总评分 (0-100)
  const overallScore = skillScore + availabilityScore + otherFactors;
  
  return {
    roleId: role.id,
    roleName: role.name,
    overallScore,
    skillScore,
    availabilityScore,
    details: {
      ...skillDetails,
      'availability': availabilityScore,
      'other': otherFactors
    }
  };
}

/**
 * 验证角色是否符合工作要求
 * @param task 工作
 * @param role 角色
 * @returns 是否符合要求和原因
 */
export function validateRoleForTask(task: Task, role: Role): { isValid: boolean, reason?: string } {
  // 检查角色是否已经有分配的工作
  if (role.currentTaskId) {
    return { isValid: false, reason: '角色已有分配工作' };
  }
  
  // 检查所需技能
  for (const requiredSkill of task.requiredSkills) {
    const roleSkill = role.skills.find(s => s.id === requiredSkill.skillId);
    
    // 如果角色没有所需技能或技能值不足
    if (!roleSkill || getEffectiveLevel(roleSkill) < requiredSkill.requiredValue) {
      return { 
        isValid: false, 
        reason: `技能不足：${requiredSkill.skillName} (需要 ${requiredSkill.requiredValue})` 
      };
    }
  }
  
  return { isValid: true };
}

/**
 * 验证是否有足够的物品完成工作
 * @param requiredItems 所需物品列表
 * @returns 是否有足够物品和缺少的物品列表
 */
export function validateRequiredItems(requiredItems: ItemRequirement[]): { 
  hasAllItems: boolean, 
  missingItems: { itemId: string, itemName: string, required: number, available: number }[] 
} {
  const missingItems = [];
  
  for (const item of requiredItems) {
    const available = getItemQuantity(item.itemId);
    
    if (available < item.quantity) {
      missingItems.push({
        itemId: item.itemId,
        itemName: item.itemName,
        required: item.quantity,
        available
      });
    }
  }
  
  return {
    hasAllItems: missingItems.length === 0,
    missingItems
  };
}

/**
 * 计算工作每小时的进度增加量
 * @param task 工作
 * @param role 角色
 * @returns 每小时进度百分比
 */
export function calculateHourlyProgress(task: Task, role: Role): number {
  // 估算完成时间
  const estimatedHours = estimateTaskCompletionHours(task, role);
  
  // 每小时进度百分比
  const hourlyProgress = 100 / estimatedHours;
  
  return hourlyProgress;
}

/**
 * 获取工作显示颜色
 * 基于优先级和状态
 */
export function getTaskColor(task: Task): string {
  // 基于状态的颜色
  switch (task.status) {
    case TaskStatus.COMPLETED:
      return 'bg-success text-success-content';
    case TaskStatus.FAILED:
      return 'bg-error text-error-content';
    case TaskStatus.CANCELLED:
      return 'bg-neutral text-neutral-content';
    default:
      // 基于优先级的颜色
      if (task.priority >= 8) {
        return 'bg-error bg-opacity-20';
      } else if (task.priority >= 6) {
        return 'bg-warning bg-opacity-20';
      } else if (task.priority >= 4) {
        return 'bg-info bg-opacity-10';
      } else {
        return 'bg-base-200';
      }
  }
}

/**
 * 获取友好的时间格式
 * @param date 日期对象
 * @returns 格式化的日期字符串
 */
export function formatTaskDate(date: Date | null): string {
  if (!date) return '无';
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 获取工作状态的文本描述
 * @param status 工作状态
 * @returns 状态文本描述
 */
export function getTaskStatusText(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.PENDING:
      return '待分配';
    case TaskStatus.IN_PROGRESS:
      return '进行中';
    case TaskStatus.COMPLETED:
      return '已完成';
    case TaskStatus.FAILED:
      return '失败';
    case TaskStatus.CANCELLED:
      return '已取消';
    default:
      return '未知状态';
  }
} 