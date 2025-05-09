import type { BaseEntity, ID } from './Common';

// 物品类别常量
export const ItemCategory = {
  Weapon: 'weapon',
  Armor: 'armor',
  Consumable: 'consumable',
  Material: 'material',
  Quest: 'quest',
  Miscellaneous: 'miscellaneous'
} as const;

export type ItemCategory = typeof ItemCategory[keyof typeof ItemCategory];

// 物品类别显示名称
export const ITEM_CATEGORY_NAMES: Record<ItemCategory, string> = {
  [ItemCategory.Weapon]: 'Weapon',
  [ItemCategory.Armor]: 'Armor',
  [ItemCategory.Consumable]: 'Consumable',
  [ItemCategory.Material]: 'Material',
  [ItemCategory.Quest]: 'Quest Item',
  [ItemCategory.Miscellaneous]: 'Miscellaneous'
};

// 基础物品接口
export interface BaseItem extends BaseEntity {
  readonly value: number;
  readonly category: ItemCategory;
}

// 库存物品接口（带数量）
export interface InventoryItem {
  readonly itemId: ID;
  quantity: number;
}

// 完整物品接口（包含基础信息和数量）
export interface Item extends BaseItem {
  readonly quantity: number;
}

// 创建基础物品的工厂函数
export function createBaseItem(
  id: ID,
  name: string,
  description: string,
  value: number,
  category: ItemCategory
): BaseItem {
  return {
    id,
    name,
    description,
    value,
    category
  };
}

// 创建库存物品的工厂函数
export function createInventoryItem(
  itemId: ID,
  quantity: number
): InventoryItem {
  return {
    itemId,
    quantity
  };
}

// 合并基础物品和库存数量，创建完整物品
export function createItem(
  baseItem: BaseItem,
  quantity: number
): Item {
  return {
    ...baseItem,
    quantity
  };
} 