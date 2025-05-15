import type { ID } from '../types/Common';
import type { 
  BuildingTemplate, 
  BuildingType, 
  BuildingSize, 
  MaterialCalculation 
} from '../types/Building';
import { 
  createBuildingTemplate, 
  calculateRequiredMaterials, 
  calculateBuildingArea 
} from '../types/Building';
import type { Item } from '../types/Item';
import { findItemById } from './itemUtils';
import buildingTemplatesData from '../data/buildingTemplates.json';

// 从JSON数据加载建筑模板
export function loadBuildingTemplates(): BuildingTemplate[] {
  return buildingTemplatesData.buildingTemplates.map(template => createBuildingTemplate(
    String(template.id),
    template.name,
    template.description,
    template.type as BuildingType,
    template.materialRequirements.map(req => ({
      ...req,
      itemId: String(req.itemId)
    })),
    template.minSize,
    template.maxSize
  ));
}

// 按类型过滤建筑模板
export function filterTemplatesByType(templates: BuildingTemplate[], type: BuildingType): BuildingTemplate[] {
  return templates.filter(template => template.type === type);
}

// 按ID查找建筑模板
export function findTemplateById(templates: BuildingTemplate[], id: ID): BuildingTemplate | undefined {
  return templates.find(template => template.id === id);
}

// 计算建筑所需材料，并关联物品信息
export function calculateMaterialsWithItems(
  template: BuildingTemplate,
  size: BuildingSize,
  items: Item[]
): Array<MaterialCalculation & { item: Item | undefined }> {
  const materials = calculateRequiredMaterials(template, size);
  
  return materials.map(material => ({
    ...material,
    item: findItemById(items, material.itemId)
  }));
}

// 检查是否有足够的材料建造
export function hasEnoughMaterials(
  materialCalculations: MaterialCalculation[],
  items: Item[]
): boolean {
  return materialCalculations.every(calc => {
    const item = findItemById(items, calc.itemId);
    return item && item.quantity >= calc.requiredQuantity;
  });
}

// 获取建筑尺寸范围的文本描述
export function getBuildingSizeRangeText(template: BuildingTemplate): string {
  return `${template.minSize.width}x${template.minSize.length} to ${template.maxSize.width}x${template.maxSize.length}`;
}

// 获取建筑面积的文本描述
export function getBuildingAreaText(size: BuildingSize): string {
  const area = calculateBuildingArea(size);
  return `${size.width}x${size.length} (${area} sq. meters)`;
}

// 生成默认建筑尺寸（使用最小尺寸）
export function getDefaultBuildingSize(template: BuildingTemplate): BuildingSize {
  return { ...template.minSize };
} 