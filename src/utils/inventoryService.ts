import { ref } from 'vue';
import type { ID } from '../types/Common';
import type { InventoryItem, BaseItem, Item } from '../types/Item';
import { createItem } from '../types/Item';

// 初始库存数据
const defaultInventory: InventoryItem[] = [
  { itemId: 'iron_sword', quantity: 1 },
  { itemId: 'leather_armor', quantity: 1 },
  { itemId: 'healing_potion', quantity: 5 },
  { itemId: 'iron_ore', quantity: 10 },
  { itemId: 'ancient_scroll', quantity: 1 },
  { itemId: 'lucky_charm', quantity: 1 },
  { itemId: 'wood', quantity: 25 },
  { itemId: 'stone', quantity: 30 },
  { itemId: 'food', quantity: 120 },
  { itemId: 'steel', quantity: 8 },
  { itemId: 'leather', quantity: 15 },
  { itemId: 'cloth', quantity: 20 }
];

// 库存状态
const inventory = ref<InventoryItem[]>(JSON.parse(JSON.stringify(defaultInventory)));

// 获取物品数量
export function getItemQuantity(itemId: ID): number {
  const inventoryItem = inventory.value.find(item => item.itemId === itemId);
  return inventoryItem ? inventoryItem.quantity : 0;
}

// 设置物品数量
export function setItemQuantity(itemId: ID, quantity: number): void {
  const inventoryItem = inventory.value.find(item => item.itemId === itemId);
  
  if (inventoryItem) {
    inventoryItem.quantity = Math.max(0, quantity);
  } else if (quantity > 0) {
    inventory.value.push({ itemId, quantity });
  }
}

// 增加物品数量
export function addItemQuantity(itemId: ID, amount: number): void {
  const currentQuantity = getItemQuantity(itemId);
  setItemQuantity(itemId, currentQuantity + amount);
}

// 减少物品数量
export function removeItemQuantity(itemId: ID, amount: number): void {
  const currentQuantity = getItemQuantity(itemId);
  setItemQuantity(itemId, currentQuantity - amount);
}

// 合并基础物品和库存数量
export function mergeItemsWithInventory(baseItems: BaseItem[]): Item[] {
  return baseItems.map(baseItem => {
    const quantity = getItemQuantity(baseItem.id);
    return createItem(baseItem, quantity);
  });
}

// 重置库存到默认状态
export function resetInventory(): void {
  inventory.value = JSON.parse(JSON.stringify(defaultInventory));
}

// 导出库存响应式对象
export function useInventory() {
  return {
    inventory,
    getItemQuantity,
    setItemQuantity,
    addItemQuantity,
    removeItemQuantity,
    resetInventory
  };
} 