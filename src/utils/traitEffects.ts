import type { TraitEffectsMap, TraitEffect } from '../types/Trait';
import traitEffectsData from '../data/traitEffects.json';

// 从JSON文件导入特质效果配置表，并转换ID为字符串
const rawEffectsMap = traitEffectsData as any;
const convertedMap: { [key: string]: TraitEffect[] } = {};

Object.keys(rawEffectsMap).forEach(key => {
  const stringKey = String(key);
  convertedMap[stringKey] = rawEffectsMap[key].map((effect: any) => ({
    ...effect,
    skillId: String(effect.skillId)
  }));
});

export const traitEffectsMap = convertedMap as TraitEffectsMap;

/**
 * 获取特质对指定技能的效果描述
 * @param traitId 特质ID
 * @param skillId 技能ID
 * @throws {Error} 当特质ID或技能ID无效时抛出错误
 */
export function getTraitEffectDescription(traitId: string | number, skillId: string | number): string | null {
  const traitIdStr = String(traitId);
  const skillIdStr = String(skillId);

  const effects = traitEffectsMap[traitIdStr] || [];
  const effect = effects.find(e => e.skillId === skillIdStr);
  
  if (!effect) return null;
  
  const sign = effect.value > 0 ? '+' : '';
  return `${effect.description} (${sign}${effect.value})`;
}

/**
 * 获取特质的所有效果描述
 * @param traitId 特质ID
 * @throws {Error} 当特质ID无效时抛出错误
 */
export function getAllTraitEffectsDescription(traitId: string | number): string[] {
  const traitIdStr = String(traitId);
  const effects = traitEffectsMap[traitIdStr] || [];
  
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
 */
export function getTraitEffectValue(traitId: string | number, skillId: string | number): number {
  const traitIdStr = String(traitId);
  const skillIdStr = String(skillId);
  
  const effects = traitEffectsMap[traitIdStr] || [];
  const effect = effects.find(e => e.skillId === skillIdStr);
  return effect?.value ?? 0;
}

/**
 * 检查特质是否对指定技能有效果
 * @param traitId 特质ID
 * @param skillId 技能ID
 * @returns 是否有效果
 */
export function hasTraitEffect(traitId: string | number, skillId: string | number): boolean {
  const traitIdStr = String(traitId);
  const skillIdStr = String(skillId);
  
  const effects = traitEffectsMap[traitIdStr] || [];
  return effects.some(e => e.skillId === skillIdStr);
} 