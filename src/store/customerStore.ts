import { create } from "zustand";
import { customerAPI } from "../api/customer";
import type { CustomerAttributes, CustomerCreateInput, CustomerQueryParams } from "../types/customer";
import { Pagination, type PaginationParams } from "../utils/pagination";

export interface CustomerStore {
  customers: CustomerAttributes[];
  selectedCustomer: CustomerAttributes | null;
  pagination: { page: number; limit: number; total: number } | null;
  isLoading: boolean;
  error: string | null;

  fetchCustomers: (params?: CustomerQueryParams) => Promise<void>;
  createCustomer: (data: CustomerCreateInput) => Promise<void>;
  updateCustomer: (id: number, data: Partial<CustomerCreateInput>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;

  setSelectedCustomer: (customer: CustomerAttributes | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchCustomers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams: PaginationParams = Pagination(params);
      const res = await customerAPI.getAll(queryParams);

      set({
        customers: res.data,
        pagination: res.pagination,
        isLoading: false,
      });
    } catch (e: any) {
      set({
        customers: [],
        pagination: null,
        error: e?.response?.data?.message || "Failed to load customers",
        isLoading: false,
      });
    }
  },

  createCustomer: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await customerAPI.create(data);
      
      // Re-fetch to get complete data with all relations
      await get().fetchCustomers();
      
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Failed to create customer", isLoading: false });
      throw e;
    }
  },

  updateCustomer: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await customerAPI.update(String(id), data);
      
      // Re-fetch to get complete data with all relations
      await get().fetchCustomers();
      
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Failed to update customer", isLoading: false });
      throw e;
    }
  },

  deleteCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await customerAPI.delete(String(id));
      set((state) => ({
        customers: state.customers.filter((c) => c.customerId !== id),
        selectedCustomer: state.selectedCustomer?.customerId === id ? null : state.selectedCustomer,
        isLoading: false,
      }));
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Failed to delete customer", isLoading: false });
      throw e;
    }
  },

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  clearError: () => set({ error: null }),
  reset: () => set({ customers: [], selectedCustomer: null, pagination: null, isLoading: false, error: null }),
}));