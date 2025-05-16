<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSettings, updateSetting } from '../utils/settingsService';
import { saveGame, loadGame, deleteSave, hasSavedGame, getLastSaveTime, formatSaveTime } from '../utils/saveService';

// 角色头像显示设置
const showAvatars = ref(true);

// 自动分配任务设置
const autoAssignTasks = ref(true);

// 是否保存游戏
const savedGameExists = ref(false);

// 上次保存时间
const lastSaveTime = ref<string>('');

// 加载游戏
const isLoading = ref(false);

// 保存游戏
const handleSaveGame = () => {
  isLoading.value = true;
  setTimeout(() => {
    const success = saveGame();
    isLoading.value = false;
    if (success) {
      savedGameExists.value = true;
      updateLastSaveTime();
    }
  }, 200); // 模拟加载时间以显示保存状态
};

// 加载游戏
const handleLoadGame = () => {
  isLoading.value = true;
  setTimeout(() => {
    const success = loadGame();
    isLoading.value = false;
    if (success) {
      // 关闭设置弹窗
      const modal = document.getElementById('settings-modal');
      if (modal) {
        modal.classList.remove('overlay-open');
        modal.classList.add('hidden');
      }
    }
  }, 200); // 模拟加载时间以显示加载状态
};

// 删除保存
const handleDeleteSave = () => {
  if (confirm('确定要删除保存游戏吗？删除后无法恢复。')) {
    deleteSave();
    savedGameExists.value = false;
    lastSaveTime.value = '';
  }
};

// 更新上次保存时间
const updateLastSaveTime = () => {
  const timestamp = getLastSaveTime();
  if (timestamp) {
    lastSaveTime.value = formatSaveTime(timestamp);
  }
};

// 切换头像显示状态
const toggleAvatarDisplay = () => {
  showAvatars.value = !showAvatars.value;
  // 使用设置服务更新设置
  updateSetting('showAvatars', showAvatars.value);
};

// 切换自动分配任务状态
const toggleAutoAssignTasks = () => {
  autoAssignTasks.value = !autoAssignTasks.value;
  // 使用设置服务更新设置
  updateSetting('autoAssignTasks', autoAssignTasks.value);
};

// 组件挂载时初始化设置
onMounted(() => {
  // 从设置服务获取设置
  const settings = getSettings();
  showAvatars.value = settings.showAvatars;
  autoAssignTasks.value = settings.autoAssignTasks;
  
  // 检查是否有保存游戏
  savedGameExists.value = hasSavedGame();
  updateLastSaveTime();
});
</script>

<template>
  <!-- 设置弹窗 -->
  <div id="settings-modal" class="overlay modal overlay-open:opacity-100 hidden overlay-open:duration-300" role="dialog" tabindex="-1">
    <div class="modal-dialog overlay-open:opacity-100 overlay-open:duration-300">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">设置</h3>
          <button type="button" class="btn btn-text btn-circle btn-sm absolute end-3 top-3" aria-label="Close" data-overlay="#settings-modal">
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>
        <div class="modal-body">
          <!-- 设置选项列表 -->
          <div class="space-y-5">
            <!-- 游戏保存管理 -->
            <div class="border-b pb-4">
              <h3 class="font-medium mb-3">游戏保存管理</h3>
              
              <!-- 上次保存时间 -->
              <div v-if="savedGameExists" class="text-sm text-base-400 mb-3">
                上次保存时间：{{ lastSaveTime }}
              </div>
              
              <div class="flex items-center gap-2">
                <!-- 保存游戏按钮 -->
                <button 
                  class="btn btn-primary" 
                  :disabled="isLoading"
                  @click="handleSaveGame"
                >
                  <span class="icon-[tabler--device-floppy] size-5 me-1" v-if="!isLoading"></span>
                  <span class="icon-[tabler--loader-2] size-5 me-1 animate-spin" v-else></span>
                  保存游戏
                </button>
                
                <!-- 加载游戏按钮 -->
                <button 
                  class="btn btn-secondary" 
                  :disabled="!savedGameExists || isLoading"
                  @click="handleLoadGame"
                >
                  <span class="icon-[tabler--history] size-5 me-1" v-if="!isLoading"></span>
                  <span class="icon-[tabler--loader-2] size-5 me-1 animate-spin" v-else></span>
                  加载游戏
                </button>
                
                <!-- 删除保存按钮 -->
                <button 
                  class="btn btn-outline btn-error" 
                  :disabled="!savedGameExists || isLoading"
                  @click="handleDeleteSave"
                >
                  <span class="icon-[tabler--trash] size-5"></span>
                </button>
              </div>
            </div>
            
            <!-- 角色头像显示设置 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="icon-[tabler--user-circle] size-7"></span>
                <input 
                  type="checkbox" 
                  class="switch switch-primary" 
                  id="toggle-avatar" 
                  :checked="showAvatars"
                  @change="toggleAvatarDisplay"
                />
                <label class="label-text text-base" for="toggle-avatar">显示角色头像</label>
              </div>
            </div>
            
            <!-- 自动分配任务设置 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="icon-[tabler--robot] size-7"></span>
                <input 
                  type="checkbox" 
                  class="switch switch-primary" 
                  id="toggle-auto-assign" 
                  :checked="autoAssignTasks"
                  @change="toggleAutoAssignTasks"
                />
                <label class="label-text text-base" for="toggle-auto-assign">自动分配任务</label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-overlay="#settings-modal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template> 