import type { TraitEffectsMap } from '../types/TraitEffect';
import traitEffectsData from '../data/traitEffects.json';

// 从JSON文件导入特质效果配置表
export const traitEffectsMap: TraitEffectsMap = traitEffectsData as TraitEffectsMap;

/**
 * 获取特质对指定技能的效果描述
 * @param traitId 特质ID
 * @param skillId 技能ID
 */
export function getTraitEffectDescription(traitId: number, skillId: number): string | null {
  const effects = traitEffectsMap[traitId] || [];
  const effect = effects.find(e => e.skillId === skillId);
  
  if (!effect) return null;
  
  const sign = effect.value > 0 ? '+' : '';
  return `${effect.description} (${sign}${effect.value})`;
}

/**
 * 获取特质的所有效果描述
 * @param traitId 特质ID
 */
export function getAllTraitEffectsDescription(traitId: number): string[] {
  const effects = traitEffectsMap[traitId] || [];
  return effects.map(effect => {
    const sign = effect.value > 0 ? '+' : '';
    return `${effect.description} (${sign}${effect.value})`;
  });
} 