import { type Item, ItemCategory, createItem } from '../types/Item';
import itemsData from '../data/items.json';

// 从JSON数据加载物品
export function loadItems(): Item[] {
  return itemsData.items.map(item => createItem(
    item.id,
    item.name,
    item.description,
    item.quantity,
    item.value,
    item.category as ItemCategory
  ));
}

// 按类别过滤物品
export function filterItemsByCategory(items: Item[], category: ItemCategory): Item[] {
  return items.filter(item => item.category === category);
}

// 按名称搜索物品
export function findItemsByName(items: Item[], name: string): Item[] {
  const lowerName = name.toLowerCase();
  return items.filter(item => item.name.toLowerCase().includes(lowerName));
}

// 计算物品总价值
export function calculateTotalValue(items: Item[]): number {
  return items.reduce((total, item) => total + (item.value * item.quantity), 0);
}

// 获取物品总数量
export function getTotalQuantity(items: Item[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
} 