import type { ID } from './Common';

// 特质好感度影响
export interface TraitFavorEffect {
  // 源特质ID
  sourceTraitId: ID;
  // 目标特质ID（null表示对所有特质生效）
  targetTraitId: ID | null;
  // 好感度变化值
  favorChange: number;
  // 影响描述
  description: string;
}

// 特质好感度影响映射
export interface TraitFavorEffectsMap {
  traitFavorEffects: TraitFavorEffect[];
} 