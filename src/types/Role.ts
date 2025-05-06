import type { Trait } from './Trait';
import type { Skill, SkillType } from './Skill';
import type { ID } from './Common';

// 好感度关系
export interface FavorRelation {
  targetId: ID;
  value: number;
}

// 角色类型
export interface Role {
  id: ID;
  name: string;
  age: number;
  gender: string;
  traits: Trait[];
  skills: Skill[];
  // 好感度关系列表
  favorRelations: FavorRelation[];
  // 角色专长类型
  specialtyType?: SkillType;
} 