/**
 * 角色头像生成工具
 * 
 * 使用DiceBear API为角色生成符合其性别和特性的头像
 */
import type { Role } from '../types/Role';

// 辅助函数：将数组转换为逗号分隔的字符串
const toCommaSeparated = (arr: string[]) => arr.join(',');

/**
 * 根据角色性别获取适合的发型选项
 */
function getTopOptions(gender: string): string[] {
  if (gender === 'Female') {
    // 女性可用发型
    return [
      'bigHair', 'bob', 'bun', 'curly', 'curvy', 'dreads', 'frida',
      'froBand', 'longButNotTooLong', 'miaWallace', 'shaggyMullet',
      'shavedSides', 'straight01', 'straight02', 'straightAndStrand'
    ];
  } else {
    // 男性可用发型
    return [
      'dreads', 'dreads01', 'dreads02', 'frizzle', 'fro', 'shaggy',
      'shortCurly', 'shortFlat', 'shortRound', 'shortWaved',
      'theCaesar', 'theCaesarAndSidePart'
    ];
  }
}

/**
 * 获取允许的嘴部表情列表
 */
function getMouthOptions(): string[] {
  return [
    'concerned', 'default', 'disbelief', 'eating', 
    'sad', 'serious', 'smile', 'twinkle'
  ];
}

/**
 * 获取允许的眼睛样式列表
 */
function getEyesOptions(): string[] {
  return [
    'default', 'eyeRoll', 'happy', 'side', 
    'squint', 'surprised', 'wink'
  ];
}

/**
 * 获取允许的配件列表
 */
function getAccessoriesOptions(): string[] {
  return [
    'kurt', 'prescription01', 'prescription02',
    'round', 'sunglasses', 'wayfarers'
  ];
}

/**
 * 生成角色头像URL
 * @param role 角色数据
 * @returns DiceBear API URL
 */
export function generateAvatarUrl(role: Role): string {
  // 使用avataaars风格，将角色ID作为种子
  const style = 'avataaars';
  const seed = encodeURIComponent(role.id);
  
  // 定义所有选项数组
  const optionsArrays = {
    top: getTopOptions(role.gender),
    mouth: getMouthOptions(),
    eyes: getEyesOptions(),
    accessories: getAccessoriesOptions()
  };
  
  // 将所有数组转换为逗号分隔的字符串
  const processedOptions = Object.fromEntries(
    Object.entries(optionsArrays).map(([key, value]) => [key, toCommaSeparated(value)])
  );
  
  // 设置参数
  const options = {
    seed,
    ...processedOptions,
    facialHairProbability: role.gender === 'Female' ? 0 : 50,
    size: 100
  };
  
  // 构建URL查询参数
  let queryParams = '';
  for (const [key, value] of Object.entries(options)) {
    if (queryParams) queryParams += '&';
    queryParams += `${key}=${encodeURIComponent(value as string)}`;
  }
  
  // 返回完整的DiceBear API URL
  return `https://api.dicebear.com/9.x/${style}/svg?${queryParams}`;
} 