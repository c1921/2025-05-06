import { TaskType } from '../types/Task';
import type { CreateTaskParams, TaskTemplate } from '../types/Task';
import { taskSystem } from '../core/TaskSystem';

/**
 * 预定义的任务模板
 */
export const taskTemplates: Record<string, TaskTemplate> = {
  // 木材加工模板
  woodProcessing: {
    id: 'template-wood-processing',
    name: '木材加工',
    taskType: TaskType.CRAFTING,
    description: '将原木加工成木材',
    requiredSkills: [
      {
        skillId: '3', // 工艺技能
        skillName: '工艺',
        requiredValue: 2
      }
    ],
    timeEstimate: {
      baseHours: 4,
      skillFactor: 0.5,
      minHours: 1
    },
    requiredItems: [
      {
        itemId: '7', // 木材 (Wood)
        itemName: '木材',
        quantity: 2
      }
    ],
    outputItems: [
      {
        itemId: '8', // 石材 (Stone)，作为示例，实际应该是加工后的木板
        itemName: '石材',
        quantity: 4
      }
    ],
    defaultPriority: 5,
    tags: ['crafting', 'wood']
  },
  
  // 食物准备模板
  foodPreparation: {
    id: 'template-food-preparation',
    name: '食物准备',
    taskType: TaskType.CRAFTING,
    description: '准备食物供角色食用',
    requiredSkills: [
      {
        skillId: '5', // 烹饪技能
        skillName: '烹饪',
        requiredValue: 3
      }
    ],
    timeEstimate: {
      baseHours: 3,
      skillFactor: 0.6,
      minHours: 1
    },
    requiredItems: [
      {
        itemId: '7', // 木材 (当作食材)
        itemName: '食材',
        quantity: 3
      }
    ],
    outputItems: [
      {
        itemId: '9', // 食物 (Food)
        itemName: '食物',
        quantity: 6
      }
    ],
    defaultPriority: 6,
    tags: ['crafting', 'food']
  },
  
  // 资源收集模板
  resourceGathering: {
    id: 'template-resource-gathering',
    name: '资源收集',
    taskType: TaskType.GATHERING,
    description: '收集基础资源',
    requiredSkills: [
      {
        skillId: '4', // 采集技能
        skillName: '采集',
        requiredValue: 1
      }
    ],
    timeEstimate: {
      baseHours: 5,
      skillFactor: 0.4,
      minHours: 2
    },
    requiredItems: [],
    outputItems: [
      {
        itemId: '7', // 木材 (Wood)
        itemName: '木材',
        quantity: 5
      },
      {
        itemId: '8', // 石材 (Stone)
        itemName: '石材',
        quantity: 3
      }
    ],
    defaultPriority: 4,
    tags: ['gathering', 'resources']
  }
};

/**
 * 从模板ID创建任务
 * @param templateId 模板ID
 * @param customParams 自定义参数(可选)
 * @returns 是否创建成功
 */
export function createTaskFromTemplateId(
  templateId: string, 
  customParams: Partial<CreateTaskParams> = {}
): boolean {
  const template = taskTemplates[templateId];
  
  if (!template) {
    console.error(`未找到模板: ${templateId}`);
    return false;
  }
  
  const taskParams: CreateTaskParams = {
    name: customParams.name || template.name,
    type: customParams.type || template.taskType,
    description: customParams.description || template.description,
    requiredSkills: customParams.requiredSkills || template.requiredSkills,
    priority: customParams.priority || template.defaultPriority,
    requiredItems: customParams.requiredItems || template.requiredItems,
    outputItems: customParams.outputItems || template.outputItems,
    timeEstimate: customParams.timeEstimate || template.timeEstimate,
    tags: [...(template.tags || []), ...(customParams.tags || [])],
    isRecurring: customParams.isRecurring || false,
    ...customParams
  };
  
  try {
    taskSystem.createTask(taskParams);
    return true;
  } catch (error) {
    console.error('创建任务失败:', error);
    return false;
  }
}

/**
 * 创建示例任务（用于测试）
 */
export function createSampleTask(): void {
  createTaskFromTemplateId('woodProcessing');
} 