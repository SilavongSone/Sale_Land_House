import { create } from "zustand";
import { currencyAPI } from "../api/currency";
import type { CurrencyAttributes, CurrencyCreateInput } from "../types/currency";

interface CurrencyStore {
  currencies: CurrencyAttributes[];
  loading: boolean;
  error: string | null;

  fetchCurrencies: () => Promise<void>;
  addCurrency: (currency: CurrencyCreateInput) => Promise<void>;
  updateCurrency: (id: string | number, currency: Partial<CurrencyCreateInput>) => Promise<void>;
  deleteCurrency: (id: string | number) => Promise<void>;
}

const useCurrencyStore = create<CurrencyStore>((set) => ({
  currencies: [],
  loading: false,
  error: null,

  fetchCurrencies: async () => {
    set({ loading: true, error: null });
    try {
      const currencies = await currencyAPI.getAll();
      set({ currencies, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch currencies", loading: false });
      throw err; 
    }
  },

  addCurrency: async (currency) => {
    set({ loading: true, error: null });
    try {
      const newCurrency = await currencyAPI.create(currency);
      set((state) => ({ 
        currencies: [...state.currencies, newCurrency], 
        loading: false 
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to add currency", loading: false });
      throw err;
    }
  },

  updateCurrency: async (id, currency) => {
    set({ loading: true, error: null });
    try {
      const updated = await currencyAPI.update(id.toString(), currency);
      set((state) => ({
        currencies: state.currencies.map((c) => 
          c.currencyId.toString() === id.toString() ? updated : c
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to update currency", loading: false });
      throw err;
    }
  },

  deleteCurrency: async (id) => {
    set({ loading: true, error: null });
    try {
      await currencyAPI.delete(id.toString());
      set((state) => ({
        currencies: state.currencies.filter((c) => 
          c.currencyId.toString() !== id.toString()
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to delete currency", loading: false });
      throw err;
    }
  },
}));

export default useCurrencyStore;