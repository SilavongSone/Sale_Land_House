// src/stores/saleStore.ts
import { create } from "zustand";
import { saleAPI } from "../api/sale";
import type { Sale, SaleFormData, SaleFilters } from "../types/sale";

const cleanSaleData = <T extends Record<string, any>>(data: T): Partial<Sale> => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null && v !== undefined)
  ) as Partial<Sale>;
};

interface SaleState {
  sales: Sale[];
  currentSale: Sale | null;
  loading: boolean;
  error: string | null;
  filters: SaleFilters;

  // Actions
  fetchSales: () => Promise<void>;
  fetchSaleById: (id: string) => Promise<void>;
  createSale: (saleData: Partial<SaleFormData>) => Promise<Sale>;
  updateSale: (id: string, saleData: Partial<SaleFormData>) => Promise<Sale>;
  deleteSale: (id: string) => Promise<void>;
  setCurrentSale: (sale: Sale | null) => void;
  setFilters: (filters: Partial<SaleFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;

  // Utility
  calculateTotals: (
    price: number,
    discountAmount: number,
    downPayment: number,
    installmentMonths: number,
    interestRate: number
  ) => {
    totalPrice: number;
    monthlyPayment: number;
  };
}

export const useSaleStore = create<SaleState>((set, get) => ({
  sales: [],
  currentSale: null,
  loading: false,
  error: null,
  filters: {},

  fetchSales: async () => {
    set({ loading: true, error: null });
    try {
      const response = await saleAPI.getAll();
      // ✅ Extract sales array from response
      const sales = response.sales || response.data || response;
      set({ sales, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch sales",
        loading: false
      });
      throw error;
    }
  },

  fetchSaleById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await saleAPI.getById(id);
      // ✅ Extract sale from response
      const sale = response.sale || response.data || response;
      set({ currentSale: sale, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch sale",
        loading: false
      });
      throw error;
    }
  },

  createSale: async (saleData: Partial<SaleFormData>) => {
    set({ loading: true, error: null });
    try {
      const response = await saleAPI.create(cleanSaleData(saleData));
      
      // ✅ Extract sale from response
      const newSale = response.sale || response.data || response;

      if (!newSale || !newSale.id) {
        throw new Error('Invalid response from server - no sale data');
      }

      // Re-fetch to get complete data with all relations
      await get().fetchSales();
      
      set({ loading: false });

      // ✅ Return the sale object (not the full response)
      return newSale;

    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create sale",
        loading: false
      });
      throw error;
    }
  },

  updateSale: async (id: string, saleData: Partial<SaleFormData>) => {
    set({ loading: true, error: null });
    try {
      const response = await saleAPI.update(id, cleanSaleData(saleData));
      
      // ✅ Extract sale from response
      const updatedSale = response.sale || response.data || response;

      // Re-fetch to get complete data with all relations
      await get().fetchSales();
      
      set({ loading: false });
      
      return updatedSale;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update sale",
        loading: false
      });
      throw error;
    }
  },

  deleteSale: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await saleAPI.delete(id);
      set((state) => ({
        sales: state.sales.filter((sale) => sale.id.toString() !== id),
        currentSale: state.currentSale?.id.toString() === id ? null : state.currentSale,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete sale",
        loading: false
      });
      throw error;
    }
  },

  setCurrentSale: (sale: Sale | null) => {
    set({ currentSale: sale });
  },

  setFilters: (filters: Partial<SaleFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearError: () => {
    set({ error: null });
  },

  calculateTotals: (price, discountAmount, downPayment, installmentMonths, interestRate) => {
    const totalPrice = price - discountAmount;
    const loanAmount = totalPrice - downPayment;

    let monthlyPayment = 0;
    if (installmentMonths > 0 && loanAmount > 0) {
      if (interestRate > 0) {
        const monthlyRate = interestRate / 100 / 12;
        const totalInterest = loanAmount * monthlyRate * installmentMonths;
        monthlyPayment = (loanAmount + totalInterest) / installmentMonths;
      } else {
        monthlyPayment = loanAmount / installmentMonths;
      }
    }

    return {
      totalPrice,
      monthlyPayment: Math.round(monthlyPayment)
    };
  }
}));