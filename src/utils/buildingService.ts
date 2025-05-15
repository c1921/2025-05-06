import { ref } from 'vue';
import type { ID } from '../types/Common';
import type { Building, BuildingSize, MaterialCalculation } from '../types/Building';
import { createBuilding, calculateRequiredMaterials } from '../types/Building';
import { findTemplateById, loadBuildingTemplates } from './buildingUtils';
import { removeItemQuantity } from './inventoryService';

// 建筑实例列表
const buildings = ref<Building[]>([]);
// 下一个可用的建筑ID
let nextBuildingId = 1;

// 获取所有建筑
export function getAllBuildings(): Building[] {
  return buildings.value;
}

// 按ID查找建筑
export function findBuildingById(id: ID): Building | undefined {
  return buildings.value.find(building => building.id === id);
}

// 创建新建筑
export function createNewBuilding(
  templateId: ID,
  name: string,
  size: BuildingSize,
  consumeMaterials: boolean = true
): Building | null {
  // 加载建筑模板
  const templates = loadBuildingTemplates();
  const template = findTemplateById(templates, templateId);
  
  if (!template) {
    console.error(`Building template with ID ${templateId} not found`);
    return null;
  }
  
  // 创建建筑实例
  const building = createBuilding(
    String(nextBuildingId++),
    name || template.name,
    template.description,
    templateId,
    size,
    0,  // 初始进度为0
    false // 初始状态为未完成
  );
  
  // 如果需要消耗材料，则从库存中减少相应数量
  if (consumeMaterials) {
    const requiredMaterials = calculateRequiredMaterials(template, size);
    consumeBuildingMaterials(requiredMaterials);
  }
  
  // 添加到建筑列表
  buildings.value.push(building);
  
  return building;
}

// 更新建筑进度
export function updateBuildingProgress(id: ID, progress: number): void {
  const building = findBuildingById(id);
  if (building) {
    const updatedBuilding = {
      ...building,
      constructionProgress: Math.min(100, Math.max(0, progress)),
      isCompleted: progress >= 100
    };
    
    const index = buildings.value.findIndex(b => b.id === id);
    if (index !== -1) {
      buildings.value[index] = updatedBuilding;
    }
  }
}

// 完成建筑
export function completeBuilding(id: ID): void {
  updateBuildingProgress(id, 100);
}

// 删除建筑
export function removeBuilding(id: ID): void {
  const index = buildings.value.findIndex(building => building.id === id);
  if (index !== -1) {
    buildings.value.splice(index, 1);
  }
}

// 消耗建筑材料
function consumeBuildingMaterials(materials: MaterialCalculation[]): void {
  materials.forEach(material => {
    removeItemQuantity(material.itemId, material.requiredQuantity);
  });
}

// 导出建筑服务
export function useBuildingService() {
  return {
    buildings,
    getAllBuildings,
    findBuildingById,
    createNewBuilding,
    updateBuildingProgress,
    completeBuilding,
    removeBuilding
  };
} 