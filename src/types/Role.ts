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

// 角色个性系统（AI性格特质）
export interface PersonalityTraits {
  energy: number; // -100~100，精力（低能量-高能量）
  bravery: number; // -100~100，胆量（胆小-勇敢）
  compassion: number; // -100~100，怜悯（冷酷-悲悯）
  greed: number; // -100~100，贪婪（无欲-贪婪）
  honor: number; // -100~100，荣誉（卑鄙-荣誉）
  rationality: number; // -100~100，理性（感性-理性）
  sociability: number; // -100~100，社交（孤僻-外向）
  vengefulness: number; // -100~100，报复（宽恕-记恨）
  zealotry: number; // -100~100，狂热（冷漠-狂热）
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
  // AI性格特质（用户不可见）
  aiPersonality: PersonalityTraits;
} 