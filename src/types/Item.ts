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

// 物品接口
export interface Item extends BaseEntity {
  readonly quantity: number;
  readonly value: number;
  readonly category: ItemCategory;
}

// 创建物品的工厂函数
export function createItem(
  id: ID,
  name: string,
  description: string,
  quantity: number,
  value: number,
  category: ItemCategory
): Item {
  return {
    id,
    name,
    description,
    quantity,
    value,
    category
  };
} 