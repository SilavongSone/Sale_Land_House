import type { ZoneAreaItem } from "../../types/zone";
import type { ProjectAreaItem } from "../../types/project";

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  remainingAfter?: number;
}

// ============================================================================
// (PROJECT LEVEL)
// ============================================================================

export const getProjectRemainingArea = (
  projectId: string | number,
  projectTotalArea: number,
  existingZones: ProjectAreaItem[],
  editingZoneId?: string | number | null  //null
): number => {
  const normalizedProjectId = Number(projectId);
  const normalizedEditingId = editingZoneId != null ? Number(editingZoneId) : undefined;

  const zonesUsedArea = existingZones
    .filter((zone) =>
      Number(zone.projectId) === normalizedProjectId &&
      !(normalizedEditingId !== undefined && zone.zoneId === normalizedEditingId)
    )
    .reduce((sum, zone) => sum + Number(zone.totalLandArea), 0);

  return Math.max(0, projectTotalArea - zonesUsedArea);
};

export const getProjectUsedArea = (
  projectId: string | number,
  existingZones: ProjectAreaItem[]
): number => {
  const normalizedProjectId = Number(projectId);

  return existingZones
    .filter((zone) => Number(zone.projectId) === normalizedProjectId)
    .reduce((sum, zone) => sum + Number(zone.totalLandArea), 0);
};

export const getProjectUtilization = (
  projectTotalArea: number,
  usedArea: number
): number => {
  if (projectTotalArea <= 0) return 0;
  return Math.min(100, (usedArea / projectTotalArea) * 100);
};

// ============================================================================
//  (ZONE LEVEL)
// ============================================================================

export const getZoneRemainingArea = (
  zoneId: string | number,
  zoneTotalArea: number,
  existingHouses: ZoneAreaItem[],
  existingPlots: ZoneAreaItem[],
  editingItemId?: string | number | null,
  editingItemType?: 'HOUSE' | 'LAND'
): number => {
  const normalizedZoneId = Number(zoneId);
  const normalizedEditingId = editingItemId != null ? Number(editingItemId) : undefined;

  const housesUsedArea = existingHouses
    .filter((house) =>
      Number(house.zoneId) === normalizedZoneId &&
      !(editingItemType === 'HOUSE' && normalizedEditingId !== undefined && house.houseId === normalizedEditingId)
    )
    .reduce((sum, house) => sum + Number(house.landArea), 0);

  const plotsUsedArea = existingPlots
    .filter((plot) =>
      Number(plot.zoneId) === normalizedZoneId &&
      !(editingItemType === 'LAND' && normalizedEditingId !== undefined && plot.landPlotId === normalizedEditingId)
    )
    .reduce((sum, plot) => sum + Number(plot.landArea), 0);

  return Math.max(0, zoneTotalArea - housesUsedArea - plotsUsedArea);
};

export const getZoneUsedArea = (
  zoneId: string | number,
  existingHouses: ZoneAreaItem[],
  existingPlots: ZoneAreaItem[]
): number => {
  const normalizedZoneId = Number(zoneId);

  const housesArea = existingHouses
    .filter((house) => Number(house.zoneId) === normalizedZoneId)
    .reduce((sum, house) => sum + Number(house.landArea), 0);

  const plotsArea = existingPlots
    .filter((plot) => Number(plot.zoneId) === normalizedZoneId)
    .reduce((sum, plot) => sum + Number(plot.landArea), 0);

  return housesArea + plotsArea;
};

export const getZoneUtilization = (
  zoneTotalArea: number,
  usedArea: number
): number => {
  if (zoneTotalArea <= 0) return 0;
  return Math.min(100, (usedArea / zoneTotalArea) * 100);
};

// ============================================================================
//  (VALIDATION)
// ============================================================================


export const validateZoneArea = (
  projectId: string | number,
  projectTotalArea: number,
  zoneArea: number,
  existingZones: ProjectAreaItem[],
  editingZoneId?: string | number
): ValidationResult => {
  if (zoneArea <= 0) {
    return { isValid: false, message: "ເນື້ອທີ່ໂຊນຕ້ອງຫຼາຍກ່ວາ 0" };
  }

  const remaining = getProjectRemainingArea(
    projectId,
    projectTotalArea,
    existingZones,
    editingZoneId
  );

  if (zoneArea > remaining) {
    return {
      isValid: false,
      message: `ພື້ນທີ່ບໍ່ພໍ ເຫຼືອ: ${remaining.toLocaleString('lo-LA')} ຕ.ມ., ຕ້ອງການ: ${zoneArea.toLocaleString('lo-LA')} ຕ.ມ.`,
      remainingAfter: remaining - zoneArea
    };
  }

  return {
    isValid: true,
    message: "ພື້ນທີ່ພໍ",
    remainingAfter: remaining - zoneArea
  };
};


export const validateItemArea = (
  zoneId: string | number,
  zoneTotalArea: number,
  itemArea: number,
  existingHouses: ZoneAreaItem[],
  existingPlots: ZoneAreaItem[],
  editingItemId?: string | number,
  editingItemType?: 'HOUSE' | 'LAND'
): ValidationResult => {
  if (itemArea <= 0) {
    return { isValid: false, message: "ເນື້ອທີ່ຕ້ອງຫຼາຍກ່ວາ 0" };
  }

  const remaining = getZoneRemainingArea(
    zoneId,
    zoneTotalArea,
    existingHouses,
    existingPlots,
    editingItemId,
    editingItemType
  );

  if (itemArea > remaining) {
    return {
      isValid: false,
      message: `ເນື້ອທີ່ບໍ່ພໍ ເຫຼືອ: ${remaining.toLocaleString('lo-LA')} ຕ.ມ., ຕ້ອງການ: ${itemArea.toLocaleString('lo-LA')} ຕ.ມ.`,
      remainingAfter: remaining - itemArea
    };
  }

  return {
    isValid: true,
    message: "ພື້ນທີ່ພໍ",
    remainingAfter: remaining - itemArea
  };
};

// ============================================================================
//  (UTILITIES)
// ============================================================================


export const calculateLandArea = (
  width?: number | string | null,
  length?: number | string | null
): number => {
  if (!width || !length) return 0;
  return Number(width) * Number(length);
};




export const validateAreaMatch = (
  calculatedArea: number,
  providedArea: number,
  tolerance: number = 0.1
): boolean => {
  return Math.abs(providedArea - calculatedArea) <= tolerance;
};


