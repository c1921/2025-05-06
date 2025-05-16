import type { BaseItem, Item, ItemCategory } from '../types/Item';
import { createBaseItem } from '../types/Item';
import { mergeItemsWithInventory } from './inventoryService';
import itemsData from '../data/items.json';

// 从JSON数据加载基础物品
export function loadBaseItems(): BaseItem[] {
  return itemsData.items.map(item => createBaseItem(
    item.id,
    item.name,
    item.description,
    item.value,
    item.category as ItemCategory
  ));
}

// 加载完整物品（包含数量）
export function loadItems(): Item[] {
  const baseItems = loadBaseItems();
  return mergeItemsWithInventory(baseItems);
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

// 根据ID查找物品
export function findItemById(items: Item[], id: string): Item | undefined {
  return items.find(item => item.id === id);
} 