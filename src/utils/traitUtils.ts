import type { Trait, TraitCategory, TraitSubType, PersonalityTraitType } from '../types/Trait';

// 定义特质组类型
interface TraitGroup {
  id: number;
  traits: Trait[];
}

// 身体特质
const physicalTraits: Trait[] = [
  // 外貌
  { id: 1, name: 'Tall', description: 'Above average height', category: 'Physical', subType: 'Appearance' },
  { id: 2, name: 'Beautiful', description: 'Exceptionally attractive appearance', category: 'Physical', subType: 'Appearance' },
  // 体型
  { id: 3, name: 'Athletic', description: 'Well-built physique', category: 'Physical', subType: 'Build' },
  { id: 4, name: 'Slender', description: 'Thin and graceful', category: 'Physical', subType: 'Build' },
  { id: 5, name: 'Strong', description: 'Physically powerful', category: 'Physical', subType: 'Build' },
  // 特征
  { id: 6, name: 'Sharp Eyes', description: 'Piercing, attentive gaze', category: 'Physical', subType: 'Feature' },
  { id: 7, name: 'Distinctive Voice', description: 'Memorable and unique voice', category: 'Physical', subType: 'Feature' }
];

// 性格特质组
const personalityTraitGroups: TraitGroup[] = [
  // 品性组
  {
    id: 1,
    traits: [
      { id: 29, name: 'Diligent', description: 'Hardworking and persistent', category: 'Personality', subType: 'Character' },
      { id: 30, name: 'Lazy', description: 'Avoids effort when possible', category: 'Personality', subType: 'Character' }
    ]
  },
  {
    id: 2,
    traits: [
      { id: 31, name: 'Generous', description: 'Willing to give and share freely', category: 'Personality', subType: 'Character' },
      { id: 32, name: 'Greedy', description: 'Desires more than needed', category: 'Personality', subType: 'Character' }
    ]
  },
  {
    id: 3,
    traits: [
      { id: 33, name: 'Honest', description: 'Truthful and sincere', category: 'Personality', subType: 'Character' },
      { id: 34, name: 'Cunning', description: 'Clever and deceptive', category: 'Personality', subType: 'Character' }
    ]
  },
  {
    id: 4,
    traits: [
      { id: 35, name: 'Loyal', description: 'Faithful and devoted', category: 'Personality', subType: 'Character' },
      { id: 36, name: 'Promiscuous', description: 'Casual in relationships', category: 'Personality', subType: 'Character' }
    ]
  },
  {
    id: 5,
    traits: [
      { id: 37, name: 'Ambitious', description: 'Strong desire for achievement', category: 'Personality', subType: 'Character' },
      { id: 38, name: 'Content', description: 'Satisfied with the present state', category: 'Personality', subType: 'Character' }
    ]
  },
  {
    id: 6,
    traits: [
      { id: 39, name: 'Righteous', description: 'Morally upright and virtuous', category: 'Personality', subType: 'Character' },
      { id: 40, name: 'Wicked', description: 'Morally bad or wrong', category: 'Personality', subType: 'Character' }
    ]
  },
  {
    id: 7,
    traits: [
      { id: 41, name: 'Frugal', description: 'Careful with resources', category: 'Personality', subType: 'Character' },
      { id: 42, name: 'Extravagant', description: 'Spends freely and lavishly', category: 'Personality', subType: 'Character' }
    ]
  },
  {
    id: 8,
    traits: [
      { id: 43, name: 'Compassionate', description: 'Feels sympathy for others', category: 'Personality', subType: 'Character' },
      { id: 44, name: 'Cruel', description: 'Causes pain without compassion', category: 'Personality', subType: 'Character' }
    ]
  },
  {
    id: 9,
    traits: [
      { id: 45, name: 'Neat', description: 'Organized and tidy', category: 'Personality', subType: 'Character' },
      { id: 46, name: 'Sloppy', description: 'Careless and untidy', category: 'Personality', subType: 'Character' }
    ]
  },
  // 气质组
  {
    id: 10,
    traits: [
      { id: 47, name: 'Enthusiastic', description: 'Shows intense interest', category: 'Personality', subType: 'Temperament' },
      { id: 48, name: 'Gloomy', description: 'Tends toward sadness', category: 'Personality', subType: 'Temperament' }
    ]
  },
  {
    id: 11,
    traits: [
      { id: 49, name: 'Courageous', description: 'Face challenges without fear', category: 'Personality', subType: 'Temperament' },
      { id: 50, name: 'Timid', description: 'Lacks courage or confidence', category: 'Personality', subType: 'Temperament' }
    ]
  },
  {
    id: 12,
    traits: [
      { id: 51, name: 'Stubborn', description: 'Unwilling to change opinions', category: 'Personality', subType: 'Temperament' },
      { id: 52, name: 'Fickle', description: 'Changes quickly and unexpectedly', category: 'Personality', subType: 'Temperament' }
    ]
  },
  {
    id: 13,
    traits: [
      { id: 53, name: 'Optimistic', description: 'Hopeful about the future', category: 'Personality', subType: 'Temperament' },
      { id: 54, name: 'Pessimistic', description: 'Expects negative outcomes', category: 'Personality', subType: 'Temperament' }
    ]
  },
  {
    id: 14,
    traits: [
      { id: 55, name: 'Gentle', description: 'Kind and mild in temperament', category: 'Personality', subType: 'Temperament' },
      { id: 56, name: 'Irritable', description: 'Easily annoyed or angered', category: 'Personality', subType: 'Temperament' }
    ]
  },
  {
    id: 15,
    traits: [
      { id: 57, name: 'Calculated', description: 'Carefully plans actions', category: 'Personality', subType: 'Temperament' },
      { id: 58, name: 'Reckless', description: 'Acts without caution', category: 'Personality', subType: 'Temperament' }
    ]
  },
  {
    id: 16,
    traits: [
      { id: 59, name: 'Sensitive', description: 'Responsive to emotions', category: 'Personality', subType: 'Temperament' },
      { id: 60, name: 'Callous', description: 'Insensitive to emotions', category: 'Personality', subType: 'Temperament' }
    ]
  },
  {
    id: 17,
    traits: [
      { id: 61, name: 'Decisive', description: 'Makes decisions quickly', category: 'Personality', subType: 'Temperament' },
      { id: 62, name: 'Hesitant', description: 'Uncertain in making decisions', category: 'Personality', subType: 'Temperament' }
    ]
  },
  // 社交组
  {
    id: 18,
    traits: [
      { id: 63, name: 'Extroverted', description: 'Energized by social interaction', category: 'Personality', subType: 'Social' },
      { id: 64, name: 'Introverted', description: 'Energized by solitude', category: 'Personality', subType: 'Social' }
    ]
  },
  {
    id: 19,
    traits: [
      { id: 65, name: 'Courteous', description: 'Respectful and polite', category: 'Personality', subType: 'Social' },
      { id: 66, name: 'Domineering', description: 'Tries to control others', category: 'Personality', subType: 'Social' }
    ]
  }
];

// 技能特质
const skillTraits: Trait[] = [
  // 技术
  { id: 15, name: 'Computer Expert', description: 'Proficient with technology', category: 'Skill', subType: 'Technical' },
  { id: 16, name: 'Scientific', description: 'Analytical and methodical', category: 'Skill', subType: 'Technical' },
  // 创造力
  { id: 17, name: 'Artistic', description: 'Talent for creative expression', category: 'Skill', subType: 'Creative' },
  { id: 18, name: 'Musical', description: 'Gifted with musical abilities', category: 'Skill', subType: 'Creative' },
  // 人际
  { id: 19, name: 'Leadership', description: 'Ability to guide others', category: 'Skill', subType: 'People' },
  { id: 20, name: 'Persuasive', description: 'Skilled at convincing others', category: 'Skill', subType: 'People' },
  { id: 21, name: 'Empathetic', description: 'Understanding of others\' feelings', category: 'Skill', subType: 'People' }
];

// 背景特质
const backgroundTraits: Trait[] = [
  // 教育
  { id: 22, name: 'Academic', description: 'Scholarly background', category: 'Background', subType: 'Education' },
  { id: 23, name: 'Self-Taught', description: 'Learned through personal study', category: 'Background', subType: 'Education' },
  // 经历
  { id: 24, name: 'Military', description: 'Military training or service', category: 'Background', subType: 'Experience' },
  { id: 25, name: 'Business', description: 'Experience in business world', category: 'Background', subType: 'Experience' },
  // 文化
  { id: 26, name: 'Cosmopolitan', description: 'Well-traveled and worldly', category: 'Background', subType: 'Cultural' },
  { id: 27, name: 'Traditional', description: 'Rooted in cultural traditions', category: 'Background', subType: 'Cultural' },
  { id: 28, name: 'Foreign Born', description: 'Born and raised in another country', category: 'Background', subType: 'Cultural' }
];

// 从特质组中提取所有性格特质
const personalityTraits: Trait[] = personalityTraitGroups.flatMap(group => group.traits);

// 所有特质组合
export const allTraits: Trait[] = [
  ...physicalTraits,
  ...personalityTraits,
  ...skillTraits,
  ...backgroundTraits
];

/**
 * 按类别获取特质
 */
export function getTraitsByCategory(category: TraitCategory): Trait[] {
  return allTraits.filter(trait => trait.category === category);
}

/**
 * 按子类型获取特质
 */
export function getTraitsBySubType(subType: TraitSubType): Trait[] {
  return allTraits.filter(trait => trait.subType === subType);
}

/**
 * 同时按类别和子类型获取特质
 */
export function getTraitsByCategoryAndSubType(category: TraitCategory, subType: TraitSubType): Trait[] {
  return allTraits.filter(trait => trait.category === category && trait.subType === subType);
}

/**
 * 获取特质所属的特质组
 */
function getTraitGroup(traitId: number): TraitGroup | undefined {
  return personalityTraitGroups.find(group => 
    group.traits.some(trait => trait.id === traitId)
  );
}

/**
 * 检查特质是否与已选特质存在冲突
 */
function hasConflict(traitId: number, selectedTraitIds: number[]): boolean {
  const traitGroup = getTraitGroup(traitId);
  if (!traitGroup) return false;
  
  // 检查已选特质中是否有同组的其他特质
  return selectedTraitIds.some(selectedId => {
    const selectedGroup = getTraitGroup(selectedId);
    return selectedGroup?.id === traitGroup.id;
  });
}

/**
 * 从特定类别和类型中随机选择一个特质，避免与已选特质冲突
 */
function getRandomTraitFromCategoryAndType(
  category: TraitCategory, 
  subType?: TraitSubType,
  selectedTraitIds: number[] = []
): Trait | null {
  // 获取指定类别和子类型的特质
  let availableTraits: Trait[];
  if (subType) {
    availableTraits = getTraitsByCategoryAndSubType(category, subType);
  } else {
    availableTraits = getTraitsByCategory(category);
  }
  
  // 过滤掉已选的和有冲突的特质
  const eligibleTraits = availableTraits.filter(trait => 
    !selectedTraitIds.includes(trait.id) && 
    !hasConflict(trait.id, selectedTraitIds)
  );
  
  if (eligibleTraits.length === 0) return null;
  
  // 随机选择一个特质
  const randomIndex = Math.floor(Math.random() * eligibleTraits.length);
  return eligibleTraits[randomIndex];
}

/**
 * 生成角色特质集，确保有三个性格特质（从不同子类型选择），并避免矛盾特质
 * 剩余特质从其他类别随机选择
 */
export function generateCharacterTraits(totalTraits: number = 5): Trait[] {
  const result: Trait[] = [];
  const selectedTraitIds: number[] = [];
  
  // 确保至少有三个不同子类型的性格特质
  const personalitySubTypes: PersonalityTraitType[] = ['Character', 'Temperament', 'Social'];
  
  // 1. 先从每个性格子类型中选择一个特质，确保有三个不同的性格特质
  for (const subType of personalitySubTypes) {
    const trait = getRandomTraitFromCategoryAndType('Personality', subType, selectedTraitIds);
    if (trait) {
      result.push(trait);
      selectedTraitIds.push(trait.id);
    }
  }
  
  // 2. 如果需要更多特质，从其他类别中随机选择
  const otherCategories: TraitCategory[] = ['Physical', 'Skill', 'Background'];
  let remainingTraits = totalTraits - result.length;
  
  // 先尝试每个其他类别至少选一个特质
  for (const category of otherCategories) {
    if (remainingTraits <= 0) break;
    
    const trait = getRandomTraitFromCategoryAndType(category, undefined, selectedTraitIds);
    if (trait) {
      result.push(trait);
      selectedTraitIds.push(trait.id);
      remainingTraits--;
    }
  }
  
  // 3. 如果还需要更多特质，随机选择任意类别（包括性格）
  const allCategories: TraitCategory[] = ['Physical', 'Personality', 'Skill', 'Background'];
  while (remainingTraits > 0) {
    // 随机选择一个类别
    const randomCategoryIndex = Math.floor(Math.random() * allCategories.length);
    const category = allCategories[randomCategoryIndex];
    
    const trait = getRandomTraitFromCategoryAndType(category, undefined, selectedTraitIds);
    if (trait) {
      result.push(trait);
      selectedTraitIds.push(trait.id);
      remainingTraits--;
    } else {
      // 如果某个类别没有可选特质，从列表中移除
      allCategories.splice(randomCategoryIndex, 1);
      
      // 如果没有任何可选类别，就退出循环
      if (allCategories.length === 0) break;
    }
  }
  
  return result;
} 