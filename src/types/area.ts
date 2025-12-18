export interface ZoneArea {
  zoneId: number;
  zoneName: string;
  totalArea: number;
  usedArea: number;
  remainingArea: number;
  usedPercentage: number;
}

export interface ProjectArea {
  projectId: number;
  projectName: string;
  totalArea: number;
  allocatedToZones?: number;
  usedArea?: number;
  remainingArea: number;
  usedPercentage?: number;
  allocatedPercentage?: number;
}

export interface ProjectWithZones extends ProjectArea {
  village?: string;
  zones: ZoneArea[];
  zoneCount: number;
}

export interface ProjectSummary {
  project: ProjectArea;
  summary: {
    totalZones: number;
    totalHouses: number;
    totalLandPlots: number;
    totalHouseArea: number;
    totalLandPlotArea: number;
    totalUsedInZones: number;
    totalRemainingInZones: number;
  };
  zones: ZoneArea[];
}

export interface AreaStoreState {
  zoneArea?: ZoneArea;
  projectArea?: ProjectArea;
  projectWithZones?: ProjectWithZones;
  projectSummary?: ProjectSummary;
  loading: boolean;
  error?: string;

  fetchZoneArea: (zoneId: string) => Promise<void>;
  fetchProjectArea: (projectId: string) => Promise<void>;
  fetchProjectWithZones: (projectId: string) => Promise<void>;
  fetchProjectSummary: (projectId: string) => Promise<void>;
  clear: () => void;
}