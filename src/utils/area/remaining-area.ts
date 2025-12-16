// import type { ZoneAreaItem } from "../../types/zone";
// import type { ProjectAreaItem } from "../../types/project";



// // PROJECT LEVEL
// export const getProjectRemainingArea = (
//     projectId: string | number,
//     projectTotalArea: number,
//     existingZones: ProjectAreaItem[],
//     editingZoneId?: string | number
// ): number => {
//     const normalizedProjectId = Number(projectId);
//     const normalizedEditingId = editingZoneId ? Number(editingZoneId) : undefined;

//     const zonesUsedArea = existingZones
//         .filter((zone) =>
//             Number(zone.projectId) === normalizedProjectId &&
//             !(normalizedEditingId && zone.zoneId === normalizedEditingId)
//         )
//         .reduce((sum, zone) => sum + Number(zone.totalLandArea), 0);

//     return Math.max(0, projectTotalArea - zonesUsedArea);
// };

// export const getProjectUsedArea = (
//     projectId: string | number,
//     existingZones: ProjectAreaItem[]
// ): number => {
//     const normalizedProjectId = Number(projectId);

//     return existingZones
//         .filter((zone) => Number(zone.projectId) === normalizedProjectId)
//         .reduce((sum, zone) => sum + Number(zone.totalLandArea), 0);
// };

// export const getProjectUtilization = (
//     projectTotalArea: number,
//     usedArea: number
// ): number => {
//     if (projectTotalArea <= 0) return 0;
//     return Math.min(100, (usedArea / projectTotalArea) * 100);
// };

// // ZONE LEVEL
// export const getZoneRemainingArea = (
//     zoneId: string | number,
//     zoneTotalArea: number,
//     existingHouses: ZoneAreaItem[],
//     existingPlots: ZoneAreaItem[],
//     editingItemId?: string | number,
//     editingItemType?: 'house' | 'plot'
// ): number => {
//     const normalizedZoneId = Number(zoneId);
//     const normalizedEditingId = editingItemId ? Number(editingItemId) : undefined;

//     const housesUsedArea = existingHouses
//         .filter((house) =>
//             Number(house.zoneId) === normalizedZoneId &&
//             !(editingItemType === 'house' && normalizedEditingId && house.houseId === normalizedEditingId)
//         )
//         .reduce((sum, house) => sum + Number(house.landArea), 0);

//     const plotsUsedArea = existingPlots
//         .filter((plot) =>
//             Number(plot.zoneId) === normalizedZoneId &&
//             !(editingItemType === 'plot' && normalizedEditingId && plot.landPlotId === normalizedEditingId)
//         )
//         .reduce((sum, plot) => sum + Number(plot.landArea), 0);

//     return Math.max(0, zoneTotalArea - housesUsedArea - plotsUsedArea);
// };

// export const getZoneUsedArea = (
//     zoneId: string | number,
//     existingHouses: ZoneAreaItem[],
//     existingPlots: ZoneAreaItem[]
// ): number => {
//     const normalizedZoneId = Number(zoneId);

//     const housesArea = existingHouses
//         .filter((house) => Number(house.zoneId) === normalizedZoneId)
//         .reduce((sum, house) => sum + Number(house.landArea), 0);

//     const plotsArea = existingPlots
//         .filter((plot) => Number(plot.zoneId) === normalizedZoneId)
//         .reduce((sum, plot) => sum + Number(plot.landArea), 0);

//     return housesArea + plotsArea;
// };

// export const getZoneUtilization = (
//     zoneTotalArea: number,
//     usedArea: number
// ): number => {
//     if (zoneTotalArea <= 0) return 0;
//     return Math.min(100, (usedArea / zoneTotalArea) * 100);
// };