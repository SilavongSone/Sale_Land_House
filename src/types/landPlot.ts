
export type LandPlotStatus = "AVAILABLE" | "SOLD" | "RESERVED";

export interface LandPlot {
  landPlotId: number;
  zoneId: number;
  plotNumber: string;
  landArea: number;
  plotWidth?: number | null;
  plotLength?: number | null;
  pricePerSqm: number;
  totalPrice: number;
  landTitleNumber?: string | null;
  notes?: string | null;
  status: LandPlotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LandPlotCreateInput {
  zoneId: number | string;
  plotNumber: string;
  landArea: number | string;
  plotWidth?: number | string | null;
  plotLength?: number | string | null;
  pricePerSqm: number | string;
  totalPrice: number | string;
  landTitleNumber?: string | null;
  notes?: string | null;
  status?: LandPlotStatus;
}

export interface LandPlotUpdateInput extends Partial<LandPlotCreateInput> {}

export interface FetchLandPlotsParams {
  projectId?: number;
  zoneId?: number | string;
  status?: LandPlotStatus;
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  skip: number;
  totalPages: number;
}

export interface LandPlotsResponse {
  data: LandPlot[];
  pagination: PaginationMeta;
}

export interface LandPlotStore {
  landPlots: LandPlot[];
  selectedLandPlot: LandPlot | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  
  fetchLandPlots: (params?: FetchLandPlotsParams) => Promise<void>;
  fetchLandPlotById: (id: string | number) => Promise<void>;
  createLandPlot: (data: LandPlotCreateInput) => Promise<void>;
  updateLandPlot: (id: string | number, data: LandPlotUpdateInput) => Promise<void>;
  deleteLandPlot: (id: string | number) => Promise<void>;
  getLandPlotsByZone: (zoneId: string | number) => LandPlot[];
  
  setSelectedLandPlot: (landPlot: LandPlot | null) => void;
  clearError: () => void;
  reset: () => void;
}

