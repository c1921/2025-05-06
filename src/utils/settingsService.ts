/**
 * 设置服务
 * 负责管理应用的所有设置项，包括存储、读取和通知变更
 */

// 定义设置项接口
export interface AppSettings {
  showAvatars: boolean;
  autoAssignTasks: boolean;
  // 未来可以在这里添加更多的设置项
}

// 默认设置
const defaultSettings: AppSettings = {
  showAvatars: true,
  autoAssignTasks: true
};

// 事件名称常量
const SETTINGS_CHANGED_EVENT = 'settingsChanged';

/**
 * 获取设置项
 * @returns 当前应用设置
 */
export function getSettings(): AppSettings {
  const settings: AppSettings = { ...defaultSettings };
  
  // 从本地存储获取各项设置
  Object.keys(defaultSettings).forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      // 根据类型转换值
      if (typeof defaultSettings[key as keyof AppSettings] === 'boolean') {
        settings[key as keyof AppSettings] = value === 'true';
      } else {
        settings[key as keyof AppSettings] = value as any;
      }
    }
  });
  
  return settings;
}

/**
 * 更新单个设置项
 * @param key 设置项键名
 * @param value 设置项值
 */
export function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  // 保存到本地存储
  localStorage.setItem(key, String(value));
  
  // 触发设置变更事件
  notifySettingsChanged({ [key]: value });
}

/**
 * 更新多个设置项
 * @param settings 要更新的设置对象
 */
export function updateSettings(settings: Partial<AppSettings>): void {
  // 保存到本地存储
  Object.entries(settings).forEach(([key, value]) => {
    localStorage.setItem(key, String(value));
  });
  
  // 触发设置变更事件
  notifySettingsChanged(settings);
}

/**
 * 通知设置变更
 * @param changedSettings 变更的设置内容
 */
function notifySettingsChanged(changedSettings: Partial<AppSettings>): void {
  document.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT, { 
    detail: changedSettings 
  }));
}

/**
 * 添加设置变更监听器
 * @param listener 监听器函数
 */
export function addSettingsListener(listener: (event: CustomEvent) => void): void {
  document.addEventListener(SETTINGS_CHANGED_EVENT, listener as EventListener);
}

/**
 * 移除设置变更监听器
 * @param listener 监听器函数
 */
export function removeSettingsListener(listener: (event: CustomEvent) => void): void {
  document.removeEventListener(SETTINGS_CHANGED_EVENT, listener as EventListener);
}

/**
 * 初始化设置并触发初始事件
 * 在应用启动时调用此函数
 */
export function initSettings(): void {
  const settings = getSettings();
  notifySettingsChanged(settings);
} 