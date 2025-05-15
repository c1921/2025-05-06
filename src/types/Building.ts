import type { BaseEntity, ID } from './Common';

// 建筑类别常量
export const BuildingType = {
  Residential: 'residential',
  Commercial: 'commercial',
  Industrial: 'industrial',
  Storage: 'storage',
  Special: 'special'
} as const;

export type BuildingType = typeof BuildingType[keyof typeof BuildingType];

// 建筑类别显示名称
export const BUILDING_TYPE_NAMES: Record<BuildingType, string> = {
  [BuildingType.Residential]: 'Residential',
  [BuildingType.Commercial]: 'Commercial',
  [BuildingType.Industrial]: 'Industrial',
  [BuildingType.Storage]: 'Storage',
  [BuildingType.Special]: 'Special'
};

// 建筑材料需求
export interface MaterialRequirement {
  itemId: ID;
  quantityPerSquareMeter: number;
}

// 建筑尺寸
export interface BuildingSize {
  width: number;
  length: number;
}

// 建筑模板接口
export interface BuildingTemplate extends BaseEntity {
  readonly type: BuildingType;
  readonly materialRequirements: MaterialRequirement[];
  readonly minSize: BuildingSize;
  readonly maxSize: BuildingSize;
}

// 具体建筑实例接口
export interface Building extends BaseEntity {
  readonly templateId: ID;
  readonly size: BuildingSize;
  readonly constructionProgress: number; // 0-100%
  readonly isCompleted: boolean;
}

// 建筑材料计算结果
export interface MaterialCalculation {
  itemId: ID;
  requiredQuantity: number;
}

// 创建建筑模板的工厂函数
export function createBuildingTemplate(
  id: ID,
  name: string,
  description: string,
  type: BuildingType,
  materialRequirements: MaterialRequirement[],
  minSize: BuildingSize,
  maxSize: BuildingSize
): BuildingTemplate {
  return {
    id,
    name,
    description,
    type,
    materialRequirements,
    minSize,
    maxSize
  };
}

// 创建建筑实例的工厂函数
export function createBuilding(
  id: ID,
  name: string,
  description: string,
  templateId: ID,
  size: BuildingSize,
  constructionProgress: number = 0,
  isCompleted: boolean = false
): Building {
  return {
    id,
    name,
    description,
    templateId,
    size,
    constructionProgress,
    isCompleted
  };
}

// 计算建筑面积
export function calculateBuildingArea(size: BuildingSize): number {
  return size.width * size.length;
}

// 验证建筑尺寸是否在允许范围内
export function isValidBuildingSize(size: BuildingSize, template: BuildingTemplate): boolean {
  return (
    size.width >= template.minSize.width &&
    size.width <= template.maxSize.width &&
    size.length >= template.minSize.length &&
    size.length <= template.maxSize.length
  );
}

// 计算建筑所需材料
export function calculateRequiredMaterials(
  template: BuildingTemplate,
  size: BuildingSize
): MaterialCalculation[] {
  const area = calculateBuildingArea(size);
  
  return template.materialRequirements.map(requirement => ({
    itemId: requirement.itemId,
    requiredQuantity: Math.ceil(requirement.quantityPerSquareMeter * area)
  }));
} 