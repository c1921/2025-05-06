<template>
  <div class="item-list">
    <h2 class="text-xl font-semibold mb-4">{{ title }}</h2>
    
    <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
      <div class="flex items-center gap-3">
        <select v-model="selectedCategory" class="select select-bordered select-sm">
          <option value="">All Categories</option>
          <option v-for="(name, category) in categoryNames" :key="category" :value="category">
            {{ name }}
          </option>
        </select>
        
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="icon-[tabler--search] size-4 text-base-content/50"></span>
          </span>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search items..." 
            class="input input-bordered input-sm pl-10"
          />
        </div>
      </div>
      
      <div class="text-sm text-base-content/70">
        Total <span class="font-semibold">{{ filteredItems.length }}</span> items, 
        Quantity: <span class="font-semibold">{{ totalQuantity }}</span>, 
        Value: <span class="font-semibold">{{ totalValue }}</span>
      </div>
    </div>
    
    <div class="w-full overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total Value</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in filteredItems" 
            :key="item.id" 
            class="row-hover cursor-pointer" 
            @click="selectItem(item)"
          >
            <td>{{ item.name }}</td>
            <td>
              <span class="badge badge-soft" :class="getCategoryBadgeClass(item.category)">
                {{ getCategoryName(item.category) }}
              </span>
            </td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.value }}</td>
            <td>{{ item.quantity * item.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="selectedItem" class="card mt-4 p-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold">{{ selectedItem.name }}</h3>
        <button class="btn btn-circle btn-text btn-sm" @click="selectedItem = null" aria-label="Close details">
          <span class="icon-[tabler--x] size-5"></span>
        </button>
      </div>
      <p class="mb-3">{{ selectedItem.description }}</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <span class="text-sm text-base-content/70">Category:</span>
          <p class="font-medium">{{ getCategoryName(selectedItem.category) }}</p>
        </div>
        <div>
          <span class="text-sm text-base-content/70">Quantity:</span>
          <p class="font-medium">{{ selectedItem.quantity }}</p>
        </div>
        <div>
          <span class="text-sm text-base-content/70">Value:</span>
          <p class="font-medium">{{ selectedItem.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import type { Item } from '../types/Item';
import { ItemCategory, ITEM_CATEGORY_NAMES } from '../types/Item';
import { loadItems, filterItemsByCategory, findItemsByName, calculateTotalValue, getTotalQuantity } from '../utils/itemUtils';

export default defineComponent({
  name: 'ItemList',
  props: {
    title: {
      type: String,
      default: 'Item List'
    }
  },
  setup() {
    const items = ref<Item[]>(loadItems());
    const selectedCategory = ref<string>('');
    const searchQuery = ref<string>('');
    const selectedItem = ref<Item | null>(null);
    
    const filteredItems = computed(() => {
      let result = items.value;
      
      if (selectedCategory.value) {
        result = filterItemsByCategory(result, selectedCategory.value as ItemCategory);
      }
      
      if (searchQuery.value) {
        result = findItemsByName(result, searchQuery.value);
      }
      
      return result;
    });
    
    const totalValue = computed(() => {
      return calculateTotalValue(filteredItems.value);
    });
    
    const totalQuantity = computed(() => {
      return getTotalQuantity(filteredItems.value);
    });
    
    const selectItem = (item: Item) => {
      selectedItem.value = item;
    };
    
    const getCategoryName = (category: ItemCategory): string => {
      return ITEM_CATEGORY_NAMES[category];
    };
    
    const getCategoryBadgeClass = (category: ItemCategory): string => {
      switch (category) {
        case 'weapon':
          return 'badge-error';
        case 'armor':
          return 'badge-primary';
        case 'consumable':
          return 'badge-success';
        case 'material':
          return 'badge-warning';
        case 'quest':
          return 'badge-info';
        case 'miscellaneous':
        default:
          return 'badge-secondary';
      }
    };
    
    return {
      items,
      selectedCategory,
      searchQuery,
      selectedItem,
      filteredItems,
      totalValue,
      totalQuantity,
      categoryNames: ITEM_CATEGORY_NAMES,
      selectItem,
      getCategoryName,
      getCategoryBadgeClass
    };
  }
});
</script>