import type { TraitEffectsMap } from '../types/Trait';
import traitEffectsData from '../data/traitEffects.json';

// 从JSON文件导入特质效果配置表
export const traitEffectsMap = traitEffectsData as TraitEffectsMap;

/**
 * 获取特质对技能的效果值
 * @param traitId 特质ID
 * @param skillId 技能ID
 * @returns 效果值，如果没有效果则返回0
 */
export function getTraitEffectValue(traitId: string, skillId: string): number {
  const effects = traitEffectsMap[traitId] || [];
  const effect = effects.find(e => e.skillId === skillId);
  return effect?.value ?? 0;
}

/**
 * 检查特质是否对指定技能有效果
 * @param traitId 特质ID
 * @param skillId 技能ID
 * @returns 是否有效果
 */
export function hasTraitEffect(traitId: string, skillId: string): boolean {
  const effects = traitEffectsMap[traitId] || [];
  return effects.some(e => e.skillId === skillId);
} 