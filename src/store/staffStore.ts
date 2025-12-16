import { create } from "zustand";
import { staffAPI } from "../api/staff";
import type {
  StaffStore,
  StaffCreateInput,
  StaffUpdateInput,
} from "../types/staff";
import { Pagination } from "../utils/pagination";

export const useStaffStore = create<StaffStore>((set, get) => ({
  staffs: [],
  selectedStaff: null,
  pagination: null,
  isLoading: false,
  error: null,

  // ========================
  // Fetch all staff
  // ========================
  fetchStaffs: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = Pagination(params);

      const res = await staffAPI.getAll(queryParams);
      set({
        staffs: res.data,
        pagination: res.pagination,
        isLoading: false,
      });
    } catch (e: any) {
      set({
        staffs: [],
        pagination: null,
        error: e?.response?.data?.message || "Failed to load staffs",
        isLoading: false,
      });
    }
  },

  // ========================
  // Fetch staff by ID
  // ========================
  fetchStaffById: async (id: string | number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await staffAPI.getById(String(id));
      set({ selectedStaff: res, isLoading: false });
    } catch (e: any) {
      set({
        error: e?.response?.data?.message || "Failed to load staff",
        isLoading: false,
      });
    }
  },

  // ========================
  // Create staff with re-fetch
  // ========================
  createStaff: async (data: StaffCreateInput) => {
    set({ isLoading: true, error: null });
    try {
      if (!data.staffCode || !data.firstName || !data.position) {
        throw new Error("Missing required fields");
      }

      const res = await staffAPI.create(data);
      
      // Re-fetch to get complete data with all relations
      await get().fetchStaffs();
      
      set({ isLoading: false });

      return res;
    } catch (e: any) {
      set({
        error: e?.response?.data?.message || "Failed to create staff",
        isLoading: false,
      });
      throw e;
    }
  },

  // ========================
  // Update staff with re-fetch
  // ========================
  updateStaff: async (id: string | number, data: StaffUpdateInput) => {
    set({ isLoading: true, error: null });
    try {
      const res = await staffAPI.update(String(id), data);

      // Re-fetch to get complete data with all relations
      await get().fetchStaffs();
      
      set({ isLoading: false });

      return res;
    } catch (e: any) {
      set({
        error: e?.response?.data?.message || "Failed to update staff",
        isLoading: false,
      });
      throw e;
    }
  },

  // ========================
  // Delete staff
  // ========================
  deleteStaff: async (id: string | number) => {
    set({ isLoading: true, error: null });
    try {
      await staffAPI.delete(String(id));

      set((state) => ({
        staffs: state.staffs.filter((s) => s.staffId !== Number(id)),
        selectedStaff:
          state.selectedStaff?.staffId === Number(id)
            ? null
            : state.selectedStaff,
        isLoading: false,
      }));
    } catch (e: any) {
      set({
        error: e?.response?.data?.message || "Failed to delete staff",
        isLoading: false,
      });
      throw e;
    }
  },

  // ========================
  // Utility
  // ========================
  setSelectedStaff: (staff) => set({ selectedStaff: staff }),
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      staffs: [],
      selectedStaff: null,
      pagination: null,
      isLoading: false,
      error: null,
    }),
}));