import type { Trait } from './Trait';
import type { Skill, SkillType } from './Skill';
import type { ID } from './Common';

// 好感度关系
export interface FavorRelation {
  targetId: ID;
  value: number;
}

// 政治倾向
export interface PoliticalStance {
  economic: number; // 0-100，经济（经济平等 vs 自由市场）
  diplomatic: number; // 0-100，外交（国际主义-民族主义）
  civil: number; // 0-100，公民自由（自由主义-威权主义）
  societal: number; // 0-100，社会价值观（进步-传统）
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
  // 政治倾向
  politicalStance: PoliticalStance;
} 