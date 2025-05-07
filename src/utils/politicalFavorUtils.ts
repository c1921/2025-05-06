import type { Role } from '../types/Role';

/**
 * 计算两个政治立场维度之间的相似度得分
 * 返回0-100的分数，0表示完全相反，100表示完全一致
 * @param value1 政治立场维度值1
 * @param value2 政治立场维度值2
 * @returns 相似度得分
 */
export function calculateDimensionSimilarity(value1: number, value2: number): number {
  // 计算差异绝对值
  const difference = Math.abs(value1 - value2);
  // 将差异转换为相似度得分 (0-100)
  return 100 - difference;
}

/**
 * 计算政治维度的极端程度 (0-50)
 * 0表示中立(50)，50表示极端(0或100)
 * @param value 政治立场维度值
 * @returns 极端程度
 */
export function calculateDimensionExtremism(value: number): number {
  return Math.abs(value - 50);
}

/**
 * 计算政治立场对好感度的影响
 * @param sourceRole 源角色
 * @param targetRole 目标角色
 * @returns 好感度变化及解释数组
 */
export function calculatePoliticalFavorEffects(
  sourceRole: Role, 
  targetRole: Role
): { value: number; description: string; type: 'political' }[] {
  const effects: { value: number; description: string; type: 'political' }[] = [];
  
  // 计算每个维度的相似度和极端程度
  const dimensions: {
    name: 'economic' | 'diplomatic' | 'civil' | 'societal';
    similarity: number;
    sourceExtremism: number;
  }[] = [
    {
      name: 'economic',
      similarity: calculateDimensionSimilarity(
        sourceRole.politicalStance.economic, 
        targetRole.politicalStance.economic
      ),
      sourceExtremism: calculateDimensionExtremism(sourceRole.politicalStance.economic)
    },
    {
      name: 'diplomatic',
      similarity: calculateDimensionSimilarity(
        sourceRole.politicalStance.diplomatic, 
        targetRole.politicalStance.diplomatic
      ),
      sourceExtremism: calculateDimensionExtremism(sourceRole.politicalStance.diplomatic)
    },
    {
      name: 'civil',
      similarity: calculateDimensionSimilarity(
        sourceRole.politicalStance.civil, 
        targetRole.politicalStance.civil
      ),
      sourceExtremism: calculateDimensionExtremism(sourceRole.politicalStance.civil)
    },
    {
      name: 'societal',
      similarity: calculateDimensionSimilarity(
        sourceRole.politicalStance.societal, 
        targetRole.politicalStance.societal
      ),
      sourceExtremism: calculateDimensionExtremism(sourceRole.politicalStance.societal)
    }
  ];
  
  // 为每个维度添加效果
  for (const dimension of dimensions) {
    addDimensionEffect(effects, dimension.similarity, dimension.sourceExtremism, dimension.name);
  }
  
  return effects;
}

/**
 * 添加特定维度的政治相似度影响
 * @param effects 效果数组
 * @param similarity 相似度值
 * @param sourceExtremism 源角色在该维度上的极端程度
 * @param dimension 维度名称
 */
function addDimensionEffect(
  effects: { value: number; description: string; type: 'political' }[],
  similarity: number,
  sourceExtremism: number,
  dimension: 'economic' | 'diplomatic' | 'civil' | 'societal'
): void {
  let dimensionName = '';
  
  // 设置维度名称
  switch (dimension) {
    case 'economic':
      dimensionName = '经济';
      break;
    case 'diplomatic':
      dimensionName = '外交';
      break;
    case 'civil':
      dimensionName = '公民自由';
      break;
    case 'societal':
      dimensionName = '社会';
      break;
  }
  
  // 计算基础效果值
  // 相似度每超出或低于50%的10个百分点，好感度±2
  let baseEffect = Math.floor((similarity - 50) / 10) * 2;
  
  // 如果没有效果，直接返回
  if (baseEffect === 0) return;
  
  // 计算极端程度系数 (1.0-2.0)
  // 极端程度为0时，系数为1.0；极端程度为50时，系数为2.0
  const extremismMultiplier = 1 + (sourceExtremism / 50);
  
  // 应用极端程度系数，向上/向下取整
  let finalEffect = baseEffect > 0 
    ? Math.ceil(baseEffect * extremismMultiplier) 
    : Math.floor(baseEffect * extremismMultiplier);
  
  // 极端程度说明
  let extremismDesc = '';
  if (sourceExtremism >= 40) {
    extremismDesc = '（强烈看法）';
  } else if (sourceExtremism >= 25) {
    extremismDesc = '（坚定立场）';
  } else if (sourceExtremism >= 10) {
    extremismDesc = '（明确倾向）';
  }
  
  // 添加效果
  effects.push({
    value: finalEffect,
    description: finalEffect > 0
      ? `${dimensionName}观点相似 ${extremismDesc}(${Math.round(similarity)}%)`
      : `${dimensionName}观点不同 ${extremismDesc}(仅${Math.round(similarity)}%相似)`,
    type: 'political' as const
  });
}

/**
 * 将政治倾向影响应用到角色关系中
 * @param roles 所有角色
 * @returns 更新后的角色数组
 */
export function applyPoliticalFavorEffectsToRoles(roles: Role[]): Role[] {
  const updatedRoles = [...roles];
  
  // 计算所有角色之间的政治好感度影响
  for (const targetRole of updatedRoles) {
    for (const sourceRole of updatedRoles) {
      if (targetRole.id === sourceRole.id) continue; // 跳过自己
      
      // 查找现有关系
      let relation = targetRole.favorRelations.find(r => r.targetId === sourceRole.id);
      
      // 如果不存在关系，创建一个新的
      if (!relation) {
        relation = { targetId: sourceRole.id, value: 0 };
        targetRole.favorRelations.push(relation);
      }
      
      // 计算政治立场影响
      const effects = calculatePoliticalFavorEffects(sourceRole, targetRole);
      
      // 应用政治立场影响
      const favorChange = effects.reduce((sum, effect) => sum + effect.value, 0);
      relation.value += favorChange;
    }
  }
  
  return updatedRoles;
} 