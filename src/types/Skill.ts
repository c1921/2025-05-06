import type { BaseEntity, Effect } from './Common';

// 技能类型
export type SkillType = 'Combat' | 'Magic' | 'Survival' | 'Social' | 'Crafting';

// 技能等级范围: 0-20级
export const MIN_SKILL_LEVEL = 0;
export const MAX_SKILL_LEVEL = 20;

// 技能接口
export interface Skill extends BaseEntity {
  readonly type: SkillType;
  readonly baseLevel: number;
  readonly bonusLevel: number;
  readonly description: string;
}

// 技能效果接口
export interface SkillEffect extends Effect {
  readonly skillId: number;
}

// 技能效果映射
export type SkillEffectsMap = {
  readonly [key: number]: readonly SkillEffect[];
};

// 获取技能等级描述
export function getSkillLevelDescription(level: number): string {
  if (level <= 0) return 'Untrained';
  if (level <= 4) return 'Novice';
  if (level <= 8) return 'Apprentice';
  if (level <= 12) return 'Adept';
  if (level <= 16) return 'Expert';
  return 'Master';
}

// 计算有效等级（基础等级+加成等级，限制在范围内）
export function getEffectiveLevel(skill: Skill): number {
  const effectiveLevel = skill.baseLevel + skill.bonusLevel;
  return Math.min(Math.max(effectiveLevel, MIN_SKILL_LEVEL), MAX_SKILL_LEVEL);
} 