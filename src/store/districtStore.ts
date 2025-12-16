import { create } from "zustand";
import { districtAPI } from "../api/district";
import type { DistrictAttributes, DistrictCreateInput } from "../types/district";

interface DistrictStore {
  districts: DistrictAttributes[];
  loading: boolean;
  error: string | null;

  fetchDistricts: () => Promise<void>;
  fetchByProvince: (provinceId: string) => Promise<void>;
  addDistrict: (data: DistrictCreateInput) => Promise<void>;
  updateDistrict: (id: string, data: Partial<DistrictCreateInput>) => Promise<void>;
  deleteDistrict: (id: string) => Promise<void>;
}

const useDistrictStore = create<DistrictStore>((set) => ({
  districts: [],
  loading: false,
  error: null,

  fetchDistricts: async () => {
    set({ loading: true });
    try {
      const res = await districtAPI.getAll();
      // ກວດວ່າ return array ຫຼື object
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      set({ districts: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  fetchByProvince: async (provinceId: string) => {
    set({ loading: true });
    try {
      const res = await districtAPI.getByProvince(provinceId);
      // ກວດວ່າ API return array ຫຼື object
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      set({ districts: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch districts", loading: false });
    }
  },


  addDistrict: async (data) => {
    set({ loading: true });
    try {
      const newDistrict = await districtAPI.create(data);
      set((state) => ({
        districts: [...state.districts, newDistrict],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateDistrict: async (id, data) => {
    set({ loading: true });
    try {
      const updated = await districtAPI.update(id, data);
      set((state) => ({
        districts: state.districts.map((d) => (d.id === id ? updated : d)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  deleteDistrict: async (id) => {
    set({ loading: true });
    try {
      await districtAPI.delete(id);
      set((state) => ({
        districts: state.districts.filter((d) => d.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));

export default useDistrictStore;
