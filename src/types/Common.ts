// 基础类型定义
export type ID = string;

// 基础接口
export interface BaseEntity {
  readonly id: ID;
  readonly name: string;
  readonly description: string;
}

// 效果接口
export interface Effect {
  readonly value: number;
  readonly description: string;
}

// 分组接口
export interface Group<T> {
  readonly id: ID;
  readonly items: readonly T[];
}

// 好感度范围
export const MIN_FAVOR = -100;
export const MAX_FAVOR = 100;
export const DEFAULT_FAVOR = 0;

// 好感度等级
export type FavorLevel = 
  | 'Hostile'
  | 'Unfriendly'
  | 'Neutral'
  | 'Friendly'
  | 'Trusted'
  | 'Admired'
  | 'Devoted';

// 好感度等级显示名称
export const FAVOR_LEVEL_NAMES: Record<FavorLevel, string> = {
  Hostile: '敌对',
  Unfriendly: '不友好',
  Neutral: '中立',
  Friendly: '友好',
  Trusted: '信任',
  Admired: '崇拜',
  Devoted: '忠诚'
};

// 好感度等级阈值
export const FAVOR_THRESHOLDS: Record<FavorLevel, number> = {
  Hostile: MIN_FAVOR,
  Unfriendly: -50,
  Neutral: -10,
  Friendly: 10,
  Trusted: 40,
  Admired: 70,
  Devoted: 90
}; 