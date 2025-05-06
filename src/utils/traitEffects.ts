import type { TraitEffectsMap } from '../types/Trait';
import traitEffectsData from '../data/traitEffects.json';

// 从JSON文件导入特质效果配置表
export const traitEffectsMap: TraitEffectsMap = traitEffectsData as TraitEffectsMap;

/**
 * 获取特质对指定技能的效果描述
 * @param traitId 特质ID
 * @param skillId 技能ID
 * @throws {Error} 当特质ID或技能ID无效时抛出错误
 */
export function getTraitEffectDescription(traitId: number, skillId: number): string | null {
  if (!Number.isInteger(traitId) || traitId <= 0) {
    throw new Error(`无效的特质ID: ${traitId}`);
  }
  if (!Number.isInteger(skillId) || skillId <= 0) {
    throw new Error(`无效的技能ID: ${skillId}`);
  }

  const effects = traitEffectsMap[traitId] || [];
  const effect = effects.find(e => e.skillId === skillId);
  
  if (!effect) return null;
  
  const sign = effect.value > 0 ? '+' : '';
  return `${effect.description} (${sign}${effect.value})`;
}

/**
 * 获取特质的所有效果描述
 * @param traitId 特质ID
 * @throws {Error} 当特质ID无效时抛出错误
 */
export function getAllTraitEffectsDescription(traitId: number): string[] {
  if (!Number.isInteger(traitId) || traitId <= 0) {
    throw new Error(`无效的特质ID: ${traitId}`);
  }

  const effects = traitEffectsMap[traitId] || [];
  return effects.map(effect => {
    const sign = effect.value > 0 ? '+' : '';
    return `${effect.description} (${sign}${effect.value})`;
  });
}

/**
 * 获取特质对技能的效果值
 * @param traitId 特质ID
 * @param skillId 技能ID
 * @returns 效果值，如果没有效果则返回0
 * @throws {Error} 当特质ID或技能ID无效时抛出错误
 */
export function getTraitEffectValue(traitId: number, skillId: number): number {
  if (!Number.isInteger(traitId) || traitId <= 0) {
    throw new Error(`无效的特质ID: ${traitId}`);
  }
  if (!Number.isInteger(skillId) || skillId <= 0) {
    throw new Error(`无效的技能ID: ${skillId}`);
  }

  const effects = traitEffectsMap[traitId] || [];
  const effect = effects.find(e => e.skillId === skillId);
  return effect?.value ?? 0;
}

/**
 * 检查特质是否对指定技能有效果
 * @param traitId 特质ID
 * @param skillId 技能ID
 * @returns 是否有效果
 * @throws {Error} 当特质ID或技能ID无效时抛出错误
 */
export function hasTraitEffect(traitId: number, skillId: number): boolean {
  if (!Number.isInteger(traitId) || traitId <= 0) {
    throw new Error(`无效的特质ID: ${traitId}`);
  }
  if (!Number.isInteger(skillId) || skillId <= 0) {
    throw new Error(`无效的技能ID: ${skillId}`);
  }

  const effects = traitEffectsMap[traitId] || [];
  return effects.some(e => e.skillId === skillId);
} 