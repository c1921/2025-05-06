// 主要特质类别
export type TraitCategory = 'Physical' | 'Personality' | 'Skill' | 'Background';

// 身体特质子类别
export type PhysicalTraitType = 'Appearance' | 'Build' | 'Feature';

// 性格特质子类别
export type PersonalityTraitType = 'Character' | 'Temperament' | 'Social';

// 技能特质子类别
export type SkillTraitType = 'Technical' | 'Creative' | 'People';

// 背景特质子类别
export type BackgroundTraitType = 'Education' | 'Experience' | 'Cultural';

// 为每个类别定义特质子类型
export type TraitSubType = 
  | PhysicalTraitType 
  | PersonalityTraitType 
  | SkillTraitType 
  | BackgroundTraitType;

export interface Trait {
  id: number;
  name: string;
  description: string;
  category: TraitCategory;
  subType: TraitSubType;
} 