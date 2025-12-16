import { create } from "zustand";
import { provinceAPI } from "../api/province";
import type { ProvinceAttributes } from "../types/province";

interface ProvinceStore {
  provinces: ProvinceAttributes[];
  loading: boolean;
  error: string | null;

  fetchProvinces: () => Promise<void>;
  addProvince: (province: Partial<ProvinceAttributes>) => Promise<void>;
  updateProvince: (id: number, province: Partial<ProvinceAttributes>) => Promise<void>;
  deleteProvince: (id: number) => Promise<void>;
}

const useProvinceStore = create<ProvinceStore>((set) => ({
  provinces: [],
  loading: false,
  error: null,

  // Fetch all provinces
  fetchProvinces: async () => {
    set({ loading: true, error: null });
    try {
      const provinces = await provinceAPI.getAll();
      set({ provinces, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch provinces", loading: false });
    }
  },

  // Add new province
  addProvince: async (province) => {
    set({ loading: true, error: null });
    try {
      const newProvince = await provinceAPI.create(province);
      set((state) => ({
        provinces: [...state.provinces, newProvince],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to add province", loading: false });
    }
  },

  // Update existing province
  updateProvince: async (id, province) => {
    set({ loading: true, error: null });
    try {
      const updated = await provinceAPI.update(id, province);
      set((state) => ({
        provinces: state.provinces.map((p) =>
          p.provinceId === id ? updated : p
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to update province", loading: false });
    }
  },

  // Delete province
  deleteProvince: async (id) => {
    set({ loading: true, error: null });
    try {
      await provinceAPI.delete(id);
      set((state) => ({
        provinces: state.provinces.filter((p) => p.provinceId !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to delete province", loading: false });
    }
  },
}));

export default useProvinceStore;
