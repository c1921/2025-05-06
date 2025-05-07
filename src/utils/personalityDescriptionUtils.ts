import type { PersonalityTraits } from '../types/Role';
import personalityDescriptorsData from '../data/personalityDescriptors.json';
import personalityTraitNamesData from '../data/personalityTraitNames.json';

// 类型声明
type PersonalityTier = '-100_-76' | '-75_-1' | '1_75' | '76_100';
type Descriptor = { adjective: string; noun: string };
type PersonalityDescriptors = {
  [trait in keyof PersonalityTraits]: {
    [tier in PersonalityTier]: Descriptor;
  };
};

// 导入个性特质形容词与名词映射表
const personalityDescriptors = personalityDescriptorsData as PersonalityDescriptors;

// 导入个性特质的中文显示名称
const personalityTraitNames = personalityTraitNamesData as { [key in keyof PersonalityTraits]: string };

/**
 * 获取特质所属的档位
 * @param value 特质值
 * @returns 档位键名
 */
function getTierKey(value: number): PersonalityTier {
  if (value <= -76) return '-100_-76';
  if (value <= -1) return '-75_-1';
  if (value <= 75) return '1_75';
  return '76_100';
}

/**
 * 获取角色个性的形容词+名词描述
 * @param personality 角色的个性属性
 * @returns 形容词+名词组合的描述
 */
export function getPersonalityDescription(personality: PersonalityTraits): string {
  // 提取最极端的1-2个特质（绝对值最大的），排除活力特质
  const sortedTraits = Object.entries(personality)
    .filter(([trait]) => trait !== 'energy') // 排除活力特质
    .sort(([, valueA], [, valueB]) => Math.abs(valueB) - Math.abs(valueA))
    .slice(0, 2);
  
  // 如果最显著特质不够极端（绝对值<50），只用第一个
  if (Math.abs(sortedTraits[0][1]) < 50) {
    sortedTraits.splice(1);
  }
  
  // 如果只有一个突出特质，就用这个特质的形容词和名词
  if (sortedTraits.length === 1) {
    const [trait, value] = sortedTraits[0];
    const tierKey = getTierKey(value);
    const traitKey = trait as keyof PersonalityTraits;
    const descriptor = personalityDescriptors[traitKey][tierKey];
    return `${descriptor.adjective}${descriptor.noun}`;
  }
  
  // 如果有两个突出特质，交叉组合它们的形容词和名词
  const [trait1, value1] = sortedTraits[0];
  const [trait2, value2] = sortedTraits[1];
  
  const tierKey1 = getTierKey(value1);
  const tierKey2 = getTierKey(value2);
  
  const traitKey1 = trait1 as keyof PersonalityTraits;
  const traitKey2 = trait2 as keyof PersonalityTraits;
  
  const descriptor1 = personalityDescriptors[traitKey1][tierKey1];
  const descriptor2 = personalityDescriptors[traitKey2][tierKey2];
  
  // 创建两种可能的组合: 形容词1+名词2 或 形容词2+名词1
  // 根据值的极端程度决定使用哪种形容词和哪种名词
  if (Math.abs(value1) > Math.abs(value2)) {
    // 使用第一个特质的形容词和第二个特质的名词
    return `${descriptor1.adjective}${descriptor2.noun}`;
  } else {
    // 使用第二个特质的形容词和第一个特质的名词
    return `${descriptor2.adjective}${descriptor1.noun}`;
  }
}

/**
 * 获取角色所有个性值的悬浮提示
 * @param personality 角色的个性属性
 * @returns 包含所有个性值的悬浮提示文本
 */
export function getPersonalityTooltip(personality: PersonalityTraits): string {
  const traits = Object.entries(personality)
    .map(([trait, value]) => {
      const traitName = personalityTraitNames[trait as keyof PersonalityTraits];
      // 格式化值，确保显示正负号
      const formattedValue = value > 0 ? `+${value}` : `${value}`;
      return `${traitName}: ${formattedValue}`;
    })
    .join('\n');
  
  return traits;
}

/**
 * 获取角色性格的整体描述
 * @param personality 角色个性属性
 * @returns 性格描述
 */
export function getOverallPersonalityDescription(personality: PersonalityTraits): string {
  return getPersonalityDescription(personality);
} 