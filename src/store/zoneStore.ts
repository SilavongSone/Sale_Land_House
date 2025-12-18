import { create } from "zustand";
import { Pagination } from "../utils/pagination";
import { zoneAPI } from "../api/zone";
import type { 
  ZoneStore, 
  Zone, 
  ZoneCreateInput, 
  ZoneUpdateInput, 
  ZonesResponse 
} from "../types/zone";

const handleError = (e: any, msg: string) => 
  e?.response?.data?.message || msg;

export const useZoneStore = create<ZoneStore>((set, get) => ({
  // State
  zones: [],
  selectedZone: null,
  pagination: null,
  isLoading: false,
  error: null,
  lastFetchParams: {}, // Keep for interface compatibility

  // Fetch all zones
  fetchZones: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = Pagination(params || {});
      const res: ZonesResponse = await zoneAPI.getAll(queryParams);
      set({ zones: res.data, pagination: res.pagination, isLoading: false });
    } catch (e: any) {
      set({ 
        zones: [], 
        pagination: null, 
        error: handleError(e, "Failed to load zones"), 
        isLoading: false 
      });
    }
  },

  // Fetch options
  // fetchZoneOptions: async () => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const res = await zoneAPI.getOption();
  //     set({ zones: res.data, isLoading: false });
  //   } catch (e: any) {
  //     set({ error: handleError(e, "Failed to load zones"), isLoading: false });
  //   }
  // },

  // Fetch by ID
  fetchZoneById: async (id: string | number) => {
    set({ isLoading: true, error: null });
    try {
      const res: Zone = await zoneAPI.getById(String(id));
      set({ selectedZone: res, isLoading: false });
    } catch (e: any) {
      set({ error: handleError(e, "Failed to load zone"), isLoading: false });
    }
  },

  // Create with re-fetch
  createZone: async (data: ZoneCreateInput) => {
    set({ isLoading: true, error: null });
    try {
      if (!data.zoneName || !data.projectId) {
        throw new Error("Zone name and project ID are required");
      }
      await zoneAPI.create(data);
      
      // Re-fetch to get complete data with all relations
      await get().fetchZones();
      
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: handleError(e, "Failed to create zone"), isLoading: false });
      throw e;
    }
  },

  // Update with re-fetch
  updateZone: async (id: string | number, data: ZoneUpdateInput) => {
    set({ isLoading: true, error: null });
    try {
      await zoneAPI.update(String(id), data);
      
      // Re-fetch to get complete data with all relations
      await get().fetchZones();
      
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: handleError(e, "Failed to update zone"), isLoading: false });
      throw e;
    }
  },

  // Delete with optimistic update
  deleteZone: async (id: string | number) => {
    set({ isLoading: true, error: null });
    try {
      await zoneAPI.delete(String(id));
      const numId = typeof id === 'string' ? parseInt(id) : id;
      set((s) => ({
        zones: s.zones.filter((z) => {
          const zoneIdNum = typeof z.zoneId === 'string' ? parseInt(z.zoneId) : z.zoneId;
          return zoneIdNum !== numId;
        }),
        selectedZone: (() => {
          if (!s.selectedZone) return null;
          const selectedIdNum = typeof s.selectedZone.zoneId === 'string' 
            ? parseInt(s.selectedZone.zoneId) 
            : s.selectedZone.zoneId;
          return selectedIdNum === numId ? null : s.selectedZone;
        })(),
        isLoading: false,
      }));
    } catch (e: any) {
      set({ error: handleError(e, "Failed to delete zone"), isLoading: false });
      throw e;
    }
  },

  // Calculate remaining area
  getRemainingArea: (projectId: number, projectTotalArea: number): number => {
    const zonesOfProject = get().zones.filter((z) => z.projectId === Number(projectId));
    const usedArea = zonesOfProject.reduce((sum, z) => sum + Number(z.totalLandArea), 0);
    return projectTotalArea - usedArea;
  },

  setSelectedZone: (zone: Zone | null) => set({ selectedZone: zone }),
  clearError: () => set({ error: null }),
  reset: () => set({ 
    zones: [], 
    selectedZone: null, 
    pagination: null, 
    isLoading: false, 
    error: null,
    lastFetchParams: {}
  }),
}));