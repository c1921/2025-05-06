import type { Role } from '../types/Role';
import type { SkillType } from '../types/Skill';
import { generateBalancedTraits } from './traitUtils';
import { generateSpecializedSkills, applyTraitEffectsToSkills } from './skillUtils';

const maleNames = ['John', 'David', 'Michael', 'James', 'Robert', 'William', 'Thomas', 'Christopher'];
const femaleNames = ['Emma', 'Olivia', 'Sarah', 'Jennifer', 'Emily', 'Jessica', 'Elizabeth', 'Sophia'];

// 专长类型列表
const specialtyTypes: SkillType[] = ['Combat', 'Magic', 'Survival', 'Social', 'Crafting'];

/**
 * 生成随机角色
 */
export function generateRandomRole(id: number): Role {
  const gender: 'Male' | 'Female' = Math.random() > 0.5 ? 'Male' : 'Female';
  const nameList = gender === 'Male' ? maleNames : femaleNames;
  const randomIndex = Math.floor(Math.random() * nameList.length);
  const name = nameList[randomIndex];
  const age = Math.floor(Math.random() * 50) + 18; // 18-67岁
  const traits = generateBalancedTraits(); // 每个角色获得每个类别各一个特质
  
  // 随机选择一个专长类型
  const specialtyTypeIndex = Math.floor(Math.random() * specialtyTypes.length);
  const specialtyType = specialtyTypes[specialtyTypeIndex];
  
  // 生成带有专长偏向的技能集
  let skills = generateSpecializedSkills(specialtyType);
  
  // 创建初始角色
  const role: Role = {
    id,
    name,
    gender,
    age,
    traits,
    skills,
    specialtyType
  };
  
  // 应用特质效果到技能
  role.skills = applyTraitEffectsToSkills(role);

  return role;
}

/**
 * 生成指定数量的随机角色列表
 */
export function generateRandomRoles(count: number): Role[] {
  const roles: Role[] = [];
  for (let i = 0; i < count; i++) {
    roles.push(generateRandomRole(i + 1));
  }
  return roles;
} 