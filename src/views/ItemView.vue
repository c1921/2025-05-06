<script setup lang="ts">
import ItemList from '../components/ItemList.vue';
</script>

<template>
  <div class="item-view">
    <div class="card w-full">
      <div class="card-body">
        <ItemList title="Item Management" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-view {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
</style> 