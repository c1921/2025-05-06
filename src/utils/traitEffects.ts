import type { TraitEffect, TraitEffectsMap } from '../types/TraitEffect';

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
  
  // 新增性格特质效果 - 品性 (Character)
  
  // Diligent特质 - ID:29, 勤劳
  29: [
    { skillId: 13, value: 4, description: '勤奋工作提高锻造技能' }, // Smithing +4
    { skillId: 14, value: 3, description: '细致的实验习惯提升炼金术' }, // Alchemy +3
    { skillId: 15, value: 3, description: '认真的态度提高工程能力' }, // Engineering +3
  ],
  
  // Lazy特质 - ID:30, 懒惰
  30: [
    { skillId: 13, value: -3, description: '懒惰降低锻造效率' }, // Smithing -3
    { skillId: 14, value: -2, description: '懒散的实验态度影响炼金术' }, // Alchemy -2
    { skillId: 7, value: -4, description: '不愿投入精力跟踪目标' }, // Tracking -4
  ],
  
  // Generous特质 - ID:31, 慷慨
  31: [
    { skillId: 10, value: 3, description: '慷慨的性格增强说服他人' }, // Persuasion +3
    { skillId: 5, value: 4, description: '乐于给予提升治疗效果' }, // Healing +4
  ],
  
  // Greedy特质 - ID:32, 贪婪
  32: [
    { skillId: 11, value: 3, description: '贪婪增强恐吓能力' }, // Intimidation +3
    { skillId: 12, value: 4, description: '贪欲提高欺骗技能' }, // Deception +4
    { skillId: 10, value: -2, description: '贪婪削弱真诚的说服力' }, // Persuasion -2
  ],
  
  // Honest特质 - ID:33, 诚实
  33: [
    { skillId: 10, value: 4, description: '诚实增强说服力' }, // Persuasion +4
    { skillId: 12, value: -5, description: '诚实使欺骗变得困难' }, // Deception -5
  ],
  
  // Cunning特质 - ID:34, 狡诈
  34: [
    { skillId: 12, value: 5, description: '狡诈大幅提升欺骗能力' }, // Deception +5
    { skillId: 6, value: 3, description: '欺诈性思维增强幻术能力' }, // Illusion +3
  ],
  
  // Loyal特质 - ID:35, 忠贞
  35: [
    { skillId: 10, value: 2, description: '忠诚增强说服力' }, // Persuasion +2
    { skillId: 5, value: 3, description: '对他人的忠诚增强治疗意愿' }, // Healing +3
  ],
  
  // Ambitious特质 - ID:37, 雄心
  37: [
    { skillId: 11, value: 3, description: '雄心壮志增强恐吓能力' }, // Intimidation +3
    { skillId: 15, value: 4, description: '雄心激发工程创新' }, // Engineering +4
    { skillId: 14, value: 2, description: '追求卓越提升炼金术水平' }, // Alchemy +2
  ],
  
  // Righteous特质 - ID:39, 正直
  39: [
    { skillId: 10, value: 3, description: '正直增强说服力' }, // Persuasion +3
    { skillId: 12, value: -4, description: '道德标准使欺骗变得困难' }, // Deception -4
  ],
  
  // Wicked特质 - ID:40, 邪恶
  40: [
    { skillId: 11, value: 4, description: '邪恶天性增强恐吓效果' }, // Intimidation +4
    { skillId: 12, value: 3, description: '邪恶心态提高欺骗能力' }, // Deception +3
    { skillId: 5, value: -3, description: '缺乏同情心削弱治疗效果' }, // Healing -3
  ],
  
  // Compassionate特质 - ID:43, 怜悯
  43: [
    { skillId: 5, value: 5, description: '同情心极大增强治疗能力' }, // Healing +5
    { skillId: 11, value: -3, description: '怜悯使恐吓变得困难' }, // Intimidation -3
  ],
  
  // Cruel特质 - ID:44, 残酷
  44: [
    { skillId: 11, value: 5, description: '残忍性格极大增强恐吓效果' }, // Intimidation +5
    { skillId: 5, value: -4, description: '缺乏同情心严重削弱治疗能力' }, // Healing -4
  ],
  
  // Neat特质 - ID:45, 整洁
  45: [
    { skillId: 14, value: 3, description: '精确的工作习惯提升炼金术' }, // Alchemy +3
    { skillId: 13, value: 2, description: '工作台整洁提高锻造效率' }, // Smithing +2
  ],
  
  // Sloppy特质 - ID:46, 邋遢
  46: [
    { skillId: 14, value: -3, description: '混乱的工作环境影响炼金术' }, // Alchemy -3
    { skillId: 15, value: -2, description: '不注重细节影响工程质量' }, // Engineering -2
  ],

  // 新增性格特质效果 - 气质 (Temperament)
  
  // Enthusiastic特质 - ID:47, 热情
  47: [
    { skillId: 10, value: 4, description: '热情感染力增强说服能力' }, // Persuasion +4
    { skillId: 6, value: 2, description: '情感丰富增强幻术效果' }, // Illusion +2
  ],
  
  // Gloomy特质 - ID:48, 阴郁
  48: [
    { skillId: 11, value: 2, description: '阴森气质增强恐吓效果' }, // Intimidation +2
    { skillId: 10, value: -3, description: '低落情绪削弱说服力' }, // Persuasion -3
  ],
  
  // Courageous特质 - ID:49, 勇敢
  49: [
    { skillId: 3, value: 3, description: '无畏精神增强格斗能力' }, // Hand-to-hand +3
    { skillId: 1, value: 2, description: '勇气增强剑术战斗力' }, // Swordsmanship +2
  ],
  
  // Timid特质 - ID:50, 怯懦
  50: [
    { skillId: 11, value: -4, description: '胆怯严重削弱恐吓能力' }, // Intimidation -4
    { skillId: 2, value: 2, description: '谨慎的远距离作战提高射击精度' }, // Archery +2
    { skillId: 7, value: 3, description: '隐蔽行动提高追踪技能' }, // Tracking +3
  ],
  
  // Stubborn特质 - ID:51, 固执
  51: [
    { skillId: 3, value: 2, description: '固执增强持久战斗能力' }, // Hand-to-hand +2
    { skillId: 10, value: -3, description: '固执降低说服接受度' }, // Persuasion -3
  ],
  
  // Optimistic特质 - ID:53, 乐观
  53: [
    { skillId: 10, value: 3, description: '乐观态度增强说服力' }, // Persuasion +3
    { skillId: 5, value: 2, description: '积极心态提升治疗效果' }, // Healing +2
  ],
  
  // Pessimistic特质 - ID:54, 悲观
  54: [
    { skillId: 7, value: 2, description: '警惕性提高追踪能力' }, // Tracking +2
    { skillId: 10, value: -2, description: '消极态度削弱说服力' }, // Persuasion -2
  ],
  
  // Calculated特质 - ID:57, 深谋
  57: [
    { skillId: 14, value: 4, description: '精确计算提高炼金术效果' }, // Alchemy +4
    { skillId: 15, value: 3, description: '缜密规划增强工程效率' }, // Engineering +3
    { skillId: 12, value: 3, description: '策略思维提高欺骗成功率' }, // Deception +3
  ],
  
  // Reckless特质 - ID:58, 莽撞
  58: [
    { skillId: 3, value: 3, description: '莽撞增强近身格斗攻击性' }, // Hand-to-hand +3
    { skillId: 15, value: -3, description: '鲁莽降低工程精确度' }, // Engineering -3
    { skillId: 14, value: -3, description: '缺乏耐心影响炼金术质量' }, // Alchemy -3
  ],
  
  // Decisive特质 - ID:61, 果断
  61: [
    { skillId: 3, value: 2, description: '果断出击增强格斗效果' }, // Hand-to-hand +2
    { skillId: 11, value: 3, description: '坚定意志增强恐吓能力' }, // Intimidation +3
  ],
  
  // Hesitant特质 - ID:62, 迟疑
  62: [
    { skillId: 11, value: -3, description: '犹豫不决削弱恐吓效果' }, // Intimidation -3
    { skillId: 2, value: -2, description: '射击犹豫降低命中率' }, // Archery -2
  ],

  // 新增性格特质效果 - 社交 (Social)
  
  // Extroverted特质 - ID:63, 外向
  63: [
    { skillId: 10, value: 4, description: '外向性格极大增强说服能力' }, // Persuasion +4
    { skillId: 7, value: -2, description: '喜欢交谈不适合安静的追踪' }, // Tracking -2
  ],
  
  // Introverted特质 - ID:64, 内向
  64: [
    { skillId: 10, value: -2, description: '内向性格削弱公开说服力' }, // Persuasion -2
    { skillId: 7, value: 3, description: '安静专注提高追踪能力' }, // Tracking +3
    { skillId: 14, value: 2, description: '独处思考提升炼金术水平' }, // Alchemy +2
  ],
  
  // Courteous特质 - ID:65, 礼让
  65: [
    { skillId: 10, value: 3, description: '礼貌举止增强说服力' }, // Persuasion +3
    { skillId: 11, value: -3, description: '谦逊态度削弱恐吓效果' }, // Intimidation -3
  ],
  
  // Domineering特质 - ID:66, 强横
  66: [
    { skillId: 11, value: 4, description: '强势态度极大增强恐吓效果' }, // Intimidation +4
    { skillId: 10, value: -2, description: '盛气凌人削弱和平说服力' }, // Persuasion -2
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