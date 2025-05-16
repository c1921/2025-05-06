// 特质个性影响类型
export interface TraitPersonalityEffect {
  // 影响的个性属性
  personalityType: 'energy' | 'bravery' | 'compassion' | 'greed' | 'honor' | 'rationality' | 'sociability' | 'vengefulness' | 'zealotry';
  // 效果值（-100~100）
  value: number;
}

// 特质个性影响映射表（特质ID -> 效果数组）
export type TraitPersonalityEffectsMap = Record<string, TraitPersonalityEffect[]>; 