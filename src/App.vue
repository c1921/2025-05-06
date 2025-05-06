<script setup lang="ts">
import RoleList from './components/RoleList.vue';
</script>

<template>
  <div class="min-h-screen">
    <header class="shadow-md">
      <div class="container mx-auto px-4 py-5 text-center">
        <h1 class="text-2xl font-bold">Role Management System</h1>
      </div>
    </header>
    <main class="container mx-auto px-4 py-5">
      <RoleList />
    </main>
  </div>
</template>
