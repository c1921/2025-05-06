/**
 * 工作类型
 * 定义系统中所有可能的工作类型
 */
export type TaskType = 
  | 'crafting'     // 制作物品
  | 'gathering'    // 采集资源
  | 'building'     // 建造建筑
  | 'research'     // 研究技术
  | 'maintenance'  // 维护/修理
  | 'training';    // 训练/学习

// 工作类型常量
export const TaskType = {
  CRAFTING: 'crafting' as TaskType,     // 制作物品
  GATHERING: 'gathering' as TaskType,   // 采集资源
  BUILDING: 'building' as TaskType,     // 建造建筑
  RESEARCH: 'research' as TaskType,     // 研究技术
  MAINTENANCE: 'maintenance' as TaskType, // 维护/修理
  TRAINING: 'training' as TaskType      // 训练/学习
};

/**
 * 工作状态
 * 追踪工作的当前状态
 */
export type TaskStatus = 
  | 'pending'      // 待分配
  | 'in_progress'  // 进行中
  | 'completed'    // 已完成
  | 'failed'       // 失败
  | 'cancelled';   // 已取消

// 工作状态常量
export const TaskStatus = {
  PENDING: 'pending' as TaskStatus,       // 待分配
  IN_PROGRESS: 'in_progress' as TaskStatus, // 进行中
  COMPLETED: 'completed' as TaskStatus,   // 已完成
  FAILED: 'failed' as TaskStatus,         // 失败
  CANCELLED: 'cancelled' as TaskStatus    // 已取消
};

/**
 * 工作失败原因
 */
export type TaskFailureReason = 
  | 'role_unavailable'    // 角色不可用
  | 'insufficient_skill'  // 技能不足
  | 'insufficient_items'  // 物品不足
  | 'expired'            // 超过截止时间
  | 'other';             // 其他原因

// 工作失败原因常量
export const TaskFailureReason = {
  ROLE_UNAVAILABLE: 'role_unavailable' as TaskFailureReason,   // 角色不可用
  INSUFFICIENT_SKILL: 'insufficient_skill' as TaskFailureReason, // 技能不足
  INSUFFICIENT_ITEMS: 'insufficient_items' as TaskFailureReason, // 物品不足
  EXPIRED: 'expired' as TaskFailureReason,       // 超过截止时间
  OTHER: 'other' as TaskFailureReason            // 其他原因
};

/**
 * 技能需求接口
 * 定义完成任务所需的技能及其最低值
 */
export interface SkillRequirement {
  skillId: string;           // 技能ID
  skillName: string;         // 技能名称
  requiredValue: number;     // 需要的最低技能值
}

/**
 * 物品需求接口
 * 定义完成任务所需消耗的物品
 */
export interface ItemRequirement {
  itemId: string;            // 物品ID
  itemName: string;          // 物品名称
  quantity: number;          // 需要的数量
}

/**
 * 物品产出接口
 * 定义任务完成后生成的物品
 */
export interface ItemOutput {
  itemId: string;            // 物品ID
  itemName: string;          // 物品名称
  quantity: number;          // 产出数量
  qualityModifier?: number;  // 品质修饰符，由角色技能影响
}

/**
 * 工作时间估算接口
 */
export interface TaskTimeEstimate {
  baseHours: number;         // 基础所需小时数
  skillFactor: number;       // 技能影响因子(0-1)，值越高技能对时间影响越大
  minHours: number;          // 最少所需小时数，即使技能很高也需要这么多时间
}

/**
 * 工作角色评分接口
 * 用于评估角色对工作的适合度
 */
export interface TaskRoleFitScore {
  roleId: string;            // 角色ID
  roleName: string;          // 角色名称
  overallScore: number;      // 总体适合度得分(0-100)
  skillScore: number;        // 技能匹配得分
  availabilityScore: number; // 可用性得分
  proximityScore?: number;   // 距离得分(可选)
  details: {                 // 详细评分信息
    [key: string]: number;
  };
}

/**
 * 工作历史记录项接口
 * 记录工作进展的历史事件
 */
export interface TaskHistoryItem {
  timestamp: Date;           // 时间戳
  type: string;              // 事件类型
  description: string;       // 描述
  data?: any;                // 额外数据
}

/**
 * 主要工作接口
 * 定义工作的所有属性和状态
 */
export interface Task {
  id: string;                // 工作ID
  type: TaskType;            // 工作类型
  name: string;              // 工作名称
  description: string;       // 描述
  requiredSkills: SkillRequirement[]; // 所需技能和最低值
  priority: number;          // 优先级(1-10)，数字越大越重要
  creationTime: Date;        // 创建时间
  deadline: Date | null;     // 截止时间，可为空表示无期限
  assignedRoleId: string | null; // 指派的角色ID
  status: TaskStatus;        // 状态
  progress: number;          // 完成进度(0-100)
  timeEstimate: TaskTimeEstimate; // 时间估算
  startTime: Date | null;    // 开始时间
  completionTime: Date | null; // 完成时间
  requiredItems: ItemRequirement[]; // 所需物品
  outputItems: ItemOutput[]; // 产出物品
  location: string | null;   // 工作地点
  failureReason?: TaskFailureReason; // 失败原因
  history: TaskHistoryItem[]; // 历史记录
  tags: string[];            // 分类标签
  isUserCreated: boolean;    // 是否由用户创建
  // 可以添加自定义属性的扩展
  [key: string]: any;
}

/**
 * 工作模板接口
 * 用于快速创建常见工作
 */
export interface TaskTemplate {
  id: string;                // 模板ID
  name: string;              // 模板名称
  taskType: TaskType;        // 工作类型
  description: string;       // 描述模板
  requiredSkills: SkillRequirement[]; // 所需技能
  timeEstimate: TaskTimeEstimate; // 时间估算
  requiredItems: ItemRequirement[]; // 所需物品
  outputItems: ItemOutput[]; // 产出物品
  defaultPriority: number;   // 默认优先级
  tags: string[];            // 分类标签
  icon?: string;             // 图标
}

/**
 * 创建工作参数接口
 * 用于创建新工作时的参数
 */
export interface CreateTaskParams {
  name: string;              // 工作名称
  type: TaskType;            // 工作类型
  description?: string;      // 描述
  requiredSkills?: SkillRequirement[]; // 所需技能
  priority?: number;         // 优先级
  deadline?: Date;           // 截止时间
  requiredItems?: ItemRequirement[]; // 所需物品
  outputItems?: ItemOutput[]; // 产出物品
  location?: string;         // 工作地点
  assignToRoleId?: string;   // 直接指派给角色
  templateId?: string;       // 使用的模板ID
  tags?: string[];           // 分类标签
  // 可以添加更多自定义参数
  [key: string]: any;
} 