import type { Skill, SkillType } from '../types/Skill';
import { MIN_SKILL_LEVEL, MAX_SKILL_LEVEL } from '../types/Skill';
import type { Role } from '../types/Role';
import type { TraitEffectsMap } from '../types/Trait';
import { traitEffectsMap } from './traitEffects';
import skillsData from '../data/skills.json';

// 从JSON导入技能数据
const {
  combatSkills,
  magicSkills,
  survivalSkills,
  socialSkills,
  craftingSkills
} = skillsData as {
  combatSkills: Skill[];
  magicSkills: Skill[];
  survivalSkills: Skill[];
  socialSkills: Skill[];
  craftingSkills: Skill[];
};

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
    const bonusLevel = traitIds.reduce((total, traitId) => {
      const effects = effectsMap[traitId] || [];
      const effect = effects.find(e => e.skillId === skill.id);
      return total + (effect?.value ?? 0);
    }, 0);
    
    return {
      ...skill,
      bonusLevel
    };
  });
} 