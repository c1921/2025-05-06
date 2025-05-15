import type { Role, PoliticalStance, PersonalityTraits } from '../types/Role';
import type { Skill, SkillType } from '../types/Skill';
import { generateCharacterTraits } from './traitUtils';
import { generateSpecializedSkills, applyTraitEffectsToSkills } from './skillUtils';
import { initializeFavorRelations } from './favorUtils';
import { applyTraitFavorEffectsToRoles } from './traitFavorUtils';
import { applyPoliticalFavorEffectsToRoles } from './politicalFavorUtils';
import { applyTraitPersonalityEffects } from './traitPersonalityEffects';
import { v4 as uuidv4 } from 'uuid';

// 英文名字列表
const maleNames = ['John', 'David', 'Michael', 'James', 'Robert', 'William', 'Thomas', 'Christopher'];
const femaleNames = ['Emma', 'Olivia', 'Sarah', 'Jennifer', 'Emily', 'Jessica', 'Elizabeth', 'Sophia'];

// 专长类型列表
const specialtyTypes: SkillType[] = ['Combat', 'Magic', 'Survival', 'Social', 'Crafting'];

/**
 * 生成随机政治倾向
 * 每个维度随机生成0-100之间的值
 * @returns 随机生成的政治倾向
 */
function generateRandomPoliticalStance(): PoliticalStance {
  // 辅助函数：生成0-100之间的随机数
  const getRandomValue = () => {
    return Math.floor(Math.random() * 101);
  };

  return {
    economic: getRandomValue(),
    diplomatic: getRandomValue(),
    civil: getRandomValue(),
    societal: getRandomValue()
  };
}

/**
 * 生成AI性格特质（所有值默认为0）
 * 后续通过特质扩展来为不同性格特质赋值
 * @returns 默认的AI性格特质
 */
function generateRandomPersonalityTraits(): PersonalityTraits {
  // 所有性格特质默认为0
  return createDefaultPersonalityTraits();
}

/**
 * 创建默认的AI性格特质（所有值为0）
 * @returns 默认的AI性格特质
 */
function createDefaultPersonalityTraits(): PersonalityTraits {
  return {
    energy: 0,
    bravery: 0,
    compassion: 0,
    greed: 0,
    honor: 0,
    rationality: 0,
    sociability: 0,
    vengefulness: 0,
    zealotry: 0
  };
}

/**
 * 生成一个角色
 * @param name 角色名称
 * @param gender 角色性别
 * @param age 角色年龄
 * @param background 角色背景
 * @param appearance 角色外貌
 * @param specialtyType 角色技能专长类型
 * @returns 生成的角色
 */
export function generateCharacter(
  name: string,
  gender: string,
  age: number,
  specialtyType: SkillType = 'Combat'
): Role {
  // 生成3个不同类型的性格特质
  const traits = generateCharacterTraits(3);
  
  // 生成技能
  const skills = generateSpecializedSkills(specialtyType);
  
  // 创建角色
  const role: Role = {
    id: uuidv4(),
    name,
    gender,
    age,
    traits,
    skills,
    favorRelations: [],
    specialtyType,
    politicalStance: generateRandomPoliticalStance(),
    aiPersonality: createDefaultPersonalityTraits()
  };
  
  // 应用特质效果到技能
  const roleWithSkills = {
    ...role,
    skills: applyTraitEffectsToSkills(role)
  };
  
  // 应用特质效果到AI个性
  return applyTraitPersonalityEffects(roleWithSkills);
}

/**
 * 获取角色的总技能等级
 * @param role 角色
 * @returns 总技能等级
 */
export function getTotalSkillLevel(role: Role): number {
  return role.skills.reduce((total, skill) => total + skill.baseLevel + skill.bonusLevel, 0);
}

/**
 * 计算角色在特定技能类型上的平均等级
 * @param role 角色
 * @param type 技能类型
 * @returns 平均等级
 */
export function getAverageSkillLevelByType(role: Role, type: SkillType): number {
  const skillsOfType = role.skills.filter(skill => skill.type === type);
  if (skillsOfType.length === 0) return 0;
  
  const totalLevel = skillsOfType.reduce(
    (total, skill) => total + skill.baseLevel + skill.bonusLevel, 
    0
  );
  
  return totalLevel / skillsOfType.length;
}

/**
 * 获取角色最高等级的技能
 * @param role 角色
 * @param count 获取的数量
 * @returns 技能数组
 */
export function getTopSkills(role: Role, count: number = 3): Skill[] {
  return [...role.skills]
    .sort((a, b) => 
      (b.baseLevel + b.bonusLevel) - (a.baseLevel + a.bonusLevel)
    )
    .slice(0, count);
}

/**
 * 生成随机角色
 * @returns 生成的角色
 */
export function generateRandomRole(): Role {
  const gender: 'Male' | 'Female' = Math.random() > 0.5 ? 'Male' : 'Female';
  const nameList = gender === 'Male' ? maleNames : femaleNames;
  const randomIndex = Math.floor(Math.random() * nameList.length);
  const name = nameList[randomIndex];
  const age = Math.floor(Math.random() * 50) + 18; // 18-67岁
  
  // 生成特质，确保有三个性格特质并避免矛盾特质
  const traits = generateCharacterTraits(5); // 总共5个特质，包括3个性格特质
  
  // 随机选择一个专长类型
  const specialtyTypeIndex = Math.floor(Math.random() * specialtyTypes.length);
  const specialtyType = specialtyTypes[specialtyTypeIndex];
  
  // 创建角色
  const role: Role = {
    id: uuidv4(),
    name,
    gender,
    age,
    traits,
    skills: generateSpecializedSkills(specialtyType),
    favorRelations: [],
    specialtyType,
    politicalStance: generateRandomPoliticalStance(),
    aiPersonality: generateRandomPersonalityTraits()
  };
  
  // 应用特质效果到技能
  const roleWithSkills = {
    ...role,
    skills: applyTraitEffectsToSkills(role)
  };
  
  // 应用特质效果到AI个性
  return applyTraitPersonalityEffects(roleWithSkills);
}

/**
 * 生成多个随机角色
 * @param count 生成的角色数量
 * @returns 角色数组
 */
export function generateRandomRoles(count: number): Role[] {
  // 先生成所有角色
  const roles: Role[] = [];
  for (let i = 0; i < count; i++) {
    roles.push(generateRandomRole());
  }

  // 为每个角色初始化与其他角色的好感度关系（初始值为0）
  const rolesWithRelations = roles.map(role => {
    const otherRoleIds = roles
      .filter(r => r.id !== role.id)
      .map(r => r.id);
    
    return initializeFavorRelations(role, otherRoleIds);
  });

  // 应用特质好感度影响
  let updatedRoles = applyTraitFavorEffectsToRoles(rolesWithRelations);
  
  // 应用政治立场好感度影响
  updatedRoles = applyPoliticalFavorEffectsToRoles(updatedRoles);
  
  return updatedRoles;
} 