import type { BaseEntity, Group } from './Common';

// 特质类别
export type TraitCategory = 'Physical' | 'Personality' | 'Skill' | 'Background';

// 特质子类型
export type TraitSubType = 
  | 'Appearance' | 'Build' | 'Feature'  // 身体特质
  | 'Character' | 'Temperament' | 'Social'  // 性格特质
  | 'Combat' | 'Magic' | 'Survival' | 'Social' | 'Crafting'  // 技能特质
  | 'Origin' | 'Experience' | 'Status';  // 背景特质

// 性格特质类型
export type PersonalityTraitType = 'Character' | 'Temperament' | 'Social';

// 特质接口
export interface Trait extends BaseEntity {
  readonly category: TraitCategory;
  readonly subType: TraitSubType;
}

// 特质组接口
export interface TraitGroup extends Group<Trait> {}

// 特质效果接口
export interface TraitEffect {
  readonly skillId: string;
  readonly value: number;
  readonly description: string;
}

// 特质效果映射
export type TraitEffectsMap = {
  readonly [key: string]: readonly TraitEffect[];
}; 