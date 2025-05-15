import type { Trait, TraitCategory, TraitSubType, PersonalityTraitType } from '../types/Trait';
import traitsData from '../data/traits.json';

// 定义特质组类型
interface TraitGroup {
  id: string;
  traits: Trait[];
}

// 辅助函数：将特质数据的ID转换为字符串
function convertTraits(traits: any[]): Trait[] {
  return traits.map(trait => ({
    ...trait,
    id: String(trait.id)
  }));
}

// 辅助函数：转换特质组数据
function convertTraitGroups(groups: any[]): TraitGroup[] {
  return groups.map(group => ({
    id: String(group.id),
    traits: convertTraits(group.traits)
  }));
}

// 从JSON导入特质数据并转换ID
const rawData = traitsData as any;
const physicalTraits = convertTraits(rawData.physicalTraits);
const personalityTraitGroups = convertTraitGroups(rawData.personalityTraitGroups);
const skillTraits = convertTraits(rawData.skillTraits);
const backgroundTraits = convertTraits(rawData.backgroundTraits);

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
function getTraitGroup(traitId: string): TraitGroup | undefined {
  return personalityTraitGroups.find(group => 
    group.traits.some(trait => trait.id === traitId)
  );
}

/**
 * 检查特质是否与已选特质存在冲突
 */
function hasConflict(traitId: string, selectedTraitIds: string[]): boolean {
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
  selectedTraitIds: string[] = []
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
  const selectedTraitIds: string[] = [];
  
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