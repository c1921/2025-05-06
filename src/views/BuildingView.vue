<script setup lang="ts">
// 建筑视图组件，暂时使用占位内容
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="card card-bordered">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold mb-4">Buildings Management</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 建筑占位卡片 -->
          <div class="card shadow-sm border hover:shadow-md transition-all">
            <div class="card-body p-4">
              <h3 class="card-title text-lg">Town Hall</h3>
              <p class="text-sm text-gray-600">Administrative center for your village</p>
              <div class="mt-2">
                <span class="badge badge-primary">Level 1</span>
                <span class="badge badge-outline ml-2">Core</span>
              </div>
            </div>
          </div>
          
          <div class="card shadow-sm border hover:shadow-md transition-all">
            <div class="card-body p-4">
              <h3 class="card-title text-lg">Farm</h3>
              <p class="text-sm text-gray-600">Produces food for your population</p>
              <div class="mt-2">
                <span class="badge badge-primary">Level 2</span>
                <span class="badge badge-outline ml-2">Resource</span>
              </div>
            </div>
          </div>
          
          <div class="card shadow-sm border hover:shadow-md transition-all">
            <div class="card-body p-4">
              <h3 class="card-title text-lg">Barracks</h3>
              <p class="text-sm text-gray-600">Trains military units</p>
              <div class="mt-2">
                <span class="badge badge-primary">Level 1</span>
                <span class="badge badge-outline ml-2">Military</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="alert alert-info mt-6">
          <div class="flex">
            <span class="icon-[tabler--info-circle] size-5 me-2"></span>
            <p>This is a placeholder for the Buildings Management system. Actual implementation will be added in a future update.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 