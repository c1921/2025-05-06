import type { Skill, SkillType } from '../types/Skill';
import { MIN_SKILL_LEVEL, MAX_SKILL_LEVEL } from '../types/Skill';
import type { Role } from '../types/Role';
import type { TraitEffectsMap } from '../types/TraitEffect';
import { calculateTraitEffectForSkill } from '../types/TraitEffect';
import { traitEffectsMap } from './traitEffects';

// 战斗技能
const combatSkills: Skill[] = [
  { id: 1, name: 'Swordsmanship', type: 'Combat', baseLevel: 0, bonusLevel: 0, description: 'Skill with swords and bladed weapons' },
  { id: 2, name: 'Archery', type: 'Combat', baseLevel: 0, bonusLevel: 0, description: 'Proficiency with bows and ranged weapons' },
  { id: 3, name: 'Hand-to-hand', type: 'Combat', baseLevel: 0, bonusLevel: 0, description: 'Unarmed combat techniques' }
];

// 魔法技能
const magicSkills: Skill[] = [
  { id: 4, name: 'Elemental Magic', type: 'Magic', baseLevel: 0, bonusLevel: 0, description: 'Control over natural elements' },
  { id: 5, name: 'Healing', type: 'Magic', baseLevel: 0, bonusLevel: 0, description: 'Restoration and recovery magic' },
  { id: 6, name: 'Illusion', type: 'Magic', baseLevel: 0, bonusLevel: 0, description: 'Creation of false sensory impressions' }
];

// 生存技能
const survivalSkills: Skill[] = [
  { id: 7, name: 'Tracking', type: 'Survival', baseLevel: 0, bonusLevel: 0, description: 'Following trails and finding targets' },
  { id: 8, name: 'Foraging', type: 'Survival', baseLevel: 0, bonusLevel: 0, description: 'Finding food and resources in the wild' },
  { id: 9, name: 'Navigation', type: 'Survival', baseLevel: 0, bonusLevel: 0, description: 'Finding direction and creating maps' }
];

// 社交技能
const socialSkills: Skill[] = [
  { id: 10, name: 'Persuasion', type: 'Social', baseLevel: 0, bonusLevel: 0, description: 'Convincing others through logic and appeal' },
  { id: 11, name: 'Intimidation', type: 'Social', baseLevel: 0, bonusLevel: 0, description: 'Using fear or strength to influence others' },
  { id: 12, name: 'Deception', type: 'Social', baseLevel: 0, bonusLevel: 0, description: 'Lying and misleading convincingly' }
];

// 制作技能
const craftingSkills: Skill[] = [
  { id: 13, name: 'Smithing', type: 'Crafting', baseLevel: 0, bonusLevel: 0, description: 'Creation and repair of metal items' },
  { id: 14, name: 'Alchemy', type: 'Crafting', baseLevel: 0, bonusLevel: 0, description: 'Brewing potions and chemical compounds' },
  { id: 15, name: 'Engineering', type: 'Crafting', baseLevel: 0, bonusLevel: 0, description: 'Building and designing complex structures' }
];

// 默认技能列表
export const defaultSkills: Skill[] = [
  ...combatSkills,
  ...magicSkills,
  ...survivalSkills,
  ...socialSkills,
  ...craftingSkills
];

/**
 * 按类型获取技能
 */
export function getSkillsByType(type: SkillType): Skill[] {
  return defaultSkills.filter(skill => skill.type === type);
}

/**
 * 生成随机技能等级
 * 使用偏向低级别的概率分布
 */
export function generateRandomSkillLevel(): number {
  // 使用指数分布，大多数技能等级较低，少数技能等级较高
  const randomValue = Math.random();
  // 将0-1的值转换为偏向较低数值的0-20范围
  const level = Math.floor(Math.pow(randomValue, 1.5) * (MAX_SKILL_LEVEL + 1));
  return Math.min(Math.max(level, MIN_SKILL_LEVEL), MAX_SKILL_LEVEL);
}

/**
 * 为角色生成随机技能集
 * 复制默认技能列表并随机分配等级
 */
export function generateRandomSkills(): Skill[] {
  return defaultSkills.map(skill => ({
    ...skill,
    baseLevel: generateRandomSkillLevel(),
    bonusLevel: 0
  }));
}

/**
 * 为角色生成专长技能集（特定类型的技能等级更高）
 * @param specialtyType 角色专长的技能类型
 */
export function generateSpecializedSkills(specialtyType: SkillType): Skill[] {
  return defaultSkills.map(skill => {
    const isSpecialty = skill.type === specialtyType;
    
    // 专长类型的技能有更高的基础等级和上限
    const baseLevel = isSpecialty ? 5 : 0;
    const maxBoost = isSpecialty ? 15 : 10;
    
    // 生成随机加成
    const randomBoost = Math.floor(Math.random() * maxBoost);
    
    // 计算最终等级，确保不超过最大值
    const level = Math.min(baseLevel + randomBoost, MAX_SKILL_LEVEL);
    
    return {
      ...skill,
      baseLevel: level,
      bonusLevel: 0
    };
  });
}

/**
 * 应用特质效果到角色技能
 * @param role 角色
 * @param effectsMap 特质效果映射表
 * @returns 更新后的技能列表
 */
export function applyTraitEffectsToSkills(role: Role, effectsMap: TraitEffectsMap = traitEffectsMap): Skill[] {
  // 获取角色所有特质的ID列表
  const traitIds = role.traits.map(trait => trait.id);
  
  // 更新每个技能的加成
  return role.skills.map(skill => {
    // 计算特质对当前技能的总效果
    const bonusLevel = calculateTraitEffectForSkill(effectsMap, traitIds, skill.id);
    
    return {
      ...skill,
      bonusLevel
    };
  });
} 