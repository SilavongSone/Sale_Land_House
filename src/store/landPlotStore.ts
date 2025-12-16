import { create } from "zustand";
import { Pagination } from "../utils/pagination";
import { landPlotAPI } from "../api/landPlot";
import type {
  LandPlotStore,
  LandPlot,
  LandPlotCreateInput,
  LandPlotUpdateInput,
  FetchLandPlotsParams,
  LandPlotsResponse
} from "../types/landPlot";

const handleError = (e: any, msg: string) => 
  e?.response?.data?.message || msg;

export const useLandPlotStore = create<LandPlotStore>((set, get) => ({
  // State
  landPlots: [],
  selectedLandPlot: null,
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch all land plots
  fetchLandPlots: async (params?: FetchLandPlotsParams) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = Pagination(params || {});
      const res: LandPlotsResponse = await landPlotAPI.getAll(queryParams);
      set({ landPlots: res.data, pagination: res.pagination, isLoading: false });
    } catch (e: any) {
      set({
        landPlots: [],
        pagination: null,
        error: handleError(e, "Failed to load land plots"),
        isLoading: false
      });
    }
  },

  // Fetch by ID
  fetchLandPlotById: async (id: string | number) => {
    set({ isLoading: true, error: null });
    try {
      const res: LandPlot = await landPlotAPI.getById(String(id));
      set({ selectedLandPlot: res, isLoading: false });
      console.log(' Store: Fetched land plot:', res);
    } catch (e: any) {
      set({ error: handleError(e, "Failed to load land plot"), isLoading: false });
    }
  },

  // Create with re-fetch
  createLandPlot: async (data: LandPlotCreateInput) => {
    set({ isLoading: true, error: null });
    try {
      if (!data.plotNumber || !data.zoneId) {
        throw new Error("Plot number and zone ID are required");
      }
      await landPlotAPI.create(data);
      
      // Re-fetch to get complete data with all relations
      await get().fetchLandPlots();
      
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: handleError(e, "Failed to create land plot"), isLoading: false });
      throw e;
    }
  },

  // Update with re-fetch
  updateLandPlot: async (id: string | number, data: LandPlotUpdateInput) => {
    set({ isLoading: true, error: null });
    try {
      await landPlotAPI.update(String(id), data);
      
      // Re-fetch to get complete data with all relations
      await get().fetchLandPlots();
      
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: handleError(e, "Failed to update land plot"), isLoading: false });
      throw e;
    }
  },

  // Delete with optimistic update
  deleteLandPlot: async (id: string | number) => {
    set({ isLoading: true, error: null });
    try {
      await landPlotAPI.delete(String(id));
      set((s) => ({
        landPlots: s.landPlots.filter((lp) => lp.landPlotId !== Number(id)),
        selectedLandPlot: s.selectedLandPlot?.landPlotId === Number(id) ? null : s.selectedLandPlot,
        isLoading: false,
      }));
    } catch (e: any) {
      set({ error: handleError(e, "Failed to delete land plot"), isLoading: false });
      throw e;
    }
  },

  // Get land plots by zone
  getLandPlotsByZone: (zoneId: string | number): LandPlot[] =>
    get().landPlots.filter((lp) => lp.zoneId === Number(zoneId)),

  setSelectedLandPlot: (landPlot: LandPlot | null) => set({ selectedLandPlot: landPlot }),
  clearError: () => set({ error: null }),
  reset: () => set({
    landPlots: [],
    selectedLandPlot: null,
    pagination: null,
    isLoading: false,
    error: null
  }),
}));