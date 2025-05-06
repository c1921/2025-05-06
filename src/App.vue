<script setup lang="ts">
import RoleList from './components/RoleList.vue';
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Role Management System</h1>
    </header>
    <main>
      <RoleList />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #f7f9fc;
}

.app-container {
  min-height: 100vh;
}

header {
  background-color: #4a6bff;
  color: white;
  padding: 20px 0;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0;
  font-size: 28px;
}

main {
  padding: 20px;
}
</style>
