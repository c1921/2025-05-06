import type { TraitEffectsMap } from '../types/TraitEffect';

// 特质效果配置表
export const traitEffectsMap: TraitEffectsMap = {
  // 身体特质效果
  
  // Strong特质 - ID:5, 增强战斗能力
  5: [
    { skillId: 3, value: 5, description: '力量增强徒手搏斗能力' }, // Hand-to-hand +5
    { skillId: 13, value: 2, description: '力量有助于锻造工作' }, // Smithing +2
  ],
  
  // Athletic特质 - ID:3, 运动能力提升
  3: [
    { skillId: 3, value: 2, description: '灵活的身体增强格斗能力' }, // Hand-to-hand +2
    { skillId: 9, value: 3, description: '运动能力有助于野外导航' }, // Navigation +3
  ],
  
  // 性格特质效果
  
  // Calm特质 - ID:10, 冷静自制
  10: [
    { skillId: 2, value: 3, description: '冷静的心态提高射击精度' }, // Archery +3
    { skillId: 4, value: 2, description: '精神集中增强元素魔法控制' }, // Elemental Magic +2
  ],
  
  // Passionate特质 - ID:11, 热情奔放
  11: [
    { skillId: 6, value: 4, description: '丰富的情感增强幻术效果' }, // Illusion +4
    { skillId: 10, value: 2, description: '热情帮助说服他人' }, // Persuasion +2
    { skillId: 2, value: -2, description: '情绪波动影响射击精度' }, // Archery -2
  ],
  
  // 社交特质效果
  
  // Charming特质 - ID:12, 魅力四射
  12: [
    { skillId: 10, value: 5, description: '天生的魅力极大增强说服力' }, // Persuasion +5
    { skillId: 12, value: 3, description: '魅力有助于欺骗' }, // Deception +3
  ],
  
  // Reserved特质 - ID:13, 内敛保守
  13: [
    { skillId: 11, value: -3, description: '内敛性格削弱恐吓效果' }, // Intimidation -3
    { skillId: 8, value: 2, description: '专注力有助于寻找资源' }, // Foraging +2
  ],
  
  // 技能特质效果
  
  // Computer Expert特质 - ID:15, 技术专家
  15: [
    { skillId: 15, value: 4, description: '技术知识增强工程能力' }, // Engineering +4
  ],
  
  // Scientific特质 - ID:16, 科学头脑
  16: [
    { skillId: 14, value: 5, description: '科学方法大幅提升炼金术水平' }, // Alchemy +5
    { skillId: 15, value: 3, description: '科学思维增强工程技能' }, // Engineering +3
  ],
  
  // 背景特质效果
  
  // Military特质 - ID:24, 军事背景
  24: [
    { skillId: 1, value: 4, description: '军事训练增强剑术' }, // Swordsmanship +4
    { skillId: 2, value: 3, description: '军事训练提高射击能力' }, // Archery +3
    { skillId: 7, value: 2, description: '军事经历提升追踪技能' }, // Tracking +2
  ],
  
  // Traditional特质 - ID:27, 传统背景
  27: [
    { skillId: 13, value: 3, description: '传统工艺知识提升锻造能力' }, // Smithing +3
    { skillId: 5, value: 2, description: '传统医学知识增强治疗能力' }, // Healing +2
    { skillId: 15, value: -2, description: '传统思维阻碍现代工程创新' }, // Engineering -2
  ],
};

/**
 * 获取特质对指定技能的效果描述
 * @param traitId 特质ID
 * @param skillId 技能ID
 */
export function getTraitEffectDescription(traitId: number, skillId: number): string | null {
  const effects = traitEffectsMap[traitId] || [];
  const effect = effects.find(e => e.skillId === skillId);
  
  if (!effect) return null;
  
  const sign = effect.value > 0 ? '+' : '';
  return `${effect.description} (${sign}${effect.value})`;
}

/**
 * 获取特质的所有效果描述
 * @param traitId 特质ID
 */
export function getAllTraitEffectsDescription(traitId: number): string[] {
  const effects = traitEffectsMap[traitId] || [];
  return effects.map(effect => {
    const sign = effect.value > 0 ? '+' : '';
    return `${effect.description} (${sign}${effect.value})`;
  });
} 