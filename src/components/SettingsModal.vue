<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSettings, updateSetting } from '../utils/settingsService';

// 角色头像显示设置
const showAvatars = ref(true);

// 切换头像显示状态
const toggleAvatarDisplay = () => {
  showAvatars.value = !showAvatars.value;
  // 使用设置服务更新设置
  updateSetting('showAvatars', showAvatars.value);
};

// 组件挂载时初始化设置
onMounted(() => {
  // 从设置服务获取设置
  const settings = getSettings();
  showAvatars.value = settings.showAvatars;
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
          <div class="space-y-4">
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
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-overlay="#settings-modal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template> 