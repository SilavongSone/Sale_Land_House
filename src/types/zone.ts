// Enums
export type ZoneStatus = "ACTIVE" | "INACTIVE";

// Zone Entity
export interface Zone {
  zoneCode: string | number;
  zoneId: number | string;
  zoneName: string;
  zoneType: string;
  totalLandArea: number;
  pricePerSqm: number;
  persen: number;
  width: number;
  length: number;
  description?: string;
  status: ZoneStatus;
  buildYear?: number;
  projectId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  project?: {
    projectId: number;
    projectName: string;
  };
}

export interface ZoneAreaItem {
    houseId?: number | string;
    landPlotId?: number | string;
    zoneId: number | string;
    landArea: number | string;
}

// API Params
export interface FetchZonesParams {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: string;
  status?: string;
  orderBy?: string;
  order?: "ASC" | "DESC";
}

export interface ZoneCreateInput {
  zoneName: string;
  zoneType: string;
  totalLandArea: number;
  persen: number;
  buildYear?: number;
  
  description?: string;
  status: ZoneStatus;
  projectId: number;
  pricePerSqm?: number;
}

export interface ZoneUpdateInput {
  zoneName?: string;
  zoneType?: string;
  totalLandArea?: number;
  width?: number;
  length?: number;
  description?: string;
  status?: ZoneStatus;
  buildYear?: number;
  projectId?: number;
  pricePerSqm?: number;
}

// API Responses
export interface PaginationInfo {
  total: number;
  page: number;
  skip: number;
  limit: number;
  totalPages: number;
}

export interface ZonesResponse {
  data: Zone[];
  pagination: PaginationInfo;
}

// Store Interface
export interface ZoneStore {
  zones: Zone[];
  selectedZone: Zone | null;
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  lastFetchParams: Record<string, any>; // ✅ Add this

  fetchZones: (params?: Record<string, any>) => Promise<void>;
  // fetchZoneOptions: () => Promise<void>;
  fetchZoneById: (id: string | number) => Promise<void>;
  createZone: (data: ZoneCreateInput) => Promise<void>;
  updateZone: (id: string | number, data: ZoneUpdateInput) => Promise<void>;
  deleteZone: (id: string | number) => Promise<void>;
  getRemainingArea: (projectId: number, projectTotalArea: number) => number;
  setSelectedZone: (zone: Zone | null) => void;
  clearError: () => void;
  reset: () => void;
}

