// 基础类型定义
export type ID = number;

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