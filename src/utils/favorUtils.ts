import { MIN_FAVOR, MAX_FAVOR, DEFAULT_FAVOR, FAVOR_THRESHOLDS, FAVOR_LEVEL_NAMES } from '../types/Common';
import type { FavorLevel } from '../types/Common';
import type { Role, FavorRelation } from '../types/Role';
import type { ID } from '../types/Common';

/**
 * 获取角色对另一个角色的好感度
 * @param role 当前角色
 * @param targetId 目标角色ID
 * @returns 好感度值
 */
export function getFavorValue(role: Role, targetId: ID): number {
  const relation = role.favorRelations.find(r => r.targetId === targetId);
  return relation?.value ?? DEFAULT_FAVOR;
}

/**
 * 设置角色对另一个角色的好感度
 * @param role 当前角色
 * @param targetId 目标角色ID
 * @param value 好感度值
 * @returns 更新后的角色对象
 */
export function setFavorValue(role: Role, targetId: ID, value: number): Role {
  // 确保好感度在有效范围内
  const clampedValue = Math.max(MIN_FAVOR, Math.min(MAX_FAVOR, value));
  
  // 查找现有的关系
  const existingIndex = role.favorRelations.findIndex(r => r.targetId === targetId);
  
  // 创建新的关系列表
  const updatedRelations = [...role.favorRelations];
  
  if (existingIndex >= 0) {
    // 更新现有关系
    updatedRelations[existingIndex] = {
      ...updatedRelations[existingIndex],
      value: clampedValue
    };
  } else {
    // 添加新关系
    updatedRelations.push({
      targetId,
      value: clampedValue
    });
  }
  
  // 返回更新后的角色
  return {
    ...role,
    favorRelations: updatedRelations
  };
}

/**
 * 修改角色对另一个角色的好感度
 * @param role 当前角色
 * @param targetId 目标角色ID
 * @param delta 好感度变化值
 * @returns 更新后的角色对象
 */
export function changeFavorValue(role: Role, targetId: ID, delta: number): Role {
  const currentValue = getFavorValue(role, targetId);
  return setFavorValue(role, targetId, currentValue + delta);
}

/**
 * 获取好感度等级
 * @param value 好感度值
 * @returns 好感度等级
 */
export function getFavorLevel(value: number): FavorLevel {
  // 从高到低检查阈值
  const levels = Object.keys(FAVOR_THRESHOLDS) as FavorLevel[];
  
  // 按阈值从高到低排序
  const sortedLevels = [...levels].sort(
    (a, b) => FAVOR_THRESHOLDS[b] - FAVOR_THRESHOLDS[a]
  );
  
  // 找到第一个小于等于当前值的阈值
  for (const level of sortedLevels) {
    if (value >= FAVOR_THRESHOLDS[level]) {
      return level;
    }
  }
  
  // 默认返回最低等级
  return 'Hostile';
}

/**
 * 获取好感度等级的显示名称
 * @param value 好感度值
 * @returns 好感度等级名称
 */
export function getFavorLevelName(value: number): string {
  const level = getFavorLevel(value);
  return FAVOR_LEVEL_NAMES[level];
}

/**
 * 初始化角色的好感度关系
 * @param role 角色
 * @param targetIds 目标角色ID列表
 * @param initialValue 初始好感度值
 * @returns 更新后的角色对象
 */
export function initializeFavorRelations(
  role: Role, 
  targetIds: ID[], 
  initialValue: number = DEFAULT_FAVOR
): Role {
  const favorRelations: FavorRelation[] = targetIds.map(targetId => ({
    targetId,
    value: Math.max(MIN_FAVOR, Math.min(MAX_FAVOR, initialValue))
  }));
  
  return {
    ...role,
    favorRelations
  };
}

/**
 * 获取角色之间的互相好感度
 * @param role1 角色1
 * @param role2 角色2
 * @returns 好感度对象
 */
export function getMutualFavor(role1: Role, role2: Role): { role1ToRole2: number; role2ToRole1: number } {
  return {
    role1ToRole2: getFavorValue(role1, role2.id),
    role2ToRole1: getFavorValue(role2, role1.id)
  };
} 