import type { Role } from '../types/Role';
import type { Trait } from '../types/Trait';
import type { TraitPersonalityEffect, TraitPersonalityEffectsMap } from '../types/TraitPersonalityEffect';
import traitPersonalityEffectsData from '../data/traitPersonalityEffects.json';

// 从JSON文件导入特质个性影响配置表并转换ID为字符串
const rawData = traitPersonalityEffectsData as any;
const traitPersonalityEffectsMap: TraitPersonalityEffectsMap = {};

// 将数字ID转换为字符串ID
Object.keys(rawData).forEach(key => {
  traitPersonalityEffectsMap[String(key)] = rawData[key];
});

/**
 * 应用特质个性影响到角色
 * @param role 角色
 * @returns 更新后的角色
 */
export function applyTraitPersonalityEffects(role: Role): Role {
  // 深拷贝AI个性属性，避免修改原始对象
  const updatedPersonality = { ...role.aiPersonality };
  
  // 获取角色所有特质的ID列表
  const traitIds = role.traits.map(trait => trait.id);
  
  // 对每个个性属性应用特质效果
  for (const traitId of traitIds) {
    const effects = traitPersonalityEffectsMap[traitId] || [];
    
    // 应用每个效果到相应的个性属性
    for (const effect of effects) {
      const personalityType = effect.personalityType as keyof typeof updatedPersonality;
      
      // 获取当前属性值
      const currentValue = updatedPersonality[personalityType];
      
      // 计算新值并限制在-100~100范围内
      updatedPersonality[personalityType] = Math.max(-100, Math.min(100, currentValue + effect.value));
    }
  }
  
  // 返回更新后的角色
  return {
    ...role,
    aiPersonality: updatedPersonality
  };
}

/**
 * 获取特质对个性的所有影响描述
 * @param trait 特质
 * @returns 特质个性影响描述数组
 */
export function getTraitPersonalityEffects(trait: Trait): TraitPersonalityEffect[] {
  return traitPersonalityEffectsMap[trait.id] || [];
}

/**
 * 获取特质个性影响文本描述，包括值和描述
 * @param trait 特质
 * @returns 文本描述数组
 */
export function getTraitPersonalityEffectsDescription(trait: Trait): string[] {
  const effects = getTraitPersonalityEffects(trait);
  
  return effects.map(effect => {
    const sign = effect.value > 0 ? '+' : '';
    return `${effect.description} (${sign}${effect.value})`;
  });
} 