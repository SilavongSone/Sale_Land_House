import type { ZoneAreaItem } from "../../types/zone";
import type { ProjectAreaItem } from "../../types/project";

// ============================================================================
// TYPES
// ============================================================================

export interface AreaSummary {
    total: number;
    used: number;
    remaining: number;
    utilization: number;
}

// ============================================================================
// Helper functions 
// ============================================================================

const getProjectUsedAreaInternal = (
    projectId: string | number,
    existingZones: ProjectAreaItem[]
): number => {
    const normalizedProjectId = Number(projectId);
    return existingZones
        .filter((zone) => Number(zone.projectId) === normalizedProjectId)
        .reduce((sum, zone) => sum + Number(zone.totalLandArea), 0);
};

const getProjectUtilizationInternal = (
    projectTotalArea: number,
    usedArea: number
): number => {
    if (projectTotalArea <= 0) return 0;
    return Math.min(100, (usedArea / projectTotalArea) * 100);
};

const getZoneUsedAreaInternal = (
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

const getZoneUtilizationInternal = (
    zoneTotalArea: number,
    usedArea: number
): number => {
    if (zoneTotalArea <= 0) return 0;
    return Math.min(100, (usedArea / zoneTotalArea) * 100);
};

// ============================================================================
// (SUMMARY & REPORTING)
// ============================================================================

export const getProjectAreaSummary = (
    projectId: string | number,
    projectTotalArea: number,
    existingZones: ProjectAreaItem[]
): AreaSummary => {
    const used = getProjectUsedAreaInternal(projectId, existingZones);
    const remaining = Math.max(0, projectTotalArea - used);
    const utilization = getProjectUtilizationInternal(projectTotalArea, used);

    return { total: projectTotalArea, used, remaining, utilization };
};

export const getZoneAreaSummary = (
    zoneId: string | number,
    zoneTotalArea: number,
    existingHouses: ZoneAreaItem[],
    existingPlots: ZoneAreaItem[]
): AreaSummary => {
    const used = getZoneUsedAreaInternal(zoneId, existingHouses, existingPlots);
    const remaining = Math.max(0, zoneTotalArea - used);
    const utilization = getZoneUtilizationInternal(zoneTotalArea, used);

    return { total: zoneTotalArea, used, remaining, utilization };
};


export const getZoneAreaBreakdown = (
    zoneId: string | number,
    zoneTotalArea: number,
    existingHouses: ZoneAreaItem[],
    existingPlots: ZoneAreaItem[]
) => {
    const normalizedZoneId = Number(zoneId);

    const housesArea = existingHouses
        .filter(h => Number(h.zoneId) === normalizedZoneId)
        .reduce((sum, h) => sum + Number(h.landArea), 0);

    const plotsArea = existingPlots
        .filter(p => Number(p.zoneId) === normalizedZoneId)
        .reduce((sum, p) => sum + Number(p.landArea), 0);

    const totalUsed = housesArea + plotsArea;
    const remaining = Math.max(0, zoneTotalArea - totalUsed);

    return {
        total: zoneTotalArea,
        houses: {
            area: housesArea,
            count: existingHouses.filter(h => Number(h.zoneId) === normalizedZoneId).length,
            percentage: zoneTotalArea > 0 ? (housesArea / zoneTotalArea) * 100 : 0
        },
        plots: {
            area: plotsArea,
            count: existingPlots.filter(p => Number(p.zoneId) === normalizedZoneId).length,
            percentage: zoneTotalArea > 0 ? (plotsArea / zoneTotalArea) * 100 : 0
        },
        totalUsed,
        remaining,
        utilization: zoneTotalArea > 0 ? (totalUsed / zoneTotalArea) * 100 : 0
    };
};


export const getProjectZonesOverview = (
    projectId: string | number,
    projectTotalArea: number,
    existingZones: ProjectAreaItem[],
    existingHouses: ZoneAreaItem[],
    existingPlots: ZoneAreaItem[]
) => {
    const normalizedProjectId = Number(projectId);
    const projectZones = existingZones.filter(z => Number(z.projectId) === normalizedProjectId);

    const zonesWithDetails = projectZones.map(zone => ({
    zoneId: zone.zoneId,
    zoneName: zone.zoneId ? zone.zoneName || `Frame ${zone.zoneId}` : null,
    totalArea: Number(zone.totalLandArea),
    breakdown: zone.zoneId ? getZoneAreaBreakdown(
        zone.zoneId,
        Number(zone.totalLandArea),
        existingHouses,
        existingPlots
    ) : null
}));

    const projectUsed = getProjectUsedAreaInternal(projectId, existingZones);

    return {
        projectId: normalizedProjectId,
        projectTotalArea,
        projectUsedArea: projectUsed,
        projectRemainingArea: Math.max(0, projectTotalArea - projectUsed),
        projectUtilization: getProjectUtilizationInternal(projectTotalArea, projectUsed),
        zonesCount: projectZones.length,
        zones: zonesWithDetails
    };
};