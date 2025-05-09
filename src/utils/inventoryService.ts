import { ref } from 'vue';
import type { ID } from '../types/Common';
import type { InventoryItem, BaseItem, Item } from '../types/Item';
import { createItem } from '../types/Item';

// 初始库存数据
const defaultInventory: InventoryItem[] = [
  { itemId: 1, quantity: 1 },  // Iron Sword
  { itemId: 2, quantity: 1 },  // Leather Armor
  { itemId: 3, quantity: 5 },  // Healing Potion
  { itemId: 4, quantity: 10 }, // Iron Ore
  { itemId: 5, quantity: 1 },  // Ancient Scroll
  { itemId: 6, quantity: 1 },  // Lucky Charm
  { itemId: 7, quantity: 25 }, // Wood
  { itemId: 8, quantity: 30 }, // Stone
  { itemId: 9, quantity: 12 }, // Food
  { itemId: 10, quantity: 8 }, // Steel
  { itemId: 11, quantity: 15 }, // Leather
  { itemId: 12, quantity: 20 }  // Cloth
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