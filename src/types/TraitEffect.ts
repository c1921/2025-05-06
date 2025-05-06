import type { Skill } from './Skill';

// 特质效果类型
export interface TraitEffect {
  // 影响的技能ID
  skillId: number;
  // 效果值（正为增益，负为减益）
  value: number;
  // 效果描述
  description: string;
}

// 特质效果映射表（特质ID -> 效果数组）
export type TraitEffectsMap = Record<number, TraitEffect[]>;

// 计算特质效果
export function calculateTraitEffectForSkill(
  traitEffectsMap: TraitEffectsMap,
  traitIds: number[],
  skillId: number
): number {
  let totalEffect = 0;
  
  // 遍历角色拥有的所有特质
  for (const traitId of traitIds) {
    // 获取特质的效果列表
    const effects = traitEffectsMap[traitId] || [];
    
    // 查找影响当前技能的效果
    for (const effect of effects) {
      if (effect.skillId === skillId) {
        totalEffect += effect.value;
      }
    }
  }
  
  return totalEffect;
} 