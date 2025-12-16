import { houseAPI } from "../api/house";
import { create } from "zustand";
import { Pagination } from "../utils/pagination";
import type {
  HouseStore,
  House,
  HouseCreateInput,
  HouseUpdateInput,
  FetchHousesParams,
  HouseResponse
} from "../types/house";

export const useHouseStore = create<HouseStore>((set, get) => ({
  // State
  houses: [],
  selectedHouse: null,
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch all houses
  fetchHouses: async (params?: FetchHousesParams) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = Pagination(params || {});
      const res = await houseAPI.getAll(queryParams) as House[] | HouseResponse;
      const data = Array.isArray(res) ? { data: res, pagination: null } : res;
      set({ houses: data.data, pagination: data.pagination, isLoading: false });
    } catch (e: any) {
      set({
        houses: [],
        pagination: null,
        error: handleError(e, "Failed to load houses"),
        isLoading: false
      });
    }
  },

  // Fetch by ID
  fetchHouseById: async (id: string | number): Promise<House> => {
    set({ isLoading: true, error: null });
    try {
      const res: House = await houseAPI.getById(String(id));
      set({ selectedHouse: res, isLoading: false });
      return res;
    } catch (e: any) {
      set({ error: handleError(e, "Failed to load house"), isLoading: false });
      throw e;
    }
  },

  // Create with optimistic update
  createHouse: async (data: HouseCreateInput): Promise<House> => {
    set({ isLoading: true, error: null });
    try {
      if (!data.houseNumber || !data.zoneId) {
        throw new Error("House number and zone ID are required");
      }
      const res: House = await houseAPI.create(data);
      set((s) => ({ houses: [res, ...s.houses], isLoading: false }));
      return res;
    } catch (e: any) {
      set({ error: handleError(e, "Failed to create house"), isLoading: false });
      throw e;
    }
  },

  // Update with optimistic update
  updateHouse: async (id: string | number, data: HouseUpdateInput): Promise<House> => {
    set({ isLoading: true, error: null });
    try {
      const res: House = await houseAPI.update(String(id), data);
      const idStr = String(id);
      set((s) => ({
        houses: s.houses.map((h) => String(h.id) === idStr ? res : h),
        selectedHouse: s.selectedHouse && String(s.selectedHouse.id) === idStr ? res : s.selectedHouse,
        isLoading: false,
      }));
      return res;
    } catch (e: any) {
      set({ error: handleError(e, "Failed to update house"), isLoading: false });
      throw e;
    }
  },

  // Delete with optimistic update
  deleteHouse: async (id: string | number): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await houseAPI.delete(String(id));
      const idStr = String(id);
      set((s) => ({
        houses: s.houses.filter((h) => String(h.id) !== idStr),
        selectedHouse: s.selectedHouse && String(s.selectedHouse.id) === idStr ? null : s.selectedHouse,
        isLoading: false,
      }));
      return true;
    } catch (e: any) {
      set({ error: handleError(e, "Failed to delete house"), isLoading: false });
      throw e;
    }
  },

  // Get houses by zone
  getHousesByZone: (zoneId: string | number): House[] =>
    get().houses.filter((h) => String(h.zoneId) === String(zoneId)),

  setSelectedHouse: (house: House | null) => set({ selectedHouse: house }),
  clearError: () => set({ error: null }),
  reset: () => set({
    houses: [],
    selectedHouse: null,
    pagination: null,
    isLoading: false,
    error: null
  }),
}));

function handleError(_e: any, _arg1: string): string | null | undefined {
  throw new Error("Function not implemented.");
}
