import type { Role } from '../types/Role';
import { generateRandomRole } from './roleUtils';
import { applyTraitFavorEffectsToRoles } from './traitFavorUtils';
import { applyPoliticalFavorEffectsToRoles } from './politicalFavorUtils';
import { initializeFavorRelations } from './favorUtils';

/**
 * 生成多个随机角色
 * @param count 生成的角色数量
 * @returns 角色数组
 */
export function generateRandomRoles(count: number): Role[] {
  // 先生成所有角色
  const roles: Role[] = [];
  for (let i = 0; i < count; i++) {
    roles.push(generateRandomRole(i + 1));
  }

  // 为每个角色初始化与其他角色的好感度关系（初始值为0）
  const rolesWithRelations = roles.map(role => {
    const otherRoleIds = roles
      .filter(r => r.id !== role.id)
      .map(r => r.id);
    
    return initializeFavorRelations(role, otherRoleIds);
  });

  // 应用特质好感度影响
  let updatedRoles = applyTraitFavorEffectsToRoles(rolesWithRelations);
  
  // 应用政治立场好感度影响
  updatedRoles = applyPoliticalFavorEffectsToRoles(updatedRoles);
  
  return updatedRoles;
} 