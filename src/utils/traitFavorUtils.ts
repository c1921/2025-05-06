import type { Role } from '../types/Role';
import type { TraitFavorEffect } from '../types/TraitFavorEffect';
import traitFavorEffectsData from '../data/traitFavorEffects.json';

// 将JSON数据转换为正确的类型
const rawData = traitFavorEffectsData as any;
const traitFavorEffects = rawData.traitFavorEffects.map((effect: any) => ({
  ...effect,
  sourceTraitId: String(effect.sourceTraitId),
  targetTraitId: effect.targetTraitId !== null ? String(effect.targetTraitId) : null
})) as TraitFavorEffect[];

/**
 * 计算目标角色对源角色的特质好感度影响
 * 好感度定义：目标角色对源角色的好感度
 * 例如：如果A有美貌特质，则B对A有好感度+10
 * @param sourceRole 拥有特质的角色
 * @param targetRole 受到好感度影响的角色
 * @returns 好感度变化值数组，每个元素包含变化值和描述
 */
export function calculateTraitFavorEffects(sourceRole: Role, targetRole: Role): { value: number; description: string; type: 'trait' }[] {
  const effects: { value: number; description: string; type: 'trait' }[] = [];
  
  // 计算源角色拥有的特质对目标角色的影响
  // 如源角色拥有"美貌"，则目标角色对源角色好感度+10
  for (const sourceTrait of sourceRole.traits) {
    // 查找该特质的全局影响（对所有人生效的特质）
    const globalEffects = traitFavorEffects.filter(
      effect => effect.sourceTraitId === sourceTrait.id && effect.targetTraitId === null
    );
    
    // 添加全局影响
    effects.push(...globalEffects.map(effect => ({
      value: effect.favorChange,
      description: effect.description,
      type: 'trait' as const
    })));
  }
  
  // 计算目标角色的特质与源角色特质的交互影响
  // 如源角色"勤劳"，目标角色"懒惰"，则目标角色对源角色-5
  for (const targetTrait of targetRole.traits) {
    for (const sourceTrait of sourceRole.traits) {
      // 查找目标特质对源特质的特定影响
      const specificEffects = traitFavorEffects.filter(
        effect => effect.sourceTraitId === targetTrait.id && effect.targetTraitId === sourceTrait.id
      );
      
      // 添加特定影响
      effects.push(...specificEffects.map(effect => ({
        value: effect.favorChange,
        description: effect.description,
        type: 'trait' as const
      })));
    }
  }
  
  return effects;
}

/**
 * 应用特质好感度影响到角色关系
 * @param roles 所有角色
 * @returns 更新后的角色数组
 */
export function applyTraitFavorEffectsToRoles(roles: Role[]): Role[] {
  const updatedRoles = [...roles];
  
  // 计算所有角色之间的特质好感度影响
  for (const targetRole of updatedRoles) {
    for (const sourceRole of updatedRoles) {
      if (targetRole.id === sourceRole.id) continue; // 跳过自己
      
      // 查找现有关系
      let relation = targetRole.favorRelations.find(r => r.targetId === sourceRole.id);
      
      // 如果不存在关系，创建一个新的
      if (!relation) {
        relation = { targetId: sourceRole.id, value: 0 };
        targetRole.favorRelations.push(relation);
      }
      
      // 计算特质影响
      const effects = calculateTraitFavorEffects(sourceRole, targetRole);
      
      // 应用特质影响
      const favorChange = effects.reduce((sum, effect) => sum + effect.value, 0);
      relation.value += favorChange;
    }
  }
  
  return updatedRoles;
}

/**
 * 获取特质好感度影响的描述
 * @param sourceTraitId 源特质ID
 * @param targetTraitId 目标特质ID
 * @returns 影响描述
 */
export function getTraitFavorEffectDescription(sourceTraitId: string | number, targetTraitId: string | number | null): string | null {
  const sourceId = String(sourceTraitId);
  const targetId = targetTraitId !== null ? String(targetTraitId) : null;
  
  const effect = traitFavorEffects.find(
    effect => effect.sourceTraitId === sourceId && effect.targetTraitId === targetId
  );
  return effect ? effect.description : null;
}

/**
 * 获取特质好感度变化值
 * @param sourceTraitId 源特质ID
 * @param targetTraitId 目标特质ID
 * @returns 好感度变化值
 */
export function getTraitFavorChange(sourceTraitId: string | number, targetTraitId: string | number | null): number {
  const sourceId = String(sourceTraitId);
  const targetId = targetTraitId !== null ? String(targetTraitId) : null;
  
  const effect = traitFavorEffects.find(
    effect => effect.sourceTraitId === sourceId && effect.targetTraitId === targetId
  );
  return effect ? effect.favorChange : 0;
} 