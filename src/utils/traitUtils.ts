import type { Trait, TraitCategory, TraitSubType } from '../types/Trait';

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

// 性格特质
const personalityTraits: Trait[] = [
  // 品性
  { id: 8, name: 'Honest', description: 'Values truth and integrity', category: 'Personality', subType: 'Character' },
  { id: 9, name: 'Brave', description: 'Courageous in the face of fear', category: 'Personality', subType: 'Character' },
  // 气质
  { id: 10, name: 'Calm', description: 'Composed under pressure', category: 'Personality', subType: 'Temperament' },
  { id: 11, name: 'Passionate', description: 'Intense emotional responses', category: 'Personality', subType: 'Temperament' },
  // 社交
  { id: 12, name: 'Charming', description: 'Naturally likable and appealing', category: 'Personality', subType: 'Social' },
  { id: 13, name: 'Reserved', description: 'Private and self-contained', category: 'Personality', subType: 'Social' },
  { id: 14, name: 'Confident', description: 'Self-assured and positive', category: 'Personality', subType: 'Social' }
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
 * 为角色生成随机特质
 * @param count 要生成的特质数量
 * @returns 随机选择的特质数组
 */
export function generateRandomTraits(count: number): Trait[] {
  // 打乱所有特质
  const shuffled = [...allTraits].sort(() => 0.5 - Math.random());
  
  // 返回前count个元素
  return shuffled.slice(0, Math.min(count, allTraits.length));
}

/**
 * 生成平衡的随机特质，确保每个类别各有一个
 */
export function generateBalancedTraits(): Trait[] {
  const result: Trait[] = [];
  
  // 从每个类别获取一个随机特质
  const categories: TraitCategory[] = ['Physical', 'Personality', 'Skill', 'Background'];
  
  categories.forEach(category => {
    const traitsInCategory = getTraitsByCategory(category);
    const randomIndex = Math.floor(Math.random() * traitsInCategory.length);
    result.push(traitsInCategory[randomIndex]);
  });
  
  return result;
} 