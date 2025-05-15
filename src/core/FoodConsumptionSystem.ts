import { ref } from 'vue';
import type { Role } from '../types/Role';
import { getItemQuantity, removeItemQuantity } from '../utils/inventoryService';

// 食物物品ID（根据items.json）
const FOOD_ITEM_ID = '9';

// 食物消耗配置
interface FoodConsumptionConfig {
  consumptionPerRole: number;      // 每个角色每天消耗量
}

// 默认配置
const config: FoodConsumptionConfig = {
  consumptionPerRole: 1,           // 每个角色每天消耗1单位食物
};

// 饥饿状态追踪
const hungryRoles = ref<Set<string>>(new Set()); // 饥饿的角色ID集合

/**
 * 处理中午12点的食物消耗
 * @param roles 所有角色
 * @returns {Object} 处理结果: {hungryCount: 饥饿角色数, fedCount: 已喂食角色数}
 */
export function processNoonFoodConsumption(roles: Role[]): { hungryCount: number, fedCount: number } {
  // 获取当前食物库存
  const currentFoodStock = getItemQuantity(FOOD_ITEM_ID);
  
  // 计算总角色数和需要的总食物量
  const totalRoles = roles.length;
  const totalFoodNeeded = totalRoles * config.consumptionPerRole;
  
  // 清空之前的饥饿状态记录
  hungryRoles.value.clear();
  
  // 如果有足够的食物供应所有角色
  if (currentFoodStock >= totalFoodNeeded) {
    // 消耗食物
    removeItemQuantity(FOOD_ITEM_ID, totalFoodNeeded);
    // 所有角色都吃饱了
    return { hungryCount: 0, fedCount: totalRoles };
  }
  
  // 食物不足的情况：计算能喂养的角色数量
  const canFeedCount = Math.floor(currentFoodStock / config.consumptionPerRole);
  
  // 消耗所有可用的食物
  if (canFeedCount > 0) {
    removeItemQuantity(FOOD_ITEM_ID, canFeedCount * config.consumptionPerRole);
  }
  
  // 决定哪些角色挨饿（简单实现：随机选择）
  const rolesToFeed = [...roles];
  // 随机打乱角色数组
  shuffleArray(rolesToFeed);
  
  // 饥饿角色数量
  const hungryCount = totalRoles - canFeedCount;
  
  // 将没被喂食的角色标记为饥饿
  for (let i = canFeedCount; i < totalRoles; i++) {
    hungryRoles.value.add(rolesToFeed[i].id);
  }
  
  return { hungryCount, fedCount: canFeedCount };
}

/**
 * 检查角色是否处于饥饿状态
 * @param roleId 角色ID
 * @returns 是否饥饿
 */
export function isHungry(roleId: string | number): boolean {
  const id = typeof roleId === 'number' ? roleId.toString() : roleId;
  return hungryRoles.value.has(id);
}

/**
 * 获取所有饥饿角色的ID
 * @returns 饥饿角色ID集合
 */
export function getHungryRoleIds(): Set<string> {
  return new Set(hungryRoles.value);
}

/**
 * 重置所有角色的饥饿状态
 */
export function resetHungerStatus(): void {
  hungryRoles.value.clear();
}

/**
 * 打乱数组顺序 (Fisher-Yates 洗牌算法)
 * @param array 要打乱的数组
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
} 